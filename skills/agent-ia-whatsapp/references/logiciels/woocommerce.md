# WooCommerce

Fiche à suivre quand la rubrique `logiciel` de la fiche de cadrage vaut WooCommerce (boutique WordPress). Relevé du 2026-10-25. WooCommerce couvre la confirmation d'achat et le suivi de commande ; le panier abandonné demande une extension. WooCommerce n'est pas un CRM : les statuts de lead vivent dans un champ du client ou dans un outil à côté (Google Sheets, Notion, Brevo).

## 1. Où vivent le lead, son téléphone et son statut

- Le lead est un **client** WooCommerce (compte créé au paiement) ou un acheteur invité (commande sans compte).
- Le téléphone : « Téléphone de facturation » (`billing.phone`), saisi au paiement. WooCommerce ne force pas le format : un client tape souvent « 06 00 00 00 00 ». L'automatisation doit le convertir en +33600000000 avant tout envoi (indicatif selon le pays de facturation).
- Le statut : métadonnée du client (`meta_data`, clé `statut_whatsapp`) écrite par l'API REST. Elle n'est pas visible dans l'administration sans extension. Si l'utilisateur veut voir et filtrer les statuts, tenez-les plutôt dans une feuille Google Sheets ou une base Notion (voir ces fiches) et gardez WooCommerce pour les événements de commande.

| Statut canonique | Dans WooCommerce |
|---|---|
| `nouveau` | client ou panier repéré, pas encore contacté |
| `contacte` | métadonnée client `statut_whatsapp` = contacte |
| `en_conversation` | `statut_whatsapp` = en_conversation |
| `qualifie` | `statut_whatsapp` = qualifie (vente conseil, devis) |
| `rdv_pris` | `statut_whatsapp` = rdv_pris (si l'utilisateur prend des rendez-vous) |
| `client` | commande au statut « En cours » (payée) ou « Terminée » |
| `perdu` | fin de séquence panier sans commande |
| `stop` | `statut_whatsapp` = stop, plus aucun envoi |

Statuts de commande WooCommerce utiles : « En attente de paiement » (pending), « En cours » (processing : payée, à expédier), « Terminée » (completed), « Annulée », « Remboursée », « Échouée ».

## 2. Champs à créer

1. Consentement WhatsApp au paiement : WooCommerce n'a pas de case prévue. Selon la page de paiement de la boutique :
   - paiement en blocs (thèmes récents) : WooCommerce permet d'ajouter des champs supplémentaires au paiement par du code (API « additional checkout fields ») ; demandez à la Claude de l'utilisateur de générer ce petit extrait et de l'ajouter avec une extension d'extraits de code ;
   - paiement classique : une extension d'éditeur de champs de paiement ajoute une case « J'accepte de recevoir le suivi de ma commande et des offres sur WhatsApp ».
   Dans les deux cas, la case enregistre une métadonnée de commande, par exemple `_consentement_whatsapp` = oui.
2. Métadonnée client `statut_whatsapp` : rien à créer à l'avance, l'API REST l'ajoute à la première écriture.
3. Rendez le téléphone de facturation obligatoire : WooCommerce > Réglages > Livraison ou réglages de l'éditeur de paiement, selon la version (à vérifier à l'écran).

Deux champs de plus si les relances sont planifiées (toujours avec Make ; avec n8n quand on préfère un passage quotidien à de longues attentes dans le workflow) : « Étape WhatsApp » (nombre : 0, 1, 3, 7, soit le jour de la dernière relance envoyée) et « Prochaine relance WhatsApp » (date et heure). Chaque jour, l'automatisation cherche les leads dont la prochaine relance est passée, envoie le bon modèle selon l'étape, puis avance les deux champs. Voir `../scenarios/nurturing-formulaire.md`.

## 3. Déclencheurs disponibles

