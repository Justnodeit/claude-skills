# Brand : single source of truth

Tout ce qui définit l'**identité visuelle** d'un rapport audit-meta est concentré ici.
**Un seul fichier `brand/<client>.json` + un seul `brand/logos/<client>.svg` conditionnent l'apparence du HTML, du PDF et du PPTX.**

## Architecture

```
brand/
├── README.md                  ← ce fichier
├── _template.json             ← modèle à dupliquer pour un nouveau client
├── nodeit.json                ← theme par défaut (Node it)
├── <client>.json              ← votre theme client (à créer)
└── logos/
    ├── nodeit.svg
    └── <client>.svg
```

À l'exécution, le sous-agent **Designer** prend `brand/<name>.json` + `brand/logos/<name>.svg` et **génère un seul fichier `brand.js`** dans le dossier de sortie. Ce fichier contient l'objet `window.BRAND_INPUT` qui est lu par `assets/js/brand-loader.js` au démarrage du rapport.

Le `brand-loader.js` se charge ensuite de :
1. **Injecter les CSS variables** dans `:root` → conditionne tout le rendu HTML
2. **Construire `window.BRAND`** : objet propre exposé aux exports
3. **Rasteriser le logo SVG en PNG dataURL** (256×256) pour les exports PDF/PPT qui n'acceptent pas le SVG nativement
4. **Précalculer les hex couleurs sans `#`** pour jsPDF (qui n'accepte pas `#`)

## Workflow white-label en 5 minutes

```bash
# 1. Dupliquer le template
cp brand/_template.json brand/acme.json

# 2. Placer le logo client (SVG vectoriel, viewBox 0 0 32 32 recommandé)
cp ~/Downloads/acme-logo.svg brand/logos/acme.svg

# 3. Éditer brand/acme.json (chercher ⚙️ dans le fichier)
#    - 6 couleurs primaires
#    - typo (optionnel)
#    - brand_name, footer, contact

# 4. Lancer l'audit avec ce theme
/audit-meta act_xxx --brand acme
```

Le rapport généré utilisera **automatiquement** :
- Les couleurs ACME dans tous les composants HTML (boutons, charts, badges, gauges...)
- Le logo ACME dans le header HTML, sur la cover PDF, sur la cover PPTX
- Les couleurs ACME dans les titres et highlights du PDF/PPTX
- Le brand_name + footer ACME dans tous les documents

## Champs `brand/<name>.json`

```json
{
  "name": "Acme Corp",                     // affiché dans header
  "tagline": "Optionnel",                  // sous le logo en cover
  "website": "https://acme.com",
  "contact_email": "contact@acme.com",
  "footer_html": "<strong>Acme</strong> · contact@acme.com",

  "logo": {
    "file": "logos/acme.svg",              // chemin relatif à brand/
    "width": 32,                            // px par défaut header
    "height": 32
  },

  "colors": {
    "primary": "#5B5FEF",                   // accent principal
    "primary-dark": "#4338CA",              // hover/foncé
    "primary-soft": "#EEF0FF",              // backgrounds soft
    "accent": "#10B981",                    // success/positif
    "bg": "#FFFFFF",
    "surface": "#FAFAFB",
    "surface-2": "#F4F4F7",
    "border": "#E5E7EB",
    "text": "#0F172A",
    "text-muted": "#64748B",
    "text-on-primary": "#FFFFFF",

    "dataviz": {                            // 7 couleurs pour les charts
      "series-1": "#5B5FEF",
      "series-2": "#10B981",
      "series-3": "#F59E0B",
      "series-4": "#EC4899",
      "series-5": "#8B5CF6",
      "series-6": "#06B6D4",
      "series-7": "#EF4444"
    },

    "severity": {                           // ne pas modifier sauf raison forte
      "sev-info": "#06B6D4",
      "sev-medium": "#F59E0B",
      "sev-high": "#EF4444",
      "sev-critical": "#B91C1C",
      "sev-success": "#10B981"
    }
  },

  "typography": {
    "display": "'Inter Display', system-ui, sans-serif",
    "body": "'Inter', system-ui, sans-serif",
    "mono": "'JetBrains Mono', monospace",
    "pdf_font": "helvetica",                 // jsPDF built-in : helvetica | times | courier
    "pptx_font": "Inter"                     // nom de famille pour les slides (fallback sur la machine du destinataire)
  }
}
```

## Ce que les exports lisent

### HTML
Le `brand-loader.js` génère des CSS variables :
```css
:root {
  --color-primary: <brand.colors.primary>;
  --color-bg: <brand.colors.bg>;
  ...
  --font-display: <brand.typography.display>;
  ...
}
```

### PDF (`export.js → toPDF`)
Lit `window.BRAND.pdf` :
```js
window.BRAND.pdf = {
  primary_hex: "5B5FEF",        // sans #
  text_hex: "0F172A",
  muted_hex: "64748B",
  font: "helvetica",
  logo_png_data_url: "data:image/png;base64,...",  // rasterisé 256×256
}
```

### PPTX (`export.js → toPPTX`)
Lit `window.BRAND.pptx` :
```js
window.BRAND.pptx = {
  primary_hex: "5B5FEF",
  text_hex: "0F172A",
  muted_hex: "64748B",
  font: "Inter",
  logo_png_data_url: "data:image/png;base64,...",
}
```

## Logo SVG : règles

- **Vectoriel SVG uniquement**, viewBox défini
- `fill="currentColor"` recommandé pour s'adapter à la couleur du theme
- Pas de `<script>` ni d'attributs `on*` (strippés à l'injection)
- Idéalement < 3 kB après minification
- Le SVG doit s'afficher correctement **carré à 32×32 px ET à 256×256 px** (le PDF/PPTX utilise une version 256px)

## Anti-patterns

- ❌ Modifier les couleurs en dur dans `assets/css/main.css` (tout passe par les CSS vars)
- ❌ Hardcoder le logo dans le HTML (toujours via brand.js + brand-loader.js)
- ❌ Mettre des couleurs spécifiques dans `export.js` (toujours via `window.BRAND`)
- ❌ Themes trop dark : la lisibilité de la data prime
- ❌ Modifier `severity.*` sans raison forte (sens universel : rouge = critique)
