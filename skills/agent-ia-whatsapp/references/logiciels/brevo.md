# Brevo

Fiche à suivre quand la rubrique `logiciel` de la fiche de cadrage vaut Brevo. Relevé du 2026-10-25.

Brevo propose aussi ses propres campagnes WhatsApp. Si l'utilisateur veut seulement envoyer des campagnes de masse à sa liste, l'outil natif de Brevo peut suffire. Ce skill construit autre chose : un agent qui converse et qualifie, branché sur Twilio. Dites-le à l'utilisateur dès le cadrage pour qu'il ne paie pas deux fois.

## 1. Où vivent le lead, son téléphone et son statut

- Le lead est un **contact** Brevo, rangé dans une ou plusieurs **listes**.
- Le téléphone : attribut `SMS` (utilisé pour le SMS) et, selon les comptes, attribut `WHATSAPP`. Utilisez un seul des deux pour l'agent, au format international (+33600000000), et notez lequel dans la fiche de cadrage.
- Le statut : créez un attribut de contact `STATUT_WA` (section 2). Les listes servent en plus pour segmenter, pas pour porter le statut (un contact peut être dans plusieurs listes à la fois, ce qui rend le statut ambigu).
- Brevo propose aussi un module « Ventes » (CRM avec affaires et pipeline). Si l'utilisateur s'en sert, l'affaire gagnée vaut `client`.

| Statut canonique | Dans Brevo |
|---|---|
| `nouveau` | `STATUT_WA` = nouveau ; ajouté à la liste « Leads WhatsApp » |
| `contacte` | `STATUT_WA` = contacte |
| `en_conversation` | `STATUT_WA` = en_conversation |
| `qualifie` | `STATUT_WA` = qualifie ; affaire créée si le module Ventes sert |
| `rdv_pris` | `STATUT_WA` = rdv_pris |
| `client` | `STATUT_WA` = client |
| `perdu` | `STATUT_WA` = perdu |
| `stop` | `STATUT_WA` = stop ; contact ajouté à une liste « Ne pas contacter WhatsApp » |

## 2. Champs à créer

Chemin : Contacts > Paramètres > Attributs de contact (ou « Attributs ») > « Ajouter un nouvel attribut ».

| Nom de l'attribut | Type | Valeurs |
|---|---|---|
| STATUT_WA | Catégorie | nouveau, contacte, en_conversation, qualifie, rdv_pris, client, perdu, stop |
| CONSENT_WA | Booléen | oui / non |
| CONSENT_WA_DATE | Date | |
| DERNIER_MSG_WA | Date | |
| SEQUENCE_WA | Catégorie | aucune, nurturing_formulaire, panier_abandonne, rendez_vous |

Avec un attribut de type Catégorie, Brevo stocke un numéro par valeur (1, 2, 3…). Notez la correspondance numéro ↔ code dans la fiche de cadrage : l'automatisation écrit parfois le numéro, pas le libellé.

Formulaires Brevo (Contacts > Formulaires) : ajoutez un champ téléphone relié à l'attribut choisi et une case « J'accepte d'être recontacté sur WhatsApp » reliée à `CONSENT_WA`. Le formulaire doit inscrire le contact dans la liste « Leads WhatsApp » : c'est cet ajout à la liste qui déclenche la séquence.

Deux champs de plus si les relances sont planifiées (toujours avec Make ; avec n8n quand on préfère un passage quotidien à de longues attentes dans le workflow) : « Étape WhatsApp » (nombre : 0, 1, 3, 7, soit le jour de la dernière relance envoyée) et « Prochaine relance WhatsApp » (date et heure). Chaque jour, l'automatisation cherche les leads dont la prochaine relance est passée, envoie le bon modèle selon l'étape, puis avance les deux champs. Voir `../scenarios/nurturing-formulaire.md`.

## 3. Déclencheurs disponibles

| Cas d'usage | n8n | Make |
|---|---|---|
| Nouveau lead (formulaire, import) | Nœud **Brevo Trigger**, type « Marketing » : n8n crée un webhook marketing chez Brevo ; l'événement d'ajout à une liste est à choisir s'il est proposé, sinon sondage (ligne suivante) | Module Brevo de surveillance des contacts ou des événements, nom à vérifier dans votre compte |
| Sondage, si le webhook ne convient pas | Schedule Trigger toutes les 5 minutes + nœud Brevo, ressource Contact, opération « Get Many », filtre sur la date de modification | Module de recherche de contacts dans un scénario planifié |
| Désinscription | Brevo Trigger type « Marketing », événement désinscription : passez le contact en `stop` côté WhatsApp seulement si la fiche de cadrage le prévoit (une désinscription email n'est pas un STOP WhatsApp, à trancher avec l'utilisateur) | idem |
| Panier abandonné | Brevo ne voit les paniers que si le site lui envoie des événements (traceur Brevo, application Brevo pour Shopify ou WooCommerce). Plus simple : partir de la boutique (voir `shopify.md` ou `woocommerce.md`) | idem |
| Rendez-vous | Brevo propose un outil « Meetings » ; sinon outil d'agenda externe | idem |

