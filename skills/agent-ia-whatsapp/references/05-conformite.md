# Conformité : RGPD, consentement, STOP, transparence IA, règles Meta

Fiche du skill `agent-ia-whatsapp`. Claude la relit avec le client avant toute mise en ligne, et l'applique à chaque scénario. Elle ne remplace pas l'avis d'un juriste : elle liste ce qu'il faut avoir réglé, avec les textes à relire.

Relevé du 2026-10-25. Les règles de Meta et les tarifs changent souvent : Claude vérifie les pages citées en fin de fiche avant de les présenter comme sûres.

## 1. Les quatre règles qui protègent votre numéro et votre entreprise

1. Pas de message commercial WhatsApp sans accord préalable de la personne pour ce canal et pour votre entreprise.
2. Chaque personne peut arrêter à tout moment par un mot simple (STOP), et cet arrêt est respecté sans exception ni délai.
3. La personne sait qu'elle échange avec une IA, dès le premier message de l'agent.
4. Les données envoyées à vos outils (Twilio, n8n ou Make, Anthropic, votre logiciel) sont listées, limitées au nécessaire, et conservées pour une durée définie.

## 2. RGPD et prospection : ce que dit le droit français

### Base légale

| Message | Base légale | Ce qu'il faut |
|---|---|---|
| Relance commerciale à un particulier (formulaire, panier abandonné, promotion) | Consentement préalable (article L34-5 du Code des postes et des communications électroniques, appliqué par la CNIL aux SMS et messages électroniques) | Case à cocher non pré-cochée, dédiée à WhatsApp |
| Offre à un client existant pour des produits ou services analogues de votre entreprise | Exception « client » de l'article L34-5 | Information au moment de la collecte du numéro, possibilité de refuser à ce moment et dans chaque message |
| Confirmation de commande, expédition, rappel de rendez-vous demandé | Exécution du contrat ou mesures précontractuelles à la demande de la personne (RGPD, article 6.1.b) | Information claire ; un accord WhatsApp reste demandé par Meta (section 4) |
| Réponse à une personne qui vous écrit d'elle-même | Mesures précontractuelles à sa demande | Rien de plus pour répondre ; un accord explicite avant de la relancer plus tard |
| Prospection d'un professionnel sur son numéro professionnel | Régime plus souple selon des commentateurs (droit d'opposition si le message concerne sa fonction) | À vérifier avec votre conseil : la CNIL ne détaille pas ce cas pour WhatsApp. Par prudence, demandez l'accord |

Un fichier de numéros acheté ou récupéré ne vaut jamais consentement. La CNIL a sanctionné l'envoi de SMS de prospection sans accord préalable, sanction confirmée par le Conseil d'État.

### La case à cocher

Elle est non pré-cochée, séparée des conditions générales, et dit qui écrit, sur quel canal, pour quoi. Exemples :

- Formulaire : « J'accepte que {{entreprise}} me contacte sur WhatsApp au sujet de ma demande, puis pour m'informer de ses offres. Je peux arrêter à tout moment en répondant STOP. »
- Paiement : « Recevoir sur WhatsApp le suivi de ma commande et de mon panier. »
- Deux cases si vous voulez séparer suivi de commande et offres commerciales : c'est ce que recommandent les bonnes pratiques Meta, et cela réduit les signalements.

### La preuve du consentement

Stockez dans la fiche du lead (fiches logiciel, section 2) : la date et l'heure, la source (nom du formulaire ou page), le texte exact de la case au moment de l'accord. Sans preuve, vous ne pouvez pas démontrer l'accord en cas de plainte.

### L'information

Votre politique de confidentialité mentionne : l'usage de WhatsApp, les prestataires (Twilio, Meta, votre outil d'automatisation, Anthropic pour l'IA, votre logiciel), les transferts hors Union européenne et leurs garanties, les durées de conservation, les droits et comment les exercer. Ajoutez un lien vers cette page sous la case à cocher.

### Durées de conservation

Repère CNIL pour un prospect : 3 ans après le dernier contact venant de lui (référentiel CNIL « gestion des activités commerciales »). Pour un client : durée de la relation commerciale, puis 3 ans à des fins de prospection. Purgez aussi les historiques de conversation gardés pour la mémoire de l'agent (n8n, Make, base de données) : 90 jours suffisent en général pour qu'il garde le fil.

