# Schéma de base de données — DarImmo (MongoDB via Djongo)

> MongoDB stocke chaque modèle Django comme une collection orientée
> documents. Djongo traduit l'ORM Django en requêtes MongoDB, ce qui permet
> de garder les migrations et relations Django tout en bénéficiant de la
> flexibilité du NoSQL pour des champs variés (ex : caractéristiques d'un
> bien selon son type).

## Collections principales

### `users_user`
| Champ | Type | Description |
|---|---|---|
| id | ObjectId | Identifiant |
| username, email | string | Identifiants de connexion |
| password | string (hashé) | |
| role | enum | `client` / `agence` / `admin` |
| phone, city, company_name | string | |
| avatar | string (chemin fichier) | |
| is_verified, is_active | bool | |
| created_at, updated_at | datetime | |

### `users_favoriteproperty`
| Champ | Type |
|---|---|
| user_id | FK → users_user |
| annonce_id | FK → annonces_annonce |
| created_at | datetime |

### `annonces_annonce`
| Champ | Type | Description |
|---|---|---|
| id | ObjectId | |
| owner_id | FK → users_user | |
| title, description | string | |
| property_type | enum | villa / appartement / riad / maison / terrain |
| transaction_type | enum | vente / location |
| status | enum | draft / pending / published / sold / rented / archived |
| city, neighborhood, address | string | |
| latitude, longitude | decimal | |
| price, surface | decimal | |
| bedrooms, bathrooms | int | |
| has_parking, has_pool, has_garden, is_furnished | bool | |
| is_featured, is_boosted, boosted_until | bool / datetime | |
| views_count | int | |
| created_at, updated_at, published_at | datetime | |

### `annonces_annonceimage`
| Champ | Type |
|---|---|
| annonce_id | FK → annonces_annonce |
| image | string (chemin fichier) |
| is_primary | bool |
| order | int |

### `client_dashboard_clientprofile`
| Champ | Type |
|---|---|
| user_id | OneToOne → users_user |
| preferred_cities, preferred_property_types | string (CSV) |
| budget_range | enum |
| is_looking_to_buy, is_looking_to_rent | bool |

### `client_dashboard_visitrequest`
| Champ | Type |
|---|---|
| client_id | FK → users_user |
| annonce_id | FK → annonces_annonce |
| requested_date | datetime |
| status | enum: pending / confirmed / cancelled / completed |

### `client_dashboard_savedsearch`
| Champ | Type |
|---|---|
| user_id | FK → users_user |
| name, city, property_type, transaction_type | string |
| price_min, price_max | decimal |
| notify_by_email | bool |

### `messaging_conversation` / `messaging_message`
Conversation = triplet (annonce, client, agent).
Message = contenu + expéditeur + destinataire + statut lu/non lu.

### `messaging_notification`
Notification utilisateur avec type, titre, corps, lien frontend, statut lu.

### `payments_boostplan` / `payments_transaction`
Formules de mise en avant payante + historique des transactions
(Stripe ou CMI), avec statut et référence fournisseur.

### `analytics_propertyview` / `analytics_searchlog` / `analytics_agencyperformance`
Logs détaillés de consultation et de recherche, + agrégats mensuels par
agence (calculés via tâche Celery `compute_monthly_agency_performance`).

### `ai_integration_aiconversation` / `aimessage` / `airecommendation`
Historique des échanges avec l'Assistant IA (N8N) : session, messages
(utilisateur/IA), et biens recommandés avec score de pertinence et suivi
de clic.

### `admin_dashboard_activitylog`
Journal d'audit des actions administratives (approbation/rejet d'annonces,
suspension/vérification de comptes).

## Index recommandés

```python
# annonces_annonce
Index(fields=["city", "property_type"])
Index(fields=["transaction_type", "status"])

# analytics_propertyview
Index(fields=["annonce", "viewed_at"])
```

## Relations clés (logique applicative — pas de FK strictes en NoSQL)

```
User (1) ───< (N) Annonce
User (1) ───< (N) FavoriteProperty >─── (1) Annonce
Annonce (1) ──< (N) AnnonceImage
Annonce (1) ──< (N) Conversation >── (1) User [client]
                                  >── (1) User [agent]
Conversation (1) ──< (N) Message
User (1) ──< (N) Notification
User (1) ──< (N) Transaction >── (1) BoostPlan
User (1) ──< (N) AIConversation ──< (N) AIMessage
                                 ──< (N) AIRecommendation >── (1) Annonce
```
