#!/usr/bin/env python3
"""
Évaluation end-to-end de l'agent IA orchestrateur — Darimmo
===========================================================

Chaque message de `dataset_e2e.csv` est envoyé au webhook de PRODUCTION de
l'orchestrateur n8n (classification -> routage -> sous-agent -> réponse).

Principes de la méthode
-----------------------
* Aucune action destructive ni modification de données : tous les cas sont en
  lecture seule, ou ce sont des demandes protégées faites SANS connexion
  (elles doivent être refusées).
* La "vérité terrain" des recherches, de "mes annonces" et des paiements n'est
  pas écrite à la main : elle est obtenue en interrogeant directement l'API
  Django (mêmes filtres, même base) juste avant chaque test. On vérifie donc
  que l'agent ne renvoie que des annonces qui existent réellement.
* Un instantané des données (annonces publiques, mes annonces, nombre de
  transactions) est pris avant et après l'exécution pour prouver qu'aucune
  donnée n'a été modifiée.

Métriques produites
-------------------
taux de réponses correctes (global et par catégorie), taux d'erreur, taux de
réussite des appels d'outils, absence d'annonces inventées, taux de refus
correct sans authentification, comportement avec un faux jeton, intégrité des
données, temps de réponse (moyenne, médiane, p95), nombre d'appels LLM estimé.

Utilisation (depuis tests_ia, venv de Django) :
    $env:DARIMMO_EMAIL="..."; $env:DARIMMO_PASSWORD="..."     # PowerShell
    python run_e2e_eval.py --only security_refusal --skip-auth   # test rapide, sans identifiants
    python run_e2e_eval.py --only search                          # une catégorie
    python run_e2e_eval.py                                        # tout (32 messages)
    python run_e2e_eval.py --reset                                # repart de zéro
    python run_e2e_eval.py --only market --results-dir resultats_e2e_marche_run1   # Agent Marché seul, dossier séparé

Agent Marché (catégorie "market")
---------------------------------
Les questions de prix au m² passent par l'Agent Marché (reformulation ->
recherche web -> synthèse). Vérifications automatiques : bon agent, pas
d'erreur technique, présence ou absence d'un chiffre selon le cas, source
citée quand un chiffre est donné, sources issues des domaines autorisés,
aucun nom de site ni URL dans la réponse. La fidélité des chiffres aux
extraits n'est PAS vérifiée automatiquement : les extraits lus par le modèle
(`sources_extraits`) et la réponse brute (`raw_reply`) sont enregistrés pour
une annotation manuelle. La langue est mesurée mais ne compte pas dans le taux.

Variables d'environnement :
    ORCHESTRATOR_URL  webhook de production (défaut http://localhost:5678/webhook/darimmo-ai-chat)
    DJANGO_URL        API Django (défaut http://127.0.0.1:8000)
    DARIMMO_EMAIL / DARIMMO_PASSWORD   compte de test (jamais écrits dans un fichier)
    DELAY_SECONDS     pause entre deux messages (défaut 12) — protège le quota gratuit Gemini
"""

import argparse
import csv
import json
import os
import re
import statistics
import sys
import time
import unicodedata
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qsl

import requests

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset_e2e.csv"
RESULTS_DIR = BASE_DIR / "results"
RAW_PATH = RESULTS_DIR / "e2e_raw.jsonl"
SNAPSHOT_PATH = RESULTS_DIR / "e2e_snapshots.json"

ORCHESTRATOR_URL = os.getenv("ORCHESTRATOR_URL", "http://localhost:5678/webhook/darimmo-ai-chat")
DJANGO_URL = os.getenv("DJANGO_URL", "http://127.0.0.1:8000").rstrip("/")
EMAIL = os.getenv("DARIMMO_EMAIL")
PASSWORD = os.getenv("DARIMMO_PASSWORD")
DELAY_SECONDS = float(os.getenv("DELAY_SECONDS", "12"))
TIMEOUT_SECONDS = float(os.getenv("TIMEOUT_SECONDS", "90"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "1"))

CATEGORY_LABELS = {
    "search": "Recherche de biens",
    "my_listings": "Mes annonces",
    "payment": "Paiements",
    "security_refusal": "Refus sans connexion",
    "security_forged": "Faux jeton",
    "faq": "FAQ (RAG)",
    "out_of_scope": "Hors périmètre",
    "market": "Agent Marché",
}
TOOL_CATEGORIES = ("search", "my_listings", "payment")  # catégories où un appel d'outil est attendu

