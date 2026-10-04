#!/usr/bin/env python3
"""
Évaluation de la classification d'intention — Agent IA Darimmo
==============================================================

Ce script envoie chaque message de `dataset_classification.csv` au workflow n8n
"Darimmo - Test Classification" (qui exécute EXACTEMENT le même prompt de
classification que l'orchestrateur, mais sans appeler les sous-agents : aucun
effet de bord sur la base de données), puis calcule :

  - accuracy globale
  - précision, rappel, F1 par classe + macro-moyenne + moyenne pondérée
  - matrice de confusion
  - accuracy par langue (fr / darija / arabe / anglais)
  - exactitude de l'extraction d'entités (ville, type de bien, budget)
  - temps de réponse (moyenne, médiane, p95, min, max)
  - taux d'erreur (requêtes échouées)

Les métriques sont calculées à la main (aucune dépendance à scikit-learn) afin
que les formules puissent être expliquées dans le rapport.

Les résultats sont ceux de l'exécution réelle : rien n'est simulé.

Utilisation (depuis le dossier tests_ia, venv activé) :
    python run_classification_eval.py            # lance / reprend l'évaluation
    python run_classification_eval.py --limit 5  # test rapide sur 5 messages
    python run_classification_eval.py --reset    # repart de zéro

Variables d'environnement optionnelles :
    CLASSIFY_URL     URL du webhook de PRODUCTION (par défaut :
                     http://localhost:5678/webhook/darimmo-test-classify)
    DELAY_SECONDS    pause entre deux requêtes (défaut 5) — protège le quota gratuit
    TIMEOUT_SECONDS  timeout par requête (défaut 60)
    MAX_RETRIES      nouvelles tentatives en cas d'échec (défaut 2)
"""

import argparse
import csv
import json
import os
import statistics
import sys
import time
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

import requests

# Évite les UnicodeEncodeError sur la console Windows (messages en arabe)
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset_classification.csv"
RESULTS_DIR = BASE_DIR / "results"
RAW_PATH = RESULTS_DIR / "classification_raw.jsonl"

WEBHOOK_URL = os.getenv("CLASSIFY_URL", "http://localhost:5678/webhook/darimmo-test-classify")
DELAY_SECONDS = float(os.getenv("DELAY_SECONDS", "5"))
TIMEOUT_SECONDS = float(os.getenv("TIMEOUT_SECONDS", "60"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))

INTENTS = [
    "search_property", "create_listing", "update_listing", "delete_listing",
    "my_listings", "payment_status", "contact_owner", "account_help",
    "general_help", "unknown",
]
LANG_LABELS = {"fr": "Français", "dar": "Darija", "ar": "Arabe", "en": "Anglais"}


