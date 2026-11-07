---
name: figma-expert
description: "Maquetter un site dans Figma avec Claude, de la structure du fichier au handoff : variables et design tokens, text styles, grilles, composants et variantes, auto-layout, maquettes responsive, workflow Claude × Figma via MCP, Dev Mode et prototypage. À utiliser quand on parle de « Figma », « maquette », « design system », « auto-layout », « composants Figma », « design tokens », « prototype » ou « Figma MCP ». Skill créé par Node it, organisme de formation en IA certifié Qualiopi."
---

# SKILL : Expert Maquettage Web · Claude × Figma
> Node it · Dernière mise à jour : avril 2026  
> Pour webdesigners, webdev et fondateurs qui veulent maquetter vite et bien

---

## PHILOSOPHIE

Figma n'est pas un outil de dessin. C'est un **langage partagé entre designers, développeurs et clients**. Une maquette mal structurée coûte plus cher à produire que de refaire le site.

Avec Claude connecté à Figma via MCP, le workflow design-to-code devient bidirectionnel : je lis ta maquette, je génère du code propre, et je peux même créer des frames Figma directement depuis une UI codée. Mais cette puissance ne vaut quelque chose que si **la maquette est construite avec rigueur**.

Ma règle : je ne commence rien dans Figma sans un Design Style validé. Je ne construis aucune page sans avoir organisé les fondations.

---

## ÉTAPE 0. SETUP DU FICHIER FIGMA

### Ce que tu dois faire avant de me partager le fichier

```
□ Créer un compte Figma (le plan gratuit suffit pour débuter)
□ Créer un nouveau fichier Figma Design (pas FigJam)
□ Activer Dev Mode MCP Server :
    Figma Desktop App → Préférences (Cmd+,) → Dev Mode MCP Server → ON
    ⚠️ Toujours utiliser l'app desktop, jamais le navigateur (erreurs de token)
□ Partager le fichier avec moi en accès "Can edit"
□ Ajouter tes polices dans Figma :
    Menu → Resources → Plugins → "Font Changer" ou upload local via Desktop App
□ Créer un projet Claude dédié avec ce fichier et tes brand guidelines
```

### Structure de pages que j'impose dans chaque fichier

```
PAGE 1 : 🎨 Design System
  → Toutes les variables, composants, styles

PAGE 2 : 📐 Wireframes (optionnel, si brief complexe)
  → Zoning rapide, pas de couleurs

PAGE 3 : 🖥️ Desktop (1440px)
  → Toutes les pages au format desktop

PAGE 4 : 📱 Mobile (390px)
  → Versions mobiles de chaque page

PAGE 5 : 🔧 Dev Specs
  → Redlines, annotations, notes pour les devs

PAGE 6 : 🗄️ Archive
  → Versions précédentes, explorations abandonnées
```

> ⚠️ **Règle absolue** : les pages d'archive sont dans leur propre page, jamais mélangées avec les maquettes actives. Un fichier propre = une équipe qui ne se plante pas.

---

## ÉTAPE 1. DESIGN SYSTEM (toujours en premier)

**Rien ne se fait sur les maquettes avant que le Design System soit complet et validé.**

### 1.1 Variables Figma (le nerf de la guerre)

Depuis 2025, les **Variables Figma** remplacent définitivement les Styles. Elles supportent les modes (light/dark), l'aliasing sémantique, et s'exportent directement en tokens CSS/Tailwind.

