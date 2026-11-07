# Tests, mise en production et suivi

Fiche du skill `agent-ia-whatsapp`. Claude la suit avec le client après la construction, scénario par scénario, puis chaque semaine une fois l'agent en ligne.

## 1. Le bac à sable Twilio : tester avant d'avoir un numéro approuvé

Twilio fournit un numéro WhatsApp partagé de test (le « Sandbox »). Il permet de construire et tester l'accueil entrant avant que votre propre numéro soit inscrit et que Meta ait vérifié votre entreprise.

Mise en route, dans la console Twilio :

1. Ouvrez la page « Try WhatsApp » (menu Messaging, rubrique d'essai ; selon la version de la console, elle se trouve dans l'ancienne console). Acceptez les conditions.
2. La page affiche un numéro et un code du type `join mot-mot`. Depuis votre téléphone, envoyez ce code au numéro, ou scannez le QR code. Twilio répond pour confirmer.
3. Dans « Sandbox settings », champ « When a message comes in », collez l'URL de test de votre nœud Webhook n8n (ou de votre webhook Make), méthode POST. Enregistrez.
4. Écrivez au numéro du bac à sable : votre workflow doit se déclencher.

Limites à connaître :

- seules les personnes qui ont envoyé le code `join` reçoivent des messages, et l'inscription expire au bout de 3 jours (erreur 63015 au-delà : renvoyez le code) ;
- vos propres modèles ne fonctionnent pas dans le bac à sable : seuls trois modèles de test fournis par Twilio sont disponibles (rappel de rendez-vous, notification de commande, code de vérification). Les relances (formulaire, panier, confirmation) se testent donc sur votre vrai numéro, une fois les modèles approuvés ;
- le nom affiché est celui de Twilio, pas le vôtre.

## 2. Numéros de test

- Votre propre téléphone, et un second (associé, salarié, téléphone personnel) pour voir ce que voit un client qui ne vous a jamais écrit.
- Une fiche de test par numéro dans votre logiciel, nommée « TEST WhatsApp 1 », « TEST WhatsApp 2 », pour la retrouver et la supprimer après.
- Jamais le numéro d'un vrai client pour un test.
- Pour la fenêtre de 24 h : un test « à froid » demande un numéro qui n'a pas écrit à votre numéro WhatsApp depuis plus de 24 h. Gardez le second téléphone pour ça.

## 3. Recette par scénario

Chaque fiche scénario a sa section 9 « Test avant mise en ligne ». Faites-les dans cet ordre, car chaque scénario s'appuie sur le précédent :

| Ordre | Scénario | Ce qu'il doit prouver |
|---|---|---|
| 1 | `scenarios/accueil-entrant.md` | L'agent répond, annonce l'IA, qualifie, met à jour le statut, passe la main, respecte STOP |
| 2 | `scenarios/confirmation-achat.md` | Un modèle utilitaire part sur un événement réel, sans doublon |
| 3 | `scenarios/nurturing-formulaire.md` | Les relances s'enchaînent et s'arrêtent à la réponse |
| 4 | `scenarios/panier-abandonne.md` | Le rappel s'annule si la commande est passée |
| 5 | `scenarios/rendez-vous.md` | Confirmation et rappel à la bonne heure, annulation prise en compte |

Pour les séquences, travaillez sur une copie du workflow avec des délais en minutes, puis remettez les vrais délais dans l'original.

Tenez un tableau de recette simple (une ligne par test : date, scénario, action, résultat attendu, résultat obtenu, corrigé oui ou non). Il sert aussi de preuve de vos vérifications.

## 4. Liste de contrôle avant activation

Compte et numéro :

