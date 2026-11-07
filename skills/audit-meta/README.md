<div align="center">

# audit-meta

**Audit Meta Ads de niveau agence senior, en 1 commande.**

Un skill Claude Code open source qui transforme un compte Meta Ads en rapport HTML interactif multi-onglets, exportable PDF / PowerPoint, **prêt à présenter au CODIR**.

[Démo live](examples/maison-verde-demo/index.html) · [Plugin spec](docs/plugin-spec.md) · [Design system](assets/design-system/README.md)

</div>

---

## En 30 secondes

```
┌──────────────────────────────────────────────────────────────┐
│  /audit-meta act_123456789 --range last_90d --theme nodeit   │
│                                                              │
│  → Setup · Vue globale · Ad sets · Créas · Bench · Recos     │
│  → Export PDF + PPTX                                         │
└──────────────────────────────────────────────────────────────┘
```

## Pourquoi ce skill

Aujourd'hui un audit Meta sérieux coûte 1500 à 5000 € en agence. Les outils tiers (Madgicx, Triple Whale, AdEspresso) sont chers, propriétaires, et leurs templates sont génériques.

**audit-meta** produit en 2 minutes :
- Un **diagnostic opinioné** (pas un dump de métriques) : 6 onglets, exportable
- Un **livrable client-ready** au design soigné, white-labelable
- Un **benchmark sectoriel sourcé** (Meta Business, agences référencées, fallback honnête)
- Des **recommandations stratégiques** générées par sous-agent IA spécialisé media

C'est aussi un **outil de génération de leads** :
- Pour une **agence** : audit gratuit en échange d'un appel = lead qualifié
- Pour un **annonceur** : diagnostic avant appel d'offres, mesure de la performance interne

## Ce que vous obtenez

### 6 onglets, 1 fichier HTML autonome

<table>
<tr>
<td width="50%">

**1. Setup**
Sélection des campagnes, ad sets, plage de dates, granularité (j/sem/mois). État sauvegardé entre les sessions.

**2. Vue globale**
- Courbes superposables : invest · CPM · CPC · fréquence
- Toggle par série, tooltip multi-métrique au hover
- Tableau campagnes avec **toolbox de colonnes** (ajouter/retirer sans casser le layout)

**3. Vue ad sets**
- Perf par ad set, enrichie avec **description audience + optimisation** (pas que le nom)
- Détection des chevauchements d'audience

</td>
<td width="50%">

**4. Vue créas**
- Top performeuses (CTR, ROAS proxy, scroll-stop ratio)
- **Fatigue créa** : flag rouge si frequency > 3 sur 7j
- Hook detection : 3 premières secondes vs reste

**5. Benchmark sectoriel**
- Détection automatique du secteur via URL annonceur
- Comparaison sourcée (Meta, Statista, WordStream, agences référencées)
- Fallback honnête si pas de donnée fiable

**6. Recommandations**
- Top 5 signaux détectés
- Recos stratégiques en cartes priorisées (Impact × Effort)

</td>
</tr>
</table>

### Exports natifs
- **PDF** : pixel-perfect via jsPDF + html2canvas
- **PowerPoint** : slides éditables via PptxGenJS

## Architecture (5 sous-agents)

```
                    ┌─────────────────────┐
                    │  Skill audit-meta   │
                    └──────────┬──────────┘
                               │
        ┌──────────┬───────────┼───────────┬──────────────┐
        │          │           │           │              │
        ▼          ▼           ▼           ▼              ▼
   ┌────────┐ ┌────────┐ ┌─────────┐ ┌───────────┐ ┌──────────────┐
   │  Data  │ │ Media  │ │Benchmark│ │ Designer  │ │ Recommend.   │
   │  Eng.  │ │ Expert │ │Researcher│ │           │ │ Engine       │
   └────┬───┘ └────────┘ └─────────┘ └───────────┘ └──────────────┘
        │
        ▼
   MCP Meta · System User
```

Chaque sous-agent est versionné, testable, et remplaçable indépendamment.

## Install (dev)

```bash
# 1. Cloner le dépôt de skills Node it et copier le skill
git clone https://github.com/Justnodeit/claude-skills.git
cp -r claude-skills/skills/audit-meta ~/.claude/skills/

# 2. Configurer le MCP Meta (System User Token)
# Voir : docs/setup-mcp-meta.md

# 3. Lancer une démo sans MCP
open examples/maison-verde-demo/index.html
```

## Customiser (white-label en 5 min)

```bash
# 1. Dupliquer le theme
cp assets/design-system/theme-nodeit.json assets/design-system/theme-acme.json

# 2. Adapter les couleurs (8 tokens max) et le logo SVG
$EDITOR assets/design-system/theme-acme.json
$EDITOR assets/icons/logo.svg    # SVG — vectoriel, scalable, accessible

# 3. Générer avec le nouveau theme
/audit-meta act_xxx --theme acme
```

Détail complet : [Design system guide](assets/design-system/README.md).

## Roadmap

- [x] v1.0 : 6 onglets, démo Maison Verde, exports PDF/PPTX
- [ ] v1.1 : Onglet "Audience" (overlap, saturation, lookalike health)
- [ ] v1.2 : Onglet "Funnel" (event tracking, attribution)
- [ ] v1.3 : Intégration GA4 cross-source
- [ ] v2.0 : Plugin Claude Code natif avec déploiement Vercel/GitHub Pages

## Contribuer

Ce skill est maintenu par [Node it](https://www.nodeit.fr), organisme de formation en IA certifié Qualiopi.
Issues et PR bienvenues. Voir [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

[MIT](LICENSE) : vous pouvez l'utiliser, le modifier, le rebrander, le revendre.

---

<div align="center">

Built with care by **Node it** · [nodeit.fr](https://www.nodeit.fr)

Pour parler à un humain : [hello@nodeit.fr](mailto:hello@nodeit.fr)

</div>