```
STRUCTURE DE VARIABLES À CRÉER

Collection 1 : PRIMITIVES (les valeurs brutes)
────────────────────────────────────────────
  Colors/
    brand/purple-400   : #826AED
    brand/purple-300   : #A58FF2
    brand/purple-200   : #C4B2F7
    brand/pink-400     : #C879FF
    brand/mint-400     : #CBF7ED
    brand/mint-300     : #E2FBF6
    neutral/900        : #0B0F1A
    neutral/800        : #1A1F2E
    neutral/600        : #3D4556
    neutral/400        : #6B7280
    neutral/200        : #D1D5DB
    neutral/100        : #F3F4F6
    neutral/50         : #FDFFF7
    base/white         : #FFFFFF
    base/black         : #000000
    feedback/success   : #22C55E
    feedback/warning   : #F59E0B
    feedback/error     : #EF4444
    feedback/info      : #3B82F6

Collection 2 : SEMANTIQUES (les tokens métier)
────────────────────────────────────────────
  → Ces variables référencent les primitives
  → Elles changent selon le MODE (Light / Dark)

  MODE LIGHT :
    bg/primary         → neutral/50
    bg/secondary       → neutral/100
    bg/inverse         → neutral/900
    bg/brand           → brand/purple-400
    text/primary       → neutral/900
    text/secondary     → neutral/400
    text/inverse       → base/white
    text/brand         → brand/purple-400
    text/brand-light   → brand/pink-400
    border/default     → neutral/200
    border/strong      → neutral/400
    border/brand       → brand/purple-400

  MODE DARK :
    bg/primary         → neutral/900
    bg/secondary       → neutral/800
    bg/inverse         → neutral/50
    bg/brand           → brand/purple-400
    text/primary       → base/white
    text/secondary     → neutral/400
    text/inverse       → neutral/900
    text/brand         → brand/purple-300
    text/brand-light   → brand/pink-400
    border/default     → neutral/600
    border/strong      → neutral/400
    border/brand       → brand/purple-400

Collection 3 : SPACING (base 4px)
────────────────────────────────────────────
  space/1  : 4px
  space/2  : 8px
  space/3  : 12px
  space/4  : 16px
  space/5  : 20px
  space/6  : 24px
  space/8  : 32px
  space/10 : 40px
  space/12 : 48px
  space/16 : 64px
  space/20 : 80px
  space/24 : 96px
  space/32 : 128px

Collection 4 : RADIUS
────────────────────────────────────────────
  radius/none : 0
  radius/xs   : 2px
  radius/sm   : 4px
  radius/md   : 8px
  radius/lg   : 12px
  radius/xl   : 16px
  radius/2xl  : 24px
  radius/3xl  : 32px
  radius/full : 9999px

Collection 5 : TYPOGRAPHY
────────────────────────────────────────────
  font-size/xs    : 12
  font-size/sm    : 14
  font-size/base  : 16
  font-size/lg    : 18
  font-size/xl    : 20
  font-size/2xl   : 24
  font-size/3xl   : 30
  font-size/4xl   : 36
  font-size/5xl   : 48
  font-size/6xl   : 60
  font-size/7xl   : 72

Collection 6 : SHADOWS
────────────────────────────────────────────
  shadow/xs : 0 1px 2px rgba(0,0,0,0.05)
  shadow/sm : 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
  shadow/md : 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
  shadow/lg : 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
  shadow/xl : 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
  shadow/brand : 0 8px 32px rgba(130,106,237,0.25)
```

> 💡 **Export tokens** : Tokens Studio (plugin Figma gratuit) exporte les variables vers `tokens.json`, puis Style Dictionary les transforme en CSS custom properties ou Tailwind config. Un seul fichier de vérité pour design ET code.

---

### 1.2 Text Styles (à créer sur la page Design System)

```
NOMENCLATURE : [taille]/[weight]

display/2xl   → 72px / Black    (H1 hero, 1 occurrence par page max)
display/xl    → 60px / ExtraBold
display/lg    → 48px / ExtraBold
heading/xl    → 36px / Bold
heading/lg    → 30px / Bold
heading/md    → 24px / SemiBold
heading/sm    → 20px / SemiBold
heading/xs    → 18px / SemiBold
body/xl       → 20px / Regular, LH 1.6
body/lg       → 18px / Regular, LH 1.6
body/md       → 16px / Regular, LH 1.6  ← base
body/sm       → 14px / Regular, LH 1.5
body/xs       → 12px / Regular, LH 1.4
label/lg      → 16px / Medium,  LS +2%
label/md      → 14px / Medium,  LS +2%
label/sm      → 12px / Medium,  LS +5%
mono/md       → 14px / Regular Mono
mono/sm       → 12px / Regular Mono

RÈGLES
  → Line-height : toujours en valeur relative (1.4, 1.6) pas en px
  → Letter-spacing : 0 sur les textes de corps, +2–5% sur les labels uppercase
  → Jamais de styles "one-off" non documentés dans le design system
```

---

### 1.3 Grille & Layout

