# ⚠️ Déplacé

L'ancien dossier `assets/design-system/` est **déprécié depuis v1.3**.

Toute la configuration brand est maintenant centralisée dans **[/brand/](../../brand/)** au niveau racine du skill.

| Avant (v1.0-1.2) | Maintenant (v1.3+) |
|---|---|
| `assets/design-system/tokens.json` | (intégré dans `brand/<name>.json`) |
| `assets/design-system/theme-nodeit.json` | `brand/nodeit.json` |
| `assets/design-system/theme-template.json` | `brand/_template.json` |
| `assets/icons/logo.svg` (logo brand) | `brand/logos/<name>.svg` |
| `examples/<client>/theme.css` (généré) | `examples/<client>/brand.js` (généré) |

Pourquoi : **un seul fichier `brand/<name>.json` + un seul logo SVG conditionnent maintenant le HTML, le PDF et le PPT** (avant le PDF/PPT utilisaient des couleurs hardcodées).

Voir [brand/README.md](../../brand/README.md) pour le guide complet de theming.
