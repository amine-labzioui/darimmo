# Agent Marché — résultats des runs 1 et 2, fidélité et stabilité

> Deux runs du 5 octobre 2026 sur les mêmes 18 messages (catégorie `market` de `dataset_e2e.csv`, ids 33 à 50),
> sans aucune modification entre les deux : `resultats_e2e_marche_run1` et `resultats_e2e_marche_run2`.
> Vérifications automatiques : `run_e2e_eval.py`. Fidélité (run 1 seulement) : annotation manuelle de l'étudiant,
> décisions finales dans `annotation_fidelite_finale.csv` (saisie initiale conservée dans `annotation_fidelite.csv`),
> taux calculés par `compute_market_fidelity.py` (`fidelite_metrics.json`).

## Résultats principaux

- **Aucun chiffre absent des extraits sur les deux runs** : 31 chiffres au run 1 et 28 au run 2, tous présents dans un extrait lu par le modèle.
- **1 réponse sans citation sur 23 réponses avec chiffre** (cas 42 au run 2) : ses 4 chiffres figurent dans les extraits, mais la réponse n'est pas traçable.
- **Fidélité (run 1, annotation manuelle)** : 25 chiffres sur 31 fidèles à l'extrait cité (80,6 %), 6 partiellement (19,4 %), 0 non fidèle.
- **Stabilité** : 9 cas sur 16 donnent exactement la même réponse (comportement, chiffres, source) aux deux runs.
- **Différence systématique entre français et darija** sur le même contenu : cas 37 et 40, mêmes 5 extraits, chiffre donné en français et absence déclarée en darija, aux deux runs.

## 1. Jeu de test

18 messages : 9 en français, 5 en darija (lettres latines), 2 en anglais, 2 en arabe.

| Comportement attendu | Cas | Nombre |
|---|---|---|
| Chiffre attendu (quartier déjà vérifié à la main avant le run) | 33, 34, 35, 39, 44, 46 | 6 |
| Chiffre ou absence déclarée (couverture inconnue avant le run) | 36, 37, 38, 40, 41, 42, 43, 45, 47 | 9 |
| Aucun chiffre (quartier inventé ; lieu hors Maroc) | 48, 49 | 2 |
| Autre agent (recherche de bien, contrôle de non-régression) | 50 | 1 |

## 2. Vérifications automatiques du run 1 (comportement)

18 réponses correctes sur 18 ; aucune erreur technique ; aucune nouvelle tentative. Les résultats du run 2 sont en section 6.

| Vérification | Résultat | Cas concernés |
|---|---|---|
| Réponse valide (HTTP 200, texte non vide) | 18/18 | tous |
| Bon agent | 16/16 | tous sauf 48 et 49 |
| Aucune erreur technique (recherche web, synthèse) | 16/16 | réponses de l'Agent Marché |
| Aucun nom de site ni URL dans la réponse | 17/17 | cas « marché » |
| Chiffre présent | 6/6 | cas « chiffre attendu » |
| Aucun chiffre | 2/2 | 48, 49 |
| Source citée quand un chiffre est donné | 13/13 | réponses avec chiffre |
| Sources citées issues des domaines autorisés | 13/13 | réponses avec chiffre |
| Langue détectée correcte (hors taux) | 16/16 | réponses de l'Agent Marché |
| Écriture de la réponse attendue, arabe ou latine (hors taux) | 17/17 | cas « marché » |

Répartition : 16 messages traités par l'Agent Marché (13 réponses avec chiffre, 3 sans chiffre) ; le cas 49 (Paris) a reçu la réponse directe de l'orchestrateur, sans agent ; le cas 50 a été traité par l'agent de recherche.
Temps de réponse : moyenne 7,12 s, médiane 7,65 s, p95 10,13 s, maximum 11,89 s. Appels LLM estimés : 2,89 par message.

Ces vérifications portent sur le comportement, pas sur la justesse des chiffres.

## 3. Fidélité des chiffres (annotation manuelle)

