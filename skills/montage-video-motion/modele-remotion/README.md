# Modèle Remotion du skill montage-video-motion

Des briques prêtes à copier dans un projet Remotion : préréglages de courbes, de ressorts et de durées, sous-titres au mot, texte construit mot à mot, compteur, attente des polices, et une composition d'exemple rendue dans trois formats depuis le même code.

Vérifié avec Remotion 4 (rendu réel des trois formats et contrôle par `scripts/controle.py` et `scripts/planches.py`, novembre 2026).

## Installer

```bash
npx create-video@latest            # modèle vierge (blank), TypeScript
cd mon-projet
cp ~/.claude/skills/montage-video-motion/modele-remotion/src/*.ts* src/
npx remotion studio                # ouvrir l'exemple : Exemple-9x16, Exemple-4x5, Exemple-16x9
```

Le modèle vierge contient déjà `src/index.ts` et `src/Root.tsx` : la copie les remplace par ceux du modèle (lisez-les avant si vous aviez commencé).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `presets.ts` | La charte (fond, encre, accent, police), les courbes nommées, les ressorts, les durées en secondes, `img()` pour convertir en images, `progression()` bornée, `zoomLog()`, `zoneUtile()` par format, `corps()` pour la taille du texte courant |
| `Polices.tsx` | `usePolices()` : bloque le rendu tant que la police n'est pas chargée |
| `SousTitres.tsx` | Affiche les cartons de `scripts/sous_titres.py` : position S1, mot-clé en graisse et en taille, cartouche S2 en option, construction mot à mot en option |
| `TexteMotAMot.tsx` | Titre ou ligne plein écran construit mot à mot à la voix, mot-clé agrandi, soulignement tracé, variante sèche, lignes équilibrées |
| `Compteur.tsx` | Chiffre qui décélère et finit sur la valeur exacte, chiffres de largeur fixe |
| `Exemple.tsx` | Trois plans (titre, chiffre clé, appel à l'action par le geste) et les sous-titres, placés depuis `zoneUtile()` |
| `Root.tsx` | Une composition par format (9:16, 4:5, 16:9) à 60 i/s, sur le même déroulé |
| `index.ts` | Point d'entrée Remotion |

## Adapter à votre vidéo

1. **Charte** : couleurs et police dans `presets.ts`, nulle part ailleurs. Vérifiez le contraste de l'accent sur le fond.
2. **Police** : installée sur l'ordinateur, ou fichier dans `public/fonts/` déclaré comme indiqué en tête de `Polices.tsx` ; gardez l'appel à `usePolices()` dans la composition principale.
3. **Sous-titres** : générez `audio/cartons.json` avec `scripts/sous_titres.py`, puis dans `Root.tsx` : `import cartons from '../audio/cartons.json';` et `defaultProps={{cartons}}` (ajoutez `"resolveJsonModule": true` au `tsconfig.json` si besoin).
4. **Plans** : un composant par plan du tableau de plans, bornes en secondes dans `PLANS`, mots déclencheurs pris dans la transcription. Un mot qui doit être là dès la première image a `debut: 0`.
5. **Voix et musique** : `<Audio src={staticFile('audio/mix-14.wav')} />` dans la composition (le mixage normalisé de `scripts/sonie.py`).
6. **Formats** : ajoutez ou retirez des entrées dans `formats` de `Root.tsx`. Chaque plan se place par `zoneUtile(width, height)` : ne codez jamais une position en dur pour un seul format.

## Rendre et contrôler

```bash
npx remotion render src/index.ts Exemple-9x16 rendus/final/exemple_9x16_v1.0.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --color-space=bt709
python3 ~/.claude/skills/montage-video-motion/scripts/controle.py rendus/final/exemple_9x16_v1.0.mp4 --format 9:16 --muette
python3 ~/.claude/skills/montage-video-motion/scripts/planches.py telephone rendus/final/exemple_9x16_v1.0.mp4 --sortie controle/
```

`--muette` seulement tant que la vidéo n'a pas de son (l'exemple n'en a pas).

## Données de l'exemple

Les textes, le chiffre « 12 vidéos » et les cartons de `Root.tsx` sont fictifs. Remplacez-les par votre script et par les valeurs sourcées de `faits.md` avant toute diffusion.
