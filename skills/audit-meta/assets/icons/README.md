# Icons (audit-meta)

## Logo (`logo.svg`)

Le logo principal affiché en haut du rapport.

**Comment le remplacer pour un client :**

Option A, remplacer directement le fichier :
```bash
cp /path/to/client-logo.svg assets/icons/logo.svg
```

Option B, pointer vers un autre fichier dans le theme :
```json
// theme-acme.json
"logo": {
  "svg_path": "../icons/logo-acme.svg"
}
```

**Contraintes SVG :**
- viewBox défini (`viewBox="0 0 32 32"` recommandé)
- `fill="currentColor"` pour s'adapter automatiquement à la couleur du theme
- Pas de `<script>` ni d'attributs `on*` (strippés à l'injection pour des raisons de sécurité)
- < 10 kB après minification (idéalement < 3 kB)

## Sprite d'icônes (`icons.svg`)

Les icônes UI du rapport sont contenues dans un seul fichier SVG en `<symbol>` chargé une fois et référencé via `<use>` :

```html
<svg class="icon"><use href="#i-fire"/></svg>
```

**Icônes disponibles :**

| ID | Usage |
|---|---|
| `#i-setup` | Onglet Setup (engrenage) |
| `#i-globe` | Onglet Vue globale |
| `#i-layers` | Onglet Ad sets |
| `#i-image` | Onglet Créas |
| `#i-chart` | Onglet Benchmark |
| `#i-spark` | Onglet Recommandations |
| `#i-download` | Boutons d'export |
| `#i-fire` | Signal fatigue créa |
| `#i-target` | Signal targeting/audience |
| `#i-warn` | Signal warning |
| `#i-check` | Signal positif |
| `#i-bolt` | Signal quick win |
| `#i-tune` | Toolbox colonnes |
| `#i-eye` / `#i-eye-off` | Toggle visibilité série |
| `#i-clock` | Time-to-value |

**Ajouter une icône :**

1. Choisir un trait cohérent (stroke 1.8px, line-cap round) pour rester homogène.
2. Ajouter un `<symbol id="i-xxx" viewBox="0 0 24 24">…</symbol>` dans `icons.svg`.
3. Documenter ici.

**Sources recommandées pour rester cohérent :** [Lucide Icons](https://lucide.dev), [Phosphor](https://phosphoricons.com), [Tabler](https://tabler-icons.io).

## License

Le logo Node it (`logo.svg`) est propriété de Node it. Les icônes UI (`icons.svg`) sont dérivées de Lucide (ISC License), voir [lucide.dev/license](https://lucide.dev/license).
