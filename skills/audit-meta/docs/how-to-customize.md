# How to customize (audit-meta)

Trois niveaux de personnalisation, du plus simple au plus profond.

## Niveau 1 : White-label visuel (5 minutes)

C'est ce que la plupart des agences voudront : changer les couleurs et le logo pour livrer au nom de leur client.

```bash
# 1. Dupliquer le theme
cp assets/design-system/theme-template.json assets/design-system/theme-acme.json

# 2. Adapter les 6 couleurs primaires (cherchez ⚙️ dans le fichier)
$EDITOR assets/design-system/theme-acme.json

# 3. Remplacer le logo (SVG vectoriel, viewBox 0 0 32 32)
cp ~/Downloads/acme-logo.svg assets/icons/logo.svg

# 4. Tester
open examples/maison-verde-demo/index.html
# (en attendant le plugin) ou :
/audit-meta act_xxx --theme acme
```

Détails : [assets/design-system/README.md](../assets/design-system/README.md).

## Niveau 2 : Adapter à un nouveau secteur (30 minutes)

Si vous auditez un compte d'un secteur qui n'a pas encore de bench dans le skill, vous pouvez en ajouter un.

```bash
# 1. Créer le fichier de benchmark sectoriel
cp data/benchmarks/_template.json data/benchmarks/my-sector.json
$EDITOR data/benchmarks/my-sector.json
```

Renseigner :
- 5 à 8 métriques (CPM, CTR, CPC, CVR, frequency, cost per result…)
- Pour chaque métrique : médiane + p25 + p75 + source URL + date + reliability
- Sources fiables uniquement (Meta, WordStream, Statista, agences référencées)
- Si pas de donnée fiable → laisser `reliability: "none"` + une note explicite

```bash
# 2. Ajouter le mapping dans la taxonomie
$EDITOR data/benchmarks/_taxonomy.json
```

Ajouter une entrée :
```json
{
  "sector_key": "my-sector",
  "keywords": ["mot1", "mot2", "mot3"],
  "url_patterns": ["pattern1.com", "*.industry.fr"],
  "display_name": "Mon secteur (FR/EU)"
}
```

Le sous-agent `benchmark-researcher` détectera automatiquement ce secteur sur les nouveaux audits.

## Niveau 3 : Modifier le rapport (1 heure +)

Pour ajouter un nouvel onglet ou modifier une analyse.

### Ajouter un onglet

1. Dans `examples/maison-verde-demo/index.html` (ou `templates/report.html` côté plugin) :
   - Ajouter un bouton dans `.tabs` avec `data-target="panel-my-tab"`
   - Ajouter une `<section class="tabpanel" id="panel-my-tab">` avec le contenu

2. Dans `assets/js/app.js` :
   - Ajouter une fonction `renderMyTab()`
   - L'appeler dans le bloc bootstrap

3. Si l'analyse demande un nouveau sous-agent, le créer dans `agents/`.

### Modifier une heuristique d'analyse

Les heuristiques sont définies dans les sous-agents (`agents/*.md`). Modifier le fichier markdown : c'est le contrat utilisé par Claude pour l'analyse.

Exemple : changer le seuil de fatigue créa.

Avant ([agents/data-engineer.md](../agents/data-engineer.md) section "Enrichissement créas") :
> Si frequency 7 derniers jours > 3 ET CTR a baissé > 20% vs première semaine → `high_fatigue`.

Après :
> Si frequency 7 derniers jours > 4 ET CTR a baissé > 25% → `high_fatigue`.

### Ajouter une métrique au benchmark

1. Dans `agents/benchmark-researcher.md`, ajouter la métrique dans la section "Métriques à bencher".
2. Ajouter les sources fiables identifiées.
3. Mettre à jour `data/benchmarks/<sector>.json` avec les valeurs.

## Niveau 4 : Fork et republication

Si vous voulez maintenir une variante long terme (autre langue, autre marché, autre objectif) :

1. Fork le repo GitHub.
2. Renommer `audit-meta` → `audit-meta-<variant>`.
3. Modifier les CLAUDE.md et SKILL.md pour refléter votre variant.
4. Maintenir un `CHANGELOG.md` qui track les divergences vs upstream.
5. Pull les fixes upstream régulièrement.

Si votre variant est généralisable, **proposez une PR upstream**, on intégrera avec plaisir.

## Niveau 5 : Branchement sur un autre canal (LinkedIn Ads, Google Ads…)

C'est le plus gros chantier. Le skill est conçu Meta-first mais la structure data + sous-agents est neutre.

Pour porter à un autre canal :
1. Remplacer `agents/data-engineer.md` par un équivalent qui fetch depuis l'API du nouveau canal.
2. Adapter le format de `data.js` en gardant le même schéma (campaigns, adsets, ads, timeseries) pour que les autres sous-agents continuent de fonctionner.
3. Adapter les heuristiques du `media-expert` aux spécificités du canal.
4. Créer une nouvelle taxonomie de benchmark (les bench Meta ne sont pas portables tels quels sur LinkedIn).

Travail estimé : 1 à 2 semaines.

## Anti-patterns à éviter

- ❌ Modifier `tokens.json` (c'est le vocabulaire partagé, c'est délibérément stable).
- ❌ Mettre des couleurs ou des valeurs en dur dans le HTML/JS : tout passe par les variables.
- ❌ Mélanger plusieurs canaux dans un même `data.js`. Créer plutôt des skills frères.
- ❌ Réécrire l'analyse dans le plugin. La garder dans les sous-agents (testables, versionnables).