### Droits

Accès, rectification, effacement, opposition. Une demande reçue par WhatsApp (« supprimez mes données ») est transmise à l'humain avec la trace `WA-HUMAIN droits RGPD` ; l'agent ne la traite pas seul.

## 3. STOP et désinscription

Liste des expressions qui déclenchent l'arrêt immédiat, en minuscules et sans accents après normalisation :

```
stop, arret, arreter, arrete, stopper, desabonner, desabonnement, desinscrire, desinscription,
unsubscribe, ne plus recevoir, ne m'ecrivez plus, ne plus me contacter, laissez moi tranquille,
supprimez mon numero, retirez moi, plus de message, spam
```

Règles :

- La détection par mots-clés passe avant l'IA : même si l'agent hésite, ces mots posent `stop`. L'agent sert de second filet pour les formulations non listées (« j'en ai assez de vos messages »).
- Un seul message de confirmation : « C'est noté, vous ne recevrez plus de message de {{entreprise}} sur WhatsApp. » Puis plus rien.
- Le statut `stop` est relu avant chaque envoi, dans chaque scénario.
- Une personne en `stop` qui réécrit d'elle-même pour une nouvelle demande peut recevoir une réponse à cette demande. Elle ne repasse pas dans les relances automatiques sans nouvel accord.
- Meta propose aussi à l'utilisateur de refuser les messages marketing d'une entreprise depuis WhatsApp ; Twilio renvoie alors l'erreur 63050. Traitez-la comme un `stop` pour le marketing.

## 4. Règles de Meta

### Accord (opt-in) exigé par Meta

La politique de Meta impose un accord de la personne avant de lui écrire : elle doit avoir donné son numéro et accepté de recevoir des messages de votre entreprise, avec votre nom clairement indiqué, dans le respect de la loi locale. Le droit français (section 2) est plus exigeant pour le marketing : suivez-le.

### Catégories de modèles

| Catégorie | Pour quoi | Coût |
|---|---|---|
| Utilitaire | suivi d'une transaction demandée : confirmation, expédition, rappel de rendez-vous | plus bas ; gratuit dans une fenêtre de 24 h ouverte depuis le 2025-07-01 |
| Marketing | tout le reste : relance, panier abandonné, offre, demande générale d'avis | le plus cher, en France parmi les tarifs les plus élevés d'Europe |
| Authentification | codes à usage unique | sans objet ici |

Meta décide seule de la catégorie et peut reclasser un modèle après approbation. Un modèle utilitaire qui contient une promotion devient marketing. Une demande d'avis n'est utilitaire que si elle cite une commande précise et ne contient aucune offre.

### Qualité du numéro et pause des modèles

Meta note chaque numéro et chaque modèle d'après les blocages et signalements des destinataires. Un modèle trop signalé est mis en pause 3 heures, puis 6 heures, puis désactivé à la troisième fois (erreurs Twilio 63041, puis 63042). Un numéro de mauvaise qualité voit sa limite d'envoi baisser, et peut être restreint.

Ce qui fait signaler : écrire à des gens qui ne vous connaissent pas, des messages vagues, trop fréquents, envoyés la nuit, sans moyen d'arrêter.

### Agents IA : ce que Meta autorise

Depuis le 2026-01-15, les conditions de WhatsApp Business interdisent aux fournisseurs d'assistants IA généralistes (type ChatGPT ou Perplexity) d'utiliser la plateforme pour proposer leur assistant. Un agent IA au service de votre entreprise (accueil, qualification, vente, réservation, suivi de commande, support) reste autorisé. Concrètement, gardez l'agent sur votre activité : le prompt (`04-prompt-agent.md`) lui interdit de répondre aux demandes sans rapport (rédiger un devoir, coder, parler d'actualité). Source : couverture presse de l'annonce de Meta d'octobre 2025 ; relisez les conditions WhatsApp Business Solution à jour avant de publier une version du guide.

### Pratiques qui font bloquer un compte

- Envoyer en masse dès les premiers jours depuis un numéro neuf : montez en charge progressivement.
- Utiliser une application non officielle qui pilote WhatsApp Web ou l'application WhatsApp Business : c'est contraire aux conditions de WhatsApp et le numéro peut être banni. Le skill passe uniquement par l'API officielle via Twilio.
- Changer souvent de nom affiché, ou en choisir un qui ne correspond pas à votre marque.

