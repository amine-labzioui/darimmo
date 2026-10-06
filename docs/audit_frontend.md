# Audit et corrections du frontend Darimmo

- **Date** : 2026-10-04
- **Commit de départ** : `c79c0ad`
- **État** : modifications non commitées (voir sections 2 et 9)

Les sections 1 à 8 reprennent le résumé final établi à la fin de l'audit. La section 9 liste les corrections ajoutées ensuite (#31, #32, #33, le résumé du tableau de bord et les changements backend autorisés). Les sections 4.1 et 4.2 ont aussi été ajoutées après le résumé.

Colonne « Testé » des tableaux :

- **Étudiant** : confirmé explicitement par l'étudiant (message, capture d'écran ou fichier) ;
- **« done »** : correction acceptée par l'étudiant sans détail de test ;
- **Build** : seule vérification, `npm run build` réussi ;
- **Script** : vérification automatique hors navigateur.

---

## 1. Build final

`npm run build` (Vite 5.4.21) : **succès**, 2479 modules transformés, aucune erreur.

- `dist/assets/index-*.js` : 979,32 kB (gzip 274,69 kB)
- `dist/assets/index-*.css` : 71,44 kB (gzip 15,84 kB)
- Un avertissement, présent depuis l'audit initial : un chunk dépasse 500 kB après minification (non traité).

Le script `npm run lint` échoue depuis le début (aucun fichier de configuration ESLint dans le projet) ; non traité.

## 2. Fichiers modifiés (`git status`, aucun commit)

**Frontend — 38 fichiers modifiés, 2 créés**

- `src/App.jsx`
- `src/pages/` : `AgencyDashboardPage.jsx`, `CMISimulator.jsx`
- `src/services/` : `authService.js`, `clientService.js`
- `src/utils/` : `constants.js`, `helpers.js`
- `src/components/Admin/` : `TransactionManagement.jsx`
- `src/components/Agency/` : `AgencyVisitRequests.jsx`, `Dashboard.jsx`
- `src/components/Auth/` : `Login.jsx`, `Register.jsx`
- `src/components/Client/` : `Analytics.jsx`, `AnnonceDetail.jsx`, `ChangePassword.jsx`, `CreateAnnonce.jsx`, `Dashboard.jsx`, `EditAnnonce.jsx`, `Messages.jsx`, `MyAnnonces.jsx`, `Profile.jsx`, `VisitRequests.jsx`
- `src/components/Client/modals/` : `ContactModal.jsx`, `VisitRequestModal.jsx`
- `src/components/Client/sections/` : `BoostAnnonceCard.jsx`, `DescriptionSection.jsx`, `GallerySection.jsx`, `HeaderSection.jsx`, `SidebarSection.jsx`, `SimilarPropertiesSection.jsx`, `SimilarPropertyCard.jsx`
- `src/components/Dashboard/` : `BoostAnnonce.jsx`
- `src/components/Payment/` : `PaymentSuccess.jsx`
- `src/components/Public/` : `AIAssistant.jsx`, `AnnonceCard.jsx`, `FilterPanel.jsx`, `SearchAnnonces.jsx`
- `src/components/Shared/` : `Navbar.jsx`
- Créés : `public/placeholder-property.svg`, `src/components/Public/MarkdownText.jsx`

**Backend**

- `apps/client_dashboard/serializers.py` : modifié dans cette session (voir section 6).
- `darimmo_project/settings.py` : apparaît modifié (une ligne, `"apps.agency_dashboard"` dans `INSTALLED_APPS`), mais **pas par cette session**.
- `logs/django.log.5`, `logs/errors.log.5` : modifiés par l'exécution du serveur.

**Hors périmètre, non touché** : `n8n_workflows/`, `tests_ia/` (le fichier `tests_ia/resultats_tests_ia.zip` était déjà non suivi au début).

Les fichiers backend ajoutés ou modifiés après ce résumé sont listés en section 9.

## 3. Tableau des corrections

### 3.1 Corrections fonctionnelles

