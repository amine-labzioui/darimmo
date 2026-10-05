# Passation — Projet Darimmo : Agent IA orchestrateur (PFE Master IIA, FSAC Casablanca)

> À donner à Claude au début d'une nouvelle conversation, avec la consigne :
> « Lis ce fichier, reprends à l'étape indiquée dans la section 9, et respecte les règles de la section 1. »
> Ce fichier ne contient volontairement AUCUN mot de passe, clé API ni jeton.

## 1. Règles de collaboration (importantes)

- Étudiant : Amine Labzioui, Master IIIA (Ingénierie Informatique et IA), Université Hassan II, Casablanca.
- Réponses en darija écrite en lettres latines, avec les termes techniques en français.
- **Travailler étape par étape** : donner UNE étape, attendre « done » avant la suivante.
- Donner le code complet des fichiers, l'emplacement exact et la façon de le tester.
- **Ne jamais inventer de résultats ou de métriques** : tout chiffre vient d'un vrai test.
- Ne pas demander de coller de secrets (mots de passe, clés, jetons). Si l'étudiant en colle, le lui signaler.
- Rapport en **Word** (pas LaTeX), présentation PowerPoint ensuite.
- L'étudiant doit valider lui-même les étiquettes du jeu de test (elles ont été écrites par l'assistant).

## 2. Architecture réalisée

```
React (localhost:5173, page « Assistant IA »)
  -> Django REST  POST /api/ai/chat/   (apps/ai_integration : views.py + n8n_client.py)
      envoie : message, session_id, user_context, conversation_history, auth_token (JWT de l'utilisateur)
  -> n8n (local, npx n8n, localhost:5678) webhook de production : darimmo-ai-chat
      Orchestrateur : classification d'intention (Gemini gemini-3.5-flash-lite) -> Switch
        search_property           -> Agent Recherche
        create/update/delete/my_listings -> Agent Annonces
        payment_status            -> Agent Paiement
        contact_owner             -> Agent Communication
        general_help              -> FAQ RAG (MongoDB Atlas Vector Search)
        autres / confiance < 0.6  -> réponse directe (clarification)
      Chaque sous-agent : appel Gemini avec function calling -> appel réel de l'API Django avec le JWT de l'utilisateur
  -> réponse unifiée : { reply, session_id, recommended_annonce_ids, intent, metadata{agent_used, tool_calls_count, llm_calls_count} }
```

- Sécurité : le LLM ne décide jamais des permissions. Django les applique avec le JWT transmis. Sans connexion (`is_authenticated=false`), les agents sensibles refusent avant tout appel LLM.
- Base : MongoDB Atlas via Djongo. Embeddings : `models/gemini-embedding-001`, 3072 dimensions. Index vectoriel `help_articles_vector_index` (collection `help_articles`, 20 FAQ).
- Workflows n8n (tous Published) : Darimmo - Orchestrateur, - Agent Recherche, - Agent Annonces, - Agent Paiement, - Agent Communication, - FAQ Ingestion, - Test Classification.
- Webhooks : orchestrateur `darimmo-ai-chat`, test de classification `darimmo-test-classify` (URL de production `/webhook/...`, pas `/webhook-test/...`).

## 3. Emplacements sur la machine

