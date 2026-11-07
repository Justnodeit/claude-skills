# Changelog (audit-meta)

Le format suit [Keep a Changelog](https://keepachangelog.com/), versions [SemVer](https://semver.org/).

## [1.0.0] : 2026-05-12

### Ajouté
- Skill initial avec 5 sous-agents (data-engineer, media-expert, designer, benchmark-researcher, recommendation-engine)
- 6 onglets HTML : Setup, Vue globale, Ad sets, Créas, Benchmark, Recommandations
- Démo standalone Maison Verde (données synthétiques)
- Exports PDF (jsPDF + html2canvas) et PowerPoint (PptxGenJS)
- Design system thémable (8 couleurs, logo SVG, typo)
- Theme Node it + template white-label
- Banque de benchmarks `retail-grocery-fr` + taxonomie sectorielle
- Documentation : SKILL.md, README, plugin-spec, demo-script, customize, design system README, icons README

### Notes techniques
- Chart.js 4.4.1 (CDN)
- Inter font (rsms.me)
- Cache-busting `?v=1` sur les scripts (à incrémenter à chaque MAJ pour éviter la mise en cache navigateur en dev)

## [Unreleased]

### Roadmap v1.1
- Onglet "Audience" (overlap matrix, saturation, lookalike health)
- Mode dark optionnel
- Multi-langue (EN, ES)

### Roadmap v1.2
- Onglet "Funnel" (event tracking, attribution)
- Intégration GA4 cross-source

### Roadmap v2.0
- Plugin Claude Code natif (cf. [docs/plugin-spec.md](plugin-spec.md))
- Déploiement automatique Vercel / GitHub Pages
- Auto-detection du compte via MCP Meta
