# Le numéro WhatsApp et Twilio

Twilio est un service qui donne accès à la plateforme officielle WhatsApp Business (l'API de Meta) sans avoir à développer avec Meta directement. Votre agent envoie et reçoit ses messages par Twilio ; n8n ou Make font le lien avec votre logiciel et avec Claude.

Informations relevées sur la documentation Twilio le 2026-10-25. Les écrans changent régulièrement : si un menu ne correspond pas, demandez une capture à l'utilisateur.

## 1. Quel numéro utiliser

### Recommandation : un numéro neuf acheté sur Twilio

Expliquez les raisons à l'utilisateur :

1. Il garde son WhatsApp actuel tel quel. Pour brancher un numéro sur la plateforme WhatsApp Business via Twilio, il faut d'abord supprimer le compte WhatsApp de ce numéro dans l'application ; Twilio l'écrit noir sur blanc : on ne peut plus utiliser ensuite l'application WhatsApp ou WhatsApp Business avec ce numéro. Avec un numéro neuf, rien à supprimer.
2. Le numéro principal de l'entreprise n'est jamais exposé. Si l'agent est mal réglé au début (trop de relances, clients qui signalent), c'est la note de qualité du numéro de l'agent qui baisse, pas celle du numéro que tous les clients connaissent.
3. Les rôles sont clairs : l'équipe continue de répondre depuis l'application, l'agent répond depuis son numéro, et on sait toujours qui a dit quoi.
4. On peut démarrer, tester, recommencer sans risque pour l'existant.

Contreparties à annoncer :
- le numéro est nouveau pour les clients : on compense par un nom affiché vérifié, la photo de profil de l'entreprise, et des liens partout (site, Instagram, signature email, QR code) ;
- un numéro français demande un dossier réglementaire chez Twilio (voir 2.2), validé en général sous quelques jours ouvrés ;
- un abonnement mensuel au numéro (quelques euros, prix affiché au moment de l'achat).

### Option : garder le numéro actuel de l'entreprise

Possible, mais lisez cet avertissement en entier à l'utilisateur et obtenez un « oui, j'ai compris » avant toute action.

- Le compte WhatsApp de ce numéro doit être supprimé dans l'application. Les conversations de l'application ne passent pas sur Twilio ; faites une sauvegarde des discussions importantes avant.
- L'équipe ne pourra plus répondre depuis l'application WhatsApp Business sur ce numéro. Toutes les réponses humaines passeront par l'outil (voir le passage à un humain dans `scenarios/accueil-entrant.md`).
- La « coexistence » (même numéro dans l'application et sur la plateforme) existe chez certains fournisseurs, mais Twilio ne la documente pas au 2026-10-25, et plusieurs fournisseurs indiquent qu'elle n'est pas ouverte aux numéros de l'Union européenne. Ne la promettez pas.
- Risque de blocage : un numéro dont la qualité baisse (messages signalés comme indésirables, blocages par les destinataires) voit ses envois limités, ses modèles mis en pause, et Meta peut aller jusqu'à le désactiver. Sur le numéro connu de tous les clients, l'impact est maximal. Démarrez alors avec très peu de relances et uniquement des contacts consentants.
- Le numéro doit pouvoir recevoir un SMS ou un appel pour le code de vérification Meta. Un standard téléphonique automatique (serveur vocal) empêche de recevoir ce code.

Procédure : sauvegarder, supprimer le compte dans l'application (Paramètres > Compte > Supprimer mon compte), attendre quelques minutes, puis suivre la section 3 en choisissant « Non-Twilio phone number ». Si Twilio affiche l'erreur 63110, le numéro est encore enregistré sur WhatsApp : la suppression n'est pas terminée.

Si le numéro est déjà branché chez un autre fournisseur de l'API WhatsApp (pas l'application) : la migration est différente. Il faut désactiver la double authentification du numéro dans le WhatsApp Manager, choisir le même portefeuille Meta Business et créer un nouveau compte WhatsApp Business (WABA) lors de l'inscription Twilio. Meta transfère le nom affiché, la qualité et les modèles de bonne qualité. Source : https://www.twilio.com/docs/whatsapp/migrate-numbers-and-senders

## 2. Avant de commencer

### 2.1 Les comptes

1. Compte Twilio : twilio.com > Sign up. Puis le passer en compte payant (bouton Upgrade en haut de la console, ou Admin > Account billing > Upgrade account). L'inscription WhatsApp exige un compte payant. Conseillez un rechargement modeste et la désactivation du rechargement automatique au début.
2. Portefeuille Meta Business (anciennement Business Manager) : business.facebook.com. S'il existe déjà (souvent créé avec la page Facebook ou le compte Instagram pro), l'utilisateur doit en être administrateur avec tous les droits. Sinon, il sera créé pendant l'inscription.

### 2.2 Acheter le numéro

Dans la console Twilio : Phone Numbers > Manage > Buy a number.

- Pays : France pour des clients français. Twilio demande un dossier réglementaire (Phone Numbers > Regulatory Compliance > Bundles) : informations de l'entreprise, pièce d'identité du représentant légal (ou procuration), justificatif d'adresse récent ; une boîte postale ou une adresse de domiciliation virtuelle n'est pas acceptée. Twilio indique traiter les documents en général sous 24 heures ouvrées ; comptez quelques jours.
- Capacités : le numéro doit pouvoir recevoir un appel vocal ou un SMS (pour le code Meta). Vérifiez la colonne « Capabilities » avant l'achat.
- Pour recevoir le code par appel sur un numéro Twilio : sur la page du numéro, section Voice Configuration, « A call comes in » > Webhook, et collez `https://twimlets.com/voicemail?Email=adresse@entreprise.fr`. Le code dicté par Meta arrive transcrit par email (jusqu'à 10 minutes).

Si le dossier français tarde, l'utilisateur peut tester avec le bac à sable WhatsApp de Twilio (voir `06-tests-mise-en-production.md`) en attendant.

## 3. Inscrire le numéro sur WhatsApp (Self Sign-up)

Source : https://www.twilio.com/docs/whatsapp/self-sign-up

1. Console Twilio > Messaging > Senders > WhatsApp Senders > Create new sender.
2. Choisir le numéro (Twilio ou non-Twilio) > Continue.
3. « Continue with Facebook » : une fenêtre Meta s'ouvre. Gardez la fenêtre Meta et la console Twilio ouvertes, dans le même navigateur, jusqu'au bout. Ne partagez pas l'adresse de la fenêtre.
4. Se connecter avec le compte Facebook administrateur, accepter les autorisations données à Twilio.
5. Choisir le portefeuille Meta Business existant, ou en créer un.
6. Créer un nouveau compte WhatsApp Business (WABA). Ne sélectionnez pas un WABA créé ailleurs qu'avec Twilio. Un compte Twilio ne peut avoir qu'un seul WABA : pour un second numéro plus tard, il faudra reprendre le même.
7. Créer le profil WhatsApp Business et choisir le nom affiché. Le nom doit respecter les règles de Meta (en pratique : le nom réel de l'entreprise ou de la marque, cohérent avec le site). Si Meta refuse le nom, le numéro est limité à 250 messages à l'initiative de l'entreprise par 24 heures et peut être déconnecté.
8. Saisir le numéro, choisir la vérification par SMS ou appel, entrer le code.
9. Confirmer : la fenêtre se ferme, l'expéditeur apparaît dans la console après quelques minutes.

Ensuite, dans Edit Sender : photo de profil, description, adresse, site web, catégorie. Reprenez la rubrique `marque` de la fiche de cadrage :
- photo : le logo en version carrée, centré sur un fond uni de la couleur principale de la charte, lisible à la taille d'une pastille (Meta recadre en rond) ;
- description : une phrase dans le ton de la marque, avec la mention « Assistant IA de [entreprise] » (`07-ai-act.md`) ;
- site web et lien Instagram : ceux donnés au cadrage ;
- le QR code et les visuels qui annoncent le numéro reprennent les couleurs et la typographie de la charte.

## 4. La vérification d'entreprise chez Meta

Gratuite, différente de l'abonnement « Meta Verified ». Sans elle, le portefeuille est limité (deux numéros au plus, plafond d'envois bas). Elle se lance dans les paramètres du portefeuille Meta Business, Centre de sécurité. Documents usuels : Kbis ou avis de situation SIRENE, facture ou document au nom et à l'adresse de l'entreprise, nom de domaine du site. Meta annonce un délai variable, parfois de plusieurs semaines : lancez-la dès le début.

## 5. Brancher le numéro sur n8n ou Make

### 5.1 Messaging Service

Console Twilio > Messaging > Services > Create Messaging Service. Nom : « Agent WhatsApp ». Ajoutez le numéro WhatsApp comme expéditeur (Sender Pool). Notez l'identifiant `MG…` : il sert à envoyer les modèles.

### 5.2 Messages entrants

Dans le Messaging Service, section Integration : « Send a webhook », et collez dans « Request URL » l'adresse du webhook de votre workflow (n8n : nœud Webhook en méthode POST, utilisez l'adresse de production une fois le workflow activé ; Make : module Webhooks > Custom webhook). Twilio y enverra chaque message reçu avec notamment `From` (ex. `whatsapp:+33600000000`), `Body` (le texte), `ProfileName` (le nom WhatsApp du client), `WaId` (son numéro sans le +) et `MessageSid`.

Le webhook doit répondre vite (Twilio attend une réponse en quelques secondes) : répondez tout de suite avec un statut 200 et un corps vide ou `<Response></Response>`, puis faites réfléchir l'agent et envoyez sa réponse par l'API dans la suite du workflow.

### 5.3 Identifiants à saisir dans n8n ou Make

Console Twilio, page d'accueil du compte : Account SID et Auth Token. Ils se saisissent dans n8n (Credentials > Twilio API) ou dans la connexion Twilio de Make, jamais dans la conversation. Pour plus de sécurité, créez une clé API dédiée (Account > API keys) plutôt que d'utiliser l'Auth Token principal.

### 5.4 Envoyer un message

- Message libre, dans les 24 heures qui suivent le dernier message du client : n8n, nœud Twilio, opération Send, activer « To WhatsApp », From = votre numéro, To = le numéro du client au format `+33…`. Make : module Twilio équivalent, numéros préfixés `whatsapp:`.
- Modèle approuvé (obligatoire hors 24 heures) : le nœud Twilio de n8n ne sait pas l'envoyer. Utilisez un nœud HTTP Request (Make : Twilio > Make an API call, ou HTTP) :
  - méthode POST, adresse `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json` ;
  - authentification : identifiants Twilio (Basic) ;
  - corps en formulaire : `To` = `whatsapp:+33600000000`, `MessagingServiceSid` = `MG…`, `ContentSid` = `HX…` (identifiant du modèle), `ContentVariables` = `{"1":"Camille","2":"devis cuisine"}`.
  - Depuis le 2025-04-01, un modèle envoyé hors fenêtre dans le champ `Body` échoue avec l'erreur 63016 : il faut `ContentSid`.

## 6. Les règles WhatsApp à comprendre

### 6.1 La fenêtre de 24 heures

Quand un client écrit, une fenêtre de 24 heures s'ouvre (et repart à chaque nouveau message de sa part). Pendant cette fenêtre, l'agent écrit librement. En dehors, l'entreprise ne peut envoyer qu'un modèle approuvé par Meta. Conséquence : une relance J+3 à un lead qui n'a jamais répondu est forcément un modèle.

Astuce documentée par Twilio : un modèle générique qui invite à répondre (« Bonjour {{1}}, nous avons une information sur votre demande. Répondez à ce message pour la recevoir. ») rouvre la fenêtre dès que le client répond.

### 6.2 Les modèles (templates)

Création : Console Twilio > Messaging > Content Template Builder > Create new.

- Nom : minuscules, chiffres et tirets bas, explicite (`confirmation_commande`, pas `modele_1`).
- Catégorie, choisie selon les définitions de Meta, qui tranche seule :
  - Utilitaire : lié à une transaction ou une demande précise du client (confirmation, expédition, rappel de rendez-vous). Moins cher.
  - Marketing : tout le reste à l'initiative de l'entreprise (relance, offre, nouveauté). Un modèle qui mélange information et promotion est classé marketing.
  - Authentification : codes à usage unique, texte imposé par Meta.
- Variables `{{1}}`, `{{2}}` avec un exemple pour chacune. Pas de sauts de ligne multiples à la suite.
- Boutons possibles : réponse rapide, lien, appel.
- Validation : souvent en quelques minutes. Un modèle soumis ne se modifie plus : on en crée un nouveau. Un nom supprimé n'est réutilisable qu'après 30 jours.
- Un modèle signalé trop souvent par les destinataires est mis en pause 3 heures, puis 6 heures, puis désactivé définitivement à la troisième fois.
- Hors fenêtre, tout message riche (boutons, listes) est aussi un modèle. Dans la fenêtre, texte, images et PDF partent sans modèle.

### 6.3 Les limites d'envoi

- Meta plafonne le nombre de personnes différentes que l'entreprise peut contacter en premier (hors fenêtre) sur 24 heures glissantes. Le plafond s'applique au portefeuille Meta Business (tous ses numéros ensemble). Un portefeuille récent ou non vérifié démarre bas (de l'ordre de 250 personnes par jour) et monte par paliers avec la vérification, le volume et la qualité. Les messages en réponse à un client ne comptent pas.
- La note de qualité du numéro (verte, jaune, rouge) dépend des blocages et signalements. Elle se lit dans le WhatsApp Manager de Meta et dans la console Twilio.
- Débit par défaut d'un numéro : 80 messages par seconde, bien au-delà des besoins d'une petite entreprise.

### 6.4 Les assistants IA autorisés

Depuis le 2026-01-15, les conditions de Meta excluent de la plateforme WhatsApp Business les assistants IA généralistes, dont l'IA est le produit vendu (type ChatGPT). Un agent IA au service de votre entreprise (vente, support, réservation, suivi de commande) reste permis. Gardez l'agent centré sur votre activité : il répond sur vos produits et services, et décline poliment le reste.

## 7. Ce que ça coûte

Trois postes WhatsApp (tarifs publiés par Twilio, relevés en octobre 2026, à revérifier sur https://www.twilio.com/en-us/whatsapp/pricing) :

1. Le numéro : abonnement mensuel, affiché à l'achat.
2. Frais Twilio : 0,005 USD par message, entrant comme sortant. Un message en échec coûte 0,001 USD.
3. Frais Meta, refacturés par Twilio, selon la catégorie et le pays du destinataire :
   - modèle utilitaire : gratuit s'il part pendant une fenêtre de 24 heures ouverte (depuis le 2025-07-01), payant sinon ;
   - modèle marketing : toujours payant ; la France fait partie des pays les plus chers (de l'ordre de 0,10 à 0,15 USD par modèle délivré, à confirmer sur la grille du moment) ;
   - messages libres dans la fenêtre : longtemps gratuits côté Meta ; la grille Twilio de septembre 2026 fait apparaître une ligne « Service messages », vérifiez s'ils sont désormais facturés au-delà d'un quota gratuit mensuel.

Méthode d'estimation à faire avec l'utilisateur : (nombre de leads par mois × nombre de modèles marketing par lead × tarif marketing France) + (nombre de confirmations hors fenêtre × tarif utilitaire) + (nombre total de messages entrants et sortants × 0,005 USD) + numéro. Ajoutez le coût de Claude (voir `04-prompt-agent.md`) et de l'outil d'automatisation.

Exemple à refaire avec ses chiffres : 100 leads par mois, 3 relances marketing chacun, 4 échanges dans la conversation : 300 modèles marketing + environ 1 200 messages Twilio. Le poste marketing domine : c'est pour ça que la première relance doit partir vite (le lead répond souvent dans l'heure, et la suite se fait dans la fenêtre).

## 8. Éviter le blocage du compte

- Uniquement des contacts qui ont donné leur accord pour WhatsApp (voir `05-conformite.md`). Jamais de fichier acheté ou récupéré.
- Première relance rapide, peu de relances ensuite, un STOP respecté immédiatement et pour toujours.
- Messages utiles et personnalisés, au nom réel de l'entreprise.
- Jamais d'outil non officiel qui pilote WhatsApp Web ou l'application (extensions, robots sur téléphone) : c'est la première cause de bannissement des numéros, et c'est contraire aux conditions de WhatsApp.
- Surveillez la note de qualité chaque semaine au début et créez des alertes Twilio sur les erreurs 63040 (modèle refusé), 63041 (modèle en pause) et 63042 (modèle désactivé).
- Montez en volume progressivement : quelques dizaines de contacts la première semaine.

## 9. Faire venir les clients vers le numéro

- Lien direct : `https://wa.me/33600000000?text=Bonjour%2C%20je%20souhaite%20un%20devis` (numéro sans le + ni espaces, texte prérempli encodé). À mettre sur un bouton du site, dans la bio Instagram, la signature email.
- QR code de ce lien sur la vitrine, les devis, les cartes de visite, les colis.
- Publicité Meta avec bouton « Envoyer un message WhatsApp » vers ce numéro (le numéro doit être relié au portefeuille Meta Business qui gère la publicité).
- Chaque entrée peut avoir son propre texte prérempli (« Bonjour, je viens du salon ») : l'agent reconnaît ainsi la source et la note dans le logiciel.
