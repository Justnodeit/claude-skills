# 01. Installation et structure du projet

## 1. Ce qu'il faut

| Outil | Pourquoi | Vérifier |
|---|---|---|
| Claude Code | Exécuter les commandes, écrire le code, rendre et contrôler les vidéos | `claude --version` |
| Node.js 20 ou plus récent (version LTS) | Remotion et HyperFrames tournent sur Node | `node -v` |
| ffmpeg (avec ffprobe) | Couper, mesurer, encoder, contrôler | `ffmpeg -version` |
| Python 3.10 ou plus récent | Scripts du skill (bibliothèque standard seulement) | `python3 --version` |
| Whisper (facultatif mais conseillé) | Transcription au mot, pour caler sous-titres et animations | `whisper --help` |
| Un navigateur Chromium | Remotion le télécharge lui-même au premier rendu | rien à faire |

Machine : un ordinateur de moins de cinq ans suffit. Le rendu est plus long sur une machine modeste, jamais impossible. Comptez quelques gigaoctets libres par projet (rushes et rendus).

## 2. Installer pas à pas

Claude : faites installer un outil à la fois, montrez la commande, attendez le résultat avant la suivante. Si une commande échoue, demandez le message d'erreur complet.

**Claude Code** : suivez la page d'installation officielle (code.claude.com/docs). Elle donne la commande à jour pour macOS, Windows et Linux.

**Node.js** : installateur LTS depuis nodejs.org, ou `brew install node` (macOS), `winget install OpenJS.NodeJS.LTS` (Windows).

**ffmpeg** :
```bash
brew install ffmpeg              # macOS (Homebrew)
winget install Gyan.FFmpeg       # Windows, puis rouvrir le terminal
sudo apt install ffmpeg          # Ubuntu, Debian
```

**Whisper** (transcription locale, gratuite, rien ne quitte votre ordinateur) :
```bash
python3 -m pip install -U openai-whisper
```
Premier lancement : le modèle se télécharge (de quelques centaines de mégaoctets à environ 3 Go selon la taille choisie). `small` va vite, `medium` est un bon compromis pour le français, `large` est le plus précis et le plus lent. Alternatives plus rapides : faster-whisper, whisper.cpp. Le script `scripts/sous_titres.py` lit le JSON de openai-whisper ; pour un autre outil, convertissez vers le même format (liste de mots avec `word`, `start`, `end`).

Une transcription par un service en ligne payant est possible : c'est une dépense, l'utilisateur décide (règle 8 du skill).

## 3. Le skill

```bash
cp -R montage-video-motion ~/.claude/skills/
```
Les scripts s'appellent ensuite depuis le dossier du skill, par exemple :
```bash
python3 ~/.claude/skills/montage-video-motion/scripts/controle.py rendus/final/video.mp4
```

## 4. Choisir le moteur de rendu

| Critère | Remotion | HyperFrames | Logiciel de montage existant |
|---|---|---|---|
| Langage | React (TypeScript) | HTML, CSS, GSAP | Interface graphique |
| Point fort | Compositions réutilisables, séries à partir de données, préréglages précis à l'image | Pas d'étape de compilation, très proche du web | Vous gardez vos habitudes |
| Rôle de Claude | Écrit et rend tout | Écrit et rend tout | Fabrique les inserts transparents et la liste des coupes, vous assemblez |
| Licence | Gratuite pour les particuliers et les petites entreprises sous conditions, payante au-delà | Open source (Apache 2.0) | Celle de votre logiciel |

Par défaut : **Remotion**. Le modèle `modele-remotion/` et tous les préréglages de `04-animation.md` sont écrits pour lui ; les équivalents GSAP et CSS sont donnés à côté.

### Remotion

```bash
npx create-video@latest          # choisir le modèle vierge (blank), TypeScript
cd mon-projet
npm i                            # si l'assistant ne l'a pas fait
npx remotion studio              # aperçu dans le navigateur, image par image
```
Puis copiez dans `src/` les fichiers de `modele-remotion/src/` du skill (préréglages, sous-titres, texte mot à mot, compteur) et suivez `modele-remotion/README.md`.

**Licence** : au moment de la rédaction, Remotion est gratuit pour un particulier, une entreprise de trois personnes au plus et une association ; au-delà, une licence entreprise payante est demandée. Lisez la page licence de remotion.dev avant un usage commercial, les conditions peuvent changer. Un freelance seul est en général dans le cas gratuit ; son client, s'il reprend le code et dépasse le seuil, peut avoir besoin de sa propre licence : dites-le-lui (`13-vendre-le-motion.md`).

L'éditeur de Remotion publie aussi ses propres règles pour les agents IA : si elles existent pour votre version, installez-les en complément ; ce skill reste prioritaire pour le style, le rythme et le contrôle.

### HyperFrames

Dépôt officiel : `heygen-com/hyperframes` sur GitHub. Installation indiquée par le dépôt pour les agents : `npx skills add heygen-com/hyperframes`. Vérifiez la commande sur le README avant de la lancer : l'outil est jeune et bouge vite.

Contrat d'une composition HyperFrames (à respecter pour un rendu identique à chaque fois) :
- une seule timeline GSAP en pause, enregistrée pour le moteur de rendu ; les éléments minutés portent leurs attributs de début et de durée ;
- tout est fonction du temps : ni `Date.now()`, ni hasard sans graine, ni transition CSS, ni minuterie, ni appel réseau pendant le rendu ;
- animer `transform` et `opacity`, jamais `top`, `left` ou `letter-spacing` ;
- attendre `document.fonts.ready` avant la première image.

## 5. Structure d'un projet vidéo

```
mon-projet-video/
├── brief.md                 le brief validé (gabarit assets/brief-video.md)
├── script.md                le texte dit, chronométré
├── faits.md                 chaque chiffre, sa source, sa date
├── tableau-de-plans.md      le déroulé plan par plan (gabarit assets/tableau-de-plans.md)
├── rushes/                  sources originales, jamais modifiées
├── audio/                   voix.wav, mots.json (transcription au mot), cartons.json, musique, effets
├── public/                  ce que la composition charge : logos, images, polices, plans de coupe
├── src/                     compositions Remotion (ou index.html pour HyperFrames)
├── rendus/
│   ├── essais/              rendus à 25 %, images fixes
│   └── final/               fichiers livrés, nommés et versionnés
└── controle/                planches, rapport de contrôle
```

Claude crée cette structure au démarrage du projet, après avoir vérifié que le dossier est vide ou qu'il n'écrase rien.

## 6. Polices

- Une police que vous avez le droit d'utiliser en vidéo : Google Fonts (licence OFL, usage commercial libre) ou une police achetée dont la licence couvre la vidéo.
- Fichiers dans `public/fonts/`, chargés avant le rendu (le modèle Remotion montre comment). Une police qui charge en retard donne des images rendues dans la police de secours : le contrôle le voit, mais autant l'éviter.
- Une famille par vidéo. La hiérarchie passe par la graisse et la taille, pas par une deuxième police.
