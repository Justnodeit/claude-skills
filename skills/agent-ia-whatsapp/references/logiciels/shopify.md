# Shopify

Fiche à suivre quand la rubrique `logiciel` de la fiche de cadrage vaut Shopify. Relevé du 2026-10-25. Shopify couvre trois cas d'usage : le panier abandonné, la confirmation d'achat et le suivi d'expédition. Shopify n'a pas de notion de « statut de lead » : on le range dans les tags et un métachamp client.

## 1. Où vivent le lead, son téléphone et son statut

- Le lead est un **client** Shopify (fiche client) ou, avant tout compte, un **paiement abandonné** (abandoned checkout) qui porte l'email ou le téléphone saisi.
- Le téléphone : champ téléphone du client, ou téléphone de l'adresse de livraison saisi au paiement. Shopify l'enregistre en général au format international.
- Le consentement : Shopify enregistre un consentement marketing **SMS** sur la fiche client (champ `smsMarketingConsent` dans l'API). Il n'existe pas de champ « consentement WhatsApp ». Voir section 2.
- Le statut : pas de champ prévu. Deux moyens, à combiner :
  - un **tag client** par statut (`wa-nouveau`, `wa-contacte`, `wa-en-conversation`, `wa-qualifie`, `wa-client`, `wa-perdu`, `wa-stop`), visible et filtrable dans la liste des clients ;
  - un **métachamp client** « Statut WhatsApp » (section 2), plus propre pour l'automatisation.

| Statut canonique | Dans Shopify |
|---|---|
| `nouveau` | paiement abandonné repéré ou client créé, pas encore contacté |
| `contacte` | tag `wa-contacte` |
| `en_conversation` | tag `wa-en-conversation` |
| `qualifie` | tag `wa-qualifie` (surtout utile en vente conseil : produit cher, devis) |
| `rdv_pris` | rare en e-commerce ; tag `wa-rdv` si l'utilisateur prend des rendez-vous (essayage, conseil) |
| `client` | une commande payée existe ; tag `wa-client` |
| `perdu` | fin de séquence panier sans achat ; tag `wa-perdu` |
| `stop` | tag `wa-stop` : plus aucun message, même transactionnel non indispensable |

## 2. Champs à créer

1. Métachamp client : Paramètres > Données personnalisées (Métachamps et métaobjets) > Clients > « Ajouter une définition ». Nom « Statut WhatsApp », espace de noms et clé `whatsapp.statut`, type « Texte sur une seule ligne », avec une liste de valeurs autorisées : les 8 codes canoniques.
2. Deuxième métachamp `whatsapp.consentement_date`, type Date et heure, pour tracer le consentement.
3. Consentement au paiement : Paramètres > Paiement (Checkout) > section « Options marketing » (ou « Consentement marketing ») > cochez la case SMS. La case n'apparaît chez le client que si le champ téléphone est visible au paiement : réglez « Numéro de téléphone de l'adresse de livraison » sur Obligatoire ou Facultatif. Shopify demande aussi que les conditions générales et la politique de confidentialité soient renseignées (Paramètres > Politiques).

Le consentement SMS de Shopify ne vaut pas automatiquement consentement WhatsApp. Deux solutions, à choisir avec l'utilisateur :
- modifier le texte de la case (Paramètres > Paiement > « Gérer la langue du paiement », ou personnalisation du paiement) pour écrire « Recevoir nos offres par SMS et WhatsApp » ;
- ou demander l'accord WhatsApp dans le premier échange quand c'est le client qui écrit.

Message transactionnel (confirmation, expédition) : Meta demande quand même que la personne ait accepté de recevoir des messages WhatsApp de l'entreprise. Prévoyez une mention claire au paiement (« Nous vous confirmerons votre commande sur WhatsApp ») et le respect immédiat d'un STOP. Détail : `../05-conformite.md`.

Deux champs de plus si les relances sont planifiées (toujours avec Make ; avec n8n quand on préfère un passage quotidien à de longues attentes dans le workflow) : « Étape WhatsApp » (nombre : 0, 1, 3, 7, soit le jour de la dernière relance envoyée) et « Prochaine relance WhatsApp » (date et heure). Chaque jour, l'automatisation cherche les leads dont la prochaine relance est passée, envoie le bon modèle selon l'étape, puis avance les deux champs. Voir `../scenarios/nurturing-formulaire.md`.

## 3. Déclencheurs disponibles

| Cas d'usage | n8n | Make |
|---|---|---|
| Panier abandonné | Nœud **Shopify Trigger**, topic `checkouts/create` ou `checkouts/update` (il n'existe pas de topic « panier abandonné »), puis attente et vérification (méthode ci-dessous) | Module Shopify « Watch Abandoned Checkouts » (sondage) |
| Commande payée (confirmation d'achat) | Shopify Trigger, topic `orders/paid` | Module de surveillance des commandes (« Watch Orders », nom à vérifier) avec un filtre sur le statut financier payé |
| Expédition | Shopify Trigger, topic `fulfillments/create` (contient le numéro de suivi) ou `orders/fulfilled` | Module de surveillance des expéditions, à vérifier dans votre compte |
| Nouveau client | Shopify Trigger, topic `customers/create` | Module de surveillance des clients |

### Méthode « panier abandonné » avec n8n

1. Shopify Trigger sur `checkouts/update` : il se déclenche dès que le client a saisi son email ou son téléphone dans le paiement.
2. Nœud IF : on continue seulement si le paiement porte un téléphone et si le consentement est donné.
3. Nœud Wait : 1 heure (à régler dans la fiche de cadrage, rubrique `relances`).
4. Vérification : nœud HTTP Request vers l'API GraphQL Admin de Shopify, requête `abandonedCheckouts` filtrée sur l'identifiant du paiement, ou recherche d'une commande récente au même email ou téléphone. Le nœud Shopify de n8n ne lit que les commandes et les produits, pas les paiements abandonnés ni les clients : il faut un appel HTTP.
5. Si une commande existe ou si le paiement est terminé (`completedAt` renseigné) : on s'arrête. Sinon : envoi du modèle WhatsApp `panier_abandonne_1` avec le lien de reprise du panier (`abandonedCheckoutUrl` ou `recoveryUrl` selon la version de l'API, à vérifier dans la réponse).

Avec Make, « Watch Abandoned Checkouts » fait le tri lui-même : il ne remonte que les paiements que Shopify considère comme abandonnés. Ajoutez quand même la vérification de commande juste avant l'envoi.

Si l'utilisateur envoie déjà les emails de panier abandonné de Shopify (Marketing > Automatisations), décalez le WhatsApp (ex. email à 1 h, WhatsApp à 4 h) pour ne pas doubler la relance.

## 4. Écrire le statut et la trace `WA-`

- Tags : API GraphQL, mutation `tagsAdd` sur l'identifiant du client (n8n : nœud HTTP Request ; Make : module « Make an API Call » de Shopify ou module de mise à jour du client).
- Métachamp : mutation `metafieldsSet` (propriétaire = client, espace de noms `whatsapp`, clé `statut`).
- Trace : note de commande (champ `note` de la commande) pour les messages transactionnels, ou note du client. Texte préfixé `WA-` (ex. `WA-CONFIRMATION envoyée`, `WA-PANIER-1 envoyé`, `WA-STOP`).

Si le client n'existe pas encore (paiement abandonné sans compte), gardez la trace dans l'outil d'automatisation (table de données n8n ou Data store Make) avec l'identifiant du paiement, pour ne jamais relancer deux fois le même panier.

## 5. Connexion à n8n et à Make

### Make (le plus simple)

Ajoutez un module Shopify, « Create a connection », indiquez le sous-domaine de la boutique (`maboutique` pour maboutique.myshopify.com), validez l'installation dans Shopify. Aucune clé à copier.

### n8n

Depuis le 1er janvier 2026, Shopify ne permet plus de créer une « application personnalisée » depuis l'administration de la boutique. Les nouvelles applications se créent dans le **Dev Dashboard** de Shopify. Les anciennes applications personnalisées déjà créées continuent de fonctionner : si l'utilisateur en a une avec un jeton d'accès, il peut la réutiliser (identifiant n8n « Shopify Access Token API »).

Pour une nouvelle connexion :
1. Ouvrez le Dev Dashboard Shopify (lien depuis l'administration : Paramètres > Applications > « Développer des applications », qui redirige vers le Dev Dashboard), créez une application nommée « Agent WhatsApp ».
2. Portées (scopes) à demander : `read_customers`, `write_customers` (tags et métachamps), `read_orders` (commandes et paiements abandonnés), `read_fulfillments` si le suivi d'expédition sert. Vérifiez dans la documentation Shopify la portée exacte des paiements abandonnés au moment du projet.
3. Publiez une version de l'application avec ces portées et installez-la sur la boutique.
4. Dans n8n, préférez l'identifiant **« Shopify OAuth2 API »** : indiquez le Client ID, le Client Secret et le sous-domaine, puis copiez l'URL de redirection affichée par n8n dans les réglages de l'application Shopify. Les jetons obtenus avec la méthode « client credentials » expirent au bout de 24 heures et le nœud n8n ne les renouvelle pas tout seul.

## 6. Confirmation d'achat ou événement de vente

C'est le cas où le webhook est indispensable : le message doit partir dans la minute.
1. n8n : Shopify Trigger, topic `orders/paid`. n8n crée lui-même l'abonnement webhook dans Shopify à l'activation du workflow.
2. Le corps reçu contient la commande : numéro (`name`, ex. #1042), montant, articles, client, téléphone de facturation et de livraison.
3. Vérifier : téléphone présent, pas de tag `wa-stop`.
4. Envoyer le modèle utilitaire `confirmation_commande` avec les variables prénom, numéro de commande, montant.
5. Tag `wa-client`, métachamp `client`, note `WA-CONFIRMATION envoyée`.

Sans n8n ni Make, on peut créer l'abonnement à la main (Paramètres > Notifications > Webhooks > « Créer un webhook », événement « Paiement de commande », format JSON) vers l'URL d'un autre outil. Shopify signe chaque envoi (en-tête `X-Shopify-Hmac-Sha256`) : le nœud n8n vérifie la signature, un code maison doit le faire aussi.

## 7. Pièges vérifiés

- 2026-10-25 · Aucun topic webhook « panier abandonné » : la liste des topics du Shopify Trigger de n8n contient `checkouts/create`, `checkouts/update`, `checkouts/delete`, pas d'abandon. Parade : méthode de la section 3. Source : catalogue de nœuds n8n, Shopify Trigger v1.
- 2026-10-25 · Le nœud Shopify de n8n ne gère que les commandes et les produits. Clients, tags, métachamps et paiements abandonnés passent par HTTP Request. Source : catalogue de nœuds n8n, nœud Shopify v1.
- 2026-10-25 · Création d'applications personnalisées dans l'administration supprimée au 2026-01-01 ; nouvelles applications par le Dev Dashboard ; jetons « client credentials » valables 24 heures. Sources : forum développeurs Shopify (community.shopify.dev, fils « Custom App Credentials » et « Unable to generate Shopify OAuth / Admin API access token »), à recouper avec shopify.dev au moment du projet.
- 2026-10-25 · La case de consentement SMS au paiement n'apparaît que si le champ téléphone est affiché. Source : guides d'aide d'éditeurs d'applications SMS Shopify (AfterShip, Yotpo).

## 8. Abonnement requis

| Besoin | Abonnement Shopify |
|---|---|
| Webhooks, API Admin, applications du Dev Dashboard, métachamps, tags, consentement SMS | Toutes les offres Shopify payantes (Basic et plus) |
| Connecteur Make Shopify | Inclus dans Make ; le rythme de sondage dépend de l'offre Make |
