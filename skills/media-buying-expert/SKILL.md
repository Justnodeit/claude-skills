---
name: media-buying-expert
description: "Piloter des campagnes Meta Ads de bout en bout : setup du Business Manager, audit du tracking, structure et nomenclature des campagnes, création en masse, stratégie multi-local (POI), audiences, créatifs, budget et enchères. À utiliser quand on parle de « Meta Ads », « Facebook Ads », « media buying », « traffic manager », « campagne publicitaire », « pixel Meta », « Conversions API » ou « campagnes multi-points de vente ». Skill créé par Node it, organisme de formation en IA certifié Qualiopi."
---

# Media Buyer & Traffic Manager Meta Ads : skill Node it
> Objectif : permettre à un novice de connecter Meta, créer des campagnes en masse, gérer le multi-local (POI), configurer le tracking et optimiser les scores d'annonce.

---

## 0. QUESTIONS DE CADRAGE (à poser AVANT toute action)

```
1. Quel est ton objectif business ? (leads, ventes, trafic, notoriété, visites en magasin ?)
2. Quel est ton budget publicitaire mensuel total ? (< 1 000€ / 1–5k / 5–20k / 20k+ ?)
3. Combien as-tu d'établissements/points de vente (POI) ? Si plusieurs : dans quelles villes ?
4. As-tu déjà un compte Meta Business Manager ? (oui/non)
5. As-tu déjà installé le Meta Pixel sur ton site ? (oui/non)
6. Quel CMS/plateforme utilises-tu ? (WordPress, Webflow, Shopify, custom ?)
7. As-tu une liste de clients ou prospects (email, téléphone) ? → Custom Audience possible
8. Ton contenu publicitaire existe-t-il déjà ? (visuels, vidéos, textes) ou à créer ?
```

> Ces réponses déterminent la structure de compte, les budgets par POI, et le setup tracking.

---

## 1. SETUP COMPTE META BUSINESS MANAGER

### 1.1 Structure obligatoire avant de lancer

```
META BUSINESS MANAGER
├── Page Facebook de l'entreprise (obligatoire)
├── Compte publicitaire (1 par entité légale ou par marque)
│   ├── Pixel Meta (1 par domaine)
│   ├── Conversions API (CAPI) — obligatoire en 2025
│   └── Catalogue produits (si e-commerce)
├── Compte Instagram connecté
└── Domaine vérifié (Events Manager > Vérification de domaine)
```

### 1.2 Étapes de création pas-à-pas

1. Aller sur **business.facebook.com** → Créer un compte Business Manager
2. Ajouter la Page Facebook (Paramètres > Pages)
3. Créer ou ajouter un compte publicitaire (Paramètres > Comptes publicitaires)
4. Vérifier le domaine : Business Manager > Sécurité de la marque > Domaines → ajouter une balise meta ou fichier DNS
5. Créer un Pixel : Events Manager > Connecter des sources de données > Web > Pixel Meta
6. Configurer la Conversions API (voir section Tracking ci-dessous)

---

## 2. AUDIT TRACKING (À FAIRE EN PREMIER)

### 2.1 Checklist audit tracking

**Pixel Meta**
- [ ] Pixel installé sur TOUTES les pages du site (header global)
- [ ] Événements standards configurés : `PageView`, `ViewContent`, `Lead`, `Purchase`, `CompleteRegistration`
- [ ] Événements personnalisés si nécessaire (scroll, clic bouton CTA, soumission formulaire)
- [ ] Tester via l'outil "Test des événements" dans Events Manager
- [ ] Extension Chrome "Meta Pixel Helper" : 0 erreur, tous les événements se déclenchent

**Conversions API (CAPI)**
- [ ] CAPI configurée côté serveur (ou via intégration native CMS)
- [ ] Déduplication activée (même `event_id` envoyé par Pixel ET CAPI)
- [ ] Score de qualité des événements > 6/10 dans Events Manager
- [ ] Fenêtre d'attribution définie : 7 jours clic + 1 jour vue (standard 2025)

