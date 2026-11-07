# 03. Style, mises en page et tableau de plans

## 1. Nommer un style de référence

Avant le premier plan, écrivez en trois lignes le style de la vidéo et faites-le valider :
- **Fond** : clair par défaut (blanc ou couleur très claire de la charte). Le fond sombre est un choix assumé pour une vidéo donnée, pas un réflexe.
- **Couleurs** : un fond, une encre (texte), un accent. Trois couleurs, quatre au plus. Aplats francs.
- **Énergie** : posée (plans de 2 à 3,5 s, entrées douces) ou vive (plans de 1 à 2 s, entrées sèches, rafales sur les temps forts).

Exemple : « Fond blanc, encre bleu nuit, accent orange de la marque. Typographie géante, un mot-clé par écran. Énergie vive, coupes franches, un personnage-forme qui réagit en bas d'écran. »

## 2. Les types d'écrans

Chaque plan porte un seul type. Choisissez le type selon ce que dit la phrase.

| Type | Quand | Contenu | Piège |
|---|---|---|---|
| Titre | Accroche, chute, idée clé | 1 à 4 mots, un mot-clé très gros | Une ligne seule perdue au milieu du vide : le texte doit occuper l'espace |
| Chiffre clé | Un nombre qui porte le message | Le chiffre en très grand, son unité, une ligne de contexte, la source | Chiffre sans source, compteur qui finit sur une valeur arrondie |
| Liste ou classement | 3 à 5 éléments | Un élément qui entre à chaque mot qui le nomme | Liste à puces figée, plus de 5 éléments |
| Avant et après | Montrer un changement | Deux états du même objet, même cadrage | Deux images qui ne se comparent pas |
| Démonstration | Montrer un outil, une interface, un geste | Capture réelle ou interface reconstruite fidèlement, mise en valeur de la zone utile | Interface inventée, texte d'interface illisible |
| Schéma | Un mécanisme, un parcours | 3 à 5 blocs reliés, qui se construisent dans l'ordre de la voix | Schéma complet d'emblée, flèches partout |
| Citation ou témoignage | Une preuve humaine | La phrase exacte, le nom et la fonction (avec accord) | Citation reformulée, visage sans autorisation |
| Appel à l'action | Fin | Le geste montré (bouton suivre, enregistrer, commenter un mot) | Logo seul qui allonge la vidéo |

## 3. Les mises en page

Une vidéo n'utilise que quelques mises en page, toujours les mêmes, pour qu'on la lise sans effort. Proposez-en au plus cinq, et ne composez jamais librement plan par plan.

| Code | Mise en page | Usage |
|---|---|---|
| M1 | Texte plein écran | Titre, chiffre, chute, appel à l'action |
| M2 | Écran séparé horizontal : média en haut (45 à 50 % de la hauteur), texte ou personnage en bas | Expliquer en montrant l'objet dont on parle |
| M3 | Média encadré (coins arrondis, sans ombre ni bordure), texte dessous | Énumération d'exemples, captures successives |
| M4 | Média plein cadre, sous-titre seul | Moment humain, plan fort |
| M5 | Visage en bas, motion en haut (face caméra vertical) | Vidéo tournée en 9:16 où les sous-titres ne doivent pas tomber sur le visage |

Règles d'enchaînement :
- on change de mise en page sur une coupe entre deux phrases, jamais au milieu d'une phrase ;
- deux plans qui se suivent changent de mise en page, sauf deux titres d'affilée en ouverture ou en fin ;
- au moins trois mises en page différentes dans une vidéo de plus de 30 s ;
- un seul texte en mouvement à la fois, deux éléments animés au plus en même temps.

## 4. Formats et zones sûres

L'interface de chaque plateforme recouvre une partie de l'image. Aucun texte, aucun visage, aucun logo dans ces zones ; un fond ou une vidéo peut y passer.

### 9:16, 1080 x 1920 (Reels, TikTok, Shorts)

| Zone | Position | Ce qui la recouvre |
|---|---|---|
| Haut | y de 0 à 220 | nom du compte, en-tête |
| Bas | y de 1500 à 1920 | légende, nom, son, boutons du bas |
| Droite | x de 960 à 1080, entre y 1000 et 1650 | boutons j'aime, commenter, partager, enregistrer |

Ces valeurs ont été relevées sur Instagram. TikTok recouvre un peu plus le bas et la droite : avant le rendu final, superposez une capture d'écran réelle de la plateforme en calque semi-transparent sur une image de votre vidéo et vérifiez.

### 4:5, 1080 x 1350 (fil LinkedIn, fil Instagram)

Marge de 80 px sur les quatre bords. Un Reel 9:16 affiché dans le fil LinkedIn est recadré au centre : ne comptez pas dessus, rendez une version 4:5 dédiée.

### 16:9, 1920 x 1080 (YouTube, site, présentation)

Marge de 5 % sur chaque bord (96 px à gauche et à droite, 54 px en haut et en bas). Bande des sous-titres : rien d'autre sous y = 860.

### Marges internes

- 80 px au moins entre un texte et le bord de la zone utile.
- 40 px au moins entre deux blocs.
- Le bloc utile est centré dans sa zone (au-dessus de la bande des sous-titres, ou dans l'espace libre à côté d'un visage).

## 5. Le tableau de plans

Gabarit : `assets/tableau-de-plans.md`. Une ligne par plan :

| Colonne | Contenu |
|---|---|
| N° | 01, 02… |
| Début, fin | en secondes, d'après l'horodatage de la voix |
| Texte dit | la phrase ou le morceau de phrase |
| Mot déclencheur | le mot sur lequel le plan commence ou change |
| Type d'écran | section 2 |
| Mise en page | M1 à M5 |
| À l'écran | ce qu'on voit, élément par élément, dans l'ordre d'entrée |
| Mouvement | préréglage de `04-animation.md` |
| Transition d'entrée | coupe franche par défaut (`06-montage-rythme-transitions.md`) |
| Son | effet sonore éventuel et son instant |
| Source | ligne de `faits.md`, crédit du média |

Règles :
- un plan dure de 0,3 à 3,5 s ; il peut aller jusqu'à 5,5 s s'il reçoit un élément neuf à chaque carton de sous-titre ;
- chaque plan apporte quelque chose de neuf (un élément, un mouvement, une couleur, un cadrage) : deux plans qui se ressemblent trop s'ennuient l'un l'autre ;
- l'image correspond à la phrase dite à ce moment-là, jamais une illustration vague.

## 6. Planche fixe et test muet

Avant d'animer quoi que ce soit :
1. Rendez une image fixe par plan, à son état final (Remotion : `npx remotion still`, ou une composition « planche » qui aligne les plans).
2. Assemblez-les en planche et montrez-la à l'utilisateur. On corrige ici ce qui coûterait cher plus tard : hiérarchie, couleurs, marges, lisibilité.
3. Test muet : donnez la planche, sans le script, à quelqu'un qui ne connaît pas le projet (ou à un sous-agent neuf dans Claude Code) et demandez-lui le message en une phrase. S'il ne le trouve pas, le storyboard ne dit pas ce que dit le script : on corrige les écrans.
4. Les compositions validées deviennent les gabarits de la vidéo. Les écartées donnent des règles (« pas de texte sur deux lignes en M2 »), notées dans `brief.md`.
