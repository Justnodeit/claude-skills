# Scénario : panier abandonné

Fiche du skill `agent-ia-whatsapp`.

## 1. À quoi ça sert, pour qui

Un client remplit son panier, commence à passer commande, donne son numéro, puis ferme la page. Ce scénario lui rappelle son panier sur WhatsApp avec un lien qui le ramène exactement où il en était, puis s'arrête dès qu'il achète. S'il pose une question en réponse (frais de port, taille, délai), l'agent d'accueil (`scenarios/accueil-entrant.md`) lui répond.

Pour qui : boutiques Shopify ou WooCommerce, et tout site de réservation ou d'inscription en ligne qui sait dire « commande commencée, pas payée ».

Préalable : à l'étape de paiement, un champ téléphone et une case non pré-cochée « Recevoir sur WhatsApp le suivi de mon panier et de ma commande » (texte et règles dans `05-conformite.md`). Le numéro saisi pour la livraison ne vaut pas consentement à un message marketing.

## 2. Déclencheur et conditions d'entrée

Déclencheur selon la boutique :

| Boutique | Signal « commande commencée » | Signal « commande passée » | Fiche |
|---|---|---|---|
| Shopify | webhook `checkouts/create` ou `checkouts/update` (contient le téléphone et `abandoned_checkout_url`) | webhook `orders/create` (porte le `checkout_token`) | `logiciels/shopify.md` |
| WooCommerce | pas de webhook natif de panier abandonné : extension de récupération de panier qui envoie un webhook | webhook « Order created » ou changement de statut | `logiciels/woocommerce.md` |
| Autre (HubSpot avec paiements, site sur mesure) | événement « paiement commencé » | événement « paiement réussi » | fiche du logiciel |

Conditions d'entrée, toutes vraies au moment de l'envoi :