```
DESKTOP (Frame 1440px)
  Grid type    : Columns
  Count        : 12
  Margin       : 80px
  Gutter       : 24px
  Content max  : 1280px
  Raccourci    : Ctrl+G (toggle grid visibility)

TABLET (Frame 768px)
  Count        : 8
  Margin       : 48px
  Gutter       : 20px

MOBILE (Frame 390px)
  Count        : 4
  Margin       : 16px
  Gutter       : 16px

SECTIONS (hauteurs indicatives)
  Navbar       : 72px (desktop) / 60px (mobile)
  Hero         : 640–800px desktop / 480–600px mobile
  Section body : auto (hug contents)
  Footer       : 280–400px
```

---

### 1.4 Composants à construire avant les maquettes

Construis ces composants une fois, ils s'appliquent partout.

```
FONDATIONS
  □ Color tokens frame (palette visuelle)
  □ Typography scale frame
  □ Spacing scale frame
  □ Shadow scale frame
  □ Grid templates (desktop / tablet / mobile)

ATOMES
  □ Button (Primary / Secondary / Ghost / Danger / Link)
    → États : Default, Hover, Focus, Active, Disabled, Loading
    → Tailles : SM, MD, LG
    → Icône optionnelle : Left icon, Right icon, Icon only
  □ Input (Text / Email / Password / Textarea / Select)
    → États : Default, Focus, Error, Success, Disabled
  □ Checkbox + Radio + Toggle
  □ Badge / Tag / Pill
  □ Avatar (image, initiales, taille SM/MD/LG)
  □ Icon (frame normalisée 24×24px)
  □ Divider (horizontal / vertical)
  □ Spinner / Loader
  □ Tooltip
  □ Breadcrumb

MOLÉCULES
  □ Form field (label + input + message erreur)
  □ Card (Feature / Blog / Testimonial / Product / Team)
  □ Alert / Callout
  □ Modal / Dialog
  □ Dropdown / Menu
  □ Tabs
  □ Accordion
  □ Pagination

ORGANISMES
  □ Navbar (desktop + mobile avec burger)
  □ Footer
  □ Hero section
  □ Feature grid (2-col, 3-col, alternée)
  □ Testimonials (carousel, grid)
  □ CTA section
  □ Pricing cards
  □ FAQ
  □ Blog post list
  □ 404 page
```

---

## ÉTAPE 2. AUTO-LAYOUT : RÈGLES ESSENTIELLES

> Auto-layout = Flexbox en CSS. Si tu comprends l'un, tu comprends l'autre.

### La logique de base

```
DIRECTION
  Horizontal  →  flex-direction: row
  Vertical    →  flex-direction: column
  Wrap        →  flex-wrap: wrap (cartes qui passent à la ligne)

RESIZING (le plus important)
  Fixed       →  width/height figée en px
  Hug         →  width: fit-content (s'adapte au contenu)
  Fill        →  flex: 1 ou flex-grow: 1 (prend l'espace disponible)

RACCOURCI
  Shift+A sur une sélection → auto-layout instantané
```

### Règles que j'applique systématiquement

```
1. TOUT est en Auto-Layout
   → Pas de position absolue sauf exception justifiée (overlay, badge)
   → Un composant sans auto-layout = un composant cassé quand le contenu change

2. BUTTONS : toujours Hug × Hug avec padding fixe
   → Padding horizontal : 16–24px selon la taille
   → Padding vertical   : 8–12px selon la taille
   → ⚠️ Jamais de width fixe sur un bouton (le texte peut changer)

3. CARDS : width Fill dans leur grille, height Hug
   → Toutes les cards d'une même rangée : height fixe via min-height
   → Ou : wrapper en auto-layout vertical avec "align items: stretch"

4. SECTIONS : Vertical auto-layout, padding top/bottom fixe, width Fill
   → Padding section : 96–128px desktop, 64–80px tablet, 48–64px mobile

5. CONTAINERS : width max-width centrée
   → Wrapper : width Fill (1440px frame)
   → Container intérieur : width Fixed = 1280px, centered
   → OU : margin gauche/droite en auto

6. NESTED AUTO-LAYOUT (le pattern clé)
   Page
    └── Section (vertical, padding 96px)
         └── Container (width 1280px, centered)
              └── Grid (horizontal, gap 24px, wrap)
                   └── Card (width Fill = 1/3, vertical, hug height)
                        └── Image (width Fill, height 240px Fixed)
                        └── Content (vertical, padding 24px, hug)
                             └── Tag (hug)
                             └── Title (fill width)
                             └── Body (fill width)
                             └── CTA (hug)
```

