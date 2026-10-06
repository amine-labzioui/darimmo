"""Contenu du rapport — chapitres 4 à 6, conclusion, bibliographie, annexes."""

from contenu_1 import num, pct, sec
from donnees_rapport import TESTS

CAT = [("search", "Recherche de biens"), ("my_listings", "Mes annonces"), ("payment", "Paiements"),
       ("security_refusal", "Refus sans connexion"), ("security_forged", "Faux jeton"),
       ("faq", "FAQ (RAG)"), ("out_of_scope", "Hors périmètre")]


def chapitre_4(R, D):
    R.chapter_page(4, "Réalisation")
    R.h2("4.1 Introduction")
    R.p("Ce chapitre présente ce qui a été construit : l'API, l'interface, l'assistant, le paiement simulé et "
        "l'espace d'administration. Les emplacements marqués « CAPTURE » sont à remplacer par des captures d'écran.")

    R.h2("4.2 Backend")
    R.p("Le backend est un projet Django découpé en neuf applications. Le tableau 4 donne le rôle de chacune et "
        "le préfixe de ses adresses.")
    R.table(
        ["Application", "Préfixe", "Rôle"],
        [
            ["users", "/api/users/", "Comptes, connexion, profil, favoris ; permissions par rôle."],
            ["annonces", "/api/annonces/", "Annonces et photos, recherche filtrée, changement de statut."],
            ["client_dashboard", "/api/client-dashboard/", "Résumé du tableau de bord, demandes de visite, recherches enregistrées."],
            ["agency_dashboard", "/api/agency-dashboard/", "Vues propres à l'espace agence."],
            ["messaging", "/api/messaging/", "Conversations, messages, notifications."],
            ["payments", "/api/payments/", "Formules de boost, paiement, transactions, facture PDF."],
            ["analytics", "/api/analytics/", "Journal des vues et des recherches, statistiques."],
            ["admin_dashboard", "/api/admin-dashboard/", "Statistiques globales, utilisateurs, modération, demandes de visite."],
            ["ai_integration", "/api/ai/", "Point d'entrée de l'assistant, historique des conversations."],
        ],
        "Applications du backend", "backend/darimmo_project/urls.py et backend/apps", widths=[3.6, 4.4, 7.5],
    )
    R.p(
        "L'authentification repose sur des jetons JWT : un jeton d'accès de courte durée et un jeton de "
        "rafraîchissement. Les permissions sont vérifiées dans les vues. Par exemple, modifier une annonce ou "
        "changer son statut exige d'en être le propriétaire ou un administrateur.",
        "La recherche d'annonces a demandé un traitement particulier. Djongo, la couche qui relie Django à MongoDB, "
        "ne traduit pas correctement les filtres numériques et booléens. Les filtres textuels (ville, type de bien, "
        "type de transaction) sont donc appliqués par la base, et les filtres de prix, de surface, de chambres et "
        "d'équipements sont appliqués ensuite en Python. Ce point est repris au chapitre 6.",
    )
    R.p("Le tableau 5 liste les points d'accès les plus utilisés par l'interface et par les agents.")
    R.table(
        ["Méthode et adresse", "Usage", "Accès"],
        [
            ["POST /api/users/login/", "Connexion, renvoie les jetons et le profil", "Public"],
            ["GET /api/annonces/", "Recherche d'annonces publiées, avec filtres", "Public"],
            ["GET /api/annonces/{id}/", "Détail d'une annonce", "Public"],
            ["GET /api/annonces/mes_annonces/", "Annonces de l'utilisateur connecté", "Connecté"],
            ["POST /api/annonces/{id}/publier/, marquer_vendue/, marquer_louee/, archiver/", "Changement de statut", "Propriétaire ou administrateur"],
            ["GET /api/payments/transactions/", "Transactions de l'utilisateur (toutes pour l'administrateur)", "Connecté"],
            ["POST /api/ai/chat/", "Message envoyé à l'assistant", "Public (jeton transmis s'il existe)"],
            ["GET /api/admin-dashboard/stats/", "Statistiques globales", "Administrateur"],
        ],
        "Principaux points d'accès de l'API", "backend/apps/*/views.py et urls.py", widths=[6.5, 5.5, 3.5],
    )

    R.h2("4.3 Frontend")
    R.p(
        "L'interface est une application React. Elle comprend des pages publiques (accueil, recherche, détail d'une "
        "annonce, assistant, connexion, inscription) et trois espaces protégés par rôle : `/client`, `/agence` et "
        "`/admin`. Un client HTTP unique ajoute le jeton d'accès à chaque requête et le renouvelle quand il expire.",
        "La page de recherche combine un panneau de filtres et une grille de cartes d'annonces. La page de détail "
        "présente la galerie, les caractéristiques, la localisation sur une carte et le bloc du vendeur, avec les "
        "boutons de contact et de demande de visite.",
    )
    R.capture("page /recherche avec des filtres actifs (ville, type de bien) et la grille de cartes d'annonces",
              "Page de recherche des annonces")
    R.capture("page /annonces/{id} d'une annonce publiée : galerie, titre, prix, cartes de caractéristiques, bloc du vendeur",
              "Page de détail d'une annonce")
    R.p(
        "Le propriétaire gère ses annonces depuis « Mes annonces ». La page « Modifier l'annonce » regroupe le "
        "formulaire, le changement de statut et la mise en avant. Les boutons dépendent du statut : une annonce "
        "publiée peut être marquée vendue (vente) ou louée (location), ou archivée ; une annonce vendue, louée ou "
        "archivée peut être republiée.",
    )
    R.capture("page « Modifier l'annonce » d'une annonce publiée : badge de statut, boutons « Marquer comme vendue » et « Archiver », bloc « Booster cette annonce »",
              "Modification d'une annonce : statut et mise en avant")

    R.h2("4.4 Assistant IA")
    R.h3("4.4.1 Du site à n8n")
    R.p(
        "La page « Assistant IA » envoie le message à `POST /api/ai/chat/`. Django enregistre le message, ajoute "
        "l'historique de la conversation, le contexte de l'utilisateur et son jeton, puis appelle le webhook de "
        "l'orchestrateur avec un délai maximal de 45 secondes. À la réponse, Django enregistre le texte et les "
        "métadonnées, vérifie que les annonces recommandées existent et sont publiées, puis renvoie le tout à "
        "l'interface. Les réponses sont affichées avec un rendu Markdown limité et sûr ; une annonce recommandée "
        "apparaît sous forme de carte cliquable.",
    )
    R.capture("page /assistant-ia : question « Je cherche un appartement à Casablanca » et réponse avec les cartes d'annonces recommandées",
              "Assistant IA : recherche d'un bien")
    R.h3("4.4.2 Orchestrateur")
    R.p(
        "L'orchestrateur est un workflow de 17 nœuds. Il construit le prompt de classification, appelle Gemini, "
        "lit le JSON renvoyé, applique la règle de confiance, puis aiguille le message. Le prompt décrit les "
        "11 intentions et insiste sur deux distinctions difficiles : l'aide sur son compte contre l'aide générale, "
        "et la question de marché contre la recherche d'annonces. Un extrait figure en annexe B.",
    )
    R.h3("4.4.3 Agents à appel de fonction")
    R.p(
        "Quatre agents suivent le même schéma : vérifier que l'utilisateur est connecté si l'action l'exige, "
        "demander au modèle quelle fonction appeler, exécuter l'appel sur l'API Django, puis demander au modèle "
        "de rédiger la réponse à partir du résultat. Le tableau 6 les présente.",
    )
    wf = {w["name"]: w["n"] for w in D["workflows"]}
    R.table(
        ["Agent", "Nœuds", "Intentions", "Outil appelé", "Connexion"],
        [
            ["Recherche", wf["Agent Recherche"], "search_property", "Recherche d'annonces publiées avec filtres", "Non requise"],
            ["Annonces", wf["Agent Annonces"], "create, update, delete, my_listings", "Création, modification, suppression, liste de ses annonces", "Requise"],
            ["Paiement", wf["Agent Paiement"], "payment_status", "Liste de ses transactions", "Requise"],
            ["Communication", wf["Agent Communication"], "contact_owner", "Lecture de l'annonce puis envoi d'un message au propriétaire", "Requise"],
            ["Marché", wf["Agent Marché"], "market_advice", "Recherche web (Tavily), sans appel à l'API", "Non requise"],
        ],
        "Agents de l'assistant", "n8n_workflows/*.json", widths=[2.6, 1.4, 3.6, 5.6, 2.3],
    )
    R.p("Pour ces agents, un utilisateur non connecté reçoit un refus construit par du code, sans appel au modèle. "
        "La création, la modification et la suppression d'une annonce par l'assistant existent mais n'ont pas été "
        "testées en automatique, pour ne pas modifier les données ; nous y revenons dans les limites.")
    R.h3("4.4.4 Questions générales par RAG")
    R.p(
        "Les questions générales (« comment créer un compte ? ») sont traitées dans l'orchestrateur lui-même. "
        "Un workflow d'ingestion a d'abord enregistré les 20 articles de la FAQ avec leur vecteur. À chaque "
        "question, les 3 articles les plus proches sont récupérés, puis le modèle répond avec une consigne stricte : "
        "s'appuyer uniquement sur ces articles, et dire clairement quand aucun ne convient.",
    )
    R.h3("4.4.5 Agent Marché")
    R.p(
        "L'Agent Marché répond aux questions de prix au mètre carré. Il travaille en quatre temps. Il reformule "
        "d'abord la question en requête courte (« prix m2 appartement Maarif Casablanca ») et détecte la langue ; "
        "cette étape a été ajoutée parce que les questions en darija ne trouvaient pas les bonnes pages. Il lance "
        "ensuite une recherche Tavily limitée à cinq sites immobiliers marocains, qui renvoie cinq extraits. "
        "Il demande alors une synthèse au modèle avec des règles précises : ne reprendre que des chiffres présents "
        "dans une source, préférer les référentiels de prix aux annonces individuelles, ne pas mélanger appartements "
        "et villas, répondre dans la langue détectée. Enfin, il nettoie la réponse et enregistre les sources citées.",
        "Deux choix sont à signaler. Sans restriction de sites, la première recherche renvoyait des pages de "
        "dictionnaires sans rapport ; la liste de domaines a réglé le problème. Et la réponse montrée au client ne "
        "contient ni lien ni nom de site : c'est un choix de notre part, pour ne pas faire la promotion de sites "
        "concurrents. Les sources restent consultables dans les métadonnées.",
    )
    R.capture("page /assistant-ia : question « combien le mètre carré à Maarif Casablanca ? » et réponse de l'Agent Marché (prix moyen et fourchette)",
              "Assistant IA : question sur les prix du marché")

    R.h2("4.5 Paiement simulé et facture")
    R.p(
        "La mise en avant d'une annonce, ou boost, est payante. L'utilisateur choisit une formule ; l'API crée une "
        "transaction et renvoie l'adresse d'une page de paiement. Dans ce projet, le paiement par carte CMI est "
        "simulé : une page reproduit l'étape de paiement et confirme la transaction, sans échange avec une banque. "
        "Une fois le paiement réussi, l'annonce est mise en avant jusqu'à une date de fin, et un badge « Premium » "
        "s'affiche tant que cette date n'est pas dépassée et que l'annonce est publiée.",
        "Une facture en PDF est disponible pour chaque paiement réussi. Elle porte un numéro de la forme "
        "FCT-année-identifiant, la formule, la période, le montant et la mention « CMI (simulation) ». "
        "Elle précise qu'il s'agit d'un document académique sans valeur fiscale.",
    )
    R.capture("simulateur de paiement CMI, puis facture PDF d'une transaction réussie (numéro FCT-…, formule, période, montant)",
              "Paiement simulé et facture")

    R.h2("4.6 Espace administrateur")
    R.p(
        "L'espace administrateur comprend cinq pages. La vue d'ensemble affiche six compteurs et deux graphiques "
        "(répartition des utilisateurs, statut des annonces). La page des utilisateurs permet de vérifier, de "
        "suspendre ou de réactiver un compte. La modération classe les annonces par statut ; l'administrateur peut "
        "approuver ou rejeter une annonce en attente, archiver une annonce publiée et la republier. La page des "
        "transactions affiche le revenu, les compteurs par statut et la liste paginée. La dernière page suit les "
        "demandes de visite.",
    )
    R.capture("page /admin : six cartes de compteurs et les deux graphiques (répartition des utilisateurs, statut des annonces)",
              "Espace administrateur : vue d'ensemble")
    R.capture("page /admin/annonces : onglets par statut, liste des annonces publiées avec le bouton « Archiver »",
              "Espace administrateur : modération des annonces")
    R.h2("4.7 Conclusion")
    R.p("La plateforme couvre le parcours complet d'une annonce, de sa publication à sa mise en avant, et "
        "l'assistant s'y branche sans accès direct aux données. Il reste à mesurer ce que vaut cet assistant : "
        "c'est l'objet du chapitre suivant.")


