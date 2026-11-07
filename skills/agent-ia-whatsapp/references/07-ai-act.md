# AI Act : ce que le règlement européen sur l'IA demande à votre agent

Le règlement (UE) 2024/1689 sur l'intelligence artificielle, dit « AI Act », s'applique par étapes depuis 2024. Pour un agent WhatsApp qui vend, conseille ou suit des commandes, il impose surtout une chose : dire clairement que c'est une IA. Cette fiche dit ce qui s'applique, comment le mettre en place et comment le prouver.

Relevé du 2026-10-25. Le texte a été modifié en 2026 par le règlement « omnibus numérique » : vérifiez la version consolidée sur EUR-Lex avant de vous y référer, et faites valider par un juriste si votre usage sort du cas décrit ici.

## 1. Où se situe votre agent dans le règlement

L'AI Act classe les systèmes par niveau de risque.

| Niveau | Exemples | Votre agent ? |
|---|---|---|
| Pratiques interdites (article 5) | Manipulation subliminale, exploitation de la vulnérabilité d'une personne (âge, handicap, situation sociale ou économique), notation sociale | Non, à condition de respecter la section 4 |
| Haut risque (annexe III) | IA qui trie des candidats à l'embauche, évalue la solvabilité pour un crédit, fixe un tarif d'assurance vie ou santé, évalue des élèves, décide de l'accès à une aide publique | Non, sauf si vous lui confiez l'une de ces décisions. Dans ce cas, arrêtez-vous et faites-vous conseiller : les obligations sont lourdes |
| Risque limité : obligations de transparence (article 50) | Agent conversationnel qui échange avec des personnes | Oui, c'est le cas de votre agent |
| Risque minimal | Filtre anti-spam, correcteur | Non |

Questions à poser à l'utilisateur pour confirmer le classement :
1. L'agent prend-il ou prépare-t-il une décision sur l'embauche, le crédit, l'assurance santé ou vie, l'éducation, l'accès à un service public ? Si oui, stop : ce n'est plus le cadre de ce skill.
2. L'agent s'adresse-t-il à des mineurs ou à un public fragile (personnes âgées, situation de surendettement) ? Si oui, renforcez la section 4 et relisez les messages avec un regard extérieur.

## 2. Votre rôle

