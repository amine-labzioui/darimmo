"""Contenu du rapport — pages préliminaires, introduction, chapitres 1 à 3."""

from docx.enum.text import WD_ALIGN_PARAGRAPH


def pct(x, d=1):
    return f"{x * 100:.{d}f}".replace(".", ",") + " %"


def sec(ms, d=2):
    return f"{ms / 1000:.{d}f}".replace(".", ",") + " s"


def num(x, d=2):
    return f"{x:.{d}f}".replace(".", ",")


TITRE = "Darimmo : plateforme d'annonces immobilières avec un assistant conversationnel multi-agents"

ABREVIATIONS = [
    ("API", "Application Programming Interface, interface de programmation"),
    ("CMI", "Centre Monétique Interbancaire (paiement par carte au Maroc ; simulé dans ce projet)"),
    ("CSV", "Comma-Separated Values, fichier texte tabulaire"),
    ("DRF", "Django REST Framework"),
    ("FAQ", "Foire aux questions"),
    ("FSAC", "Faculté des Sciences Aïn Chock"),
    ("HTTP", "HyperText Transfer Protocol"),
    ("IA", "Intelligence artificielle"),
    ("JSON", "JavaScript Object Notation"),
    ("JWT", "JSON Web Token, jeton d'authentification signé"),
    ("LLM", "Large Language Model, grand modèle de langage"),
    ("ORM", "Object-Relational Mapping, couche d'accès aux données de Django"),
    ("PFE", "Projet de fin d'études"),
    ("RAG", "Retrieval-Augmented Generation, génération appuyée sur des documents retrouvés"),
    ("REST", "Representational State Transfer"),
    ("URL", "Uniform Resource Locator"),
]


