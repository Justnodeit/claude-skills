# Demo script (audit-meta)

Comment présenter le skill en **3 minutes** sur LinkedIn / pitch / call commercial.

## Hook (15s)

> "Un audit Meta sérieux coûte 1500 à 5000 € en agence et prend 1 à 2 semaines.
> J'ai construit un skill open source qui le fait en 2 minutes. Voici comment."

→ Montrer le visuel du rapport ouvert sur la **Vue globale** (KPIs animés, courbes).

## Démo (90s)

### 1. Setup (10s)
> "Vous choisissez vos campagnes, vos ad sets, votre fenêtre. Ça prend 5 secondes."
- Cliquer sur l'onglet **Setup**
- Cocher/décocher des campagnes
- Cliquer sur **Appliquer**

### 2. Vue globale (25s)
> "Vous obtenez vos KPIs comparés au trimestre précédent et au benchmark sectoriel,
> et la courbe de tous vos indicateurs sur la période. Survolez."
- Hover sur la courbe → tooltip multi-métrique
- Cliquer sur **Fréquence** dans la légende pour la révéler
- "Et juste en dessous, vos 8 signaux clés."

### 3. Ad sets (15s)
> "Pas seulement le nom : l'audience décrite et l'objectif d'optimisation pour chaque ad set.
> Et un détecteur d'overlap d'audience : vous payez 2× pour les mêmes utilisateurs."
- Pointer la ligne audience description
- Pointer le signal d'overlap 38%

### 4. Créas (20s)
> "Top performers identifiés par score composite CTR × frequency × scroll-stop.
> Et juste à côté, les alertes fatigue créa : freq > 3, CTR -34%, économie potentielle 12k€/mois.
> Bonus : le donut formats : où va votre spend, Reel vs Image vs Carousel."
- Pointer un top performer + un fatigue alert

### 5. Benchmark (10s)
> "Comparaison sectorielle automatique : le skill a détecté retail-grocery-fr avec 94% de confiance,
> et compare à 4 sources fiables datées (Meta, WordStream, Tinuiti, Hubspot)."
- Pointer le secteur détecté + les sources

### 6. Recommandations (10s)
> "Top 5 signaux + 8 recos priorisées par matrice Impact × Effort.
> Tout est exportable en PDF ou PowerPoint, bouton en haut à droite."
- Cliquer **PDF** (ne pas attendre l'export complet)

## CTA (30s)

Trois variantes selon l'audience :

**Variante A : Agence / Freelance :**
> "Le code est sur GitHub, MIT, théméable à votre marque en 5 minutes (8 couleurs + un SVG).
> Forkez-le, branchez-le sur votre CRM, offrez l'audit gratuit en lead magnet.
> Lien dans le premier commentaire."

**Variante B : Annonceur / Direction acquisition :**
> "Vous voulez un diagnostic comme celui-ci sur votre propre compte ?
> Envoyez-moi un message, je le génère pour vous dans la journée. Gratuit pour les 5 premiers."

**Variante C : Recrutement / Communauté tech :**
> "Si vous voulez voir comment c'est construit (5 sous-agents IA spécialisés, MCP Meta,
> Chart.js, exports PDF/PPTX, design system overridable) : tout est documenté dans le repo.
> Star si vous trouvez ça utile."

## Trois screenshots à préparer pour LinkedIn

1. **Vue globale** plein écran avec KPI cards + courbe : capture du wow effect
2. **Recommandations** : zoom sur 2 cartes reco + matrice priorité, qui démontre l'analyse opinionée
3. **Mockup theming** : 3 thumbnails du rapport en theme Node it, theme client A, theme client B, qui démontre le white-label

## Variantes par persona

### Pour Head of Performance agence
- Insister sur **"opinioné"** vs dashboard générique
- Insister sur **gain de temps** par audit (-90%)
- Insister sur la **valeur en lead magnet**

### Pour CMO annonceur
- Insister sur **diagnostic indépendant** (pas d'agence à recommander)
- Insister sur le **benchmark sectoriel** (objectivation)
- Insister sur les **recommandations actionnables** (pas du blabla)

### Pour Tech / Community
- Insister sur l'**architecture** (5 sous-agents, skill-first)
- Insister sur l'**ouverture** (MIT, MCP, modifiable)
- Insister sur la **stack** (Claude Code + skills + plugin pattern)

## Erreurs à éviter en démo

- ❌ Ne pas dire "ça remplace une agence" : ça **dégrossit le travail**, le diagnostic humain reste valuable
- ❌ Ne pas montrer plus de 6 minutes : la concentration baisse
- ❌ Ne pas montrer le `data.js` brut (ennuyeux, technique)
- ❌ Ne pas oublier de mentionner que la **donnée Maison Verde est synthétique** (légal)

## Préparer la session live

Avant la démo :
- [ ] `open examples/maison-verde-demo/index.html` (ou serveur local) : vérifier 6 onglets OK
- [ ] Tester exports PDF + PPTX (parfois > 10s)
- [ ] Préparer un second theme (theme-acme.json) pour montrer le white-label
- [ ] Avoir un MCP Meta connecté avec un compte test pour démo live (optionnel)