Vous construisez l'agent et vous le mettez en service sous le nom de votre entreprise. Au sens de l'AI Act, vous êtes donc à la fois celui qui met le système à disposition (fournisseur de ce système, construit à partir du modèle Claude d'Anthropic) et celui qui l'utilise (déployeur). Dans les deux rôles, l'information des personnes vous revient. Anthropic, fournisseur du modèle, porte ses propres obligations ; elles ne remplacent pas les vôtres.

## 3. L'obligation de transparence (article 50)

### Ce que dit le texte

Les personnes doivent être informées qu'elles interagissent avec un système d'IA, sauf si c'est évident pour une personne raisonnablement attentive (article 50, paragraphe 1). L'information est donnée de manière claire et reconnaissable, au plus tard lors de la première interaction (article 50, paragraphe 5).

Date : applicable depuis le 2 août 2026. L'omnibus numérique de 2026 a repoussé les obligations des systèmes à haut risque, pas celle-ci (analyses juridiques consultées en octobre 2026). Un délai jusqu'au 2 décembre 2026 concerne seulement le marquage technique des contenus générés (article 50, paragraphe 2), qui vise surtout les fournisseurs de modèles : faites confirmer par un juriste s'il vous concerne.

### Ce que vous mettez en place

1. Le premier message rédigé par l'agent dans chaque conversation dit qu'il est une IA, en mots simples : « Je suis Léa, l'assistante IA de [entreprise]. » Pas seulement « assistante virtuelle » : le mot IA lève toute ambiguïté.
2. Les modèles envoyés par l'automatisation (relance, panier, confirmation, rappel) sont écrits par vous, mais la personne qui y répond tombe sur l'agent. Ajoutez une signature au modèle quand une réponse est attendue : « Léa, assistante IA de [entreprise] ». À défaut, la première réponse de l'agent porte la mention.
3. Le profil WhatsApp Business du numéro le dit aussi : dans la description, « Assistant IA de [entreprise]. Un conseiller prend le relais sur demande. »
4. L'agent ne nie jamais être une IA. À « Vous êtes un robot ? » ou « Je parle à un humain ? », il répond oui, c'est une IA, et propose un humain.
5. Un humain reste joignable : à tout moment, la personne peut demander un conseiller (`scenarios/accueil-entrant.md`).
6. Si l'agent reprend la conversation après une longue pause (plus de 24 heures), il rappelle en une phrase qu'il est l'assistant IA.

Ces règles sont déjà dans le gabarit de prompt (`04-prompt-agent.md`) et dans les messages fixes de `scenarios/accueil-entrant.md`. Vérifiez qu'aucune personnalisation ne les a retirées.

## 4. Ce que l'agent ne doit jamais faire (article 5)

L'article 5 interdit les techniques qui altèrent le comportement d'une personne à son insu ou qui exploitent sa vulnérabilité. Pour un agent de vente, cela se traduit en règles concrètes, à garder dans le prompt :

- pas de fausse urgence (« plus que 2 places », « offre valable 10 minutes ») si ce n'est pas vrai ;
- pas d'insistance après un refus, pas de culpabilisation ;
- pas de pression sur une personne qui exprime une difficulté financière, une détresse ou un âge qui la rend fragile : l'agent passe la main à un humain ;
- pas de réponse à une personne qui se présente comme mineure pour une offre qui ne la concerne pas : l'agent arrête poliment.

## 5. Former les personnes qui pilotent l'agent (article 4)

Depuis le 2 février 2025, les entreprises qui utilisent un système d'IA doivent veiller à ce que les personnes qui s'en occupent aient un niveau suffisant de maîtrise de l'IA (article 4). Pour votre agent : la ou les personnes qui lisent les journaux, modifient le prompt et reprennent les conversations doivent comprendre ce que l'agent sait faire, ses limites, ses erreurs possibles et les règles de cette fiche. Gardez une trace de cette formation (date, contenu, personnes).

## 6. Garder une trace : la fiche du système

Rien dans l'article 50 n'impose un dossier technique pour un agent à risque limité. Une fiche d'une page vous permet pourtant de répondre vite à un client, à la CNIL ou à un contrôle. Rédigez-la avec l'utilisateur et rangez-la avec la fiche de cadrage :

```markdown
# Fiche du système d'IA : agent WhatsApp de [entreprise]
Version : … · Date de mise en service : … · Responsable : …

Finalité : répondre aux prospects et clients sur WhatsApp, qualifier, relancer, confirmer.
Ce qu'il ne fait pas : aucune décision d'embauche, de crédit, d'assurance ou d'accès à un service public.
Modèle utilisé : Claude (Anthropic), identifiant … · Outil : n8n / Make / code
Données traitées : prénom, numéro, messages, informations de qualification. Durée de conservation : …
Transparence : mention IA au premier message, dans les modèles et le profil ; humain sur demande.
Garde-fous : STOP automatique, passage à l'humain, interdits du prompt, plafond de dépense.
Surveillance humaine : [prénom], lecture hebdomadaire des journaux (`08-suivi-tokens-logs-amelioration.md`).
Formation des personnes (article 4) : … (date, contenu)
Historique des versions du prompt : voir la table des versions.
```

Le journal d'exécution (`08-suivi-tokens-logs-amelioration.md`) sert de preuve : il montre que l'IA est annoncée, que les STOP sont respectés et qu'un humain contrôle.

## 7. Ce que vous risquez si l'IA n'est pas annoncée

Les manquements aux obligations de transparence peuvent être sanctionnés par une amende allant jusqu'à 15 millions d'euros ou 3 % du chiffre d'affaires annuel mondial ; pour les petites et moyennes entreprises, c'est le montant le plus bas des deux qui s'applique (article 99). Au-delà de l'amende, un client qui découvre qu'il parlait à une IA sans le savoir se sent trompé : la mention claire protège aussi votre réputation.

## 8. Liste de contrôle AI Act

- [ ] L'agent ne prend aucune décision de l'annexe III (embauche, crédit, assurance santé ou vie, éducation, service public).
- [ ] Premier message de l'agent : le mot « IA » y figure.
- [ ] Modèles qui appellent une réponse : signature « assistante IA » ou mention dans la première réponse.
- [ ] Description du profil WhatsApp : « Assistant IA de … ».
- [ ] Test « Tu es un humain ? » passé : l'agent dit être une IA et propose un humain.
- [ ] Interdits de la section 4 présents dans le prompt.
- [ ] Personne(s) formée(s) au pilotage de l'agent, trace gardée.
- [ ] Fiche du système rédigée et rangée.
- [ ] Journal d'exécution actif.

## Sources

- Règlement (UE) 2024/1689, articles 4, 5, 50 et 99, et annexe III : https://eur-lex.europa.eu/eli/reg/2024/1689/oj (version consolidée à vérifier après l'omnibus numérique de 2026)
- Commission européenne, page AI Act et lignes directrices : https://digital-strategy.ec.europa.eu/fr/policies/regulatory-framework-ai
- CNIL, dossier intelligence artificielle : https://www.cnil.fr/fr/intelligence-artificielle
