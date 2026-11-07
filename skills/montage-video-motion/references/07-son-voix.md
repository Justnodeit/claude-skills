# 07. Voix, transcription, musique et sonie

Un spectateur pardonne une image moyenne, pas un son mauvais. Et tout le montage se cale sur la voix : on s'en occupe avant d'animer.

## 1. Enregistrer la voix

- Pièce meublée (rideaux, canapé, livres), fenêtres fermées, ventilation coupée. Une penderie pleine de vêtements fait une très bonne cabine.
- Micro à 10 à 20 cm de la bouche, légèrement de côté pour éviter les plosives (p, b). Un micro-cravate ou un micro USB dynamique suffit.
- 48 kHz, 24 bits, mono, en WAV. Niveau : crêtes vers -12 dBFS, jamais au-dessus de -6.
- 5 secondes de silence au début de l'enregistrement : elles servent à mesurer le bruit de fond.
- Une prise par paragraphe. Une erreur : on marque une pause et on reprend la phrase depuis le début (le dérushage le repère, `08-face-camera.md`).
- Voix de synthèse ou voix clonée : seulement avec l'accord de la personne dont c'est la voix, et la mention de l'usage de l'IA (`12-droits-et-conformite.md`). C'est une dépense : l'utilisateur décide.

## 2. Nettoyer la voix

Toujours sur une copie. Chaîne de départ avec ffmpeg, à ajuster à l'oreille :

```bash
ffmpeg -i rushes/voix-brute.wav -af "highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2" -ar 48000 -ac 1 audio/voix.wav
```

- `highpass=f=80` retire les basses inutiles (ronflement, chocs sur la table).
- `afftdn` réduit le souffle. Trop fort, la voix devient métallique : baissez `nf` vers -30 ou retirez le filtre.
- `acompressor` resserre les écarts entre syllabes fortes et faibles.
- Pour un bruit difficile (rue, climatisation), un outil de réduction de bruit dédié fait mieux ; c'est l'utilisateur qui choisit et qui paie s'il est payant.

## 3. Transcrire au mot

```bash
whisper audio/voix.wav --model medium --language fr --word_timestamps True --output_format json --output_dir audio
```

Le fichier `audio/voix.json` contient, segment par segment, chaque mot avec son début et sa fin en secondes. C'est la base de tout :
- les sous-titres (`scripts/sous_titres.py`) ;
- le calage des animations (le mot déclencheur du tableau de plans prend son horodatage ici) ;
- le dérushage d'une vidéo tournée (`08-face-camera.md`).

Vérifiez les noms propres, les marques et les chiffres : Whisper se trompe surtout là. Corrigez dans `cartons.json` et tenez le lexique du projet.

Pour une vidéo avec plusieurs intervenants, Whisper ne sépare pas les voix : signalez les changements de locuteur à la main, ou utilisez un outil de transcription avec séparation des locuteurs (dépense possible, l'utilisateur décide).

## 4. Musique

- Une musique dont la licence couvre l'usage prévu : réseaux sociaux, publicité payante, client, durée. La licence « usage personnel » ne couvre pas la vidéo d'un client. Gardez la preuve de licence dans le projet (`12-droits-et-conformite.md`).
- Jamais un titre du commerce : la vidéo sera coupée ou démonétisée, et c'est une contrefaçon.
- Sous la voix : 18 à 24 dB plus bas que la voix pendant qu'elle parle. La musique peut remonter dans les respirations et à la fin.
- Baisse automatique de la musique sous la voix (ducking) avec ffmpeg :

```bash
ffmpeg -i audio/voix.wav -i audio/musique.wav -filter_complex "[0:a]asplit=2[v1][v2];[1:a]volume=0.3[m];[m][v1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];[v2][md]amix=inputs=2:duration=first:normalize=0[mix]" -map "[mix]" -ar 48000 audio/mix.wav
```

Réglez `volume` sur la musique avant tout : la compression ne remplace pas un bon niveau de départ.

- Un changement de partie peut tomber sur un temps fort de la musique ; un changement de plan ne doit pas forcément le faire. La voix commande, la musique accompagne.

## 5. Effets sonores

- Posés sur un changement d'information, un chiffre qui apparaît, une coupe de partie ou un clic montré à l'écran. Jamais en tapis, jamais à chaque mot, jamais sur chaque transition.
- Repère : un effet toutes les 3 à 6 secondes au plus sur une vidéo vive, beaucoup moins sur une vidéo posée.
- Une petite bibliothèque cohérente (5 à 10 sons : clic, souffle court, impact léger, coche), toujours les mêmes dans une vidéo, sous licence. Les bruitages de dessin animé, les sirènes et les « whoosh » à chaque coupe font bon marché.
- Niveau : un effet ne doit jamais couvrir un mot. Placez-le dans un creux de voix ou 6 à 10 dB sous la voix.

## 6. Sonie

La sonie (en LUFS) mesure le volume perçu sur toute la durée. Les plateformes ramènent les vidéos trop fortes vers leur cible : une vidéo saturée pour « sonner fort » ressort écrasée et pas plus forte.

| Cible | Valeur |
|---|---|
| Sonie intégrée | -14 LUFS par défaut (YouTube, la plupart des réseaux) ; jusqu'à -12 LUFS pour un Reel très dense en voix, jamais au prix d'une saturation |
| Crête vraie | -1 dBTP au plus |
| Plage de sonie (LRA) d'une voix | 4 à 7 LU : la voix reste régulière sans « pomper » |

Mesurer, puis normaliser en deux passes :

```bash
python3 scripts/sonie.py mesurer rendus/essais/video.mp4
python3 scripts/sonie.py normaliser audio/mix.wav audio/mix-14.wav --cible -14 --crete -1
```

La normalisation se fait sur le mixage final, une seule fois, à la toute fin. Si le mixage brut touche déjà 0 dBFS, la saturation est dans le mixage : on baisse les pistes, on ne compte pas sur la normalisation pour réparer.