| # | Problème | Cause | Solution | Fichiers | Testé |
|---|---|---|---|---|---|
| 8 | Le jeton JWT s'affichait dans la console du navigateur | Deux `console.log` de débogage | Lignes supprimées | `CMISimulator.jsx` | Étudiant (aucun jeton dans la console) |
| 1, 2 | Page 404 après la création et après la suppression d'une annonce | Redirections vers `/tableau-de-bord/annonces/...`, route inexistante | Redirection selon le rôle (`/agence/...` ou `/client/...`) via `useAuth()` | `CreateAnnonce.jsx`, `EditAnnonce.jsx` | #1 : Étudiant (annonce créée avec un compte agence, redirection vers `/agence/annonces/12/modifier`) ; #2 : « done » |
| 4 | Bouton « Mes annonces » après paiement → 404 | Lien vers `/tableau-de-bord/mes-annonces` | Lien selon le rôle | `PaymentSuccess.jsx` | Étudiant (compte agence) |
| — | Dans « Mes annonces », un client était renvoyé à l'accueil | 4 liens `/agence/...` codés en dur, route réservée au rôle agence | Préfixe selon le rôle | `MyAnnonces.jsx` | « done » |
| 3 | Trois liens du tableau de bord client → 404 | Liens vers `/tableau-de-bord/...` | Liens `/client/visites`, `/client/recherches`, `/client/analytics` | `Client/Dashboard.jsx` | « done » |
| 5 | Les `**` du Markdown s'affichaient tels quels dans l'Assistant IA ; retours à la ligne perdus | Texte de la réponse affiché brut, aucune bibliothèque Markdown | Composant maison qui produit des éléments React (gras, italique, titres, listes, liens), sans `dangerouslySetInnerHTML` ni dépendance | `MarkdownText.jsx` (créé), `AIAssistant.jsx` | Étudiant + Script (31 réponses réelles de `tests_ia`, 0 `**` restant ; HTML malveillant échappé) |
| 6 | Ligne `Lien : http://localhost:5173/annonces/<id>` visible dans les réponses | Ajoutée par l'agent n8n de recherche, URL codée en dur | Ligne retirée si une carte de recommandation existe pour cet identifiant, sinon transformée en lien interne | `AIAssistant.jsx`, `MarkdownText.jsx` | Étudiant + Script (7 réponses concernées) |
| 9 | Bouton bloqué sur « Traitement du paiement... » en cas d'échec | Pas de `setLoading(false)` ni de message dans le `catch` | `finally` + message d'erreur (toast) | `CMISimulator.jsx` | « done » |
| 10 | « Paiement confirmé » affiché même si la vérification échoue | L'état `success` n'était jamais utilisé | Écran « Paiement non confirmé » si la vérification échoue ou si la transaction est absente | `PaymentSuccess.jsx` | « done » |
| 12 | Image cassée pour les annonces sans photo | Fichier `/placeholder-property.jpg` inexistant | Image SVG ajoutée et utilisée comme repli | `placeholder-property.svg` (créé), `helpers.js` | Étudiant (capture de « Mes annonces ») |
| 15 | `getVisitRequests` définie deux fois | Doublon dans l'objet de service, avec un `console.log` | Doublon supprimé | `clientService.js` | « done » |
| 18 | Bloc de code inaccessible (111 lignes) | Section placée après le `return` | Bloc supprimé | `Analytics.jsx` | « done » |
| 16 | Journaux de débogage dans la console | 19 `console.log`, dont un affichant la réponse de connexion (avec les jetons) | 16 supprimés ; 3 situés dans des `catch` convertis en `console.error` | `authService.js`, `AgencyDashboardPage.jsx`, `Agency/Dashboard.jsx`, `AgencyVisitRequests.jsx`, `BoostAnnonce.jsx` | « done » |
| 22 | Page statistiques : 4 cartes sans titre, chiffres en double, libellé « Performance » sans calcul de tendance, axe du graphique vide | Mauvais noms de props (`title` au lieu de `label`), deux grilles, `dataKey="name"` absent des données | Props corrigées, grille en double supprimée, « Performance » retiré, axe sur `short`, « Messages » renommé « Conversations » (la donnée compte des conversations) | `Analytics.jsx` | « done » |
| 11 | Lien de facture potentiellement `undefined/...` | `VITE_API_URL` lue sans valeur de repli | Même repli que `api.js`. Protection : le problème ne se produisait pas sur le poste de l'étudiant | `PaymentSuccess.jsx` | Étudiant (téléchargement de la facture) |
| 13 | `http://127.0.0.1:8000` codé en dur pour les images des visites ; image de repli externe | URL écrite dans le composant | Origine déduite de `VITE_API_URL` ; repli sur le placeholder local | `VisitRequests.jsx` | « done » |
| 23 | Erreur non gérée à la déconnexion (`AxiosError 400`) | Le backend répond toujours 400 (voir section 4) et le frontend ne capturait pas l'erreur, ce qui empêchait la mise à jour de l'interface | `catch` ajouté : la session locale est toujours vidée | `authService.js` | « done » |
| 25 | Boutons « Confirmer la nouvelle date » et « Annuler la demande » sans action | Aucun `onClick` ; les endpoints existent mais ne sont utilisés nulle part dans le frontend | Boutons masqués | `VisitRequests.jsx` | « done » |
| 26 | Valeurs codées en dur sur la page d'une annonce : date « 27 Juin 2026 », badge « Premium » et « Agent vérifié » pour tous, boutons cœur et partage sans action | Textes écrits dans les composants | Date réelle (`published_at`, sinon `created_at`) ; « Premium » seulement si le boost est actif ; « Agent vérifié » masqué ; cœur branché sur la fonction favoris existante ; partage masqué | `SidebarSection.jsx`, `HeaderSection.jsx`, `GallerySection.jsx`, `AnnonceDetail.jsx`, `helpers.js` | Étudiant (capture : cœur seul, pas de « Premium » sur un boost expiré) ; date : « done » |
| 28 | Demande de visite refusée (400) ; message du client perdu | Champ `client` obligatoire dans le serializer ; le frontend envoyait `message` au lieu de `client_message` | Backend : `client` en lecture seule ; frontend : champ `client_message` | `serializers.py` (backend), `VisitRequestModal.jsx` | « done » (corps du 400 confirmé par l'étudiant avant correction) |
| 27 | Bloc boost : « actuellement boostée » affiché sur un boost expiré ; bouton « Booster maintenant » envoyant de mauvais paramètres | Condition sur `is_boosted` seul ; `annonce_id` / `boost_plan_id` au lieu de `annonceId` / `boostPlanId` | Condition « boost actif » (`is_boosted` et date non dépassée) ; plans masqués pendant un boost actif ; appel corrigé ; même règle sur la page de boost dédiée | `BoostAnnonceCard.jsx`, `EditAnnonce.jsx`, `BoostAnnonce.jsx` | Étudiant (5 tests) |
| — | « Premium · Expiré » dans « Mes annonces », sans lien pour rebooster | Condition sur `is_boosted` seul | Condition « boost actif » | `MyAnnonces.jsx` | Étudiant (4 tests) |
| — | Badge « PREMIUM » sur les cartes d'annonces à boost expiré | Idem | Idem | `AnnonceCard.jsx` | « done » |
| — | Badge de statut sans couleur de fond | Classes Tailwind construites dynamiquement (`bg-${...}-100`), non générées | Correspondance statique statut → classes complètes | `constants.js`, `MyAnnonces.jsx`, `EditAnnonce.jsx` | Étudiant (« Mes annonces ») ; « Modifier l'annonce » : « done » ; présence des classes dans le CSS généré vérifiée |
| — | Boutons « Rechercher » et « Charger plus » sans action | Aucun `onClick` ; les filtres s'appliquent déjà à chaque changement | Boutons masqués | `SearchAnnonces.jsx` | Étudiant |
| — | Le filtre « Marrakech » ne renvoyait aucune annonce ; liste de 4 villes sans Agadir | Filtre exact côté API ; la base stocke `Marrakesh`, le frontend envoyait `Marrakech` | Liste commune valeur/libellé (`Marrakesh` affiché « Marrakech »), normalisation de la ville venant de l'URL, de la création et de la carte ; une ville hors liste renvoyée par la carte est ignorée | `constants.js`, `SearchAnnonces.jsx`, `FilterPanel.jsx`, `CreateAnnonce.jsx`, `EditAnnonce.jsx` | « done » ×3 ; requêtes sur l'API locale : `city=Marrakech` → 0, `city=Marrakesh` → 2 |
| — | Bannière : « des milliers d'annonces vérifiées » | Texte non fondé sur une donnée | Texte neutre | `SearchAnnonces.jsx` | « done » |
| 29 | Pastille sur l'icône des messages | Affichait le nombre total de conversations ; l'API ne fournit pas de nombre de non-lus | Pastille masquée (3 endroits), appel inutile supprimé ; carte « Messages non lus » renommée « Messages reçus » | `Navbar.jsx`, `Client/Dashboard.jsx` | « done » |
| — | Page « Mot de passe oublié » : fausse confirmation « E-mail envoyé » | Simple temporisation, aucun appel API ; aucun endpoint côté backend | Lien retiré, route redirigée vers `/connexion` ; fichier conservé | `Login.jsx`, `App.jsx` | « done » |
| 30 | Pas de page « Sécurité » dans l'espace agence | Lien et route absents | Lien et route ajoutés, composant existant réutilisé | `AgencyDashboardPage.jsx` | « done » |

### 3.2 Harmonisation du style (#24)

Constat : aucune échelle commune ; les tailles sont écrites dans chaque composant, et deux styles coexistaient (un sobre, un « grand »). Les variables de `variables.css` ne sont utilisées nulle part. Une échelle compacte a été définie puis appliquée page par page, uniquement par les classes CSS et la taille des icônes.

| Page | Fichiers | Testé |
|---|---|---|
| `/client/visites` | `VisitRequests.jsx` | Étudiant (validé sur capture) |
| `/agence` | `Agency/Dashboard.jsx` | « done » |
| `/agence/statistiques` | `Analytics.jsx` | « done » |
| `/client` | `Client/Dashboard.jsx` | « done » |
| `/agence/visites` | `AgencyVisitRequests.jsx` | « done » |
| Page de boost | `BoostAnnonce.jsx` | Étudiant (capture) |
| `/annonces/:id` (échelle « page publique », galerie réduite à 260 / 380 / 460 px) | les 6 fichiers de `sections/`, `AnnonceDetail.jsx` | Étudiant pour le haut de page (capture) ; reste : « done » |
| Fenêtres contact et visite | `ContactModal.jsx`, `VisitRequestModal.jsx` | Étudiant pour la fenêtre de visite (capture) |
| Messages | `Messages.jsx` | « done » |
| `/recherche` | `SearchAnnonces.jsx` | « done » |
| Barre de navigation | `Navbar.jsx` | « done » |
| Profil, mot de passe, connexion, inscription | `Profile.jsx`, `ChangePassword.jsx`, `Login.jsx`, `Register.jsx` | « done » |
| `/admin/transactions` | `TransactionManagement.jsx` | Build uniquement |

Pages volontairement exclues : page d'accueil, simulateur de paiement, page de confirmation de paiement.

### 3.3 Points de l'audit non retenus

- **#7** (cartes de recommandation de l'Assistant IA) : vérifié par l'étudiant, non reproduit ; les cartes s'affichent.
- **#17** (éléments sans `key` dans `BoostModal.jsx`) : signalé à tort lors de l'audit ; faux positif de l'analyse statique, sur un composant non utilisé.

## 4. Points signalés côté backend (non corrigés)

| Constat | Correction proposée |
|---|---|
| La déconnexion renvoie toujours 400 et le refresh token n'est jamais révoqué : `token.blacklist()` est appelé alors que l'application `rest_framework_simplejwt.token_blacklist` n'est pas installée | Ajouter l'application à `INSTALLED_APPS` et migrer (compatibilité avec Djongo à vérifier) |
| `SimulatePaymentView` active le boost à chaque appel, sans vérifier l'état de la transaction ; un nouveau boost écrase les jours restants (`boosted_until = maintenant + durée`) | Vérifier le statut de la transaction ; prolonger à partir de la date de fin existante |
| `is_boosted` reste vrai après l'expiration du boost (une fonction `remove_expired_boosts` existe dans `apps/payments/tasks.py` mais n'est appelée nulle part : voir 4.1) | Planifier la remise à zéro à l'expiration, ou utiliser un champ calculé |
| Facture : le jeton JWT passe dans l'URL (`?token=...`) | Authentification par en-tête |
| Les recommandations de l'Assistant IA ne contiennent pas `transaction_type` : le prix d'une location s'affiche comme une vente | Ajouter le champ au serializer |
| Aucun champ indiquant si le vendeur est vérifié dans le détail d'une annonce | Ajouter `owner_is_verified` |
| Modification d'une demande de visite côté client : tout statut est accepté sans validation ; pas de statut « annulée » | Valider les transitions ; ajouter le statut |
| L'API des visites côté agence ne renvoie ni le message ni le téléphone du client | Ajouter `client_message` et `client_phone` |
| Date proposée et message de l'agence lus dans `VisitRequestAction`, rempli seulement depuis l'espace admin | Unifier la source |
| Messagerie : `unread_count` codé à 0 ; les messages ne sont jamais marqués comme lus ; `unread_messages_count` du tableau de bord correspond donc au total reçu | Calculer les non-lus et marquer les messages à la lecture |
| Aucun endpoint de réinitialisation du mot de passe | À implémenter |
| Ville : filtre exact sans référentiel ; la base contient des orthographes venant d'OpenStreetMap (ex. « Ksar Sghir » suivi du nom en arabe) | Référentiel de villes côté serveur |
| Instructions `print()` de débogage dans plusieurs vues (paiement, messagerie) | À retirer |
| Boost d'une annonce non publiée accepté : `CreateCheckoutView` vérifie seulement que l'annonce appartient à l'utilisateur, pas son statut ; la simulation de paiement active ensuite le boost | Vérifier le statut de l'annonce (`published`) dans `CreateCheckoutView` |
| Modération non appliquée par l'API : une annonce créée a le statut « En attente de validation », mais l'action `POST /api/annonces/{id}/publier/` est autorisée au propriétaire, qui peut donc publier lui-même son annonce | Réserver la publication à l'administrateur, ou supprimer le statut d'attente si la validation n'est pas voulue |