Racine : `C:\Users\amine\Downloads\darimmo-projet-complet-main\darimmo-projet-complet-main\darimmo\` avec `Backend`, `frontend`, `venv`, `tests_ia`.
Les workflows n8n ont été modifiés à la main après import : **l'instance n8n est la source de vérité** (leurs fichiers JSON d'origine sont dépassés).

## 4. Anomalies trouvées et corrigées (matière pour « Difficultés rencontrées »)

1. Djongo ne traduit pas les filtres numériques/booléens : filtrage fait en Python dans `AnnonceViewSet.list()`, avec conversion Decimal128 -> decimal.Decimal.
2. Écarts doc / code : route `mes_annonces/` (underscore, pas tiret) ; champ `annonce` (pas `annonce_id`) pour contacter un propriétaire.
3. Normalisation des villes (Marrakech -> Marrakesh) par dictionnaire.
4. Bug messaging : message créé seulement à la première conversation (`if created:`).
5. APPEND_SLASH : URL sans `/` final provoque une erreur sur POST.
6. `localhost` résolu en IPv6 (`::1`) par Node.js alors que Django n'écoute qu'en IPv4 : utiliser `127.0.0.1`.
7. Agent Annonces : l'URL en dur du nœud HTTP masquait un code qui contenait `localhost` et `mes-annonces` ; découvert grâce aux tests end-to-end (vérité terrain obtenue séparément de l'agent). « Mes annonces » listait en fait les annonces publiques.
8. Index vectoriel configuré en 768 dimensions alors que le modèle produit 3072 : index recréé.
9. Text splitter qui séparait le titre et la réponse d'une FAQ : taille de chunk augmentée.
10. Nœud code en mode « chaque item » au lieu de « tous les items » : le contexte RAG était vide.
11. Switch n8n avec sorties dupliquées et sortie « Fallback » non activée : routage faux.
12. Respond to Webhook : expressions mal formées (`=` en trop) ; solution : « First Incoming Item ».

## 5. Résultats réels des tests (dossier `tests_ia`, archive `resultats_tests_ia.zip`)

**Classification d'intention** (70 messages, 10 classes x 7, fr 30 / darija 20 / en 10 / ar 10) :
accuracy 100 %, macro-F1 1.000, 100 % dans chaque langue ; entités : ville 6/6, type de bien 5/5, budget 4/4 ;
temps 1.19 s en moyenne (p95 1.31 s) ; 0 erreur technique ; 6 messages avec `needs_clarification` (4 hors-sujet, 2 « Je veux modifier mon annonce » sans identifiant malgré une confiance de 0.95).
Réserve : jeu écrit par nous, phrases simples, un seul run.

**End-to-end** (32 messages, lecture seule ; vérité terrain interrogée en direct dans l'API Django) :

| | Run 1 (avant correction) | Run 2 (après correction) |
|---|---|---|
| Réponses correctes | 27/32 (84.4 %) | 30/32 (93.8 %) |
| Recherche de biens | 10/10 | 10/10 |
| Mes annonces | 0/2 | 2/2 |
| Paiements | 1/2 | 1/2 |
| Refus sans connexion | 5/6 | 6/6 |
| FAQ (RAG) | 7/8 | 7/8 |
| Hors périmètre / faux jeton | 3/3 / 1/1 | 3/3 / 1/1 |
| Annonces inventées | 0 | 0 |
| Résultats de recherche exacts | 10/10 | 10/10 |
| Données inchangées avant/après | oui | oui |
| Temps de réponse moyen / p95 | 3.47 s / 5.75 s | 3.52 s / 6.35 s |
| Appels LLM par message (estimé) | 2.13 | 2.13 |
| Erreurs techniques | 0 | 0 |

Temps moyens par catégorie (run 2) : recherche 3.95 s, mes annonces 6.34 s, paiements 6.84 s, refus sans connexion 1.37 s, FAQ 3.84 s, hors périmètre 1.43 s.

Échecs et limites :
- #11/#12 (run 1) : bug de l'agent annonces (point 7), corrigé.
- #19 (run 1) : un refus sans connexion traité par la branche de repli ; réussi au run 2 sans aucune modification : **variabilité du LLM**, pas une correction.
- #14 (les 2 runs) : « wrini les transactions dyali » (darija) acheminé vers l'agent annonces au lieu de l'agent paiement.
- #25 (les 2 runs) : « Où retrouver mes conversations avec les propriétaires ? » classé `account_help`, qui n'a ni agent ni RAG.
- Les 2 messages « Je veux modifier mon annonce » sont interceptés avant l'agent : le drapeau `needs_clarification` est décidé par le modèle, pas par une règle fixe.
- Un seul run par version, 32 messages : un écart d'un cas n'est pas significatif.
- Recherche sémantique FAQ en darija latine moins fiable qu'en français (observé pendant le développement).
- Les actions de création/modification/suppression via l'agent n'ont pas été testées en automatique (risque pour les données) ; les URL de modification/suppression ont été corrigées mais jamais testées.

## 6. Fichiers déjà produits

- `tests_ia/` : `dataset_classification.csv`, `dataset_e2e.csv`, `run_classification_eval.py`, `run_e2e_eval.py`, dossiers de résultats (classification, run 1, run 2) avec CSV, JSON et figures PNG.
- `ai_integration/` : `n8n_client.py` (jeton JWT transmis, délai 45 s) et `views.py` (extraction du jeton) à placer dans `Backend\apps\ai_integration\`.
- `darimmo-faq.json` (20 FAQ), `Cahier_des_charges_Agent_IA_Darimmo_n8n.md`.
- Anciens JSON de workflows (dépassés par les modifications manuelles).

## 7. État de l'intégration Django -> n8n (étape 15)

- `n8n_client.py` et `views.py` remplacés ; `.env` contient `N8N_WEBHOOK_URL=http://127.0.0.1:5678/webhook/darimmo-ai-chat`.
- Constat : Django continuait pourtant d'appeler l'adresse d'exemple `your-n8n-instance.com` (il ne lit apparemment pas ce `.env`, ou une variable système prime). Contournement utilisé : définir `$env:N8N_WEBHOOK_URL=...` dans le terminal qui lance `runserver`.
- L'étudiant indique que le test Thunder Client (`POST /api/ai/chat/`) et le site fonctionnent avec ce contournement.
- **Non résolu** : cause de la non-lecture du `.env` (le contournement disparaît à la fermeture du terminal). Diagnostic à faire : lire `settings.py` (lignes N8N / chargement du `.env`), la variable système, et lister tous les fichiers `.env`.