def chapitre_5(R, D, F):
    c1, c2, e1, e2, m1, m2 = D["cls1"], D["cls2"], D["e1"], D["e2"], D["m1"], D["m2"]
    fid, stab, p1, p2, aud = D["fid"], D["stab"], D["pres1"], D["pres2"], D["audit"]
    n_e = e2["run_info"]["n_messages"]
    n_m = m1["run_info"]["n_messages"]

    R.chapter_page(5, "Tests et évaluation")
    R.h2("5.1 Introduction")
    R.p("Ce chapitre présente les tests de l'assistant, puis l'audit de l'interface. Tous les chiffres sont lus "
        "dans les fichiers de résultats du dossier `tests_ia` ; la source de chaque tableau est indiquée.")

    R.h2("5.2 Méthodologie")
    R.p(
        "Nous avons mené trois évaluations de l'assistant, de la plus simple à la plus complète. La première mesure "
        "seulement la classification d'intention, par un webhook de test qui s'arrête après cette étape. "
        "La deuxième envoie des messages à l'orchestrateur réel et juge la réponse finale : ce sont les tests de "
        "bout en bout. La troisième porte sur l'Agent Marché, avec une annotation manuelle.",
        "Trois principes limitent les biais. La **vérité terrain** des recherches n'est pas écrite à la main : juste "
        "avant chaque test, le script interroge l'API Django avec les mêmes filtres et compare les annonces "
        "renvoyées par l'agent à celles de la base. Les tests sont en **lecture seule**, et un instantané des "
        "données est pris avant et après pour prouver que rien n'a changé. Enfin, les messages couvrent quatre "
        "langues : français, darija en lettres latines, arabe et anglais.",
        "Les métriques sont le taux de réponses correctes, la précision, le rappel et le score F1 par intention, "
        "le temps de réponse (moyenne et 95e centile, noté p95) et le nombre d'appels au modèle par message.",
    )

    R.h2("5.3 Classification d'intention")
    R.p(f"La première version du jeu de test comptait {c1['n_valid']} messages pour 10 intentions. Après l'ajout de "
        f"l'intention `market_advice`, la seconde en compte {c2['n_valid']} pour 11 intentions, soit 7 messages par "
        "intention. Le tableau 7 compare les deux passages.")
    lang = lambda c: " / ".join(str(c["accuracy_by_language"][k]["total"]) for k in ("fr", "dar", "ar", "en"))
    ent = lambda c: ", ".join(f"{c['entity_extraction'][k]['correct']}/{c['entity_extraction'][k]['total']}" for k in ("city", "property_type", "budget_max"))
    R.table(
        ["Mesure", "Version 1", "Version 2"],
        [
            ["Messages / intentions", f"{c1['n_valid']} / 10", f"{c2['n_valid']} / 11"],
            ["Messages par langue (français / darija / arabe / anglais)", lang(c1), lang(c2)],
            ["Exactitude", pct(c1["accuracy_on_valid"], 0), pct(c2["accuracy_on_valid"], 0)],
            ["F1 macro", num(c1["macro_avg"]["f1"], 3), num(c2["macro_avg"]["f1"], 3)],
            ["Entités correctes (ville, type de bien, budget)", ent(c1), ent(c2)],
            ["Temps de réponse moyen / p95", f"{sec(c1['latency']['mean_ms'])} / {sec(c1['latency']['p95_ms'])}",
             f"{sec(c2['latency']['mean_ms'])} / {sec(c2['latency']['p95_ms'])}"],
            ["Messages avec demande de clarification", c1["clarification_requested"]["count"], c2["clarification_requested"]["count"]],
            ["Erreurs techniques", c1["n_errors"], c2["n_errors"]],
        ],
        "Résultats de la classification d'intention",
        "tests_ia/resultats_classification et resultats_classification_v2 (classification_metrics.json)", widths=[7.5, 4.0, 4.0],
    )
    R.p("Toutes les intentions sont reconnues, dans les quatre langues, et l'ajout de la onzième intention n'a pas "
        f"dégradé les dix autres. La figure {R.n_fig + 1} donne la matrice de confusion de la version 2 : toutes les "
        f"valeurs sont sur la diagonale. La figure {R.n_fig + 2} montre les temps de réponse, proches de 1,2 seconde.")
    R.figure(TESTS / "resultats_classification_v2" / "fig_confusion_matrix.png",
             "Matrice de confusion de la classification (version 2, 77 messages)",
             "tests_ia/resultats_classification_v2/fig_confusion_matrix.png", width=11.5)
    R.figure(TESTS / "resultats_classification_v2" / "fig_temps_reponse.png",
             "Temps de réponse de la classification (version 2)",
             "tests_ia/resultats_classification_v2/fig_temps_reponse.png", width=11.5)
    R.p("Ce résultat de 100 % doit être lu avec prudence. Le jeu de test a été écrit par nous, avec des phrases "
        "simples, en même temps que le prompt ; il ne contient pas de fautes de frappe ni de messages volontairement "
        "ambigus. Il montre que les intentions sont bien séparées sur des cas nets, pas que le classificateur est "
        "sans erreur. Les tests de bout en bout ci-dessous en donnent la preuve : deux messages y sont mal aiguillés.")

    R.h2("5.4 Tests de bout en bout")
    R.p(f"Le jeu de bout en bout compte {n_e} messages répartis en sept catégories. Nous l'avons exécuté deux fois : "
        "le premier passage a révélé un défaut de l'agent des annonces, corrigé avant le second. Le tableau 8 "
        "compare les deux passages.")
    rows = []
    for key, label in CAT:
        a, b = e1["by_category"].get(key), e2["by_category"].get(key)
        if a and b:
            rows.append([label, a["n"], f"{a['passed']}/{a['n']}", f"{b['passed']}/{b['n']}",
                         sec(b["latency_mean_ms"]) if b["latency_mean_ms"] else "—",
                         num(b["avg_llm_calls"], 2) if b["avg_llm_calls"] is not None else "—"])
    rows.append(["**Total**", n_e, f"**{e1['n_passed']}/{n_e}** ({pct(e1['pass_rate_overall'])})",
                 f"**{e2['n_passed']}/{n_e}** ({pct(e2['pass_rate_overall'])})",
                 sec(e2["latency"]["mean_ms"]), num(e2["avg_llm_calls_per_message"], 2)])
    R.table(["Catégorie", "Messages", "Passage 1", "Passage 2", "Temps moyen (passage 2)", "Appels LLM (passage 2)"], rows,
            "Tests de bout en bout : réponses correctes par catégorie",
            "tests_ia/resultats_e2e_run1_avant_correction et resultats_e2e_run2_apres_correction (e2e_metrics.json)",
            widths=[4.0, 1.8, 2.6, 2.6, 2.5, 2.0])
    integ = lambda e: ("oui" if e["data_integrity"]["unchanged"] else "non") if e.get("data_integrity") else "non mesuré"
    R.p("Le tableau 9 rassemble les mesures de fiabilité et de sécurité des deux passages.")
    R.table(
        ["Mesure", "Passage 1", "Passage 2"],
        [
            ["Annonces inventées dans les recherches", f"0 sur {e1['no_invented_listing']['total']}", f"0 sur {e2['no_invented_listing']['total']}"],
            ["Résultats de recherche identiques à ceux de l'API", f"{e1['exact_search_results']['correct']}/{e1['exact_search_results']['total']}", f"{e2['exact_search_results']['correct']}/{e2['exact_search_results']['total']}"],
            ["Refus corrects sans connexion", f"{e1['unauthenticated_refusal']['correct']}/{e1['unauthenticated_refusal']['total']}", f"{e2['unauthenticated_refusal']['correct']}/{e2['unauthenticated_refusal']['total']}"],
            ["Faux jeton : aucune donnée renvoyée", f"{e1['forged_token_no_leak']['correct']}/{e1['forged_token_no_leak']['total']}", f"{e2['forged_token_no_leak']['correct']}/{e2['forged_token_no_leak']['total']}"],
            ["Appels d'outils réussis", f"{e1['tool_call_success']['correct']}/{e1['tool_call_success']['total']}", f"{e2['tool_call_success']['correct']}/{e2['tool_call_success']['total']}"],
            ["Données inchangées avant et après le passage", integ(e1), integ(e2)],
            ["Temps de réponse moyen / p95", f"{sec(e1['latency']['mean_ms'])} / {sec(e1['latency']['p95_ms'])}", f"{sec(e2['latency']['mean_ms'])} / {sec(e2['latency']['p95_ms'])}"],
            ["Erreurs techniques", e1["n_technical_errors"], e2["n_technical_errors"]],
        ],
        "Tests de bout en bout : fiabilité, sécurité et temps de réponse",
        "tests_ia/resultats_e2e_run1_avant_correction et resultats_e2e_run2_apres_correction (e2e_metrics.json)", widths=[7.5, 4.0, 4.0],
    )
    R.p("Les dix recherches renvoient exactement les annonces de l'API, sans aucune invention. Les demandes "
        f"protégées sont refusées sans connexion, et un jeton falsifié n'obtient aucune donnée. La figure {R.n_fig + 1} "
        f"montre le taux par catégorie et la figure {R.n_fig + 2} les temps de réponse.")
    R.figure(TESTS / "resultats_e2e_run2_apres_correction" / "fig_e2e_taux_par_categorie.png",
             "Réponses correctes par catégorie (passage 2)",
             "tests_ia/resultats_e2e_run2_apres_correction/fig_e2e_taux_par_categorie.png", width=11.5)
    R.figure(TESTS / "resultats_e2e_run2_apres_correction" / "fig_e2e_latence_par_categorie.png",
             "Temps de réponse par catégorie (passage 2)",
             "tests_ia/resultats_e2e_run2_apres_correction/fig_e2e_latence_par_categorie.png", width=11.5)
    R.p("Les temps suivent le nombre d'appels au modèle : un refus ou une réponse hors périmètre demande un seul "
        "appel et environ 1,4 seconde ; une recherche en demande trois et près de 4 secondes ; les demandes sur "
        "ses annonces ou ses paiements dépassent 6 secondes.")
    R.h3("5.4.1 Analyse des échecs")
    R.p(
        "Le premier passage a mis au jour un vrai défaut. Pour « mes annonces », l'agent listait les annonces "
        "publiques au lieu de celles de l'utilisateur : l'adresse réellement appelée, écrite en dur dans un nœud, "
        "n'était pas celle que le code préparait. Ce défaut était invisible à l'œil, car l'agent répondait avec de "
        "vraies annonces ; c'est la comparaison avec la vérité terrain qui l'a révélé. Après correction, les deux "
        "cas réussissent.",
        "Un autre cas du premier passage, un refus sans connexion, a réussi au second sans aucune modification. "
        "Il s'agit de la variabilité du modèle et non d'une correction ; nous ne le comptons pas comme un progrès.",
        "Deux échecs subsistent. Le message en darija « wrini les transactions dyali » est envoyé à l'agent des "
        "annonces au lieu de l'agent des paiements. La question « Où retrouver mes conversations avec les "
        "propriétaires ? » est classée en aide sur le compte, une intention qui n'a ni agent ni base de "
        "connaissances. Ces deux cas viennent de la classification, ce qui confirme la réserve de la section 5.3.",
    )

    R.h2("5.5 Agent Marché")
    R.h3("5.5.1 Vérifications pendant le développement")
    R.p("Pendant la mise au point, nous avons vérifié à la main cinq réponses de la version finale : chaque chiffre "
        "a été recherché dans le texte de la source citée. Le tableau 10 les présente.")
    R.table(
        ["Message", "Langue", "Réponse", "Source citée"],
        [
            ["combien le metre m² a maarif casa", "français", "14 888 DH/m² (7 901 – 21 021)", "Référentiel du quartier Maarif"],
            ["ch7al taman dyal metre f Maarif f casa", "darija", "Mêmes chiffres, réponse en darija", "Référentiel du quartier Maarif"],
            ["What is the price per m2 for a villa in Anfa, Casablanca?", "anglais", "26 457 DH/m², mise à jour 29/01/2026", "Page « Anfa », ligne des villas"],
            ["ch7al taman dyal metre f Gauthier", "darija", "16 587 DH/m² (8 916 – 24 234)", "Référentiel du quartier Gauthier"],
            ["combien coûte un appartement à Rabat ?", "français", "12 392 DH/m²", "Page nationale, ligne Rabat"],
        ],
        "Réponses de l'Agent Marché vérifiées à la main pendant le développement",
        "docs/notes_agent_marche_et_session.md, section 5", widths=[5.6, 1.8, 4.3, 3.8],
    )
    R.p("Ces vérifications ne constituaient pas une évaluation : cinq questions, un seul passage. Nous avons donc "
        "construit un jeu de test dédié.")
    R.h3("5.5.2 Jeu de test et vérifications automatiques")
    R.p(
        f"Le jeu compte {n_m} messages : 9 en français, 5 en darija, 2 en anglais et 2 en arabe. Six portent sur un "
        "quartier déjà vérifié, où un chiffre est attendu. Neuf portent sur un lieu dont nous ignorions la "
        "couverture : l'agent peut donner un chiffre ou déclarer qu'il n'en a pas. Deux ne doivent recevoir aucun "
        "chiffre (un quartier inventé, un lieu hors du Maroc). Le dernier est une recherche de bien, qui ne doit "
        "pas partir vers l'Agent Marché.",
        "Le script vérifie le comportement : bon agent, absence d'erreur technique, présence ou absence d'un chiffre "
        "selon le cas, source citée quand un chiffre est donné, sources issues des sites autorisés, aucun nom de "
        "site dans la réponse. Nous avons exécuté ce jeu deux fois, sans rien modifier entre les deux. "
        "Le tableau 11 donne les résultats.",
    )
    mk1, mk2 = m1["market"]["par_verification"], m2["market"]["par_verification"]
    frac = lambda d, k: f"{d[k]['correct']}/{d[k]['total']}" if k in d else "—"
    R.table(
        ["Vérification", "Passage 1", "Passage 2"],
        [
            ["Réponses correctes", f"{m1['n_passed']}/{n_m}", f"{m2['n_passed']}/{n_m} ({pct(m2['pass_rate_overall'])})"],
            ["Bon agent", frac(mk1, "bon_agent"), frac(mk2, "bon_agent")],
            ["Aucune erreur technique", frac(mk1, "aucune_erreur_technique"), frac(mk2, "aucune_erreur_technique")],
            ["Chiffre présent (6 cas où il est attendu)", frac(mk1, "chiffre_present"), frac(mk2, "chiffre_present")],
            ["Aucun chiffre (2 cas)", frac(mk1, "aucun_chiffre"), frac(mk2, "aucun_chiffre")],
            ["Source citée quand un chiffre est donné", frac(mk1, "source_citee"), frac(mk2, "source_citee")],
            ["Sources citées issues des sites autorisés", frac(mk1, "sources_citees_autorisees"), frac(mk2, "sources_citees_autorisees")],
            ["Aucun nom de site ni adresse web", frac(mk1, "aucun_nom_de_site_ni_url"), frac(mk2, "aucun_nom_de_site_ni_url")],
            ["Langue détectée correcte (hors taux)", frac(mk1, "langue_detectee_correcte"), frac(mk2, "langue_detectee_correcte")],
            ["Temps de réponse moyen / p95", f"{sec(m1['latency']['mean_ms'])} / {sec(m1['latency']['p95_ms'])}", f"{sec(m2['latency']['mean_ms'])} / {sec(m2['latency']['p95_ms'])}"],
        ],
        "Agent Marché : vérifications automatiques sur deux passages",
        "tests_ia/resultats_e2e_marche_run1 et resultats_e2e_marche_run2 (e2e_metrics.json)", widths=[7.5, 4.0, 4.0],
    )
    R.p(
        "Le premier passage réussit tous les contrôles ; le second en échoue trois. Pour « villa à Anfa », en "
        "français et en anglais, l'agent ne donne plus de chiffre. Pour Malabata, il donne quatre chiffres sans "
        "citer de source. Nous avons contrôlé ce dernier cas : les quatre chiffres figurent bien dans les extraits "
        "lus par le modèle. Ce n'est pas une invention, mais la réponse n'est plus traçable.",
        f"Sur l'ensemble, {p1['chiffres']} chiffres apparaissent dans les réponses du premier passage et "
        f"{p2['chiffres']} dans celles du second. **Aucun n'est absent des extraits lus par le modèle.** "
        f"Sur {p1['reponses_avec_chiffre'] + p2['reponses_avec_chiffre']} réponses contenant un chiffre, "
        f"{p1['reponses_sans_citation'] + p2['reponses_sans_citation']} seule est sans citation. "
        "Une question de marché demande environ 7 secondes, soit près du double d'une recherche de bien.",
    )
    R.h3("5.5.3 Fidélité des chiffres")
    fc, fr_ = fid["chiffres"], fid["reponses_avec_chiffre"]
    R.p(
        "Qu'un chiffre existe dans la source ne suffit pas : il peut être attribué au mauvais quartier ou au mauvais "
        "type de bien. Nous avons donc annoté à la main chaque chiffre du premier passage, avec une seule règle : "
        "juger d'après l'extrait cité seul. Un chiffre est « oui » s'il y figure pour le même lieu, le même type de "
        "bien et avec le même sens ; « partiel » s'il y figure mais que la réponse change l'un de ces éléments ; "
        "« non » s'il n'y figure pas. La langue et la vraisemblance du prix sont notées en commentaire, hors note.",
        f"Résultat : {fc['oui']['n']} chiffres sur {fc['total']} sont fidèles ({pct(fc['oui']['taux'])}), "
        f"{fc['partiel']['n']} le sont partiellement ({pct(fc['partiel']['taux'])}) et aucun n'est infidèle. "
        f"Au niveau des réponses, {fr_['oui']['n']} sur {fr_['total']} sont entièrement fidèles et "
        f"{fr_['partiel']['n']} partiellement. La figure {R.n_fig + 1} résume ces résultats avec la stabilité entre les deux passages.",
    )
    R.figure(F["marche"], "Agent Marché : fidélité des chiffres (passage 1) et stabilité entre les deux passages",
             "tests_ia/resultats_e2e_marche_run1 (fidelite_metrics.json) et comparaison des fichiers e2e_raw.jsonl des deux passages", width=15.0)
    R.p("Les cas partiels ont trois origines. Pour « villa à Anfa », la source ne donne qu'un prix moyen pour tout "
        "Casablanca, sous un titre qui mentionne Anfa, et l'agent ne signale pas cette ambiguïté. Pour « Agdal », "
        "le chiffre est celui du sous-quartier Haut Agdal. Pour Bouskoura, l'agent a choisi le prix des villas alors "
        "que le message ne précisait pas le type de bien et que la règle prévoit l'appartement par défaut. "
        "Enfin, dans une réponse en arabe, les deux bornes de la fourchette sont présentées comme une moyenne.")
    R.h3("5.5.4 Stabilité entre les deux passages")
    R.p(
        f"Sur les {stab['n']} cas traités par l'agent, {stab['comportement']} gardent le même comportement (chiffre "
        f"ou absence de chiffre), {stab['source']} citent la même source et {stab['chiffres']} donnent les mêmes "
        f"chiffres. Au total, **{stab['identique']} cas sur {stab['n']}** donnent exactement la même réponse.",
        f"Nous avons séparé deux causes. Dans {stab['extraits_differents']} cas, la recherche web n'a pas renvoyé "
        f"les mêmes extraits : en moyenne {num(stab['urls_communes_moyenne'], 1)} pages sur 5 sont communes aux "
        f"deux passages, et la réponse change dans {stab['extraits_diff_reponse_diff']} de ces cas. À l'inverse, "
        f"dans les {stab['extraits_identiques']} cas où les extraits sont strictement identiques, la réponse ne "
        "change jamais. L'instabilité vient donc d'abord de la recherche web, et non du modèle.",
        "Deux observations complètent ce constat. Le référentiel d'un quartier peut disparaître des résultats d'un "
        "passage à l'autre, ou être remplacé par celui d'un autre site qui donne un prix différent (14 256 puis "
        "19 900 DH/m² pour le même quartier). Et nous avons relevé une différence systématique entre les langues : "
        "pour Agdal, la question en français et la question en darija reçoivent les mêmes cinq extraits, mais "
        "seule la première obtient un chiffre, aux deux passages.",
    )

    R.h2("5.6 Audit et corrections de l'interface et de l'API")
    R.p(
        "Avant la démonstration, nous avons audité l'interface page par page, puis l'espace administrateur. "
        "Chaque problème a été appuyé par une preuve (ligne de code, message d'erreur, capture), corrigé seul, "
        "puis testé dans le navigateur. Le détail figure dans `docs/audit_frontend.md` et en annexe D. "
        f"Le tableau 12 en donne la synthèse : {aud['total']} lignes de correction, dont {aud['tested']} avec au "
        "moins un test de notre part dans le navigateur ; les autres sont vérifiées par compilation ou par script.",
    )
    R.table(["Groupe de corrections", "Lignes", "Dont testées dans le navigateur"],
            [[g[0], g[1], g[2]] for g in aud["groups"]] + [["**Total**", f"**{aud['total']}**", f"**{aud['tested']}**"]],
            "Synthèse de l'audit de l'interface et de l'API", "docs/audit_frontend.md (tableaux des sections 3, 9 et 10)",
            widths=[8.5, 2.5, 4.5])
    R.p("Quatre familles de problèmes ressortent. Le tableau 13 en donne des exemples.")
    R.table(
        ["Famille", "Exemple", "Correction"],
        [
            ["Sécurité", "Le jeton JWT s'affichait dans la console du navigateur ; un utilisateur connecté pouvait marquer comme vendue l'annonce d'un autre.", "Journaux retirés ; action réservée au propriétaire ou à l'administrateur."],
            ["Erreurs masquées", "Une erreur 500 de l'API s'affichait comme « Aucune annonce » dans la modération ; « Paiement confirmé » s'affichait même si la vérification échouait.", "Message d'erreur distinct de l'état vide ; écran « Paiement non confirmé »."],
            ["Données fausses ou figées", "Date de publication, badge « Premium » et mention « Agent vérifié » écrits en dur ; revenu calculé sur les 12 premières transactions sur 67.", "Affichage des seules données de l'API ; lecture de toutes les pages avant le calcul."],
            ["Liens et parcours", "Pages 404 après la création d'une annonce ou un paiement ; annonce vendue affichée comme disponible.", "Redirections selon le rôle ; bandeau et boutons masqués pour une annonce non publiée."],
        ],
        "Exemples de problèmes corrigés, par famille", "docs/audit_frontend.md", widths=[3.0, 7.0, 5.5],
    )
    R.p("Cet audit a aussi montré une cause commune à plusieurs erreurs 500 : les filtres sur des champs booléens, "
        "que Djongo ne traduit pas. Nous y revenons au chapitre suivant.")

    R.h2("5.7 Réserves")
    R.bullets([
        "Les jeux de test ont été écrits par nous, et leurs étiquettes proposées avec l'aide d'un assistant puis validées par nous : ils peuvent être plus faciles que de vrais messages d'utilisateurs.",
        "Les tailles sont réduites (77, 32 et 18 messages) : un écart d'un cas n'est pas significatif.",
        "Un seul passage a été fait pour la classification ; deux pour les tests de bout en bout et pour l'Agent Marché.",
        "La fidélité de l'Agent Marché a été annotée par une seule personne, sur le premier passage, et par rapport à l'extrait et non à la page complète.",
        "La création, la modification et la suppression d'annonces par l'assistant n'ont pas été testées en automatique.",
    ])
    R.h2("5.8 Conclusion")
    R.p("Les tests montrent un assistant fiable sur ce qu'il affirme : aucune annonce inventée, aucun chiffre "
        "absent des sources, des refus corrects sans connexion. Ils montrent aussi ses limites : deux messages mal "
        "aiguillés, et des réponses de marché qui changent avec les résultats de la recherche web.")


