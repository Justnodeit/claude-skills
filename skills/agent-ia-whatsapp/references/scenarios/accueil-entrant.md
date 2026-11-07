# Scénario : accueil des messages entrants

Fiche du skill `agent-ia-whatsapp`. Elle sert de socle aux autres scénarios : dès qu'un lead répond à une relance, une confirmation ou un rappel, c'est ce circuit qui prend la conversation.

## 1. À quoi ça sert, pour qui

Un prospect vous écrit sur WhatsApp. L'agent lui répond en quelques secondes, à toute heure, pose les questions de qualification que vous avez définies, met à jour sa fiche dans votre logiciel et vous passe la main quand il le faut.

Les portes d'entrée possibles (rubrique `sources` de la fiche de cadrage) :

- un lien `https://wa.me/33600000000?text=Bonjour` sur votre site, dans votre signature email ou en bio Instagram ;
- un QR code imprimé (vitrine, flyer, carte de visite, emballage) qui ouvre ce même lien ;
- un bouton « Discuter sur WhatsApp » sur votre site ;
- une publicité Meta « clic vers WhatsApp » (Facebook ou Instagram).

Le texte prérempli du lien (`?text=`) vous dit d'où vient le lead : utilisez un texte différent par source (« Bonjour, je viens du site », « Bonjour, j'ai scanné le QR code en boutique »). L'agent le lit et l'inscrit dans la fiche.

Pour qui : toute activité où un prospect pose des questions avant d'acheter (artisan, cabinet, agence, école, e-commerce avec conseil, restaurant qui prend des réservations de groupe).

## 2. Déclencheur et conditions d'entrée

Déclencheur : un message WhatsApp arrive sur votre numéro Twilio. Twilio l'envoie aussitôt à l'adresse de webhook réglée sur l'expéditeur (réglage décrit dans `02-twilio-whatsapp.md`, section du webhook entrant).

Champs reçus et utilisés :

| Champ Twilio | Contenu | Usage |
|---|---|---|
| `From` | `whatsapp:+33600000000` | Retrouver ou créer le contact |
| `WaId` | `33600000000` | Clé de la mémoire de conversation |
| `ProfileName` | Nom affiché dans WhatsApp | Prénom provisoire si la fiche n'en a pas |
| `Body` | Texte du message | Ce que l'agent lit |
| `NumMedia`, `MediaUrl0` | Photo, vocal, document | Voir les pièges en section 9 |
| `MessageSid` | Identifiant du message | Éviter de traiter deux fois le même message |

Conditions, dans cet ordre, avant que l'agent réponde :

1. Le texte contient un mot de désinscription (liste dans `05-conformite.md`) : statut `stop`, message de confirmation unique, fin. L'agent ne répond plus jamais ensuite, sauf si la personne réécrit d'elle-même pour reprendre contact.
2. Le contact existe dans le logiciel avec le statut `stop` et le message ne contient pas de demande de reprise : aucune réponse automatique, alerte à l'humain.
3. Une conversation est en cours avec un humain (marqueur `WA-HUMAIN` posé il y a moins de 24 h) : l'agent se tait, le message est seulement transmis à l'humain.
4. Sinon : l'agent répond.

Si le contact n'existe pas, il est créé avec le statut `nouveau`, puis passe en `en_conversation` dès la première réponse de l'agent.

## 3. Messages

Ici, c'est le client qui écrit en premier : la fenêtre de 24 h est ouverte, l'agent répond en texte libre, sans modèle à faire approuver. Les réponses de l'agent viennent du prompt (`04-prompt-agent.md`), pas de textes figés.

Deux textes restent fixes et sont écrits avec le client pendant le cadrage :

Premier message de l'agent, qui annonce l'IA (obligation de transparence, voir `05-conformite.md`) :

- Vous : « Bonjour {{prénom}}, je suis Léa, l'assistante virtuelle (IA) de {{entreprise}}. Je réponds tout de suite à vos questions et je transmets à l'équipe si besoin. Que puis-je faire pour vous ? »
- Tu : « Salut {{prénom}}, moi c'est Léa, l'assistante IA de {{entreprise}}. Je te réponds tout de suite et je passe le relais à l'équipe si besoin. Je t'écoute ! »

