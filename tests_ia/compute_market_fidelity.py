#!/usr/bin/env python3
"""
Taux de fidélité de l'Agent Marché à partir de la grille annotée à la main
==========================================================================

Lit `annotation_fidelite.csv` (grille produite par `make_market_annotation.py`
puis annotée par l'étudiant) et calcule les taux oui / partiel / non :

* par chiffre (une ligne de la grille = un chiffre de prix d'une réponse) ;
* par réponse : « oui » si tous ses chiffres sont « oui », « non » si au moins
  un chiffre est « non », sinon « partiel » ;
* pour les réponses sans chiffre : l'absence de chiffre est-elle justifiée.

Les lignes non annotées sont comptées à part ; elles n'entrent dans aucun taux.
Le fichier annoté n'est jamais modifié. Trois formats sont acceptés : la grille
d'origine (séparateur « ; »), la grille réenregistrée par Excel avec des
virgules (chaque ligne d'origine dans la première cellule, puis les colonnes
« annotation » et « commentaire » ajoutées à droite), et la grille réduite à
6 colonnes (id, type, chiffre, source, annotation, commentaire).

Utilisation (depuis tests_ia) :
    python compute_market_fidelity.py --results-dir resultats_e2e_marche_run1
    python compute_market_fidelity.py --results-dir resultats_e2e_marche_run1 --grid annotation_fidelite_finale.csv
"""

import argparse
import csv
import io
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent
VALUES = ("oui", "partiel", "non")


def read_grid(path):
    """Renvoie les lignes de la grille : id, type, chiffre, source, annotation, commentaire."""
    text = path.read_bytes().decode("utf-8-sig")
    first = text.splitlines()[0]
    rows = []
    if first.startswith('"id";'):  # grille d'origine (13 colonnes) ou grille réduite (6 colonnes)
        for cells in list(csv.reader(io.StringIO(text), delimiter=";"))[1:]:
            if len(cells) == 6:
                rows.append(tuple(cells))
            elif cells:
                rows.append((cells[0], cells[3], cells[4], cells[5], cells[11], cells[12]))
        return rows
    # grille réenregistrée par Excel : colonnes « annotation » / « commentaire » ajoutées à droite
    table = list(csv.reader(io.StringIO(text)))
    header = [h.strip() for h in table[0]]
    i_annot, i_comment = header.index("annotation"), header.index("commentaire")
    for cells in table[1:]:
        if not any(cells):
            continue
        cells = cells + [""] * (i_comment + 1 - len(cells))
        original = next(csv.reader(io.StringIO(",".join(cells[:i_annot]).rstrip(",")), delimiter=";"))
        rows.append((original[0], original[3], original[4], original[5], cells[i_annot], cells[i_comment]))
    return rows


def rates(counter):
    total = sum(counter[v] for v in VALUES)
    return {v: {"n": counter[v], "taux": (counter[v] / total if total else None)} for v in VALUES} | {"total_annote": total}


def main():
    ap = argparse.ArgumentParser(description="Taux de fidélité de l'Agent Marché (grille annotée)")
    ap.add_argument("--results-dir", required=True, help="dossier du run market, dans tests_ia")
    ap.add_argument("--grid", default="annotation_fidelite.csv", help="fichier annoté à lire, dans le dossier du run")
    args = ap.parse_args()
    results_dir = BASE_DIR / args.results_dir
    grid_path = results_dir / args.grid
    if not grid_path.exists():
        sys.exit(f"[Erreur] {grid_path} introuvable.")

    rows = [(i, t, fig, src, a.strip().lower(), c.strip()) for i, t, fig, src, a, c in read_grid(grid_path)]
    invalid = [r for r in rows if r[4] and r[4] not in VALUES]
    if invalid:
        sys.exit(f"[Erreur] annotation inconnue (attendu : oui / partiel / non) : {[(r[0], r[4]) for r in invalid]}")

    figures = [r for r in rows if r[1] == "chiffre"]
    absences = [r for r in rows if r[1] != "chiffre"]

    per_answer = defaultdict(list)
    for r in figures:
        per_answer[r[0]].append(r[4])
    answer_label = {}
    for case_id, labels in per_answer.items():
        if not all(labels):
            answer_label[case_id] = ""  # annotation incomplète
        elif "non" in labels:
            answer_label[case_id] = "non"
        elif all(lab == "oui" for lab in labels):
            answer_label[case_id] = "oui"
        else:
            answer_label[case_id] = "partiel"

    metrics = {
        "fichier": grid_path.name,
        "chiffres": rates(Counter(r[4] for r in figures)) | {
            "total": len(figures), "non_annotes": sum(1 for r in figures if not r[4])},
        "reponses_avec_chiffre": rates(Counter(answer_label.values())) | {
            "total": len(answer_label), "non_annotees": sum(1 for v in answer_label.values() if not v),
            "par_cas": answer_label},
        "reponses_sans_chiffre": {
            "total": len(absences),
            "absence_justifiee_oui": sum(1 for r in absences if r[4] == "oui"),
            "absence_justifiee_non": sum(1 for r in absences if r[4] == "non"),
            "non_annotees": sum(1 for r in absences if not r[4]),
            "par_cas": {r[0]: r[4] for r in absences}},
        "commentaires": {f"{r[0]} ({r[2] or 'sans chiffre'})": r[5] for r in rows if r[5]},
    }
    (results_dir / "fidelite_metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.grid == "annotation_fidelite.csv":
        with open(results_dir / "annotation_fidelite_normalisee.csv", "w", encoding="utf-8-sig", newline="") as f:
            w = csv.writer(f, delimiter=";", quoting=csv.QUOTE_ALL)
            w.writerow(["id", "type_de_ligne", "chiffre_dans_la_reponse", "source_citee", "annotation", "commentaire"])
            w.writerows(rows)

    def line(label, block):
        total = block["total_annote"]
        parts = " | ".join(f"{v} {block[v]['n']}/{total}" + (f" ({block[v]['taux']:.1%})" if total else "") for v in VALUES)
        return f"{label:<26}{parts}"

    c, a, s = metrics["chiffres"], metrics["reponses_avec_chiffre"], metrics["reponses_sans_chiffre"]
    print(line("Chiffres", c) + f" | non annotés {c['non_annotes']}/{c['total']}")
    print(line("Réponses avec chiffre", a) + f" | non annotées {a['non_annotees']}/{a['total']}")
    print(f"{'Réponses sans chiffre':<26}absence justifiée : oui {s['absence_justifiee_oui']} | non {s['absence_justifiee_non']}"
          f" | non annotées {s['non_annotees']}/{s['total']}")
    print(f"Grille lue : {grid_path.name} | métriques : {results_dir / 'fidelite_metrics.json'}")


if __name__ == "__main__":
    main()