Aide automatique, qui n'est pas l'annotation : la suite de chiffres de chacun des 31 chiffres est présente telle quelle dans l'extrait de la source citée (31/31).

Règle d'annotation, fixée par l'étudiant : **jugement d'après l'extrait cité seul**.

- « oui » : le chiffre figure dans l'extrait cité, pour le même lieu, le même type de bien et avec le même sens que dans la réponse ;
- « partiel » : le chiffre figure dans l'extrait cité, mais la réponse en change le lieu, le type de bien ou le sens ;
- « non » : le chiffre ne figure pas dans l'extrait cité.

La qualité de la langue et la vraisemblance du prix ne comptent pas dans la note ; elles sont notées en commentaire.

| | oui | partiel | non |
|---|---|---|---|
| Chiffres (31) | 25/31 (80,6 %) | 6/31 (19,4 %) | 0/31 |
| Réponses avec chiffre (13) | 8/13 (61,5 %) | 5/13 (38,5 %) | 0/13 |

Règle par réponse : « oui » si tous ses chiffres sont « oui », « non » si au moins un chiffre est « non », sinon « partiel ».

- Réponses « oui » : 33, 34, 36, 38, 39, 41, 42, 45.
- Réponses « partiel » : 35, 37, 43, 44, 46.

Réponses sans chiffre (3) : absence justifiée pour les cas 47 et 48 ; non justifiée pour le cas 40.

## 4. Décisions d'annotation

Une première saisie mélangeait la fidélité avec la langue et la vraisemblance. L'étudiant a ensuite appliqué la règle unique ci-dessus ; 9 annotations sur 34 ont changé. Décisions finales :

| Cas | Décision | Motif |
|---|---|---|
| 39 (darija, Maarif) | oui ×3 | Mêmes chiffres et même extrait que le cas 33 |
| 35 et 44 (villa à Anfa) | partiel | Libellé ambigu dans la source (titre Anfa, ligne Casablanca), non signalé par l'agent |
| 41 (villa à Californie) | oui ×3 | Fidèle à l'extrait, mais contradictoire avec d'autres extraits du même cas (commentaire) |
| 46 (arabe, Maarif) | 14 888 : oui ; 7 901 et 21 021 : partiel | Les deux bornes de la fourchette sont présentées comme une moyenne ; mots en français dans la réponse (commentaire) |
| 47 (Hay Riad, sans chiffre) | absence justifiée | Les seuls chiffres disponibles venaient d'annonces individuelles, que le prompt exclut volontairement |
| 37 (Agdal) | partiel | Chiffre du sous-quartier « Haut Agdal » |
| 43 (Bouskoura) | partiel | Type « villa » ajouté alors que le message ne le précise pas |
| 40 (Agdal, darija, sans chiffre) | absence non justifiée | Le cas 37 donne un chiffre à partir des mêmes extraits |

## 5. Analyse des écarts

**a. Lieu élargi ou réduit (cas 35, 44, 37).** Pour « villa à Anfa », le référentiel cité ne donne qu'un prix moyen des villas à l'échelle de Casablanca ; une réponse le dit (35), l'autre l'attribue à Anfa (44). Pour « Agdal, Rabat », le seul référentiel trouvé concerne « Haut Agdal » ; la réponse 37 le précise. Le prompt de synthèse autorise le recours à un sous-quartier rattaché ; l'écart tient à la couverture des sources.

**b. Réponses opposées pour les mêmes extraits (cas 37 et 40).** Les deux messages (français et darija) ont produit la même requête de recherche et reçu exactement les mêmes 5 extraits (contenus identiques). Le cas 37 donne 18 184 DH/m² pour Haut Agdal ; le cas 40 répond qu'aucune information n'a été trouvée. Écart dû au modèle, pas à la recherche. Le run 2 reproduit exactement la même situation (mêmes 5 extraits pour les deux cas, chiffre en français, absence en darija) : l'écart est donc lié à la langue du message plutôt qu'au hasard.