**Intégrations CAPI par CMS :**

| CMS | Méthode recommandée |
|-----|---------------------|
| WordPress | Plugin "Facebook for WordPress" ou "Conversions API Gateway" |
| Webflow | Via Zapier + Meta CAPI ou Google Tag Manager + server-side |
| Shopify | Intégration native Meta dans Shopify admin (canal Meta) |
| Custom | Implémentation serveur directe via Meta Marketing API |

**Google Tag Manager (si utilisé)**
- [ ] Conteneur GTM bien installé (head + body)
- [ ] Tag Pixel Meta via GTM configuré
- [ ] Variables de couche de données (dataLayer) alimentées par le site

### 2.2 Score de qualité des événements : optimisation

Objectif : score ≥ 7/10 pour chaque événement conversion.

Facteurs qui améliorent le score :
- Correspondance des paramètres clients (email haché, téléphone haché, prénom, ville)
- Redondance CAPI + Pixel avec déduplication propre
- Volume d'événements reçus (min 50 événements/semaine pour sortir de la phase d'apprentissage)

---

## 3. STRUCTURE DE CAMPAGNE META (2025, API v24+)

### 3.1 Architecture standard

```
CAMPAGNE (objectif + budget)
    └── ENSEMBLE DE PUBLICITÉS / AD SET (ciblage + budget par adset si CBO off)
            └── PUBLICITÉ / AD (créatif : visuel + texte + CTA)
```

> Depuis Marketing API v24 (oct. 2025) : utiliser la structure Advantage+ unifiée.
> `smart_promotion_type` est déprécié → les campagnes entrent en mode Advantage+ via 3 leviers :
> **Advantage+ Budget** + **Advantage+ Audience** + **Advantage+ Placement**

### 3.2 Objectifs disponibles (6 en 2025)

| Objectif | Cas d'usage | Enchère recommandée |
|----------|------------|---------------------|
| Notoriété | Lancement marque, ouverture point de vente | CPM |
| Trafic | Drive-to-site, landing page | CPC ou CPM |
| Interaction | Engagement post, messages | CPE |
| Leads | Formulaire natif Meta, landing page leads | CPL / Coût par lead |
| Promotion de l'app | Téléchargements, in-app events | CPI |
| Ventes | E-commerce, retargeting | ROAS / CPA |

### 3.3 Nomenclature obligatoire (naming convention)

```
CAMPAGNE : [MARQUE]_[OBJECTIF]_[FUNNEL]_[DATE]
Ex : NODEIT_LEADS_TOFUMID_2025-04

AD SET : [GEO]_[AUDIENCE]_[FORMAT]
Ex : PARIS_RETARGET90J_VIDEO
Ex : LYON_LOOKALIKE2PC_STATIC

AD : [VISUEL]_[HOOK]_[CTA]_[VERSION]
Ex : VIDEO-15S_TEMOIGNAGE_DEVIS_V1
```

---

## 4. CRÉATION EN MASSE : APPROCHE MULTI-CAMPAGNES

### 4.1 Workflow de création en masse (sans code)

**Étape 1 : Préparer un template CSV**
Meta Ads Manager permet l'import en masse via fichier CSV (Créer des publicités > Import).

Structure CSV minimale :
```
campaign_name | objective | ad_set_name | budget_daily | geo | audience_type | ad_name | creative_id | headline | description | cta
```

**Étape 2 : Utiliser les règles automatisées**
Dans Ads Manager : Outils > Règles automatisées
- Règle pause si CPL > seuil défini
- Règle augmentation budget si ROAS > objectif
- Règle alerte si fréquence > 3

**Étape 3 : Pour les agences / volumes importants : Marketing API**

La Meta Marketing API (basée sur Graph API) permet :
- Création programmatique de campagnes, ad sets, ads
- Déploiement depuis un fichier de config (JSON/CSV)
- Gestion de plusieurs comptes clients depuis une seule app