def resumes(D):
    """Textes des trois résumés, avec les chiffres lus dans les fichiers de résultats."""
    c2, e1, e2, m1, m2 = D["cls2"], D["e1"], D["e2"], D["m1"], D["m2"]
    fid, stab, p1, p2 = D["fid"]["chiffres"], D["stab"], D["pres1"], D["pres2"]
    n_e2e = e2["run_info"]["n_messages"]
    n_mk = m1["run_info"]["n_messages"]
    ref = e2["unauthenticated_refusal"]
    n_aud = D["audit"]["total"]
    fr = (
        "Ce projet de fin d'études porte sur Darimmo, une plateforme web d'annonces immobilières pour le Maroc. "
        "Les sites d'annonces reposent sur des formulaires de filtres et ne répondent pas aux questions posées en "
        "langage naturel. Un assistant fondé sur un grand modèle de langage peut le faire, à condition de ne pas "
        "inventer de données et de ne pas contourner les permissions. Notre objectif était de construire la "
        "plateforme et un tel assistant, puis de mesurer sa fiabilité. "
        "La plateforme repose sur une API Django REST, une interface React et une base MongoDB Atlas. L'assistant est construit avec l'outil "
        "d'automatisation n8n et le modèle Gemini : un orchestrateur classe chaque message parmi 11 intentions, puis "
        "le confie à un agent spécialisé (recherche de biens, gestion des annonces, paiements, contact d'un "
        "propriétaire, questions générales par recherche dans une FAQ, prix du marché par recherche web). Les agents "
        "n'accèdent aux données qu'en appelant l'API avec le jeton de l'utilisateur : le modèle ne décide jamais des "
        "permissions. "
        "Pour l'évaluation, nous avons écrit des jeux de test en français, darija, arabe et anglais, comparé les "
        "réponses à une vérité terrain lue directement dans l'API, et annoté à la main les chiffres donnés par "
        f"l'agent de marché. La classification d'intention atteint {pct(c2['accuracy_on_valid'], 0)} sur "
        f"{c2['n_valid']} messages. Les tests de bout en bout passent de {e1['n_passed']}/{n_e2e} à "
        f"{e2['n_passed']}/{n_e2e} réponses correctes après la correction d'un agent, sans aucune annonce inventée, "
        f"et {ref['correct']} demandes protégées sur {ref['total']} sont refusées sans connexion. Pour l'agent de "
        f"marché, aucun des {p1['chiffres'] + p2['chiffres']} chiffres donnés sur deux passages de {n_mk} questions "
        f"n'est absent des sources lues, et {fid['oui']['n']} chiffres sur {fid['total']} sont fidèles à la source "
        f"citée ; seuls {stab['identique']} cas sur {stab['n']} donnent la même réponse aux deux passages, à cause "
        f"de la variabilité de la recherche web. Un audit de l'interface et de l'API a conduit à {n_aud} lignes de "
        "correction. Ces résultats portent sur des jeux de test de petite taille, écrits par nous."
    )
    kw_fr = "Mots-clés : annonces immobilières, agent conversationnel, LLM, orchestration, function calling, RAG, n8n, Django, React."
    en = (
        "This final-year project presents Darimmo, a web platform for real-estate listings in Morocco. Listing "
        "sites rely on filter forms and cannot answer questions asked in natural language. An assistant built on a "
        "large language model can, provided that it neither invents data nor bypasses permissions. Our goal was to "
        "build the platform and such an assistant, then to measure how reliable it is. "
        "The platform is built on a Django REST API, a React front end and a MongoDB Atlas database. The assistant runs on the n8n automation tool with the Gemini model: an "
        "orchestrator classifies each message into one of 11 intents and hands it to a specialised agent (property "
        "search, listing management, payments, contacting an owner, general questions answered from an FAQ by "
        "retrieval, market prices answered from a web search). Agents reach data only by calling the API with the "
        "user's token, so the model never decides permissions. "
        "For the evaluation, we wrote test sets in French, Moroccan Arabic (darija), Arabic and English, compared "
        "the answers with a ground truth read directly from the API, and manually annotated the figures given by "
        f"the market agent. Intent classification reaches {pct(c2['accuracy_on_valid'], 0).replace(' %', '%')} on "
        f"{c2['n_valid']} messages. End-to-end tests improve from {e1['n_passed']}/{n_e2e} to {e2['n_passed']}/{n_e2e} "
        f"correct answers after one agent was fixed, with no invented listing, and {ref['correct']} of "
        f"{ref['total']} protected requests are refused without login. For the market agent, none of the "
        f"{p1['chiffres'] + p2['chiffres']} figures given over two runs of {n_mk} questions is missing from the "
        f"retrieved sources, and {fid['oui']['n']} of {fid['total']} figures are faithful to the cited source; only "
        f"{stab['identique']} of {stab['n']} cases return the same answer in both runs, because web search results "
        f"vary. An audit of the user interface and the API led to {n_aud} correction entries. These results come "
        "from small test sets that we wrote ourselves."
    )
    kw_en = "Keywords: real-estate listings, conversational agent, LLM, orchestration, function calling, RAG, n8n, Django, React."
    ar = (
        "يتناول مشروع نهاية الدراسة هذا منصة «داريمو»، وهي منصة ويب لإعلانات العقار في المغرب. تعتمد مواقع "
        "الإعلانات على استمارات للتصفية، ولا تجيب عن الأسئلة المطروحة باللغة الطبيعية. ويستطيع مساعد مبني على "
        "نموذج لغوي كبير أن يقوم بذلك، شريطة ألا يختلق بيانات وألا يتجاوز الصلاحيات. وكان هدفنا بناء المنصة وهذا "
        "المساعد، ثم قياس مدى موثوقيته. "
        "تعتمد المنصة على واجهة برمجية مبنية بـ Django REST، وواجهة مستخدم بـ React، وقاعدة بيانات MongoDB "
        "Atlas. أما المساعد فمبني بأداة n8n ونموذج Gemini: يصنف المنسق كل رسالة ضمن 11 نية، ثم يحيلها "
        "على وكيل متخصص (البحث عن العقارات، تدبير الإعلانات، الأداءات، مراسلة المالك، الأسئلة العامة اعتمادا على "
        "قاعدة أسئلة شائعة، وأسعار السوق اعتمادا على البحث في الويب). لا يصل الوكلاء إلى البيانات إلا عبر الواجهة "
        "البرمجية وبرمز المستخدم، فالنموذج لا يقرر الصلاحيات أبدا. "
        "ومن أجل التقييم، كتبنا مجموعات اختبار بالفرنسية والدارجة والعربية والإنجليزية، وقارنا الأجوبة بحقيقة "
        "مرجعية مقروءة مباشرة من الواجهة البرمجية، وراجعنا يدويا الأرقام التي يقدمها وكيل السوق. بلغت دقة تصنيف "
        f"النية {pct(c2['accuracy_on_valid'], 0).replace(' %', '')} في المائة على {c2['n_valid']} رسالة. وانتقلت "
        f"نتائج الاختبارات الشاملة من {e1['n_passed']} إلى {e2['n_passed']} جوابا صحيحا من أصل {n_e2e} بعد تصحيح "
        f"أحد الوكلاء، دون اختلاق أي إعلان، ورُفض {ref['correct']} طلبات محمية من أصل {ref['total']} دون تسجيل "
        f"الدخول. وبخصوص وكيل السوق، لم يغب أي رقم من الأرقام {p1['chiffres'] + p2['chiffres']} المقدمة في تجربتين "
        f"من {n_mk} سؤالا عن المصادر المقروءة، وكان {fid['oui']['n']} رقما من أصل {fid['total']} مطابقا للمصدر "
        f"المذكور، غير أن {stab['identique']} حالات فقط من أصل {stab['n']} أعطت الجواب نفسه في التجربتين بسبب "
        f"تغير نتائج البحث في الويب. كما أفضى تدقيق الواجهة والواجهة البرمجية إلى {n_aud} سطرا من التصحيحات. "
        "هذه النتائج تخص مجموعات اختبار صغيرة كتبناها بأنفسنا."
    )
    kw_ar = "الكلمات المفتاحية: إعلانات العقار، وكيل حواري، النماذج اللغوية الكبيرة، التنسيق بين الوكلاء، استرجاع المعلومات، n8n، Django، React."
    return {"fr": fr, "kw_fr": kw_fr, "en": en, "kw_en": kw_en, "ar": ar, "kw_ar": kw_ar}


