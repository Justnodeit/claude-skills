# Scénario : confirmation d'achat, suivi et demande d'avis

Fiche du skill `agent-ia-whatsapp`.

## 1. À quoi ça sert, pour qui

Une vente est faite. Le client reçoit sur WhatsApp la confirmation de sa commande, puis le suivi d'expédition, puis, quelques jours après la livraison, une demande d'avis. Ce sont des messages attendus, rarement signalés comme spam, et souvent moins chers que les relances commerciales.

Pour qui : e-commerce (Shopify, WooCommerce), vente de services avec paiement en ligne, prise de commande sur devis signé (affaire gagnée dans HubSpot ou Pipedrive), inscriptions payantes.

Ce scénario repose sur un webhook : le logiciel prévient votre automatisation à l'instant où l'événement se produit. Sans webhook (Notion, Google Sheets), on vérifie à intervalle régulier, avec quelques minutes de retard.

## 2. Déclencheur et conditions d'entrée

| Logiciel | Confirmation | Expédition | Livraison | Fiche |
|---|---|---|---|---|
| Shopify | `orders/paid` | `fulfillments/create` (numéro et lien de suivi) | `fulfillment_events/create` statut livré, si votre transporteur le remonte | `logiciels/shopify.md` |
| WooCommerce | commande passée en « En cours » | commande « Terminée » ou extension de suivi | selon l'extension de suivi | `logiciels/woocommerce.md` |
| HubSpot | affaire passée en « Gagnée » | sans objet ou propriété personnalisée | sans objet | `logiciels/hubspot.md` |
| Pipedrive | affaire gagnée | sans objet | sans objet | `logiciels/pipedrive.md` |
| Brevo | événement de commande (e-commerce Brevo) | selon votre intégration | selon votre intégration | `logiciels/brevo.md` |
| Stripe (paiement seul) | `checkout.session.completed` | sans objet | sans objet | voir la note Stripe en section 6 |
| Notion, Google Sheets | ligne ou page passée à « Payé » (sondage) | colonne « Expédié » | colonne « Livré » | `logiciels/notion.md`, `logiciels/google-sheets.md` |

Conditions d'entrée :

1. Téléphone présent, en E.164.
2. Le client a accepté de recevoir le suivi de commande sur WhatsApp. Pour un message strictement lié à la commande (confirmation, expédition), une case « Recevoir le suivi de ma commande sur WhatsApp » suffit ; la demande d'avis et toute offre demandent le consentement marketing (voir `05-conformite.md`).
3. Aucune confirmation déjà envoyée pour cette commande (identifiant de commande mémorisé) : Shopify et WooCommerce renvoient parfois le même webhook plusieurs fois.
4. Contact pas en `stop`. Pour un client en `stop`, la confirmation de commande est permise par Meta si le client l'a demandée au moment de l'achat ; par prudence, le skill conseille de ne rien envoyer et de laisser l'email de la boutique faire le travail.

## 3. Messages

