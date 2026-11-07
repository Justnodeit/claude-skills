# Questionnaire de cadrage

But : comprendre le métier de l'utilisateur assez précisément pour que l'agent reconnaisse un vrai lead, pose les bonnes questions, range chaque contact dans le bon statut et déclenche les bonnes automatisations. Le questionnaire s'adapte à tout type d'activité : commerce en ligne, artisan, cabinet, agence, formation, immobilier, restauration, logiciel, services à domicile.

## Comment le mener

- Posez les questions bloc par bloc, deux ou trois à la fois, avec des exemples de réponses tirés d'un métier proche du sien.
- Reformulez après chaque bloc (« Si je résume : … C'est bien ça ? »).
- Si l'utilisateur ne sait pas, proposez la valeur par défaut indiquée et notez-la comme « à confirmer ».
- Sautez les blocs sans objet (pas de panier abandonné pour un cabinet de conseil), mais dites-le.
- À la fin, rédigez la fiche `cadrage-agent-whatsapp.md` (modèle en bas de page) et faites-la valider.

Comptez 30 à 50 minutes, moins si le site de l'entreprise répond déjà à une partie des questions.

## A. L'entreprise et ce qu'elle vend

| # | Question | Pourquoi on la pose |
|---|---|---|
| A1 | Que vendez-vous, en une phrase, et à qui ? | Donne le vocabulaire de l'agent et le profil du client idéal |
| A2 | Vous vendez plutôt à des particuliers, à des professionnels, ou aux deux ? | Change le ton, les questions de qualification et la base légale du consentement |
| A3 | Quel est le montant moyen d'une vente, et combien de temps s'écoule entre le premier contact et l'achat (minutes, jours, mois) ? | Un achat impulsif appelle des relances rapprochées sur quelques heures ; une vente longue appelle de la qualification puis un rendez-vous |
| A4 | Combien de nouveaux contacts recevez-vous par mois, et par quels canaux (formulaire, appel, Instagram, boutique, salon, bouche-à-oreille, publicité) ? | Dimensionne le coût WhatsApp, les limites d'envoi et le choix de l'outil |
| A5 | Dans quelle zone et dans quelles langues travaillez-vous ? | Langue des modèles Meta, numéro français ou non, horaires |
| A6 | Quelles questions vos clients posent-ils le plus souvent avant d'acheter ? Avez-vous une FAQ, des fiches produit, des tarifs publics ? | Base de connaissance de l'agent : il ne répond qu'à partir de ce qu'on lui donne |

## A bis. La marque : site, identité visuelle, ton, persona

Un agent qui parle comme un robot générique fait fuir. Ce bloc donne à l'agent la voix de l'entreprise, et au numéro WhatsApp son apparence.

Commencez par le site : si vous pouvez consulter le web, lisez la page d'accueil, les pages offres, tarifs, FAQ, à propos et mentions légales, puis proposez vos réponses à valider (« D'après votre site, vous parlez à vos clients en vouvoyant, sur un ton chaleureux et expert. C'est juste ? »). Sinon, demandez à l'utilisateur de coller les textes ou de joindre les pages en PDF.

| # | Question | Ce que la réponse change |
|---|---|---|
| A7 | Quelle est l'adresse de votre site web ? Et vos réseaux sociaux (Instagram, LinkedIn, Facebook, TikTok) ? | Source de la base d'informations de l'agent, de son vocabulaire et du ton ; liens à mettre dans le profil WhatsApp ; Meta regarde le site pour vérifier l'entreprise |
| A8 | Avez-vous une charte graphique ou un brand book ? Si oui, joignez-le. Sinon : logo (fichier carré, fond uni), couleurs principales, typographies | Photo de profil WhatsApp (logo carré lisible en petit), couleurs du QR code et des visuels qui annoncent le numéro, images éventuelles dans les messages |
| A9 | Comment parlez-vous à vos clients ? Donnez 3 adjectifs (par exemple : chaleureux, direct, expert, drôle, rassurant, premium) et 3 adjectifs que vous refusez (familier, commercial, froid…) | Section « Ton » du prompt de l'agent |
| A10 | Tutoiement ou vouvoiement ? Emojis : jamais, avec parcimonie, volontiers ? Longueur de vos messages habituels ? | Règles de forme du prompt |
| A11 | Y a-t-il des mots ou expressions de la maison à utiliser (nom des offres, slogan, façon de saluer et de signer) ? Et des mots à bannir (jargon, « pas cher », anglicismes, termes de concurrents) ? | Lexique imposé et lexique interdit du prompt |
| A12 | Si votre marque était une personne, comment la décririez-vous en deux phrases ? Quelles valeurs défend-elle ? | Persona de la marque : la personnalité que l'agent incarne |
| A13 | Collez 3 à 5 vrais messages que vous ou votre équipe avez envoyés à des clients et dont vous êtes fiers (WhatsApp, email, DM), et si possible un message que vous ne voudriez jamais voir partir | Exemples donnés à l'agent pour imiter votre voix (anonymisez prénoms et numéros) |
| A14 | Qui est votre client type (persona client) : âge, métier ou situation, ce qui l'inquiète avant d'acheter, les mots qu'il emploie ? Avez-vous plusieurs profils ? | Questions de qualification et objections préparées ; adaptation du ton selon le profil |
| A15 | Que dit la marque sur ses concurrents, ses prix, ses garanties ? Y a-t-il des sujets sensibles (avis négatifs, retards connus) ? | Ce que l'agent peut dire, et ce qu'il transmet à un humain |

Rédigez ensuite, avec l'utilisateur, une « carte de voix » de 10 lignes au maximum : persona de la marque en deux phrases, 3 adjectifs oui et 3 non, tu ou vous, emojis, mots imposés, mots bannis, signature, deux exemples de messages types. Elle va dans la fiche de cadrage (rubrique `marque`) et dans le prompt de l'agent (`04-prompt-agent.md`, section « Voix de la marque »).

## B. Ce que l'agent doit faire

| # | Question | Ce que la réponse change |
|---|---|---|
| B1 | Parmi ces missions, lesquelles voulez-vous ? Répondre aux messages entrants et qualifier ; relancer après un formulaire ; relancer un panier abandonné ; confirmer un achat et suivre la commande ; prendre et rappeler des rendez-vous. | Liste des fiches `scenarios/` à construire |
| B2 | Laquelle compte le plus pour vous ce trimestre ? | Ordre de construction |
| B3 | À quoi verrez-vous dans trois mois que l'agent a servi (plus de rendez-vous, moins de paniers perdus, moins d'appels « où est ma commande ») ? | Indicateur de suivi à mettre en place dès le départ |

