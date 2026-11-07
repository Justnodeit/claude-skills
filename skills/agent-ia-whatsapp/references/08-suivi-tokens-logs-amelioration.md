# Journal, tokens et auto-amélioration de l'agent

Un agent qui tourne sans journal, c'est une boîte noire : on ne sait ni ce qu'il coûte, ni où il se trompe. Cette fiche met en place trois choses :

1. un journal de chaque exécution, avec les tokens consommés et le coût ;
2. un tableau de bord hebdomadaire ;
3. une boucle d'amélioration où l'agent analyse lui-même ses conversations, propose une meilleure version de son prompt, la teste, puis l'applique (après validation humaine par défaut, seul dans un périmètre limité si l'utilisateur le choisit).

À construire juste après le premier scénario qui fonctionne, avant l'ouverture à tous les contacts.

## 1. Le journal d'exécution

### Une ligne par appel à Claude

| Colonne | Contenu | D'où ça vient |
|---|---|---|
| `horodatage` | Date et heure (Europe/Paris) | `{{ $now }}` dans n8n, `{{now}}` dans Make |
| `execution_id` | Identifiant de l'exécution | n8n : `{{ $execution.id }}` ; Make : identifiant d'exécution du scénario |
| `scenario` | accueil_entrant, nurturing_formulaire, panier_abandonne, confirmation_achat, rendez_vous, analyse_hebdo | Fixé dans chaque workflow |
| `contact_ref` | Identifiant du contact dans le logiciel, ou empreinte du numéro | Pas le numéro en clair (voir section 6) |
| `message_entrant` | Texte reçu | Champ `Body` de Twilio |
| `reponse_envoyee` | Texte envoyé | Champ `message` de la sortie de l'agent |
| `statut_avant`, `statut_apres` | Statuts canoniques | Logiciel, puis sortie de l'agent |
| `passer_la_main`, `raison` | Vrai ou faux, et pourquoi | Sortie de l'agent |
| `modele` | Identifiant du modèle | Réponse de l'API (`model`) |
| `tokens_entree`, `tokens_sortie` | Tokens consommés | Réponse de l'API (`usage.input_tokens`, `usage.output_tokens`) |
| `tokens_cache` | Tokens lus en cache, s'il y en a | `usage.cache_read_input_tokens` |
| `cout_usd` | Coût estimé de l'appel | Calcul, section 2 |
| `duree_ms` | Temps de réponse | Différence d'horodatage avant et après l'appel |
| `version_prompt` | Version du prompt utilisée (v1, v2…) | Table des versions, section 4 |
| `erreur` | Code ou message d'erreur, vide sinon | Branche d'erreur du workflow |
| `note_qualite` | Note de 1 à 5, remplie par l'auto-évaluation | Section 3 |
| `retour_humain` | Commentaire de l'équipe, facultatif | Saisi à la main lors de la relecture |

### Où le ranger

- n8n : le nœud Data table (tables intégrées à n8n, opération Insert). Le plus simple, rien à connecter. Créez une table « journal_agent » avec les colonnes ci-dessus.
- Google Sheets : lisible par toute l'équipe, pratique jusqu'à quelques dizaines de milliers de lignes. Une feuille « journal_agent ».
- Make : module Data store, ou Google Sheets.
- Au-delà de 50 000 lignes par an, ou pour des requêtes plus fines : Supabase ou une base Postgres (nœuds dédiés dans n8n et Make).

### Récupérer les tokens

L'API d'Anthropic renvoie dans chaque réponse un bloc `usage` avec les tokens d'entrée et de sortie. Trois façons de le lire :

1. Nœud HTTP Request vers l'API Messages d'Anthropic : la réponse complète contient `usage` et `model`. La méthode la plus fiable, à privilégier si les autres ne donnent rien.
2. Nœud Anthropic de n8n (opération « Message a Model ») avec l'option de sortie simplifiée désactivée : il renvoie la réponse brute de l'API, `usage` compris. Vérifiez sur la première exécution que le champ est bien présent.
3. Nœud AI Agent : la consommation apparaît dans le détail de l'exécution du sous-nœud « Anthropic Chat Model », mais elle n'est pas toujours exposée comme donnée réutilisable dans la suite du workflow (à vérifier sur votre version de n8n). Si elle ne l'est pas, gardez l'AI Agent pour la conversation et relevez les tokens dans la console Anthropic (section 2), ou passez l'appel principal par la méthode 1.