## 8. Points de sécurité à traiter après la soutenance

- Changer : mot de passe du compte admin de test, mot de passe MongoDB Atlas (à mettre à jour dans le `.env` ET dans le credential n8n), clé API Gemini (credentials n8n) ; ces valeurs sont apparues dans des captures ou des collages pendant les sessions.
- Retirer `tlsAllowInvalidCertificates=true` de la chaîne MongoDB si possible ; changer `SECRET_KEY`.
- Le webhook n8n n'est pas protégé par un jeton (accessible en local seulement) : à mentionner comme limite.
- Le `user_context` (ville, rôle, préférences) est inclus dans le prompt envoyé à Gemini ; le jeton JWT, lui, n'est jamais envoyé au LLM.

## 9. À faire (reprendre ici)

1. **Étape 15 (fin)** : résoudre durablement la lecture du `.env`, puis tester sur le site « Montre-moi mes annonces » et une recherche (cartes de recommandations).
2. Exporter tous les workflows n8n en JSON (annexes, sauvegarde) et faire un commit git du code Django modifié.
3. **Rapport Word** (format FSAC : consignes du PDF à ré-uploader ; d'après le résumé initial : Calibri/Times 12 pt, interligne 1.5, marges 2.5/3 cm, 100 pages maximum hors annexes, résumé en français, anglais et arabe) : chapitre sur l'agent IA avec les chiffres ci-dessus, tableaux, figures (les PNG des résultats), diagrammes d'architecture ; captures d'écran à insérer par l'étudiant. Les fichiers Word de page de garde et de dernière page sont à ré-uploader.
4. Présentation PowerPoint.
5. Optionnel : relancer le run end-to-end 2 fois pour mesurer la variabilité ; protéger le webhook n8n par un jeton.

## 10. Lacunes connues de l'agent (candidates pour « une chose oubliée »)

L'étudiant a indiqué vouloir examiner dans la nouvelle conversation « une autre chose oubliée dans l'agent » (non précisée à la fin de cette session). Lacunes connues, vérifiées dans le code ou les tests :

1. **Pas de mémoire de conversation dans les sous-agents.** Django envoie `conversation_history`, mais seul le classificateur de l'orchestrateur l'utilise. Les prompts des agents ne contiennent que le message courant. Conséquences probables (à vérifier) : après « Confirmez-vous la suppression de l'annonce 5 ? », la réponse « oui, confirme » ne suffit pas à l'agent pour supprimer ; une question de suivi comme « et à Rabat ? » n'est pas comprise.
2. **`account_help` n'a pas d'agent** : réponse statique générique (cas du test #25).
3. **Endpoint `/api/ai/conseils-marche/`** : il envoie une phrase qui est classée `general_help` et passe par la FAQ ; jamais testé, probablement « aucun article pertinent ».
4. **Webhook n8n non protégé** par un jeton (accès local uniquement).
5. **Création / modification / suppression via l'agent jamais testées** de bout en bout (à tester une seule fois, sur une annonce de test créée pour cela).
6. **Cause de la non-lecture du `.env` par Django non résolue** (section 7).