# ----- Agent Marché -----
MARKET_AGENT = "market_advice_agent"
MARKET_ALLOWED_DOMAINS = ("mubawab.ma", "yakeey.com", "agenz.ma", "sarouty.ma", "avito.ma")
MARKET_SITE_NAMES = re.compile(r"\b(yakeey|agenz|mubawab|sarouty|avito)\b|https?://|www\.", re.IGNORECASE)
# un "chiffre de prix" = un nombre suivi d'une unité de prix ou de surface (DH, MAD, dirham, درهم, m², m2)
MARKET_FIGURE = re.compile(
    r"[0-9\u0660-\u0669][0-9\u0660-\u0669\s.,\u00a0\u202f]*\s*(?:millions?\s+(?:de\s+)?|مليون\s+)?(?:dhs?\b|mad\b|dirhams?\b|درهم|دراهم|/\s*m|m²|m2\b)",
    re.IGNORECASE)
# valeurs attendues de metadata.langue selon la langue du jeu de test
MARKET_LANG_CODES = {"fr": ("fr",), "dar": ("darija_latin",), "en": ("en",), "ar": ("ar", "darija_arabe")}
# vérifications mesurées mais qui ne comptent pas dans le taux de réussite
INFORMATIVE_CHECKS = ("langue_detectee_correcte", "ecriture_reponse_attendue")


# --------------------------------------------------------------------------
# Utilitaires
# --------------------------------------------------------------------------
def strip_accents(text):
    return "".join(c for c in unicodedata.normalize("NFD", str(text)) if unicodedata.category(c) != "Mn")


def norm(text):
    return strip_accents(text).lower()


def market_figures(text):
    """Chiffres de prix trouvés dans une réponse (texte exact, espaces normalisés)."""
    return [re.sub(r"\s+", " ", m.group(0)).strip() for m in MARKET_FIGURE.finditer(text or "")]


def arabic_ratio(text):
    letters = [c for c in (text or "") if c.isalpha()]
    return (sum("\u0600" <= c <= "\u06ff" for c in letters) / len(letters)) if letters else 0.0


def percentile95(sorted_values):
    if not sorted_values:
        return None
    return sorted_values[min(len(sorted_values) - 1, int(round(0.95 * (len(sorted_values) - 1))))]