def chapitre_6(R, D):
    R.chapter_page(6, "Difficultés rencontrées")
    R.h2("6.1 Introduction")
    R.p("Ce chapitre regroupe les difficultés qui nous ont le plus appris. Pour chacune, nous donnons la cause "
        "trouvée et la solution retenue. Le tableau 14 les résume ; les plus instructives sont commentées ensuite.")
    R.table(
        ["Difficulté", "Cause", "Solution"],
        [
            ["Filtres numériques et booléens sans effet ou en erreur 500", "Djongo ne traduit pas ces filtres de l'ORM vers MongoDB", "Filtrage en Python après lecture ; conversion des décimaux de MongoDB"],
            ["« Mes annonces » de l'assistant listait les annonces publiques", "Adresse écrite en dur dans un nœud n8n, différente de celle préparée par le code", "Adresse corrigée ; défaut trouvé par la vérité terrain des tests"],
            ["Recherche vectorielle de la FAQ sans résultat", "Index créé en 768 dimensions pour un modèle à 3 072 ; découpage qui séparait le titre de la réponse", "Index recréé ; taille des blocs augmentée"],
            ["Routage faux dans l'orchestrateur", "Sorties dupliquées dans l'aiguillage ; sortie par défaut non activée", "Aiguillage reconfiguré"],
            ["n8n ne joignait pas Django", "« localhost » résolu en IPv6 par Node.js, Django à l'écoute en IPv4", "Utilisation de 127.0.0.1"],
            ["Quota dépassé avec la recherche Google intégrée à Gemini", "Quota de l'outil de recherche nul pour ce modèle", "Recherche web par Tavily, synthèse par Gemini"],
            ["Questions en darija sans bon résultat de recherche", "Requête envoyée telle quelle au moteur", "Étape de reformulation de la requête"],
            ["Clé d'API en clair dans les exports des workflows", "Clé écrite dans l'adresse des nœuds HTTP ; envoi bloqué par GitHub", "Clé remplacée par un marqueur dans les exports"],
            ["Quartier rempli en trois langues depuis la carte", "Appel de géocodage sans langue demandée", "Paramètre de langue française"],
            ["Dates décalées d'une heure", "Base de fuseaux horaires antérieure au retour du Maroc à l'heure GMT", "Mise à jour de tzdata (2026.2 vers 2026.5)"],
            ["Déconnexion à chaque panne du serveur", "Toute erreur au chargement du profil vidait la session", "Déconnexion seulement sur un refus du serveur"],
            ["Django n'utilisait pas l'adresse du webhook", "Le fichier d'environnement contenait encore la valeur d'exemple", "Valeur corrigée dans le fichier .env"],
        ],
        "Difficultés rencontrées, causes et solutions",
        "docs/PASSATION_darimmo_agent_ia.md, docs/notes_agent_marche_et_session.md, docs/audit_frontend.md", widths=[5.0, 5.5, 5.0], size=9.5,
    )
    R.h2("6.2 Djongo et les filtres")
    R.p(
        "Djongo permet d'utiliser MongoDB avec l'ORM de Django, mais il ne traduit pas tout. Un filtre comme "
        "« non lu » sur un champ booléen, ou une comparaison de prix, provoque une erreur ou ne filtre rien. "
        "Nous avons rencontré ce défaut à quatre endroits : la recherche d'annonces, le résumé du tableau de bord, "
        "le bouton « Tout marquer comme lu » et la liste de modération de l'administrateur, dont l'onglet "
        "« Publiées » restait vide alors que la base contenait 11 annonces. La solution a chaque fois été la même : "
        "lire les objets avec un filtre simple, puis trier ou filtrer en Python. Elle convient à notre volume de "
        "données, mais ne passerait pas à l'échelle.",
    )
    R.h2("6.3 Un défaut que seuls les tests ont montré")
    R.p(
        "Le défaut de « mes annonces » est celui qui nous a le plus marqué. L'agent répondait poliment, avec de "
        "vraies annonces, dans un format correct : rien ne signalait l'erreur. C'est parce que le script comparait "
        "les identifiants renvoyés à ceux de l'API qu'il est apparu. Nous en retenons qu'une réponse plausible "
        "n'est pas une réponse juste, et qu'un agent doit être testé contre une vérité obtenue séparément de lui.",
    )
    R.h2("6.4 Lire une page web « aplatie »")
    R.p(
        "L'Agent Marché ne lit pas une page comme un humain : il reçoit un extrait où le tableau de prix est réduit "
        "à une suite de mots et de nombres. Dans une version intermédiaire, les chiffres cités existaient bien dans "
        "la source, mais étaient mal interprétés : une borne prise pour une moyenne, un prix de villa donné pour des "
        "appartements. Nous avons ajouté au prompt une description du format de ces pages. L'évaluation du "
        "chapitre 5 montre que le problème est réduit, pas supprimé.",
    )
    R.h2("6.5 Secrets et configuration")
    R.p(
        "Deux incidents concernent la configuration. Lors de l'envoi du code, GitHub a bloqué les fichiers des "
        "workflows : la clé de l'API Gemini figurait en clair dans l'adresse des nœuds HTTP (onze occurrences dans six workflows). Nous l'avons remplacée "
        "par un marqueur dans les exports ; dans n8n, ces nœuds devront utiliser un identifiant enregistré, comme "
        "le fait déjà l'Agent Marché. Par ailleurs, Django semblait ignorer son fichier d'environnement. Le "
        "diagnostic a montré qu'il le lisait bien, mais que le fichier contenait toujours l'adresse d'exemple. "
        "Une fois la valeur corrigée dans ce fichier, Django utilise la bonne adresse sans variable définie dans "
        "le terminal ; nous l'avons vérifié sur la page de l'assistant.",
    )
    R.h2("6.6 Conclusion")
    R.p("La plupart de ces difficultés viennent des frontières entre les outils : entre Django et MongoDB, entre "
        "n8n et Django, entre le modèle et une page web. C'est là que les vérifications sont les plus utiles.")