def preliminaires(R, D):
    R.front_title("Remerciements")
    R.p("[À COMPLÉTER : remerciements — encadrant(s), membres du jury, équipe pédagogique du master, proches]")
    R.h2("Note sur l'utilisation d'outils d'intelligence artificielle")
    R.p(
        "Conformément aux consignes de la faculté, nous signalons l'usage d'un assistant d'intelligence artificielle "
        "générative (Claude, d'Anthropic) pendant ce projet. Il nous a aidé à auditer le code, à écrire les scripts "
        "de test et à mettre en forme ce rapport à partir des fichiers du dépôt. Les choix de conception, les tests "
        "dans le navigateur, la validation des jeux de test, l'annotation manuelle des réponses et la vérification "
        "des résultats restent les nôtres. [À COMPLÉTER : adapter cette note à l'usage réel et la relire]"
    )
    R.page_break()
    R.front_title("Dédicaces")
    R.p("[À COMPLÉTER : dédicaces (page facultative)]")
    R.page_break()

    res = resumes(D)
    R.front_title("Résumé")
    R.p(res["fr"], res["kw_fr"])
    R.page_break()
    R.front_title("Abstract")
    R.p(res["en"], res["kw_en"])
    R.page_break()
    R.front_title("ملخص")
    R.arabic(res["ar"])
    R.arabic(res["kw_ar"])
    R._para("[À COMPLÉTER : résumé en arabe à relire par un lecteur arabophone]", size=10, italic=True)
    R.todo.append(("À RELIRE", "ملخص", "Résumé en arabe : texte produit avec une aide automatique, à relire entièrement"))
    R.page_break()

    R.front_title("Table des matières", toc=False)
    R.toc('TOC \\o "1-3" \\h \\z \\u', "Mettre à jour ce champ dans Word (clic droit, « Mettre à jour les champs »).")
    R.page_break()
    R.front_title("Liste des figures")
    R.toc('TOC \\h \\z \\c "Figure"', "Mettre à jour ce champ dans Word.")
    R.page_break()
    R.front_title("Liste des tableaux")
    R.toc('TOC \\h \\z \\c "Tableau"', "Mettre à jour ce champ dans Word.")
    R.page_break()
    R.front_title("Liste des abréviations")
    t = R.doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    for abbr, meaning in ABREVIATIONS:
        cells = t.add_row().cells
        R._cell(cells[0], abbr, 11, bold=True)
        R._cell(cells[1], meaning, 11)
    return res


