# HubSpot

Fiche à suivre quand la rubrique `logiciel` de la fiche de cadrage vaut HubSpot. Relevé du 2026-10-25. Les menus HubSpot changent souvent de nom : si un intitulé ne correspond pas, demandez à l'utilisateur de faire une capture d'écran et adaptez.

## 1. Où vivent le lead, son téléphone et son statut

- Le lead est un **contact** HubSpot. S'il y a une vente à suivre (devis, montant), elle vit dans une **transaction** associée au contact.
- Le téléphone : propriété « Numéro de téléphone mobile » (`mobilephone`) ou « Numéro de téléphone » (`phone`). HubSpot propose aussi une propriété dédiée « Numéro de téléphone WhatsApp » (`hs_whatsapp_phone_number`). Choisissez-en une seule pour l'agent et notez-la dans la fiche de cadrage, rubrique `logiciel`.
- Le statut : HubSpot a déjà « Statut du lead » (`hs_lead_status`) et « Phase du cycle de vie » (`lifecyclestage`). Ne les détournez pas : l'équipe commerciale s'en sert peut-être. Créez une propriété dédiée « Statut WhatsApp » (section 2) qui porte les 8 statuts canoniques.
- Correspondance conseillée avec les propriétés existantes, à valider avec l'utilisateur :