Endpoint principal :
```
POST https://graph.facebook.com/v19.0/act_{ad_account_id}/campaigns
```

Paramètres clés :
```json
{
  "name": "Nom campagne",
  "objective": "OUTCOME_LEADS",
  "status": "PAUSED",
  "special_ad_categories": [],
  "daily_budget": 5000,
  "bid_strategy": "LOWEST_COST_WITHOUT_CAP"
}
```

> ⚠️ Toujours créer en statut `PAUSED` lors des tests → activer manuellement après vérification.

---

## 5. STRATÉGIE MULTI-LOCAL (POI, Points of Interest)

> Cas d'usage : une marque avec N établissements veut lancer une campagne unique mais avec un budget et des créatifs adaptés par point de vente.

### 5.1 Principe de structure multi-local

```
CAMPAGNE NATIONALE (objectif)
    ├── AD SET — Paris 75 — Budget : 80€/j
    │       └── Ad : visuel Paris + adresse Paris + CTA "Itinéraire"
    ├── AD SET — Lyon 69 — Budget : 40€/j
    │       └── Ad : visuel Lyon + adresse Lyon + CTA "Itinéraire"
    ├── AD SET — Bordeaux 33 — Budget : 30€/j
    │       └── Ad : visuel Bordeaux + adresse Bordeaux + CTA "Itinéraire"
    └── AD SET — Marseille 13 — Budget : 50€/j
            └── Ad : visuel Marseille + adresse Marseille + CTA "Itinéraire"
```

**Règle budget par POI :** proportionnel à la population de la zone de chalandise OU au chiffre d'affaires historique du point de vente.

### 5.2 Ciblage géographique par POI

Options Meta disponibles :
- **Rayon autour d'une adresse** : 1 à 80 km (recommandé : 5 à 15 km selon densité urbaine)
- **Code postal** : ciblage précis sur zone de chalandise
- **Ville** : option large, à éviter si les POI sont proches
- **Personnes vivant dans la zone** / **Personnes récemment dans la zone** / **Personnes voyageant dans la zone**

> Pour les points de vente physiques : utiliser **"Personnes vivant dans la zone"** + **"Personnes récemment dans la zone"** pour maximiser la pertinence.

### 5.3 Personnalisation des créatifs par POI

**Variables de personnalisation dynamique :**
- Adresse du magasin
- Téléphone local
- Nom de la ville dans le texte de l'annonce
- Offre ou événement local spécifique
- Photo de l'établissement local

**Méthode Ads Manager standard :**
Créer un ad set par POI, dupliquer le créatif, modifier uniquement les éléments locaux.

**Méthode scalable (API ou outil tiers) :**
Utiliser un tableau de mapping :
```
POI_ID | ville | adresse | tel | budget_quotidien | rayon_km | image_id | headline_local
P001   | Paris | 12 rue… | 01… | 80               | 5        | IMG_001  | "Notre agence Paris..."
P002   | Lyon  | 5 bd…   | 04… | 40               | 8        | IMG_002  | "Notre agence Lyon..."
```
→ Boucle de création API sur ce tableau.

### 5.4 Objectif Store Traffic (visites en magasin)

Pour mesurer l'impact réel en point de vente :
1. Ajouter les emplacements physiques dans Meta Business Manager > Emplacements
2. Sélectionner l'objectif **"Trafic en magasin"** (Store Traffic)
3. Activer les "extensions de lieu" pour afficher adresse + horaires + CTA "Itinéraire"
4. Activer le suivi des visites en magasin (nécessite validation Meta + volume suffisant)

---

## 6. CIBLAGE D'AUDIENCE

### 6.1 Hiérarchie des audiences (du plus froid au plus chaud)