def introduction(R, D):
    R.front_title("Introduction générale")
    R.p(
        "Au Maroc, la recherche d'un logement ou d'un local passe de plus en plus par des sites d'annonces. "
        "Le principe est connu : un formulaire de filtres (ville, type de bien, budget) et une liste de résultats. "
        "Cette approche fonctionne, mais elle demande à l'utilisateur de traduire lui-même son besoin en filtres, "
        "et elle ne répond pas aux questions qui ne sont pas des recherches : « comment publier une annonce ? », "
        "« où en est mon paiement ? », « combien coûte le mètre carré dans ce quartier ? ».",
        "Les grands modèles de langage permettent aujourd'hui de traiter ces demandes en langage naturel. "
        "Ils posent en retour deux problèmes sérieux pour une application réelle. Le premier est la fiabilité : "
        "un modèle peut inventer une annonce ou un prix. Le second est la sécurité : un modèle ne doit pas décider "
        "seul de ce qu'un utilisateur a le droit de voir ou de modifier.",
        "Notre projet, Darimmo, répond à cette problématique : **comment ajouter à une plateforme d'annonces "
        "immobilières un assistant conversationnel utile, qui comprend le français, la darija, l'arabe et l'anglais, "
        "sans qu'il invente de données et sans qu'il contourne les permissions de la plateforme ?**",
        "Les objectifs du projet sont les suivants. D'abord, disposer d'une plateforme complète : publication et "
        "recherche d'annonces, demandes de visite, messagerie, mise en avant payante d'une annonce, espace "
        "d'administration. Ensuite, concevoir un assistant formé d'un orchestrateur et d'agents spécialisés, où "
        "chaque agent n'accède aux données que par l'API de la plateforme. Enfin, mesurer ce que vaut cet "
        "assistant avec des tests reproductibles, et dire clairement ce qui ne marche pas encore.",
        "Notre démarche a suivi quatre étapes : analyse des besoins et conception, réalisation de la plateforme et "
        "des agents, évaluation de l'assistant par des jeux de test (classification, tests de bout en bout, agent "
        "de marché), puis audit et correction de l'interface et de l'API avant la démonstration.",
        "Ce rapport est organisé en six chapitres. Le chapitre 1 présente le projet et son cahier des charges. "
        "Le chapitre 2 explique les notions et les outils utilisés. Le chapitre 3 décrit l'analyse et la conception. "
        "Le chapitre 4 présente la réalisation. Le chapitre 5 rassemble les tests et leurs résultats. "
        "Le chapitre 6 revient sur les difficultés rencontrées. Une conclusion générale dresse le bilan et les "
        "perspectives.",
    )


