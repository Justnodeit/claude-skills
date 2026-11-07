/* ============================================================
   AUDIT_INSIGHTS — Maison Verde démo
   Produit par Media Expert (sous-agent).
   ============================================================ */

window.AUDIT_INSIGHTS = {
  headline_kpis: [
    { label: 'Investissement total', value: '245 320 €', delta: '+12,3% vs T-1', delta_type: 'neutral', sparkline: [8, 10, 9, 12, 14, 13, 16, 18, 15, 19, 22, 21] },
    { label: 'Impressions', value: '52,4 M', delta: '+8,1% vs T-1', delta_type: 'neutral', sparkline: [12, 14, 13, 16, 15, 18, 17, 19, 21, 20, 22, 24] },
    { label: 'CTR moyen', value: '1,27 %', delta: '+0,18 pt vs bench', delta_type: 'positive', sparkline: [9, 11, 10, 12, 14, 13, 15, 14, 16, 15, 17, 17] },
    { label: 'CPM moyen', value: '4,68 €', delta: '−24% vs bench secteur', delta_type: 'positive', sparkline: [14, 13, 12, 11, 10, 11, 10, 9, 10, 9, 8, 8] },
    { label: 'CPC moyen', value: '0,37 €', delta: 'stable vs T-1', delta_type: 'neutral', sparkline: [11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 11, 11] },
    { label: 'Fréquence moyenne', value: '3,42', delta: '+38% vs bench', delta_type: 'negative', sparkline: [6, 8, 9, 11, 13, 14, 16, 17, 19, 20, 22, 24] },
  ],

  global: {
    summary: '<strong>L\'investissement progresse de 12% sur le trimestre</strong> avec un CPM en baisse (-9%) qui reflète une bonne qualité d\'enchère, mais la <strong>fréquence augmente de 38%</strong> et le CTR commence à se dégrader sur 3 campagnes. <strong>62% du spend est concentré sur 3 ad sets</strong> dont 2 montrent des signaux de fatigue créa marqués. Un potentiel d\'économie de 18-25 k€/mois est identifiable via 4 actions priorisées sous 30 jours.',
    signals: [
      { severity: 'high', category: 'fatigue', title: 'Fatigue créa marquée sur l\'ad set "FR · CRM acheteurs 180j panier >50€"', evidence: 'Frequency 7j = 4,8 · CTR -34% vs S1', impact_estimate: '~7 800 € de spend potentiellement gaspillé / mois', action: 'Renouveler les 3 créas en S+2 ou réduire le budget de 40%' },
      { severity: 'high', category: 'creative', title: 'L\'ad "Reel_DriveDelivery_v1" sature son audience', evidence: 'Freq 7j = 5,2 · CTR à 0,7% (-38% vs S1)', impact_estimate: '~4 200 € restants à couper', action: 'Pause immédiate + remplacement par variante UGC' },
      { severity: 'medium', category: 'budget', title: 'Concentration budget — 62% sur 3 ad sets', evidence: 'as_001, as_003, as_005 = 152 920 € / 245 320 €', action: 'Tester une diversification 70/30 avec 2 nouveaux ad sets sur LAL 2-3%' },
      { severity: 'medium', category: 'targeting', title: 'Chevauchement audience suspect entre 2 ad sets de Brand', evidence: 'as_007 (Cuisine) ∩ as_008 (Éco-conso) ≈ 38% overlap estimé', action: 'Fusionner avec exclusions mutuelles ou unifier en CBO' },
      { severity: 'medium', category: 'structure', title: 'Campagne "Brand awareness" sans plafond de fréquence', evidence: 'Aucun frequency cap configuré → freq monte à 5,2 sur 7j', action: 'Activer frequency cap 2/7j sur c_004' },
      { severity: 'info', category: 'creative', title: 'Format Reel performe x1,8 vs Image sur acquisition', evidence: 'CTR Reel 1,9% vs Image 1,1% sur c_001', action: 'Investir davantage en production Reel (UGC food prioritaire)' },
      { severity: 'info', category: 'tracking', title: 'Pixel Conversion API stable', evidence: 'Match rate Advanced Matching 78% · server-side actif', action: 'RAS — monitorer hebdo' },
      { severity: 'info', category: 'budget', title: 'Recrutement Magasins sous-investi vs potentiel', evidence: 'CPL 24,30 € pour bench 35-50 € (FR retail/HR)', impact_estimate: '+30% volume estimé en doublant le budget', action: 'Tester scale x1,5 avant fin Q2' },
    ],
  },

  adsets: {
    summary: 'Sur 10 ad sets, <strong>3 affichent une efficacité supérieure</strong> (CPR sous médiane compte) — 4 sont à scaler. <strong>2 paires d\'ad sets se chevauchent</strong> au sein de la campagne Brand. L\'optimisation OFFSITE_CONVERSIONS domine (50% des ad sets) et délivre les meilleurs résultats.',
    rankings: {
      best_efficiency: ['as_001', 'as_006', 'as_009'],
      worst_efficiency: ['as_008', 'as_004', 'as_007'],
      best_scale: ['as_001', 'as_005', 'as_003'],
    },
    audience_overlap_warnings: [
      { adset_ids: ['as_007', 'as_008'], overlap_estimated_pct: 38, recommendation: 'Fusionner en un seul ad set CBO avec exclusions mutuelles' },
      { adset_ids: ['as_005', 'as_006'], overlap_estimated_pct: 24, recommendation: 'Acceptable mais à surveiller — exclure as_005 de as_006' },
    ],
  },

  creatives: {
    summary: 'Sur <strong>14 créas actives</strong>, les <strong>Reels UGC food</strong> tirent la performance vers le haut (CTR +85% vs moyenne compte). 3 créas en fatigue critique consomment <strong>12 600 €/mois</strong> sans contribution incrémentale. Le format Reel concentre 38% du spend mais délivre 51% des clics.',
    top_performers: [
      { ad_id: 'ad_001', score: 91, why: 'CTR 2,9% (x2,3 du compte) maintenu sur 8 semaines avec freq < 2,5', format_insight: 'Reel UGC <15s · hook visage cam + texte burned-in' },
      { ad_id: 'ad_004', score: 84, why: 'Carousel recettes — CTR 2,6% stable, freq maîtrisée 2,2', format_insight: 'Carousel 5 slides recettes imprimables' },
      { ad_id: 'ad_002', score: 78, why: 'Static promo hebdo W14 — CTR 2,2% sur 1 semaine, idéal en rotation', format_insight: 'Image carrée avec offre du jour + logo magasin local' },
    ],
    fatigue_alerts: [
      { ad_id: 'ad_003' }, { ad_id: 'ad_008' }, { ad_id: 'ad_007' }, { ad_id: 'ad_012' },
    ],
    format_distribution: {
      'Reel / Vidéo': { count: 6, share_spend: 0.41, avg_ctr: 1.62 },
      'Image': { count: 6, share_spend: 0.43, avg_ctr: 1.04 },
      'Carrousel': { count: 2, share_spend: 0.16, avg_ctr: 1.55 },
    },
    hook_patterns_detected: [
      { pattern: 'Hook visage cam dans les 3 premières secondes', count: 4, lift_ctr: '+62%' },
      { pattern: 'Texte burned-in dès la seconde 1', count: 5, lift_ctr: '+38%' },
      { pattern: 'Mise en scène recette / plat en cours', count: 3, lift_ctr: '+45%' },
    ],
  },
};