def conclusion(R, D):
    e1, e2, c2, fid, stab = D["e1"], D["e2"], D["cls2"], D["fid"]["chiffres"], D["stab"]
    n_e = e2["run_info"]["n_messages"]
    R.page_break()
    R.front_title("Conclusion générale et perspectives")
    R.p(
        "L'objectif de ce projet était d'ajouter à une plateforme d'annonces immobilières un assistant "
        "conversationnel utile, qui n'invente pas de données et ne contourne pas les permissions.",
        "Nous avons réalisé la plateforme Darimmo : une API Django REST, une interface React et une base MongoDB "
        "Atlas, couvrant la publication et la recherche d'annonces, les demandes de visite, la messagerie, la mise "
        "en avant payante avec un paiement simulé et une facture, et un espace d'administration. Nous y avons "
        "branché un assistant formé d'un orchestrateur et de six voies de traitement : quatre agents à appel de "
        "fonction, une réponse aux questions générales par recherche dans une FAQ, et un agent de marché appuyé "
        "sur une recherche web.",
        f"Les résultats répondent aux objectifs sur les points essentiels. La classification reconnaît les "
        f"11 intentions sur les {c2['n_valid']} messages du jeu de test, dans quatre langues. Les tests de bout en "
        f"bout atteignent {e2['n_passed']} réponses correctes sur {n_e}, contre {e1['n_passed']} avant la "
        "correction d'un agent, sans annonce inventée et avec des refus corrects sans connexion. Pour l'agent de "
        f"marché, aucun chiffre n'est absent des sources lues, et {fid['oui']['n']} chiffres sur {fid['total']} "
        "sont fidèles à la source citée. La règle de sécurité est tenue : le modèle n'accède aux données que par "
        "l'API, avec le jeton de l'utilisateur.",
        "Ce travail a des limites, que nous avons cherché à mesurer plutôt qu'à cacher. Les jeux de test sont "
        "petits et écrits par nous. Deux messages restent mal aiguillés. Les réponses de l'agent de marché "
        f"dépendent de la recherche web : seuls {stab['identique']} cas sur {stab['n']} donnent la même réponse à "
        "deux passages, et une réponse en darija peut différer d'une réponse en français pour le même contenu. "
        "Les agents ne gardent pas la mémoire de la conversation : seul le classificateur lit l'historique. "
        "L'intention d'aide sur le compte n'a pas d'agent. Les actions d'écriture par l'assistant n'ont pas été "
        "testées en automatique. Côté plateforme, le filtrage en Python imposé par Djongo ne passerait pas à "
        "l'échelle, la déconnexion ne révoque pas le jeton de rafraîchissement, et le webhook de n8n n'est pas "
        "protégé par un jeton.",
        "Plusieurs suites sont possibles. Pour l'assistant : donner l'historique de la conversation aux agents, "
        "afin de comprendre une question de suivi ; créer un agent pour l'aide sur le compte ; afficher à "
        "l'utilisateur la date et la nature de la source d'un prix ; comparer les sources entre elles avant de "
        "répondre ; élargir les jeux de test avec de vrais messages et les rejouer plusieurs fois. Pour la "
        "sécurité : enregistrer les clés dans les identifiants de n8n, protéger le webhook, révoquer les jetons à "
        "la déconnexion. Pour la plateforme : une pagination complète de la recherche, une validation des annonces "
        "par l'administrateur avant publication, des tests automatisés de l'API et de l'interface, et le remplacement "
        "de Djongo par un accès à la base mieux adapté aux filtres.",
    )