def chapitre_1(R, D):
    R.chapter_page(1, "Contexte et cahier des charges")
    R.h2("1.1 Introduction")
    R.p("Ce chapitre présente la plateforme Darimmo, ses utilisateurs et ce que nous attendons d'elle. "
        "Il se termine par les besoins propres à l'assistant, qui est la partie centrale du projet.")
    R.h2("1.2 Présentation du projet")
    R.p(
        "Darimmo est une plateforme web d'annonces immobilières destinée au marché marocain. Un particulier ou une "
        "agence y publie des biens à vendre ou à louer ; un visiteur les recherche, les consulte et prend contact. "
        "La plateforme gère cinq types de biens (villa, appartement, riad, maison, terrain) et deux types de "
        "transaction (vente, location).",
        "Le projet a été réalisé dans le cadre du master Ingénierie Informatique et Intelligence Artificielle de la "
        "Faculté des Sciences Aïn Chock. [À COMPLÉTER : cadre du projet — projet académique ou stage, organisme "
        "d'accueil éventuel, période]",
    )
    R.h2("1.3 Acteurs")
    R.p("Quatre acteurs utilisent la plateforme. Le tableau 1 résume leur rôle.")
    R.table(
        ["Acteur", "Rôle"],
        [
            ["Visiteur", "Consulte et recherche les annonces sans compte ; peut interroger l'assistant pour une recherche, une question générale ou une question de marché."],
            ["Client", "Dispose d'un compte : favoris, demandes de visite, messages aux propriétaires ; peut aussi publier ses propres annonces."],
            ["Agence", "Compte professionnel : gère ses annonces, traite les demandes de visite, répond aux messages, consulte ses statistiques, paie la mise en avant d'une annonce."],
            ["Administrateur", "Gère les comptes, modère les annonces, suit les transactions et les demandes de visite."],
        ],
        "Acteurs de la plateforme", "rôles définis dans backend/apps/users/models.py et pages du frontend", widths=[3.2, 12.3],
    )
    R.h2("1.4 Besoins fonctionnels")
    R.p("Les besoins fonctionnels sont regroupés par domaine dans le tableau 2. Ils correspondent aux fonctions "
        "présentes dans le code à la fin du projet.")
    R.table(
        ["Domaine", "Fonctions attendues"],
        [
            ["Comptes", "Inscription, connexion, profil, changement de mot de passe ; trois rôles (client, agence, administrateur)."],
            ["Annonces", "Création avec photos et position sur une carte, modification, suppression ; statuts brouillon, en attente, publiée, vendue, louée, archivée."],
            ["Recherche", "Filtres par ville, type de bien, type de transaction, prix, surface, nombre de chambres et équipements ; page de détail d'une annonce."],
            ["Relation client", "Favoris, demande de visite avec date souhaitée, messagerie entre client et propriétaire, notifications."],
            ["Mise en avant", "Achat d'un « boost » pour une annonce publiée, paiement par carte simulé, facture en PDF."],
            ["Administration", "Statistiques globales, gestion des utilisateurs, modération des annonces, suivi des transactions et des demandes de visite."],
            ["Assistant IA", "Conversation en langage naturel : recherche de biens, gestion de ses annonces, état des paiements, contact d'un propriétaire, aide générale, prix du marché."],
        ],
        "Besoins fonctionnels par domaine", "code du dépôt (backend/apps, frontend/src)", widths=[3.2, 12.3],
    )
    R.h2("1.5 Besoins non fonctionnels")
    R.p(
        "Trois exigences ont guidé nos choix. La première est la **sécurité** : chaque action sur les données passe "
        "par l'API, qui vérifie l'identité de l'utilisateur et ses droits. La deuxième est la **fiabilité des "
        "réponses** de l'assistant : il ne doit citer que des annonces qui existent et des chiffres présents dans une "
        "source. La troisième est la **lisibilité de l'interface** : une erreur du serveur doit s'afficher comme une "
        "erreur, et non comme une liste vide ou une fausse confirmation.",
        "La plateforme doit aussi rester utilisable sur un écran de téléphone, et les temps de réponse de l'assistant "
        "doivent rester acceptables pour une conversation ; nous les mesurons au chapitre 5.",
    )
    R.h2("1.6 Besoins de l'assistant IA")
    R.p("L'assistant doit reconnaître la demande de l'utilisateur, puis y répondre avec les données de la plateforme. "
        "Nous avons fixé les règles suivantes :")
    R.bullets([
        "comprendre quatre formes de langue : français, darija écrite en lettres latines, arabe et anglais ;",
        "classer chaque message dans une intention parmi 11, et demander une précision quand la demande est ambiguë ;",
        "répondre aux recherches uniquement avec des annonces publiées sur la plateforme ;",
        "refuser, sans appeler le modèle, les demandes sensibles d'un utilisateur non connecté (ses annonces, ses paiements, l'envoi d'un message) ;",
        "ne jamais laisser le modèle décider d'une permission : l'API applique les droits avec le jeton de l'utilisateur ;",
        "pour les prix du marché, ne donner que des chiffres présents dans une source consultée, et garder la trace de cette source.",
    ])
    R.h2("1.7 Conclusion")
    R.p("Le cahier des charges fixe donc une plateforme d'annonces complète et un assistant soumis à des règles "
        "strictes de sécurité et de fiabilité. Le chapitre suivant présente les notions et les outils qui "
        "permettent de les respecter.")


