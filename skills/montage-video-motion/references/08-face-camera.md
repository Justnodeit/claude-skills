# 08. Vidéo face caméra habillée de motion (chemin B)

Une vidéo tournée (par l'utilisateur ou par son client), à transformer en vidéo rythmée : prises ratées retirées, silences resserrés, sous-titres, titres, inserts motion, plans de coupe, zooms.

## 1. Avant le tournage (si l'utilisateur n'a pas encore tourné)

Conseils à donner, ils économisent des heures de montage :
- Un script ou un plan en points, lu à voix haute une fois avant. Les erreurs viennent surtout de l'improvisation.
- Cadrage : yeux au tiers supérieur, un peu d'air au-dessus de la tête. Pour une diffusion en 9:16 et en 16:9, tourner en 16:9 en 4K et garder la tête au centre : on recadre en vertical sans perdre en netteté.
- Lumière face au visage (fenêtre ou lampe douce), jamais dans le dos.
- Son : micro-cravate ou micro proche (`07-son-voix.md`, section 1).
- Une erreur : pause de deux secondes, puis on reprend la phrase depuis le début. Pas de « je recommence » : la pause suffit au dérushage.

## 2. Dérushage

1. **Copie de travail.** Les fichiers de `rushes/` ne se modifient jamais.
2. **Transcription au mot** de l'audio du rush (`07-son-voix.md`, section 3).
3. **Repérer les prises répétées** : dans la transcription, une phrase dont le début revient deux fois ou plus. On garde la dernière prise complète, sauf si une précédente est meilleure (l'utilisateur tranche en cas de doute).
4. **Repérer les faux départs** : un fragment de phrase suivi d'une pause de plus de 0,8 s puis d'une reprise. On coupe le fragment.
5. **Repérer les silences** : `python3 scripts/silences.py rushes/rush.mp4 --seuil -35 --pause-min 0.6 --pause-gardee 0.25 --sortie montage/coupes.json`. Le script ramène chaque silence de plus de 0,6 s à 0,25 s et écrit la liste des segments gardés.
6. **Lire la liste des coupes à l'utilisateur** (début, fin, texte coupé), sous forme de tableau, avant d'appliquer quoi que ce soit.
7. **Appliquer** : `python3 scripts/silences.py rushes/rush.mp4 --coupes montage/coupes.json --rendre montage/rush-coupe.mp4`.
8. **Écouter chaque raccord** : aucun fragment de voix de moins de 0,3 s collé à une coupe, aucun claquement, aucun mot tronqué. Retranscrire le fichier coupé et comparer au script : tout mot attendu doit y être.

Règles de coupe :
- Ne jamais couper au milieu d'un mot. Une coupe tombe dans un silence, ou 0,10 à 0,15 s après la fin d'un mot.
- Une respiration courte se garde : une voix sans aucune respiration paraît robotique.
- Le regard : une coupe sur un regard qui fuit la caméra se voit. Préférez la prise où le regard est stable, ou masquez la coupe par un insert.

## 3. Habillage

### Ce qu'on ajoute, dans l'ordre

1. **Sous-titres** (`05-typographie-et-sous-titres.md`, partie 2). En 9:16, jamais sur le visage.
2. **Titres et mots-clés** sur les phrases qui portent le message (une à trois fois par minute).
3. **Inserts motion** : schéma, chiffre, liste, capture d'interface, sur ce que la voix n'explique pas assez.
4. **Plans de coupe** (photo ou vidéo de banque d'images sous licence, capture d'écran réelle) qui montrent exactement ce que dit la phrase.
5. **Zooms** sur le visage pour relancer le rythme : 8 à 12 % d'échelle, en coupe franche (« punch-in ») sur un mot fort, ou en poussée lente sur 2 à 4 s. Deux ou trois par minute, jamais deux d'affilée.
6. **Fin** : appel à l'action et, si la marque en a une, son outro (`06-montage-rythme-transitions.md`, R9).

### Budget

- Environ 40 % du temps en motion au plus, et au moins 4 s de visage entre deux animations : la vidéo respire, la personne reste au centre.
- Deux animations plein cadre ne s'enchaînent pas en coupe sèche ; une animation ne coupe pas la personne en plein mot. Chaque animation entre et sort par son propre mouvement.

### Mises en page

| Situation | Mise en page |
|---|---|
| 16:9, explication simple | Visage plein cadre, sous-titres en bas, inserts plein cadre ou à côté de la tête (dans l'espace libre, centré dans cet espace) |
| 16:9, démonstration d'outil | Capture d'écran plein cadre, visage en vignette dans un coin (sans bordure ni ombre), ou alternance capture et visage en coupe franche |
| 9:16, tournée en vertical | Visage en bas, motion en haut (M5), sous-titre sur la ligne de séparation |
| 9:16, recadrée d'un 16:9 en 4K | Recadrage centré sur la tête, la hauteur du plan d'origine entière ; écran séparé M5 pendant les inserts |

## 4. Deux façons de produire

### A. Tout dans Remotion

Le rush coupé entre dans la composition par `<OffthreadVideo src={staticFile('rush-coupe.mp4')} />`, les sous-titres, titres et inserts se posent par-dessus avec les horodatages de la transcription du fichier coupé (refaites la transcription après les coupes : les temps ont changé). Avantage : un seul rendu, tout est calé à l'image, les déclinaisons de format se rendent depuis le même code.

### B. Inserts transparents pour votre logiciel de montage

L'utilisateur garde Premiere Pro, DaVinci Resolve, Final Cut ou CapCut ; Claude fabrique :
- la liste des coupes, en tableau (et en EDL ou en marqueurs si le logiciel les importe) ;
- chaque titre, insert ou habillage en vidéo à fond transparent, à la durée exacte, nommé par son instant de pose (`insert_00m42s300_chiffre-clients.mov`) ;
- le fichier `.srt` des sous-titres, si le logiciel les gère lui-même.

Rendu transparent avec Remotion :

```bash
# ProRes 4444 avec transparence : Premiere Pro, DaVinci Resolve, Final Cut
npx remotion render src/index.ts InsertChiffre rendus/inserts/insert_00m42s300_chiffre.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png

# WebM (VP8) avec transparence : plus léger, accepté par certains logiciels et navigateurs
npx remotion render src/index.ts InsertChiffre rendus/inserts/insert_00m42s300_chiffre.webm --codec=vp8 --pixel-format=yuva420p --image-format=png
```

La composition d'un insert transparent n'a pas de fond (aucun élément plein cadre opaque). Vérifiez la transparence en posant l'insert sur une image de test avant de livrer.

## 5. Plans de coupe

- Banques d'images avec licence commerciale (Pexels, Pixabay, Unsplash pour les photos, ou une banque payante si l'utilisateur en a une) : licence lue et notée dans `faits.md` (colonne crédit), aucun logo ou URL lisible, aucun visage sur un sujet sensible.
- Le plan montre concrètement ce que dit la phrase (une boîte de réception pour « vos e-mails »), jamais un cliché vague (poignée de main, cerveau lumineux, robot humanoïde).
- Une capture d'écran réelle vaut mieux qu'une interface inventée. Les données personnelles visibles (noms, e-mails, montants d'un client) se floutent ou se remplacent par des données fictives avant le rendu.
- Un plan réel ne se coupe jamais en hauteur : il est mis à la hauteur du cadre et seuls ses côtés sont coupés.
