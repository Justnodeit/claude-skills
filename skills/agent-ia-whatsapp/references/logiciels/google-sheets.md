# Google Sheets

Fiche à suivre quand la rubrique `logiciel` de la fiche de cadrage vaut Google Sheets, ou quand l'utilisateur n'a pas encore d'outil de suivi des leads. Relevé du 2026-10-25. Une feuille bien tenue suffit pour démarrer ; au-delà de quelques milliers de lignes ou de plusieurs personnes qui modifient en même temps, proposez un vrai CRM.

## 1. Où vivent le lead, son téléphone et son statut

- Un lead = une **ligne** dans un onglet « Leads » d'un classeur Google Sheets.
- Le téléphone : une colonne dédiée, au format international +33600000000.
- Le statut : une colonne avec une liste déroulante qui porte les 8 statuts canoniques.
- L'historique : une colonne « Dernier échange » (le plus récent) et, si besoin, un second onglet « Journal WhatsApp » où chaque message ajoute une ligne (date, téléphone, sens, texte, trace `WA-`).

Si les leads arrivent par Google Forms, les réponses tombent dans un onglet « Réponses au formulaire 1 ». Ne modifiez pas cet onglet à la main ni par l'automatisation : Google y ajoute les nouvelles réponses. Recopiez chaque réponse dans l'onglet « Leads », qui est celui que l'agent lit et écrit.

## 2. Champs à créer

Première ligne de l'onglet « Leads », un en-tête par colonne, sans espace ni accent pour éviter les surprises dans n8n et Make :

| Colonne | En-tête | Contenu |
|---|---|---|
| A | id | identifiant unique (ex. date + 4 chiffres), jamais modifié |
| B | date_entree | date et heure d'arrivée du lead |
| C | prenom | |
| D | nom | |
| E | telephone | +33600000000 |
| F | email | |
| G | source | formulaire, panier, lien_whatsapp, salon, autre |
| H | consentement_whatsapp | oui / non |
| I | date_consentement | |
| J | statut_whatsapp | liste déroulante : nouveau, contacte, en_conversation, qualifie, rdv_pris, client, perdu, stop |
| K | sequence | aucune, nurturing_formulaire, panier_abandonne, rendez_vous |
| L | etape_sequence | J0, J1, J3, J7… |
| M | dernier_message | date et heure |
| N | dernier_echange | texte court, préfixé WA- |
| O | notes_qualification | rempli par l'agent : besoin, budget, délai |

Réglages à faire une fois :
1. Colonne E (téléphone) : sélectionnez la colonne > Format > Nombre > **Texte brut**. Sans ce réglage, Sheets retire le « + » et transforme +33600000000 en nombre, voire en notation scientifique.
2. Colonne J (statut) : sélectionnez la colonne > Insertion > Liste déroulante (ou Données > Validation des données) > ajoutez les 8 codes exactement comme écrits ci-dessus.
3. Figez la première ligne (Affichage > Figer > 1 ligne).

Deux champs de plus si les relances sont planifiées (toujours avec Make ; avec n8n quand on préfère un passage quotidien à de longues attentes dans le workflow) : « Étape WhatsApp » (nombre : 0, 1, 3, 7, soit le jour de la dernière relance envoyée) et « Prochaine relance WhatsApp » (date et heure). Chaque jour, l'automatisation cherche les leads dont la prochaine relance est passée, envoie le bon modèle selon l'étape, puis avance les deux champs. Voir `../scenarios/nurturing-formulaire.md`.

## 3. Déclencheurs disponibles

| Cas d'usage | n8n | Make |
|---|---|---|
| Nouveau lead (ligne ajoutée) | Nœud **Google Sheets Trigger**, événement « Row Added », onglet « Leads » | Module Google Sheets « Watch New Rows » |
| Statut changé à la main | Google Sheets Trigger, événement « Row Updated », option « Columns to Watch » = statut_whatsapp | Module de surveillance des modifications (« Watch Changes » ou équivalent, nom à vérifier) ; à défaut, scénario planifié qui relit la feuille |
| Relances programmées (J+1, J+3…) | Schedule Trigger chaque matin + nœud Google Sheets, opération « Get Row(s) », filtre sur statut et date du dernier message | Scénario planifié + « Search Rows » |
| Panier, achat, rendez-vous | La feuille ne voit pas ces événements : le déclencheur vient de la boutique ou de l'outil d'agenda, et l'automatisation écrit le résultat dans la feuille | idem |