def chapitre_2(R, D):
    R.chapter_page(2, "Notions et technologies")
    R.h2("2.1 Introduction")
    R.p("Ce chapitre explique les notions d'intelligence artificielle utilisées dans l'assistant, puis les outils "
        "retenus pour la plateforme. Nous nous limitons à ce qui sert à comprendre la suite du rapport.")
    R.h2("2.2 Grands modèles de langage")
    R.p(
        "Un grand modèle de langage (LLM) est un modèle entraîné sur de très grands volumes de texte, capable de "
        "produire une suite de mots à partir d'une consigne appelée *prompt*. Nous l'utilisons de trois façons : "
        "pour classer un message, pour choisir un outil à appeler, et pour rédiger une réponse à partir de données "
        "que nous lui fournissons.".replace("*", ""),
        "Un LLM ne connaît pas les annonces de Darimmo et peut produire un texte plausible mais faux. Tout notre "
        "travail de conception consiste à ne lui demander que ce qu'il sait bien faire (comprendre et reformuler), "
        "et à lui fournir les faits au lieu de les lui laisser deviner. Le modèle utilisé est Gemini, par son API [7].",
    )
    R.h2("2.3 Agents et orchestration")
    R.p(
        "Un agent est un programme qui combine un LLM, une consigne et des outils pour accomplir une tâche. "
        "Plutôt qu'un seul agent chargé de tout, nous avons séparé les rôles : un orchestrateur reconnaît "
        "l'intention du message, puis le transmet à un agent spécialisé. Chaque agent a une consigne courte et peu "
        "d'outils, ce qui le rend plus facile à tester et à corriger.",
        "Cette organisation est réalisée avec n8n [6], un outil d'automatisation où un traitement est décrit comme "
        "un enchaînement de nœuds (appel HTTP, code JavaScript, condition, sous-traitement). Un tel enchaînement "
        "s'appelle un workflow.",
    )
    R.h2("2.4 Function calling")
    R.p(
        "Le function calling, ou appel de fonction, permet de décrire au modèle une fonction (nom, paramètres) ; "
        "au lieu de répondre en texte, le modèle renvoie le nom de la fonction à appeler et ses arguments. "
        "C'est notre programme, et non le modèle, qui exécute ensuite l'appel. Dans Darimmo, les fonctions sont des "
        "appels à l'API Django : rechercher des annonces, lister ses annonces, lister ses transactions, envoyer un "
        "message. Le résultat est renvoyé au modèle, qui rédige la réponse finale.",
    )
    R.h2("2.5 RAG et recherche vectorielle")
    R.p(
        "La génération augmentée par récupération (RAG) consiste à chercher d'abord les documents utiles à une "
        "question, puis à demander au modèle de répondre uniquement à partir d'eux. Pour chercher par le sens et "
        "non par les mots, chaque texte est transformé en un vecteur de nombres, appelé embedding ; deux textes "
        "proches par le sens ont des vecteurs proches.",
        "Nous utilisons cette technique pour les questions générales : 20 articles de FAQ sont stockés avec leur "
        "vecteur dans MongoDB Atlas, qui propose une recherche vectorielle [8]. Les vecteurs sont produits par le "
        "modèle d'embedding de Gemini (3 072 dimensions).",
    )
    R.h2("2.6 Recherche web pour agents")
    R.p(
        "Pour les prix du marché, les annonces de Darimmo sont trop peu nombreuses pour calculer une moyenne fiable. "
        "L'agent de marché s'appuie donc sur une recherche web. Nous utilisons Tavily [9], une API de recherche "
        "conçue pour les agents : elle renvoie, pour une requête, des extraits de pages. Le modèle rédige ensuite "
        "une synthèse à partir de ces extraits. Le principe est le même que pour le RAG, avec le web comme source.",
    )
    R.h2("2.7 Outils de la plateforme")
    R.p("Le tableau 3 présente les outils utilisés et leur rôle. Les versions sont celles des fichiers "
        "de dépendances du projet.")
    R.table(
        ["Outil", "Version", "Rôle dans le projet"],
        [
            ["Django [1] et Django REST Framework [2]", "4.2.11 et 3.14.0", "API de la plateforme : modèles, vues, permissions."],
            ["Simple JWT [3]", "5.3.1", "Authentification par jetons d'accès et de rafraîchissement."],
            ["MongoDB Atlas [8] et Djongo [10]", "Djongo 1.3.6", "Base de données ; Djongo traduit les requêtes de l'ORM Django vers MongoDB."],
            ["React [4], Vite [5], Tailwind CSS [11]", "18, 5 et 3", "Interface utilisateur."],
            ["Recharts [12], React Leaflet [13]", "2 et 4", "Graphiques des tableaux de bord ; carte de localisation."],
            ["n8n [6]", "instance locale", "Orchestrateur et agents de l'assistant."],
            ["Gemini [7]", "gemini-3.5-flash-lite", "Classification, appels de fonction, rédaction ; embeddings pour la FAQ."],
            ["Tavily [9]", "API", "Recherche web de l'agent de marché."],
            ["ReportLab [14]", "5.0.0", "Génération de la facture en PDF."],
            ["Nominatim / OpenStreetMap [15]", "API", "Adresse à partir d'un point choisi sur la carte."],
        ],
        "Outils utilisés", "backend/requirements.txt, frontend/package.json, n8n_workflows/*.json", widths=[5.2, 3.3, 7.0],
    )
    R.h2("2.8 Conclusion")
    R.p("L'assistant combine donc trois techniques : la classification d'intention, l'appel de fonctions et la "
        "génération à partir de documents retrouvés. Le chapitre suivant montre comment elles s'assemblent dans "
        "l'architecture de Darimmo.")


