# 04. Animation des éléments

Le mouvement des textes, chiffres, graphiques, cartes, interfaces, icônes et de la caméra. Les valeurs ci-dessous ont été mesurées image par image sur des vidéos de référence, puis éprouvées en production. Partez de là ; un mouvement hors bibliothèque se justifie dans le tableau de plans.

## 1. Ce que « fluide » veut dire

1. **Départ franc, longue traîne de freinage.** Les 10 derniers % d'un mouvement occupent au moins 40 % de sa durée. Presque rien n'est linéaire.
2. **Contraste de durées.** Textes et micro-éléments très rapides, blocs et caméra lents. C'est ce contraste qui donne l'impression de qualité.
3. **Tout tombe sur le mot.** Chaque changement visuel arrive sur l'image où la voix dit le mot qu'il illustre, à une image près, jamais plus de 0,4 s après.
4. **Rebond rare et discret.** Un seul dépassement de 3 à 8 % quand il sert, jamais de rebond répété.
5. **Changements liés.** Quand une forme se transforme et que le fond change, les deux démarrent sur la même image, avec la même courbe.
6. **Chaque mouvement sert l'information.** Rien ne bouge en boucle pendant qu'on lit.

## 2. Cadence de rendu

- 60 images par seconde pour une vidéo très animée (micro-interactions, chiffres, interfaces) : le mouvement est nettement plus doux. 30 images par seconde suffisent pour une vidéo surtout face caméra.
- Les durées ci-dessous sont données en images à 30 i/s et en secondes. À 60 i/s, doublez le nombre d'images. Dans Remotion, écrivez les durées en secondes multipliées par `fps` : le même code marche aux deux cadences.

## 3. Durées par famille

| Famille | Durée à 30 i/s | En secondes |
|---|---|---|
| Micro-élément d'interface (étiquette, coche, menu) | 2 à 4 images | 0,07 à 0,13 |
| Mot ou lettre qui apparaît | 3 à 5 images, puis 12 à 15 pour finir de glisser | 0,1 à 0,17, puis 0,4 à 0,5 |
| Carte ou bloc qui entre | 3 à 8 images | 0,1 à 0,27 |
| Bloc qui se pose lentement | 30 à 46 images | 1 à 1,5 |
| Déplacement d'un point à un autre | 18 à 22 images | 0,6 à 0,73 |
| Changement de forme, petit | 8 images | 0,27 |
| Changement de forme, taille doublée ou plus | 19 images | 0,63 |
| Sortie | 2 à 4 images | 0,07 à 0,13 |
| Décalage entre éléments d'un même ensemble (lignes, tuiles, barres) | 2 à 3 images | 0,07 à 0,1 |
| Décalage entre mots | 3 à 4 images | 0,1 à 0,13 |
| Décalage entre actions à lire une par une | 6 à 7 images | 0,2 à 0,23 |

## 4. Courbes

Jamais de mouvement linéaire, sauf un compteur à vitesse constante, un trait qui se dessine en suivant une écriture, ou un fondu de couleur de fond. Entrées en décélération, sorties en accélération, déplacements en accélération puis décélération.

| Nom | Remotion | GSAP | CSS |
|---|---|---|---|
| Décélération douce | `Easing.out(Easing.quad)` | `power1.out` | `cubic-bezier(0.5, 1, 0.89, 1)` |
| Décélération franche (par défaut) | `Easing.out(Easing.cubic)` | `power2.out` | `cubic-bezier(0.33, 1, 0.68, 1)` |
| Accélération (sortie) | `Easing.in(Easing.cubic)` | `power2.in` | `cubic-bezier(0.32, 0, 0.67, 0)` |
| Aller-retour | `Easing.inOut(Easing.cubic)` | `power2.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| Déplacement A vers B | `Easing.bezier(0.8, 0.1, 0.25, 0.9)` | `CustomEase.create("ab", "0.8,0.1,0.25,0.9")` | `cubic-bezier(0.8, 0.1, 0.25, 0.9)` |
| Gros changement de forme | `Easing.bezier(0.7, 0, 0.2, 1)` | `CustomEase.create("forme", "0.7,0,0.2,1")` | `cubic-bezier(0.7, 0, 0.2, 1)` |
| Entrée de mot | `Easing.bezier(0.16, 1, 0.3, 1)` | `CustomEase.create("mot", "0.16,1,0.3,1")` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Recadrage de caméra | `Easing.bezier(0.45, 0, 0.2, 1)` | `CustomEase.create("cam", "0.45,0,0.2,1")` | `cubic-bezier(0.45, 0, 0.2, 1)` |
| Fondu de fond | `Easing.inOut(Easing.sin)` | `sine.inOut` | `cubic-bezier(0.37, 0, 0.63, 1)` |

Dans Remotion, toute interpolation se borne : `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'`. Sinon une valeur continue de grandir après la fin du mouvement.

