# Notes de session — Agent Marché (market_advice) et incidents techniques

> Source pour le rapport. Uniquement des faits observés pendant les tests (octobre 2026).
> Les résultats chiffrés de la classification et des tests end-to-end sont dans `tests_ia/`.
> L'audit et les corrections du frontend sont dans `docs/audit_frontend.md`.

## 1. Besoin

Les questions de marché (ex. « combien le mètre m² à Maarif Casablanca ») étaient classées `search_property` et l'agent répondait par une annonce de la plateforme au lieu d'un prix au m². Les annonces Darimmo étant trop peu nombreuses pour calculer un prix fiable, l'étudiant a choisi d'utiliser des informations publiques issues d'Internet.

## 2. Choix de la source de recherche web

| Option testée | Résultat observé |
|---|---|
| Gemini + outil Google Search (grounding), modèle gemini-3.5-flash-lite | Erreur 429 (quota). La page de quotas Google AI Studio indiquait « Ancrage de recherche » : Gemini 3 = 0/0 ; Gemini 2 / 2.5 = 1 500 par jour, mais les modèles 2.5 Flash / Flash Lite limités à 20 requêtes par jour. Un appel sans outil sur le même modèle fonctionnait (cause = quota de l'outil). |
| Tavily (API de recherche pour agents), plan gratuit | Retenu : 1 000 crédits par mois ; recherche « advanced » = 2 crédits. Gemini (sans outil) fait la synthèse. |

Premier test Tavily sans restriction de domaines (requête « prix moyen du mètre carré appartement Maarif Casablanca ») : 5 résultats non pertinents (dictionnaires : WordHippo, Cambridge, Wiktionary, Merriam-Webster, Instagram), scores 0,007 à 0,021.
Avec `include_domains` (mubawab.ma, yakeey.com, agenz.ma, sarouty.ma, avito.ma) et `search_depth: advanced` : 5 résultats immobiliers, scores 0,90 à 0,92, dont deux référentiels de prix (Yakeey, Agenz).

## 3. Architecture de l'Agent Marché (workflow n8n « Darimmo - Agent Marché », version finale v4)

1. Déclencheur « When Executed by Another Workflow » (champs message, session_id, user_context, auth_token) + Webhook de test `darimmo-agent-marche`.
2. Reformulation de la requête par Gemini (sortie JSON : query, quartier, ville, type_bien, langue), température 0. Repli sur le message brut en cas d'échec.
3. Recherche Tavily (5 résultats, domaines immobiliers marocains).
4. Construction du prompt de synthèse : sources numérotées, règles strictes (chiffres présents tels quels dans une source, priorité aux référentiels, pas d'annonces individuelles, pas de mélange appartements / villas, sous-quartiers rattachés autorisés au maximum 2, date de mise à jour si présente sinon date de consultation, langue imposée selon la langue détectée).
5. Synthèse par Gemini (gemini-3.5-flash-lite, température 0,2).
6. Réponse finale : citations [n] retirées du texte client ; aucune URL ni nom de site dans la réponse (décision de l'étudiant : ne pas faire de publicité aux sites concurrents) ; sources citées conservées dans `metadata.cited_sources` ; filet de sécurité qui remplace un nom de site concurrent éventuel et le signale (`site_name_leak`).
Appels : 2 appels LLM + 1 recherche Tavily par question.

Intégration dans l'orchestrateur : nouvelle intention `market_advice` (11 intentions), règle de Switch `market_advice`, nœud « Execute - Agent Marché ».

## 4. Problèmes rencontrés pendant le développement

- Lecture de texte « aplati » : dans une version intermédiaire, pour Almaz (Hay Hassani), les chiffres cités existaient bien dans la source mais étaient mal interprétés (prix moyen confondu avec une borne, chiffre de villa utilisé pour des appartements). Conclusion : vérifier qu'un chiffre « existe dans la source » ne suffit pas. Correction : règle explicite décrivant le format des référentiels.
- Requêtes en darija ou en français familier : la recherche ne trouvait pas le référentiel du quartier. Correction : étape de reformulation de la requête.
- Réponse en français à un message en darija (règle de langue trop générale). Correction : langue détectée et imposée explicitement.
- Variabilité des sources : pour une même question, Tavily a renvoyé la page de Maarif ou celle d'un sous-quartier (Palmier) selon les essais.
- Les référentiels évoluent : pour Gauthier, un ancien extrait indiquait 15 316 DH/m², la page à jour 16 587 DH/m² (estimations mises à jour par le site).
- Les référentiels ne concordent pas entre eux : Maarif appartements 14 888 DH/m² (Yakeey) contre 15 969 DH/m² (Agenz).

## 5. Vérifications réalisées (version finale)

Chaque chiffre de la réponse a été recherché dans le contenu de la source citée (sortie du nœud « Construire prompt marché »).

| Message | Langue | Réponse | Source citée | Vérification |
|---|---|---|---|---|
| combien le metre m² a maarif casa | fr | 14 888 DH/m² (7 901 – 21 021) | Yakeey, Maarif | 3 chiffres présents, bloc « Appartements » |
| ch7al taman dyal metre f Maarif f casa | darija | mêmes chiffres, réponse en darija | Yakeey, Maarif | présents |
| What is the price per m2 for a villa in Anfa, Casablanca? | en | 26 457 DH/m², mise à jour 29/01/2026 | Agenz, Anfa | chiffre et date présents, ligne « villas » |
| ch7al taman dyal metre f Gauthier (via le site) | darija | 16 587 DH/m² (8 916 – 24 234) | Yakeey, Gauthier | présents |
| combien coûte un appartement à Rabat ? (via le site) | fr | 12 392 DH/m² | Agenz, page nationale | présent (« Rabat 12 392 DH ») |

Classification via le site : market_advice 0,99 (Maarif), 1 (Gauthier), 0,95 (Rabat) ; « Je cherche un appartement à Casablanca » toujours `search_property` 0,95 (pas de régression).
Observation : pour « ch7al taman dyal metre f Gauthier », le classificateur a renseigné city = Casablanca alors que la ville n'était pas dans le message (probablement tirée du contexte utilisateur).
Réserve : 6 réponses vérifiées, un seul passage ; ce n'est pas une évaluation statistique.

## 6. Limites

- Dépendance à l'index de Tavily et aux extraits des sites (texte aplati, variable d'un essai à l'autre).
- Couverture limitée aux quartiers ayant un référentiel sur ces sites.
- Qualité moyenne de la darija générée par le modèle Flash Lite.
- Quotas : 500 requêtes par jour pour gemini-3.5-flash-lite (palier gratuit observé), 1 000 crédits Tavily par mois.
- Utilisation de données de sites tiers sans les citer au client : à examiner au regard de leurs conditions d'utilisation.
- Les tests end-to-end (`tests_ia/resultats_e2e_*`) ont été réalisés avant l'ajout de l'Agent Marché et ne le couvrent pas.

## 7. Incidents techniques de la session (hors frontend)

- Export des workflows n8n : `npx n8n export:workflow` voulait installer une autre version de n8n (risque de migration de la base) ; export fait depuis l'interface (« Export JSON »).
- GitHub Push Protection a bloqué le push : clé API Google écrite en clair dans l'URL des nœuds HTTP de 6 workflows (11 occurrences). Remplacée par `<GEMINI_API_KEY>` dans les exports avant le push. Dans l'instance n8n, ces nœuds utilisent toujours la clé dans l'URL (limite de sécurité ; correction : credential n8n, comme l'Agent Marché).
- Un `.env.example` suivi par git contenait une chaîne MongoDB ; valeur de type exemple selon l'étudiant, remplacée par des marqueurs.
- Fichiers de logs déjà suivis par git retirés du suivi (`git rm --cached`).
- Page de quotas Google AI Studio : modèle « Gemini 3.8 Flash » à 22/20 requêtes par jour et 5/5 par minute. Le nœud qui l'utilise n'a pas été identifié.
- Heure légale : le Maroc est revenu à GMT le 20 septembre 2026 (décret n° 2.26.530). tzdata 2026.2 du venv appliquait encore UTC+1 ; mise à jour en 2026.5 (vérification : décalage 0:00:00 le 5 octobre 2026).
- Lecture du `.env` par Django : non résolue au moment de ces notes ; contournement par `$env:N8N_WEBHOOK_URL` dans le terminal.