- [ ] Compte Twilio passé en payant (le compte d'essai ne permet pas d'inscrire un expéditeur WhatsApp)
- [ ] Numéro inscrit comme expéditeur WhatsApp, statut en ligne dans « WhatsApp Senders »
- [ ] Nom affiché accepté par Meta (sinon, limite de 250 conversations commerciales par 24 h et risque de déconnexion)
- [ ] Vérification de l'entreprise lancée ou terminée dans le portefeuille Meta Business
- [ ] Messaging Service créé, numéro ajouté dedans, son identifiant `MG…` noté dans n8n ou Make
- [ ] Webhook entrant de l'expéditeur pointé sur l'URL de production (pas l'URL de test)

Modèles :

- [ ] Chaque modèle au statut « approved » dans le Content Template Builder, catégorie notée
- [ ] Chaque `ContentSid` (`HX…`) recopié au bon endroit, avec le bon nombre de variables

Automatisations :

- [ ] Workflows activés (n8n : interrupteur « Active » ; Make : scénario en « ON »)
- [ ] Fuseau horaire Europe/Paris dans chaque workflow
- [ ] Durées des nœuds Wait vérifiées après import
- [ ] Workflow d'erreur branché (section 6)
- [ ] Clés API rangées dans les identifiants de n8n ou les connexions de Make, nulle part ailleurs

Conformité : la liste de `05-conformite.md`, section 8, entièrement cochée.

AI Act : la liste de `07-ai-act.md`, section 8, entièrement cochée (mention IA au premier message, dans les modèles et dans le profil, test « Je parle à un humain ? » réussi, fiche du système rédigée).

Journal et amélioration (`08-suivi-tokens-logs-amelioration.md`) :

- [ ] Une ligne de journal par appel à Claude, tokens non nuls, coût cohérent avec la console Anthropic
- [ ] Journal en panne sans effet sur la réponse au client (option « Continue On Fail »)
- [ ] Alerte coût du soir active, plafond de dépense Anthropic réglé
- [ ] Prompt lu depuis la table des versions, jeu de 14 tests rangé
- [ ] Mode de la boucle d'amélioration choisi (proposition par défaut) et noté dans la fiche de cadrage

Montée en charge : la première semaine, limitez les relances automatiques à quelques dizaines par jour, puis augmentez. Un numéro neuf qui envoie d'un coup à des centaines de contacts se fait signaler et limiter.

## 5. Erreurs fréquentes et parades

Twilio affiche les erreurs dans Monitor > Logs > Errors, et chaque envoi raté renvoie un code dans la réponse de l'API (visible dans l'exécution n8n ou Make).

