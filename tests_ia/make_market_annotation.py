#!/usr/bin/env python3
"""
Grille d'annotation manuelle — fidélité des réponses de l'Agent Marché
======================================================================

À partir de `e2e_raw.jsonl` (run `--only market`), ce script prépare deux
fichiers dans le même dossier de résultats :

* `annotation_fidelite.csv` : une ligne par chiffre de prix donné dans une
  réponse (et une ligne par réponse sans chiffre). Les colonnes
  `annotation` et `commentaire` sont vides : elles sont à remplir à la main.
* `annotation_extraits.md` : pour chaque cas, le message, la réponse brute
  (avec les citations [n]) et le texte complet des extraits lus par le modèle.

Le script ne décide PAS de la fidélité. La colonne `aide_*` indique seulement
si la suite de chiffres apparaît telle quelle dans un extrait : un chiffre
présent peut quand même être mal interprété (mauvais quartier, villa au lieu
d'appartement, borne prise pour une moyenne).

Utilisation (depuis tests_ia) :
    python make_market_annotation.py --results-dir resultats_e2e_marche_run1
    python make_market_annotation.py --results-dir resultats_e2e_marche_run1 --force   # écrase une grille existante
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path

from run_e2e_eval import MARKET_AGENT, MARKET_FIGURE

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent
CITATION = re.compile(r"\[(\d+(?:\s*,\s*\d+)*)\]")
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def digits(text):
    """Suite de chiffres d'un nombre, sans espaces ni séparateurs ('14 888 DH' -> '14888')."""
    number = re.match(r"[0-9٠-٩][0-9٠-٩\s.,  ]*", text)
    return re.sub(r"\D", "", (number.group(0) if number else "").translate(ARABIC_DIGITS))


def find_in_extract(number, content):
    """Contexte (±70 caractères) de la première occurrence du nombre dans un extrait, sinon None."""
    if not number:
        return None
    pattern = r"(?<!\d)" + r"[\s.,  ]?".join(number) + r"(?!\d)"
    m = re.search(pattern, content or "")
    if not m:
        return None
    start, end = max(0, m.start() - 70), min(len(content), m.end() + 70)
    return re.sub(r"\s+", " ", content[start:end]).strip()


def figures_with_citations(raw_reply, cited_numbers):
    """Chiffres de la réponse brute, chacun avec la citation [n] qui le suit dans la même phrase."""
    rows = []
    for m in MARKET_FIGURE.finditer(raw_reply):
        rest = raw_reply[m.end():]
        sentence_end = re.search(r"[.!?؟]\s", rest)
        scope = rest[: sentence_end.start()] if sentence_end else rest
        cit = CITATION.search(scope)
        sources = [int(x) for x in cit.group(1).split(",")] if cit else list(cited_numbers)
        rows.append((re.sub(r"\s+", " ", m.group(0)).strip(), sources, bool(cit)))
    return rows


def main():
    ap = argparse.ArgumentParser(description="Prépare la grille d'annotation de la fidélité (Agent Marché)")
    ap.add_argument("--results-dir", required=True, help="dossier du run market, dans tests_ia")
    ap.add_argument("--force", action="store_true", help="écrase une grille déjà présente (les annotations seraient perdues)")
    args = ap.parse_args()

    results_dir = BASE_DIR / args.results_dir
    raw_path = results_dir / "e2e_raw.jsonl"
    grid_path = results_dir / "annotation_fidelite.csv"
    extracts_path = results_dir / "annotation_extraits.md"
    if not raw_path.exists():
        sys.exit(f"[Erreur] {raw_path} introuvable.")
    if grid_path.exists() and not args.force:
        sys.exit(f"[Arrêt] {grid_path.name} existe déjà : il n'est pas écrasé (utilise --force pour le régénérer).")

    records = {}
    with open(raw_path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rec = json.loads(line)
                records[rec["id"]] = rec
    cases = [r for r in sorted(records.values(), key=lambda x: x["id"])
             if r.get("market") and r["agent_used"] == MARKET_AGENT]

    grid, md = [], ["# Extraits lus par l'Agent Marché — support de l'annotation", ""]
    for r in cases:
        mk = r["market"]
        raw_reply = mk.get("raw_reply") or r["reply"] or ""
        extracts = {e["n"]: e for e in mk.get("sources_extraits") or []}
        cited_numbers = [c["n"] for c in mk.get("cited_sources") or []]

        md += [f"## Cas {r['id']} — {r['message']}", "",
               f"- Langue du message : {r['language']} ; langue détectée : {mk.get('langue_detectee')}",
               f"- Requête de recherche : {mk.get('search_query')}",
               f"- Sources citées : {cited_numbers or 'aucune'}", "",
               "**Réponse brute (avec citations)**", "", "> " + raw_reply.replace("\n", "\n> "), ""]
        for n, e in sorted(extracts.items()):
            cited = " — CITÉE" if n in cited_numbers else ""
            md += [f"**Source [{n}]{cited}** — {e.get('domain')} — {e.get('title')}", "", f"<{e.get('url')}>", "",
                   "```text", e.get("content") or "(extrait vide)", "```", ""]

        rows = figures_with_citations(raw_reply, cited_numbers)
        if not rows:
            grid.append([r["id"], r["message"], r["language"], "absence de chiffre", "", "", "", "", "", "",
                         re.sub(r"\s+", " ", raw_reply), "", ""])
            continue
        for figure, sources, explicit in rows:
            number = digits(figure)
            cited_ctx = [(n, find_in_extract(number, extracts.get(n, {}).get("content"))) for n in sources]
            found_cited = [(n, ctx) for n, ctx in cited_ctx if ctx]
            found_other = [n for n, e in sorted(extracts.items())
                           if n not in sources and find_in_extract(number, e.get("content"))]
            first = found_cited[0] if found_cited else (None, "")
            grid.append([
                r["id"], r["message"], r["language"], "chiffre", figure,
                ", ".join(f"[{n}]" for n in sources) + ("" if explicit else " (citation en fin de réponse)"),
                " | ".join(extracts.get(n, {}).get("domain") or "?" for n in sources),
                "oui" if found_cited else "non",
                first[1],
                ", ".join(f"[{n}]" for n in found_other),
                re.sub(r"\s+", " ", raw_reply), "", "",
            ])

    with open(grid_path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";", quoting=csv.QUOTE_ALL)
        w.writerow(["id", "message", "langue", "type_de_ligne", "chiffre_dans_la_reponse", "source_citee",
                    "domaine_cite", "aide_nombre_trouve_dans_extrait_cite", "aide_contexte_dans_extrait_cite",
                    "aide_nombre_trouve_dans_autres_extraits", "reponse_brute",
                    "annotation (oui / non / partiel)", "commentaire"])
        w.writerows(grid)
    extracts_path.write_text("\n".join(md), encoding="utf-8")

    n_fig = sum(1 for g in grid if g[3] == "chiffre")
    print(f"{len(cases)} réponses de l'Agent Marché | {n_fig} chiffres à annoter | "
          f"{len(grid) - n_fig} réponses sans chiffre")
    print(f"Aide automatique : nombre trouvé tel quel dans l'extrait cité pour "
          f"{sum(1 for g in grid if g[7] == 'oui')}/{n_fig} chiffres (ce n'est pas l'annotation).")
    print(f"Grille   : {grid_path}\nExtraits : {extracts_path}")


if __name__ == "__main__":
    main()
