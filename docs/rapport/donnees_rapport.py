"""
Lecture des données du rapport dans les fichiers du dépôt.

Aucun chiffre des chapitres de tests n'est écrit à la main dans `generer_rapport.py` :
ils sont lus ici dans `tests_ia/`, `docs/audit_frontend.md` et `n8n_workflows/`.
"""

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TESTS = ROOT / "tests_ia"
sys.path.insert(0, str(TESTS))

from make_market_annotation import digits, find_in_extract  # noqa: E402
from run_e2e_eval import MARKET_AGENT, market_figures  # noqa: E402


def _json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _raw(folder):
    records = {}
    with open(TESTS / folder / "e2e_raw.jsonl", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rec = json.loads(line)
                records[rec["id"]] = rec
    return records


def _csv(path, delimiter=","):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=delimiter))


def market_stability():
    """Compare les deux runs de l'Agent Marché, cas par cas (cas traités par l'agent au run 1)."""
    r1, r2 = _raw("resultats_e2e_marche_run1"), _raw("resultats_e2e_marche_run2")
    rows = []
    for i in sorted(r1):
        a, b = r1[i], r2[i]
        if not a.get("market") or a["agent_used"] != MARKET_AGENT:
            continue
        ma, mb = a["market"], b["market"]
        fa = [digits(x) for x in ma["chiffres_dans_la_reponse"]]
        fb = [digits(x) for x in mb["chiffres_dans_la_reponse"]]
        ca = sorted(c["url"] for c in ma["cited_sources"])
        cb = sorted(c["url"] for c in mb["cited_sources"])
        ea = [(e["url"], e["content"]) for e in ma["sources_extraits"]]
        eb = [(e["url"], e["content"]) for e in mb["sources_extraits"]]
        rows.append({"id": i, "comportement": bool(fa) == bool(fb), "chiffres": fa == fb, "source": ca == cb,
                     "extraits": ea == eb,
                     "urls_communes": len({u for u, _ in ea} & {u for u, _ in eb})})
    n = len(rows)
    identical = [r for r in rows if r["comportement"] and r["chiffres"] and r["source"]]
    return {
        "n": n,
        "comportement": sum(r["comportement"] for r in rows),
        "source": sum(r["source"] for r in rows),
        "chiffres": sum(r["chiffres"] for r in rows),
        "identique": len(identical),
        "extraits_identiques": sum(r["extraits"] for r in rows),
        "extraits_differents": sum(not r["extraits"] for r in rows),
        "extraits_diff_reponse_diff": sum(1 for r in rows if not r["extraits"] and r not in identical),
        "extraits_ident_reponse_diff": sum(1 for r in rows if r["extraits"] and r not in identical),
        "urls_communes_moyenne": sum(r["urls_communes"] for r in rows) / n,
    }


def market_figure_presence(folder):
    """Pour un run : nombre de chiffres, présents dans l'extrait cité, dans un autre extrait, nulle part."""
    total = cited = other = nowhere = answers = uncited_answers = 0
    for r in _raw(folder).values():
        m = r.get("market")
        if not m or r["agent_used"] != MARKET_AGENT:
            continue
        figures = market_figures(m.get("raw_reply") or r["reply"] or "")
        if figures:
            answers += 1
            uncited_answers += not m["cited_sources"]
        cited_numbers = [c["n"] for c in m["cited_sources"]]
        for f in figures:
            total += 1
            where = [e["n"] for e in m["sources_extraits"] if find_in_extract(digits(f), e["content"])]
            if any(n in cited_numbers for n in where):
                cited += 1
            elif where:
                other += 1
            else:
                nowhere += 1
    return {"chiffres": total, "extrait_cite": cited, "autre_extrait": other, "nulle_part": nowhere,
            "reponses_avec_chiffre": answers, "reponses_sans_citation": uncited_answers}


