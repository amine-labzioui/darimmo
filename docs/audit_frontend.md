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
