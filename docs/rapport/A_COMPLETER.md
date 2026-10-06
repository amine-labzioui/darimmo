# Rapport Darimmo — éléments à compléter ou à relire

Fichier généré par `generer_rapport.py` en même temps que `Rapport_PFE_Darimmo.docx`.
Dans le document Word, les marqueurs `[À COMPLÉTER …]` et `[CAPTURE : …]` sont surlignés en jaune.

## Informations à compléter

| Chapitre | Élément |
|---|---|
| Page de garde | Titre du rapport à valider (proposé à partir du contenu du projet) |
| Page de garde | Encadrant : nom et prénom |
| Page de garde | Date de soutenance (le modèle indiquait « X Juillet 2026 ») |
| Page de garde | Membres du jury (3 lignes) |
| Remerciements | [À COMPLÉTER : remerciements — encadrant(s), membres du jury, équipe pédagogique du master, proches] |
| Remerciements | [À COMPLÉTER : adapter cette note à l'usage réel et la relire] |
| Dédicaces | [À COMPLÉTER : dédicaces (page facultative)] |
| ملخص | [À COMPLÉTER : résumé en arabe à relire par un lecteur arabophone] |
| Chapitre 1 — Contexte et cahier des charges | [À COMPLÉTER : cadre du projet — projet académique ou stage, organisme d'accueil éventuel, période] |
| Bibliographie et webographie | [À COMPLÉTER] |

## Captures d'écran à insérer

| Chapitre | Élément |
|---|---|
| Chapitre 4 — Réalisation | Figure 7 — page /recherche avec des filtres actifs (ville, type de bien) et la grille de cartes d'annonces |
| Chapitre 4 — Réalisation | Figure 8 — page /annonces/{id} d'une annonce publiée : galerie, titre, prix, cartes de caractéristiques, bloc du vendeur |
| Chapitre 4 — Réalisation | Figure 9 — page « Modifier l'annonce » d'une annonce publiée : badge de statut, boutons « Marquer comme vendue » et « Archiver », bloc « Booster cette annonce » |
| Chapitre 4 — Réalisation | Figure 10 — page /assistant-ia : question « Je cherche un appartement à Casablanca » et réponse avec les cartes d'annonces recommandées |
| Chapitre 4 — Réalisation | Figure 11 — page /assistant-ia : question « combien le mètre carré à Maarif Casablanca ? » et réponse de l'Agent Marché (prix moyen et fourchette) |
| Chapitre 4 — Réalisation | Figure 12 — simulateur de paiement CMI, puis facture PDF d'une transaction réussie (numéro FCT-…, formule, période, montant) |
| Chapitre 4 — Réalisation | Figure 13 — page /admin : six cartes de compteurs et les deux graphiques (répartition des utilisateurs, statut des annonces) |
| Chapitre 4 — Réalisation | Figure 14 — page /admin/annonces : onglets par statut, liste des annonces publiées avec le bouton « Archiver » |

## Passages à relire

| Chapitre | Élément |
|---|---|
| ملخص | Résumé en arabe : texte produit avec une aide automatique, à relire entièrement |

## Points à vérifier

| Chapitre | Élément |
|---|---|
| Bibliographie | Auteurs et adresses des 15 références ; ajouter la date de consultation de chacune |

## Chiffres sensibles à relire avant l'impression

Tous les chiffres des chapitres 5 et des résumés sont lus dans les fichiers au moment de la génération. À contrôler à la lecture :

- résumés (français, anglais, arabe) : 77 messages, 27/32 puis 30/32, 59 chiffres de l'Agent Marché, 25 sur 31, 9 cas sur 16 ;
- tableau « Résultats de la classification » : `tests_ia/resultats_classification*/classification_metrics.json` ;
- tableaux des tests de bout en bout : `tests_ia/resultats_e2e_run*/e2e_metrics.json` ;
- tableau et figure de l'Agent Marché : `tests_ia/resultats_e2e_marche_run*/e2e_metrics.json`, `fidelite_metrics.json` (grille `annotation_fidelite_finale.csv`) ;
- tableau de synthèse de l'audit : comptage des lignes des tableaux de `docs/audit_frontend.md` ; « testées dans le navigateur » = lignes dont la colonne « Testé » contient « Étudiant » ou « done » ;
- tableau « Réponses de l'Agent Marché vérifiées à la main » : recopié de `docs/notes_agent_marche_et_session.md` (5 lignes dans ce document).

## Écarts avec les consignes à connaître

- Les consignes FSAC demandent un résumé d'environ 300 mots par langue ; les résumés générés en font 325 (français), 298 (anglais) et 261 (arabe).
- Les consignes FSAC fixent 100 pages au maximum hors annexes ; le rapport vise 60 pages au maximum, à la demande de l'étudiant.
- Les numéros des titres (1.1, 1.2…) sont écrits dans le texte des titres, pas par une liste numérotée de Word.
- Les sources sont indiquées sous chaque figure et chaque tableau (python-docx ne crée pas de notes de bas de page).
- Après toute modification dans Word : sélectionner tout (Ctrl+A) puis F9 pour mettre à jour la table des matières et les listes.

## Pagination mesurée par Word

- Pages au total dans le fichier : 57
- Pages hors page de garde, dernière page et annexes : 51
- Pages d'annexes : 4

## Compteurs

- Figures : 19 (dont 8 captures à insérer)
- Tableaux : 18