def audit():
    """Tableaux de corrections de docs/audit_frontend.md, par section."""
    text = (ROOT / "docs" / "audit_frontend.md").read_text(encoding="utf-8")
    section, tables = None, {}
    for line in text.split("\n"):
        if line.startswith("#"):
            section = line.lstrip("# ").strip()
        elif line.startswith("|") and not re.match(r"\|\s*-", line):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            tables.setdefault(section, []).append(cells)
    wanted = {
        "3.1 Corrections fonctionnelles": "Premier audit : corrections fonctionnelles",
        "3.2 Harmonisation du style (#24)": "Premier audit : harmonisation du style (pages)",
        "9.1 Corrections": "Ajouts après le premier résumé",
        "10.1 Corrections": "Espace administrateur",
        "10.3 Statut d'une annonce par son propriétaire (#35)": "Statut d'une annonce par son propriétaire",
        "10.4 Page publique d'une annonce non publiée (#37)": "Page publique d'une annonce non publiée",
    }
    groups, rows = [], []
    for key, label in wanted.items():
        body = tables.get(key, [])[1:]  # sans la ligne d'en-tête
        tested = sum(1 for r in body if "Étudiant" in r[-1] or "« done »" in r[-1])
        groups.append((label, len(body), tested))
        for r in body:
            if key.startswith("3.2"):
                continue
            level = "Étudiant" if ("Étudiant" in r[-1] or "« done »" in r[-1]) else ("Script" if "Script" in r[-1] else "Build")
            rows.append((r[0], re.sub(r"`", "", r[1]), level))
    return {"groups": groups, "rows": rows, "total": sum(g[1] for g in groups),
            "tested": sum(g[2] for g in groups)}


def workflows():
    out = []
    for path in sorted((ROOT / "n8n_workflows").glob("*.json")):
        data = _json(path)
        nodes = data.get("nodes", [])
        out.append({"name": path.stem.replace("Darimmo - ", ""), "n": len(nodes),
                    "nodes": [n["name"] for n in nodes]})
    return out


def classification_prompt(max_chars=2300):
    data = _json(ROOT / "n8n_workflows" / "Darimmo - Orchestrateur.json")
    for node in data["nodes"]:
        if node["name"] == "Build Classification Prompt":
            code = node["parameters"]["jsCode"]
            start = code.index("const systemPrompt = `") + len("const systemPrompt = `")
            end = code.index("`;", start)
            prompt = code[start:end]
            return prompt[:max_chars] + (" […]" if len(prompt) > max_chars else "")
    return ""


def load():
    cls1 = _json(TESTS / "resultats_classification" / "classification_metrics.json")
    cls2 = _json(TESTS / "resultats_classification_v2" / "classification_metrics.json")
    e1 = _json(TESTS / "resultats_e2e_run1_avant_correction" / "e2e_metrics.json")
    e2 = _json(TESTS / "resultats_e2e_run2_apres_correction" / "e2e_metrics.json")
    m1 = _json(TESTS / "resultats_e2e_marche_run1" / "e2e_metrics.json")
    m2 = _json(TESTS / "resultats_e2e_marche_run2" / "e2e_metrics.json")
    fid = _json(TESTS / "resultats_e2e_marche_run1" / "fidelite_metrics.json")
    e2e_rows = _csv(TESTS / "resultats_e2e_run2_apres_correction" / "e2e_results.csv")
    dataset_cls = _csv(TESTS / "dataset_classification.csv")
    dataset_e2e = _csv(TESTS / "dataset_e2e.csv")
    return {
        "cls1": cls1, "cls2": cls2, "e1": e1, "e2": e2, "m1": m1, "m2": m2, "fid": fid,
        "e2e_failures": [r for r in e2e_rows if r["résultat"] != "Correct"],
        "dataset_cls": dataset_cls, "dataset_e2e": dataset_e2e,
        "stab": market_stability(),
        "pres1": market_figure_presence("resultats_e2e_marche_run1"),
        "pres2": market_figure_presence("resultats_e2e_marche_run2"),
        "audit": audit(), "workflows": workflows(), "prompt": classification_prompt(),
    }


if __name__ == "__main__":
    d = load()
    print("classification v1 / v2 :", d["cls1"]["n_valid"], d["cls2"]["n_valid"], d["cls2"]["accuracy_on_valid"])
    print("e2e :", d["e1"]["n_passed"], d["e2"]["n_passed"], "| échecs run 2 :", [r["id"] for r in d["e2e_failures"]])
    print("marché :", d["m1"]["n_passed"], d["m2"]["n_passed"], d["pres1"], d["pres2"])
    print("stabilité :", d["stab"])
    print("fidélité :", {k: d["fid"]["chiffres"][k]["n"] for k in ("oui", "partiel", "non")}, d["fid"]["fichier"])
    print("audit :", d["audit"]["groups"], d["audit"]["total"], d["audit"]["tested"], len(d["audit"]["rows"]))
    print("workflows :", [(w["name"], w["n"]) for w in d["workflows"]])
    print("prompt :", len(d["prompt"]), "caractères")