## 5. Ressorts (Remotion, `spring`)

Valables à 30 comme à 60 i/s : Remotion calcule le ressort en temps à partir de `fps`.

| Usage | Réglage | Comportement |
|---|---|---|
| Sans dépassement | `{ mass: 1, stiffness: 200, damping: 26 }` | se pose à 1 % près en 12 images (0,4 s) |
| Dépassement discret | `{ mass: 1, stiffness: 120, damping: 14 }` | 7 % de dépassement, repos en 18 images (0,6 s) |
| Cible d'un glisser-déposer | `{ mass: 0.6, stiffness: 220, damping: 12 }` | 4 % de dépassement |
| À ne pas utiliser | réglage par défaut (`mass: 1, stiffness: 100, damping: 10`) | 16 % de dépassement, rebond visible : fait « template » |

Un ressort part d'une vitesse nulle : pour un mot ou un bloc qui doit partir vite, préférez une courbe de Bézier.

## 6. Préréglages

`B(...)` désigne une courbe de Bézier. Durées à 30 i/s.

| Préréglage | Durée | Réglage |
|---|---|---|
| Micro-entrée (étiquette, menu, tuile) | 2 à 3 images | opacité 0 vers 1, `translateY` de 3 à 10 px vers 0, décélération franche |
| Carte qui surgit | 3 à 4 images | échelle 0,90 vers 1 (passages 0,97 puis 1,01 puis 1), opacité pleine dès la première image, décélération franche |
| Carte qui apparaît par l'échelle | 5 images | échelle 0,62 vers 1, décélération franche ; sortie : échelle 1 vers 0,89 et opacité en 3 images, accélération |
| Entrée douce d'un bloc | 4 puis 18 images | opacité 0 vers 1 en 4 images (décélération douce), `translateY` 12 px vers 0 en 18 images (décélération franche) |
| Bloc qui se pose lentement | 30 à 46 images | échelle 1,066 vers 1 et `translateY` -3 % vers 0, décélération douce |
| Construction en cascade | conteneur à 0, en-tête à +2, premier élément à +8, puis +3 à +4 par élément | chaque élément en 2 à 3 images : opacité 0 vers 1, échelle 0,92 vers 1 |
| Déplacement A vers B | 18 à 22 images | `B(0.8, 0.1, 0.25, 0.9)` |
| Changement de forme, petit | 8 images | décélération franche |
| Changement de forme, taille doublée | 19 images | `B(0.7, 0, 0.2, 1)` ; fond lié : 18 images, `B(0.65, 0.1, 0.05, 0.9)`, même image de départ |
| Appui sur un bouton | 3 + 3 + 4 images | échelle 1 vers 0,80, maintien, retour, décélération franche |
| Glisser-déposer | 18 images | accélération douce, fondu sur les 4 dernières images ; la cible arrive en ressort de 0,77 à 1 |
| Barres d'un graphique | sommet en 9 images, repos vers 14 | ressort à dépassement discret, 2 à 3 images de décalage entre barres, départ sur le mot |
| Compteur | 30 à 35 images | `valeur = Math.round(cible * (1 - Math.pow(1 - p, 3)))`, `p` de 0 à 1 ; la première valeur arrive en fondu |
| Barre de progression | 70 images | 0 vers 100 %, aller-retour ; coche et libellé final sur la même image |
| Tracé d'une courbe ou d'un parcours | 20 à 24 images | `strokeDashoffset`, décélération franche ; étiquette posée une image avant le début du tracé |
| Rature d'une idée fausse | 4 images | trait de gauche à droite, puis le bloc passe en gris 5 images plus tard |
| Inclinaison qui se pose | 8 à 10 images | rotation 0 vers 3 ou 4 degrés, décélération franche |
| Recadrage de caméra | 19 à 22 images | échelle 1 vers 1,10 au plus, `B(0.45, 0, 0.2, 1)`, recentrage en même temps |
| Poussée de sortie | 10 images | échelle +10 % au plus, accélération, enchaînée sur la transition |
| Zoom arrière de sortie | 17 images | échelle 1 vers 0,91, accélération douce |
| Dérive lente après une entrée | 30 à 45 images | 3 à 5 % d'échelle ou 2 % de position, décélération, une seule fois |