1. Téléphone présent, convertible en E.164.
2. Case WhatsApp cochée (ou consentement marketing WhatsApp déjà enregistré pour ce client).
3. Aucune commande passée avec ce `checkout_token` (ou ce panier) depuis le début du panier.
4. Pas de message panier envoyé à ce numéro dans les 7 derniers jours (un client qui abandonne trois paniers dans la semaine ne reçoit qu'une relance).
5. Contact pas en `stop`.
6. Montant du panier au-dessus du seuil fixé au cadrage (par défaut 20 €) : sous ce seuil, le coût du message et le risque de signalement dépassent le gain.

## 3. Messages

AI Act : quand un modèle appelle une réponse, terminez-le par la signature « [prénom de l'agent], assistant IA de [entreprise] », ou assurez-vous que la première réponse de l'agent annonce l'IA. Détail : `../07-ai-act.md`.

Le client ne vous a pas écrit : ce sont des modèles, en catégorie marketing (Meta classe toujours la relance de panier en marketing). Comptez le prix d'un message marketing en France par envoi (voir `02-twilio-whatsapp.md`, section des coûts).

Bouton conseillé : un bouton « Voir mon panier » de type lien avec une fin d'adresse variable. Dans Twilio, adresse de base `https://votre-boutique.fr/` et variable `{{4}}` pour la suite du lien de récupération.

Variables : `{{1}}` prénom, `{{2}}` nom du premier produit, `{{3}}` montant, `{{4}}` fin du lien de panier.

`panier_rappel_1` (marketing)
- Vous : « Bonjour {{1}}, votre panier vous attend : {{2}} pour {{3}}. Il est gardé de côté, vous pouvez finaliser en un clic. Une question avant de commander ? Répondez ici. »
- Tu : « Hello {{1}}, ton panier t'attend : {{2}} pour {{3}}. Il est gardé de côté, tu finalises en un clic. Une question avant de commander ? Réponds ici. »
- Bouton : « Voir mon panier ».

`panier_rappel_2` (marketing)
- Vous : « {{1}}, petit rappel pour {{2}}. Si quelque chose vous a freiné (livraison, taille, paiement), dites-le moi : je vous réponds tout de suite. Pour ne plus recevoir ces rappels, répondez STOP. »
- Tu : « {{1}}, petit rappel pour {{2}}. Si quelque chose t'a freiné (livraison, taille, paiement), dis-le moi : je te réponds tout de suite. Pour ne plus recevoir ces rappels, réponds STOP. »
- Bouton : « Voir mon panier ».

`panier_rappel_code` (marketing, optionnel, seulement si le client l'a décidé au cadrage)
- Vous : « {{1}}, pour finaliser votre commande de {{2}}, voici {{3}} de remise avec le code {{4}}, valable 48 h. »
- Tu : « {{1}}, pour finaliser ta commande de {{2}}, voici {{3}} de remise avec le code {{4}}, valable 48 h. »
- Les modèles avec bouton « copier le code » passent toujours par l'approbation de Meta. Gardez la remise pour la dernière relance : l'offrir dès le premier message apprend aux clients à abandonner leur panier.

Les réponses du client à ces messages ouvrent la fenêtre de 24 h : l'agent d'accueil répond alors en texte libre, gratuitement côté Meta pour les réponses de service (voir les tarifs dans `02-twilio-whatsapp.md`).

## 4. Calendrier et conditions d'arrêt

| Étape | Délai après l'abandon | Modèle |
|---|---|---|
| Rappel 1 | 1 h | `panier_rappel_1` |
| Rappel 2 | 24 h | `panier_rappel_2` |
| Rappel avec code (optionnel) | 72 h | `panier_rappel_code` |

Créneaux : 9 h à 21 h. Un panier abandonné à 23 h 30 reçoit son rappel 1 à 9 h.

Coordination : si votre boutique envoie déjà un email de panier abandonné, décalez l'un des deux (email à 1 h, WhatsApp à 4 h par exemple) ou coupez l'email pour les clients qui ont coché WhatsApp. Deux rappels à la même minute agacent.

Arrêt immédiat, vérifié avant chaque envoi :

- une commande existe pour ce panier ou ce client depuis l'abandon ;
- le client a répondu (l'agent d'accueil a la main) ;
- statut `stop`, ou désinscription marketing côté Meta (erreur 63050) ;
- le panier a été vidé ou a expiré.

## 5. Statuts posés à chaque étape

Le panier abandonné concerne souvent un client déjà connu : on ne rétrograde jamais un `client` en `contacte`. On trace l'événement sans toucher au statut principal si la personne est déjà cliente.

| Moment | Statut (nouveau visiteur) | Statut (client existant) | Trace |
|---|---|---|---|
| Panier détecté | `nouveau` | inchangé | `WA-PANIER détecté <montant>` |
| Rappel envoyé | `contacte` | inchangé | `WA-PANIER-1 envoyé`, `WA-PANIER-2 envoyé` |
| Réponse | `en_conversation` | inchangé | `WA-REPONSE` |
| Commande passée | `client` | inchangé | `WA-PANIER récupéré <montant>` |
| Fin sans achat | `perdu` | inchangé | `WA-PANIER fin` |

La trace `WA-PANIER récupéré` vous permet de compter le chiffre d'affaires rattrapé par WhatsApp.

## 6. Construction dans n8n

Deux workflows.

Workflow 1, « Commandes passées » (mémorise ce qui a été acheté) :

1. Shopify Trigger, sujet `orders/create` (ou WooCommerce Trigger, événement de commande créée).
2. Data Table (ou Google Sheets si votre version de n8n n'a pas ce nœud) : ajoute une ligne `checkout_token`, téléphone, date, montant.
3. Nœud du logiciel ou du CRM : si une trace `WA-PANIER-` existe pour ce téléphone, ajoute `WA-PANIER récupéré`.

Workflow 2, « Relance panier » :

1. Shopify Trigger, sujet `checkouts/update` (il se déclenche dès que le téléphone est saisi, et plusieurs fois par panier).
2. Code (« Normaliser ») : téléphone E.164, prénom, premier produit, montant, `token`, fin du lien `abandoned_checkout_url` (la partie après le domaine), case WhatsApp. Le nom exact du champ de consentement dépend de votre réglage Shopify : voir `logiciels/shopify.md`.
3. Data Table (« Déjà vu ? ») : cherche le `token`. S'il existe, fin. Sinon, l'ajoute. Cette étape empêche cinq parcours parallèles pour un seul panier.
4. If (« Peut entrer ? ») : conditions 1, 2, 5 et 6 de la section 2.
5. Wait, 1 heure.
6. Data Table (« Commandé ? ») : cherche le `token` dans la table du workflow 1. Trouvé : fin.
7. Code (« Créneau ») puis Wait jusqu'au créneau autorisé si besoin.
8. HTTP Request : POST `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`, identifiant Twilio, corps Form Urlencoded : `MessagingServiceSid`, `To` = `whatsapp:+33600000000`, `ContentSid` du modèle `panier_rappel_1`, `ContentVariables` = `{"1":"Camille","2":"Sac cabas lin","3":"49 €","4":"checkouts/c/exemple"}`.
9. Trace dans le logiciel (`WA-PANIER-1 envoyé`), sortie d'erreur vers une trace `WA-ERREUR`.
10. Wait 23 h, nouvelle vérification « Commandé ? » et « A répondu ? », puis `panier_rappel_2`. Même chose pour le code optionnel.
11. Fin : `WA-PANIER fin`.

## 7. Construction dans Make

1. Scénario « Paniers » : Shopify > Watch Abandoned Checkouts si votre compte Make propose ce module (à vérifier), sinon Webhooks > Custom webhook branché sur le webhook `checkouts/update` de Shopify.
2. Data store « paniers » > Search records par `token` ; filtre « absent », puis Add a record avec la date d'abandon et `etape` = 0.
3. Scénario « Commandes » : Shopify > Watch Orders, puis Data store > Update a record (`commande` = oui) pour le `token`.
4. Scénario « Relances », planifié toutes les 15 minutes : Data store > Search records (`commande` = non, date d'abandon dépassée de 1 h pour l'étape 0, de 24 h pour l'étape 1), Iterator, filtre créneau horaire, HTTP > Make a request vers l'API Twilio avec le bon `ContentSid`, Data store > Update a record (`etape` + 1), module du logiciel pour la trace.

## 8. Variante Claude Code

Claude Code écrit deux petites routes (webhook de panier, webhook de commande), une table (SQLite, Postgres, Supabase) et une tâche planifiée toutes les 15 minutes qui envoie les rappels dus. Hébergement : Vercel avec Vercel Cron, Cloudflare Workers avec Cron Triggers et D1, ou Twilio Functions pour les webhooks plus une tâche planifiée ailleurs.

Désavantages : les webhooks Shopify doivent être vérifiés (signature HMAC) et renouvelés si l'application change ; les versions de l'API Shopify sont retirées régulièrement, ce qui oblige à mettre le code à jour ; aucun écran pour suivre les paniers sans en coder un.

## 9. Test avant mise en ligne

1. Délais de test : 2 minutes au lieu de 1 h, 4 minutes au lieu de 24 h.
2. Dans votre boutique, ajoutez un produit, allez jusqu'au paiement avec votre numéro et la case WhatsApp cochée, fermez la page. Vérifiez le rappel 1, le lien qui rouvre le bon panier, la trace.
3. Recommencez et payez avant le rappel 1 (mode test de paiement) : aucun message.
4. Recommencez, recevez le rappel 1, puis payez : pas de rappel 2, trace `WA-PANIER récupéré`.
5. Case décochée : aucun message.
6. Modifiez trois fois le panier en une minute : un seul parcours (vérifiez la Data Table).
7. Répondez « c'est combien la livraison ? » au rappel : l'agent d'accueil répond, plus de rappel automatique.
8. Remettez les vrais délais avant d'activer.
