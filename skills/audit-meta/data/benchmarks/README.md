# Benchmarks sectoriels (audit-meta)

Banque interne de benchmarks Meta Ads par secteur, utilisée par le sous-agent `benchmark-researcher`.

## Structure

```
benchmarks/
├── _taxonomy.json           # Mapping URL → secteur (utilisé pour la détection auto)
├── _template.json           # Modèle pour ajouter un nouveau secteur
├── retail-grocery-fr.json   # Benchmark retail-grocery France
├── retail-fashion-fr.json   # (à venir)
└── ... (à étendre au fil des audits)
```

## Hiérarchie de fiabilité

Quand le `benchmark-researcher` cherche un benchmark pour une métrique :

1. **Source primaire fiable** (`reliability: high`) : Meta Business, Statista (sample > 1000)
2. **Source secondaire** (`reliability: medium`) : WordStream, Hubspot, agences référencées (Tinuiti, Wpromote)
3. **Bench interne** (`reliability: low`) : Node it sur < 50 comptes, à signaler
4. **Pas de bench** (`reliability: none`) : note explicite, jamais d'invention

## Pour ajouter un secteur

Voir [docs/how-to-customize.md](../../docs/how-to-customize.md) niveau 2.

Workflow :
1. `cp _template.json <my-sector>.json`
2. Remplir les métriques avec sources datées < 24 mois
3. Ajouter l'entrée dans `_taxonomy.json`
4. Si possible, valider sur 1-2 audits clients avant de committer

## Maintenance

Les benchmarks **vieillissent vite** (12-24 mois). Process recommandé :
- **Tous les 6 mois** : rafraîchir les benchmarks des secteurs les plus utilisés (top 3 audits)
- **Annuellement** : passer en revue toutes les sources et flagger celles > 24 mois
- **Sur incident** : si un client conteste un benchmark sourcé, vérifier et mettre à jour

Maintenu par : Node it.