**c. Type de bien non demandé (cas 43).** Le message « ch7al taman lmetre f Bouskoura ? » ne précise pas le type de bien. La règle de reformulation indique « Par défaut : appartement », mais la requête produite est « prix m2 villa Bouskoura » et la réponse donne le prix des villas (13 299 DH/m²), alors que l'extrait cité contient aussi le prix des appartements (6 108 DH). Un cas sur un.

**d. Vraisemblance d'un chiffre de la source (cas 41).** Le chiffre de 7 108 DH/m² pour les villas de Californie est repris fidèlement de l'extrait, mais d'autres extraits du même cas contiennent des annonces de villas dans ce quartier à 11 800 000 DH pour 638 m² et 9 000 000 DH pour 462 m², soit environ 18 500 et 19 500 DH/m². L'agent ne détecte pas cette incohérence entre sources : il applique la règle de priorité aux référentiels.

**e. Absences de chiffre (cas 40, 47, 48).** Cas 48 (quartier inventé) : les extraits ne concernent ni ce quartier ni Figuig, et l'agent ne donne aucun chiffre. Cas 47 (Hay Riad) : les extraits contiennent des annonces individuelles à Hay Riad mais aucun prix moyen au m² ; l'agent ne donne aucun chiffre, conformément à la règle « pas d'annonces individuelles » (absence annotée « justifiée »).

**f. Qualité de la langue (hors fidélité).** Les réponses en arabe (46, 47) contiennent des expressions en français (« référentiels de prix du marché », « consultées le »). Dans le cas 46, la fourchette est présentée par la formule « متوسط سعر يتراوح بين » (prix moyen compris entre). Les réponses en darija mélangent darija, français et arabe translittéré.

## 6. Run 2 : résultats automatiques

Même jeu de test, aucune modification du workflow ni du script entre les deux runs.

| | Run 1 | Run 2 |
|---|---|---|
| Réponses correctes | 18/18 | 15/18 (83,3 %) |
| Erreurs techniques | 0 | 0 |
| Réponses de l'Agent Marché avec chiffre | 13/16 | 10/16 |
| Chiffre présent (6 cas « chiffre attendu ») | 6/6 | 4/6 |
| Source citée quand un chiffre est donné | 13/13 | 9/10 |
| Sources citées issues des domaines autorisés | 13/13 | 10/10 |
| Aucun nom de site ni URL | 17/17 | 17/17 |
| Aucun chiffre (48, 49) | 2/2 | 2/2 |
| Temps de réponse moyen / médian / p95 / maximum | 7,12 / 7,65 / 10,13 / 11,89 s | 6,74 / 6,72 / 8,74 / 18,10 s |

Les 3 échecs du run 2 :

- **Cas 35 et 44 (villa à Anfa) : pas de chiffre.** L'extrait qui portait le chiffre du run 1 (« prix moyen des villas à Casablanca … 26 457 DH ») est encore présent dans les extraits du run 2, mais l'agent répond qu'il n'a pas de référence fiable pour Anfa. Ce chiffre concernait Casablanca et non Anfa (annoté « partiel » au run 1) : la réponse du run 2 est plus prudente que celle du run 1, mais le cas avait été étiqueté « chiffre attendu ».
- **Cas 42 (Malabata, darija) : chiffres donnés sans citation.** La réponse brute ne contient aucune marque [n]. Les 4 chiffres existent pourtant dans les extraits : 13 043, 10 209 et 15 453 DH/m² dans l'extrait [1] (référentiel du quartier) et 14 572 DH dans l'extrait [2] (référentiel de la ville, ligne Malabata). **Ce n'est pas une invention de chiffre** ; c'est une omission des citations, qui rend la réponse non traçable. Temps de réponse : 18,10 s.

Contrôle sur l'ensemble du run 2 : 28 chiffres dans les réponses de l'Agent Marché ; 24 présents dans l'extrait de la source citée, 4 présents dans un extrait non cité (cas 42), **0 absent de tous les extraits**. La fidélité du run 2 n'a pas été annotée à la main.