Le modèle `modele-remotion/src/presets.ts` contient ces réglages prêts à l'emploi.

## 7. Règles par élément

### Graphiques
- Axes et libellés d'abord, puis les données.
- Une barre pousse depuis sa ligne de base ; une courbe se dessine de gauche à droite avec l'étiquette de valeur sur sa pointe.
- Libellés à taille réelle, en bout de courbe plutôt qu'en légende. Un graphique qu'on rétrécit jusqu'à rendre ses textes minuscules ne sert à rien.

### Chiffres
- Un compteur part de 0 (ou de la valeur précédente), décélère et finit sur la valeur exacte de `faits.md`.
- Police à chiffres de largeur fixe (`font-variant-numeric: tabular-nums`), sinon le nombre tremble pendant qu'il défile.
- Un chiffre d'accroche finit de défiler avant 1,3 s.

### Rotation légère
- Un ou deux éléments par écran (illustration, carte, mot mis en avant) inclinés de 1 à 4 degrés, en sens opposés s'ils sont deux. Cela casse l'effet « plat » sans faire désordre.
- Inclinaison atteinte en 8 à 10 images puis fixe, ou posée dès l'apparition pour un mot qui apparaît sec.
- Titre : 2 degrés au plus. Jamais sur les sous-titres ni sur un logo.
- Rotation d'emphase : un seul aller-retour de 0 à 4 degrés puis 0 en 10 images, sur le mot qui le justifie.

### Caméra
- Un mouvement seulement s'il guide le regard vers ce que la voix nomme.
- 10 % de zoom au plus, 5 degrés d'inclinaison au plus.
- Deux mouvements au plus pour 30 s, trois pour 60 s. Jamais pendant un écran chargé en texte.
- Jamais un zoom avant suivi aussitôt d'un zoom arrière.
- Les sous-titres ne suivent jamais la caméra.

### Flou de mouvement
- Admis pendant les 2 à 4 images les plus rapides d'un mouvement d'élément, 12 px au plus.
- Jamais sur un texte qu'on doit lire, jamais en plein écran, jamais à travers une coupe franche.

## 8. Pièges vérifiés

- Une courbe calculée numériquement (ressort, recherche par dichotomie) renvoie environ 1e-9 au départ au lieu de 0 : un test `if (p > 0)` déclenche alors l'élément trop tôt. Forcez 0 et 1 exacts aux extrémités.
- Un zoom de caméra s'interpole en échelle logarithmique (`Math.exp` de l'interpolation des `Math.log` des échelles), sinon il paraît accélérer en fin de course.
- Un texte qui doit rester net pendant un passage de relais n'est jamais une copie floue agrandie : on ne fond que sa couleur.
- Rendu identique à chaque fois : tout se calcule depuis l'image courante (`useCurrentFrame()` dans Remotion, temps de la timeline dans GSAP). Jamais `Math.random()` (utilisez `random('graine')` de Remotion), ni `Date.now()`, ni transition CSS, ni minuterie.
- Conversion des secondes en images : 0 s doit donner l'image 0. Une fonction qui impose « au moins 1 image » décale le premier plan d'une image et la vidéo s'ouvre sur une image vide (vu en écrivant le modèle de ce skill, attrapé par le contrôle de la première image).
- Une police pas encore chargée au moment du rendu donne des images dans la police de secours : attendez-la explicitement (`modele-remotion/src/Polices.tsx`).
- Une bibliothèque tierce n'entre que si elle se pilote image par image (Lottie par `@remotion/lottie`, anime.js par `seek`). Un moteur qui ne joue qu'en temps réel donne des images aléatoires au rendu.
- Les enregistrements d'écran de Reels sont souvent à 60 i/s pour un contenu à 30 : pour mesurer une animation de référence, ne gardez que les images distinctes.