BIBLIO = [
    ("Django Software Foundation", "Django documentation", "https://docs.djangoproject.com/"),
    ("Encode OSS", "Django REST Framework", "https://www.django-rest-framework.org/"),
    ("Jazzband", "Simple JWT — documentation", "https://django-rest-framework-simplejwt.readthedocs.io/"),
    ("Meta Open Source", "React — documentation", "https://react.dev/"),
    ("Équipe Vite", "Vite — documentation", "https://vite.dev/"),
    ("n8n GmbH", "n8n Docs", "https://docs.n8n.io/"),
    ("Google", "Gemini API — documentation", "https://ai.google.dev/gemini-api/docs"),
    ("MongoDB Inc.", "MongoDB Atlas Vector Search", "https://www.mongodb.com/docs/atlas/atlas-vector-search/"),
    ("Tavily", "Tavily API — documentation", "https://docs.tavily.com/"),
    ("Projet Djongo", "Djongo — documentation", "https://www.djongomapper.com/"),
    ("Tailwind Labs", "Tailwind CSS — documentation", "https://tailwindcss.com/docs"),
    ("Recharts Group", "Recharts — documentation", "https://recharts.org/"),
    ("P. Le Cam et contributeurs", "React Leaflet — documentation", "https://react-leaflet.js.org/"),
    ("ReportLab Inc.", "ReportLab — documentation", "https://docs.reportlab.com/"),
    ("OpenStreetMap Foundation", "Nominatim — documentation de l'API", "https://nominatim.org/release-docs/latest/"),
]