def load_dataset():
    with open(DATASET_PATH, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def load_raw():
    records = {}
    if RAW_PATH.exists():
        with open(RAW_PATH, encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    rec = json.loads(line)
                    records[rec["id"]] = rec
    return records


def append_raw(rec):
    RESULTS_DIR.mkdir(exist_ok=True)
    with open(RAW_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


# --------------------------------------------------------------------------
# API Django (vérité terrain + authentification)
# --------------------------------------------------------------------------
class DjangoClient:
    def __init__(self):
        self.token = None
        self.token_time = 0

    def login(self):
        last = None
        for field in ("email", "username"):
            try:
                r = requests.post(f"{DJANGO_URL}/api/users/login/", json={field: EMAIL, "password": PASSWORD}, timeout=20)
            except Exception as exc:
                raise RuntimeError(f"Django ne répond pas sur {DJANGO_URL} : {exc}")
            if r.status_code == 200:
                data = r.json()
                token = data.get("access") or data.get("access_token") or data.get("token")
                if token:
                    self.token, self.token_time = token, time.time()
                    return token
            last = f"HTTP {r.status_code} : {r.text[:150]}"
        raise RuntimeError(f"Connexion impossible avec DARIMMO_EMAIL/DARIMMO_PASSWORD ({last})")

    def get_token(self):
        # le jeton d'accès expire vite : on se reconnecte toutes les 30 minutes
        if self.token is None or time.time() - self.token_time > 1800:
            self.login()
        return self.token

    def get(self, path, params=None, auth=False):
        headers = {"Authorization": f"Bearer {self.get_token()}"} if auth else {}
        r = requests.get(f"{DJANGO_URL}{path}", params=params, headers=headers, timeout=20)
        r.raise_for_status()
        return r.json()

    @staticmethod
    def items(data):
        return data.get("results", []) if isinstance(data, dict) else data

    def public_ids(self, query=""):
        return [a["id"] for a in self.items(self.get("/api/annonces/", dict(parse_qsl(query))))]

    def my_ids(self):
        return [a["id"] for a in self.items(self.get("/api/annonces/mes_annonces/", auth=True))]

    def transactions(self):
        data = self.get("/api/payments/transactions/", auth=True)
        return self.items(data), (data.get("count") if isinstance(data, dict) else len(data))

    def snapshot(self, with_auth):
        snap = {"public_ids": sorted(self.public_ids())}
        if with_auth:
            snap["my_ids"] = sorted(self.my_ids())
            snap["transactions_count"] = self.transactions()[1]
        return snap


def ground_truth(case, dj):
    t = case["gt_type"]
    if t == "search":
        return {"ids": dj.public_ids(case["gt_query"])}
    if t == "my_listings":
        return {"ids": dj.my_ids()}
    if t == "transactions":
        items, count = dj.transactions()
        return {"items": [{"id": i.get("id"), "provider_reference": i.get("provider_reference")} for i in items[:5]], "count": count}
    return {}


# --------------------------------------------------------------------------
# Appel de l'orchestrateur
# --------------------------------------------------------------------------
def call_orchestrator(case, dj):
    auth = case["auth"]
    payload = {"message": case["message"], "session_id": f"e2e-{case['id']}",
               "user_context": {"is_authenticated": auth in ("true", "forged")}}
    if auth == "true":
        payload["auth_token"] = dj.get_token()
    elif auth == "forged":
        payload["auth_token"] = "eyJ.faux.jeton"
    retries = 0 if auth == "forged" else MAX_RETRIES  # un faux jeton doit échouer : inutile de réessayer
    last = None
    for attempt in range(retries + 1):
        start = time.perf_counter()
        try:
            resp = requests.post(ORCHESTRATOR_URL, json=payload, timeout=TIMEOUT_SECONDS)
            elapsed = (time.perf_counter() - start) * 1000
            try:
                data = resp.json()
            except ValueError:
                data = None
            if isinstance(data, list):
                data = data[0] if data else None
            if resp.status_code == 200 or attempt == retries:
                return {"http_status": resp.status_code, "data": data, "latency_ms": elapsed,
                        "attempts": attempt + 1, "error": None if resp.status_code == 200 else resp.text[:200]}
            last = f"HTTP {resp.status_code}"
        except Exception as exc:
            elapsed = (time.perf_counter() - start) * 1000
            last = f"{type(exc).__name__}: {exc}"
            if attempt == retries:
                return {"http_status": None, "data": None, "latency_ms": elapsed, "attempts": attempt + 1, "error": last}
        time.sleep(15)
    return {"http_status": None, "data": None, "latency_ms": 0, "attempts": retries + 1, "error": last}


# --------------------------------------------------------------------------
# Évaluation d'un cas
# --------------------------------------------------------------------------
def evaluate(case, http_status, data, gt):
    beh = case["expected_behavior"]
    data = data or {}
    meta = data.get("metadata") or {}
    reply = data.get("reply") or ""
    ids = data.get("recommended_annonce_ids") or []
    agent = meta.get("agent_used")
    tools = meta.get("tool_calls_count") or 0
    llm_reported = meta.get("llm_calls_count") or 0

    if beh == "forged_no_leak":
        # http_status None = l'orchestrateur n'a pas répondu du tout : ce n'est pas un refus maîtrisé
        checks = {"aucune_donnee_renvoyee": http_status is not None and (http_status != 200 or not ids)}
        return all(checks.values()), checks

    checks = {"reponse_valide": http_status == 200 and bool(reply)}
    if not checks["reponse_valide"]:
        return False, checks

    exp_agent = case["expected_agent"]
    if beh == "search_results":
        gt_ids = gt["ids"]
        checks["bon_agent"] = agent == exp_agent
        checks["outil_appele"] = tools >= 1
        checks["aucune_annonce_inventee"] = set(ids) <= set(gt_ids)
        checks["coherence_resultat_vide"] = (len(ids) == 0) == (len(gt_ids) == 0)
        checks["resultats_exacts"] = set(ids) == set(gt_ids[:5])
    elif beh == "my_listings_match":
        checks["bon_agent"] = agent == exp_agent
        checks["outil_appele"] = tools >= 1
        checks["resultats_exacts"] = set(ids) == set(gt["ids"])
    elif beh == "payment_list":
        checks["bon_agent"] = agent == exp_agent
        checks["outil_appele"] = tools >= 1
        mentioned = False
        for t in gt["items"]:
            ref = str(t.get("provider_reference") or "")
            if (ref and ref.lower() in reply.lower()) or re.search(rf"\b{t.get('id')}\b", reply):
                mentioned = True
                break
        checks["reponse_cite_une_transaction_reelle"] = mentioned
    elif beh == "refusal":
        checks["bon_agent"] = agent == exp_agent
        checks["aucun_outil_appele"] = tools == 0
        checks["aucun_appel_llm_agent"] = llm_reported == 0
        checks["aucune_donnee_renvoyee"] = not ids
    elif beh in ("faq", "faq_no_answer"):
        checks["bon_agent"] = agent == "faq_rag"
        kws = [k.strip() for k in case["expected_keywords"].split("|") if k.strip()]
        checks["mot_cle_attendu"] = any(norm(k) in norm(reply) for k in kws)
    elif beh == "out_of_scope":
        checks["aucun_agent"] = agent is None
        checks["aucun_outil_appele"] = tools == 0
        checks["aucune_donnee_renvoyee"] = not ids
    elif beh == "market_not_routed":
        # contrôle de non-régression : une recherche de bien ne doit pas partir vers l'Agent Marché
        checks["bon_agent"] = agent == exp_agent
    elif beh in ("market_figure", "market_figure_or_none", "market_no_figure"):
        is_market = agent == MARKET_AGENT
        has_figure = bool(market_figures(reply))
        cited = meta.get("cited_sources") or []
        if beh != "market_no_figure":
            checks["bon_agent"] = is_market
        if is_market:
            checks["aucune_erreur_technique"] = not meta.get("tavily_error") and not meta.get("gemini_error")
        checks["aucun_nom_de_site_ni_url"] = not MARKET_SITE_NAMES.search(reply)
        if beh == "market_figure":
            checks["chiffre_present"] = has_figure
        if beh == "market_no_figure":
            checks["aucun_chiffre"] = not has_figure
        elif has_figure and is_market:
            checks["source_citee"] = len(cited) >= 1
            checks["sources_citees_autorisees"] = all(
                any((c.get("domain") or "").endswith(d) for d in MARKET_ALLOWED_DOMAINS) for c in cited)
        # mesuré, hors taux de réussite (voir INFORMATIVE_CHECKS)
        if is_market:
            checks["langue_detectee_correcte"] = meta.get("langue") in MARKET_LANG_CODES.get(case["language"], ())
        checks["ecriture_reponse_attendue"] = (arabic_ratio(reply) > 0.5) == (case["language"] == "ar")
    return all(v for k, v in checks.items() if k not in INFORMATIVE_CHECKS), checks


def build_record(case, call, gt):
    data = call["data"]
    meta = (data or {}).get("metadata") or {}
    ok = call["http_status"] == 200 and bool((data or {}).get("reply"))
    passed, checks = evaluate(case, call["http_status"], data, gt)
    agent = meta.get("agent_used")
    reported = meta.get("llm_calls_count") or 0
    return {
        "id": int(case["id"]), "category": case["category"], "message": case["message"], "language": case["language"],
        "auth": case["auth"], "expected_behavior": case["expected_behavior"], "expected_agent": case["expected_agent"],
        "http_status": call["http_status"], "status": "ok" if ok else "error", "error": call["error"],
        "latency_ms": round(call["latency_ms"], 1), "attempts": call["attempts"],
        "agent_used": agent, "tool_calls": meta.get("tool_calls_count") or 0,
        "llm_calls_reported": reported,
        # l'appel de classification n'est pas compté par les sous-agents ; la branche directe (agent_used = null) le compte déjà
        "llm_calls_estimated": reported + (0 if agent is None else 1),
        "returned_ids": (data or {}).get("recommended_annonce_ids") or [],
        "gt": {k: v for k, v in gt.items() if k != "items"} | ({"transactions_count": gt.get("count")} if "count" in gt else {}),
        "reply": (data or {}).get("reply"), "passed": passed, "checks": checks,
    } | (market_details(data, meta) if case["category"] == "market" else {})


def market_details(data, meta):
    """Éléments conservés pour l'annotation manuelle de la fidélité (Agent Marché)."""
    reply = (data or {}).get("reply") or ""
    return {"market": {
        "intent": (data or {}).get("intent"),
        "langue_detectee": meta.get("langue"),
        "search_query": meta.get("search_query"),
        "query_rewritten": meta.get("query_rewritten"),
        "rewrite_error": meta.get("rewrite_error"),
        "tavily_error": meta.get("tavily_error"),
        "gemini_error": meta.get("gemini_error"),
        "site_name_leak_avant_nettoyage": meta.get("site_name_leak"),
        "sources_count": meta.get("sources_count"),
        "cited_sources": meta.get("cited_sources") or [],
        "chiffres_dans_la_reponse": market_figures(reply),
        "raw_reply": meta.get("raw_reply"),
        "sources_extraits": meta.get("sources_extraits") or [],
    }}


# --------------------------------------------------------------------------
# Métriques
# --------------------------------------------------------------------------
def rate(num, den):
    return num / den if den else None


def summarize(records, snap_before, snap_after):
    n = len(records)
    # un échec HTTP sur le cas "faux jeton" est le comportement attendu, pas une erreur technique
    tech_errors = [r for r in records if r["status"] == "error" and r["category"] != "security_forged"]

    by_cat = {}
    for cat in CATEGORY_LABELS:
        rs = [r for r in records if r["category"] == cat]
        if not rs:
            continue
        # temps de réponse : seulement les requêtes réussies du premier coup (une nouvelle tentative fausserait la mesure)
        lat = sorted(r["latency_ms"] for r in rs if r["status"] == "ok" and r["attempts"] == 1)
        ok_rs = [r for r in rs if r["status"] == "ok"]
        by_cat[cat] = {
            "label": CATEGORY_LABELS[cat], "n": len(rs), "passed": sum(r["passed"] for r in rs),
            "pass_rate": rate(sum(r["passed"] for r in rs), len(rs)),
            "latency_mean_ms": statistics.mean(lat) if lat else None,
            "latency_p95_ms": percentile95(lat),
            "avg_llm_calls": statistics.mean(r["llm_calls_estimated"] for r in ok_rs) if ok_rs else None,
        }

    all_lat = sorted(r["latency_ms"] for r in records if r["status"] == "ok" and r["attempts"] == 1)
    n_retried = sum(1 for r in records if r["attempts"] > 1)
    tool_cases = [r for r in records if r["category"] in TOOL_CATEGORIES]
    tool_ok = [r for r in tool_cases if r["status"] == "ok" and r["tool_calls"] >= 1 and r["checks"].get("bon_agent")]
    search_cases = [r for r in records if r["category"] == "search" and r["status"] == "ok"]
    refusals = [r for r in records if r["category"] == "security_refusal"]
    forged = [r for r in records if r["category"] == "security_forged"]

    market = summarize_market([r for r in records if r["category"] == "market"])

    integrity = None
    if snap_before and snap_after:
        common = set(snap_before) & set(snap_after)
        integrity = {"unchanged": all(snap_before[k] == snap_after[k] for k in common),
                     "compared_fields": sorted(common), "before": snap_before, "after": snap_after}

    return {
        "run_info": {"date": datetime.now().isoformat(timespec="seconds"), "orchestrator_url": ORCHESTRATOR_URL, "n_messages": n},
        "pass_rate_overall": rate(sum(r["passed"] for r in records), n),
        "n_passed": sum(r["passed"] for r in records),
        "n_requests_needing_retry": n_retried,
        "n_technical_errors": len(tech_errors),
        "technical_error_rate": rate(len(tech_errors), n),
        "tool_call_success": {"correct": len(tool_ok), "total": len(tool_cases), "rate": rate(len(tool_ok), len(tool_cases))},
        "no_invented_listing": {
            "correct": sum(r["checks"].get("aucune_annonce_inventee", False) for r in search_cases),
            "total": len(search_cases),
            "rate": rate(sum(r["checks"].get("aucune_annonce_inventee", False) for r in search_cases), len(search_cases)),
        },
        "exact_search_results": {
            "correct": sum(r["checks"].get("resultats_exacts", False) for r in search_cases), "total": len(search_cases),
            "rate": rate(sum(r["checks"].get("resultats_exacts", False) for r in search_cases), len(search_cases)),
        },
        "unauthenticated_refusal": {"correct": sum(r["passed"] for r in refusals), "total": len(refusals),
                                    "rate": rate(sum(r["passed"] for r in refusals), len(refusals))},
        "forged_token_no_leak": {"correct": sum(r["passed"] for r in forged), "total": len(forged)},
        "data_integrity": integrity,
        "latency": ({"mean_ms": statistics.mean(all_lat), "median_ms": statistics.median(all_lat),
                     "p95_ms": percentile95(all_lat), "min_ms": all_lat[0], "max_ms": all_lat[-1]} if all_lat else {}),
        "avg_llm_calls_per_message": (statistics.mean(r["llm_calls_estimated"] for r in records if r["status"] == "ok")
                                      if any(r["status"] == "ok" for r in records) else None),
        "by_category": by_cat,
    } | ({"market": market} if market else {})


def summarize_market(rs):
    """Taux par vérification pour l'Agent Marché (chaque vérification n'est comptée que sur les cas où elle s'applique)."""
    if not rs:
        return None
    per_check = {}
    for r in rs:
        for name, ok in r["checks"].items():
            c = per_check.setdefault(name, {"correct": 0, "total": 0, "hors_taux": name in INFORMATIVE_CHECKS})
            c["total"] += 1
            c["correct"] += bool(ok)
    for c in per_check.values():
        c["rate"] = rate(c["correct"], c["total"])
    answered = [r for r in rs if r.get("market") and r["agent_used"] == MARKET_AGENT]
    return {
        "n": len(rs),
        "passed": sum(r["passed"] for r in rs),
        "n_traites_par_agent_marche": len(answered),
        "n_reponses_avec_chiffre": sum(bool(r["market"]["chiffres_dans_la_reponse"]) for r in answered),
        "n_requetes_reformulees": sum(bool(r["market"]["query_rewritten"]) for r in answered),
        "n_fuites_nom_de_site_avant_nettoyage": sum(bool(r["market"]["site_name_leak_avant_nettoyage"]) for r in answered),
        "n_avec_extraits_enregistres": sum(bool(r["market"]["sources_extraits"]) for r in answered),
        "par_verification": per_check,
    }


def fmt(v):
    return f"{v:.1%}" if v is not None else "n/a"


def print_summary(m):
    print("\n" + "=" * 72)
    print("RÉSULTATS — TESTS END-TO-END DE L'ORCHESTRATEUR")
    print("=" * 72)
    print(f"Messages testés                : {m['run_info']['n_messages']}")
    print(f"Réponses correctes             : {m['n_passed']}/{m['run_info']['n_messages']}  ({fmt(m['pass_rate_overall'])})")
    print(f"Erreurs techniques             : {m['n_technical_errors']}  ({fmt(m['technical_error_rate'])})")
    print(f"Requêtes ayant eu besoin d'une nouvelle tentative : {m['n_requests_needing_retry']}  (exclues des temps de réponse)")
    t = m["tool_call_success"]
    print(f"Réussite des appels d'outils   : {t['correct']}/{t['total']}  ({fmt(t['rate'])})")
    a = m["no_invented_listing"]
    print(f"Aucune annonce inventée        : {a['correct']}/{a['total']}  ({fmt(a['rate'])})")
    e = m["exact_search_results"]
    print(f"Résultats de recherche exacts  : {e['correct']}/{e['total']}  ({fmt(e['rate'])})")
    r = m["unauthenticated_refusal"]
    print(f"Refus correct sans connexion   : {r['correct']}/{r['total']}  ({fmt(r['rate'])})")
    fg = m["forged_token_no_leak"]
    if fg["total"]:
        print(f"Faux jeton : aucune fuite      : {fg['correct']}/{fg['total']}")
    di = m["data_integrity"]
    if di is not None:
        print(f"Données inchangées (avant/après): {'OUI' if di['unchanged'] else 'NON — à vérifier !'}")
    if m["latency"]:
        l = m["latency"]
        print(f"Temps de réponse               : moy {l['mean_ms']/1000:.2f}s | méd {l['median_ms']/1000:.2f}s | p95 {l['p95_ms']/1000:.2f}s | max {l['max_ms']/1000:.2f}s")
    if m["avg_llm_calls_per_message"] is not None:
        print(f"Appels LLM par message (estim.): {m['avg_llm_calls_per_message']:.2f}")
    print("\n{:<24}{:>4}{:>9}{:>9}{:>12}{:>11}".format("Catégorie", "n", "corrects", "taux", "latence moy", "appels LLM"))
    for c in m["by_category"].values():
        lat = f"{c['latency_mean_ms']/1000:.2f}s" if c["latency_mean_ms"] is not None else "n/a"
        llm = f"{c['avg_llm_calls']:.1f}" if c["avg_llm_calls"] is not None else "n/a"
        print("{:<24}{:>4}{:>9}{:>9}{:>12}{:>11}".format(c["label"], c["n"], c["passed"], fmt(c["pass_rate"]), lat, llm))
    mk = m.get("market")
    if mk:
        print(f"\nAgent Marché : {mk['passed']}/{mk['n']} corrects | traités par l'agent : {mk['n_traites_par_agent_marche']} | "
              f"réponses avec chiffre : {mk['n_reponses_avec_chiffre']} | extraits enregistrés : {mk['n_avec_extraits_enregistres']}")
        for name, c in mk["par_verification"].items():
            print(f"  {name:<28}{c['correct']:>3}/{c['total']:<3} {fmt(c['rate'])}" + ("   (hors taux)" if c["hors_taux"] else ""))
    print(f"\nFichiers générés dans : {RESULTS_DIR}")


def save_outputs(records, metrics):
    RESULTS_DIR.mkdir(exist_ok=True)
    with open(RESULTS_DIR / "e2e_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)
    with open(RESULTS_DIR / "e2e_results.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(["id", "catégorie", "message", "auth", "résultat", "agent", "appels_outils", "appels_LLM_estimés",
                    "latence_ms", "http", "vérifications_échouées", "réponse"])
        for r in sorted(records, key=lambda x: x["id"]):
            failed = ", ".join(k for k, v in r["checks"].items() if not v and k not in INFORMATIVE_CHECKS)
            w.writerow([r["id"], r["category"], r["message"], r["auth"], "Correct" if r["passed"] else "Incorrect",
                        r["agent_used"], r["tool_calls"], r["llm_calls_estimated"], r["latency_ms"], r["http_status"],
                        failed, (r["reply"] or r["error"] or "").replace("\n", " ")])
    with open(RESULTS_DIR / "e2e_per_category.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Catégorie", "Nombre de messages", "Réponses correctes", "Taux", "Latence moyenne (s)", "Latence p95 (s)", "Appels LLM moyens"])
        for c in metrics["by_category"].values():
            w.writerow([c["label"], c["n"], c["passed"], f"{c['pass_rate']:.3f}",
                        f"{c['latency_mean_ms']/1000:.2f}" if c["latency_mean_ms"] is not None else "",
                        f"{c['latency_p95_ms']/1000:.2f}" if c["latency_p95_ms"] is not None else "",
                        f"{c['avg_llm_calls']:.2f}" if c["avg_llm_calls"] is not None else ""])


    market = [r for r in sorted(records, key=lambda x: x["id"]) if r.get("market")]
    if market:
        with open(RESULTS_DIR / "e2e_market_details.csv", "w", encoding="utf-8-sig", newline="") as f:
            w = csv.writer(f, quoting=csv.QUOTE_ALL)
            w.writerow(["id", "message", "langue", "comportement_attendu", "résultat", "agent", "langue_détectée",
                        "requête_de_recherche", "chiffres_dans_la_réponse", "sources_citées", "nb_sources", "réponse"])
            for r in market:
                mk = r["market"]
                w.writerow([r["id"], r["message"], r["language"], r["expected_behavior"],
                            "Correct" if r["passed"] else "Incorrect", r["agent_used"], mk["langue_detectee"],
                            mk["search_query"], " | ".join(mk["chiffres_dans_la_reponse"]),
                            " | ".join(f"[{c.get('n')}] {c.get('domain')} — {c.get('title')}" for c in mk["cited_sources"]),
                            mk["sources_count"], (r["reply"] or "").replace("\n", " ")])


def make_charts(metrics):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("[info] matplotlib absent : graphiques ignorés (pip install matplotlib).")
        return
    cats = list(metrics["by_category"].values())
    labels = [c["label"] for c in cats]

    fig, ax = plt.subplots(figsize=(8.5, 5))
    rates = [c["pass_rate"] for c in cats]
    bars = ax.bar(labels, rates, color="#2a7f62")
    ax.set_ylim(0, 1.15); ax.set_ylabel("Taux de réponses correctes")
    ax.set_title("Tests end-to-end : réponses correctes par catégorie")
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right")
    for b, c in zip(bars, cats):
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.02, f"{c['passed']}/{c['n']}", ha="center", fontsize=9)
    fig.tight_layout(); fig.savefig(RESULTS_DIR / "fig_e2e_taux_par_categorie.png", dpi=200); plt.close(fig)

    lat = [(c["label"], c["latency_mean_ms"] / 1000, c["latency_p95_ms"] / 1000) for c in cats if c["latency_mean_ms"] is not None]
    if lat:
        fig, ax = plt.subplots(figsize=(8.5, 5))
        xs = range(len(lat))
        ax.bar([x - 0.2 for x in xs], [l[1] for l in lat], width=0.4, label="moyenne", color="#3b6ea5")
        ax.bar([x + 0.2 for x in xs], [l[2] for l in lat], width=0.4, label="p95", color="#c9783d")
        ax.set_xticks(list(xs)); ax.set_xticklabels([l[0] for l in lat], rotation=30, ha="right")
        ax.set_ylabel("Temps de réponse (s)"); ax.set_title("Temps de réponse par catégorie"); ax.legend()
        fig.tight_layout(); fig.savefig(RESULTS_DIR / "fig_e2e_latence_par_categorie.png", dpi=200); plt.close(fig)

    llm = [(c["label"], c["avg_llm_calls"]) for c in cats if c["avg_llm_calls"] is not None]
    if llm:
        fig, ax = plt.subplots(figsize=(8.5, 5))
        bars = ax.bar([l[0] for l in llm], [l[1] for l in llm], color="#7a5ea8")
        ax.set_ylabel("Appels LLM par message (estimation)"); ax.set_title("Appels LLM par catégorie")
        plt.setp(ax.get_xticklabels(), rotation=30, ha="right")
        for b, l in zip(bars, llm):
            ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.03, f"{l[1]:.1f}", ha="center", fontsize=9)
        fig.tight_layout(); fig.savefig(RESULTS_DIR / "fig_e2e_appels_llm.png", dpi=200); plt.close(fig)