## 7. Stabilité entre les deux runs (16 cas traités par l'Agent Marché)

| Critère | Cas stables |
|---|---|
| Même comportement (chiffre / pas de chiffre) | 13/16 |
| Même source citée | 11/16 |
| Mêmes chiffres | 9/16 |
| Comportement, chiffres et source identiques | 9/16 |
| Extraits strictement identiques | 4/16 |

La requête de recherche produite par la reformulation est identique dans 15 cas sur 16 (cas 38 : « Guéliz » puis « Gueliz »).

**Variabilité de la recherche (extraits différents) : 12 cas sur 16.** En moyenne 3,1 adresses de pages sur 5 sont communes aux deux runs. Dans 5 de ces cas la réponse ne change pas (36, 38, 40, 47, 48) ; dans 7 elle change :

| Cas | Run 1 | Run 2 | Origine |
|---|---|---|---|
| 41 (villa à Californie) | 7 108 DH/m² | pas de chiffre | Le référentiel du quartier n'est plus dans les résultats |
| 45 (Hivernage) | 14 256 DH/m² (référentiel du quartier) | 19 900 MAD (tableau par quartier d'un autre site) | Source différente ; les deux référentiels ne concordent pas |
| 42 (Malabata) | 13 046 DH/m² | 13 043 DH/m², plus 14 572 DH d'un second site | Autre page du même référentiel, valeurs légèrement différentes ; citations omises |
| 37 (Agdal) | 18 184 DH/m² | 18 184 DH/m² et fourchette 10 405 – 24 374 | Extrait plus complet |
| 43 (Bouskoura) | 13 299 DH/m² | 13 299 DH/m², plus 15 203 DH/m² pour un sous-quartier | Extrait différent |
| 35, 44 (villa à Anfa) | 26 457 DH | pas de chiffre | Extraits en partie différents, mais l'extrait portant le chiffre est présent dans les deux runs : le changement vient du modèle |

**Variabilité du modèle à extraits identiques : 0 cas sur 4** entre les deux runs (33, 34, 39, 46 : mêmes chiffres, même source). En revanche, à l'intérieur de chaque run, les cas 37 et 40 reçoivent les mêmes extraits et obtiennent des réponses opposées (section 5 b), et les cas 35 et 44 changent de comportement alors que l'extrait utile est disponible dans les deux runs.

Lecture : les réponses sont stables quand le référentiel du quartier est renvoyé par la recherche (Maarif, Gauthier) ; la principale source d'instabilité est le contenu renvoyé par la recherche web, et, dans une moindre mesure, la décision du modèle quand la source ne correspond pas exactement au lieu demandé.

## 8. Limites de l'évaluation

- Deux passages seulement, 18 messages : un écart d'un cas n'est pas significatif.
- Les réponses dépendent des résultats de la recherche web au moment du run ; un run n'est pas reproductible à l'identique. Les extraits lus par le modèle sont conservés dans `e2e_raw.jsonl` (et `annotation_extraits.md` pour le run 1).
- Sur les deux runs, 23 réponses contiennent un chiffre (13 puis 10) ; une seule est sans citation.
- Fidélité annotée pour le run 1 uniquement, par un seul annotateur ; la règle d'annotation a été précisée après une première saisie (section 4).
- Les comportements attendus ont été proposés par l'assistant puis validés par l'étudiant ; l'étiquette « chiffre attendu » des cas 35 et 44 s'appuyait sur une vérification antérieure qui attribuait à Anfa un prix portant sur Casablanca.
- La détection automatique d'un « chiffre » repose sur un nombre suivi d'une unité (DH, MAD, dirham, m²) ; un prix écrit autrement ne serait pas détecté.
- La fidélité est jugée par rapport à l'extrait, qui est un texte « aplati » de la page et non la page elle-même.
- Observation hors périmètre : dans le cas 50, l'agent de recherche a renvoyé une annonce de Casablanca dont le titre ne mentionne pas Maarif ; le filtrage par quartier n'a pas été examiné.