def bibliographie(R):
    R.page_break()
    R.front_title("Bibliographie et webographie")
    R.p("Les références sont les documentations officielles des outils utilisés dans le projet.")
    for i, (author, title, url) in enumerate(BIBLIO, 1):
        author = author if author.endswith(".") else author + "."
        R._para(f"[{i}] {author} {title}. Disponible sur : {url} (consulté le [À COMPLÉTER]).",
                align=0, spacing=1.15, after=5)
    R.todo.append(("À VÉRIFIER", "Bibliographie", "Auteurs et adresses des 15 références ; ajouter la date de consultation de chacune"))


ROLES = {
    "Orchestrateur": "Reçoit le message de Django, classe l'intention avec Gemini, applique la règle de confiance, puis appelle l'agent voulu ou répond directement (FAQ par recherche vectorielle, aide sur le compte, demande inconnue).",
    "Agent Recherche": "Traduit la demande en filtres par appel de fonction, interroge la recherche d'annonces de l'API Django et rédige la réponse avec les annonces trouvées.",
    "Agent Annonces": "Crée, modifie, supprime ou liste les annonces de l'utilisateur connecté, en appelant l'API Django avec son jeton ; refuse sans connexion.",
    "Agent Paiement": "Liste les transactions de l'utilisateur connecté par l'API Django et en résume l'état ; refuse sans connexion.",
    "Agent Communication": "Lit l'annonce visée, ajoute son titre et son lien au message, puis l'envoie au propriétaire par l'API de messagerie ; refuse sans connexion.",
    "Agent Marché": "Reformule la question de prix, lance une recherche web limitée à cinq sites immobiliers, rédige une synthèse citant ses sources, puis retire liens et noms de sites de la réponse.",
    "FAQ Ingestion": "Charge les 20 articles de la FAQ, calcule leurs vecteurs avec Gemini et les enregistre dans l'index vectoriel de MongoDB Atlas (exécution manuelle).",
    "Test Classification": "Reprend seulement l'étape de classification de l'orchestrateur, pour les tests de classification d'intention.",
}