Message de passage à l'humain :

- Vous : « Je transmets votre demande à {{prénom_humain}}, qui vous répond ici même {{délai}}. »
- Tu : « Je passe le relais à {{prénom_humain}}, qui te répond ici même {{délai}}. »

Le `{{délai}}` dépend de l'heure : « dans l'heure » en horaires d'ouverture, « demain matin dès 9 h » sinon (rubrique `humain` de la fiche de cadrage).

Modèle à soumettre à Meta pour le cas où l'humain répond après la fenêtre de 24 h :

- Nom : `reprise_conversation`
- Catégorie : utilitaire (Meta peut la reclasser en marketing)
- Vous : « Bonjour {{1}}, suite à votre message du {{2}}, {{3}} a une réponse pour vous. Répondez à ce message pour la recevoir. »
- Tu : « Salut {{1}}, suite à ton message du {{2}}, {{3}} a une réponse pour toi. Réponds à ce message pour la recevoir. »

## 4. Calendrier et conditions d'arrêt

Pas de calendrier : l'agent réagit à chaque message entrant. Il s'arrête de répondre seul quand :

- la personne écrit un mot de désinscription (statut `stop`) ;
- un passage à l'humain est déclenché (marqueur `WA-HUMAIN`, l'agent se tait 24 h ou jusqu'à ce que l'humain le relance) ;
- la conversation dépasse le nombre d'échanges fixé au cadrage (par défaut 15 messages de l'agent sur 24 h) : passage à l'humain, pour éviter les boucles et la facture.

Déclencheurs du passage à l'humain (à valider avec le client, rubrique `humain`) :

| Situation | Exemple | Action |
|---|---|---|
| Demande explicite | « je veux parler à quelqu'un », « un humain svp » | Passage immédiat |
| Mécontentement | ton agressif, réclamation, menace d'avis négatif | Passage immédiat, alerte marquée urgente |
| Lead chaud | critères `lead_qualifie` remplis, demande de devis, de prix sur mesure | Statut `qualifie`, alerte, l'agent propose un rendez-vous si le scénario `rendez-vous` est actif |
| Hors périmètre | question juridique, médicale, litige, remboursement | Passage, l'agent ne répond pas sur le fond |
| Agent incertain | deux réponses de suite où l'agent ne sait pas | Passage |
| Hors horaires | message la nuit ou le week-end | L'agent qualifie quand même et annonce le délai de reprise |

## 5. Statuts posés à chaque étape

| Moment | Statut | Trace |
|---|---|---|
| Premier message d'un inconnu | `nouveau` puis `en_conversation` | `WA-REPONSE` + source détectée |
| Critères de qualification remplis | `qualifie` | `WA-QUALIFIE` + résumé en 3 lignes |
| Rendez-vous réservé | `rdv_pris` | `WA-RDV` (voir `scenarios/rendez-vous.md`) |
| Pas intéressé ou hors cible | `perdu` | `WA-PERDU` + raison |
| Désinscription | `stop` | `WA-STOP` |
| Passage à l'humain | statut inchangé | `WA-HUMAIN` + raison |

Le résumé de qualification est écrit par l'agent dans une note : besoin, budget ou volume, délai, et toute information demandée dans `lead_qualifie`. C'est ce que lit l'humain avant de reprendre.

Écriture dans chaque logiciel : voir la fiche correspondante, section 4 (`logiciels/hubspot.md`, `logiciels/notion.md`, `logiciels/shopify.md`, `logiciels/pipedrive.md`, `logiciels/brevo.md`, `logiciels/woocommerce.md`, `logiciels/google-sheets.md`).

## 6. Construction dans n8n

Un workflow, nommé « WhatsApp · Accueil entrant ».