### 4.1 Filtres ORM sur des champs booléens (Djongo)

Djongo ne traduit pas correctement les filtres booléens en requête MongoDB (constat déjà noté dans `apps/annonces/views.py`, où ces filtres sont appliqués en Python). Recherche faite dans tout `backend/` (filtres `=True` / `=False`, hors `__isnull`, hors affectations et créations d'objets) :

| Emplacement | Code | Endpoint ou usage | Constat dans le journal |
|---|---|---|---|
| `apps/client_dashboard/views.py` (résumé du tableau de bord) | `Message.objects.filter(recipient=user, is_read=False).count()` | `GET /api/client-dashboard/summary/` | Erreur 500 (`RecursionError` puis `DatabaseError` dans Djongo). **Corrigé** : voir section 9 |
| `apps/messaging/views.py`, ligne 132 | `self.get_queryset().filter(is_read=False).update(is_read=True)` | `POST /api/messaging/notifications/tout-marquer-lu/` | Erreur 500, 5 occurrences, dernière le 2026-10-04. **Corrigé** : voir section 9 |
| `apps/payments/tasks.py`, ligne 8 | `Annonce.objects.filter(is_boosted=True, boosted_until__lt=...)` | Fonction `remove_expired_boosts` (remise à zéro des boosts expirés) | Aucun appel trouvé dans le code (pas de planification Celery) : la fonction n'est jamais exécutée, ce qui explique que `is_boosted` reste vrai après expiration. Non corrigé ; l'affichage est protégé côté frontend par `isBoostActive` (voir section 8) |
| `apps/admin_dashboard/views.py`, ligne 112 | `Case(When(is_boosted=True, then=0), ...)` dans une annotation | `GET /api/admin-dashboard/annonces/` | Aucune erreur 500 dans le journal pour cet endpoint. Non vérifié davantage |
| `apps/admin_dashboard/views.py`, ligne 68 | `filterset_fields = ["role", "is_active", "is_verified", "city"]` | `GET /api/admin-dashboard/utilisateurs/?is_active=...` (filtres passés par l'URL) | Risque seulement si ces paramètres sont envoyés ; aucune erreur 500 dans le journal. Non vérifié davantage |

Correction proposée pour les cas non corrigés : filtrer en Python après lecture (comme dans `apps/annonces/views.py`) ou supprimer le critère booléen de la requête.

### 4.2 Endpoints en erreur 500 dans `backend/logs/django.log`

Relevé du 2026-10-04 sur `django.log` et `django.log.5` (période couverte : 2026-07-16 → 2026-10-04), 122 réponses 500 au total. Les identifiants et les paramètres d'URL ont été retirés avant le comptage.

| Endpoint | Occurrences | Dernière date | Cause |
|---|---|---|---|
| `GET /api/client-dashboard/summary/` | 90 | 2026-10-04 22:02 | Filtre booléen `is_read=False` (voir 4.1). Corrigé le 2026-10-04 ; les occurrences sont antérieures ou contemporaines de la correction |
| `POST /api/messaging/notifications/tout-marquer-lu/` | 5 | 2026-10-04 20:48 | Filtre booléen `is_read=False` (voir 4.1). Corrigé le 2026-10-04 |
| `POST /api/annonces` | 1 | 2026-10-01 22:21 | Antérieure aux corrections de filtrage, non analysée. Endpoint fonctionnel le 2026-10-04 : création d'une annonce réussie lors du test de l'étudiant |
| `POST /api/annonces/mes_annonces` | 3 | 2026-10-01 22:16 | Antérieure aux corrections de filtrage, endpoint fonctionnel lors des tests du 2026-10-04, non analysée |
| `GET /api/annonces/` | 10 | 2026-10-01 20:04 | Antérieure aux corrections de filtrage, endpoint fonctionnel lors des tests du 2026-10-04, non analysée |
| `GET /api/messaging/notifications/` | 10 | 2026-07-18 18:47 | Antérieure aux corrections de filtrage, endpoint fonctionnel lors des tests du 2026-10-04, non analysée |
| `GET /api/messaging/conversations/` | 2 | 2026-07-18 18:35 | Antérieure aux corrections de filtrage, endpoint fonctionnel lors des tests du 2026-10-04, non analysée |
| `GET /api/users/me/` | 1 | 2026-07-18 18:34 | Antérieure aux corrections de filtrage, endpoint fonctionnel lors des tests du 2026-10-04, non analysée |

## 5. Points signalés côté n8n (non corrigés)

- **Agent Recherche** : ajoute `Lien : http://localhost:5173/annonces/<id>` à la réponse, avec l'URL du frontend codée en dur. Traité à l'affichage côté frontend ; le texte reste enregistré tel quel dans l'historique.
- **Agent Communication** : ajoute le même type de lien dans le message envoyé au propriétaire (visible dans la messagerie) et appelle l'API Django par une URL codée en dur (`http://127.0.0.1:8000/...`).
- **Normalisation des villes** : la table de correspondance (`marrakech` → `Marrakesh`, etc.) n'existe que dans le workflow de l'Agent Recherche. Le frontend en contient maintenant une copie ; deux tables sont donc à maintenir.

## 6. Correction backend autorisée et faite

**#28** — `backend/apps/client_dashboard/serializers.py` : ajout de `"client"` dans `read_only_fields` de `VisitRequestSerializer`. Avant, toute création de demande de visite renvoyait `{"client": ["Ce champ est obligatoire."]}` (réponse confirmée par l'étudiant). Vérification préalable : aucun autre code n'envoie `client` dans une demande de visite. Cette modification nécessite de relancer le serveur.

À la date du résumé, c'était la seule modification du backend. Les modifications backend autorisées ensuite (facture PDF, `requirements.txt`, import inutile) sont décrites en section 9.

## 7. Code mort (fichiers présents mais non affichés)

- `components/Payment/BoostModal.jsx`, `PaymentModal.jsx`, `BoostOptions.jsx`
- `components/Dashboard/Boost/BoostPaymentModal.jsx`, `BoostPlans.jsx`, `BoostSuccess.jsx`, `BoostCard.jsx`
- `components/Agency/VisitRequestModal.jsx` (importé mais jamais rendu)
- `components/Auth/ForgotPassword.jsx` (conservé volontairement, plus importé)
- Dans des fichiers utilisés : fonction `reprogramVisit` (`AgencyVisitRequests.jsx`), calculs `topAnnonce` et `pieData` (`Analytics.jsx`), champ `color` de `ANNONCE_STATUS`, variables de `styles/variables.css`

## 8. Limites et perspectives

**Fonctionnalités masquées faute de support complet**

- Réinitialisation du mot de passe par e-mail.
- Annulation et confirmation d'une demande de visite par le client.
- Pagination de la recherche : l'API renvoie 12 annonces par page, le frontend n'affiche que la première (« Charger plus » masqué, non testable avec 9 annonces publiées).
- Partage d'une annonce ; indicateur « Agent vérifié » ; pastille de messages non lus.

**Limites connues du frontend**

- Villes : seules 6 villes sont acceptées ; une ville hors liste renvoyée par la carte est ignorée. La page « Modifier l'annonce » n'a pas de champ « Ville » : elle ne change que par un clic sur la carte.
- Les routes `/client/*` ne sont pas protégées par rôle côté frontend (une agence peut y accéder par l'URL) ; les permissions restent appliquées par l'API.
- Publication sans validation : sur « Modifier l'annonce », une annonce affichée « En attente de validation » peut être publiée par son propriétaire avec le bouton « Publier cette annonce » ; la modération par l'administrateur n'est pas appliquée par l'API (voir section 4). Non modifié.
- Le compteur de notifications ne tient compte que de la première page (12).
- Boosts expirés : la fonction backend `remove_expired_boosts` n'est pas planifiée, `is_boosted` reste donc vrai après l'expiration. L'affichage est protégé côté frontend par `isBoostActive` (badge « Premium », plans de boost). Perspective : planifier la remise à zéro.
- Le message du client dans une demande de visite est enregistré mais affiché nulle part.
- `/agence/visites` : compteurs « Confirmées » et « Refusées » toujours à 0 et couleur du badge incorrecte (le code teste `approved` / `rejected` au lieu de `accepted` / `refused`) ; fenêtre « Reprogrammer » rendue une fois par demande. *(Compteurs et couleur corrigés ensuite : voir #31, section 9.)*
- Tableau de bord client : libellé « Performance » avec flèche sans calcul de tendance, libellé « DarImmo Premium » décoratif, « Annonces publiées » affichant un tiret fixe. *(Voir #32, section 9.)*
- La barre latérale du client ne contient pas « Mes annonces » ; `/agence/annonces/<id>` (sans `/modifier`) affiche une page vide.
- Les liens de ville du pied de page n'ont pas d'effet quand on est déjà sur `/recherche`.
- Le cœur des favoris ne change pas d'état après l'ajout.
- Affichage mobile non revu pour la messagerie, le tableau des statistiques et `/agence/visites`.

**Points de l'audit laissés en l'état** : liens `href="#"` du pied de page (#19), configuration ESLint absente (#20), imports et variables inutilisés (#21), avertissement de taille du bundle, directives `@tailwind` déclarées deux fois.

**Méthode et réserves**

- Les corrections ont été faites une par une ; aucune n'a été observée dans un navigateur par l'outil. Les vérifications automatiques se limitent au build, à des scripts hors navigateur et à des requêtes de lecture sur l'API locale.
- Deux affirmations faites en cours de session ont été corrigées ensuite : le test proposé pour le lien « Voir les statistiques » (visible seulement pour une agence), et la description du bouton « Reprogrammer » côté agence (il envoie le statut `accepted`, pas `rescheduled`).

---

## 9. Ajouts après le résumé

### 9.1 Corrections

| # | Problème | Cause | Solution | Fichiers | Testé |
|---|---|---|---|---|---|
| 33 | Facture PDF : adresse, e-mail et téléphone de l'émetteur inventés ; « ✓ Paiement confirmé » affiché quel que soit le statut ; numéro dépendant de l'année du téléchargement ; pas de mode de paiement ni de période ; slogan chevauchant le titre | Textes fixes dans `InvoiceView`, aucune vérification du statut, `timezone.now().year` dans le numéro | Nouvelle mise en page sobre (en-tête, émetteur / client, tableau désignation / durée / période / montant, total, mode de paiement, référence, statut, mention « projet académique – sans valeur fiscale ») ; uniquement des données réelles ; facture refusée (400) si le paiement n'est pas réussi ; dates converties dans le fuseau `Africa/Casablanca` ; numéro basé sur l'année de la transaction ; période calculée (date de la transaction + durée du plan) ; mode « CMI (simulation) » ; pas de TVA | `backend/apps/payments/invoice_pdf.py` (créé), `backend/apps/payments/views.py` | Étudiant (facture de la transaction 67 générée et fournie en PDF) ; Script (2 PDF de test hors Django, `manage.py check` sans erreur). Test de la transaction 58 et cas de refus (400) : non confirmés |
| 31 | `/agence/visites` : compteurs « Confirmées » et « Refusées » toujours à 0 ; badge « Confirmée » / « Refusée » affiché avec la couleur de « En attente » | Le code testait `approved` / `rejected`, alors que les statuts du modèle `VisitRequest` sont `pending`, `accepted`, `rescheduled`, `refused`, `completed` | Statuts `accepted` et `refused` utilisés pour les deux compteurs et pour la couleur du badge | `frontend/src/components/Agency/AgencyVisitRequests.jsx` | Étudiant (compteurs et couleur du badge confirmés, après rechargement forcé de la page) |
| 32 | Tableau de bord client : libellé « Performance » avec flèche sur les 4 cartes, sans calcul de tendance ; carte « Annonces publiées » avec un tiret fixe | Texte et icône fixes dans le composant ; l'API du tableau de bord (`/client-dashboard/summary/`) ne renvoie pas de nombre d'annonces publiées (champs : favoris, demandes de visite, visites en attente, recherches sauvegardées, messages) | Libellé « Performance » et flèche supprimés ; carte « Annonces publiées » masquée (bloc visible seulement pour une agence) | `frontend/src/components/Client/Dashboard.jsx` | Étudiant pour les 4 cartes (capture de `/client`, compte client) ; bloc réservé à l'agence : Build uniquement |
| — | Dans le même bloc (visible seulement pour une agence), le libellé « Visites générées » ne correspondait pas à la donnée | La valeur affichée est `visit_requests_count`, qui compte les demandes de visite faites par l'utilisateur lui-même, et non les visites reçues sur ses annonces | Libellé renommé « Mes demandes de visite » (texte seulement) | `frontend/src/components/Client/Dashboard.jsx` | Build uniquement |
| — | Tableau de bord (`/client`, et bloc de l'agence) : les compteurs Favoris, Demandes de visite, Recherches sauvegardées et Messages reçus affichaient tous 0 alors que des données existent | L'endpoint `GET /api/client-dashboard/summary/` renvoyait une erreur 500 (filtre booléen `is_read=False` non supporté par Djongo, 90 occurrences dans le journal depuis juillet) ; le frontend remplaçait silencieusement l'échec par des 0 | Backend (une ligne autorisée) : `Message.objects.filter(recipient=user).count()`, sans le filtre booléen. Frontend : en cas d'échec de l'appel, les cartes affichent « — » au lieu de 0 | `backend/apps/client_dashboard/views.py`, `frontend/src/components/Client/Dashboard.jsx` | Build et compilation Python ; test de l'étudiant en attente |
| — | Notifications : le bouton « Tout marquer comme lu » échouait (erreur 500) | `filter(is_read=False).update(...)` : filtre booléen non supporté par Djongo (5 occurrences dans le journal) | Backend (correction autorisée) : lecture des notifications de l'utilisateur, sélection en Python de celles qui ne sont pas lues, puis `save(update_fields=["is_read"])` pour chacune | `backend/apps/messaging/views.py` | Étudiant (4 tests : réponse 200, pastille masquée, état conservé après rechargement) |
| 24 | Bloc « Booster cette annonce » de la page « Modifier l'annonce » encore dans le style « grand » | Fichier non traité lors de l'harmonisation | Échelle compacte appliquée (classes CSS uniquement) | `frontend/src/components/Client/sections/BoostAnnonceCard.jsx` | Étudiant (capture de « Modifier l'annonce », annonce 12 publiée : 3 plans compacts) |
| 34 | Les plans de boost étaient proposés pour une annonce non publiée (« En attente de validation », brouillon, vendue…), alors qu'une telle annonce n'apparaît pas dans la recherche | Aucune condition sur le statut de l'annonce côté frontend ; le backend accepte aussi ce boost (voir section 4) | Plans masqués si l'annonce n'est pas publiée, avec une phrase : « Le boost sera disponible après la publication de l'annonce. » (brouillon, en attente) ou « Le boost est réservé aux annonces publiées. » (vendue, louée, archivée). Même règle sur la page de boost dédiée ; dans « Mes annonces », le lien « Booster cette annonce » n'apparaît que pour une annonce publiée | `frontend/src/utils/helpers.js`, `frontend/src/components/Client/sections/BoostAnnonceCard.jsx`, `frontend/src/components/Dashboard/BoostAnnonce.jsx`, `frontend/src/components/Client/MyAnnonces.jsx` | Étudiant (3 tests et captures : annonce 12 en attente sans plans sur « Modifier l'annonce » et sur la page de boost, sans lien dans « Mes annonces » ; plans et lien de nouveau visibles après publication ; annonce 8 inchangée) ; Script (phrase vérifiée pour les 6 statuts) |

Limite restante sur `/agence/visites` après #31 : les statuts `rescheduled` et `completed` s'affichent avec le libellé « En attente » ; la fenêtre « Reprogrammer » est toujours rendue une fois par demande.

Limite de #33 : la période est calculée à partir de la date de création de la transaction, la date réelle du paiement et la date de fin n'étant pas stockées sur la transaction.

### 9.2 Changements backend autorisés (hors facture)

| Changement | Raison | Fichier | Vérification |
|---|---|---|---|
| Ajout de `reportlab==5.0.0` | La bibliothèque est utilisée pour la facture mais n'était pas déclarée ; version relevée dans l'environnement virtuel du projet (`pip show reportlab`) | `backend/requirements.txt` | Version lue dans le `venv` |
| Suppression de `from turtle import title` | Import inutilisé (le nom est masqué par une variable locale) et dépendant de `tkinter`, absent sur un serveur sans interface graphique | `backend/apps/payments/views.py` | Recherche des usages de `title` dans le fichier ; `manage.py check` sans erreur |

| Résumé du tableau de bord : suppression du filtre booléen `is_read=False` | Le filtre provoquait une erreur 500 avec Djongo ; le champ `is_read` des messages n'est par ailleurs jamais mis à vrai, la valeur est donc inchangée (nombre de messages reçus) | `backend/apps/client_dashboard/views.py` | Compilation Python ; test de l'étudiant en attente |
| « Tout marquer comme lu » : filtre booléen remplacé par une sélection en Python | Le filtre `is_read=False` provoquait une erreur 500 avec Djongo | `backend/apps/messaging/views.py` | Étudiant (4 tests) |

Les imports ReportLab devenus inutiles dans `views.py` ont été retirés avec la réécriture de `InvoiceView`.

### 9.3 Fichiers ajoutés ou modifiés après le résumé

- Backend : `apps/payments/invoice_pdf.py` (créé), `apps/payments/views.py`, `requirements.txt`, `apps/client_dashboard/views.py`, `apps/messaging/views.py`
- Frontend : `src/components/Agency/AgencyVisitRequests.jsx` (#31), `src/components/Client/Dashboard.jsx` (#32, résumé), `src/components/Client/sections/BoostAnnonceCard.jsx` (style, #34), `src/components/Dashboard/BoostAnnonce.jsx` (#34), `src/components/Client/MyAnnonces.jsx` (#34), `src/utils/helpers.js` (#34)
- Documentation : `docs/audit_frontend.md` (ce fichier)

## 10. Espace administrateur (#36)

Audit en lecture seule des pages `/admin/*` réalisé le 2026-10-04, après le commit `ef88df2`. État de la base au moment de l'audit : 11 annonces, toutes au statut « publiée » et de type « vente » ; 9 demandes de visite (8 acceptées, 1 refusée) ; 67 transactions (6 réussies, 61 en attente) ; 4 utilisateurs.

### 10.1 Corrections

| # | Problème | Cause | Correction | Fichier | Testé |
|---|---|---|---|---|---|
| A1 | Page « Annonces » de l'admin : onglet « Publiées » vide (erreur 500), autres onglets toujours vides, actions de modération inutilisables | La requête de la vue contenait une annotation `Case(When(is_boosted=True…))` que Djongo ne sait pas traduire (`DatabaseError` à la lecture des lignes, alors que le comptage renvoie 11), et un filtre de base sur le statut « publiée » qui excluait tous les autres statuts ; le frontend affichait « Aucune annonce » en cas d'erreur | Backend (correction autorisée) : `queryset = Annonce.objects.all().order_by("-created_at")` | `backend/apps/admin_dashboard/views.py` | Script (lecture seule : 11 annonces lues et sérialisées, annonce 12 trouvée ; `manage.py check` sans erreur) ; Étudiant (captures : l'onglet « Publiées » affiche la liste ; l'annonce 11 vendue apparaît dans l'onglet « Vendues »). Non testé : « Approuver » et « Rejeter » (aucune annonce en attente dans la base) |
| A2 | Vue d'ensemble : cartes « Demandes de visite » et « Demandes en attente » sans chiffre | La vue calcule 4 valeurs `visit_*`, mais le serializer des statistiques ne les déclarait pas : elles n'étaient pas envoyées | Backend (correction autorisée) : ajout des 4 champs au serializer | `backend/apps/admin_dashboard/serializers.py` | Script (les 4 champs sont présents dans le serializer) ; Étudiant (capture de `/admin` : « Demandes de visite » = 9, « Demandes en attente » = 0) |
| A5 | Modération : pas d'onglet « Archivées » ni d'actions « Archiver » / « Republier » pour l'admin | Les onglets ne couvraient que 4 statuts ; aucune action de ce type n'était proposée | Onglet « Archivées » ; bouton « Archiver » (avec confirmation) dans « Publiées » ; bouton « Republier » dans « Archivées ». Appels aux actions `archiver` et `publier` des annonces, autorisées au propriétaire ou à l'admin. Les onglets « Vendues » et « Louées » restent en lecture seule (règle métier : l'admin ne marque pas un bien vendu ou loué) | `frontend/src/components/Admin/AnnonceModeration.jsx` | Étudiant (annonce « Bel appartement centre-ville » : « Archiver » → présente dans « Archivées » avec « Republier » → « Republier » → de nouveau dans « Publiées ») |
| A4 | Pages admin (annonces, utilisateurs, transactions, demandes de visite) : une erreur de l'API s'affichait comme une liste vide (« Aucune annonce »…) | Le bloc `catch` vidait la liste sans signaler l'erreur | Message « Chargement impossible » distinct de l'état vide | `frontend/src/components/Admin/AnnonceModeration.jsx`, `UserManagement.jsx`, `TransactionManagement.jsx`, `VisitRequestManagement.jsx` | Étudiant pour `/admin/annonces` (serveur arrêté, clic sur l'onglet « Vendues » : « Chargement impossible »), `/admin/utilisateurs` et `/admin/transactions` (captures, serveur arrêté puis rechargement de la page, après #38) ; `/admin/visites` non vérifié |
| 38 | Une panne du serveur déconnectait l'utilisateur : au chargement d'une page, il était redirigé vers `/connexion` | Au démarrage, `AuthContext` appelle `GET /users/me/` et vidait l'utilisateur pour toute erreur, y compris l'absence de réponse ; `ProtectedRoute` redirigeait alors vers la connexion. L'intercepteur axios vidait aussi la session quand le rafraîchissement du jeton échouait pour une raison réseau | Déconnexion seulement sur une réponse 401 (profil) ou sur un rafraîchissement refusé par le serveur ; en cas d'erreur réseau, la session locale est conservée et l'erreur remonte au composant | `frontend/src/context/AuthContext.jsx`, `frontend/src/services/api.js` | Étudiant (captures : serveur arrêté, rechargement de `/admin/utilisateurs` et de `/admin/transactions` : « Chargement impossible », toujours connecté ; serveur relancé : la liste des transactions revient ; déconnexion et connexion normales) |
| A3 | Page « Transactions » : revenu et compteurs calculés sur les 12 premières transactions seulement (capture de l'étudiant : 12 transactions, 4 réussies, 196 MAD, alors que la base en contient 67 dont 6 réussies) | L'API est paginée par 12 et la page ne lisait que la première page | Lecture de toutes les pages avant le calcul des totaux et l'affichage du tableau | `frontend/src/components/Admin/TransactionManagement.jsx` | Étudiant (67 transactions, 6 réussies, 61 en attente, revenu 294 MAD = 6 × 49, cohérent avec la base) |
| 39 | Page « Transactions » : après A3, le tableau affichait les 67 lignes sur une seule page | Ajout demandé par l'étudiant | Pagination côté client (10 lignes par page, « Précédent » / « Suivant », « Page X sur Y ») et filtre par statut (« Toutes », « Réussies », « En attente » ; « Échouées » et « Remboursées » seulement si ce statut existe) qui revient à la page 1. Les 4 cartes restent calculées sur toutes les transactions | `frontend/src/components/Admin/TransactionManagement.jsx` | Étudiant (« Toutes » : 67 transactions, page 1 sur 7, 10 lignes ; « Réussies » : 6, page 1 sur 1, boutons désactivés ; « En attente » : 61 ; les 4 cartes ne changent pas avec le filtre) |
| A6 | Demandes de visite (admin) : statut affiché en anglais (`accepted`, `refused`…) et statut « effectuée » en rouge ; transactions : fournisseur affiché « Cmi » | Valeur brute de l'API affichée telle quelle | Libellés français identiques à ceux du modèle du backend (« En attente », « Acceptée », « Nouvelle date proposée », « Refusée », « Effectuée ») ; « Effectuée » en gris ; fournisseur « CMI » / « Stripe » ; « Date souhaitée » affichée avec `formatDateTime` (sans les secondes), comme dans le reste du site | `frontend/src/components/Admin/VisitRequestManagement.jsx`, `frontend/src/components/Admin/TransactionManagement.jsx` | Étudiant (`/admin/visites` : « Acceptée » (8) et « Refusée » (1) ; `/admin/transactions` : « CMI » ; « Date souhaitée » : « 12 oct. 2026, 19:00 ») |
| A9 | Utilisateurs : « X compte(s) au total » comptait les lignes de la première page ; l'admin pouvait suspendre son propre compte | Le total était `users.length` alors que l'API est paginée ; aucune condition sur le compte connecté | Total lu dans le champ `count` de l'API ; bouton « Suspendre » masqué sur la ligne du compte connecté | `frontend/src/components/Admin/UserManagement.jsx` | Étudiant (« 4 compte(s) au total » ; pas d'icône « Suspendre » sur la ligne de l'admin connecté) |
| A10 | Demandes de visite (admin) : messages affichés avec `alert()` du navigateur | Style différent du reste du site, qui utilise des notifications | `alert()` remplacé par les notifications du site (erreurs), et notification de succès ajoutée après « Accepter », « Refuser » et « Modifier date ». La saisie du motif de rejet d'une annonce (`prompt()` dans la modération) est conservée : la remplacer demanderait une fenêtre de saisie, donc un nouveau composant | `frontend/src/components/Admin/VisitRequestManagement.jsx` | Build ; non vérifié dans le navigateur (aucune demande de visite « en attente » dans la base, les boutons ne sont donc pas affichés) |
| — | Surfaces affichées « 90.00 », « 180.00 » (cartes de `/recherche`) et « 80.00 m² » (page d'une annonce) ; type « appartement » sans majuscule dans les cartes du haut de la page d'une annonce | Valeur décimale de l'API affichée telle quelle | Surface formatée sans décimales inutiles (« 90 m² ») avec `formatSurface`, qui existait déjà sans être utilisée ; libellé du type de bien (« Appartement ») | `frontend/src/utils/constants.js`, `frontend/src/components/Public/AnnonceCard.jsx`, `frontend/src/components/Client/sections/HeaderSection.jsx`, `DescriptionSection.jsx`, `SimilarPropertyCard.jsx` | Étudiant (« 90 m² », « 80 m² », « 200 m² » et « Appartement » sur `/annonces/11`, `/annonces/12` et l'accueil) |
| 40 | « Modifier l'annonce » : le quartier rempli depuis la carte contenait le nom en plusieurs langues (« Guéliz ⴳⵉⵍⵉⵣ گليز », « Arrondissement du Maârif … مقاطعة المعاريف ») | L'appel de géocodage inverse à Nominatim ne précisait pas la langue : le service renvoyait le nom par défaut d'OpenStreetMap, multilingue au Maroc | Paramètre `accept-language=fr` ajouté à l'appel. Vérifié par 4 appels réels (Guéliz et Maârif, avec et sans le paramètre) : « Guéliz », « Marrakech », « Arrondissement du Maârif », « Casablanca ». L'ordre des champs est conservé (`suburb`, puis `neighbourhood`, puis `quarter`) | `frontend/src/components/Client/EditAnnonce.jsx` | Script (appels à Nominatim) ; Étudiant (clic sur la carte près du Maârif : adresse entièrement en français, ville « Casablanca » acceptée) |
| 24 | Pages admin encore dans le style « grand » | Pages non traitées lors de l'harmonisation | Échelle compacte appliquée (classes CSS et dimensions des graphiques uniquement), une page à la fois. Fait : Vue d'ensemble (`/admin`) et Utilisateurs (`/admin/utilisateurs`, test en attente). Sur la vue d'ensemble, avec en plus, dans les graphiques, l'étiquette des parts à 0 masquée, les parts à 0 non dessinées (légende complète conservée) et la bordure blanche des parts supprimée | `frontend/src/components/Admin/AdminDashboard.jsx`, `UserManagement.jsx` | Étudiant (cartes compactes, chiffres 4, 11, 11, 0, 9, 0 ; le « 0 » isolé a disparu ; « 2 » et « 1 » toujours affichés dans « Répartition des utilisateurs »). « Statut des annonces » sans ligne blanche, « 11 » affiché, légende complète ; « Répartition des utilisateurs » lisible sans bordure ; infobulle « Publiées : 11 ») |
| — | Vue d'ensemble : le graphique « Statut des annonces » n'avait pas de part « Archivées », alors que l'admin peut archiver une annonce (A5) | L'API des statistiques ne renvoyait pas ce compteur | Backend (correction autorisée) : compteur `annonces_archived` ajouté à la vue et au serializer des statistiques. Frontend : part « Archivées » (gris) dans le graphique et sa légende | `backend/apps/admin_dashboard/views.py`, `backend/apps/admin_dashboard/serializers.py`, `frontend/src/components/Admin/AdminDashboard.jsx` | Étudiant (après relance du serveur, annonce 11 : légende à 5 statuts, « Archivées » en gris ; « Archiver » → annonce dans l'onglet « Archivées », `/admin` affiche 10 publiées + 1 archivée ; « Republier » → annonce de retour dans « Publiées », onglet « Archivées » vide, `/admin` affiche de nouveau 11) |
| — | Page d'une annonce, bloc « Informations » : statut affiché en anglais (« Published ») et surface affichée « 80 M² » | Valeur brute de l'API pour le statut ; majuscule appliquée par le style du bloc à l'unité de surface | Libellé français du statut (`ANNONCE_STATUS`) ; unité « m² » exclue de la mise en majuscule | `frontend/src/components/Client/sections/DescriptionSection.jsx` | Build ; test de l'étudiant en attente |

Les imports `Case`, `When` et `IntegerField` de `admin_dashboard/views.py` ne sont plus utilisés après A1 ; ils ont été laissés en place (changement autorisé limité à la ligne `queryset`).

### 10.2 Points signalés, non corrigés

| # | Constat | Preuve | Nature |
|---|---|---|---|
| A7 | 61 transactions sur 67 sont « en attente » : chaque clic sur « Choisir » ou « Booster maintenant » crée une transaction, même sans paiement | Comptage en base (lecture seule) | Backend |
| A8 | Les demandes de visite de l'admin utilisent la permission `IsAdminUser` (`is_staff`), alors que les autres vues admin utilisent `IsAdminRole` (rôle « admin » ou `is_staff`) | `backend/apps/admin_dashboard/views.py`, classe `AdminVisitRequestViewSet` | Backend |
| A11 | `frontend/src/services/adminService.js` n'est importé nulle part ; `analyticsService.getActivityLog` n'est pas appelé (le journal d'audit du backend n'a pas de page) | Recherche des imports | Code mort |

### 10.3 Statut d'une annonce par son propriétaire (#35)

Constat avant correction : le propriétaire ne disposait que du bouton « Publier cette annonce ». Aucun bouton « Vendue », « Louée » ou « Archiver » n'existait ; `annonceService.marquerVendue` n'était appelé par aucun composant ; le backend n'avait pas d'action pour « louée » ni pour « archiver », et le statut n'est pas modifiable par `PATCH /annonces/<id>/`.

| # | Problème | Correction | Fichier | Testé |
|---|---|---|---|---|
| 35 | Faille de permission : l'action `marquer_vendue` n'exigeait qu'un utilisateur connecté, un utilisateur pouvait donc marquer comme vendue l'annonce d'un autre (constat par lecture du code, non exécuté) | Backend (correction autorisée) : `marquer_vendue`, `marquer_louee` et `archiver` exigent le propriétaire ou un admin (`IsOwnerOrAdmin`) | `backend/apps/annonces/views.py` | Script (permissions listées par action) |
| 35 | Pas d'action « louée » ni « archiver » ; « vendue » acceptée sur une annonce de location | Backend (correction autorisée) : actions `marquer_louee` et `archiver` ; refus 400 si le type de transaction ne correspond pas | `backend/apps/annonces/views.py` | Étudiant pour « vendue » (voir ligne suivante) ; `manage.py check` sans erreur ; « louée », « archiver » et le refus 400 non testés |
| 35 | Le propriétaire ne pouvait pas changer le statut de son annonce | Page « Modifier l'annonce » : « Marquer comme vendue » (vente) ou « Marquer comme louée » (location) et « Archiver » sur une annonce publiée ; « Republier » sur une annonce vendue, louée ou archivée ; confirmation puis notification | `frontend/src/components/Client/EditAnnonce.jsx`, `frontend/src/services/annonceService.js` | Étudiant (captures, annonce 11 : « Marquer comme vendue » → badge « Vendue », bouton « Republier », plans de boost remplacés par « Le boost est réservé aux annonces publiées. » ; « Republier » → notification « Annonce publiée », badge « Publiée », boost actif conservé jusqu'au 11 octobre 2026). Recherche filtrée sur Marrakech : l'annonce 11 vendue n'apparaît pas, 2 biens affichés. Non testé : « Archiver », « Marquer comme louée » |
| 35 | Dans « Mes annonces », une annonce vendue affichait encore « Premium · Expire dans 7 jours » (capture de l'étudiant, annonce 11) | `isBoostActive` renvoie faux si l'annonce n'est pas publiée : « Premium » n'apparaît que sur une annonce publiée | `frontend/src/utils/helpers.js` | Étudiant (`/annonces/11` vendue : le badge « Premium » a disparu ; « Mes annonces » : l'annonce 11 « Vendue » n'affiche plus « Premium ») |

Limite : la base ne contient que des annonces de vente, « Marquer comme louée » n'a donc pas pu être essayé sur une annonce existante.

### 10.4 Page publique d'une annonce non publiée (#37)

Constat (étudiant, visiteur non connecté) : après « Marquer comme vendue », `/annonces/11` s'affichait normalement, avec le badge « À vendre » et les boutons de contact. L'API renvoie bien le champ `status` (valeur `sold` pour l'annonce 11, vérifiée en lecture seule avec le serializer du détail) ; le backend ne filtre que la liste de recherche sur le statut « publiée ».

| # | Problème | Correction | Fichier | Testé |
|---|---|---|---|---|
| 37 | Une annonce vendue, louée, archivée ou non encore publiée s'affichait comme une annonce disponible | Quand le statut n'est pas « publiée » : bandeau en haut de page (« Cette annonce n'est plus disponible : le bien a été vendu. » / « … le bien a été loué. » / « … elle a été archivée. » / « Cette annonce n'est pas encore publiée. ») ; badge du statut à la place de « À vendre » / « À louer » ; cœur des favoris, « Contacter le vendeur », « Programmer une visite » et « Ajouter aux favoris » masqués, ainsi que le téléphone et l'adresse e-mail du propriétaire (son nom reste affiché). La page reste accessible par son URL | `frontend/src/utils/helpers.js`, `frontend/src/components/Client/AnnonceDetail.jsx`, `frontend/src/components/Client/sections/GallerySection.jsx`, `frontend/src/components/Client/sections/SidebarSection.jsx` | Étudiant (visiteur non connecté, `/annonces/11` vendue : bandeau « le bien a été vendu », badge « Vendue », pas de cœur, 3 boutons masqués). Téléphone et e-mail masqués : testé. L'annonce 11 a ensuite été republiée ; retour à la normale de la page publique non confirmé |

Limites (backend, non corrigées) :

- le téléphone et l'adresse e-mail du propriétaire restent présents dans la réponse de l'API pour une annonce non publiée ; ils sont seulement masqués à l'affichage ;
- le compteur de vues (`views_count`) continue d'augmenter sur une annonce non publiée ;
- le propriétaire connecté voit le même bandeau que les visiteurs (pas d'aperçu distinct).

### 10.5 Fuseau horaire

Selon l'étudiant, le Maroc est revenu à l'heure GMT (UTC+0) de façon permanente le 20 septembre 2026. La base de fuseaux IANA 2026e (paquet `tzdata` 2026.5) contient ce changement : décalage de `Africa/Casablanca` égal à +1 h le 19 septembre 2026 et à 0 h à partir du 21 septembre 2026 (vérifié en lisant le fichier du paquet, sans l'installer).

- Frontend : `formatDate` et `formatDateTime` utilisent le fuseau du navigateur. Le poste de test est réglé sur UTC, qui correspond à l'heure légale marocaine : l'affichage est correct (« Publié : 4 octobre 2026 » pour une annonce republiée le 4 octobre à 23:39 UTC). Aucune modification n'est faite sur ces fonctions.
- Backend (correction autorisée) : l'environnement virtuel contenait `tzdata` 2026.2, antérieur au changement. `Africa/Casablanca` y était encore traité en UTC+1 (vérifié : décalage `1:00:00` pour le 5 octobre 2026), d'où des dates renvoyées avec `+01:00` par l'API et une heure avancée d'une heure sur la facture PDF (#33), qui utilise l'heure locale du serveur. `tzdata` a été mis à jour en 2026.5 dans l'environnement virtuel et déclaré dans `backend/requirements.txt` ; la même vérification renvoie maintenant `0:00:00`. Aucun changement de code : `TIME_ZONE = "Africa/Casablanca"` est conservé. Les dates enregistrées en base sont en UTC et ne sont pas concernées.
- Vérification de l'étudiant après relance du serveur : la commande renvoie `0:00:00` ; facture 58 retéléchargée : numéro FCT-2026-000058, date 04/10/2026, période du 04/10/2026 au 11/10/2026, client « anas anas / Nordar », « CMI (simulation) », statut « Réussie » (la facture n'affiche pas l'heure).
- Constat annexe : l'installation a affiché des conflits de dépendances déjà présents dans l'environnement virtuel (paquets requis par `celery`, `django-allauth` et `django-celery-beat` non installés ; `sqlparse` 0.2.4 alors que Django 4.2.11 demande 0.3.1 ou plus). La version de `sqlparse` est imposée par Djongo : les métadonnées de `djongo` 1.3.6 exigent `sqlparse==0.2.4` (vérifié en lecture seule). Non corrigé, volontairement.
- Limites de #40 : un lieu sans nom français dans OpenStreetMap peut encore être renvoyé avec son nom par défaut (non vérifié sur d'autres lieux que Guéliz et Maârif) ; les annonces déjà enregistrées ne sont pas modifiées (correction manuelle par l'étudiant) ; la page de création d'annonce n'a pas de carte, le quartier y est saisi à la main.
- Choix volontaire : le graphique « Répartition des utilisateurs » ne compte que les clients et les agences ; les administrateurs n'y figurent pas (3 comptes représentés sur 4).
- Limite : le graphique « Statut des annonces » de la vue d'ensemble n'a pas de part « Brouillons » (annonces rejetées par l'admin) : l'API des statistiques ne renvoie pas ce compteur. Le total « Annonces » inclut en revanche tous les statuts.
- Limite : dans la modération des annonces, le motif de rejet est toujours saisi avec la fenêtre `prompt()` du navigateur.

### 10.6 Assistant IA : contact d'un propriétaire, et page des messages (#41, #42)

Bug trouvé en test manuel : avec le compte client, la demande « Je veux contacter le propriétaire de l'annonce 5 pour savoir si le prix est négociable » recevait la réponse « le propriétaire a été contacté », alors qu'aucun message n'apparaissait dans `/messages`. L'assistant confirmait un envoi qui n'avait pas eu lieu.

| # | Problème | Cause | Correction | Fichier | Testé |
|---|---|---|---|---|---|
| 41 | L'agent Communication confirmait l'envoi d'un message qui n'était pas créé quand une conversation existait déjà pour cette annonce | La vue `contacter` ne créait le message et la notification que si la conversation venait d'être créée (`if created:`) ; elle renvoyait pourtant 200 avec `created: false`, sans indiquer qu'aucun message n'était envoyé. L'agent, qui ne reçoit aucune erreur, annonçait une réussite | Backend (correction autorisée) : le message et la notification sont créés à chaque contact ; la réponse contient `message_id` ; les deux `print()` de débogage, qui écrivaient le contenu des messages dans le terminal, sont retirés. Aucun changement dans n8n | `backend/apps/messaging/views.py` | Étudiant (compte client : « message envoyé » ; compte agence : nouveau message daté de quelques minutes dans la conversation de l'annonce 5, notification reçue). Refus pour le propriétaire : test en attente |
| 42 | `/messages` avec le compte agence : « anas anas » (le nom de l'utilisateur connecté) affiché pour certaines conversations | Trois conversations de la base (4, 5, 6) ont l'agence à la fois comme client et comme propriétaire : le backend acceptait qu'un utilisateur contacte sa propre annonce. Par ailleurs, le nom affiché dépendait du rôle (`agence` → nom du client), ce qui est faux pour une agence qui contacte l'annonce d'un autre | Backend (correction autorisée) : refus 400 « Vous êtes le propriétaire de cette annonce. » ; frontend : nom de l'autre participant choisi en comparant les identifiants (4 endroits). Les conversations 4, 5 et 6 ne sont pas modifiées | `backend/apps/messaging/views.py`, `frontend/src/components/Client/Messages.jsx` | Build ; le test de l'étudiant a montré que ces deux changements ne suffisaient pas (ligne suivante) |
| 42 | Après la correction précédente, « anas anas » restait affiché pour les conversations dont le client est un autre utilisateur | La liste des conversations renvoyait le bon identifiant du client (`client: 2`) mais le nom de l'agence dans `client_name`. La requête de la vue chargeait le client et l'agent, deux liens vers la même table des utilisateurs, avec `select_related("annonce", "client", "agent")` ; avec Djongo, les deux objets joints recevaient le même utilisateur. Vérifié en appelant la vue en lecture seule : avant, `client_name` = « anas anas » pour les 8 conversations ; le serializer appelé sans cette jointure donnait « amine anas » | Backend (correction demandée par l'étudiant) : `select_related("annonce")` seulement ; le client et l'agent sont lus séparément | `backend/apps/messaging/views.py` | Script (vue appelée en lecture seule pour les deux comptes : « amine anas » pour les conversations 1, 2, 3, 7, 8 côté agence ; « anas anas » côté client) ; test de l'étudiant en attente |

Limite : les conversations 4, 5 et 6, créées avant la correction, affichent toujours le nom de l'agence (elle y est les deux participants). Ce bug correspond à l'anomalie 4 de `docs/PASSATION_darimmo_agent_ia.md`, qui était notée comme corrigée ; le rapport Word n'a pas été régénéré après cette correction.
