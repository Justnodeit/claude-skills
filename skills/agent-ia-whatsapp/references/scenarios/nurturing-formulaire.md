# Scénario : relances après un formulaire

Fiche du skill `agent-ia-whatsapp`.

## 1. À quoi ça sert, pour qui

Un prospect remplit un formulaire (demande de devis, de brochure, de rappel, inscription à un webinaire, téléchargement d'un guide). Il attend souvent une réponse rapide et oublie vite. Ce scénario lui écrit sur WhatsApp dans les minutes qui suivent, puis le relance quelques fois s'il ne répond pas. Dès qu'il répond, l'agent conversationnel (`scenarios/accueil-entrant.md`) prend le relais et qualifie.

Pour qui : activités qui reçoivent des demandes par formulaire et qui perdent des leads faute de rappel rapide (services, formation, immobilier, travaux, B2B).

Condition préalable non négociable : le formulaire recueille le numéro et une case à cocher non pré-cochée qui autorise les messages WhatsApp (texte dans `05-conformite.md`). Sans case cochée, pas de séquence : le lead reste en relance email ou téléphone.

## 2. Déclencheur et conditions d'entrée

Déclencheur : un nouveau lead apparaît dans le logiciel avec un téléphone. Selon le logiciel :

| Logiciel | Déclencheur | Fiche |
|---|---|---|
| HubSpot | soumission de formulaire ou contact créé | `logiciels/hubspot.md` |
| Notion | nouvelle page dans la base de leads (sondage régulier) | `logiciels/notion.md` |
| Pipedrive | personne ou affaire créée | `logiciels/pipedrive.md` |
| Brevo | contact ajouté à une liste | `logiciels/brevo.md` |
| Google Sheets | nouvelle ligne | `logiciels/google-sheets.md` |
| Formulaire du site (Webflow, WordPress, Typeform, Tally) | webhook du formulaire | la fiche du logiciel où le lead est rangé |

Conditions d'entrée, toutes vraies :

1. Téléphone présent et convertible en E.164 (`+33600000000`). Un `06…` français devient `+336…`.
2. Consentement WhatsApp coché, avec sa date (champ `consentement` de la fiche de cadrage).
3. Statut `nouveau`. Jamais `stop`, `client`, `perdu` récent ou déjà `contacte`.
4. Aucune trace `WA-J0` sur les 90 derniers jours (le lead n'est pas déjà dans la séquence). Cette garde évite qu'un même lead reçoive deux fois chaque message si le déclencheur se répète.
5. Le lead n'est pas un client existant (cycle de vie ou étiquette selon le logiciel).

## 3. Messages

AI Act : quand un modèle appelle une réponse, terminez-le par la signature « [prénom de l'agent], assistant IA de [entreprise] », ou assurez-vous que la première réponse de l'agent annonce l'IA. Détail : `../07-ai-act.md`.

Le lead n'a jamais écrit : la fenêtre de 24 h est fermée, chaque relance est un modèle approuvé par Meta. Les quatre modèles relèvent de la catégorie marketing (Meta classe en marketing tout message qui ne suit pas une transaction demandée). Un message qui répond strictement à la demande du lead (« voici la brochure demandée ») peut être soumis en utilitaire ; Meta tranche.

Créez-les dans Twilio, Content Template Builder (pas à pas dans `02-twilio-whatsapp.md`). Variables : `{{1}}` prénom, `{{2}}` objet de la demande, `{{3}}` prénom de l'interlocuteur chez vous.

`relance_formulaire_j0` (utilitaire tenté, sinon marketing)
- Vous : « Bonjour {{1}}, merci pour votre demande concernant {{2}}. Je suis l'assistante IA de l'équipe : pour vous répondre au plus juste, puis-je vous poser deux questions rapides ? Répondez simplement à ce message. »
- Tu : « Salut {{1}}, merci pour ta demande sur {{2}} ! Je suis l'assistante IA de l'équipe : je peux te poser deux petites questions pour te répondre au mieux ? Réponds simplement ici. »
- Bouton de réponse rapide conseillé : « Oui, allez-y » / « Oui, vas-y ». Un bouton fait répondre plus que du texte et ouvre la fenêtre de 24 h.

`relance_formulaire_j1` (marketing)
- Vous : « Bonjour {{1}}, je reviens vers vous au sujet de {{2}}. Avez-vous une question à laquelle je peux répondre dès maintenant ? »
- Tu : « Hello {{1}}, je reviens vers toi pour {{2}}. Une question à laquelle je peux répondre tout de suite ? »

`relance_formulaire_j3` (marketing)
- Vous : « {{1}}, beaucoup de personnes qui nous contactent pour {{2}} hésitent sur le budget ou le délai. {{3}} peut vous donner une estimation en 10 minutes. Souhaitez-vous qu'il vous appelle ? »
- Tu : « {{1}}, souvent pour {{2}} on hésite sur le budget ou le délai. {{3}} peut te donner une estimation en 10 minutes. Tu veux qu'il t'appelle ? »

`relance_formulaire_j7` (marketing, dernier message)
- Vous : « Bonjour {{1}}, je ne veux pas vous déranger : c'est mon dernier message au sujet de {{2}}. Si le projet revient, répondez ici, nous serons là. Pour ne plus recevoir de message, répondez STOP. »
- Tu : « {{1}}, je ne veux pas te déranger : c'est mon dernier message sur {{2}}. Si ton projet revient, réponds ici. Pour ne plus rien recevoir, réponds STOP. »

Règles d'écriture qui protègent votre numéro : un message court, une seule question, le rappel de la demande d'origine (le lead se souvient pourquoi vous écrivez), la mention STOP au moins dans le dernier. Les modèles vagues ou trop commerciaux sont signalés comme spam et Meta les met en pause (voir `05-conformite.md`).

## 4. Calendrier et conditions d'arrêt

Calendrier par défaut, à ajuster au cadrage (rubrique `relances`) :

| Étape | Délai après le formulaire | Modèle |
|---|---|---|
| J0 | 2 à 5 minutes | `relance_formulaire_j0` |
| J+1 | 24 h, au créneau horaire autorisé suivant | `relance_formulaire_j1` |
| J+3 | 72 h | `relance_formulaire_j3` |
| J+7 | 7 jours | `relance_formulaire_j7` |

Créneaux d'envoi : du lundi au samedi, 9 h à 20 h, heure de Paris, jamais le dimanche ni un jour férié (voir `05-conformite.md`). Un formulaire rempli à 23 h reçoit son J0 à 9 h le lendemain, avec un texte qui ne dit pas « à l'instant ».

Arrêt immédiat de la séquence, vérifié avant chaque envoi en relisant la fiche :

- le lead a répondu (trace `WA-REPONSE` ou statut `en_conversation`) : l'agent d'accueil prend la suite ;
- statut `stop`, `client`, `qualifie`, `rdv_pris` ou `perdu` ;
- un humain a pris la main (`WA-HUMAIN`) ;
- erreur Twilio définitive sur ce numéro (numéro non WhatsApp, désinscription marketing côté Meta, code 63050).

Fin de séquence sans réponse : statut `perdu`, raison « sans réponse WhatsApp », trace `WA-FIN`. Le lead reste dans vos relances email si vous en avez.

## 5. Statuts posés à chaque étape

| Moment | Statut | Trace |
|---|---|---|
| Entrée dans la séquence | `nouveau` | `WA-J0 prévu` |
| J0 envoyé | `contacte` | `WA-J0 envoyé` |
| J+1, J+3, J+7 envoyés | `contacte` | `WA-J1 envoyé`, `WA-J3 envoyé`, `WA-J7 envoyé` |
| Réponse du lead | `en_conversation` | `WA-REPONSE` (posé par l'accueil entrant) |
| Échec d'envoi | inchangé | `WA-ERREUR <code>` |
| Fin sans réponse | `perdu` | `WA-FIN` |

## 6. Construction dans n8n

Deux options. L'option A est la plus simple à lire pour un débutant ; l'option B tient mieux à grande échelle.

Option A, un parcours par lead avec des attentes :

1. Trigger du logiciel (HubSpot Trigger, Pipedrive Trigger, Brevo Trigger, Notion Trigger, Google Sheets Trigger) ou Webhook du formulaire. Détail : `logiciels/<logiciel>.md`, section 3.
2. Code (« Normaliser »). Téléphone en E.164, prénom, objet de la demande, date du consentement.
3. If (« Peut entrer ? »). Les cinq conditions de la section 2. Branche fausse : note `WA-NON-ENTRE <raison>` et fin.
4. Code (« Prochain créneau »). Calcule l'heure d'envoi autorisée la plus proche.
5. Wait. Mode « At Specified Time », heure calculée à l'étape 4.
6. HTTP Request (« Envoyer J0 »). Méthode POST, adresse `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`, authentification « Predefined Credential Type » > Twilio API, corps « Form Urlencoded » : `MessagingServiceSid` = `MG…`, `To` = `whatsapp:+33600000000`, `ContentSid` = `HX…` du modèle J0, `ContentVariables` = `{"1":"Camille","2":"votre devis cuisine","3":"Thomas"}`. Le nœud Twilio de n8n ne sait pas envoyer de modèle : c'est pour cela qu'on passe par HTTP Request.
7. Nœud du logiciel (« Tracer J0 »). Statut `contacte`, note `WA-J0 envoyé`. Sur erreur de l'étape 6 (réglage « On Error » : Continue (using error output)), note `WA-ERREUR` avec le code renvoyé par Twilio.
8. Wait. 1 jour, puis Code « Prochain créneau ».
9. Nœud du logiciel (« Relire la fiche ») puis If (« Toujours froid ? ») : statut `contacte` et aucune trace `WA-REPONSE`. Branche fausse : fin.
10. HTTP Request J+1, Tracer. Puis même trio Wait, Relire, If pour J+3 et J+7.
11. Après J+7 : Wait 2 jours, Relire, et si toujours froid, statut `perdu` et `WA-FIN`.

Option B, une tournée quotidienne (le modèle du workflow interne de Node it) :

1. Schedule Trigger. Tous les jours à 9 h 30, plus une tournée à 14 h 30 si le volume le justifie.
2. Nœud du logiciel : liste des leads `nouveau` ou `contacte` avec consentement.
3. Code : pour chaque lead, lit les traces `WA-` et calcule l'étape due (J0, J+1, J+3, J+7 ou rien).
4. Switch par étape, puis HTTP Request avec le `ContentSid` de l'étape, puis trace.
5. Le J0 immédiat reste dans un petit workflow à part déclenché par le formulaire (option A, étapes 1 à 7).

Les deux options lisent la fiche juste avant d'envoyer. Ne vous fiez jamais à l'état connu au moment du formulaire.

Réglages : fuseau Europe/Paris dans les paramètres du workflow ; vérifiez après chaque import que les nœuds Wait ont gardé leur durée.

## 7. Construction dans Make

Make limite le module Sleep à quelques minutes : une séquence sur plusieurs jours passe par deux scénarios.

Scénario 1, « Entrée et J0 » :

1. Module « Watch » du logiciel (nouveau contact, nouvelle ligne, nouvelle page) ou Webhooks > Custom webhook du formulaire.
2. Tools > Set variable : téléphone E.164, prénom, objet.
3. Filtre : les cinq conditions d'entrée.
4. HTTP > Make a request : POST vers l'API Twilio Messages, authentification Basic (Account SID et Auth Token, enregistrés dans une connexion Make), champs `MessagingServiceSid`, `To`, `ContentSid`, `ContentVariables`.
5. Module du logiciel : statut `contacte`, champ « prochaine relance » = date de J+1, note `WA-J0 envoyé`.

Scénario 2, « Relances », planifié chaque jour à 9 h 30 :

1. Module « Search » du logiciel : leads `contacte` dont la date « prochaine relance » est aujourd'hui ou passée.
2. Iterator.
3. Router par étape (champ « étape WhatsApp » : 1, 3 ou 7).
4. HTTP > Make a request avec le bon `ContentSid`.
5. Module du logiciel : étape suivante, nouvelle date, trace.

Ajoutez dans votre logiciel deux champs pour Make : « étape WhatsApp » et « prochaine relance WhatsApp » (fiches logiciel, section 2).

## 8. Variante Claude Code

Claude Code écrit un script qui lit le logiciel par son API, calcule l'étape due de chaque lead et appelle l'API Twilio. Hébergement : une tâche planifiée (Vercel Cron, Cloudflare Workers Cron Triggers, GitHub Actions planifiées, Render Cron Job), plus une petite fonction appelée par le formulaire pour le J0.

Désavantages : pas d'historique visuel des envois, chaque changement de texte ou de délai passe par une modification de code et un redéploiement, et les erreurs silencieuses (une clé expirée, un champ renommé dans le logiciel) ne se voient que si vous avez prévu des alertes. Pour une séquence de relance, n8n ou Make restent plus simples à faire vivre.

## 9. Test avant mise en ligne

1. Mettez temporairement les délais en minutes (J+1 = 2 minutes, J+3 = 4, J+7 = 6) dans une copie du workflow.
2. Remplissez le formulaire avec votre propre numéro, case cochée. Vérifiez : J0 reçu, statut `contacte`, trace `WA-J0 envoyé`.
3. Ne répondez pas : vérifiez J+1, J+3, J+7, puis `perdu` et `WA-FIN`.
4. Recommencez et répondez après J+1 : aucune relance ne doit plus partir, l'agent d'accueil doit répondre.
5. Recommencez avec la case non cochée : aucun message, trace `WA-NON-ENTRE consentement`.
6. Remplissez deux fois le formulaire avec le même numéro : une seule séquence.
7. Répondez STOP au J0 : statut `stop`, plus rien ensuite.
8. Remettez les vrais délais avant d'activer, et relisez les modèles approuvés dans Twilio (statut « approved » pour chacun).
