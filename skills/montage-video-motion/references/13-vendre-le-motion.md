# 13. Pour un freelance : vendre et livrer du motion

Ce que Claude peut aider à préparer quand l'utilisateur produit pour des clients. Les prix restent à l'utilisateur : Claude ne fixe aucun tarif et n'en invente aucun.

## 1. Des offres faciles à acheter

| Offre | Ce que le client reçoit | Pourquoi ça marche avec ce skill |
|---|---|---|
| Vidéo unique | Une vidéo, un ou deux formats, deux tours de corrections | La méthode en 10 étapes et le contrôle évitent les allers-retours |
| Pack de déclinaisons | La même vidéo en 9:16, 4:5, 1:1 et 16:9, recomposée pour chaque format | Une composition par format sur les mêmes scènes : peu de travail en plus |
| Série à partir de données | Une vidéo par produit, par client, par chiffre du mois, à partir d'un tableau | Remotion et un schéma de données : la dixième vidéo coûte presque rien |
| Habillage de vidéos tournées | Dérushage, sous-titres, titres et inserts sur les vidéos du client, chaque mois | Dérushage assisté, inserts réutilisables, charte figée dans les compositions |
| Kit d'habillage | Titres animés, sous-titres, transitions et fin aux couleurs du client, en inserts transparents pour son monteur | Le client garde son logiciel, vous vendez la charte animée |

## 2. Cadrer avant de chiffrer

Le brief de `02-brief-et-script.md` sert aussi de base au devis. Avant de chiffrer, fixez par écrit :
- les formats et les durées livrés ;
- qui fournit quoi (script, voix, rushes, musique, logos) et à quelle date ;
- le nombre de tours de corrections inclus, et ce qu'est une correction (un réglage dans le tableau de plans validé) par rapport à un changement (un nouveau script) ;
- les dépenses refacturées (musique sous licence, voix de synthèse, génération par IA, banque d'images payante) ;
- les délais de validation du client à chaque étape (brief, tableau de plans, premier rendu).

## 3. Les étapes de validation à faire signer

1. Brief validé.
2. Script et `faits.md` validés.
3. Planche fixe validée (style, mises en page) : à partir d'ici, changer le style est un changement, pas une correction.
4. Premier rendu complet.
5. Rendu final après corrections.

Chaque validation : un e-mail ou un message daté du client. C'est ce qui protège quand il demande de tout refaire au cinquième tour.

## 4. Ce que vous livrez

- Les fichiers finaux, nommés et versionnés (`09-rendu-et-export.md`, section 7).
- Le `.srt` des sous-titres.
- La miniature si la plateforme la prend.
- Les licences des éléments tiers (musique, images), ou la liste de leurs sources.
- Sur option : les sources (projet Remotion, gabarits). Dites alors au client que Remotion a sa propre licence, gratuite ou payante selon la taille de sa structure, à vérifier sur remotion.dev.

## 5. Les droits cédés

En droit français, la cession des droits d'auteur sur une création doit être écrite et préciser chaque droit cédé (reproduction, représentation, adaptation), le domaine d'exploitation (supports, canaux), le territoire et la durée. Sans cela, le client n'a pas forcément le droit d'utiliser la vidéo où il le souhaite. Prévoyez ces lignes dans le devis ou le contrat ; faites relire un modèle par un avocat une fois, puis réutilisez-le.

Les éléments tiers (musique, images de banque, polices) ne vous appartiennent pas : vous ne cédez que vos droits, et vous transmettez les licences qui couvrent le reste.

## 6. Faire de chaque projet un modèle

À la fin d'un projet, proposez de ranger ce qui resservira :
- la charte du client en tokens (`presets.ts` : couleurs, police, tailles) ;
- les compositions validées, en composants paramétrés ;
- les règles écartées par le client (« pas de fond sombre », « pas d'inclinaison ») dans un fichier `client.md`, relu au projet suivant.

C'est ce qui transforme un skill générique en votre méthode de production.
