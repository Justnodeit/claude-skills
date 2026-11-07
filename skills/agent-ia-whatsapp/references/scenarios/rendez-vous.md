# Scénario : prise de rendez-vous et rappel

Fiche du skill `agent-ia-whatsapp`.

## 1. À quoi ça sert, pour qui

Quand un lead est qualifié, l'agent lui propose un rendez-vous (appel, visio, visite, essai en boutique) directement dans la conversation WhatsApp. La veille, le lead reçoit un rappel avec un lien pour déplacer le rendez-vous s'il ne peut plus venir. Moins de rendez-vous oubliés, moins d'allers-retours pour trouver un créneau.

Pour qui : toute activité où la vente passe par un échange (conseil, artisanat, immobilier, santé hors acte médical, formation, B2B), et les commerces qui prennent des réservations.

Deux façons de faire, à choisir au cadrage (rubrique `agent`) :

| Méthode | Comment | Pour qui | Limites |
|---|---|---|---|
| Lien de réservation | L'agent envoie votre lien Calendly (ou Google Agenda, page de réservation) prérempli | Débutant, mise en place en 30 minutes | Le lead quitte WhatsApp pour réserver |
| Réservation dans la conversation | L'agent lit vos disponibilités Google Agenda, propose 3 créneaux, crée l'événement quand le lead choisit | Client à l'aise, n8n de préférence | Plus de réglages, l'agent doit gérer les fuseaux et les doubles réservations |

Commencez par le lien. Passez à la réservation dans la conversation quand le reste tourne depuis quelques semaines.

## 2. Déclencheur et conditions d'entrée

Proposition du rendez-vous : déclenchée par l'agent d'accueil (`scenarios/accueil-entrant.md`) quand les critères `lead_qualifie` sont remplis, ou quand le lead demande à parler à quelqu'un et que le cadrage prévoit un rendez-vous plutôt qu'un rappel.

Confirmation du rendez-vous :

| Outil d'agenda | Signal « rendez-vous pris » | Signal « annulé » | Remarque |
|---|---|---|---|
| Calendly | webhook `invitee.created` | `invitee.canceled` | Webhooks inclus à partir de l'offre Standard (payante) selon l'aide Calendly ; l'offre gratuite n'en a pas. Abonnement au webhook par l'API ou par le Calendly Trigger de n8n |
| Google Agenda (pages de réservation) | nouvel événement dans l'agenda | événement supprimé | Le Google Calendar Trigger de n8n sonde l'agenda |
| Réservation dans la conversation | l'agent crée l'événement lui-même | message du lead | Pas de webhook à brancher |
| Outil propre au métier (Planity, Doctolib, Zenchef…) | selon l'outil, souvent sans API ouverte | | À vérifier outil par outil ; à défaut, lien de réservation seul, sans rappel WhatsApp |

Conditions pour le rappel de la veille :

1. Rendez-vous confirmé, non annulé.
2. Téléphone connu (dans la fiche, ou demandé par une question du formulaire Calendly).
3. Le lead a accepté les messages WhatsApp, ou il a lui-même pris rendez-vous depuis la conversation WhatsApp (il attend la suite à cet endroit).
4. Pas en `stop`.

Rapprocher le rendez-vous Calendly de la bonne fiche : ajoutez au lien envoyé par l'agent le paramètre `utm_content=<identifiant de la fiche>`. Calendly le renvoie dans le webhook (bloc `tracking`), ce qui évite de dépendre de l'email saisi.

## 3. Messages

AI Act : quand un modèle appelle une réponse, terminez-le par la signature « [prénom de l'agent], assistant IA de [entreprise] », ou assurez-vous que la première réponse de l'agent annonce l'IA. Détail : `../07-ai-act.md`.

Proposition par l'agent (texte libre, la fenêtre de 24 h est ouverte puisque le lead vient d'écrire) :

- Vous : « Le mieux est d'en parler 15 minutes avec {{prénom_humain}}. Choisissez le créneau qui vous arrange ici : {{lien}} »
- Tu : « Le plus simple, c'est d'en parler 15 minutes avec {{prénom_humain}}. Choisis ton créneau ici : {{lien}} »