### Les erreurs les plus courantes

```
❌ Mélanger position absolue et auto-layout sur le même enfant
   → Un élément est SOIT dans le flux auto-layout, SOIT absolu

❌ Auto-layout sur un groupe (pas un frame)
   → Convertir en frame d'abord (Cmd+Option+G)

❌ Gap entre éléments défini via margin CSS style
   → Dans Figma : toujours via le "gap" de l'auto-layout parent

❌ Padding asymétrique non documenté
   → Si un composant a un padding bizarre : le noter dans une annotation

❌ Fill sur le dernier enfant dans un stack vertical
   → Ça "pousse" tous les autres, résultat souvent inattendu
```

---

## ÉTAPE 3. COMPOSANTS : STRUCTURE AVANCÉE

### Variants vs Component Properties

```
VARIANTS → pour les états visuellement différents
  Exemple : Button Primary / Secondary / Ghost
  Exemple : Input Default / Focus / Error

COMPONENT PROPERTIES → pour les options booléennes et textuelles
  Boolean  → show-icon: true/false, has-badge: true/false
  Text     → label: "Confirmer", placeholder: "Email"
  Instance → leading-icon: [icon-check], [icon-plus], etc.

RÈGLE D'OR
  Variants pour ce qui change VISUELLEMENT de façon significative
  Component Properties pour les petites variations (on/off, texte différent)
  → Un composant bien fait = 1 seul main component, des dizaines d'instances
```

### Naming des variantes (convention que j'impose)

```
Format : Propriété=Valeur, Propriété=Valeur

EXEMPLES CORRECTS
  Type=Primary, Size=MD, State=Default
  Type=Primary, Size=MD, State=Hover
  Type=Ghost,   Size=SM, State=Disabled
  Variant=Feature, Theme=Dark
  Direction=Horizontal, Has Icon=True

EXEMPLES INCORRECTS
  blue button large  ← pas de convention
  button_v2_final    ← nightmare à maintenir
  Default            ← ambigu, quelle propriété ?
```

### Organisation dans le Design System

```
Page 🎨 Design System
  ├── 📌 Cover (titre, auteur, version, date)
  ├── 🎨 Colors (toutes les variables visuelles)
  ├── ✏️ Typography (scale complète)
  ├── 📏 Spacing & Grid
  ├── 🌑 Shadows & Effects
  ├── 🔲 Atoms
  │    ├── Buttons
  │    ├── Inputs
  │    ├── Badges
  │    └── ...
  ├── 🧩 Molecules
  │    ├── Form Fields
  │    ├── Cards
  │    └── ...
  └── 🏗️ Organisms
       ├── Navbar
       ├── Footer
       └── Sections
```

---

## ÉTAPE 4. MAQUETTER UNE PAGE (ma méthode)

### Phase 1 : Zoning (5 min)

```
Avant de penser au pixel, je définis la structure :

Navbar
Hero         → Quel message principal ? Quel CTA ?
Social proof → Logos clients ou stats
Features     → 3 ou 6 colonnes ?
Comment ça marche → steps
Testimonials
CTA
Footer

→ Je fais ce zoning en formes grises (rectangles, pas de couleurs)
→ Je soumets ce zoning pour validation avant de maquetter
```

### Phase 2 : Hi-Fi (la vraie maquette)

```
ORDRE DE CONSTRUCTION D'UNE SECTION
1. Frame de section (1440px width, vertical auto-layout)
2. Padding haut/bas (96px)
3. Container centré (max 1280px)
4. Eyebrow label si besoin
5. Titre (H2)
6. Sous-titre/chapeau
7. CTA(s)
8. Contenu principal (grid, cards, image, etc.)

ORDRE DANS LE LAYER PANEL (convention)
→ Les éléments sont listés de haut en bas comme ils apparaissent visuellement
→ Frame parent : clip content = ON sur les éléments qui dépassent
→ Pas de couche cachée en production sauf si c'est un état alternatif documenté
```

### Phase 3 : Responsive (breakpoints)

