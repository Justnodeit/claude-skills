---
name: seo-geo-expert
description: "Piloter le SEO et le GEO d'un site, quel que soit le CMS : audit technique, analyse des concurrents, recherche de mots-clés, optimisation on-page, SEO local, netlinking et visibilité dans ChatGPT, Perplexity et Gemini. À utiliser quand on parle de « SEO », « GEO », « référencement naturel », « mots-clés », « audit SEO », « backlinks », « Google Business Profile » ou « apparaître dans ChatGPT ». Skill créé par Node it, organisme de formation en IA certifié Qualiopi."
---

# SEO & GEO Expert : skill Node it
> Objectif : permettre à un novice de piloter son SEO/GEO comme un expert, peu importe son CMS, pour gagner des parts de visibilité organique et IA.

---

## 0. QUESTIONS DE CADRAGE (à poser AVANT toute action)

Avant de commencer, Claude doit poser ces questions pour cerner le contexte business :

```
1. Quelle est l'URL de ton site ? (WordPress, Webflow, Shopify, autre ?)
2. Quel est ton activité principale en 1 phrase ? (B2B, B2C, local, e-commerce ?)
3. Qui est ta cible ? (secteur, persona, zone géographique)
4. Quels sont tes 3 principaux concurrents directs ? (URL si possible)
5. Quel est ton objectif SEO prioritaire ? (trafic, leads, notoriété locale, visibilité IA)
6. As-tu déjà Google Search Console et Google Analytics installés ? (oui/non)
7. Quel est ton budget temps estimé par semaine pour le SEO ? (1h / 3h / 5h+)
8. As-tu un blog ou une section contenu existante ? (oui/non)
```

> Ces réponses conditionnent 100% des recommandations. Ne pas sauter cette étape.

---

## 1. AUDIT TECHNIQUE SEO

### 1.1 Outils à utiliser (gratuits/freemium)
| Outil | Usage | URL |
|-------|-------|-----|
| Google Search Console | Indexation, erreurs, mots-clés réels | search.google.com/search-console |
| PageSpeed Insights | Core Web Vitals, vitesse | pagespeed.web.dev |
| Screaming Frog (free) | Crawl complet, broken links, metadata | screamingfrog.co.uk |
| Ahrefs Webmaster Tools (free) | Backlinks, Domain Rating | ahrefs.com/webmaster-tools |
| Schema Markup Validator | Données structurées | validator.schema.org |
| Google Rich Results Test | Test schema | search.google.com/test/rich-results |

### 1.2 Checklist audit technique

**Indexation & crawl**
- [ ] Vérifier robots.txt : aucune page importante bloquée
- [ ] Vérifier sitemap.xml : présent, soumis dans Search Console, sans erreurs
- [ ] Aucune page 404 sur des URLs indexées
- [ ] Pas de contenu dupliqué (balise canonical correcte)
- [ ] HTTPS actif sur toutes les pages (redirection 301 HTTP → HTTPS)
- [ ] Pas de pagination infinie sans rel="next/prev" ou paramètres d'URL crawlés

**Core Web Vitals (Google PageSpeed)**
- [ ] LCP (Largest Contentful Paint) < 2,5s
- [ ] INP (Interaction to Next Paint) < 200ms
- [ ] CLS (Cumulative Layout Shift) < 0,1
- [ ] Score mobile > 70 (prioritaire sur desktop)

**Structure HTML**
- [ ] Un seul H1 par page, contenant le mot-clé principal
- [ ] Hiérarchie H1 > H2 > H3 logique et non sautée
- [ ] Toutes les images ont un attribut `alt` descriptif
- [ ] Balises title uniques sur chaque page (50 à 60 caractères)
- [ ] Meta descriptions uniques (140 à 160 caractères, avec CTA)
- [ ] URL propres, lisibles, sans paramètres superflus

**Par CMS :**

| CMS | Plugin/outil recommandé |
|-----|------------------------|
| WordPress | Rank Math (préféré) ou Yoast SEO |
| Webflow | SEO natif + plugin Schema App ou SEOmatic |
| Shopify | Plugin SEO King ou Plug In SEO |
| Squarespace | SEO natif + audit manuel |
| Custom/autre | Implémentation manuelle via HTML head |

---

## 2. ANALYSE CONCURRENTIELLE

### Protocole en 5 étapes

**Étape 1 : Identifier les vrais concurrents SEO**
> Les concurrents SEO ≠ concurrents business. Un concurrent SEO est celui qui se positionne sur tes mots-clés cibles.

Utiliser : Ahrefs (gratuit), Semrush (essai), ou Google manuel.
Requête type : `site:concurrent.com` + rechercher les pages les mieux positionnées.

