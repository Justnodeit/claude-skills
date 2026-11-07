/* ============================================================
   AUDIT_BENCHMARK — Maison Verde démo
   Produit par Benchmark Researcher (sous-agent).
   Sources mockées pour la démo — un vrai run du sous-agent
   ferait WebFetch sur les sources réelles.
   ============================================================ */

window.AUDIT_BENCHMARK = {
  detection: {
    client_url: 'https://www.maison-verde.example.com',
    detected_sector: 'retail-grocery-fr',
    confidence: 0.94,
    keywords_matched: ['drive', 'magasin', 'supermarché', 'recettes', 'coopérative'],
    method: 'url_scrape + meta_account_name',
  },

  metrics: [
    {
      key: 'cpm', label: 'CPM', unit: '€',
      account_value: 4.68,
      benchmark: {
        median: 6.20, p25: 4.80, p75: 8.10,
        source: 'Meta Business Reports — Retail FY2025',
        source_url: 'https://business.facebook.com/business/insights',
        source_date: '2025-Q4',
        sample_size: '1 240 advertisers FR retail',
        reliability: 'high',
      },
      verdict: 'best',
      verdict_text: 'Vous payez 24% moins cher que la médiane retail FR. Très bon signal sur la qualité des créas et la précision du ciblage. À périmètre constant, le levier d\'optimisation CPM est saturé.',
    },
    {
      key: 'ctr', label: 'CTR', unit: '%',
      account_value: 1.27,
      benchmark: {
        median: 1.05, p25: 0.78, p75: 1.42,
        source: 'WordStream Industry Benchmarks 2025',
        source_url: 'https://www.wordstream.com/blog/facebook-advertising-benchmarks',
        source_date: '2025-09',
        sample_size: 'Retail global ~17 000 advertisers',
        reliability: 'medium',
      },
      verdict: 'above_median',
      verdict_text: 'CTR 21% au-dessus de la médiane — vos hooks créa et votre ciblage fonctionnent bien. Marge de progression vers le top quartile (1,42%) via les patterns UGC food détectés.',
    },
    {
      key: 'cpc', label: 'CPC', unit: '€',
      account_value: 0.37,
      benchmark: {
        median: 0.52, p25: 0.34, p75: 0.78,
        source: 'WordStream Industry Benchmarks 2025',
        source_url: 'https://www.wordstream.com/blog/facebook-advertising-benchmarks',
        source_date: '2025-09',
        reliability: 'medium',
      },
      verdict: 'best',
      verdict_text: 'CPC dans le top quartile. Combinaison gagnante CPM bas × CTR élevé. Continuer la R&D créa pour maintenir.',
    },
    {
      key: 'frequency', label: 'Fréquence (7j)', unit: '',
      account_value: 3.42,
      benchmark: {
        median: 2.10, p25: 1.60, p75: 2.80,
        source: 'Tinuiti Q4 2025 Paid Social Report',
        source_url: 'https://tinuiti.com/blog/paid-social/',
        source_date: '2025-Q4',
        reliability: 'medium',
      },
      verdict: 'worst',
      verdict_text: 'Fréquence supérieure de 63% à la médiane. C\'est le principal axe d\'amélioration — corrèle directement avec les signaux de fatigue créa détectés. Activer frequency cap + diversifier les pools d\'audience.',
    },
    {
      key: 'cvr', label: 'Conversion rate', unit: '%',
      account_value: 2.28,
      benchmark: {
        median: 1.85, p25: 1.20, p75: 2.65,
        source: 'Hubspot Marketing Benchmarks 2025',
        source_url: 'https://www.hubspot.com/marketing-statistics',
        source_date: '2025-10',
        reliability: 'medium',
      },
      verdict: 'above_median',
      verdict_text: 'CVR au-dessus de la médiane retail. La landing Maison Verde Drive convertit bien. Tester variants A/B sur le tunnel pour atteindre le top quartile.',
    },
    {
      key: 'thumbstop_ratio', label: 'Thumbstop ratio (vidéo Reels)', unit: '',
      account_value: 0.18,
      benchmark: {
        reliability: 'none',
        note: 'Aucune source publique fiable sur le thumbstop par secteur en 2026. Bench interne Node it (12 comptes retail FR audités sur 2024-2025) : 0,15 médian, 0,21 top quartile. À interpréter avec prudence — bench non statistiquement représentatif.',
      },
      verdict: null,
    },
  ],

  summary: 'Le compte performe <strong>nettement au-dessus de la médiane retail-grocery FR sur 4 métriques sur 5 sourcées</strong> (CPM, CTR, CPC, CVR). <strong>Faiblesse unique mais structurante : fréquence +63% vs médiane</strong>, à corréler directement avec les signaux de fatigue créa. C\'est le principal vecteur d\'optimisation court terme.',

  sources_used: [
    { name: 'Meta Business Reports — Retail FY2025', date: '2025-Q4', weight: 'primary' },
    { name: 'WordStream Industry Benchmarks 2025', date: '2025-09', weight: 'secondary' },
    { name: 'Tinuiti Q4 2025 Paid Social Report', date: '2025-Q4', weight: 'secondary' },
    { name: 'Hubspot Marketing Benchmarks 2025', date: '2025-10', weight: 'secondary' },
    { name: 'Bench interne Node it (retail FR 2024-2025)', date: '2025', weight: 'context' },
  ],
  fallback_used: false,
  fallback_reason: null,
};
