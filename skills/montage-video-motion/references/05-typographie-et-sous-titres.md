# 05. Typographie et sous-titres

## Partie 1. Textes à l'écran (hors sous-titres)

Titre d'accroche, ligne de chute, chiffre clé, étiquette de schéma, carton.

### Ce qui fait le style

- **Hiérarchie par la typographie** : un contexte discret et un seul mot-clé très gros et très gras. Le contraste de graisse et de taille fait le style, pas la couleur ni l'effet.
- **Le texte s'assemble au rythme de la voix**, mot par mot, puis se pose sans rebond.
- **La ligne plein écran sert de ponctuation** : 2,5 à 3,3 s, une chute, un mot-clé.

### Règles

| N° | Règle |
|---|---|
| T1 | Une seule famille de police par vidéo, en romain (pas d'italique dans un titre). Graisse légère ou normale pour le contexte, grasse ou extra-grasse pour le mot-clé. Une police à chiffres de largeur fixe pour un chiffre isolé, si la police principale n'en a pas. |
| T2 | Titre à deux niveaux : une ligne de contexte (48 à 64 px en 1080 de large) et un mot-clé qui occupe 70 à 90 % de la largeur utile. Le mot-clé finit d'apparaître sur l'image où la voix le prononce. S'il ouvre la vidéo, il est complet avant 1,2 s. |
| T3 | Ligne plein écran : 1 à 4 mots, construite mot à mot (chaque mot à une image près de son énoncé), mise en page une fois à sa largeur finale et jamais recentrée par saut. Un seul mot-clé, souvent le dernier, 1,25 à 1,3 fois plus grand. Le sous-titre s'efface pendant ce temps. |
| T4 | Entrée d'un mot : opacité 0 vers 1 en 4 images, glissement de 45 à 75 px en 12 à 15 images, courbe `B(0.16, 1, 0.3, 1)`. Un mot toutes les 3 à 4 images, une seule direction d'entrée par écran. Variante sèche : le mot apparaît d'un coup sur son image. Variante douce : un flou de départ de 12 px qui disparaît en 4 à 5 images, en même temps que l'opacité monte. |
| T5 | Lettre par lettre : seulement pour un mot de 10 lettres au plus ; une lettre toutes les 2 à 3 images, chaque lettre se cale en 2 à 3 images, la dernière en 6. Jamais d'effet machine à écrire avec curseur clignotant, sauf vraie démonstration d'outil. |
| T6 | Carton plein écran : le mot entre à 105 à 110 % de sa taille et se pose à 100 % en 8 à 14 images, en décélération, sans dépassement. |
| T7 | Une taille par niveau et par vidéo : le mot-clé garde la même taille d'un écran à l'autre (hauteur des capitales entre 6 et 9 % de la largeur, choisie une fois). |
| T8 | Aucun texte ne touche le bord ni n'entre dans une zone sûre : 80 px de marge en plus de la zone sûre. Un mot trop long passe à une taille inférieure, jamais hors cadre. |
| T9 | Casse de phrase. Pas de phrase entière en capitales, pas de petites capitales espacées au-dessus des titres. |
| T10 | Couleurs : encre sur fond clair, blanc sur fond foncé. Le mot-clé d'une ligne plein écran peut prendre la couleur d'accent si son contraste avec le fond atteint 4,5:1 (vérifiez-le : beaucoup de violets et d'oranges de marque échouent sur blanc). |
| T11 | Soulignement du mot-clé : un trait plat de la couleur d'accent, tracé de gauche à droite en 8 images, sous le mot, sans toucher les lettres. |
| T12 | Interligne de 1,05 au moins pour un grand titre ; jamais deux lignes qui se chevauchent pendant une entrée, aucun accent qui touche la ligne du dessus. |
| T13 | 12 mots au plus à l'écran en même temps, sous-titre compris. Un écran, une idée. |

### Texte cinétique empilé

Pour un temps fort : 3 à 6 mots qui s'empilent sur 2 à 4 lignes au rythme de la voix, chaque mot sec en 1 image puis immobile, mots outils en graisse normale et petits, mots de sens en extra-gras 3 à 4 fois plus grands, inclinés de 2 à 4 degrés en alternant. Le groupe entier s'efface d'un bloc à l'idée suivante (durée de vie : 0,8 à 2,8 s). Une ou deux fois par vidéo, pas plus.

## Partie 2. Sous-titres

Systématiques dès qu'il y a une voix : la plupart des vidéos de réseau social sont d'abord vues sans le son.

### Préparer

1. Horodatage au mot de la voix (Whisper, `07-son-voix.md`, section 3).
2. Découpage en cartons : `python3 scripts/sous_titres.py audio/whisper.json --format 9:16 --sortie audio/cartons.json --srt rendus/final/sous-titres.srt`. Le script applique les règles S5 et S8 ci-dessous ; relisez et corrigez à la main les coupes qui sonnent mal.
3. Correction orthographique : noms propres, marques, chiffres (Whisper écrit parfois « 3 000 » en « trois mille » ou se trompe sur un nom d'outil). Tenez un lexique du projet (`audio/lexique.txt` : forme entendue, forme écrite).
4. Choix du mot-clé de chaque carton (S9), dans `cartons.json`.

### Règles

| N° | Règle |
|---|---|
| S1 | Écran plein : la ligne de sous-titre est centrée verticalement à 33 % de la hauteur en partant du bas (y = 1286 en 1080 x 1920, y = 723 en 1920 x 1080), centrée horizontalement, à la même position pour tous les cartons. Ni sur un visage ni dans une zone sûre. |
| S2 | Écran séparé horizontal : le centre de la ligne est posé exactement sur la ligne de séparation, sur un cartouche plat de la couleur d'encre (texte blanc, coins de 8 px au plus, marges intérieures de 22 px, largeur ajustée au texte, sans ombre ni contour). |
| S3 | Zone réservée : la boîte du sous-titre agrandie de 40 px de chaque côté reste libre de tout autre élément, à chaque image, transitions et mouvements de caméra compris. |
| S4 | Lisibilité : contraste de 4,5:1 au moins avec chaque fond recouvert. Sans ombre ni contour : si le fond ne le permet pas, c'est la mise en page qu'on change (cartouche S2 ou fond uni sous la ligne). |
| S5 | Carton : une seule ligne, 1 à 5 mots (cible 2 à 4), 24 caractères au plus en 9:16 (42 en 16:9). Affiché de 0,5 à 1,8 s (cible 0,9 s), jamais moins de 0,4 s. Cartons jointifs : jamais d'écran vide entre deux cartons, même pendant une pause de voix. |
| S6 | Les sous-titres ne tournent pas, ne suivent pas la caméra, ne grossissent pas avec un zoom et restent nets et immobiles pendant les transitions. |
| S7 | Typographie française : apostrophe typographique (’), guillemets « », espace insécable avant `:` `;` `?` `!`, ponctuation conservée, aucun tiret cadratin ou demi-cadratin. |
| S8 | Découpage en groupes de sens : jamais de coupe entre un article et son nom, un chiffre et son unité, une marque et sa version, un sujet et un verbe court ; jamais un carton fait de seuls mots outils (« ce n’est », « tu as »). |
| S9 | Mot-clé : un seul par carton (aucun si le carton n’en porte pas), le mot porteur de sens (nom d’outil, chiffre, verbe d’action, mot de la promesse), mis en avant par la graisse et la taille (1,3 à 1,8 fois la hauteur des autres mots). Jamais de karaoké qui colorie chaque mot dit : plus aucune hiérarchie. |
| S10 | Taille : corps de 56 px au moins en 1080 de large pour les mots courants. Largeur de ligne : 74 % de l’image au plus (en 9:16, pour ne jamais toucher la colonne de boutons). |
| S11 | Apparition : remplacement sec du carton entier, sans animation. Variante admise : construction mot à mot, chaque mot sur son instant de voix (à 0,1 s près), le carton entier remplacé d’un coup au groupe de sens suivant. |
| S12 | Après une coupe de plan, le sous-titre réapparaît 2 images après la coupe ; il ne clignote jamais pendant un changement d’image. |
| S13 | Quand un titre animé dit les mêmes mots que la voix, le sous-titre s’efface le temps du titre. |
| S14 | Face caméra en 9:16 : jamais de sous-titres sur une caméra plein écran, où ils tombent sur le visage. Mise en page M5 (visage en bas, motion en haut) et sous-titre sur la ligne de séparation (S2). |
| S15 | Pas de couleur d’accent dans les sous-titres : le mot-clé s’y marque par la graisse et la taille. La couleur d’accent reste aux lignes plein écran. |
| S16 | Un seul traitement de sous-titres dans toute la vidéo. |

### Fichier `.srt`

Pour YouTube, LinkedIn et les sites, livrez aussi un `.srt` (le script le produit) : il rend la vidéo accessible et indexable. Sur les plateformes qui affichent leurs propres sous-titres par-dessus les vôtres, ne téléversez pas le `.srt` si les sous-titres sont déjà incrustés.
