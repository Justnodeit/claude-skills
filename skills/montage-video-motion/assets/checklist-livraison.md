# Liste de livraison

Projet : <nom> | Version livrée : v<…> | Date : <…>

## Contenu
- [ ] Brief, script, `faits.md` et tableau de plans validés (dates des validations notées).
- [ ] Chaque chiffre, nom et citation à l'écran identique à `faits.md`.
- [ ] Orthographe relue, typographie française, aucun tiret cadratin.
- [ ] Phrase message compréhensible sans le son (test muet sur le rendu final).

## Image
- [ ] Chaque format demandé rendu et recomposé (aucun recadrage).
- [ ] Zones sûres respectées sur chaque format (calque de la plateforme posé sur une image).
- [ ] Première image qui porte déjà le message.
- [ ] Police de la charte chargée sur toutes les images.
- [ ] Planches regardées en entier ; grille de défauts de `references/10-controle-image-par-image.md` sans bloquant.
- [ ] Interdits de `references/11-anti-slop.md` vérifiés.

## Son
- [ ] Voix claire, aucun mot coupé, aucun claquement aux raccords.
- [ ] Musique sous la voix, effets sonores rares et sur les changements d'information.
- [ ] Sonie à la cible (`scripts/sonie.py mesurer`), crête vraie à -1 dBTP au plus.

## Fichier
- [ ] `scripts/controle.py` sans bloquant sur chaque fichier livré.
- [ ] H.264, `yuv420p`, BT.709, démarrage rapide (sauf livraison spéciale demandée).
- [ ] Nommage `<client>_<projet>_<format>_vX.Y`, aucune version déjà envoyée écrasée.
- [ ] `.srt` fourni si utile, miniature si la plateforme la prend.

## Droits
- [ ] Licence de chaque musique, effet, image, police tracée dans `faits.md`.
- [ ] Autorisations écrites des personnes reconnaissables.
- [ ] Mention IA si voix ou image générée ou modifiée par IA (AI Act, article 50) ; mention « Publicité » si contenu rémunéré.
- [ ] Aucune donnée personnelle de tiers visible.

## Après livraison
- [ ] Notes de version écrites.
- [ ] Charte et compositions rangées comme modèles pour la suite.
- [ ] Règles écartées par le client notées dans `client.md`.
