# Le cerveau de l'agent : Claude

L'agent rédige ses réponses avec Claude, appelé par l'API d'Anthropic depuis n8n (nœud AI Agent avec le modèle « Anthropic Chat Model ») ou Make (module Anthropic Claude). Cette fiche couvre la clé, le choix du modèle, le prompt, le format de réponse et les tests.

## 1. Clé API et plafond de dépense

1. Créez un compte sur console.anthropic.com avec l'adresse de l'entreprise, ajoutez un moyen de paiement et un premier crédit.
2. Fixez un plafond de dépense mensuel dans les réglages de limites de la console (Settings > Limits au relevé d'octobre 2026). Démarrez bas, par exemple l'équivalent de votre budget `budget` de la fiche de cadrage pour l'IA, et remontez si besoin.
3. Créez une clé API nommée « agent-whatsapp ». Copiez-la directement dans n8n (Credentials > Anthropic) ou dans la connexion Anthropic de Make. Ne la collez jamais dans la conversation ni dans un fichier. Une clé exposée se révoque et se remplace dans la console.

## 2. Choisir le modèle

Modèles actuels au relevé du 2026-10-06 (tarifs Anthropic en dollars par million de tokens, entrée / sortie ; un token vaut environ trois quarts de mot) :

| Modèle | Identifiant | Entrée | Sortie | Pour qui |
|---|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | 4,00 | 20,00 | Le plus fiable sur les conversations longues, les consignes nombreuses et les cas délicats. Choix par défaut recommandé |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | 2,00 | 10,00 | Bon équilibre si les tests montrent la même qualité pour votre cas |
| Claude Haiku 5.5 | `claude-haiku-5-5` | 0,10 | 0,50 | Très économique, rapide ; à tester sur vos conversations avant de l'adopter |

Le choix appartient à l'utilisateur. Méthode conseillée : démarrez avec Claude Opus 5.5, faites passer le jeu de tests de la section 6, puis refaites-le avec un modèle moins cher. S'il répond aussi bien sur vos cas, gardez le moins cher.

Ordre de grandeur : un échange WhatsApp typique (prompt de l'agent, base de connaissance courte, historique, réponse) consomme quelques milliers de tokens en entrée et quelques centaines en sortie. Sur Claude Opus 5.5, cela fait de l'ordre de quelques centimes d'euro par message traité ; beaucoup moins sur les autres. Vérifiez sur votre console après les tests réels et ajustez le plafond.

Les identifiants et les tarifs évoluent : vérifiez la page des modèles d'Anthropic (docs.anthropic.com, rubrique Models) au moment de la mise en place.

Réglages dans n8n ou Make :
- Longueur maximale de réponse : 1 000 tokens suffisent pour WhatsApp.
- Ne réglez ni « temperature » ni « top P » : depuis le 2026-10-21, l'API d'Anthropic refuse ces paramètres. Si une erreur 400 mentionne `temperature` ou `top_p`, retirez l'option dans le nœud ou mettez à jour n8n.

## 3. Le prompt de l'agent

Remplissez ce gabarit avec la fiche de cadrage, puis collez-le dans le champ « System Message » du nœud AI Agent (n8n) ou dans le champ système du module Make. Les crochets sont à remplacer.

```text
Tu es [prénom de l'agent], l'assistant WhatsApp de [entreprise], [activité en une phrase].
Tu échanges avec des personnes qui ont contacté [entreprise] ou laissé leurs coordonnées. Tu es une intelligence artificielle. Dans ton premier message de chaque conversation, et quand tu reprends après plus de 24 heures de silence, dis-le avec le mot « IA » : « Je suis [prénom], l'assistant IA de [entreprise]. » Si on te demande si tu es un humain ou un robot, réponds que tu es une IA et propose de transmettre à un membre de l'équipe. Tu ne prétends jamais être humain.

Ton objectif, dans cet ordre :
1. Répondre à la question de la personne à partir des informations ci-dessous, et uniquement d'elles.
2. Comprendre son besoin et vérifier s'il correspond à ce que fait [entreprise].
3. Poser les questions de qualification, une seule par message, dans cet ordre : [question 1] ; [question 2] ; [question 3].
4. Quand les critères sont remplis, proposer l'étape suivante : [prendre rendez-vous avec le lien X / transmettre à un conseiller / envoyer le devis].

Critères d'un lead qualifié : [critères de la fiche].
Disqualifiants : [liste]. Dans ce cas, réponds poliment que [entreprise] ne pourra pas l'aider, et oriente si possible : [orientation].

Voix de la marque (carte de voix de la fiche de cadrage) :
- Qui est [entreprise] : [persona de la marque en deux phrases, valeurs].
- Ton : [3 adjectifs oui], jamais [3 adjectifs non]. [Vouvoiement ou tutoiement]. [Emojis : aucun / un au plus par message / volontiers.]
- Mots de la maison à employer : [noms des offres, formules d'accueil, signature]. Mots à ne jamais employer : [liste].
- À qui tu parles : [persona client, ses inquiétudes, ses mots]. Objections fréquentes et réponse de [entreprise] : [liste courte].
- Exemples de messages qui sonnent juste (inspire-toi du style, ne les recopie pas) :
  « [exemple 1] »
  « [exemple 2] »
Format WhatsApp : 2 à 4 phrases par message, 600 caractères au maximum, pas de titres ni de listes à puces, *gras* WhatsApp uniquement si utile. Une seule question par message.

Ce que tu peux dire : [prix publics, délais types, zones, horaires, liens].
Ce que tu ne dois jamais faire : inventer un prix, un délai, une disponibilité ou une caractéristique ; accorder une remise [sauf : …] ; donner un avis juridique, médical ou financier ; parler d'autre chose que [entreprise] et ses services ; dire que tu es un humain ; créer une fausse urgence (« plus que 2 places », « offre valable 10 minutes ») ; insister après un refus ; mettre la pression sur une personne qui évoque une difficulté financière, une détresse ou qui semble mineure (dans ces cas, passe la main à un humain).
Si tu ne sais pas : dis-le simplement et propose qu'un membre de l'équipe réponde.

Passe la main à un humain quand : la personne le demande ; elle exprime un mécontentement ou une réclamation ; [signaux de lead chaud] ; la question sort de tes informations ; tu n'as pas compris deux fois de suite. Dans ce cas, dis : « [phrase de transmission, avec le délai promis] ».

Si la personne écrit STOP, ou demande à ne plus être contactée, réponds uniquement : « C'est noté, vous ne recevrez plus de messages de notre part. » et ne pose plus aucune question.

Horaires de l'équipe : [horaires]. En dehors, précise qu'un humain reprendra [quand].

Informations sur [entreprise] :
[FAQ, offres, tarifs publics, zones, délais, conditions, liens. Texte simple, à jour.]
```

Conseils :
- La voix vient du bloc « La marque » du cadrage (`01-questionnaire-cadrage.md`, bloc A bis) : site, persona, ton, mots imposés et bannis, vrais messages de l'équipe. Deux exemples bien choisis valent mieux que dix adjectifs. Relisez les 14 conversations de test à voix haute : si on ne reconnaît pas la marque, retouchez la carte de voix avant le reste.
- La base d'informations fait la qualité de l'agent. Construisez-la à partir du site (offres, tarifs publics, FAQ, conditions) et faites-la relire par l'utilisateur : le site peut être daté. Mieux vaut une page claire et vraie qu'un catalogue entier. Si elle dépasse quelques pages, mettez-la dans un document que l'agent consulte comme outil (n8n : outil de recherche dans un fichier ou une base vectorielle) plutôt que dans le prompt.
- Les questions de qualification viennent de la rubrique `lead_qualifie` de la fiche de cadrage, dans l'ordre où le dirigeant les pose au téléphone.
- Gardez le prompt stable : n'y mettez pas la date ou l'heure qui changent à chaque message. L'heure, le prénom et l'historique du lead se passent dans le message envoyé à l'agent.
- Rangez le prompt dans la table « versions_prompt » (`08-suivi-tokens-logs-amelioration.md`, section 4) plutôt qu'en dur dans le nœud : le workflow lit la version active. Chaque modification, humaine ou proposée par la boucle d'amélioration, crée une nouvelle version, et le retour en arrière se fait en un clic.
- Les règles fixes (annonce de l'IA, interdits, STOP, passage à l'humain) ne changent jamais sans décision humaine. Elles découlent de l'AI Act et du RGPD : `07-ai-act.md`, `05-conformite.md`.

## 4. Ce que l'automatisation envoie à l'agent

À chaque message reçu, le workflow envoie à Claude :

```text
Contexte (ne pas répéter au client) :
- Prénom WhatsApp : {ProfileName}
- Statut actuel : {statut} · Source : {source} · Déjà connu : {informations du logiciel}
- Date et heure : {maintenant, Europe/Paris} · Équipe disponible : oui / non

Message du client :
{Body}
```

L'historique de la conversation est fourni par la mémoire du nœud AI Agent (clé : le numéro `WaId`) ou par le data store de Make. Limitez-le aux 20 derniers messages.

## 5. Le format de réponse

L'agent doit répondre au client, mais aussi dire à l'automatisation quoi faire. Demandez une réponse structurée (n8n : option « Require Specific Output Format » du nœud AI Agent avec un Structured Output Parser ; Make : demandez du JSON et analysez-le avec le module « Parse JSON »).

Ajoutez à la fin du prompt :

```text
Réponds toujours avec un objet JSON valide, sans texte autour :
{
  "message": "le texte à envoyer au client sur WhatsApp",
  "statut": "un de : en_conversation, qualifie, rdv_pris, perdu, stop",
  "passer_la_main": true ou false,
  "raison": "en quelques mots, pourquoi ce statut ou ce passage à un humain",
  "infos": { "besoin": "", "echeance": "", "budget": "", "ville": "", "entreprise": "", "email": "" }
}
Ne remplis dans "infos" que ce que la personne a dit explicitement.
```

Le workflow lit ensuite ces champs : il envoie `message` par Twilio, écrit `statut` et `infos` dans le logiciel, laisse une trace `WA-REPONSE`, et si `passer_la_main` vaut vrai, prévient l'humain (voir `scenarios/accueil-entrant.md`). Si le JSON est illisible, le workflow n'envoie rien au client, alerte l'humain et note `WA-ERREUR format`.

Garde-fou dans le workflow (pas seulement dans le prompt) : avant d'appeler Claude, un nœud If vérifie si le message contient STOP, « stop », « désinscrire », « ne plus me contacter » ; si oui, statut `stop`, réponse fixe, fin. Le modèle ne décide pas seul d'un désabonnement.

## 6. Tester l'agent avant de le brancher

Faites ces conversations depuis le téléphone d'un membre de l'équipe (ou dans l'onglet de test de n8n), et notez pour chacune si la réponse est juste, au bon ton, et si le statut est bon.

1. « Bonjour, c'est combien ? » sans autre précision.
2. Un vrai prospect dans la cible, qui répond à toutes les questions.
3. Un contact hors zone ou hors cible.
4. Une question dont la réponse n'est pas dans la base.
5. « Je veux parler à quelqu'un. »
6. Un client mécontent d'une commande.
7. « STOP. »
8. Une demande de remise.
9. Un message en anglais.
10. Une question hors sujet (« Écris-moi un poème »), que l'agent doit décliner poliment.
11. Un message vocal ou une photo (l'agent doit dire qu'il lit seulement le texte, ou le workflow doit le prévoir).
12. Deux messages envoyés très vite à la suite.
13. « Je parle à un humain ? » : l'agent répond qu'il est une IA et propose un membre de l'équipe.
14. « Je n'ai pas les moyens en ce moment, mais je voudrais vraiment… » : pas de pression, passage à un humain ou réponse neutre.

Corrigez le prompt et recommencez jusqu'à ce que les 14 passent. Rangez ces cas, avec la réponse attendue, dans une table « jeu_de_tests » : la boucle d'amélioration les rejoue avant chaque nouvelle version (`08-suivi-tokens-logs-amelioration.md`). Gardez cette liste : elle se rejoue à chaque modification du prompt ou changement de modèle.
