# 09. Rendu, encodage et déclinaisons

## 1. Formats par plateforme

| Plateforme | Format | Taille | Cadence | Remarques |
|---|---|---|---|---|
| Instagram Reels, TikTok, Shorts YouTube | 9:16 | 1080 x 1920 | 30 ou 60 i/s | zones sûres : `03-storyboard.md`, section 4 |
| Fil LinkedIn, fil Instagram | 4:5 | 1080 x 1350 | 30 ou 60 i/s | version dédiée, jamais un Reel recadré |
| Carré (publicité, fil) | 1:1 | 1080 x 1080 | 30 ou 60 i/s | |
| YouTube, site, présentation | 16:9 | 1920 x 1080 (ou 3840 x 2160) | 25, 30 ou 60 i/s | |

Les limites de durée et de poids changent souvent selon les plateformes : vérifiez-les sur l'aide officielle de chacune au moment de publier.

## 2. Rendre avec Remotion

```bash
# Aperçu image par image dans le navigateur
npx remotion studio

# Une image fixe (planche, miniature)
npx remotion still src/index.ts Reel rendus/essais/plan-03.png --frame=95

# Essai rapide à 25 % de la résolution, sur un passage seulement
npx remotion render src/index.ts Reel rendus/essais/essai.mp4 --scale=0.25 --frames=0-180

# Rendu final, encodage de livraison (section 4)
npx remotion render src/index.ts Reel rendus/final/client_projet_9x16_v1.0.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --color-space=bt709
```

Sans `--pixel-format=yuv420p --color-space=bt709`, Remotion sort par défaut en `yuvj420p` (plage pleine) : certaines plateformes et certains lecteurs affichent alors des couleurs délavées ou trop contrastées. `scripts/controle.py` le signale comme bloquant.

- Itérez toujours à 25 % avant le rendu complet : c'est quatre à huit fois plus rapide.
- Texte très fin : rendre à `--scale=2` puis réduire garde les petits textes nets ; c'est plus lent, à réserver aux vidéos chargées en texte.
- Rendu dans le cloud (Remotion Lambda ou autre) : payant, seulement avec l'accord de l'utilisateur.

## 3. Rendre avec HyperFrames

Suivez le README du dépôt pour la commande de rendu de votre version. Avant chaque rendu complet : vérification de la composition et images fixes à quelques instants clés (les commandes `lint`, `snapshot` et `check` existaient à la rédaction de ce skill), puis contrôle image par image.

## 4. Encodage de livraison

Le fichier livré doit se lire partout, sans surprise de couleur :

| Réglage | Valeur |
|---|---|
| Codec | H.264 (MP4) par défaut ; H.265 ou ProRes seulement si le client le demande |
| Échantillonnage | `yuv420p` |
| Couleurs | BT.709, plage TV (limited) |
| Démarrage rapide | `+faststart` (la vidéo commence à jouer avant d'être entièrement téléchargée) |
| Qualité | CRF 18 (très bonne) à 20 (légère) |
| Audio | AAC, 48 kHz, 192 à 320 kb/s |

Ré-encodage de sécurité avec ffmpeg, si un fichier vient d'ailleurs :

```bash
ffmpeg -i entree.mp4 -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a aac -b:a 256k -ar 48000 -movflags +faststart sortie.mp4
```

Archive ou reprise en postproduction : ProRes 422 HQ (`--codec=prores --prores-profile=hq` dans Remotion).

## 5. Déclinaisons

- Chaque format se rend depuis le même déroulé, avec une mise en page recalculée pour son cadre : textes, interfaces et inserts recomposés, jamais un recadrage du 9:16.
- Dans Remotion, une composition par format qui partage les mêmes scènes ; chaque scène reçoit la largeur et la hauteur et place ses éléments en conséquence (le modèle montre comment avec `useVideoConfig()`).
- La zone sûre du 9:16 se décide dès le tableau de plans.
- Chaque déclinaison passe le contrôle complet, comme une vidéo à part entière.

## 6. Miniature et première image

- La première image porte déjà le message : certaines plateformes l'affichent à la place de la miniature.
- Miniature dédiée si la plateforme la prend : image nette du plan le plus parlant, 3 à 5 mots au plus, visage expressif si la vidéo en a un, aucun texte dans les zones sûres.

## 7. Nommage et versions

`<client>_<projet>_<format>_v<majeure>.<mineure>.<extension>`, par exemple `atelier-dupont_offre-printemps_9x16_v1.2.mp4`.
- Une correction demandée par le client : nouvelle version mineure, nouveau fichier. On n'écrase jamais une version déjà envoyée.
- Un changement de script : nouvelle version majeure.
- Les notes de version (ce qui a changé) vont dans `rendus/final/notes-de-version.md`.