def annexes(R, D):
    R.page_break()
    R.front_title("Annexes")
    R.h2("Annexe A — Extraits des jeux de test")
    seen, rows = set(), []
    for r in D["dataset_cls"]:
        if r["expected_intent"] not in seen:
            seen.add(r["expected_intent"])
            rows.append([r["id"], r["message"], r["language"], r["expected_intent"]])
    R.table(["N°", "Message", "Langue", "Intention attendue"], rows,
            "Jeu de classification : un message par intention", "tests_ia/dataset_classification.csv",
            widths=[1.0, 9.0, 1.6, 3.9], size=9)
    seen, rows = set(), []
    for r in D["dataset_e2e"]:
        key = (r["category"], r["expected_behavior"])
        if key not in seen:
            seen.add(key)
            rows.append([r["id"], r["category"], r["message"], r["language"], r["expected_behavior"]])
    R.table(["N°", "Catégorie", "Message", "Langue", "Comportement attendu"], rows,
            "Jeu de bout en bout : un message par catégorie et par comportement attendu", "tests_ia/dataset_e2e.csv",
            widths=[1.0, 2.6, 7.0, 1.4, 3.5], size=9)

    R.h2("Annexe B — Extrait du prompt de classification")
    R.p("Texte du prompt système du nœud « Build Classification Prompt » de l'orchestrateur (début).")
    R.code(D["prompt"])
    R._para("Source : n8n_workflows/Darimmo - Orchestrateur.json", align=1, size=10, italic=True, spacing=1.0)

    R.h2("Annexe C — Structure des workflows n8n")
    R.table(["Workflow", "Nœuds", "Rôle"],
            [[w["name"], w["n"], ROLES.get(w["name"], "[À COMPLÉTER]")] for w in D["workflows"]],
            "Workflows n8n de l'assistant", "n8n_workflows/*.json", widths=[3.0, 1.3, 11.2], size=8.5)

    R.h2("Annexe D — Tableau des corrections")
    R.p("Corrections fonctionnelles relevées dans le document d'audit, avec le niveau de vérification : "
        "« Étudiant » (test dans le navigateur), « Script » ou « Build » (compilation seule). "
        "L'harmonisation du style, page par page, n'est pas reprise ici.")
    R.table(["Réf.", "Problème corrigé", "Vérification"],
            [[r[0], r[1][:210] + ("…" if len(r[1]) > 210 else ""), r[2]] for r in D["audit"]["rows"]],
            "Corrections de l'interface et de l'API", "docs/audit_frontend.md", widths=[1.3, 12.0, 2.2], size=8.5)
