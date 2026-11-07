# Pipedrive

Fiche à suivre quand la rubrique `logiciel` de la fiche de cadrage vaut Pipedrive. Relevé du 2026-10-25.

## 1. Où vivent le lead, son téléphone et son statut

Pipedrive range un prospect à trois endroits possibles. Demandez à l'utilisateur lequel il utilise vraiment :
- **Prospects** (Leads, onglet « Prospects » ou « Leads Inbox ») : les contacts entrants pas encore qualifiés ;
- **Personnes** (Persons) : la fiche contact, avec le téléphone ;
- **Affaires** (Deals) : l'opportunité dans le pipeline, avec ses étapes.

Conseil : le statut WhatsApp se pose sur la **Personne** (c'est elle qui a un téléphone et qui écrit). Le prospect ou l'affaire suivent : un prospect qualifié est converti en affaire, une affaire gagnée fait passer la personne en `client`.

- Téléphone : champ « Téléphone » de la Personne. Pipedrive accepte plusieurs numéros avec une étiquette (travail, mobile, domicile) : l'agent utilise le numéro étiqueté « mobile », à défaut le principal. Format international obligatoire pour WhatsApp : +33600000000.

| Statut canonique | Dans Pipedrive |
|---|---|
| `nouveau` | champ Statut WhatsApp = nouveau ; prospect dans la boîte de réception |
| `contacte` | Statut WhatsApp = contacte |
| `en_conversation` | Statut WhatsApp = en_conversation |
| `qualifie` | Statut WhatsApp = qualifie ; prospect converti en affaire, ou affaire déplacée à l'étape « Qualifié » |
| `rdv_pris` | Statut WhatsApp = rdv_pris ; activité de type Réunion créée |
| `client` | affaire marquée « Gagnée » ; Statut WhatsApp = client |
| `perdu` | prospect archivé ou affaire « Perdue » ; Statut WhatsApp = perdu |
| `stop` | Statut WhatsApp = stop ; étiquette « Ne pas contacter WhatsApp » |

## 2. Champs à créer

Chemin : Paramètres (votre nom en haut à droite > Paramètres de l'entreprise) > Gestion des données > Champs de données > onglet **Personne** > « + Champ personnalisé ».

| Nom | Type | Valeurs |
|---|---|---|
| Statut WhatsApp | Option unique | nouveau, contacte, en_conversation, qualifie, rdv_pris, client, perdu, stop |
| Consentement WhatsApp | Option unique | oui, non |
| Date du consentement | Date | |
| Dernier message WhatsApp | Date | |
| Séquence WhatsApp | Option unique | aucune, nurturing_formulaire, panier_abandonne, rendez_vous |

L'API identifie un champ personnalisé par une longue clé (40 caractères) et une option par un numéro, pas par son libellé. L'outil d'automatisation propose en général la liste des champs ; sinon, la clé se lit dans Champs de données > menu « ••• » du champ > copier la clé API.

Formulaires : si l'utilisateur utilise les formulaires web de Pipedrive (module LeadBooster selon l'offre), ajoutez une case de consentement WhatsApp reliée au champ Consentement.

Deux champs de plus si les relances sont planifiées (toujours avec Make ; avec n8n quand on préfère un passage quotidien à de longues attentes dans le workflow) : « Étape WhatsApp » (nombre : 0, 1, 3, 7, soit le jour de la dernière relance envoyée) et « Prochaine relance WhatsApp » (date et heure). Chaque jour, l'automatisation cherche les leads dont la prochaine relance est passée, envoie le bon modèle selon l'étape, puis avance les deux champs. Voir `../scenarios/nurturing-formulaire.md`.

## 3. Déclencheurs disponibles

| Cas d'usage | n8n | Make |
|---|---|---|
| Nouvelle personne (formulaire, import, saisie) | Nœud **Pipedrive Trigger**, Action = `create`, Object = `person` | Module de surveillance des personnes (« Watch Persons » ou « Watch New Events », nom à vérifier) |
| Statut changé à la main | Pipedrive Trigger, Action = `change`, Object = `person`, puis filtre sur le champ Statut WhatsApp | idem avec filtre |
| Nouveau prospect (Leads Inbox) | Le Pipedrive Trigger de n8n ne propose pas l'objet « lead » ; utilisez un nœud **Webhook** n8n et créez le webhook dans Pipedrive (ci-dessous) | Module de surveillance des prospects, s'il existe dans votre compte Make, sinon Custom webhook |
| Rendez-vous | Pipedrive Trigger, Action = `create`, Object = `activity`, filtre sur le type Réunion ; ou outil d'agenda de Pipedrive (Planificateur) | idem |
| Affaire gagnée | Pipedrive Trigger, Action = `change`, Object = `deal`, filtre sur `status` = `won` | Module de surveillance des affaires, filtre gagnée |

Le Pipedrive Trigger de n8n crée lui-même le webhook dans Pipedrive à l'activation du workflow. Pour créer un webhook à la main : Paramètres > Outils et applications > Webhooks > « Créer un webhook », indiquez l'URL du nœud Webhook n8n ou du module Custom webhook de Make, choisissez l'action (`create`, `change`, `delete`) et l'objet (personne, affaire, prospect, activité). Pipedrive crée par défaut des webhooks en version 2, où « added » s'appelle `create` et « updated » s'appelle `change`.

## 4. Écrire le statut et la trace `WA-`

- Statut : n8n, nœud Pipedrive, ressource Person, opération « Update », champ personnalisé Statut WhatsApp. Make : module de mise à jour d'une personne.
- Trace : n8n, nœud Pipedrive, ressource Note, opération « Create », rattachée à la personne (et à l'affaire si elle existe), contenu `WA-J1 envoyé : modèle relance_formulaire_j1`. Make : module de création de note.
- Rendez-vous : ressource Activity, opération « Create », type Réunion, date et heure, rattachée à la personne.

Retrouver la personne à partir d'un message WhatsApp entrant : n8n, ressource Person, opération « Search », terme = le numéro sans `whatsapp:` ni `+` (essayez aussi avec le 0 national si rien ne sort). Make : module de recherche de personnes. Si aucune personne : créez-la avec le nom de profil WhatsApp reçu (`ProfileName`) et Statut = `en_conversation`.

## 5. Connexion à n8n et à Make

### Jeton API personnel (n8n)

1. En haut à droite, cliquez sur votre nom > Paramètres de l'entreprise (ou Paramètres) > Préférences personnelles > onglet **API**.
2. Copiez le jeton. Si l'onglet API n'apparaît pas, l'administrateur doit autoriser l'usage de l'API dans votre jeu de permissions (Gestion des utilisateurs > Jeux de permissions).
3. Dans n8n : Credentials > Add credential > « Pipedrive API » > collez le jeton.

Ce jeton donne accès à tout le compte de l'utilisateur. Un seul jeton est actif à la fois : en régénérer un coupe l'ancien, donc toutes les automatisations qui s'en servent. Pour une équipe, créez de préférence un utilisateur dédié « Automatisations ».

### Make

Ajoutez un module Pipedrive CRM, « Create a connection », connexion par OAuth (fenêtre Pipedrive à valider) ou par jeton API selon ce que Make propose.

## 6. Confirmation d'achat ou événement de vente

Pipedrive n'encaisse pas de paiement. L'événement de vente est l'affaire marquée « Gagnée » : Pipedrive Trigger `change` + `deal`, filtre `status` = `won`, puis message utilitaire de remerciement ou de prochaine étape (signature, planning) et Statut WhatsApp = `client`. Si le paiement passe par une boutique ou Stripe, c'est leur webhook qui doit déclencher la confirmation d'achat.

## 7. Pièges vérifiés

- 2026-10-25 · Webhooks v2 par défaut : les actions s'appellent `create`, `change`, `delete` (plus `added`, `updated`). Un tutoriel ancien qui parle de `updated` ne marchera pas tel quel. Source : Pipedrive, « Webhooks v2 migration guide » (pipedrive.readme.io).
- 2026-10-25 · Au plus 40 webhooks par utilisateur. Supprimez les essais. Source : Pipedrive, « Guide for Webhooks v2 ».
- 2026-10-25 · Le Pipedrive Trigger de n8n (v1.1) propose activité, affaire, note, organisation, personne, pipeline, produit, étape, utilisateur, mais pas prospect. Source : catalogue de nœuds n8n.
- 2026-10-25 · Un seul jeton API actif ; jeton différent par entreprise si l'utilisateur en a plusieurs. Source : Pipedrive, « How to find the API token » (pipedrive.readme.io).

## 8. Abonnement requis

| Besoin | Abonnement Pipedrive |
|---|---|
| Champs personnalisés, jeton API, webhooks, notes, activités | Inclus dans les offres payantes, à vérifier sur la page tarifs pour l'offre de l'utilisateur |
| Formulaires web et chatbot (LeadBooster) | Module complémentaire ou offre supérieure, à vérifier |
| Planificateur de rendez-vous | Selon l'offre, à vérifier dans votre compte |
