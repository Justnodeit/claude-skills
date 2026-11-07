# Plugin spec (audit-meta)

Ce document spécifie le **plugin Claude Code** à construire au-dessus du skill audit-meta. Le skill produit déjà un rapport HTML autonome ; le plugin automatise l'orchestration end-to-end et l'ergonomie utilisateur.

## Objectif

Permettre à un utilisateur de Claude Code (agence, freelance, annonceur) de générer un audit Meta Ads en **1 commande** dans son terminal, sans avoir à orchestrer manuellement les 5 sous-agents.

## Commande cible

```bash
# Le plugin expose une slash-command
/audit-meta act_123456789

# Avec options
/audit-meta act_123456789 --range last_90d --theme nodeit --output ~/Desktop
/audit-meta act_123456789 --range 2026-01-01:2026-04-30 --client-url https://acme.com
/audit-meta --account-picker            # mode interactif : liste les comptes accessibles
```

## Flux d'exécution

```
1. Utilisateur tape /audit-meta act_xxx
   ↓
2. Plugin vérifie MCP Meta connecté
   ├─ si non → propose connexion (OAuth System User)
   └─ si oui → continue
   ↓
3. Plugin pull la liste des comptes (ads_get_ad_accounts) et résout act_xxx
   ↓
4. Plugin invoke en parallèle :
   ├─ data-engineer (sous-agent) → produit data.js
   └─ benchmark-researcher (sous-agent) → identifie le secteur (peut commencer en // car n'a besoin que de l'URL et du nom de compte)
   ↓
5. Une fois data.js prêt :
   ├─ media-expert (sous-agent) → produit insights.js
   └─ benchmark-researcher (suite) → produit benchmark.js (utilise media-expert pour identifier les métriques pertinentes)
   ↓
6. Une fois insights + benchmark prêts :
   └─ recommendation-engine (sous-agent) → produit recommendations.js
   ↓
7. designer (sous-agent) assemble :
   ├─ Lit le theme choisi → génère theme.css
   ├─ Copie assets/css + assets/js + assets/icons dans examples/<client-slug>/
   ├─ Copie templates/report.html → index.html
   └─ Injecte les références aux fichiers js produits
   ↓
8. Plugin ouvre le rapport dans le navigateur par défaut
   └─ optionnellement : upload sur S3/GitHub Pages/Drive
```

## Inputs

| Argument | Type | Description | Défaut |
|---|---|---|---|
| `<account_id>` | string | Compte Meta (System User), format `act_xxx` | Aucun (requis) |
| `--range` | string | `last_7d`, `last_30d`, `last_90d`, `last_365d`, ou `YYYY-MM-DD:YYYY-MM-DD` | `last_90d` |
| `--granularity` | string | `daily`, `weekly`, `monthly` | `weekly` |
| `--theme` | string | Nom du theme (cherche dans `assets/design-system/theme-<name>.json`) | `nodeit` |
| `--logo` | string | Chemin vers un SVG override (optionnel) | (utilise le logo du theme) |
| `--client-url` | string | URL annonceur (pour détection sectorielle). Si absent, le plugin essaie de la dériver du nom du compte. | (inféré) |
| `--client-slug` | string | Nom du dossier de sortie | (slugifié depuis le nom de compte) |
| `--output` | string | Répertoire parent où créer le dossier `<client-slug>/` | `examples/` du skill |
| `--no-open` | flag | Ne pas ouvrir le navigateur | `false` |
| `--upload` | string | `none` \| `s3` \| `gh-pages` \| `drive` | `none` |

## Output

```
<output>/<client-slug>/
├── index.html              # Rapport interactif autonome
├── data.js                 # Données brutes Meta
├── insights.js             # Analyse Media Expert
├── benchmark.js            # Benchmark sectoriel
├── recommendations.js      # Recos priorisées
├── theme.css               # Theme appliqué
└── assets/                 # CSS/JS/icons (copiés depuis le skill)
```

## Configuration du plugin

Le plugin déclare dans son `plugin.json` (format Claude Code) :

```json
{
  "name": "audit-meta",
  "version": "1.0.0",
  "description": "Audit Meta Ads SaaS-grade en 1 commande",
  "slash_commands": [
    {
      "name": "audit-meta",
      "description": "Génère un audit Meta Ads",
      "handler": "handler.js"
    }
  ],
  "mcps_required": ["meta-ads"],
  "skills_required": ["audit-meta"],
  "tools_required": ["WebFetch", "WebSearch", "Read", "Write", "Bash"]
}
```

## Étapes d'implémentation (recommandées)

1. **MVP** (1 jour) : commande qui demande le path vers un `data.js` déjà produit, lit `examples/maison-verde-demo/` comme template, génère un nouveau rapport.
2. **MCP integration** (1-2 jours) : connexion MCP Meta, fetch automatique des données, génération `data.js`.
3. **Sub-agents orchestration** (2-3 jours) : appel séquentiel des 5 sous-agents.
4. **Theming** (0,5 jour) : `--theme` argument, copie sélective des assets.
5. **Distribution** (1 jour) : `--upload` pour publier sur S3/GH Pages/Drive.

## Anti-patterns à éviter

- ❌ Implémenter la logique d'audit dans le plugin : ça doit rester dans les sous-agents du skill (testables séparément).
- ❌ Faire dépendre le plugin d'un MCP particulier autre que `meta-ads` : la portabilité prime.
- ❌ Cacher les data.js / insights.js : l'utilisateur doit pouvoir les inspecter et modifier.
- ❌ Bundler les assets dans un seul fichier : la séparation CSS/JS aide au theming et au debug.

## Sécurité

- Le token System User Meta ne doit **jamais** apparaître dans les fichiers générés (ni `data.js`, ni `index.html`).
- Si l'utilisateur active `--upload`, prévenir explicitement que le rapport contiendra le nom du compte et les données agrégées.
- Le plugin doit refuser de publier (S3/Drive/GH Pages) sans confirmation explicite du CEO (Notion task).

## Tests

Le plugin doit avoir des tests qui :
1. Valident que `examples/maison-verde-demo/index.html` se génère correctement (snapshot).
2. Vérifient que chaque sous-agent retourne un JSON conforme à son contrat.
3. Testent les arguments `--range`, `--theme`, `--client-url` avec des cas dégradés.