def chapitre_3(R, D, F):
    R.chapter_page(3, "Analyse et conception")
    R.h2("3.1 Introduction")
    R.p("Ce chapitre décrit ce que font les acteurs, comment les données sont organisées, et comment un message "
        "de l'utilisateur traverse le système. Les diagrammes sont établis à partir du code réel du projet.")
    R.h2("3.2 Cas d'utilisation")
    R.p("La figure 1 présente les principaux cas d'utilisation par acteur. Un client dispose aussi des cas du "
        "visiteur, et une agence partage avec le client tout ce qui concerne les annonces.")
    R.figure(F["cas"], "Principaux cas d'utilisation par acteur", width=15.5)
    R.p("On y voit que l'assistant est accessible dès le rôle de visiteur. Les demandes qui touchent aux données "
        "personnelles (annonces, paiements, messages) exigent en revanche un compte.")
    R.h2("3.3 Modèle de données")
    R.p("La figure 2 montre les classes principales, telles qu'elles sont définies dans les modèles Django. "
        "Pour la lisibilité, seuls les attributs utiles à la compréhension sont indiqués.")
    R.figure(F["classes"], "Diagramme de classes simplifié", "modèles de backend/apps/*/models.py", width=15.5)
    R.p(
        "L'annonce est au centre du modèle : elle appartient à un utilisateur, porte des images, et sert de point "
        "d'attache aux favoris, aux demandes de visite, aux conversations et aux transactions. Son statut prend six "
        "valeurs (brouillon, en attente, publiée, vendue, louée, archivée) ; seule une annonce publiée apparaît dans "
        "la recherche. Les conversations avec l'assistant sont enregistrées à part (AIConversation, AIMessage), avec "
        "les métadonnées de chaque réponse : agent utilisé, nombre d'appels, sources citées.",
    )
    R.h2("3.4 Architecture globale")
    R.p("La figure 3 présente l'architecture. L'interface React ne parle qu'à l'API Django. Pour l'assistant, "
        "Django transmet le message à n8n par un webhook, c'est-à-dire une adresse HTTP qui déclenche un workflow.")
    R.figure(F["architecture"], "Architecture globale de Darimmo", width=15.5)
    R.p(
        "Le point important est la flèche en pointillés : quand un agent a besoin de données, il rappelle l'API "
        "Django avec le jeton de l'utilisateur. n8n n'a donc aucun accès direct à la base pour les annonces, les "
        "paiements ou les messages. Le seul accès direct concerne l'index vectoriel de la FAQ, qui ne contient que "
        "des textes publics.",
    )
    R.h2("3.5 Conception de l'assistant")
    R.h3("3.5.1 Orchestrateur et routage")
    R.p("La figure 4 montre le chemin d'un message dans l'orchestrateur. Un premier appel au modèle classe le "
        "message ; un aiguillage l'envoie ensuite vers l'agent correspondant.")
    R.figure(F["orchestrateur"], "Classification d'intention et routage vers les agents",
             "workflow « Darimmo - Orchestrateur » (n8n_workflows)", width=15.5)
    R.p(
        "La classification renvoie un objet JSON : l'intention, un score de confiance entre 0 et 1, les entités "
        "trouvées (ville, type de bien, budget) et, si besoin, une question de clarification. Une règle écrite en "
        "code s'ajoute au modèle : si la confiance est inférieure à 0,6, l'assistant pose une question au lieu de "
        "lancer un agent. Les intentions `account_help` et `unknown` reçoivent une réponse directe, sans agent.",
        "Tous les agents renvoient la même structure : le texte de la réponse, l'identifiant de session, la liste "
        "des annonces recommandées, l'intention et des métadonnées. Cette forme unique permet à Django d'enregistrer "
        "la réponse et au frontend d'afficher des cartes d'annonces sans connaître l'agent qui a répondu.",
    )
    R.h3("3.5.2 Recherche d'un bien")
    R.p("La figure 5 détaille une recherche de bien. Le modèle intervient trois fois : pour classer, pour choisir "
        "les filtres, puis pour rédiger.")
    R.figure(F["seq_recherche"], "Diagramme de séquence : recherche d'un bien par l'assistant", width=15.5)
    R.p("Les annonces affichées viennent de l'API et non du modèle : celui-ci ne fait que traduire la demande en "
        "filtres, puis présenter le résultat. C'est ce qui permet de vérifier, dans nos tests, qu'aucune annonce "
        "n'est inventée.")
    R.h3("3.5.3 Question de marché")
    R.p("La figure 6 détaille une question sur les prix. L'agent reformule d'abord la question en requête de "
        "recherche, interroge le web, puis demande une synthèse au modèle.")
    R.figure(F["seq_marche"], "Diagramme de séquence : question sur les prix du marché", width=15.5)
    R.p("Le modèle doit citer le numéro de la source de chaque chiffre. Avant l'envoi au client, l'agent retire "
        "ces numéros, les adresses web et les noms des sites ; les sources citées restent enregistrées dans les "
        "métadonnées de la réponse.")
    R.h2("3.6 Sécurité")
    R.p(
        "La règle de conception est simple : **le modèle ne décide jamais des permissions**. Trois mécanismes "
        "l'appliquent. D'abord, Django transmet à n8n le jeton JWT de l'utilisateur, et l'agent le renvoie tel quel "
        "à l'API quand il appelle un outil ; c'est l'API qui accepte ou refuse. Ensuite, pour un utilisateur non "
        "connecté, les agents sensibles répondent par un refus avant tout appel au modèle. Enfin, le jeton n'est "
        "jamais inséré dans un prompt : le modèle ne le voit pas.",
        "Deux limites sont connues. Le contexte de l'utilisateur (ville, rôle, préférences) est, lui, inclus dans le "
        "prompt envoyé au modèle. Et le webhook de n8n n'est pas protégé par un jeton : il n'est accessible qu'en "
        "local dans notre installation.",
    )
    R.h2("3.7 Conclusion")
    R.p("La conception sépare nettement les rôles : l'API garde les données et les droits, n8n organise le "
        "raisonnement, et le modèle comprend et rédige. Le chapitre suivant présente la réalisation.")