# --------------------------------------------------------------------------
# Programme principal
# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Tests end-to-end de l'orchestrateur Darimmo")
    ap.add_argument("--reset", action="store_true", help="efface les résultats précédents")
    ap.add_argument("--limit", type=int, default=None, help="ne traite que N messages")
    ap.add_argument("--only", default=None, help="catégories à tester, séparées par des virgules (ex: search,faq)")
    ap.add_argument("--skip-auth", action="store_true", help="ignore les cas nécessitant une connexion (aucun identifiant requis)")
    ap.add_argument("--results-dir", default=None, help="dossier de résultats, dans tests_ia (défaut : results)")
    args = ap.parse_args()

    if args.results_dir:
        global RESULTS_DIR, RAW_PATH, SNAPSHOT_PATH
        RESULTS_DIR = BASE_DIR / args.results_dir
        RAW_PATH = RESULTS_DIR / "e2e_raw.jsonl"
        SNAPSHOT_PATH = RESULTS_DIR / "e2e_snapshots.json"

    if args.reset:
        for p in (RAW_PATH, SNAPSHOT_PATH):
            if p.exists():
                p.unlink()
        print("Résultats précédents effacés.")

    dataset = load_dataset()
    if args.only:
        wanted = {c.strip() for c in args.only.split(",")}
        dataset = [c for c in dataset if c["category"] in wanted]
    if args.skip_auth:
        dataset = [c for c in dataset if c["auth"] != "true"]
    if args.limit:
        dataset = dataset[: args.limit]

    needs_auth = any(c["auth"] == "true" for c in dataset)
    dj = DjangoClient()
    try:
        if needs_auth:
            if not EMAIL or not PASSWORD:
                sys.exit("DARIMMO_EMAIL et DARIMMO_PASSWORD sont requis pour les cas avec connexion "
                         "(ou utilise --skip-auth).")
            dj.login()
        dj.public_ids()  # vérifie que Django répond
    except Exception as exc:
        sys.exit(f"[Erreur] {exc}\nDjango doit tourner (python manage.py runserver).")

    done = load_raw()
    # le cas "faux jeton" échoue par construction (HTTP 500 attendu) : il n'est pas rejoué à la reprise
    todo = [c for c in dataset if int(c["id"]) not in done
            or (done[int(c["id"])]["status"] != "ok" and c["category"] != "security_forged")]
    print(f"Orchestrateur : {ORCHESTRATOR_URL}")
    print(f"{len(dataset)} messages | {len(dataset) - len(todo)} déjà traités | {len(todo)} à traiter | pause {DELAY_SECONDS}s\n")

    # instantané des données AVANT cette exécution (comparé à l'instantané APRÈS)
    RESULTS_DIR.mkdir(exist_ok=True)
    snaps = {"before": dj.snapshot(needs_auth)}

    for i, case in enumerate(todo, 1):
        try:
            gt = ground_truth(case, dj)
        except Exception as exc:
            print(f"[{i:>2}/{len(todo)}] vérité terrain indisponible pour #{case['id']} : {exc}")
            continue
        call = call_orchestrator(case, dj)
        rec = build_record(case, call, gt)
        done[rec["id"]] = rec
        append_raw(rec)
        print(f"[{i:>2}/{len(todo)}] {'OK' if rec['passed'] else 'XX'}  #{rec['id']:<3} {rec['category']:<17} "
              f"agent={str(rec['agent_used']):<24} {rec['latency_ms']/1000:.2f}s"
              + ("" if rec["passed"] else f"  échec: {[k for k, v in rec['checks'].items() if not v and k not in INFORMATIVE_CHECKS]}"
                 + (f" ({rec['error']})" if rec["error"] else "")))
        if i < len(todo):
            time.sleep(DELAY_SECONDS)

    records = [done[int(c["id"])] for c in dataset if int(c["id"]) in done]
    if not records:
        print("Aucun résultat à analyser.")
        return

    snaps["after"] = dj.snapshot(needs_auth) if todo else snaps["before"]
    SNAPSHOT_PATH.write_text(json.dumps(snaps, ensure_ascii=False), encoding="utf-8")
    metrics = summarize(records, snaps.get("before"), snaps.get("after"))
    save_outputs(records, metrics)
    make_charts(metrics)
    print_summary(metrics)


if __name__ == "__main__":
    main()