AI Act : quand un modèle appelle une réponse, terminez-le par la signature « [prénom de l'agent], assistant IA de [entreprise] », ou assurez-vous que la première réponse de l'agent annonce l'IA. Détail : `../07-ai-act.md`.

Catégorie utilitaire pour la confirmation et l'expédition : le message suit une transaction précise demandée par le client, sans promotion. Depuis le 1er juillet 2025, un modèle utilitaire envoyé pendant une fenêtre de 24 h ouverte ne coûte rien côté Meta ; hors fenêtre, il est facturé au tarif utilitaire, plus bas que le marketing (source : Twilio, page des concepts clés, citée dans `02-twilio-whatsapp.md`).

Ne glissez aucune offre, aucun « découvrez aussi » dans ces modèles : Meta les reclasserait en marketing, au tarif marketing.

Variables : `{{1}}` prénom, `{{2}}` numéro de commande, `{{3}}` montant ou résumé, `{{4}}` transporteur, `{{5}}` fin du lien de suivi.

`commande_confirmee` (utilitaire)
- Vous : « Bonjour {{1}}, votre commande n° {{2}} ({{3}}) est confirmée. Nous la préparons et vous prévenons ici dès son expédition. Une question ? Répondez à ce message. »
- Tu : « Hello {{1}}, ta commande n° {{2}} ({{3}}) est confirmée. On la prépare et on te prévient ici dès qu'elle part. Une question ? Réponds à ce message. »

`commande_expediee` (utilitaire)
- Vous : « {{1}}, votre commande n° {{2}} est partie avec {{4}}. Suivez-la ici : » + bouton « Suivre mon colis » (adresse de base du transporteur, fin variable `{{5}}`).
- Tu : « {{1}}, ta commande n° {{2}} est partie avec {{4}}. Suis-la ici : » + bouton « Suivre mon colis ».

`commande_avis` (utilitaire tenté, souvent reclassé marketing)
- Vous : « Bonjour {{1}}, votre commande n° {{2}} est bien arrivée ? Votre avis nous aide beaucoup : notez-la en 30 secondes. » + bouton « Donner mon avis ».
- Tu : « Hello {{1}}, ta commande n° {{2}} est bien arrivée ? Ton avis nous aide beaucoup : note-la en 30 secondes. » + bouton « Donner mon avis ».
- Meta n'accepte une demande d'avis en utilitaire que si elle cite une commande précise et ne contient aucune promotion. Une demande générale est classée marketing. Prévoyez le budget marketing au cas où.

Pour une vente de service (affaire gagnée), remplacez la confirmation par :

`bienvenue_client` (utilitaire)
- Vous : « Bonjour {{1}}, merci pour votre confiance. Votre dossier {{2}} est ouvert : {{3}} vous contacte d'ici {{4}} pour la suite. Vous pouvez nous écrire ici à tout moment. »
- Tu : « Hello {{1}}, merci pour ta confiance ! Ton dossier {{2}} est ouvert : {{3}} te contacte d'ici {{4}} pour la suite. Tu peux nous écrire ici à tout moment. »

## 4. Calendrier et conditions d'arrêt

| Étape | Moment | Modèle |
|---|---|---|
| Confirmation | dans la minute qui suit le paiement, à toute heure (message attendu) | `commande_confirmee` |
| Expédition | à l'événement d'expédition, entre 8 h et 21 h, sinon le lendemain à 8 h | `commande_expediee` |
| Avis | 3 jours après la livraison (ou 7 jours après l'expédition si la livraison n'est pas connue), entre 10 h et 19 h | `commande_avis` |

Arrêt :

- commande annulée ou remboursée (Shopify `orders/cancelled`, `refunds/create`) : plus de demande d'avis ;
- le client a ouvert une réclamation en réponse : l'agent d'accueil passe la main à l'humain, pas de demande d'avis automatique ;
- statut `stop` ou désinscription marketing (erreur 63050) pour la demande d'avis.

## 5. Statuts posés à chaque étape

| Moment | Statut | Trace |
|---|---|---|
| Paiement reçu | `client` | `WA-CONFIRMATION envoyée <n° commande>` |
| Expédition | `client` | `WA-EXPEDITION envoyée` |
| Demande d'avis | `client` | `WA-AVIS demandé` |
| Réclamation en réponse | `client` | `WA-HUMAIN réclamation` |

Le passage à `client` arrête toutes les autres séquences (relances formulaire, panier) : c'est la raison pour laquelle ce scénario doit écrire le statut avant d'envoyer.

## 6. Construction dans n8n

Workflow « WhatsApp · Commande confirmée » :

1. Déclencheur : Shopify Trigger (`orders/paid`), WooCommerce Trigger, HubSpot Trigger, Pipedrive Trigger, Brevo Trigger, ou Webhook générique pour un autre outil. Pour Notion et Google Sheets : Notion Trigger ou Google Sheets Trigger, en sondage chaque minute.
2. Code (« Normaliser ») : téléphone E.164, prénom, numéro de commande, montant formaté en euros, consentement.
3. Data Table (« Déjà confirmée ? ») : cherche le numéro de commande ; trouvé, fin ; sinon l'ajoute.
4. If (« Peut recevoir ? ») : téléphone, consentement suivi de commande, pas `stop`.
5. Nœud du logiciel : statut `client`.
6. HTTP Request : POST `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`, identifiant Twilio, corps Form Urlencoded : `MessagingServiceSid`, `To` = `whatsapp:+33600000000`, `ContentSid` du modèle `commande_confirmee`, `ContentVariables` = `{"1":"Camille","2":"1042","3":"49,00 €"}`.
7. Nœud du logiciel : trace `WA-CONFIRMATION envoyée`. Sortie d'erreur : `WA-ERREUR <code>`.

Workflow « WhatsApp · Commande expédiée » : Shopify Trigger `fulfillments/create`, Code (transporteur, lien de suivi, fin d'adresse pour le bouton), Code « Créneau » et Wait si la nuit, HTTP Request avec `commande_expediee`, trace.

Workflow « WhatsApp · Demande d'avis », deux façons :

- simple : à la suite du workflow d'expédition, Wait 7 jours, puis nœud Shopify « Get order » pour vérifier que la commande n'est ni annulée ni remboursée, puis HTTP Request `commande_avis` ;
- robuste : Schedule Trigger chaque jour à 10 h 30, liste des commandes expédiées il y a 7 jours (ou livrées il y a 3 jours) sans trace `WA-AVIS`, puis envoi. Cette version survit à un redémarrage de n8n sans perdre les attentes.

Note Stripe : n8n propose un Stripe Trigger (`checkout.session.completed`). Pour avoir le téléphone, activez la collecte du numéro dans la page de paiement Stripe ; le champ arrive dans `customer_details.phone`.

## 7. Construction dans Make

1. Module « Watch » ou webhook du logiciel (Shopify > Watch Orders, WooCommerce > Watch Orders, HubSpot > Watch Deals, Pipedrive > Watch Deals, Stripe > Watch Events).
2. Filtre : statut payé, téléphone présent, consentement.
3. Data store « commandes_whatsapp » > Search records par numéro de commande ; filtre « absent » ; Add a record.
4. Module du logiciel : statut `client`.
5. HTTP > Make a request : POST API Twilio Messages, `ContentSid` du modèle, `ContentVariables` en JSON.
6. Module du logiciel : trace.

Expédition : scénario séparé sur Shopify > Watch Fulfillments (ou équivalent). Demande d'avis : scénario planifié chaque jour, qui cherche dans le data store les commandes expédiées depuis 7 jours sans avis demandé.

## 8. Variante Claude Code

Claude Code écrit une route par webhook (`/webhooks/shopify/orders-paid`, `/webhooks/shopify/fulfillments`), la vérification de signature du logiciel, une table des commandes déjà traitées et une tâche planifiée quotidienne pour les avis. Hébergement : Vercel, Cloudflare Workers, Render, ou Twilio Functions.

Désavantages : un webhook qui échoue (code en panne, hébergeur indisponible) est réessayé par Shopify pendant un temps limité puis abandonné, et vous ne le voyez que si vous avez prévu une alerte ; la gestion des doublons et des signatures est à coder et à tester vous-même.

## 9. Test avant mise en ligne

1. Passez une commande test avec votre numéro (mode test de paiement Shopify ou WooCommerce, ou affaire de test passée à « Gagnée »).
2. Vérifiez : message reçu en moins d'une minute, bonnes variables (prénom, numéro, montant au format français), statut `client`, trace.
3. Rejouez le même webhook (dans Shopify : renvoi depuis les réglages des notifications, ou relance de l'exécution dans n8n) : aucun second message.
4. Marquez la commande expédiée avec un numéro de suivi fictif : message d'expédition, lien qui ouvre la bonne page.
5. Réglez le délai d'avis à 2 minutes dans une copie, vérifiez le message, puis annulez une autre commande test : aucune demande d'avis pour elle.
6. Répondez « mon colis est abîmé » : l'agent d'accueil doit passer la main à l'humain.