```
COLD (prospection)
    ├── Advantage+ Audience (laisser Meta optimiser — recommandé 2025)
    ├── Lookalike 1–3% sur base clients
    └── Centres d'intérêt larges (depuis mars 2025 : exclusions détaillées supprimées)

WARM (considération)
    ├── Visiteurs site web 30–60 jours (Pixel)
    ├── Engagement vidéo 50–75%
    └── Ouvertures formulaire Lead non soumis

HOT (conversion / retargeting)
    ├── Visiteurs page produit/service sans conversion (14–30 jours)
    ├── Abandons panier (e-commerce)
    └── Custom Audience : liste clients CRM (email/tel hashés)
```

### 6.2 Création Custom Audience

1. Ads Manager > Audiences > Créer une audience > Audience personnalisée
2. Source : Site web (Pixel) / Liste de clients (CSV) / Activité sur Facebook/Instagram
3. Pour une liste clients : uploader CSV avec colonnes email, phone, first_name, last_name, city → Meta hashe automatiquement
4. Taux de correspondance cible : > 50% (si < 30%, enrichir la liste)

### 6.3 Création Lookalike

1. Depuis une Custom Audience de qualité (min 500 personnes, idéal 1000+)
2. Sélectionner pays cible
3. Taille : 1% (plus précis) → 3% (plus large) → ne pas dépasser 5%
4. Créer des audiences Lookalike par pays si multi-pays

---

## 7. CRÉATIFS & FORMATS PUBLICITAIRES

### 7.1 Formats recommandés par objectif (2025)

| Format | Objectif idéal | Durée/spec |
|--------|---------------|-----------|
| Vidéo courte (Reels) | Notoriété, trafic | 6 à 15s, 9:16, sous-titres obligatoires |
| Vidéo longue | Leads, considération | 30 à 60s, 1:1 ou 4:5 |
| Image statique | Retargeting, offre directe | 1080×1080 ou 1080×1350 |
| Carrousel | E-commerce, multi-produits | 2 à 10 cartes, 1:1 |
| Collection | E-commerce mobile | Image cover + catalogue |
| Formulaire Lead natif | Lead gen | Instantané, sans quitter Meta |

### 7.2 Règles créatives anti-fatigue

- **Fréquence cible** : < 3 pour les audiences froides, < 5 pour le retargeting
- **Rotation créatifs** : renouveler au moins 30% des créatifs tous les 14 jours
- **Test minimum** : 3 accroches (hooks) × 2 visuels = 6 variantes par ad set
- **Hook rule** : les 3 premières secondes d'une vidéo déterminent 80% de la performance

### 7.3 Score de pertinence des annonces (Quality Ranking)

Meta attribue 3 scores secondaires (visibles dans Ads Manager > colonnes à personnaliser) :
- **Quality Ranking** : qualité vs annonces concurrentes (cible : Au-dessus de la moyenne)
- **Engagement Rate Ranking** : taux d'engagement attendu (cible : Au-dessus de la moyenne)
- **Conversion Rate Ranking** : taux de conversion attendu (cible : Au-dessus de la moyenne)