| Code | Ce que ça veut dire | Parade |
|---|---|---|
| 63016 | Message libre envoyé hors de la fenêtre de 24 h, ou modèle envoyé dans `Body` au lieu de `ContentSid` | Envoyer un modèle approuvé par `ContentSid` et `ContentVariables`. Vérifier que la relance passe bien par le nœud HTTP Request et non par le nœud Twilio |
| 63015 | Bac à sable : le destinataire n'a pas envoyé le code `join`, ou son inscription a plus de 3 jours | Renvoyer le code `join` depuis le téléphone de test |
| 63110 | À l'inscription : le numéro est déjà enregistré sur WhatsApp (application ou autre fournisseur), ou Meta n'a pas pu envoyer le code | Supprimer le compte WhatsApp de ce numéro (voir les risques dans `02-twilio-whatsapp.md`), ou attendre 5 minutes et réessayer |
| 63018 | Trop d'envois : débit du numéro dépassé, ou limite de conversations commerciales du portefeuille atteinte, ou trop de messages au même destinataire | Étaler les envois (tournée en plusieurs lots), attendre, faire monter la limite par la qualité et la vérification de l'entreprise |
| 63049 | Meta a choisi de ne pas délivrer ce message marketing (Meta limite le nombre de messages marketing qu'une personne reçoit) | Ne pas renvoyer en boucle. Réessayer plus tard une seule fois, ou passer par un autre canal |
| 63050 | La personne a refusé les messages marketing de votre entreprise dans WhatsApp | Traiter comme `stop` pour le marketing, trace `WA-STOP meta` |
| 63040 | Modèle refusé par Meta | Lire le motif dans le Content Template Builder, créer un nouveau modèle corrigé (un modèle soumis ne se modifie pas) |
| 63041 | Modèle mis en pause après trop de signalements | Arrêter la séquence qui l'utilise, revoir le texte et le ciblage ; la pause dure 3 h puis 6 h |
| 63042 | Modèle désactivé (troisième pause ou infraction) | Créer un autre modèle, revoir pourquoi les gens signalent |
| 63051 | Numéro verrouillé par Meta, souvent faute d'activité depuis environ 30 jours | Réinscrire l'expéditeur ; ensuite, garder un minimum d'envois chaque mois |
| 63028 | Le nombre de variables envoyées ne correspond pas au modèle | Comparer `ContentVariables` avec les `{{1}}`, `{{2}}` du modèle |
| 63053 | Modèle tout juste approuvé, pas encore synchronisé | Attendre 10 minutes et réessayer |
| 57012 | Signature du webhook invalide (si vous vérifiez l'en-tête `X-Twilio-Signature`, surtout en variante Claude Code) | Vérifier avec exactement la même adresse que celle réglée dans Twilio, paramètres compris, et le jeton d'authentification principal |
| 11200 | Twilio n'a pas pu joindre votre webhook (workflow inactif, URL de test, délai dépassé) | Activer le workflow, utiliser l'URL de production, répondre tout de suite par le nœud Respond to Webhook |

Erreurs côté automatisation :

- le webhook n8n renvoie 404 : le workflow n'est pas actif, ou l'URL de test est utilisée en production ;
- Make « Accepted » mais rien ne se passe : le scénario est en pause ou a atteint sa limite d'opérations du mois ;
- l'agent répond deux fois : le même message est traité deux fois (Twilio réessaie si votre webhook a mis trop de temps) ; dédoublonnez sur `MessageSid` ;
- Anthropic renvoie une erreur 429 ou 529 : trop de requêtes ou service surchargé ; activez « Retry On Fail » (n8n) ou un gestionnaire d'erreur « Retry » (Make), et un message de secours : « Je reviens vers vous dans un instant. »

## 6. Suivi en production

Alertes à brancher le premier jour :

- Twilio : Monitor > Alerts, créez des alertes par email sur les codes 63016, 63018, 63041, 63042, 63051 et 11200. Twilio peut aussi signaler l'approbation d'un modèle (63046).
- n8n : un workflow « Erreurs » qui commence par un Error Trigger et envoie un email ou un message Slack avec le nom du workflow et l'erreur ; dans les paramètres de chaque workflow WhatsApp, choisissez ce workflow comme « Error Workflow ».
- Make : dans chaque scénario, gestionnaire d'erreur sur les modules Twilio et Anthropic, et notifications d'erreur par email activées dans le profil.

Chiffres à suivre (dans votre logiciel grâce aux traces `WA-`, ou dans un Google Sheets alimenté par les workflows) :

| Indicateur | Calcul | Repère de départ |
|---|---|---|
| Taux de réponse aux relances | leads avec `WA-REPONSE` / leads avec `WA-J0 envoyé` | à mesurer les 4 premières semaines pour fixer votre repère |
| Taux de STOP | `WA-STOP` / messages commerciaux envoyés | au-delà de 2 à 3 %, revoir le ciblage et les textes (repère d'usage, pas une règle Meta) |
| Taux d'erreur d'envoi | `WA-ERREUR` / envois | proche de zéro hors 63049 |
| Leads qualifiés par l'agent | passages en `qualifie` par semaine | |
| Paniers récupérés | `WA-PANIER récupéré` et montant | |
| Délai de reprise humaine | temps entre `WA-HUMAIN` et la première réponse humaine | à tenir sous le délai annoncé par l'agent |
| Coût | facture Twilio (messages et frais Meta) + facture Anthropic | à rapprocher des ventes attribuées |

## 7. Routine hebdomadaire (20 minutes, le lundi matin)

1. Twilio, Monitor > Logs > Errors : y a-t-il des codes nouveaux ou en hausse ? Traitez-les avec le tableau de la section 5.
2. Content Template Builder : tous les modèles utilisés sont-ils toujours « approved » ? Un modèle en pause ou reclassé en marketing ?
3. Portefeuille Meta, WhatsApp Manager : note de qualité du numéro (vert, jaune, rouge) et limite d'envoi actuelle.
4. Historique des exécutions n8n ou Make : des exécutions en erreur dans la semaine ?
5. Lisez cinq conversations de l'agent au hasard : ton juste, IA annoncée, pas de réponse hors sujet, pas de promesse que vous ne tenez pas (prix, délai, remise). Corrigez le prompt si besoin (`04-prompt-agent.md`).
6. Relevez les chiffres de la section 6 dans un tableau de suivi.
7. Vérifiez que les passages à l'humain de la semaine ont tous reçu une réponse.
8. Une fois par mois : purge des historiques de conversation plus anciens que la durée choisie (`05-conformite.md`), et contrôle des factures Twilio et Anthropic.

Si l'agent a donné une information fausse à un client, corrigez d'abord auprès du client (l'humain reprend la conversation), puis ajoutez la règle manquante au prompt, puis testez à nouveau la question qui a posé problème.