En réservation dans la conversation : « Je vous propose mardi 14 h, mercredi 10 h ou jeudi 17 h 30. Lequel vous convient ? » puis confirmation écrite avec date, heure, lieu ou lien visio.

Modèles à soumettre (le rappel part souvent plus de 24 h après le dernier message du lead) :

`rdv_confirme` (utilitaire)
- Vous : « Bonjour {{1}}, votre rendez-vous avec {{2}} est confirmé le {{3}} à {{4}}. Pour le déplacer : » + bouton « Modifier » (fin d'adresse variable `{{5}}`).
- Tu : « Hello {{1}}, ton rendez-vous avec {{2}} est confirmé le {{3}} à {{4}}. Pour le déplacer : » + bouton « Modifier ».

`rdv_rappel_veille` (utilitaire)
- Vous : « Bonjour {{1}}, rappel de votre rendez-vous demain {{3}} à {{4}} avec {{2}}. Un empêchement ? Déplacez-le ici : » + bouton « Déplacer ».
- Tu : « Hello {{1}}, petit rappel : rendez-vous demain {{3}} à {{4}} avec {{2}}. Un empêchement ? Déplace-le ici : » + bouton « Déplacer ».

`rdv_manque` (utilitaire, optionnel)
- Vous : « Bonjour {{1}}, nous ne nous sommes pas vus aujourd'hui à {{4}}. Souhaitez-vous choisir un autre créneau ? » + bouton « Reprendre rendez-vous ».
- Tu : « Hello {{1}}, on ne s'est pas vus aujourd'hui à {{4}}. Tu veux choisir un autre créneau ? » + bouton « Reprendre rendez-vous ».

Variables : `{{1}}` prénom, `{{2}}` prénom de la personne rencontrée, `{{3}}` date en toutes lettres (« mardi 4 novembre »), `{{4}}` heure (« 14 h 30 »), `{{5}}` fin du lien de replanification. Calendly fournit ce lien dans le webhook (`reschedule_url`) ; mettez sa partie après `https://calendly.com/` en variable.

## 4. Calendrier et conditions d'arrêt

| Étape | Moment | Message |
|---|---|---|
| Proposition | dès que le lead est qualifié | texte libre de l'agent |
| Confirmation | dans la minute qui suit la réservation | `rdv_confirme` (en texte libre si la fenêtre de 24 h est encore ouverte) |
| Rappel | la veille à 18 h, ou 2 h avant pour un rendez-vous pris le jour même | `rdv_rappel_veille` |
| Rendez-vous manqué | 1 h après l'heure prévue, si l'humain l'a marqué absent | `rdv_manque` |

Arrêt : rendez-vous annulé ou déplacé (on recalcule le rappel sur la nouvelle date), statut `stop`, ou rendez-vous passé.

## 5. Statuts posés à chaque étape

| Moment | Statut | Trace |
|---|---|---|
| Lien ou créneaux proposés | `qualifie` | `WA-RDV proposé` |
| Réservation | `rdv_pris` | `WA-RDV confirmé <date>` |
| Rappel envoyé | `rdv_pris` | `WA-RDV rappel` |
| Annulation | `qualifie` | `WA-RDV annulé` |
| Absent | `qualifie` | `WA-RDV manqué` |
| Vente après le rendez-vous | `client` | posé par `scenarios/confirmation-achat.md` ou par l'humain |

## 6. Construction dans n8n

Workflow « WhatsApp · Rendez-vous confirmé » (méthode lien Calendly) :

1. Calendly Trigger, événements « invitee.created » et « invitee.canceled ». Identifiant : jeton d'accès personnel Calendly (Intégrations > API et webhooks dans Calendly). n8n crée l'abonnement au webhook pour vous.
2. Code (« Normaliser ») : prénom, date et heure converties en heure de Paris et en toutes lettres, `utm_content` (identifiant de fiche), téléphone (champ de rappel SMS de Calendly ou réponse à votre question « numéro WhatsApp »), fin du `reschedule_url`.
3. Switch sur l'événement : créé ou annulé.
4. Branche « créé » : nœud du logiciel (statut `rdv_pris`, champ date du rendez-vous, trace), puis HTTP Request vers l'API Twilio Messages avec `MessagingServiceSid`, `To`, `ContentSid` de `rdv_confirme`, `ContentVariables`.
5. Branche « annulé » : statut `qualifie`, trace `WA-RDV annulé`.

Workflow « WhatsApp · Rappel de la veille » :

1. Schedule Trigger, tous les jours à 18 h (fuseau du workflow : Europe/Paris).
2. Liste des rendez-vous du lendemain : HTTP Request vers l'API Calendly (`GET https://api.calendly.com/scheduled_events` avec `user`, `min_start_time`, `max_start_time`, `status=active`), ou Google Calendar, opération « Get Many » sur l'agenda des rendez-vous, entre demain 0 h et demain 23 h 59.
3. Pour chaque rendez-vous : nœud du logiciel pour retrouver la fiche et le téléphone, If (« Peut recevoir ? »), HTTP Request avec `rdv_rappel_veille`, trace `WA-RDV rappel`.

Réservation dans la conversation (Google Agenda) : ajoutez à l'AI Agent de l'accueil entrant deux outils.

- Google Calendar Tool, opération de disponibilité (« Availability ») sur l'agenda : l'agent lui demande si un créneau est libre.
- Google Calendar Tool, opération « Create » d'événement : titre « RDV WhatsApp {prénom} », durée fixée au cadrage, description avec le résumé de qualification.

Dans le prompt (`04-prompt-agent.md`), précisez : horaires où l'on accepte des rendez-vous, durée, délai minimum (pas de rendez-vous dans moins de 2 h), nombre de créneaux proposés (3), fuseau Europe/Paris, et l'obligation de relire la disponibilité juste avant de créer l'événement.

## 7. Construction dans Make

1. Calendly > Watch Events (ou Webhooks > Custom webhook abonné par l'API Calendly), filtres sur `invitee.created` et `invitee.canceled`.
2. Module du logiciel : statut, date du rendez-vous, trace.
3. HTTP > Make a request vers l'API Twilio Messages, `ContentSid` de `rdv_confirme`.
4. Scénario « Rappels », planifié chaque jour à 18 h : Google Calendar > Search Events (ou HTTP vers l'API Calendly) sur la journée du lendemain, Iterator, module du logiciel pour le téléphone, HTTP vers Twilio avec `rdv_rappel_veille`, trace.

La réservation dans la conversation est possible dans Make (Anthropic + modules Google Calendar), mais sans outils appelés par l'agent : il faut enchaîner « l'agent propose », « le lead répond », « le scénario vérifie et crée ». Si ce besoin est central, n8n est plus adapté.

## 8. Variante Claude Code

Claude Code écrit une route qui reçoit le webhook Calendly (avec vérification de l'en-tête `Calendly-Webhook-Signature`), une tâche planifiée quotidienne à 18 h pour les rappels, et, pour la réservation dans la conversation, les fonctions de disponibilité et de création d'événement par l'API Google Calendar (compte de service ou OAuth). Hébergement : Vercel avec Vercel Cron, Cloudflare Workers avec Cron Triggers, Render.

Désavantages : l'authentification Google (OAuth, jetons qui expirent) est la première source de pannes et demande de l'entretien ; les fuseaux horaires et le passage à l'heure d'hiver sont à tester vous-même ; aucun écran pour voir les rappels partis.

## 9. Test avant mise en ligne

1. Réservez un créneau de test sur votre propre lien Calendly avec votre numéro, en passant par le lien envoyé par l'agent (avec `utm_content`).
2. Vérifiez : confirmation reçue, date et heure justes en heure de Paris, statut `rdv_pris` sur la bonne fiche, bouton « Modifier » qui ouvre la page Calendly de replanification.
3. Lancez à la main le workflow de rappel avec un rendez-vous fixé au lendemain : rappel reçu.
4. Annulez le rendez-vous : statut `qualifie`, pas de rappel le lendemain.
5. En réservation dans la conversation : demandez un créneau déjà pris, puis un créneau dans 30 minutes ; l'agent doit refuser les deux et proposer autre chose.
6. Testez un rendez-vous fixé juste après le changement d'heure (dernier dimanche d'octobre ou de mars) : l'heure affichée doit rester juste.