Actions pour améliorer ces scores :
- Meilleure adéquation créatif ↔ audience (personnalisation locale si multi-POI)
- Améliorer la landing page (vitesse + clarté de l'offre)
- Couper les annonces avec score "Sous la moyenne" après 500+ impressions
- Favoriser les contenus natifs (format vertical, ton non-commercial)

---

## 8. BUDGET & ENCHÈRES

### 8.1 Stratégies d'enchères selon le contexte

| Stratégie | Quand l'utiliser | Risque |
|-----------|-----------------|--------|
| Coût le plus bas (auto) | Démarrage, phase apprentissage | Volume mais CPA variable |
| Plafond de coût | Objectif CPA strict défini | Peut limiter la diffusion |
| ROAS cible | E-commerce avec données suffisantes | Nécessite historique conversion |
| Valeur maximale | Optimiser sur valeur d'achat | Nécessite events `Purchase` avec valeur |

### 8.2 Règle de budget par phase

```
PHASE APPRENTISSAGE (7–14 premiers jours)
  → Budget suffisant pour atteindre 50 conversions/semaine par ad set
  → Formule : Budget quotidien ≥ CPA cible × 10 / 7
  → Exemple : CPA cible 10€ → budget min 14€/jour

PHASE SCALE (après apprentissage)
  → Augmenter le budget de 20–30% max tous les 3–4 jours
  → Au-delà : risque de relancer la phase d'apprentissage
```

### 8.3 Répartition budget multi-POI

| Méthode | Description |
|---------|-------------|
| Budget égal | Même budget pour chaque POI : simple, pour test initial |
| Prorata population | Budget × (population zone POI / population totale) |
| Prorata CA historique | Budget × (CA POI / CA total réseau) |
| CBO (Campaign Budget Optimization) | Laisser Meta répartir, mais perd le contrôle par POI |

> **Recommandation Node it** : utiliser le budget au niveau ad set (pas CBO) pour garder le contrôle par POI, surtout en démarrage.

---

## 9. MESURE & OPTIMISATION

### 9.1 KPIs à suivre par objectif

| Objectif | KPI principal | KPIs secondaires |
|----------|--------------|-----------------|
| Leads | CPL (Coût par Lead) | Taux de conversion landing page, qualité leads |
| Ventes | ROAS, CPA | Panier moyen, LTV |
| Trafic | CPC, CTR | Taux de rebond, temps sur site |
| Store Traffic | Coût par visite en magasin | Portée locale, fréquence |
| Notoriété | CPM, Reach | Fréquence, Brand Lift |

### 9.2 Tableau de bord minimum

Colonnes à activer dans Ads Manager :
`Résultats | Coût par résultat | Portée | Impressions | CTR | CPC | Dépenses | ROAS | Fréquence | Score qualité`

### 9.3 Règles d'optimisation hebdomadaire

**Chaque semaine :**
1. Couper les ads avec CPL > 2× l'objectif après 1 000+ impressions
2. Augmenter le budget (+20%) sur les ad sets qui performent sous l'objectif CPA
3. Renouveler les créatifs avec fréquence > 3 sur audiences froides
4. Vérifier le score de qualité des événements dans Events Manager

**Chaque mois :**
1. Rafraîchir les audiences personnalisées (recalculer les fenêtres)
2. Tester une nouvelle audience (lookalike ou intérêt)
3. Analyser les résultats par POI → réallouer les budgets
4. Revoir la landing page si taux de conversion < 5% (leads)

---

## 10. FEUILLE DE ROUTE TYPE (LANCEMENT EN 4 SEMAINES)

| Semaine | Actions |
|---------|---------|
| **S1** | Setup Business Manager + vérification domaine + installation Pixel + CAPI |
| **S2** | Création Custom Audiences (site, liste CRM) + Lookalike + créatifs (3 hooks × 2 visuels) |
| **S3** | Lancement campagne test (budget min, statut PAUSED → validation → activation) + naming convention appliqué |
| **S4** | Analyse phase apprentissage + optimisation + lancement multi-POI si applicable |

---

## 11. RESSOURCES OFFICIELLES META

| Ressource | URL |
|-----------|-----|
| Documentation Marketing API | developers.facebook.com/docs/marketing-api |
| Events Manager (Pixel + CAPI) | business.facebook.com/events_manager |
| Ads Manager | adsmanager.facebook.com |
| Meta Blueprint (formation gratuite) | facebook.com/business/learn |
| API Graph Explorer (test) | developers.facebook.com/tools/explorer |
| Changelog API (versions) | developers.facebook.com/docs/graph-api/changelog |

> ⚠️ **Note de version critique** : Marketing API v25.0 (Q1 2026) déprécie les anciennes structures ASC/AAC. Utiliser exclusivement la structure Advantage+ unifiée via les 3 leviers (Budget / Audience / Placement).