```
PROCESSUS
  1. Finir desktop 1440px complètement
  2. Dupliquer la frame
  3. Redimensionner à 768px → ajuster
  4. Redimensionner à 390px → ajuster

AJUSTEMENTS TYPIQUES DESKTOP → MOBILE
  Navigation     : burger menu, logo centré ou gauche
  Hero           : texte centré, image en dessous ou en BG
  Grilles 3-col  : 1 colonne
  Grilles 2-col  : 1 colonne (ou scroll horizontal si cartes)
  Padding        : 96px → 64px → 48px vertical
  Typographie    : H1 60px → 40px → 32px
  Boutons        : width fill sur mobile
  Tables         : scroll horizontal ou version card
  Images         : 16:9 fixes en desktop, recadrage aspect-ratio sur mobile
```

---

## ÉTAPE 5. CLAUDE × FIGMA MCP : LE WORKFLOW 2026

### Setup (une seule fois)

```
PRÉ-REQUIS
  □ Figma Desktop App installée (pas le navigateur)
  □ Plan Figma avec Dev Mode (paid plan ou trial)
  □ Claude connecté via MCP Figma dans les Settings

ACTIVATION
  1. Figma Desktop App → Cmd+, → "Dev Mode MCP Server" → Toggle ON
  2. Dans Claude : Settings → MCP → Figma → Connecter
  3. Fichier Figma ouvert dans l'app desktop
  4. Sélectionner un frame dans Figma avant de prompter Claude

VÉRIFICATION
  → Dans Claude, le tool Figma doit apparaître dans les tools disponibles
  → Tester : "Dis-moi ce que tu vois dans ma sélection Figma actuelle"
```

### Workflow Design → Code (le plus utilisé)

```
ÉTAPE 1 : Dans Figma, sélectionner le composant ou la page à implémenter
ÉTAPE 2 : Dans Claude, prompter avec précision

PROMPTS EFFICACES (exemples)
──────────────────────────────
"Implémente ce composant Card en HTML/CSS en utilisant ma sélection Figma.
Respecte les tokens : couleurs via variables CSS, espacement en rem.
Rends-le responsive (mobile first)."

"Génère le CSS des variables de design depuis mon Design System Figma.
Format : Custom Properties CSS (--color-primary, --space-4, etc.)."

"Génère la config Tailwind (tailwind.config.js) correspondant à mes
variables Figma. Inclus couleurs, typographie, spacing, border-radius."

"Lis cette page Homepage de mon Figma et produis le composant React
correspondant. Utilise les composants shadcn/ui pour les éléments de base."

PROMPTS À ÉVITER
──────────────────────────────
❌ "Fais-moi un site comme mon Figma"  ← trop vague
❌ "Code toutes mes pages"             ← scope trop large
✓  1 composant ou 1 section à la fois, prompt précis
```

### Workflow Code → Canvas (nouveau en 2026)

```
Permet de pousser une UI codée (Claude Code) vers Figma en tant que layers éditables.

USAGE TYPIQUE
  → Tu as prototypé rapidement en code avec Claude
  → Tu veux partager la maquette avec le client dans Figma
  → Tu veux annoter et itérer visuellement avant de finaliser

COMMENT
  Dans Claude Code : "Send this to Figma"
  → Capture le rendu dans le navigateur
  → Reconstruit les layers Figma natifs (frames, auto-layout, textes)
  → Résultat : frame éditable dans ton fichier Figma ouvert

LIMITES ACTUELLES (Avril 2026)
  → Pas un roundtrip parfait : les interactions/états ne se transfèrent pas
  → Les animations ne passent pas
  → Nécessite un Dev ou Full seat Figma
  → Meilleur résultat sur des layouts simples et propres
  → Composants complexes = passer plus de temps en corrections
  → Utilise cette fonctionnalité pour explorer, pas pour livrer
```

### Workflow Tokens : Figma → Code (le plus puissant long terme)

```
PRINCIPE
  Figma Variables = source de vérité unique
  Export → tokens.json via Tokens Studio (plugin)
  CI/CD → Style Dictionary génère CSS, Tailwind, SCSS, Android, iOS

SETUP
  1. Installer "Tokens Studio for Figma" (plugin Figma, gratuit)
  2. Configurer selon tes collections de variables
  3. Exporter vers tokens.json (ou sync GitHub direct)
  4. Style Dictionary transforme en :
     → CSS Custom Properties
     → Tailwind config
     → SCSS variables
     → Swift (iOS) / Compose (Android)

RÉSULTAT
  → Un changement de couleur dans Figma = commit automatique en code
  → Zéro désync entre design et dev
  → Les devs consomment les mêmes noms que les designers utilisent
```

