# Skill « montage-video-motion »

Un skill pour Claude qui monte des vidéos motion design de bout en bout : brief, script, tableau de plans, animation, sous-titres, son, rendu dans chaque format, contrôle image par image. Pour vos propres contenus ou pour vos clients.

Version 1.0, novembre 2026. Offert par Node it (nodeit.fr), organisme de formation en IA certifié Qualiopi, qui produit ses propres vidéos avec cette méthode. Qui est Node it, et comment vous former avec votre CPF : `A-PROPOS.md`.

## Installation

### Dans Claude Code (recommandé : c'est là que les vidéos se rendent)

```bash
# 1. Décompressez le zip, puis copiez le dossier du skill pour tous vos projets
cp -R montage-video-motion ~/.claude/skills/

# 2. Vérifiez les outils (le skill vous guide pour installer ce qui manque)
node -v && ffmpeg -version && python3 --version
```

Sous Windows, le dossier des skills est `%USERPROFILE%\.claude\skills\`. Ouvrez ensuite Claude Code dans un dossier vide qui deviendra votre projet vidéo et écrivez : « Je veux monter une vidéo motion. »

### Dans Claude.ai (application web ou de bureau)

Paramètres, Capacités, Skills : importez le zip (selon votre offre Claude, l'exécution de code doit être activée). Dans Claude.ai, le skill vous aide pour le brief, le script, le tableau de plans et l'écriture du code des animations. Le rendu vidéo se fait ensuite sur votre ordinateur, dans Claude Code.

Détail pas à pas : `references/01-installation.md`.

## Pour commencer

- **Une vidéo 100 % animée** (présentation de votre offre, publicité, explication, chiffres) : « Je veux une vidéo motion de 30 secondes pour Instagram et LinkedIn qui présente mon offre. »
- **Une vidéo tournée face caméra à habiller** : « J'ai un rush de 6 minutes dans `rushes/`, fais-en un Reel de 45 secondes avec sous-titres et animations. »
- **Une série pour un client** : « Mon client veut une vidéo par produit à partir de ce tableau. »
- **Des inserts pour votre logiciel de montage** : « Fabrique-moi les titres animés de ma vidéo en fond transparent pour Premiere Pro. »

## Contenu

```
montage-video-motion/
├── SKILL.md                         méthode en 10 étapes, règles de travail, définition de « terminé »
├── LISEZMOI.md                      ce fichier
├── A-PROPOS.md                      qui a fait ce skill, se former avec son CPF
├── references/
│   ├── 01-installation.md           outils, licences, structure du projet
│   ├── 02-brief-et-script.md        questions du brief, script pour l'oral, faits sourcés
│   ├── 03-storyboard.md             style, types d'écrans, mises en page, zones sûres, tableau de plans
│   ├── 04-animation.md              durées, courbes, ressorts, préréglages Remotion, GSAP, CSS
│   ├── 05-typographie-et-sous-titres.md
│   ├── 06-montage-rythme-transitions.md
│   ├── 07-son-voix.md               voix, transcription au mot, musique, effets, sonie
│   ├── 08-face-camera.md            dérushage, coupes, habillage, inserts transparents
│   ├── 09-rendu-et-export.md        formats, encodage, déclinaisons, miniature
│   ├── 10-controle-image-par-image.md
│   ├── 11-anti-slop.md              ce qui fait « vidéo générée », interdit
│   ├── 12-droits-et-conformite.md   musique, images, visages, voix, AI Act
│   └── 13-vendre-le-motion.md       pour les freelances : offres, livrables, droits cédés
├── assets/                          gabarits : brief, tableau de plans, liste de livraison
├── scripts/                         sous-titres, silences, planches, sonie, contrôle (Python 3 + ffmpeg)
└── modele-remotion/                 projet Remotion de départ avec préréglages et composants
```

## À savoir

- Claude ne publie rien, n'envoie rien à un client et ne dépense rien sans votre accord explicite.
- Vos rushes ne sont jamais modifiés : Claude travaille sur des copies.
- Les outils évoluent (Remotion, HyperFrames, plateformes, formats). Les réglages datés sont signalés ; vérifiez la documentation officielle quand un menu ou une option ne correspond plus.
- Remotion est gratuit pour les indépendants et les petites structures, sous conditions : lisez sa licence avant un usage commercial (`references/01-installation.md`, section 4).