Aide à la décision à donner si l'utilisateur hésite entre « nurturing » et « transactionnel » :

- Le contact n'a pas encore acheté et on veut l'amener à acheter ou à prendre rendez-vous : c'est du nurturing (formulaire, panier abandonné, lead entrant). Les messages hors conversation sont des modèles de catégorie marketing, payants et soumis au consentement marketing.
- Le contact vient d'acheter ou de réserver et on l'informe : c'est du transactionnel (confirmation, expédition, rappel de rendez-vous). Il faut que le logiciel prévienne l'automatisation à l'instant de l'achat : c'est le rôle d'un webhook (une notification automatique que le logiciel envoie à une adresse web dès qu'un événement se produit). Les modèles sont de catégorie utilitaire, moins chers.
- Les deux coexistent souvent : une boutique fait panier abandonné (nurturing) et confirmation de commande (transactionnel).

## C. Reconnaître un lead

C'est le cœur du cadrage. Un lead mal défini, c'est un agent qui relance tout le monde ou personne.

| # | Question | Exemple de réponse |
|---|---|---|
| C1 | D'où viennent les contacts que l'agent doit traiter ? Listez chaque source précise (formulaire « Devis » du site, panier non finalisé, message spontané sur WhatsApp, publicité Instagram « Envoyer un message », QR code en boutique). | « Formulaire devis du site et clic sur le bouton WhatsApp » |
| C2 | Pour vous, qu'est-ce qui fait qu'un contact est un vrai prospect et pas un curieux ? Donnez 2 à 4 critères vérifiables. | Besoin précis, budget au-dessus de 2 000 €, projet sous 3 mois, zone d'intervention |
| C3 | Quelles questions posez-vous vous-même au téléphone pour le savoir ? Dans quel ordre ? | « Quel type de travaux ? Quelle surface ? Pour quand ? Propriétaire ? » |
| C4 | Qu'est-ce qui disqualifie un contact d'emblée ? | Hors zone, demande d'emploi, fournisseur qui démarche, particulier alors que vous vendez aux professionnels |
| C5 | Quelles informations voulez-vous récupérer et ranger dans votre logiciel (prénom, entreprise, besoin, budget, échéance, ville, nombre de personnes) ? | Champs à créer dans le logiciel et à extraire par l'agent |
| C6 | Qu'est-ce qui rend un lead « chaud », à transmettre tout de suite à un humain ? | Demande un devis signé cette semaine, budget élevé, client existant mécontent |

Règles par défaut si l'utilisateur ne sait pas :
- l'agent pose au maximum 3 ou 4 questions de qualification, une par message ;
- un lead est `qualifie` quand le besoin, l'échéance et un critère de taille ou de budget sont connus et dans la cible ;
- tout lead hors cible passe en `perdu` avec la raison notée, et reçoit une réponse polie qui l'oriente ailleurs si possible.

## D. Les statuts

Le skill raisonne avec 8 statuts. On les fait correspondre à ce que l'utilisateur a déjà, ou on les crée.

| Code | Sens | Exemple de libellé chez l'utilisateur |
|---|---|---|
| `nouveau` | Contact entré, jamais contacté sur WhatsApp | Nouveau |
| `contacte` | Premier message envoyé, pas encore de réponse | Tentative de contact |
| `en_conversation` | A répondu, l'agent échange | En cours |
| `qualifie` | Critères de la section C remplis | Qualifié, Opportunité |
| `rdv_pris` | Rendez-vous réservé | RDV planifié |
| `client` | A acheté ou signé | Client, Gagné |
| `perdu` | Pas intéressé, hors cible, ou muet après la dernière relance | Perdu, Mauvais timing |
| `stop` | A demandé à ne plus être contacté | Ne pas contacter |

| # | Question | Ce que la réponse change |
|---|---|---|
| D1 | Utilisez-vous déjà des statuts ou des étapes dans votre logiciel ? Montrez-les-moi (capture). | Table de correspondance, ou création d'une propriété « Statut WhatsApp » |
| D2 | Qui change le statut aujourd'hui, et à quel moment ? | Ce que l'agent a le droit de modifier ; ce qui reste humain |
| D3 | Quand un lead passe en `qualifie`, que doit-il se passer (alerte, rendez-vous proposé, devis à préparer, tâche pour un commercial) ? | Action de sortie du scénario d'accueil |
| D4 | Au bout de combien de relances sans réponse considérez-vous un lead comme perdu ? | Fin de séquence ; défaut : 3 relances sur 7 jours |

Défaut recommandé : ne pas toucher aux étapes de vente existantes et créer une propriété dédiée « Statut WhatsApp » avec les 8 valeurs. L'agent écrit dans cette propriété ; les humains gardent la main sur leur pipeline.

## E. Le logiciel et les outils autour

| # | Question | Ce que la réponse change |
|---|---|---|
| E1 | Où vivent vos contacts, vos leads ou vos commandes : HubSpot, Notion, Shopify, Pipedrive, Brevo, WooCommerce, Google Sheets, autre ? Un seul ou plusieurs ? | Fiche `logiciels/` à suivre ; si plusieurs, lequel fait foi |
| E2 | Quel abonnement avez-vous sur ce logiciel ? | Certaines fonctions (workflows, webhooks) demandent un plan payant ; la fiche logiciel dit quoi faire sinon |
| E3 | Le numéro de téléphone mobile est-il demandé partout, et dans quel format ? | Normalisation au format international `+33…` ; champ obligatoire à ajouter dans les formulaires |
| E4 | Avez-vous un accès administrateur à ce logiciel ? | Nécessaire pour créer champs, clés et webhooks |
| E5 | Quels autres outils jouent un rôle : formulaire (Webflow, WordPress, Typeform, Tally), agenda (Calendly, Google Agenda), paiement (Stripe), messagerie d'équipe (Slack, Teams), email ? | Déclencheurs et canal d'alerte |

## F. Le numéro WhatsApp

| # | Question | Ce que la réponse change |
|---|---|---|
| F1 | Utilisez-vous déjà WhatsApp pour l'entreprise ? Avec l'application WhatsApp Business sur un téléphone, ou autre chose ? | Si oui, recommandation forte d'un numéro neuf (voir `02-twilio-whatsapp.md`) |
| F2 | Ce numéro actuel est-il connu de vos clients (cartes, site, véhicules) et utilisé tous les jours par l'équipe ? | Plus il est utilisé, plus le garder sur l'application a de valeur |
| F3 | L'entreprise a-t-elle un portefeuille Meta Business (celui de la page Facebook ou du compte Instagram pro) ? Êtes-vous administrateur ? | Création ou demande d'accès avant l'étape 3 |
| F4 | L'entreprise a-t-elle déjà fait la vérification d'entreprise chez Meta ? | Si non, la lancer tôt : elle augmente les limites d'envoi |

## G. L'agent : identité et règles

| # | Question | Défaut proposé |
|---|---|---|
| G1 | Quel prénom pour l'agent ? Se présente-t-il comme assistant de l'entreprise ? | « Je suis Léa, l'assistante de [entreprise] » ; il dit toujours qu'il est un assistant automatique (voir `05-conformite.md`) |
| G2 | L'agent reprend-il exactement la carte de voix (bloc A bis), ou faut-il l'adapter au canal WhatsApp (plus court, plus direct) ? | Carte de voix telle quelle, messages plus courts que vos emails |
| G3 | Ce que l'agent a le droit de dire : prix, délais, remises, disponibilités ? Où trouve-t-il l'information juste ? | Il ne donne que ce qui est écrit dans sa base ; sinon il propose un humain |
| G4 | Ce qu'il ne doit jamais faire ou promettre ? | Pas de remise non prévue, pas d'avis juridique ou médical, pas de date de livraison inventée |
| G5 | Il répond à quelle heure ? Toute la nuit, ou il prévient qu'un humain reprendra le lendemain ? | Réponse 24 h/24, passage à un humain aux heures ouvrées |
| G6 | Quelles langues doit-il parler ? | Langue du client, français par défaut |

## H. Le passage à un humain

| # | Question | Défaut proposé |
|---|---|---|
| H1 | Qui reprend la conversation quand l'agent passe la main ? | Le dirigeant ou un commercial nommé |
| H2 | Comment cette personne veut-elle être prévenue : email, SMS, Slack, tâche dans le logiciel ? | Email et tâche dans le logiciel |
| H3 | Dans quel délai peut-elle reprendre ? Que dit l'agent au client en attendant ? | « Je transmets à Paul, il vous répond avant 18 h » |
| H4 | Quand l'agent doit-il passer la main ? | Demande explicite d'un humain, lead chaud (C6), réclamation ou mécontentement, question hors base, après 2 réponses où il n'a pas compris |

Point à expliquer : avec un numéro Twilio, l'humain ne répond pas depuis l'application WhatsApp de son téléphone. Deux solutions simples : l'alerte contient le résumé et un lien qui ouvre une conversation avec le client depuis le WhatsApp de l'humain (le client voit alors un autre numéro, on le prévient) ; ou l'humain répond depuis Slack ou un petit formulaire, et l'automatisation renvoie sa réponse par le numéro Twilio (plus confortable, un peu plus long à construire, décrit dans `scenarios/accueil-entrant.md`).

## I. Les relances

| # | Question | Défaut proposé |
|---|---|---|
| I1 | Combien de relances au maximum, et à quel rythme ? | Formulaire : J0 (dans les 5 minutes), J+1, J+3, J+7. Panier : 1 h, 24 h, 72 h |
| I2 | Jours et heures autorisés pour écrire ? | Du lundi au samedi, de 9 h à 20 h, jamais le dimanche ni les jours fériés |
| I3 | Une offre est-elle possible pour décider (remise panier, livraison offerte, appel découverte gratuit) ? | Aucune par défaut |
| I4 | Que se passe-t-il quand un lead ne répond pas à la dernière relance ? | Statut `perdu`, raison « sans réponse », plus de message WhatsApp |

## J. Le consentement

| # | Question | Ce que la réponse change |
|---|---|---|
| J1 | Vos formulaires et votre tunnel d'achat demandent-ils l'accord pour être contacté sur WhatsApp ? Case cochée par défaut ou non ? | Sans case dédiée non précochée, pas de relance marketing ; on l'ajoute avant de lancer |
| J2 | Où est gardée la preuve (date, source, texte de la case) ? | Champ « Consentement WhatsApp » et date dans le logiciel |
| J3 | Avez-vous des contacts anciens sans consentement WhatsApp ? | Ils ne reçoivent pas de message marketing ; seuls les contacts qui écrivent d'eux-mêmes ou qui consentent entrent dans les séquences |

## K. Budget et volume

| # | Question | Ce que la réponse change |
|---|---|---|
| K1 | Combien de messages pensez-vous envoyer par mois (nombre de leads × nombre de relances, plus les confirmations) ? | Estimation de coût Twilio et Meta (méthode dans `02-twilio-whatsapp.md`) |
| K2 | Quel budget mensuel maximum pour l'ensemble (numéro, messages, IA, outil d'automatisation) ? | Choix n8n Cloud, n8n auto-hébergé ou Make ; choix du modèle Claude ; plafond de dépense Anthropic |