| Statut canonique | Statut WhatsApp (valeur interne) | Effet conseillé sur les propriétés HubSpot |
|---|---|---|
| `nouveau` | `nouveau` | aucun |
| `contacte` | `contacte` | Statut du lead = Tentative de contact |
| `en_conversation` | `en_conversation` | Statut du lead = Connecté |
| `qualifie` | `qualifie` | Phase du cycle de vie = Lead qualifié marketing ou commercial (au choix de l'utilisateur) |
| `rdv_pris` | `rdv_pris` | création d'une réunion sur le contact |
| `client` | `client` | Phase du cycle de vie = Client |
| `perdu` | `perdu` | Statut du lead = Non qualifié ou Mauvais timing |
| `stop` | `stop` | aucun message WhatsApp, jamais ; ajout à une liste « Ne pas contacter WhatsApp » |

## 2. Champs à créer

Chemin : icône engrenage (Paramètres) > Données > Propriétés > onglet « Propriétés de contact » > bouton « Créer une propriété ». Groupe conseillé : créez un groupe « WhatsApp » pour tout retrouver.

| Libellé | Nom interne | Type de champ | Valeurs |
|---|---|---|---|
| Statut WhatsApp | `statut_whatsapp` | Liste déroulante | nouveau, contacte, en_conversation, qualifie, rdv_pris, client, perdu, stop (libellés lisibles, valeurs internes exactement ces codes) |
| Consentement WhatsApp | `consentement_whatsapp` | Case à cocher unique | Oui / Non |
| Date du consentement WhatsApp | `date_consentement_whatsapp` | Sélecteur de date | |
| Source du consentement | `source_consentement_whatsapp` | Texte sur une ligne | ex. « formulaire site, case cochée » |
| Dernier message WhatsApp | `dernier_message_whatsapp` | Sélecteur de date et d'heure | |
| Séquence WhatsApp en cours | `sequence_whatsapp` | Liste déroulante | aucune, nurturing_formulaire, panier_abandonne, rendez_vous |

Ajoutez une case « J'accepte d'être recontacté sur WhatsApp » à vos formulaires HubSpot, reliée à `consentement_whatsapp` (Marketing > Formulaires > ouvrir le formulaire > glisser la propriété dans le formulaire). Sans cette case cochée, l'automatisation ne doit rien envoyer : voir `../05-conformite.md`.

Deux champs de plus si les relances sont planifiées (toujours avec Make ; avec n8n quand on préfère un passage quotidien à de longues attentes dans le workflow) : « Étape WhatsApp » (nombre : 0, 1, 3, 7, soit le jour de la dernière relance envoyée) et « Prochaine relance WhatsApp » (date et heure). Chaque jour, l'automatisation cherche les leads dont la prochaine relance est passée, envoie le bon modèle selon l'étape, puis avance les deux champs. Voir `../scenarios/nurturing-formulaire.md`.

## 3. Déclencheurs disponibles

| Cas d'usage | Option gratuite (conseillée pour démarrer) | Option avec abonnement payant |
|---|---|---|
| Formulaire rempli (nurturing) | n8n : nœud Schedule Trigger toutes les 5 minutes, puis nœud HubSpot, ressource Contact, opération « Get recently created/updated contacts », filtré sur `statut_whatsapp` vide et `consentement_whatsapp` = Oui. Make : module HubSpot CRM « Watch Contacts » | Workflow HubSpot déclenché par la soumission du formulaire, avec l'action « Envoyer un webhook » vers n8n ou Make |
| Changement de statut fait à la main par un commercial | Même sondage, filtré sur la date de modification | Workflow sur changement de propriété + webhook |
| Rendez-vous | Outil Réunions de HubSpot (gratuit) : la réunion réservée crée un événement sur le contact, lu par le sondage | Workflow « réunion réservée » + webhook |
| Message transactionnel (transaction gagnée) | Sondage sur les transactions modifiées (opération Deal > « Get recently created/updated deals ») | Workflow sur transaction passée en « Conclue gagnée » + webhook |

À propos du nœud « HubSpot Trigger » de n8n : il existe (événements `contact.creation`, `contact.propertyChange`, `deal.propertyChange`…), mais il demande un compte développeur HubSpot et une application publique. C'est trop technique pour un premier projet : préférez le sondage, sauf si l'utilisateur a quelqu'un de technique à ses côtés.

## 4. Écrire le statut et la trace `WA-`

- Statut : mettez à jour `statut_whatsapp`, `dernier_message_whatsapp` et, si besoin, `hs_lead_status` sur le contact.
- Trace : créez une **note** sur le contact, texte commençant par `WA-` (ex. `WA-J1 envoyé : modèle relance_formulaire_j1`, `WA-REPONSE : « Oui, rappelez-moi demain »`, `WA-STOP`, `WA-ERREUR 63016`).

Dans n8n, deux limites du nœud HubSpot, vérifiées dans le catalogue de nœuds le 2026-10-25 :
- l'opération Contact « Create or update » (upsert) retrouve le contact par son **email**. Pour un contact sans email, ou pour mettre à jour par identifiant, utilisez un nœud HTTP Request : méthode `PATCH`, URL `https://api.hubapi.com/crm/v3/objects/contacts/{{id du contact}}`, authentification « Predefined credential type » > HubSpot App Token, corps JSON `{"properties": {"statut_whatsapp": "en_conversation"}}`.
- l'opération Engagement > Create propose appel, email, réunion et tâche, mais pas la note. Pour une note : nœud HTTP Request, méthode `POST`, URL `https://api.hubapi.com/crm/v3/objects/notes`, corps avec `hs_note_body`, `hs_timestamp` et l'association au contact (type d'association « note vers contact »). La Claude de l'utilisateur peut générer ce corps JSON à partir de la documentation HubSpot de l'API Notes.

Dans Make : modules HubSpot CRM « Update a Contact » (mise à jour par identifiant) et « Create an Engagement » (type Note). Vérifiez le nom exact dans la liste des modules de votre compte Make.

Pour retrouver le contact à partir d'un message WhatsApp entrant (`From` = `whatsapp:+33600000000`) : retirez le préfixe `whatsapp:`, puis cherchez le contact par téléphone (n8n : Contact > Search avec un filtre sur la propriété téléphone choisie ; Make : « Search for Contacts »). HubSpot enregistre parfois les numéros avec des espaces : cherchez aussi sur la propriété calculée `hs_searchable_calculated_phone_number`, qui contient le numéro sans mise en forme.

## 5. Connexion à n8n et à Make

### Jeton d'application privée (n8n et appels HTTP)

HubSpot a déplacé les « applications privées » dans un menu « Applications héritées » (legacy apps) début 2026. Les jetons restent valables ; seul le chemin change.

1. Connectez-vous avec un compte **super administrateur** qui restera dans l'entreprise. Si ce compte est supprimé un jour, les appels échoueront avec l'erreur `USER_DOES_NOT_HAVE_PERMISSIONS`.
2. Portails récents : menu Développement > Applications héritées > « Créer une application héritée » > Privée. Portails plus anciens : Paramètres > Intégrations > Applications privées > « Créer une application privée ».
3. Nom : « Agent WhatsApp ». Onglet Portées (Scopes), cochez : `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write` si les transactions servent, `crm.schemas.contacts.read`.
4. Créez l'application, ouvrez l'onglet Authentification (Auth), cliquez « Afficher le jeton », copiez-le.
5. Dans n8n : Credentials > Add credential > « HubSpot App Token » > collez le jeton. Ne le collez jamais dans la conversation avec Claude ni dans un fichier.

HubSpot propose aussi des « clés de service » (service keys), en bêta publique en 2026 et sans prise en charge des webhooks : ne les utilisez pas pour ce projet.

### Make

Ajoutez un module HubSpot CRM, cliquez « Create a connection », connectez-vous à HubSpot et choisissez le bon portail. Make demande lui-même les autorisations, aucun jeton à copier.

## 6. Confirmation d'achat ou événement de vente

HubSpot n'est pas une boutique : la confirmation d'achat vient en général de l'outil de paiement ou du site (voir `shopify.md` ou `woocommerce.md`). Côté HubSpot, l'événement de vente est la transaction passée à l'étape « Conclue gagnée ».
- Sans abonnement payant : sondage toutes les 5 à 15 minutes sur les transactions modifiées, filtre sur l'étape gagnée, puis passage du contact associé en `client`.
- Avec l'action webhook (abonnement payant, section 8) : workflow de transaction, déclencheur « l'étape de la transaction est Conclue gagnée », action « Envoyer un webhook » (POST, URL en HTTPS du nœud Webhook n8n ou du module Custom webhook de Make). L'action se trouve dans le panneau de gauche de l'éditeur de workflow, section « Opérations sur les données » (Data ops).

## 7. Pièges vérifiés

- 2026-10-25 · Le nœud HubSpot de n8n met à jour un contact par email (upsert) et ne crée pas de note. Parade : HTTP Request sur l'API CRM v3 (section 4). Source : catalogue de nœuds n8n, nœud HubSpot v2.2.
- 2026-10-25 · Le nœud HubSpot Trigger de n8n demande des identifiants de compte développeur (`hubspotDeveloperApi`), pas le jeton d'application privée. Parade : sondage planifié. Source : catalogue de nœuds n8n.
- 2026-10-25 · Les applications privées apparaissent désormais sous « Applications héritées » dans les portails récents. Source : documentation développeur HubSpot, page « Private apps » (developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview).
- 2026-10-25 · Le jeton cesse de fonctionner si son créateur est retiré du portail (`USER_DOES_NOT_HAVE_PERMISSIONS`). Parade : créer l'application depuis un compte pérenne. Source : documentation développeur HubSpot, même page.
- 2026-10-25 · L'action « Envoyer un webhook » des workflows exige une URL en HTTPS. Source : base de connaissances HubSpot, « Use webhooks with HubSpot workflows ».

## 8. Abonnement requis

| Besoin | Abonnement |
|---|---|
| Contacts, propriétés personnalisées, formulaires, outil Réunions, application privée | HubSpot gratuit |
| Workflows | Hub payant (Professional en général ; certaines offres Starter proposent des workflows simples) : à vérifier dans votre compte, menu Automatisations > Workflows |
| Action « Envoyer un webhook » dans un workflow | Operations Hub Professional ou Enterprise selon la base de connaissances HubSpot ; HubSpot a renommé et regroupé ses offres en 2025, vérifiez le nom actuel sur la page tarifs |

Avec le plan gratuit, tout le projet fonctionne par sondage : quelques minutes de délai, aucun coût HubSpot supplémentaire.
