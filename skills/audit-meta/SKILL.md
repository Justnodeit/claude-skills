---
name: audit-meta
description: "Génère un audit Meta Ads SaaS-grade (compte System User Meta via MCP) en HTML interactif multi-onglets, exportable PDF/PPTX. Couvre setup → vue globale (courbes invest/CPM/CPC/frequency, tableau campagnes) → ad sets → créas → benchmark sectoriel → recommandations IA. Design system overridable (couleurs, logo SVG) pour white-label. Utiliser quand : \"audit Meta\", \"audit Facebook Ads\", \"analyse compte publicitaire Meta\", \"rapport performance Meta Ads\", \"audit pub Meta\", \"review Meta Ads\"."
version: 1.0.0
owner: Node it
status: production
license: MIT
---

# audit-meta : skill d'audit Meta Ads de niveau agence

## Pourquoi ce skill existe

Générer en quelques minutes un **rapport d'audit Meta Ads de niveau agence senior** : pas un dashboard générique, mais une **analyse opinionée et exportable** que le client peut présenter en interne.

Cible :
- **Directions acquisition** (annonceurs) → diagnostic rapide avant un appel d'offres ou un changement de scope agence
- **Agences** → outil de prospection (un audit gratuit = un lead qualifié) et de cadrage de mission
- **Freelances média** → livrable haut de gamme reproductible

## Ce que le skill produit

Un **fichier HTML autonome** (zéro dépendance serveur après génération) avec **5 onglets** :

1. **Vue globale** : courbes investissement + CPM + CPC + fréquence (toggleables, tooltip multi-métrique), tableau campagnes avec colonnes personnalisables
2. **Vue ad sets** : perf par ad set enrichi de la **description d'audience** et de l'**optimisation choisie** (pas seulement le nom)
3. **Vue créas** : top performeuses, fatigue créa, ratio investissement / scroll-stop, hooks détectés
4. **Benchmark** : comparaison sectorielle adaptative (sources fiables : Meta Business, Statista, agences référencées) avec fallback "no data" honnête
5. **Recommandations** : top 5 signaux + recos stratégiques générées par sous-agent IA, formatées en cartes priorisées

Exports : **PDF** (jsPDF + html2canvas) et **PowerPoint** (PptxGenJS via template `assets/template-power-point/`), avec boutons natifs dans le rapport.

## Architecture interne

Le skill orchestre **5 sous-agents** :

| Sous-agent | Fichier | Rôle |
|---|---|---|
| **Data Engineer** | [agents/data-engineer.md](agents/data-engineer.md) | Récupère les données via MCP Meta, normalise, agrège par granularité |
| **Media Expert** | [agents/media-expert.md](agents/media-expert.md) | Analyse perf, détecte signaux (fatigue, gaspillage, scaling opportunities) |
| **Designer** | [agents/designer.md](agents/designer.md) | Garantit le respect du design system, du theming et de l'export print |
| **Benchmark Researcher** | [agents/benchmark-researcher.md](agents/benchmark-researcher.md) | Identifie le secteur, sourcing benchmarks fiables, gère le fallback |
| **Recommendation Engine** | [agents/recommendation-engine.md](agents/recommendation-engine.md) | Produit les 5 signaux + recos en cartes priorisées |

## Flow d'exécution

```
1. Skill invoqué → lit input (account_id, date_range, theme override?)
2. Data Engineer → MCP Meta : pull campagnes/ad sets/ads/insights
3. Media Expert (parallèle) ← Benchmark Researcher → analyse + bench
4. Recommendation Engine → produit JSON de recos
5. Designer → assemble templates + applique theme + injecte data.js
6. Skill produit : examples/<client-slug>/index.html (autonome)
```

## Inputs requis

```yaml
account_id: "act_123456789"        # Compte Meta (System User) — REQUIS
client_slug: "maison-verde"        # Nom dossier output (slugifié auto si absent)
date_range:
  start: "2026-01-01"
  end: "2026-04-30"
granularity: "weekly"              # daily | weekly | monthly
theme: "nodeit"                    # nodeit | path → brand/<name>.json
logo_svg_path: null                # Optionnel : "brand/logos/<client-slug>/logo.svg"
client_url: "https://www.maison-verde.example.com"  # Pour le sourcing benchmark
```

Le skill est en mode **audit de compte uniquement** : toutes les campagnes du compte sont analysées sur la fenêtre demandée. Pour ajouter le logo client, déposer `logo.svg` dans `brand/logos/<client-slug>/` et passer le chemin via `logo_svg_path`.