# --------------------------------------------------------------------------
# Chargement des données
# --------------------------------------------------------------------------
def load_dataset():
    with open(DATASET_PATH, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def load_raw_records():
    """Relit les résultats déjà obtenus (permet de reprendre après un arrêt)."""
    records = {}
    if RAW_PATH.exists():
        with open(RAW_PATH, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    rec = json.loads(line)
                    records[rec["id"]] = rec
    return records


def append_raw(record):
    RESULTS_DIR.mkdir(exist_ok=True)
    with open(RAW_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


# --------------------------------------------------------------------------
# Appel du workflow n8n
# --------------------------------------------------------------------------
def call_classifier(row):
    payload = {
        "message": row["message"],
        "session_id": f"eval-{row['id']}",
        "user_context": {"is_authenticated": row["is_authenticated"] == "true"},
    }
    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        start = time.perf_counter()
        try:
            resp = requests.post(WEBHOOK_URL, json=payload, timeout=TIMEOUT_SECONDS)
            elapsed_ms = (time.perf_counter() - start) * 1000
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list):
                    data = data[0] if data else {}
                return {"ok": True, "data": data, "latency_ms": elapsed_ms, "attempts": attempt + 1}
            last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
        except Exception as exc:  # timeout, connexion, JSON invalide...
            elapsed_ms = (time.perf_counter() - start) * 1000
            last_error = f"{type(exc).__name__}: {exc}"
        if attempt < MAX_RETRIES:
            time.sleep(10 * (attempt + 1))  # attente progressive avant nouvel essai
    return {"ok": False, "error": last_error, "latency_ms": elapsed_ms, "attempts": MAX_RETRIES + 1}


def build_record(row, result):
    rec = {
        "id": int(row["id"]),
        "message": row["message"],
        "language": row["language"],
        "expected_intent": row["expected_intent"],
        "expected_city": row["expected_city"],
        "expected_property_type": row["expected_property_type"],
        "expected_budget_max": row["expected_budget_max"],
        "latency_ms": round(result["latency_ms"], 1),
        "attempts": result["attempts"],
    }
    if result["ok"]:
        d = result["data"]
        predicted = d.get("intent")
        rec.update({
            "status": "ok" if predicted in INTENTS else "invalid_output",
            "predicted_intent": predicted,
            "confidence": d.get("confidence"),
            "effective_intent": d.get("effective_intent"),
            "needs_clarification": d.get("needs_clarification"),
            "entities": d.get("entities") or {},
            "error": None if predicted in INTENTS else f"Intent invalide : {predicted!r}",
        })
    else:
        rec.update({
            "status": "error", "predicted_intent": None, "confidence": None,
            "effective_intent": None, "needs_clarification": None,
            "entities": {}, "error": result["error"],
        })
    return rec


# --------------------------------------------------------------------------
# Calcul des métriques
# --------------------------------------------------------------------------
def prf(tp, fp, fn):
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return precision, recall, f1


def strip_accents(text):
    return "".join(c for c in unicodedata.normalize("NFD", str(text)) if unicodedata.category(c) != "Mn")


CITY_ALIASES = {"marrakesh": "marrakech", "tanger": "tangier", "casa": "casablanca", "fes": "fez"}


def norm_city(value):
    v = strip_accents(value).strip().lower()
    return CITY_ALIASES.get(v, v)


def entity_accuracy(records):
    """Exactitude de l'extraction d'entités, sur les messages de recherche
    pour lesquels une valeur attendue est renseignée dans le dataset."""
    stats = {"city": [0, 0], "property_type": [0, 0], "budget_max": [0, 0]}  # [corrects, total]
    for r in records:
        if r["expected_intent"] != "search_property" or r["status"] == "error":
            continue
        ent = r.get("entities") or {}
        if r["expected_city"]:
            stats["city"][1] += 1
            if ent.get("city") and norm_city(ent["city"]) == norm_city(r["expected_city"]):
                stats["city"][0] += 1
        if r["expected_property_type"]:
            stats["property_type"][1] += 1
            if ent.get("property_type") and strip_accents(ent["property_type"]).lower().strip() == r["expected_property_type"]:
                stats["property_type"][0] += 1
        if r["expected_budget_max"]:
            stats["budget_max"][1] += 1
            try:
                if ent.get("budget_max") is not None and abs(float(ent["budget_max"]) - float(r["expected_budget_max"])) < 1:
                    stats["budget_max"][0] += 1
            except (TypeError, ValueError):
                pass
    return {k: {"correct": c, "total": t, "accuracy": (c / t if t else None)} for k, (c, t) in stats.items()}


def compute_metrics(records):
    total = len(records)
    errors = [r for r in records if r["status"] != "ok"]
    valid = [r for r in records if r["status"] == "ok"]

    correct = sum(1 for r in valid if r["predicted_intent"] == r["expected_intent"])

    # Matrice de confusion (lignes = attendu, colonnes = prédit)
    confusion = {e: {p: 0 for p in INTENTS} for e in INTENTS}
    for r in valid:
        confusion[r["expected_intent"]][r["predicted_intent"]] += 1

    per_class = {}
    for c in INTENTS:
        tp = confusion[c][c]
        fp = sum(confusion[e][c] for e in INTENTS if e != c)
        fn = sum(confusion[c][p] for p in INTENTS if p != c)
        p_, r_, f_ = prf(tp, fp, fn)
        per_class[c] = {"precision": p_, "recall": r_, "f1": f_, "support": tp + fn, "tp": tp, "fp": fp, "fn": fn}

    supports = [per_class[c]["support"] for c in INTENTS]
    sum_support = sum(supports) or 1
    macro = {m: sum(per_class[c][m] for c in INTENTS) / len(INTENTS) for m in ("precision", "recall", "f1")}
    weighted = {m: sum(per_class[c][m] * per_class[c]["support"] for c in INTENTS) / sum_support
                for m in ("precision", "recall", "f1")}

    # Accuracy par langue
    by_lang = defaultdict(lambda: [0, 0])
    for r in valid:
        by_lang[r["language"]][1] += 1
        if r["predicted_intent"] == r["expected_intent"]:
            by_lang[r["language"]][0] += 1
    accuracy_by_language = {
        lang: {"correct": c, "total": t, "accuracy": (c / t if t else None)} for lang, (c, t) in by_lang.items()
    }

    # Temps de réponse (toutes les requêtes ayant abouti)
    lat = sorted(r["latency_ms"] for r in valid)
    latency = {}
    if lat:
        p95_index = min(len(lat) - 1, int(round(0.95 * (len(lat) - 1))))
        latency = {
            "mean_ms": statistics.mean(lat), "median_ms": statistics.median(lat),
            "p95_ms": lat[p95_index], "min_ms": lat[0], "max_ms": lat[-1],
        }

    clarif = sum(1 for r in valid if r.get("needs_clarification"))

    return {
        "run_info": {
            "date": datetime.now().isoformat(timespec="seconds"),
            "webhook_url": WEBHOOK_URL,
            "n_messages": total,
        },
        "n_valid": len(valid),
        "n_errors": len(errors),
        "error_rate": len(errors) / total if total else None,
        "accuracy_on_valid": correct / len(valid) if valid else None,
        "accuracy_all_requests": correct / total if total else None,  # une erreur compte comme un échec
        "macro_avg": macro,
        "weighted_avg": weighted,
        "per_class": per_class,
        "confusion_matrix": confusion,
        "accuracy_by_language": accuracy_by_language,
        "entity_extraction": entity_accuracy(records),
        "latency": latency,
        "clarification_requested": {"count": clarif, "rate": clarif / len(valid) if valid else None},
        "avg_llm_calls_per_message": 1,  # 1 appel Gemini de classification par message (par construction du workflow)
    }


# --------------------------------------------------------------------------
# Sauvegarde et graphiques
# --------------------------------------------------------------------------
def save_outputs(records, metrics):
    RESULTS_DIR.mkdir(exist_ok=True)

    with open(RESULTS_DIR / "classification_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    with open(RESULTS_DIR / "classification_results.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(["id", "message", "language", "expected_intent", "predicted_intent", "result",
                    "confidence", "latency_ms", "status", "error"])
        for r in sorted(records, key=lambda x: x["id"]):
            res = "Correct" if r["predicted_intent"] == r["expected_intent"] else ("Erreur technique" if r["status"] != "ok" else "Incorrect")
            w.writerow([r["id"], r["message"], r["language"], r["expected_intent"], r["predicted_intent"],
                        res, r["confidence"], r["latency_ms"], r["status"], r["error"] or ""])

    with open(RESULTS_DIR / "classification_per_class.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Intention", "Précision", "Rappel", "F1-score", "Support"])
        for c in INTENTS:
            m = metrics["per_class"][c]
            w.writerow([c, f"{m['precision']:.3f}", f"{m['recall']:.3f}", f"{m['f1']:.3f}", m["support"]])
        w.writerow(["macro avg", f"{metrics['macro_avg']['precision']:.3f}", f"{metrics['macro_avg']['recall']:.3f}",
                    f"{metrics['macro_avg']['f1']:.3f}", metrics["n_valid"]])
        w.writerow(["weighted avg", f"{metrics['weighted_avg']['precision']:.3f}", f"{metrics['weighted_avg']['recall']:.3f}",
                    f"{metrics['weighted_avg']['f1']:.3f}", metrics["n_valid"]])

    with open(RESULTS_DIR / "classification_confusion_matrix.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["attendu \\ prédit"] + INTENTS)
        for e in INTENTS:
            w.writerow([e] + [metrics["confusion_matrix"][e][p] for p in INTENTS])


def make_charts(records, metrics):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("\n[info] matplotlib n'est pas installé : graphiques ignorés (pip install matplotlib).")
        return

    # 1) Matrice de confusion
    n = len(INTENTS)
    matrix = [[metrics["confusion_matrix"][e][p] for p in INTENTS] for e in INTENTS]
    fig, ax = plt.subplots(figsize=(9, 7.5))
    im = ax.imshow(matrix, cmap="Blues")
    ax.set_xticks(range(n)); ax.set_yticks(range(n))
    ax.set_xticklabels(INTENTS, rotation=45, ha="right"); ax.set_yticklabels(INTENTS)
    ax.set_xlabel("Intention prédite"); ax.set_ylabel("Intention attendue")
    ax.set_title("Matrice de confusion — classification d'intention")
    vmax = max(max(row) for row in matrix) or 1
    for i in range(n):
        for j in range(n):
            if matrix[i][j]:
                ax.text(j, i, matrix[i][j], ha="center", va="center",
                        color="white" if matrix[i][j] > vmax / 2 else "black", fontsize=10)
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    fig.tight_layout(); fig.savefig(RESULTS_DIR / "fig_confusion_matrix.png", dpi=200); plt.close(fig)

    # 2) F1-score par intention
    f1s = [metrics["per_class"][c]["f1"] for c in INTENTS]
    fig, ax = plt.subplots(figsize=(9, 5.5))
    bars = ax.barh(INTENTS[::-1], f1s[::-1], color="#2a7f62")
    ax.set_xlim(0, 1.05); ax.set_xlabel("F1-score")
    ax.set_title("F1-score par intention")
    for b, v in zip(bars, f1s[::-1]):
        ax.text(v + 0.01, b.get_y() + b.get_height() / 2, f"{v:.2f}", va="center", fontsize=9)
    fig.tight_layout(); fig.savefig(RESULTS_DIR / "fig_f1_par_intention.png", dpi=200); plt.close(fig)

    # 3) Accuracy par langue
    langs = [l for l in ("fr", "dar", "ar", "en") if l in metrics["accuracy_by_language"]]
    if langs:
        accs = [metrics["accuracy_by_language"][l]["accuracy"] for l in langs]
        fig, ax = plt.subplots(figsize=(6.5, 4.5))
        bars = ax.bar([LANG_LABELS[l] for l in langs], accs, color="#3b6ea5")
        ax.set_ylim(0, 1.1); ax.set_ylabel("Accuracy"); ax.set_title("Accuracy de classification par langue")
        for b, l, v in zip(bars, langs, accs):
            t = metrics["accuracy_by_language"][l]["total"]
            ax.text(b.get_x() + b.get_width() / 2, v + 0.02, f"{v:.2f}\n(n={t})", ha="center", fontsize=9)
        fig.tight_layout(); fig.savefig(RESULTS_DIR / "fig_accuracy_par_langue.png", dpi=200); plt.close(fig)

    # 4) Distribution du temps de réponse
    lats = [r["latency_ms"] / 1000 for r in records if r["status"] == "ok"]
    if lats:
        fig, ax = plt.subplots(figsize=(7, 4.5))
        ax.hist(lats, bins=15, color="#c9783d", edgecolor="white")
        ax.axvline(statistics.median(lats), color="black", linestyle="--", label=f"médiane = {statistics.median(lats):.2f} s")
        ax.set_xlabel("Temps de réponse (s)"); ax.set_ylabel("Nombre de requêtes")
        ax.set_title("Distribution du temps de réponse (classification)"); ax.legend()
        fig.tight_layout(); fig.savefig(RESULTS_DIR / "fig_temps_reponse.png", dpi=200); plt.close(fig)


def print_summary(metrics):
    m = metrics
    print("\n" + "=" * 70)
    print("RÉSULTATS — CLASSIFICATION D'INTENTION")
    print("=" * 70)
    print(f"Messages testés        : {m['run_info']['n_messages']}")
    print(f"Réponses valides       : {m['n_valid']}   |   Erreurs : {m['n_errors']}  (taux d'erreur = {m['error_rate']:.1%})")
    if m["accuracy_on_valid"] is not None:
        print(f"Accuracy (valides)     : {m['accuracy_on_valid']:.1%}")
        print(f"Accuracy (toutes req.) : {m['accuracy_all_requests']:.1%}   (une erreur technique compte comme un échec)")
        print(f"Macro   P / R / F1     : {m['macro_avg']['precision']:.3f} / {m['macro_avg']['recall']:.3f} / {m['macro_avg']['f1']:.3f}")
        print(f"Pondéré P / R / F1     : {m['weighted_avg']['precision']:.3f} / {m['weighted_avg']['recall']:.3f} / {m['weighted_avg']['f1']:.3f}")
    print("\n{:<18}{:>10}{:>10}{:>10}{:>9}".format("Intention", "Précision", "Rappel", "F1", "Support"))
    for c in INTENTS:
        pc = m["per_class"][c]
        print("{:<18}{:>10.3f}{:>10.3f}{:>10.3f}{:>9}".format(c, pc["precision"], pc["recall"], pc["f1"], pc["support"]))
    print("\nAccuracy par langue :")
    for lang, v in m["accuracy_by_language"].items():
        print(f"  {LANG_LABELS.get(lang, lang):<10} {v['accuracy']:.1%}  ({v['correct']}/{v['total']})")
    print("\nExtraction d'entités (messages de recherche) :")
    for k, v in m["entity_extraction"].items():
        if v["total"]:
            print(f"  {k:<14} {v['accuracy']:.1%}  ({v['correct']}/{v['total']})")
    if m["latency"]:
        l = m["latency"]
        print(f"\nTemps de réponse : moyenne {l['mean_ms']/1000:.2f} s | médiane {l['median_ms']/1000:.2f} s | "
              f"p95 {l['p95_ms']/1000:.2f} s | min {l['min_ms']/1000:.2f} s | max {l['max_ms']/1000:.2f} s")
    print(f"Clarifications demandées (confiance < 0.6) : {m['clarification_requested']['count']}")
    print(f"\nFichiers générés dans : {RESULTS_DIR}")


# --------------------------------------------------------------------------
# Programme principal
# --------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Évaluation de la classification d'intention Darimmo")
    parser.add_argument("--reset", action="store_true", help="efface les résultats précédents et repart de zéro")
    parser.add_argument("--limit", type=int, default=None, help="ne traite que N messages (test rapide)")
    args = parser.parse_args()

    if args.reset and RAW_PATH.exists():
        RAW_PATH.unlink()
        print("Résultats précédents effacés.")

    dataset = load_dataset()
    if args.limit:
        dataset = dataset[: args.limit]
    done = load_raw_records()
    to_process = [r for r in dataset if int(r["id"]) not in done or done[int(r["id"])]["status"] != "ok"]

    print(f"Webhook : {WEBHOOK_URL}")
    print(f"{len(dataset)} messages dans le dataset | {len(dataset) - len(to_process)} déjà traités | {len(to_process)} à traiter")
    print(f"Pause entre requêtes : {DELAY_SECONDS}s\n")

    for i, row in enumerate(to_process, 1):
        result = call_classifier(row)
        rec = build_record(row, result)
        done[rec["id"]] = rec
        # on réécrit la ligne (la dernière occurrence d'un id fait foi à la relecture)
        append_raw(rec)
        mark = "OK " if rec["status"] == "ok" and rec["predicted_intent"] == rec["expected_intent"] else "XX "
        print(f"[{i:>3}/{len(to_process)}] {mark} #{rec['id']:<3} attendu={rec['expected_intent']:<16} "
              f"prédit={str(rec['predicted_intent']):<16} {rec['latency_ms']/1000:.2f}s"
              + (f"  ERREUR: {rec['error']}" if rec["status"] != "ok" else ""))
        if i < len(to_process):
            time.sleep(DELAY_SECONDS)

    records = [done[int(r["id"])] for r in dataset if int(r["id"]) in done]
    if not records:
        print("Aucun résultat à analyser.")
        return
    metrics = compute_metrics(records)
    save_outputs(records, metrics)
    make_charts(records, metrics)
    print_summary(metrics)


if __name__ == "__main__":
    main()