**Étape 2 : Analyser leur profil de mots-clés**
- Sur quels mots-clés se positionnent-ils en top 10 ?
- Quelle est leur intention de recherche dominante ? (informationnel, transactionnel, navigationnel)
- Y a-t-il des mots-clés sur lesquels ils sont faibles (<position 10) que tu pourrais prendre ?

**Étape 3 : Analyser leur contenu**
- Quelle est la structure de leurs pages bien classées ? (H1, H2, longueur, format)
- Ont-ils un blog actif ? Quelle fréquence de publication ?
- Utilisent-ils des données chiffrées, des études, des FAQs ?

**Étape 4 : Analyser leur profil de backlinks**
- Via Ahrefs Webmaster Tools : quels sites les citent ?
- Y a-t-il des sources faciles à répliquer (annuaires, presse, partenaires) ?

**Étape 5 : Gap analysis**
Identifier les mots-clés sur lesquels les concurrents se positionnent et toi non → opportunités prioritaires.

---

## 3. RECHERCHE DE MOTS-CLÉS (KEYWORD RESEARCH)

### 3.1 Méthode structurée

**Phase 1 : Seed keywords**
À partir des réponses de cadrage, lister 10 à 15 mots-clés "racines" qui décrivent ton activité.

**Phase 2 : Expansion**
Utiliser ces outils pour générer des variantes :
- Google Autocomplete (taper le mot-clé + espace dans Google)
- "Autres questions posées" dans les SERPs Google
- Google Search Console → Requêtes (mots-clés qui amènent déjà du trafic)
- Answer The Public (answerthepeople.com) : version gratuite limitée
- Ahrefs Keyword Generator (gratuit, 100 mots-clés/jour)

**Phase 3 : Priorisation**
Classer chaque mot-clé selon cette matrice :

| Critère | Poids | Évaluation |
|---------|-------|-----------|
| Volume de recherche | 30% | Haut / Moyen / Faible |
| Difficulté SEO (KD) | 30% | KD < 30 = priorité |
| Intention alignée avec ton offre | 25% | Oui / Partiel / Non |
| Potentiel GEO (question conversationnelle) | 15% | Oui / Non |

**Phase 4 : Mapping**
Assigner chaque mot-clé cible à une page existante ou à créer. Règle : 1 page = 1 intention principale.

### 3.2 Types d'intentions et formats associés

| Intention | Exemple de requête | Format de page recommandé |
|-----------|-------------------|--------------------------|
| Informationnel | "comment faire X" | Article de blog, guide |
| Comparatif | "X vs Y" | Page comparative avec tableau |
| Transactionnel | "acheter X" | Page produit/service |
| Local | "agence X à Paris" | Page locale avec NAP |
| Question IA/GEO | "qu'est-ce que X ?" | FAQ + réponse directe 40 à 80 mots |

---

## 4. OPTIMISATION ON-PAGE

### Template de page optimisée SEO + GEO

```
STRUCTURE RECOMMANDÉE :

[Title tag] : Mot-clé principal + bénéfice (50-60 car.)
[Meta description] : Réponse directe + CTA (140-160 car.)

H1 : Mot-clé principal (unique, une fois)

[QUICK ANSWER — pour GEO/IA]
Bloc 40–80 mots répondant directement à la question principale.
Clair, sans jargon, extractable par les LLMs.

H2 : Sous-thème 1 (mot-clé secondaire)
→ Paragraphes courts (max 120 mots)
→ Listes à puces pour les faits rapides
→ Tableaux comparatifs si pertinents

H2 : Sous-thème 2
...

H2 : FAQ (3–5 questions conversationnelles)
→ Chaque réponse : 40–100 mots max
→ Reprendre les "autres questions posées" Google

[Schema markup] : Article, FAQPage, LocalBusiness selon le type
```

### Règles GEO spécifiques (visibilité dans ChatGPT, Perplexity, Gemini)

- **Earned media** : les IA privilégient massivement les sources tierces (presse, avis, citations) sur le contenu de marque → viser des mentions externes
- **Chunking** : structurer le contenu en blocs de ~800 tokens (≈ 600 mots) indépendants
- **Entités claires** : nommer explicitement les concepts, personnes, lieux (entités nommées)
- **Sources et données** : citer des chiffres sourcés → +41% d'impression GEO selon les études
- **Fraîcheur** : mettre à jour le contenu existant régulièrement (date de dernière modification visible)
- **E-E-A-T** : mentionner l'auteur, son expertise, les sources → signaux de confiance pour les LLMs

---

## 5. SEO LOCAL (si applicable)