Dans Make, le module Anthropic Claude renvoie en général la réponse de l'API avec son bloc `usage` (à vérifier dans le détail d'exécution) ; sinon, utilisez le module HTTP.

Contrôle croisé une fois par semaine : la console Anthropic (rubrique d'usage et de coûts) affiche la consommation par clé API. Créez une clé par usage (agent, analyse hebdomadaire) pour lire chaque poste séparément.

## 2. Calculer le coût

Formule par appel :

```text
cout_usd = tokens_entree × prix_entree / 1 000 000
         + tokens_sortie × prix_sortie / 1 000 000
```

Prix au relevé du 2026-10-06, en dollars par million de tokens (entrée / sortie) : Claude Opus 5.5, 4 / 20 ; Claude Sonnet 5.5, 2 / 10 ; Claude Haiku 5.5, 0,10 / 0,50. Les tokens lus en cache coûtent beaucoup moins cher que l'entrée normale : voyez la page tarifs d'Anthropic. Mettez les prix dans une petite table « tarifs » (modèle, prix_entree, prix_sortie, date) plutôt qu'en dur dans le workflow : quand ils changent, une seule ligne à modifier.

Dans n8n, un nœud Code ou Set calcule `cout_usd` juste avant l'insertion dans le journal. Ajoutez le coût WhatsApp si vous voulez le coût complet par conversation : 0,005 USD par message Twilio, plus le tarif Meta des modèles (`02-twilio-whatsapp.md`).

Alertes à mettre en place :
- chaque soir, un workflow additionne `cout_usd` du jour ; au-delà d'un seuil (par exemple le budget mensuel divisé par 20), email à l'utilisateur ;
- une conversation qui dépasse 30 appels ou un coût anormal (agent qui tourne en boucle) : alerte et pause de l'agent pour ce contact ;
- en dernier filet, le plafond de dépense mensuel de la console Anthropic (`04-prompt-agent.md`).

## 3. L'auto-évaluation de chaque conversation

Quand une conversation est terminée (pas de nouveau message depuis 2 heures, ou statut final : `qualifie`, `rdv_pris`, `perdu`, `stop`), un workflow planifié la relit et la note. Un modèle économique suffit (Claude Haiku 5.5).

Prompt de l'évaluateur :

```text
Tu évalues une conversation WhatsApp entre l'agent IA de [entreprise] et un contact.
Règles de l'agent : [coller les règles du prompt : annonce de l'IA, une question par message, pas d'invention de prix ou de délai, passage à l'humain, STOP].
Note de 1 à 5 chacun de ces critères, puis donne une note globale :
- exactitude (aucune information inventée),
- respect des règles,
- ton conforme à la carte de voix de la marque : [coller la carte de voix],
- avancée vers l'objectif (qualification, rendez-vous),
- passage à l'humain au bon moment.
Réponds en JSON : {"notes": {...}, "note_globale": 1-5, "probleme_principal": "…", "suggestion": "…"}
Conversation :
[messages, sans numéro de téléphone]
```

Le résultat va dans `note_qualite` et dans une table « evaluations » (une ligne par conversation). Coût : quelques fractions de centime par conversation sur Haiku.

## 4. La boucle d'amélioration hebdomadaire

### Le principe

Chaque lundi matin, un workflow :

1. lit les journaux et les évaluations de la semaine ;
2. isole les conversations à problème : note globale de 3 ou moins, passage à l'humain pour « pas compris » ou « question hors base », STOP après une relance, statut `perdu` après plus de 3 échanges, erreurs de format ;
3. envoie à Claude (l'analyste) le prompt actuel, la base d'informations et un échantillon de ces conversations, sans numéros ni noms de famille ;
4. reçoit un diagnostic et une proposition de prompt v+1 ;
5. teste la v+1 contre le jeu de tests ;
6. selon le mode choisi, l'applique ou la soumet à l'humain.

### Le prompt de l'analyste

```text
Tu améliores l'agent WhatsApp de [entreprise]. Voici sa version actuelle du prompt (v[N]), sa base d'informations, ses indicateurs de la semaine et [X] conversations où il a eu du mal.
1. Classe les problèmes par fréquence : information manquante dans la base, consigne ambiguë, question de qualification mal posée, ton, passage à l'humain trop tôt ou trop tard.
2. Pour chaque problème fréquent, propose la plus petite modification qui le corrige.
3. Ne touche jamais aux règles fixes : annonce de l'IA, STOP, interdits, prix et délais (seule la base d'informations validée en contient), passage à l'humain sur demande.
4. Rends le prompt v[N+1] complet.
Réponds en JSON : {"diagnostic": [...], "modifications": [{"zone": "base | consignes | questions | ton", "avant": "…", "apres": "…", "raison": "…"}], "prompt_v_suivante": "…", "risques": "…"}
```

### Le test avant application

Avant toute mise en service, la v+1 rejoue :
- les 14 conversations de test de `04-prompt-agent.md` (avec leur résultat attendu) ;
- les conversations à problème de la semaine, pour vérifier qu'elle fait mieux.

Dans n8n, les nœuds Evaluation Trigger et Evaluation servent à ça : ils lisent un jeu de tests depuis une Data table ou une feuille Google Sheets, font passer chaque cas dans le workflow et enregistrent des métriques. Un juge (Claude) compare les réponses de la v[N] et de la v[N+1] cas par cas et dit laquelle respecte le mieux les règles. La v+1 n'est retenue que si elle passe les 14 tests obligatoires et fait au moins aussi bien sur les autres. Dans Make, même logique avec un scénario qui boucle sur une feuille de tests.

### La table des versions

Une table « versions_prompt » : `version`, `date`, `texte`, `auteur` (humain ou analyste), `modifications`, `resultat_tests`, `statut` (proposee, active, retiree), `valide_par`. Le workflow de l'agent lit toujours la version `active` dans cette table au lieu d'un prompt écrit en dur : c'est ce qui permet de changer de version, et de revenir en arrière en un clic.

### Les deux modes

Mode « proposition » (par défaut, conseillé) : l'analyste prépare tout, le workflow envoie à l'humain un email ou un message Slack avec le diagnostic, les modifications en clair, le résultat des tests et deux liens (formulaire n8n ou webhook) : « Appliquer la v+1 » ou « Refuser ». Rien ne change sans ce clic. Deux minutes par semaine.

Mode « autonome » (si l'utilisateur veut que l'agent s'améliore seul) : la v+1 s'applique automatiquement, à ces conditions toutes réunies :
- seule la base d'informations (questions fréquentes, formulations) peut changer, jamais les règles fixes ni les questions de qualification ;
- les 14 tests obligatoires passent tous ;
- une seule modification automatique par semaine ;
- retour automatique à la version précédente si, la semaine suivante, le taux de STOP, le taux de passage à l'humain ou la note moyenne se dégradent de plus de 20 % ;
- un résumé de ce qui a changé part quand même chez l'humain, qui peut annuler à tout moment.

Expliquez à l'utilisateur pourquoi le mode autonome reste encadré : un prompt qui dérive peut se mettre à promettre ce que l'entreprise ne tient pas, et l'AI Act attend qu'un humain garde la maîtrise de l'outil (`07-ai-act.md`). Toute information nouvelle sur les prix, délais ou conditions doit venir d'un humain.

## 5. Le tableau de bord du lundi

Calculé par le même workflow hebdomadaire, envoyé par email ou écrit dans une feuille « tableau_de_bord » :

| Indicateur | Calcul |
|---|---|
| Conversations | Nombre de `contact_ref` distincts dans la semaine |
| Taux de réponse aux relances | Contacts qui ont répondu / contacts relancés |
| Leads qualifiés, rendez-vous pris | Passages en `qualifie` et `rdv_pris` |
| Passages à l'humain | Nombre, et part des conversations |
| STOP | Nombre, et part des contacts écrits |
| Note moyenne | Moyenne de `note_globale` |
| Tokens | Total entrée et sortie, moyenne par conversation |
| Coût IA | Somme de `cout_usd`, coût par conversation, coût par lead qualifié |
| Erreurs | Nombre par code |
| Version du prompt active | Et date de mise en service |

Comparez toujours à la semaine précédente. Ce tableau remplace la relecture au hasard de la routine hebdomadaire (`06-tests-mise-en-production.md`) par une relecture ciblée.

## 6. Données personnelles dans les journaux

Les journaux contiennent des messages de clients : ce sont des données personnelles.
- Pas de numéro en clair dans le journal : l'identifiant du contact dans le logiciel, ou une empreinte (hachage SHA-256 du numéro, nœud Crypto de n8n).
- Pas de nom de famille ni de numéro dans ce qui part vers l'analyste.
- Durée de conservation : par exemple 6 mois pour les lignes détaillées, puis suppression ; les indicateurs agrégés peuvent être gardés. Notez la durée dans la fiche de cadrage et dans la fiche du système (`07-ai-act.md`), et prévoyez une purge mensuelle automatique.
- Accès limité aux personnes qui pilotent l'agent.
Détail : `05-conformite.md`.

## 7. Construction dans n8n

Dans le workflow de l'agent (`scenarios/accueil-entrant.md`), après la réponse de Claude :
1. Set « Préparer le journal » : les colonnes de la section 1, à partir de Twilio, de la sortie de l'agent et du bloc `usage`.
2. Code « Coût » : calcul de `cout_usd` avec la table des tarifs (Data table, opération Get).
3. Data table, opération Insert, table « journal_agent ». Option « Continue On Fail » activée : un journal en panne ne doit jamais empêcher la réponse au client.

Workflows séparés :
- « Évaluation des conversations » : Schedule Trigger toutes les heures > Data table Get (conversations terminées non notées) > Anthropic (Haiku, évaluateur) > Data table Update.
- « Amélioration hebdomadaire » : Schedule Trigger le lundi à 7 h > Data table Get (journal et évaluations des 7 derniers jours) > Code (filtre des conversations à problème, anonymisation) > Anthropic (analyste) > sous-workflow de test (Evaluation) > If (tests réussis) > Data table Insert (version proposée) > Gmail ou Slack (rapport avec liens Appliquer / Refuser) ou, en mode autonome, Data table Update (version active) puis rapport.
- « Alerte coût » : Schedule Trigger chaque soir > Data table Get (journal du jour) > Code (somme) > If (seuil) > Gmail.

## 8. Construction dans Make

1. Dans le scénario de l'agent, après le module Anthropic : module Data store « Add a record » (ou Google Sheets « Add a Row ») avec les colonnes du journal, le coût calculé par une formule Make.
2. Scénario « Évaluation » planifié toutes les heures, scénario « Amélioration » le lundi, scénario « Alerte coût » chaque soir, sur le même modèle que n8n. Les tests de la v+1 bouclent sur une feuille Google Sheets de cas de test avec un Iterator.
3. Surveillez la consommation d'opérations : l'évaluation conversation par conversation en ajoute beaucoup ; regroupez par lots si besoin.

## 9. Variante Claude Code

Claude Code écrit : une fonction qui journalise chaque appel (avec `usage` lu dans la réponse du SDK Anthropic), une table SQL `journal_agent` chez l'hébergeur, deux tâches planifiées (évaluation horaire, analyse hebdomadaire) et un petit écran ou un email de validation des versions. Désavantage principal : sans interface, l'utilisateur dépend d'un développeur pour lire ses journaux. Prévoyez au minimum un export quotidien vers Google Sheets.

## 10. Test

- Une conversation de test crée bien une ligne par message, avec des tokens non nuls et un coût cohérent avec la console Anthropic.
- Le journal en panne (table renommée exprès) n'empêche pas la réponse au client.
- Lancez l'amélioration hebdomadaire à la main sur les conversations de test : le rapport arrive, les liens fonctionnent, refuser ne change rien, appliquer change la version active, et revenir en arrière remet l'ancienne.
- Aucun numéro de téléphone en clair dans le journal ni dans ce qui part vers l'analyste.
