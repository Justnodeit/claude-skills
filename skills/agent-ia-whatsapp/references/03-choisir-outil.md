# Choisir l'outil d'automatisation

L'outil d'automatisation fait le lien entre les trois briques : il reçoit les messages de Twilio et les événements du logiciel, demande à Claude quoi répondre, envoie la réponse et met à jour le logiciel. Trois choix possibles : n8n, Make, ou du code écrit avec Claude Code.

## Le conseil en une phrase

- Agent qui converse, se souvient de l'échange, consulte le logiciel ou un agenda : n8n.
- Messages déclenchés simples (confirmation de commande, relances avec modèles, alerte à l'équipe) et envie de l'outil le plus visuel : Make.
- Utilisateur à l'aise avec le code ou qui travaille déjà avec Claude Code au quotidien : Claude Code possible, après avoir lu les désavantages ci-dessous.

Les deux premiers se combinent mal : choisissez-en un seul pour tout l'agent, sauf raison forte.

## Comparatif

| Critère | n8n | Make | Claude Code |
|---|---|---|---|
| Prise en main | Visuelle, un peu plus technique que Make | La plus visuelle et guidée | Aucun écran : on décrit, Claude écrit le code |
| Agent IA avec mémoire et outils | Nœud AI Agent prêt à l'emploi (modèle Claude, mémoire par numéro, outils) | Possible, plus de modules à assembler | Tout est possible, à coder |
| Connecteurs logiciels | HubSpot, Notion, Shopify, Pipedrive, Brevo, WooCommerce, Google Sheets, Twilio | Les mêmes, souvent plus d'actions prêtes | Appels d'API à écrire |
| Hébergement | n8n Cloud (payant, rien à installer) ou auto-hébergé (serveur à gérer) | Hébergé par Make | À trouver et à gérer (voir plus bas) |
| Facturation | Par exécution de workflow (Cloud) | Par opération : chaque module exécuté compte | Hébergeur + rien d'autre, souvent très peu |
| Voir ce qui s'est passé | Journal de chaque exécution, données à chaque nœud | Historique de chaque scénario, très lisible | Journaux de l'hébergeur, à lire en technique |
| Modifier un message ou un délai | Dans le nœud, en deux clics | Dans le module, en deux clics | Repasser par Claude Code, redéployer |
| Qui peut reprendre après vous | Toute personne formée à n8n | Toute personne formée à Make | Un développeur |

Les prix changent souvent : vérifiez la page tarifs de n8n (n8n.io/pricing) et de Make (make.com/en/pricing) au moment du choix, et comparez avec le volume estimé à l'étape de cadrage (rubrique `budget`).

## Questions pour trancher avec l'utilisateur

1. Votre agent doit-il converser (répondre, qualifier, se souvenir) ou seulement envoyer des messages à des moments précis ? Converser oriente vers n8n.
2. Avez-vous déjà utilisé l'un de ces outils ? L'outil déjà connu gagne à capacités proches.
3. Combien de messages et d'événements par mois ? Avec Make, multipliez par le nombre de modules de chaque scénario pour estimer les opérations ; un agent conversationnel en consomme beaucoup.
4. Voulez-vous un outil où l'on voit et corrige soi-même chaque étape, ou acceptez-vous de dépendre de quelqu'un qui code ? La première réponse exclut Claude Code.
5. Avez-vous des contraintes de données (hébergement en Europe, sur votre propre serveur) ? n8n auto-hébergé ou une offre européenne y répond ; vérifiez la région d'hébergement proposée par chaque outil.

## n8n : ce qu'il faut savoir

- n8n Cloud : créez un compte sur n8n.io, choisissez la région, tout est prêt. Le plus simple pour démarrer.
- Auto-hébergé : gratuit en logiciel, mais il faut un serveur accessible en HTTPS, des sauvegardes et des mises à jour. À réserver à qui sait le faire ou est accompagné.
- Nœuds utilisés par ce skill : Webhook, Twilio, HTTP Request, AI Agent avec Anthropic Chat Model et une mémoire, If, Switch, Wait, Schedule Trigger, Code, et les déclencheurs ou nœuds des logiciels (HubSpot Trigger, Shopify Trigger, WooCommerce Trigger, Pipedrive Trigger, Brevo Trigger, Notion Trigger, Google Sheets Trigger).
- Pièges connus : un workflow non activé ne reçoit rien sur l'adresse de production du webhook (l'adresse de test ne marche que pendant un test manuel) ; vérifiez le fuseau horaire du workflow (Settings > Timezone > Europe/Paris), sinon les envois partent à l'heure UTC.

## Make : ce qu'il faut savoir

- Créez un compte sur make.com, choisissez la région EU si proposée.
- Modules utilisés : Webhooks (Custom webhook), Twilio, HTTP (Make a request) pour les modèles WhatsApp, Anthropic Claude (Create a prompt ou équivalent), Router, Filters, Sleep ou planification, Data store (mémoire de conversation), et les modules des logiciels.
- Chaque module exécuté consomme des opérations (crédits). Un agent conversationnel à 6 ou 8 modules par message reçu peut vite dépasser l'offre gratuite. Faites le calcul avec l'utilisateur.
- Un délai de plusieurs jours (relance J+3) se gère mieux avec un scénario planifié qui cherche chaque jour les leads à relancer qu'avec une longue pause dans un scénario.

## Claude Code : avantages et désavantages

Claude Code est l'outil de Claude qui écrit et modifie du code sur l'ordinateur. Il peut écrire tout l'agent (un petit programme qui reçoit les webhooks Twilio, appelle Claude, écrit dans le logiciel). Expliquez honnêtement :

Avantages
- Liberté totale : n'importe quelle logique, n'importe quel logiciel.
- Coût de fonctionnement très bas, sans abonnement d'outil d'automatisation.
- Le code est à vous.

Désavantages
- Claude Code ne fait pas tourner l'agent en permanence. Le code doit être déployé chez un hébergeur toujours allumé (par exemple Twilio Functions, Vercel, Cloudflare Workers, ou un serveur). Quand votre ordinateur est éteint, Claude Code ne répond à personne.
- Pas d'écran pour voir les conversations passer ni rejouer une étape : en cas de souci, il faut lire des journaux techniques.
- Changer un texte de relance ou un délai demande de repasser par Claude Code, de tester et de redéployer.
- Les secrets (clés Twilio, Anthropic, logiciel) se gèrent en variables d'environnement chez l'hébergeur : une erreur de manipulation peut les exposer.
- Les relances à J+3 demandent une tâche planifiée et un endroit où garder l'état de chaque lead : ce que n8n et Make fournissent tout faits, il faut ici le construire.
- Quand une API change (Twilio, Meta, votre logiciel), personne ne vous prévient : il faut maintenir.
- La reprise par une autre personne suppose un développeur.

Si l'utilisateur choisit Claude Code malgré tout : faites écrire un projet minimal (un point d'entrée webhook, un module d'envoi Twilio, un module d'appel Claude, un module logiciel, une tâche planifiée pour les relances), avec un fichier README qui explique le déploiement, et des tests. Chaque fiche scénario a une section « Variante Claude Code ».

## Une fois choisi

Notez le choix et sa raison dans la rubrique `outil` de la fiche de cadrage, puis passez à `02-twilio-whatsapp.md`.