| Cas d'usage | n8n | Make |
|---|---|---|
| Commande payée (confirmation) | Nœud **WooCommerce Trigger**, événement `order.updated`, puis filtre statut = processing ; ou `order.created` si le paiement est immédiat (carte) | Module WooCommerce de surveillance des commandes (« Watch Orders », nom à vérifier), filtre sur le statut |
| Commande expédiée | WooCommerce Trigger `order.updated`, filtre statut = completed (ou statut personnalisé « Expédiée » si une extension l'ajoute) | idem |
| Nouveau client | WooCommerce Trigger `customer.created` | Module de surveillance des clients |
| Panier abandonné | Pas d'événement natif. Il faut une extension de récupération de panier qui envoie un webhook (plusieurs extensions gratuites le proposent, par exemple « Cart Abandonment Recovery for WooCommerce », réglage webhook à vérifier) ; n8n reçoit ce webhook sur un nœud **Webhook** | Module Custom webhook |
| Rendez-vous | WooCommerce n'en gère pas, sauf extension de réservation ; sinon outil d'agenda externe | idem |

Le WooCommerce Trigger de n8n crée lui-même le webhook dans la boutique quand le workflow est activé. Pour le voir ou en créer un à la main : WooCommerce > Réglages > Avancé > Webhooks > « Ajouter un webhook », sujet (topic) « Commande mise à jour », URL de livraison = URL du nœud Webhook n8n ou du module Custom webhook Make, version d'API WP REST v3, état Actif.

## 4. Écrire le statut et la trace `WA-`

- Statut du client : n8n, nœud WooCommerce, ressource Customer, opération « Update », champ Metadata, clé `statut_whatsapp`, valeur `en_conversation`. Make : module de mise à jour d'un client.
- Trace : note de commande. n8n : nœud HTTP Request, `POST https://<boutique>/wp-json/wc/v3/orders/{id}/notes`, corps `{"note": "WA-CONFIRMATION envoyée", "customer_note": false}` (avec `customer_note: false`, la note reste privée, le client ne la reçoit pas par email). Authentification : identifiant « WooCommerce API » de n8n.

Retrouver le client à partir d'un message WhatsApp entrant : l'API REST cherche les clients par email ou par texte (`search`), pas par téléphone de façon fiable. Comptez sur l'outil de suivi des leads (Sheets, Notion, Brevo, HubSpot) pour retrouver la personne par son numéro. Si l'utilisateur n'a que WooCommerce, gardez une table « numéro ↔ client » dans n8n (table de données) ou dans Make (Data store).

## 5. Connexion à n8n et à Make

### Clés REST

1. WordPress, menu WooCommerce > Réglages > Avancé > **API REST** > « Ajouter une clé ».
2. Description « Agent WhatsApp », utilisateur = un administrateur, droits **Lecture/Écriture**.
3. « Générer une clé API » : copiez la clé client (Consumer key, commence par `ck_`) et le secret client (commence par `cs_`). Ils ne s'affichent qu'une fois.
4. La boutique doit être en HTTPS et les permaliens WordPress ne doivent pas être sur « Simple » (Réglages > Permaliens).
5. Dans n8n : Credentials > Add credential > « WooCommerce API » > clé, secret, URL de la boutique.

### Make

Ajoutez un module WooCommerce, « Create a connection », URL de la boutique, clé client et secret client.

## 6. Confirmation d'achat ou événement de vente

1. WooCommerce Trigger `order.updated`.
2. Filtre : statut = processing, et aucune note `WA-CONFIRMATION` déjà présente (une commande est mise à jour plusieurs fois : sans ce filtre, le client reçoit deux confirmations).
3. Téléphone de facturation converti en +33…, consentement vérifié.
4. Envoi du modèle utilitaire `confirmation_commande` : prénom (`billing.first_name`), numéro de commande, montant (`total` et `currency`).
5. Note de commande `WA-CONFIRMATION envoyée`, métadonnée client `statut_whatsapp` = client.

WooCommerce signe chaque envoi de webhook (en-tête `X-WC-Webhook-Signature`, HMAC SHA256 en base64 avec le secret du webhook). Le nœud n8n le gère ; un code maison doit vérifier cette signature.

## 7. Pièges vérifiés

- 2026-10-25 · Aucun sujet de webhook « panier abandonné » dans WooCommerce : les sujets natifs portent sur les commandes, clients, produits et coupons. Parade : extension de récupération de panier. Source : catalogue de nœuds n8n, WooCommerce Trigger v1 (liste des événements) ; documentation REST API WooCommerce, section Webhooks.
- 2026-10-25 · Les webhooks partent en arrière-plan par le planificateur de WordPress (wp-cron) : sur un site peu visité, l'envoi peut prendre du retard. Source : documentation développeur WooCommerce et guide Hookdeck sur les webhooks WooCommerce.
- 2026-10-25 · Après 5 échecs de livraison consécutifs (réponse autre que 2xx), WooCommerce désactive le webhook ; il faut le réactiver. Si n8n est arrêté quelques heures, vérifiez l'état du webhook dans WooCommerce > Réglages > Avancé > Webhooks. Source : guide Hookdeck sur les webhooks WooCommerce, à recouper avec la documentation WooCommerce.
- 2026-10-25 · `order.updated` se déclenche à chaque modification de la commande, pas seulement au paiement. Parade : filtre sur le statut et sur la note `WA-` (section 6). Source : documentation REST API WooCommerce, section Webhooks.

## 8. Abonnement requis

| Besoin | Coût |
|---|---|
| WooCommerce, API REST, webhooks | Gratuit (extension WordPress) ; hébergement du site à la charge de l'utilisateur |
| Champ de consentement au paiement | Extrait de code (gratuit) ou extension d'éditeur de champs (gratuite ou payante selon l'extension) |
| Panier abandonné | Extension de récupération de panier ; plusieurs ont une version gratuite, vérifiez que la fonction webhook en fait partie |