Le Brevo Trigger de n8n propose trois types : Inbound (emails reçus), Marketing (campagnes et contacts) et Transactional (emails transactionnels : livré, ouvert, cliqué…). Pour ce projet, seul le type Marketing est utile.

Création manuelle d'un webhook : dans Brevo, cherchez le menu Webhooks (selon la version de l'interface : Paramètres > Webhooks, ou Transactionnel > Paramètres > Webhook pour les emails transactionnels). Indiquez l'URL du nœud Webhook n8n ou du module Custom webhook de Make, puis l'événement « Ajouté à une liste » s'il est proposé. Les libellés changent d'une version de Brevo à l'autre : faites vérifier à l'écran.

## 4. Écrire le statut et la trace `WA-`

- Statut : n8n, nœud Brevo, ressource Contact, opération « Update » (identifiant = email ou identifiant du contact), attribut `STATUT_WA`. Make : module de mise à jour d'un contact.
- Trace : Brevo n'a pas de « note » simple sur le contact dans les nœuds n8n. Deux options :
  - écrire le dernier événement dans un attribut texte `DERNIER_EVT_WA` (ex. `WA-J1 envoyé 2026-10-25`) ;
  - si le module Ventes de Brevo sert, créer une note sur l'affaire ou le contact par l'API CRM de Brevo (nœud HTTP Request, en-tête `api-key`).

Retrouver le contact à partir d'un message WhatsApp entrant : Brevo identifie un contact par email, par identifiant, ou par l'attribut SMS. Nœud HTTP Request : `GET https://api.brevo.com/v3/contacts/{numéro}?identifierType=phone_id` (paramètre à vérifier dans la référence de l'API Contacts de Brevo au moment du projet), sinon filtre sur l'attribut téléphone. Si aucun contact : créez-le avec l'attribut téléphone et `STATUT_WA` = en_conversation.

## 5. Connexion à n8n et à Make

### Clé API (n8n et appels HTTP)

1. Il faut un accès administrateur au compte Brevo.
2. Menu du compte (en haut à droite) > **SMTP et API** > onglet **Clés API** (intitulé « Clés API et MCP » dans certaines interfaces récentes) > « Générer une nouvelle clé API ».
3. Nom : « Agent WhatsApp ». Copiez la clé tout de suite : Brevo ne l'affiche qu'une fois.
4. Dans n8n : Credentials > Add credential > « Brevo API » > collez la clé.

### Make

Ajoutez un module Brevo, « Create a connection », collez la même clé API.

## 6. Confirmation d'achat ou événement de vente

Brevo n'encaisse pas les commandes. La confirmation d'achat part du webhook de la boutique ou du paiement (voir la fiche du logiciel de vente). Brevo sert ensuite à mettre `STATUT_WA` = client et, si besoin, à déplacer le contact de liste. Si le module Ventes de Brevo sert, l'affaire passée à l'étape gagnée est l'événement de vente ; vérifiez dans votre compte si cette étape peut déclencher un webhook.

## 7. Pièges vérifiés

- 2026-10-25 · La clé API Brevo ne s'affiche qu'une seule fois à sa création. Source : documentation développeur Brevo, « API key authentication » (developers.brevo.com).
- 2026-10-25 · Le Brevo Trigger de n8n distingue trois types de webhooks (inbound, marketing, transactional) ; le choix des événements fins n'est proposé que pour le type transactionnel. Source : catalogue de nœuds n8n, Brevo Trigger v1.

## 8. Abonnement requis

| Besoin | Abonnement Brevo |
|---|---|
| Contacts, attributs, listes, formulaires, clé API | Gratuit |
| Webhooks marketing | À vérifier dans votre compte |
| Module Ventes (CRM), Meetings | Selon l'offre, à vérifier sur la page tarifs |
| Campagnes WhatsApp natives de Brevo | Facturées à part par Brevo ; inutiles si l'agent passe par Twilio |