---

## ÉTAPE 6. DEV MODE : LE HANDOFF SANS FRICTION

### Ce que le dev voit en Dev Mode

```
INSPECTION (sans qu'il te pose de questions)
  → Toutes les valeurs : couleur, opacité, taille, position, padding
  → Code CSS/HTML généré automatiquement depuis le composant
  → Variables Figma affichées avec leur nom (pas leur valeur hex)
  → Lien vers les composants de la bibliothèque

BEST PRACTICES pour un handoff propre
  □ Nommer TOUS les layers (jamais "Frame 47" ou "Rectangle 12")
  □ Grouper logiquement (card-header, card-body, card-footer)
  □ Marquer les frames "Ready for Dev" dans le workflow Figma
  □ Ajouter des annotations pour les comportements interactifs
  □ Documenter les états hover/focus sur le layer ou dans une note
```

### Annotations que j'ajoute systématiquement

```
TYPE D'ANNOTATION → QUAND
  Interaction note  → "Au clic : ouvre modal #modal-auth"
  Responsive note   → "Sur mobile : passe en 1 colonne"
  Animation note    → "Fade in 300ms, ease-out, triggered on scroll"
  Copy note         → "Texte dynamique depuis CMS"
  State note        → "Disabled si champ email vide"
  Link note         → "Renvoie vers /dashboard après auth"
```

### Nomenclature des layers (convention que j'impose)

```
FORMAT : type/nom-descriptif

EXEMPLES
  frame/hero-section
  frame/card-testimonial
  group/nav-links
  text/heading-h1
  text/label-form
  img/cover-hero
  icon/arrow-right
  rect/divider
  rect/bg-glow
  btn/cta-primary
  input/email-field

INTERDIT
  Frame 47, Rectangle_2, Group, Untitled, Copy of Card ← à bannir
```

---

## ÉTAPE 7. INTERACTIONS & PROTOTYPAGE FIGMA

### Quand prototyper dans Figma vs coder

```
PROTOTYPER DANS FIGMA (interactions Figma)
  ✓ Présentation client (validation UX sans dev)
  ✓ Flows de navigation (page A → page B → page C)
  ✓ Micro-interactions simples (hover, focus, ouverture modale)
  ✓ Validations UX avant développement

CODER DIRECTEMENT (via Claude)
  ✓ Animations complexes (scroll, parallax, GSAP)
  ✓ Interactions avec données réelles
  ✓ Quand le comportement est difficile à simuler en Figma
  ✓ Prototype fonctionnel > démo statique pour les stakeholders techniques
```

### Interactions utiles en Figma

```
PAGE TRANSITIONS
  → Smart Animate entre deux frames : transitions naturelles
  → Utilisé pour : navigation, ouverture de modales, slide menus

HOVER STATES
  → Variant change sur hover : montrer l'état hover d'un bouton/card
  → Utile pour : valider le feedback visuel avec le client

SCROLL ANCHORING
  → Section de page qui "fixe" pendant le scroll (sticky nav)
  → Dans Figma : position fixe activée sur la navbar frame

OVERLAY
  → Modales, drawers, tooltips
  → Toujours avec background overlay sombre

VARIABLES EN PROTOTYPE (Figma Variables avancé)
  → Simuler des états logiques (panier vide / panier plein)
  → Utile pour des prototypes avec branchements conditionnels
```

---

## ÉTAPE 8. CHECKLIST QUALITÉ AVANT LIVRAISON

### Structure du fichier

```
□ Pages organisées selon la convention (DS, Desktop, Mobile, Dev Specs, Archive)
□ Tous les layers nommés (zéro "Frame 47" ou "Group 3")
□ Auto-layout sur TOUS les composants et frames de layout
□ Aucun élément en position absolue non justifiée
□ Clip content activé sur toutes les frames à overflow caché
□ Toutes les images en format carré ou ratio défini (pas de dimensions arbitraires)
```

### Design System