## Modèle de fiche de cadrage

Rédigez ce fichier avec les réponses, en langage simple, puis faites-le valider.

```markdown
# Cadrage de l'agent IA WhatsApp : [Entreprise]
Version 1, [date]. Validé par : [prénom]

## entreprise
Activité : … · Clients : particuliers / professionnels · Panier moyen : … · Cycle de vente : …
Volume : … contacts par mois · Zone et langues : …

## marque
Site : … · Réseaux : …
Charte graphique : jointe / logo carré … / couleurs … / typographies …
Persona de la marque : … (deux phrases) · Valeurs : …
Ton : oui … / non … · Tu ou vous : … · Emojis : … · Longueur des messages : …
Mots imposés : … · Mots bannis : … · Signature : …
Persona client : … · Objections fréquentes : …
Exemples de messages de référence : 1. … 2. … (anonymisés)
Sujets sensibles : …

## cas_usage
Retenus, dans l'ordre de construction : 1. … 2. … 3. …
Indicateur de réussite à 3 mois : …

## lead_qualifie
Critères : … · Questions de l'agent, dans l'ordre : 1. … 2. … 3. …
Disqualifiants : … · Lead chaud (passage immédiat à un humain) : …
Informations à récupérer : …

## sources
… (formulaire, panier, lien wa.me, publicité, QR code)

## statuts
| Code | Libellé chez nous | Qui le pose |
|---|---|---|
| nouveau | … | … |
(… les 8 lignes)
Action quand un lead devient qualifie : …

## logiciel
Nom et abonnement : … · Champ téléphone : … · Propriété statut : … · Champ consentement : …
Autres outils : formulaire …, agenda …, paiement …, alerte …

## outil
n8n Cloud / n8n auto-hébergé / Make / Claude Code, et pourquoi : …

## numero
Numéro Twilio neuf (pays : …) / numéro existant migré (risques acceptés le …)
Portefeuille Meta Business : … · Vérification Meta : faite / en cours / à lancer

## agent
Prénom : … · Tu ou vous : … · Emojis : … · Langues : …
Peut dire : … · Ne doit jamais : … · Sources d'information : …
Horaires : …

## humain
Qui reprend : … · Alerte par : … · Délai promis : …
Déclencheurs : …

## relances
Calendrier : … · Jours et heures autorisés : … · Offre : … · Fin de séquence : …

## consentement
Case WhatsApp : existe / à ajouter · Preuve stockée dans : …

## budget
Volume estimé : … messages par mois · Budget maximum : … € par mois

## construit (rempli à la fin)
Workflows : … · Modèles Meta approuvés : … · Webhooks : … · Date de mise en ligne : …
```
