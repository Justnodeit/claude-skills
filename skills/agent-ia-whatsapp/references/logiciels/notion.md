# Notion

Fiche à suivre quand la rubrique `logiciel` de la fiche de cadrage vaut Notion. Relevé du 2026-10-25. Notion n'est pas un CRM : on y construit une base de données de leads qui en tient lieu. Ça marche bien jusqu'à quelques centaines de leads par mois.

## 1. Où vivent le lead, son téléphone et son statut

- Un lead = une **page** dans une **base de données** Notion (par exemple « Leads WhatsApp »).
- Le téléphone : propriété de type « Téléphone ».
- Le statut : propriété de type « Statut » (ou « Sélection ») qui porte les 8 statuts canoniques.
- L'historique des échanges : soit une propriété texte « Dernier échange », soit des blocs ajoutés dans le contenu de la page (une ligne par message, préfixée `WA-`). Le contenu de page se lit mieux pour un humain ; la propriété se filtre mieux.

Si l'utilisateur a déjà une base de leads ou de clients, partez de celle-ci : ajoutez les propriétés manquantes plutôt que d'en créer une nouvelle.

## 2. Champs à créer

Dans la base, cliquez sur « + » à droite du dernier en-tête de colonne pour ajouter chaque propriété.

| Nom de la propriété | Type | Valeurs ou format |
|---|---|---|
| Nom | Titre (existe déjà) | Prénom et nom |
| Téléphone | Téléphone | Format international : +33600000000 |
| Statut WhatsApp | Sélection | nouveau, contacte, en_conversation, qualifie, rdv_pris, client, perdu, stop |
| Consentement WhatsApp | Case à cocher | cochée seulement si la personne a accepté |
| Date du consentement | Date | |
| Source | Sélection | formulaire, panier, lien WhatsApp, salon, autre |
| Dernier message WhatsApp | Date (avec l'heure) | |
| Séquence en cours | Sélection | aucune, nurturing_formulaire, panier_abandonne, rendez_vous |
| Notes de qualification | Texte | rempli par l'agent : besoin, budget, délai |

Pourquoi « Sélection » plutôt que « Statut » : l'API Notion lit et écrit les deux, mais les options d'une propriété « Statut » ne se créent qu'à la main dans Notion, alors qu'une « Sélection » accepte une valeur écrite par l'automatisation. Avec « Sélection », créez quand même les 8 options à l'avance pour éviter les fautes de frappe.

Les codes doivent être écrits exactement comme ci-dessus (minuscules, tiret bas). L'automatisation compare des textes : « Contacté » et « contacte » sont deux valeurs différentes.

Deux champs de plus si les relances sont planifiées (toujours avec Make ; avec n8n quand on préfère un passage quotidien à de longues attentes dans le workflow) : « Étape WhatsApp » (nombre : 0, 1, 3, 7, soit le jour de la dernière relance envoyée) et « Prochaine relance WhatsApp » (date et heure). Chaque jour, l'automatisation cherche les leads dont la prochaine relance est passée, envoie le bon modèle selon l'étape, puis avance les deux champs. Voir `../scenarios/nurturing-formulaire.md`.

## 3. Déclencheurs disponibles

| Cas d'usage | n8n | Make |
|---|---|---|
| Nouveau lead (formulaire Notion, saisie à la main, import) | Nœud **Notion Trigger**, événement « Page Added to Database », base choisie dans la liste | Module Notion « Watch Database Items » |
| Statut changé à la main (ex. un commercial passe en `qualifie`) | Notion Trigger, événement « Page Updated in Database », puis filtre sur la propriété | Même module, avec un filtre |
| Rendez-vous | Notion ne gère pas d'agenda : passez par l'outil de réservation (Calendly, Google Agenda) et écrivez le résultat dans Notion | idem |
| Achat | Notion ne voit pas les ventes : le déclencheur vient de la boutique ou du paiement (voir `shopify.md`, `woocommerce.md`) | idem |

Le déclencheur Notion de n8n fonctionne par **sondage** : n8n interroge la base à intervalle régulier (réglage « Poll Times », par défaut chaque minute). Le module Make fonctionne aussi par sondage, au rythme du scénario (15 minutes par défaut sur les petites offres Make). Comptez donc une à quinze minutes de délai entre l'entrée du lead et le premier message.

Option temps réel, sur offre Notion payante : les automatisations de base de données Notion ont une action « Envoyer un webhook ». Dans la base : bouton éclair (Automatisations) > « Nouvelle automatisation » > déclencheur « Page ajoutée » ou « Propriété modifiée » > action « Envoyer un webhook » > collez l'URL du nœud Webhook n8n ou du module Custom webhook Make, puis cochez les propriétés à envoyer. Le webhook part en POST, sans authentification.

Pour un formulaire de capture simple, Notion propose ses propres formulaires (vue Formulaire dans une base) : chaque réponse crée une page, donc déclenche « Page Added to Database ». Ajoutez au formulaire une question case à cocher « J'accepte d'être recontacté sur WhatsApp » reliée à la propriété Consentement WhatsApp.

## 4. Écrire le statut et la trace `WA-`

- Statut : n8n, nœud Notion, ressource Database Page, opération « Update », identifiant de la page lu dans le déclencheur, propriété « Statut WhatsApp » = `en_conversation` par exemple. Make : module « Update a Database Item ».
- Trace : n8n, nœud Notion, ressource Block, opération « Append », sur l'identifiant de la page, bloc paragraphe `WA-J1 envoyé, 2026-10-25 10:02`. Make : module « Append a Page Content » (nom à vérifier dans votre compte Make).

Retrouver la page à partir d'un message WhatsApp entrant : nœud Notion, ressource Database Page, opération « Get Many », filtre « Téléphone » égal au numéro reçu sans le préfixe `whatsapp:`. Make : module « Search Objects » ou « Search Database Items ». Si aucun résultat, créez une page avec Source = lien WhatsApp et Statut = `en_conversation`.

## 5. Connexion à n8n et à Make

### Intégration interne Notion (pour n8n)

1. Ouvrez https://www.notion.so/profile/integrations (menu Paramètres > Connexions > « Développer ou gérer les intégrations »).
2. « Nouvelle intégration » > type **Interne** > nom « Agent WhatsApp » > espace de travail de l'entreprise > Enregistrer.
3. Onglet Capacités : cochez Lire le contenu, Mettre à jour le contenu, Insérer du contenu. Les informations utilisateur ne sont pas nécessaires.
4. Copiez le « Secret d'intégration interne ».
5. **Étape souvent oubliée** : ouvrez la base « Leads WhatsApp », menu « ••• » en haut à droite > Connexions > ajoutez « Agent WhatsApp ». Sans ce partage, n8n répond que la base est introuvable.
6. Dans n8n : Credentials > Add credential > « Notion API » > collez le secret.

### Make

Ajoutez un module Notion, « Create a connection », connectez-vous à Notion et cochez les pages et bases auxquelles Make a accès (au moins la base des leads).

## 6. Confirmation d'achat ou événement de vente

Sans objet côté Notion : Notion n'enregistre pas de ventes. La confirmation d'achat part d'un webhook de la boutique ou du paiement (voir la fiche du logiciel de vente) ; l'automatisation met ensuite la page du lead à `client` dans Notion.

## 7. Pièges vérifiés

- 2026-10-25 · Le déclencheur Notion de n8n n'a que deux événements, « Page Added to Database » et « Page Updated in Database », en sondage. Il ne voit pas une page supprimée. Source : catalogue de nœuds n8n, Notion Trigger v1.
- 2026-10-25 · L'action « Envoyer un webhook » des automatisations Notion est réservée aux offres payantes. Si un webhook échoue, Notion met l'automatisation en pause et il faut la relancer à la main. Maximum cinq actions webhook par automatisation. Source : aide Notion, « Webhook actions » (notion.com/help/webhook-actions).
- 2026-10-25 · Une intégration interne ne voit que les pages et bases qui lui ont été partagées (menu Connexions). Source : documentation développeur Notion, guide d'autorisation des intégrations internes.

## 8. Abonnement requis

| Besoin | Abonnement Notion |
|---|---|
| Base de données, formulaires, intégration interne, déclencheur n8n ou Make par sondage | Gratuit |
| Automatisations de base de données avec action « Envoyer un webhook » | Offre payante (Plus ou supérieure) : à vérifier sur la page tarifs de Notion au moment du projet |

Le plan gratuit suffit pour démarrer. Le webhook payant n'apporte que la suppression du délai de sondage.