### Checklist Google Business Profile
- [ ] Fiche GBP créée et vérifiée
- [ ] Nom, Adresse, Téléphone (NAP) identiques sur TOUS les supports
- [ ] Catégorie principale correcte
- [ ] Photos de qualité (extérieur, intérieur, équipe)
- [ ] Horaires à jour
- [ ] Réponse à tous les avis (positifs et négatifs)
- [ ] Posts GBP publiés régulièrement (1/semaine minimum)

### Pages locales (si plusieurs établissements)
Créer une page dédiée par ville/lieu avec :
- Adresse complète + carte intégrée
- Téléphone local
- Contenu unique (pas copier-coller d'une page à l'autre)
- Schema `LocalBusiness` avec `geo` et `address`
- Avis clients locaux intégrés

---

## 6. STRATÉGIE DE CONTENU

### Calendrier éditorial type (selon budget temps)

| Temps dispo | Cadence recommandée | Type de contenu |
|-------------|---------------------|----------------|
| 1h/semaine | 2 articles/mois | Guides informationnels sur mots-clés à faible KD |
| 3h/semaine | 4 articles/mois | Guides + pages comparatives + FAQ |
| 5h+/semaine | 6 à 8 articles/mois | Pillar pages + cluster content complet |

### Structure Pillar + Cluster (topical authority)

```
PAGE PILLAR (ex: "Guide complet du SEO en 2025")
    ├── Article cluster 1 : "Comment faire un audit SEO technique"
    ├── Article cluster 2 : "Recherche de mots-clés : méthode pas-à-pas"
    ├── Article cluster 3 : "Optimisation on-page : checklist complète"
    └── Article cluster 4 : "Créer des backlinks : stratégies légitimes"
```

Liens internes entre tous les articles du cluster → signal d'autorité thématique fort.

---

## 7. NETLINKING (BACKLINKS)

### Stratégies par niveau de difficulté

**Niveau 1 : Facile (faire en premier)**
- Inscription dans les annuaires métier de référence (Kompass, Pages Jaunes, annuaires sectoriels)
- Profils réseaux sociaux (LinkedIn, YouTube si vidéo, etc.) avec lien vers le site
- Partenaires, fournisseurs, clients : demander un lien sur leur site

**Niveau 2 : Intermédiaire**
- Guest posting sur des blogs du secteur
- Répondre à des journalistes (HARO ou Qwoted)
- Infographies ou études originales → les partager pour obtenir des citations

**Niveau 3 : Avancé**
- Digital PR : communiqués de presse pour obtenir des mentions médias
- Broken link building : trouver des liens morts sur des sites tiers et proposer ton contenu en remplacement

---

## 8. MESURE & REPORTING

### KPIs SEO classiques
| Métrique | Outil | Fréquence |
|----------|-------|-----------|
| Positions moyennes | Search Console | Hebdo |
| Impressions / Clics | Search Console | Hebdo |
| Trafic organique | Google Analytics | Mensuel |
| Pages indexées | Search Console > Couverture | Mensuel |
| Core Web Vitals | PageSpeed / Search Console | Mensuel |
| Domain Rating / Backlinks | Ahrefs | Mensuel |

### KPIs GEO (nouveaux)
| Métrique | Outil | Fréquence |
|----------|-------|-----------|
| Citations dans AI Overview Google | Recherche manuelle cibles mots-clés | Mensuel |
| Mentions dans ChatGPT/Perplexity | Test manuel requêtes clés | Mensuel |
| Part de voix IA vs concurrents | Comparaison manuelle | Trimestriel |

---

## 9. FEUILLE DE ROUTE TYPE (12 SEMAINES)

| Semaine | Action prioritaire |
|---------|-------------------|
| S1 à S2 | Audit technique complet + corrections bloquantes |
| S3 | Keyword research + mapping pages |
| S4 | Optimisation des 5 pages les plus visitées |
| S5 à S6 | Création/mise à jour Google Business Profile + pages locales |
| S7 à S8 | Rédaction des 2 premiers articles pillar |
| S9 à S10 | Netlinking niveau 1 (annuaires, partenaires) |
| S11 à S12 | Cluster content, FAQ GEO, premier bilan + ajustements |

---

## 10. RÈGLES D'OR À RAPPELER À CHAQUE SESSION

1. **1 page = 1 intention = 1 mot-clé principal.** Ne jamais cannibaliser.
2. **Le contenu GEO gagne avec des réponses directes en 40 à 80 mots** en début de page.
3. **Les sources tierces (earned media) dominent dans les IA** : investir dans la PR et les avis.
4. **La vitesse mobile est non-négociable** : PageSpeed mobile > 70 avant tout.
5. **Mettre à jour > créer du nouveau** quand une page existe déjà sur le sujet.
6. **Schema markup = +15% de chances d'apparaître en Rich Result et en AI Overview.**
7. **SEO est un investissement long terme** : les premiers résultats solides arrivent à 3 à 6 mois.