```
□ Variables créées (primitives + sémantiques + spacing + radius)
□ Modes Light/Dark configurés si nécessaire
□ Text styles documentés et nommés en convention
□ Composants publiés dans la Team Library
□ Zéro valeur codée en dur : tout via variables
□ Tous les états de composants (hover, focus, disabled, loading)
```

### Maquettes

```
□ Desktop 1440px + Mobile 390px pour chaque page
□ Tablet 768px si le brief le nécessite
□ Grille visible et cohérente sur toutes les frames
□ Typographie : hiérarchie claire, 1 seul H1 par page
□ Contraste texte/fond vérifié (ratio WCAG AA minimum)
□ Images en taille réelle (pas des placeholders de 1px)
□ Tous les états vides (liste vide, erreur, loading) designés
□ Touch targets ≥ 44×44px sur tous les éléments interactifs mobiles
```

### Handoff

```
□ Frames "Ready for Dev" marquées
□ Annotations d'interactions ajoutées
□ Variables Figma visibles en Dev Mode (pas des hex codés en dur)
□ Export Tokens Studio configuré ou tokens.json disponible
□ Guide de style page créée et partageable
```

---

## ÉTAPE 9. CE QUE JE FAIS / CE QUE TU FAIS

| Tâche | Claude | Client |
|-------|--------|--------|
| Setup fichier Figma (pages, frames) | ✓ via MCP | Créer le fichier |
| Création des variables Figma | ✓ via MCP | Valider les couleurs/typos |
| Construction des composants | ✓ via MCP | Valider les états |
| Maquettes desktop | ✓ | Retours et validation |
| Maquettes mobile | ✓ | Retours et validation |
| Export tokens → CSS/Tailwind | ✓ | Setup Tokens Studio plugin |
| Dev Mode annotations | ✓ | Partager au dev |
| Code depuis sélection Figma | ✓ via MCP | Sélectionner le bon frame |
| Intégration dans Webflow/code | ✓ | Fournir accès au repo |
| Rédaction des textes du site | Assistance | Validation finale |
| Fourniture des images/assets | Non | ✓ |
| Activation Dev Mode MCP | Non | ✓ (une seule fois) |

---

## RÈGLES D'OR

```
1. JAMAIS de maquette sans Design System
   → Un site sans design tokens = impossible à maintenir après 3 mois

2. JAMAIS de valeur codée en dur
   → #826AED dans un composant = catastrophe au changement de brand

3. JAMAIS de layers non nommés livrés
   → "Frame 47" en Dev Mode = le dev te déteste

4. TOUJOURS auto-layout, jamais de layout manuel
   → Un composant figé = un bug garanti à la première modif de contenu

5. TOUJOURS designer les états d'erreur et les états vides
   → Un formulaire sans état d'erreur n'est pas terminé

6. TOUJOURS valider desktop avant de passer à mobile
   → Travailler dans les deux sens en parallèle = incohérences

7. UN composant dans Figma = UN composant dans le code
   → Si l'équipe dev utilise React/Vue, les composants Figma doivent
     avoir les mêmes noms que les composants code
     → Button.tsx ↔ composant Figma "Button"
     → Card.tsx   ↔ composant Figma "Card"

8. SCOPER les prompts Claude à 1 composant ou 1 section
   → "Génère toutes mes pages" = résultat médiocre
   → "Génère la section Hero depuis ma sélection" = résultat précis
```

---

## RESSOURCES COMPLÉMENTAIRES

```
FIGMA OFFICIEL
  → Figma Learn          : help.figma.com
  → Figma MCP Guide      : help.figma.com/hc/articles/32132100833559
  → Dev Mode             : figma.com/dev-mode

PLUGINS ESSENTIELS
  → Tokens Studio        : export des variables vers code
  → Iconify              : 200k+ icônes vectorielles
  → Unsplash             : images libres directement dans Figma
  → Contrast             : vérificateur WCAG dans Figma
  → Similayer            : select all similar layers (nettoyage)
  → Clean Document       : supprimer les layers orphelins

RÉFÉRENCES DESIGN SYSTEM
  → Material Design 3    : m3.material.io
  → shadcn/ui Figma kit  : ui.shadcn.com (mapping 1:1 avec le code)
  → Tailwind UI          : tailwindui.com
```

---

*Node it · Expert Maquettage Web · Claude × Figma · figma-expert-skill.md · v1.0 · Avril 2026*
