# Template PowerPoint (audit-meta)

Déposez ici le fichier `.pptx` de base utilisé pour l'export PowerPoint du rapport.

## Convention de nommage

```
audit-meta-template.pptx        ← template par défaut (Node it)
audit-meta-template-<theme>.pptx ← variante white-label client
```

## Utilisation par le Designer sub-agent

Le sous-agent Designer utilise ce template comme base pour :
1. Injecter les slides générées par PptxGenJS
2. Appliquer les couleurs du thème client (`brand/<theme>.json`)
3. Insérer le logo client (`brand/logos/<client-slug>/logo.svg`)

## Structure des slides générées

| Slide | Contenu |
|-------|---------|
| 1 | Couverture (logo client, compte, période) |
| 2 | KPIs globaux |
| 3 à 4 | Évolution invest/CPM/CPC/fréquence |
| 5 | Top campagnes |
| 6 à 7 | Ad sets (audience + optimisation) |
| 8 | Top créas |
| 9 | Benchmark sectoriel |
| 10 à 11 | Recommandations (top 5 signaux + plan d'actions) |
| 12 | Synthèse exécutive |

## Pour ajouter votre template

1. Créer votre `.pptx` avec master slide aux couleurs de votre agence
2. Le nommer `audit-meta-template-<votre-agence>.pptx`
3. Passer `theme: "<votre-agence>"` en input du skill
4. Le Designer l'utilisera automatiquement comme base

> Si aucun template n'est présent, l'export utilise le style par défaut PptxGenJS
> avec les couleurs du thème JSON actif.