1. Webhook. Méthode POST, chemin `whatsapp-entrant`. Réglage « Respond » : « Using 'Respond to Webhook' Node ». Copiez l'URL de production : c'est elle que vous collez dans Twilio.
2. Respond to Webhook. Placé juste après le Webhook. « Respond With » : Text, corps `<Response></Response>`, en-tête `Content-Type` = `text/xml`. Twilio reçoit ainsi une réponse en moins d'une seconde et n'envoie rien de lui-même ; la vraie réponse part plus loin par l'API.
3. Code (nommé « Préparer le message »). Récupère `body.From`, `body.WaId`, `body.Body`, `body.ProfileName`, `body.MessageSid`, retire le préfixe `whatsapp:` pour obtenir le numéro E.164, met le texte en minuscules dans un champ `texte_normalise`.
4. If (« Désinscription ? »). Condition : `texte_normalise` correspond à la liste des mots STOP de `05-conformite.md`. Branche vraie : nœud du logiciel pour poser `stop` et la trace `WA-STOP`, puis Twilio (confirmation unique), puis fin.
5. Nœud du logiciel (« Chercher le contact »). Recherche par téléphone. Détail selon le logiciel : `logiciels/<logiciel>.md`, section 4. Activez « Always Output Data » pour que le workflow continue quand le contact n'existe pas.
6. If (« Contact connu ? »). Branche fausse : nœud du logiciel pour créer le contact (`nouveau`, source tirée du texte prérempli).
7. Switch (« Qui répond ? »). Trois sorties : statut `stop` (aucune réponse, alerte humaine), marqueur `WA-HUMAIN` de moins de 24 h (transfert à l'humain seulement), sinon agent.
8. AI Agent. Prompt système : le gabarit de `04-prompt-agent.md`, complété avec la fiche de cadrage. Message utilisateur : `{{ $json.texte }}`.
   - Sous-nœud Anthropic Chat Model : identifiant « Anthropic » créé avec votre clé API (voir `02-twilio-whatsapp.md` pour la liste des clés), modèle Claude Sonnet récent pour la qualité ou Haiku pour réduire le coût, température 0,3.
   - Sous-nœud mémoire : « Simple Memory » pour démarrer, clé de session personnalisée `{{ $('Préparer le message').item.json.waId }}`, 20 messages gardés. En production, préférez « Postgres Chat Memory » ou « Redis Chat Memory » avec la même clé : la mémoire simple se vide quand n8n redémarre.
   - Outils de l'agent (sous-nœuds « Tool ») : un outil du logiciel pour mettre à jour le statut, un outil « passer à l'humain » (sous-workflow qui pose `WA-HUMAIN` et envoie l'alerte), et si le scénario rendez-vous est actif, l'outil de disponibilités décrit dans `scenarios/rendez-vous.md`.
   - Réglage du prompt : demandez à l'agent de terminer sa sortie par une ligne `STATUT: <code>` et `HUMAIN: oui|non`. Un nœud Code découpe ensuite la réponse en texte à envoyer et en décisions.
9. Twilio. Ressource SMS, opération Send, « To WhatsApp » activé, From = votre numéro Twilio, To = numéro E.164 du contact, Message = texte de l'agent. Dans la fenêtre de 24 h, ce nœud suffit.
10. Nœud du logiciel (« Tracer »). Note `WA-REPONSE` avec le message reçu et la réponse, statut mis à jour si l'agent l'a décidé.
11. If (« Passage à l'humain ? »). Branche vraie : Gmail, Slack ou Microsoft Teams selon la rubrique `humain`, avec le résumé, le numéro et un lien vers la fiche.

Pour l'humain qui reprend : il répond depuis la console Twilio, depuis l'outil de conversation de son logiciel s'il gère WhatsApp, ou par un petit formulaire n8n (Form Trigger) qui envoie sa réponse par le nœud Twilio. Choisissez au cadrage ; le plus simple pour un débutant est le formulaire n8n.

Réglage du workflow : fuseau horaire Europe/Paris (menu des paramètres du workflow), sinon les horaires d'ouverture seront faux d'une ou deux heures.

Journal : après l'envoi de la réponse, ajoutez les trois nœuds du journal (préparer la ligne, calculer le coût, Data table Insert avec « Continue On Fail ») décrits dans `../08-suivi-tokens-logs-amelioration.md`, section 7. Le prompt de l'AI Agent se lit dans la table des versions plutôt que d'être écrit en dur.

## 7. Construction dans Make

Un scénario, « WhatsApp · Accueil entrant », planifié en « Immediately ».

1. Webhooks > Custom webhook. Créez le webhook, copiez son adresse, collez-la dans Twilio.
2. Webhooks > Webhook response. Statut 200, corps `<Response></Response>`, en-tête `Content-Type: text/xml`.
3. Router, première route avec filtre « texte contient un mot STOP » : module du logiciel (statut `stop`), puis envoi de la confirmation, puis fin.
4. Module du logiciel « Search » par téléphone, puis Router : contact absent (création) ou présent.
5. Data store > Get a record. Un data store « conversations_whatsapp », clé = `WaId`, champs : `historique` (texte), `dernier_message` (date), `humain_jusqu_a` (date).
6. Filtre : `humain_jusqu_a` dans le passé, sinon transfert à l'humain et arrêt.
7. Anthropic Claude > Create a Prompt (nom du module à vérifier dans votre compte Make). Système : gabarit de `04-prompt-agent.md`. Messages : l'historique du data store suivi du nouveau message.
8. Data store > Add/replace a record. Ajoutez les deux messages à `historique`, gardez les 20 derniers.
9. Envoi du message : module Twilio d'envoi de message avec `whatsapp:` devant les deux numéros, ou HTTP > Make a request vers l'API Twilio (méthode POST, adresse `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`, authentification Basic, champs `From`, `To`, `Body`).
10. Module du logiciel : trace `WA-REPONSE`, statut.
11. Router : si `HUMAIN: oui`, email ou Slack.

Make n'a pas d'agent à outils aussi souple que n8n : la décision de statut passe par les lignes `STATUT:` et `HUMAIN:` en fin de réponse, lues par un module Text parser ou une fonction.

## 8. Variante Claude Code

Claude Code peut écrire une petite application (Node.js ou Python) avec une route `/whatsapp/entrant`, la vérification de la signature Twilio, l'appel à l'API Anthropic, la mémoire dans une base (SQLite, Postgres ou Upstash Redis) et l'écriture dans le logiciel par son API.

Où l'héberger : Twilio Functions (le plus proche de Twilio), Vercel, Cloudflare Workers ou Render. Claude Code n'héberge rien lui-même : une fois le code écrit, il faut le déployer et le garder en ligne.

Désavantages à dire au client avant de choisir cette voie :

- vous n'avez pas d'écran pour voir chaque conversation passer, comme dans l'historique d'exécution de n8n ou de Make ;
- chaque changement (un mot dans le prompt, un nouveau statut) demande de relancer Claude Code et de redéployer ;
- les clés API sont à ranger vous-même dans les variables d'environnement de l'hébergeur ;
- une mise à jour de l'API Twilio, Anthropic ou de votre logiciel peut casser le code sans prévenir ;
- en cas de panne, il faut quelqu'un qui lit du code.

Avantages réels : coût d'hébergement souvent nul ou de quelques euros, logique aussi fine que vous voulez.

## 9. Test avant mise en ligne

1. Testez d'abord dans le bac à sable Twilio (`06-tests-mise-en-production.md`), webhook du bac à sable pointé sur l'URL de test du nœud Webhook.
2. Depuis votre téléphone, envoyez dans l'ordre : « Bonjour », une question sur vos prix, une réponse qui remplit les critères de qualification, « je veux parler à quelqu'un », puis « STOP ».
3. Vérifiez après chaque message : la réponse arrive en moins de 10 secondes, la fiche existe dans le logiciel, le statut a bougé comme prévu, la trace `WA-` est là, l'alerte humaine est arrivée au bon endroit.
4. Envoyez un vocal et une photo : l'agent doit répondre qu'il ne lit que le texte et proposer d'écrire, ou transmettre à l'humain (choix du cadrage). Twilio transmet les médias par `MediaUrl0` ; la transcription des vocaux est une évolution possible, pas un réglage de départ.
5. Envoyez deux messages à une seconde d'intervalle : l'agent ne doit pas répondre deux fois au même `MessageSid`.
6. Relisez trois conversations entières avec le client avant l'activation : le ton, l'annonce de l'IA, les questions de qualification.