## 5. Transparence : dire que c'est une IA

L'AI Act (règlement UE 2024/1689, article 50) impose d'informer les personnes qu'elles échangent avec une IA, au plus tard lors du premier échange. Applicable depuis le 2 août 2026. Tout le détail (classement de l'agent, formulations, modèles, profil WhatsApp, interdits de l'article 5, formation des personnes qui pilotent l'agent, fiche du système, sanctions) est dans `07-ai-act.md`.

En bref : le premier message de l'agent contient le mot « IA », l'agent ne nie jamais l'être, et un humain reste joignable sur demande.

## 6. Données envoyées à Anthropic

L'agent envoie à l'API Anthropic le texte des messages et le contexte que vous mettez dans le prompt.

- D'après les conditions commerciales d'Anthropic, les contenus envoyés par l'API ne servent pas à entraîner les modèles. À relire dans les « Commercial Terms » au moment de la mise en place.
- Durée de conservation des requêtes par Anthropic : les sources consultées divergent (7 ou 30 jours selon les dates) ; à vérifier dans l'accord de traitement des données (DPA) d'Anthropic, qui fait foi.
- Le DPA d'Anthropic s'applique aux clients de l'API via les conditions commerciales : téléchargez-le et gardez-le avec votre registre des traitements.
- Limitez ce que l'agent reçoit : pas de numéro de carte, pas de donnée de santé, pas de pièce d'identité. Le prompt lui demande de ne jamais en solliciter.

Même logique pour Twilio, Meta, n8n Cloud ou Make : chacun a son DPA. Inscrivez le traitement « agent WhatsApp » dans votre registre RGPD avec ces sous-traitants.

## 7. Horaires et fréquence

Aucun texte ne fixe d'horaires pour les messages écrits. Les horaires légaux du démarchage téléphonique (jours ouvrables, 10 h à 13 h et 14 h à 20 h) donnent un repère de ce qui est acceptable. Le skill applique par défaut :

- relances commerciales : lundi au samedi, 9 h à 20 h, jamais le dimanche ni un jour férié ;
- messages attendus (confirmation de commande, réponse à un message reçu) : à toute heure ;
- rappels de rendez-vous et suivi d'expédition : 8 h à 21 h ;
- au plus un message commercial par jour et par personne, quatre par séquence.

Le démarchage par appel téléphonique relève de règles propres (Bloctel, et consentement préalable prévu par la loi du 30 juin 2025 à partir du 11 août 2026, date à vérifier) : ce skill ne fait pas d'appels.

## 8. Avant la mise en ligne : liste de contrôle

- [ ] Case de consentement WhatsApp non pré-cochée sur chaque formulaire et au paiement
- [ ] Champs de preuve du consentement créés dans le logiciel (date, source, texte)
- [ ] Politique de confidentialité mise à jour (WhatsApp, sous-traitants, transferts, durées)
- [ ] Liste STOP en place, testée, prioritaire sur l'IA
- [ ] Premier message de l'agent qui annonce l'IA
- [ ] Prompt limité à votre activité, sans demande de données sensibles
- [ ] Horaires d'envoi réglés, fuseau Europe/Paris
- [ ] DPA de Twilio, Anthropic et de l'outil d'automatisation téléchargés, traitement inscrit au registre
- [ ] Purge programmée des historiques de conversation

## Sources

- CNIL, communications électroniques aux prospects et clients : https://www.cnil.fr/fr/communication-electronique-quelles-regles
- Code des postes et des communications électroniques, article L34-5 (sur legifrance.gouv.fr)
- CNIL, référentiel relatif aux traitements mis en œuvre aux fins de gestion des activités commerciales (durées de conservation), sur cnil.fr
- Meta, obtenir l'accord (opt-in) pour WhatsApp : https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in
- Meta, catégories de modèles : https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization
- WhatsApp Business, politiques : https://business.whatsapp.com/policy
- Twilio, concepts clés (fenêtre de 24 h, tarification des modèles utilitaires) : https://www.twilio.com/docs/whatsapp/key-concepts
- Twilio, modèles mis en pause ou désactivés : https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates
- Règlement (UE) 2024/1689 sur l'IA, article 50 : https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Anthropic, conditions commerciales et DPA : https://www.anthropic.com/legal/commercial-terms
