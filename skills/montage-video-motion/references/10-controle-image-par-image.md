# 10. Contrôle image par image

Aucune vidéo ne part sans avoir été regardée en entier, image par image sur les passages animés. Le contrôle se fait en deux étages : des mesures automatiques, puis un regard. Un défaut bloquant arrête la livraison.

## 1. Étage 1 : mesures automatiques

```bash
python3 scripts/controle.py rendus/final/video.mp4 --format 9:16 --sonie -14
```

Le script vérifie et classe en `BLOQUANT`, `A_REGARDER` ou `OK` :

| Contrôle | Bloquant si |
|---|---|
| Taille et format | différents de ceux attendus |
| Codec, échantillonnage | autre chose que H.264 et `yuv420p` (sauf livraison spéciale déclarée) |
| Démarrage rapide | atome `moov` en fin de fichier |
| Images noires | plus de 2 images noires d'affilée, hors fin prévue |
| Images figées | état figé de plus de 1,5 s (à regarder : c'est peut-être voulu) |
| Sonie intégrée | écart de plus de 1 LU avec la cible |
| Crête vraie | au-dessus de -1 dBTP |
| Audio absent ou muet | aucune piste, ou silence complet |
| Durée | hors de la fourchette du brief |

## 2. Étage 2 : planches

```bash
# Vue « téléphone » : une image par seconde, en mosaïque
python3 scripts/planches.py telephone rendus/final/video.mp4 --sortie controle/

# Bande image par image autour d'un instant (une transition, une entrée de titre)
python3 scripts/planches.py bande rendus/final/video.mp4 --t 12.4 --sortie controle/

# Toutes les images d'un passage animé, par bandes de 10
python3 scripts/planches.py passage rendus/final/video.mp4 --debut 0 --fin 3 --sortie controle/
```

Regardez chaque planche en entier (Claude lit les images produites). Pour chaque plan, cochez :

### Grille de défauts

**Bloquants**
- [ ] Texte qui déborde du cadre, entre dans une zone sûre ou touche un bord, même pendant une entrée.
- [ ] Deux éléments qui se chevauchent, ou un élément dans la zone réservée du sous-titre.
- [ ] Sous-titre qui clignote, disparaît une ou deux images, ou change de position.
- [ ] Carton ou mot affiché moins de 0,4 s.
- [ ] Coupe de sous-titre au milieu d'un groupe de sens.
- [ ] Flash, image vide, saut de luminosité brutal.
- [ ] Texte qui apparaît à moitié rendu, saute ou tremble.
- [ ] Police de secours visible (la police de la charte n'était pas chargée).
- [ ] Chiffre, nom ou citation différent de `faits.md`.
- [ ] Faute d'orthographe, nom de marque mal écrit, tiret cadratin.
- [ ] Image qui ne correspond pas à la phrase dite.
- [ ] Animation décalée de plus de 0,4 s du mot qu'elle illustre.
- [ ] Mot coupé, claquement, fragment de voix collé à une coupe.
- [ ] Donnée personnelle visible (nom, e-mail, montant d'un tiers).
- [ ] Élément dont les droits ne sont pas tracés.
- [ ] Un interdit de `11-anti-slop.md`.

**À regarder, puis trancher avec l'utilisateur**
- [ ] État figé de plus de 1 s dans les 15 premières secondes.
- [ ] Plus de trois familles de transitions.
- [ ] Plus de 12 mots à l'écran en même temps.
- [ ] Contenu mal centré dans sa zone.
- [ ] Rythme qui faiblit (plusieurs plans de plus de 3,5 s sans élément neuf).

## 3. Second regard

Celui qui a conçu la vidéo voit ce qu'il a voulu faire, pas ce qui est à l'écran. Dans Claude Code, lancez un sous-agent relecteur qui n'a pas participé à la conception, avec seulement : le brief, `faits.md`, les planches, le rapport de `controle.py`, cette grille et `11-anti-slop.md`. Il rend une liste de défauts avec le numéro d'image ou l'instant de chacun. Sans sous-agent, faites relire par l'utilisateur.

Le test muet se refait sur le rendu final : un regard neuf résume le message en une phrase à partir de la vue « téléphone ».

## 4. Boucle de correction

1. Corriger tous les bloquants relevés, et seulement eux (on ne refait pas ce qui a été validé).
2. Rendre de nouveau les passages touchés, puis la vidéo.
3. Refaire l'étage 1 et les planches des passages corrigés.
4. Trois tours au plus. Au-delà, arrêtez et exposez à l'utilisateur ce qui reste et pourquoi.

## 5. Rapport

`controle/rapport.md` : date, fichier contrôlé, résultat de `controle.py`, défauts relevés et corrigés, défauts acceptés par l'utilisateur (avec sa décision), test muet. Il part avec la livraison si le client le demande.