Le Google Sheets Trigger de n8n fonctionne par **sondage** (réglage « Poll Times », par défaut chaque minute). Le module « Watch New Rows » de Make lit aussi la feuille à chaque exécution du scénario. Comptez une à quinze minutes de délai.

## 4. Écrire le statut et la trace `WA-`

- Mettre à jour une ligne : n8n, nœud Google Sheets, opération « Update Row », colonne de correspondance = `id` (ou `telephone`), puis les colonnes à changer (`statut_whatsapp`, `dernier_message`, `dernier_echange`). Make : module « Update a Row » (avec le numéro de ligne) ou recherche puis mise à jour.
- Journal : n8n, opération « Append Row » dans l'onglet « Journal WhatsApp ». Make : module « Add a Row ».
- Retrouver le lead à partir d'un message WhatsApp entrant : opération « Get Row(s) » avec filtre `telephone` = numéro reçu sans `whatsapp:`. Si aucune ligne : « Append Row » avec source = lien_whatsapp et statut = en_conversation.

Toujours chercher par `id` ou par `telephone`, jamais par numéro de ligne : un tri ou une suppression de ligne décale tous les numéros.

## 5. Connexion à n8n et à Make

### n8n

- n8n Cloud : Credentials > Add credential > « Google Sheets OAuth2 API » > « Sign in with Google » avec le compte Google qui possède la feuille. Le déclencheur utilise un identifiant à part, « Google Sheets Trigger OAuth2 API », créé de la même façon.
- n8n installé chez soi (auto-hébergé) : la connexion Google demande de créer un projet dans Google Cloud Console, d'activer l'API Google Sheets (et l'API Google Drive pour lister les fichiers), puis de créer un identifiant OAuth avec l'URL de redirection affichée par n8n. C'est l'étape la plus technique du projet : proposez à l'utilisateur de la faire avec sa Claude, écran par écran, ou de passer par n8n Cloud.

### Make

Ajoutez un module Google Sheets, « Create a connection », « Sign in with Google », autorisez l'accès. Aucune clé à copier.

Utilisez un compte Google de l'entreprise (pas un compte personnel qui partira avec un salarié) et partagez la feuille avec les personnes qui doivent la lire.

## 6. Confirmation d'achat ou événement de vente

Sans objet côté Google Sheets : la feuille n'enregistre pas les ventes. Le webhook vient de la boutique ou du paiement (voir `shopify.md` ou `woocommerce.md`) ; l'automatisation met ensuite la ligne du lead à `client`.

## 7. Pièges vérifiés

- 2026-10-25 · Le Google Sheets Trigger de n8n fonctionne par sondage, avec trois événements : « Row Added », « Row Updated », « Row Added or Updated » ; l'option « Columns to Watch » limite le déclenchement aux colonnes choisies, sinon une nouvelle colonne déclenche aussi. Source : catalogue de nœuds n8n, Google Sheets Trigger v1.
- 2026-10-25 · Le déclencheur et le nœud d'action Google Sheets de n8n utilisent deux identifiants distincts (« Google Sheets Trigger OAuth2 API » et « Google Sheets OAuth2 API »). Source : catalogue de nœuds n8n.
- 2026-10-25 · Un numéro saisi « +33600000000 » dans une cellule au format automatique perd son « + ». Parade : colonne au format Texte brut (section 2). Source : comportement de Google Sheets, qui lit un « + » en tête de cellule comme le signe d’un nombre (constat reproductible en saisissant un numéro dans une cellule au format Automatique).

## 8. Abonnement requis

| Besoin | Coût |
|---|---|
| Google Sheets, Google Forms, connexion n8n ou Make | Gratuit avec un compte Google ; Google Workspace conseillé pour un compte d'entreprise |
| Limites d'appels à l'API Google Sheets | Quotas par minute appliqués par Google ; un sondage chaque minute reste en dessous pour un usage normal, à surveiller si plusieurs scénarios lisent la même feuille |