## Règles d'or (non-négociables)

🔒 **R1 : Périmètre strict.** Les seules données qui apparaissent dans le rapport viennent :
- soit du **compte audité** (campaigns, adsets, ads, insights, pulled via MCP Meta)
- soit du **benchmark sectoriel sourcé** (data/benchmarks/<sector>.json + sources publiques)

Aucune autre source. Pas d'extrapolation. Pas de moyennes inventées.

🔒 **R2 : Exhaustivité 100%.** Le data-engineer DOIT remonter 100% des campagnes/ad sets/ads du compte sur la fenêtre demandée. Pagination Meta Graph API jusqu'à `paging.next == null` + assertion de complétude.

🔒 **R3 : Audit de compte uniquement.** Le skill analyse l'intégralité du compte sur la fenêtre demandée. Toutes les campagnes sont incluses. Les filtres par tag sont disponibles dans le rapport pour affiner la lecture, mais n'affectent pas la collecte de données.

🔒 **R4 : Garde-fou volume.**
Si le compte cible contient un volume > seuil (≥ 1000 ads ou ≥ 100k records), le data-engineer **alerte le plugin AVANT de fetch**. L'utilisateur choisit alors : restreindre la fenêtre, ne garder que les campagnes actives, basculer en mode reporting, ou continuer en sachant que le pull prendra plusieurs minutes. Détail : [agents/data-engineer.md](agents/data-engineer.md) règle R5.

## Output

```
examples/<client-slug>/
  ├── index.html              # rapport interactif autonome (5 onglets)
  ├── data.js                 # données injectées (le plugin peut le régénérer seul)
  ├── theme.css               # tokens design appliqués
  └── assets/ (copiés)
```

## Structure clés du skill

```
audit-meta/
├── assets/
│   ├── css/main.css          # styles du rapport
│   ├── js/app.js             # logique onglets + tableaux + filtres
│   └── template-power-point/ # template .pptx base pour l'export PPTX
├── brand/
│   ├── <theme>.json          # tokens couleurs/typo/footer par thème
│   └── logos/
│       ├── nodeit.svg        # logo Node it (défaut)
│       └── <client-slug>/
│           └── logo.svg      # logo client à déposer ici
└── examples/
    └── maison-verde-demo/    # démo standalone données fictives
```

## Skill-First Protocol (Group)

Avant d'invoquer ce skill, vérifier dans cet ordre :
1. `skills/` : variantes plus génériques (ex. `audit-paid` cross-canal si elle existe)
2. `skills/` : variantes WIP
3. **ce skill** (Insight Skills-Library)

## Design system & theming

Le design est piloté par **tokens** ([assets/design-system/tokens.json](assets/design-system/tokens.json)).

Pour théming client (white-label) :
1. Dupliquer `theme-nodeit.json` → `theme-<client>.json`
2. Adapter les 8 couleurs primaires + le logo SVG
3. Passer `theme: "<client>"` en input du skill

Voir [assets/design-system/README.md](assets/design-system/README.md) pour le guide complet.

## Mise à jour & versionning

Le skill est versionné en sémantique (MAJOR.MINOR.PATCH).
- MAJOR : changement du schéma d'input/output
- MINOR : nouvel onglet, nouvelle métrique
- PATCH : fix design, fix benchmark source

Changelog : voir [docs/CHANGELOG.md](docs/CHANGELOG.md).

## Pour le plugin (étape suivante)

Le skill produit un HTML utilisable tel quel. Le **plugin** Claude Code à construire automatisera :
1. La détection automatique du compte System User Meta connecté via MCP
2. L'appel orchestré aux 5 sous-agents
3. La génération + ouverture du HTML dans le navigateur
4. L'upload optionnel du rapport (S3, Drive, GitHub Pages)

Spec détaillée : [docs/plugin-spec.md](docs/plugin-spec.md).

## Installation

Guide complet par profil (dev/agence, CMO/annonceur, agence white-label + Vercel hosting) :
**[docs/INSTALL.md](docs/INSTALL.md)**.

## Démo

Ouvrir [examples/maison-verde-demo/index.html](examples/maison-verde-demo/index.html) : démo standalone avec données synthétiques Maison Verde (enseigne fictive, retail/grocery).

## License

MIT, voir [LICENSE](LICENSE). Audit reproductible, modifiable, redistribuable.
