/* ============================================================
   audit-meta · données démo Maison Verde (compte synthétique)
   ⚠️ Ces chiffres sont fictifs et pédagogiques. Aucune donnée
   réelle du groupe Maison Verde (enseigne fictive) n'est utilisée.
   ============================================================ */

(function () {
  // ---------- Seeded random (Mulberry32) ----------
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function range(start, end) {
    const out = []; const d = new Date(start);
    while (d <= new Date(end)) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
    return out;
  }
  function dailyCurve(dates, totals, options) {
    // Distribue totals.spend / impressions / clicks sur les dates avec saisonnalité hebdo
    const r = rng(options.seed || 1);
    const weights = dates.map((iso, i) => {
      const d = new Date(iso);
      const dow = d.getUTCDay();
      // poids hebdo : lundi-jeudi normal, vendredi-dimanche +30%
      const wDow = dow === 0 || dow === 6 ? 1.3 : (dow === 5 ? 1.2 : 1.0);
      // dérive linéaire (option ramp/decay)
      const t = i / (dates.length - 1);
      const wTrend = options.trend ? 1 + options.trend * (t - 0.5) : 1;
      // bruit
      const noise = 0.7 + r() * 0.6;
      return wDow * wTrend * noise;
    });
    const sum = weights.reduce((a, b) => a + b, 0);
    const ts = dates.map((iso, i) => {
      const w = weights[i] / sum;
      const t = i / (dates.length - 1);
      const spend = totals.spend * w;
      const impressions = totals.impressions * w;
      const clicks = totals.clicks * w;
      const cpm = impressions ? (spend / impressions) * 1000 : 0;
      const cpc = clicks ? spend / clicks : 0;
      const ctr = impressions ? (clicks / impressions) * 100 : 0;
      // frequency : monte progressivement avec saturation
      const freq = options.freq_start + (options.freq_end - options.freq_start) * t + (r() * 0.4 - 0.2);
      return { date: iso, spend: round(spend, 2), impressions: Math.round(impressions), clicks: Math.round(clicks), cpm: round(cpm, 2), cpc: round(cpc, 3), ctr: round(ctr, 3), frequency: round(Math.max(0.8, freq), 2) };
    });
    return ts;
  }
  function round(n, d) { const k = Math.pow(10, d); return Math.round(n * k) / k; }

  // ---------- Constantes ----------
  const RANGE = { start: '2026-01-06', end: '2026-04-30' };
  const DATES = range(RANGE.start, RANGE.end);

  // ---------- Campagnes ----------
  // tags : générés par le sous-agent data-engineer au scrap, via analyse IA du
  // nom + objective + targeting de chaque campagne. 1 ligne = 1 campagne (jamais
  // agrégée par thématique) ; les étiquettes permettent ensuite de filtrer.
  const campaigns = [
    { id: 'c_001', name: 'Maison Verde Drive — Acquisition Q1', objective: 'CONVERSIONS', tags: ['Maison Verde Drive', 'Acquisition', 'E-commerce', 'Cold'],            spend: 78230, impressions: 14_800_000, clicks: 198_000, results: 4520, freq: [1.0, 2.8], trend: 0.2, seed: 11 },
    { id: 'c_002', name: 'Maison Verde Drive — Retention',     objective: 'CONVERSIONS', tags: ['Maison Verde Drive', 'Retention', 'E-commerce', 'CRM', 'Warm'],         spend: 44820, impressions: 6_900_000,  clicks: 142_000, results: 6820, freq: [1.5, 4.8], trend: 0.5, seed: 22 },
    { id: 'c_003', name: 'Magasins Verde — Trafic local', objective: 'LINK_CLICKS', tags: ['Magasins Verde', 'Trafic', 'Local', 'Géo'],                     spend: 62540, impressions: 18_400_000, clicks: 220_000, results: 0,    freq: [1.2, 3.1], trend: 0.1, seed: 33 },
    { id: 'c_004', name: 'Marque Verde — Brand awareness', objective: 'REACH', tags: ['Marque Verde', 'Awareness', 'Brand', 'MDD'],                         spend: 38110, impressions: 9_200_000,  clicks: 64_000,  results: 0,    freq: [1.4, 5.2], trend: 0.7, seed: 44 },
    { id: 'c_005', name: 'Recrutement Magasins',     objective: 'LEAD_GENERATION', tags: ['Recrutement', 'RH', 'Lead Gen'],                          spend: 21620, impressions: 3_100_000,  clicks: 41_500,  results: 890,  freq: [1.0, 2.4], trend: -0.1, seed: 55 },
  ];

  campaigns.forEach((c) => {
    const ts = dailyCurve(DATES, { spend: c.spend, impressions: c.impressions, clicks: c.clicks }, { seed: c.seed, trend: c.trend, freq_start: c.freq[0], freq_end: c.freq[1] });
    c.totals = {
      spend: round(c.spend, 2),
      impressions: c.impressions,
      clicks: c.clicks,
      reach: Math.round(c.impressions / ((c.freq[0] + c.freq[1]) / 2)),
      frequency: round((c.freq[0] + c.freq[1]) / 2, 2),
      ctr: round((c.clicks / c.impressions) * 100, 3),
      cpc: round(c.spend / c.clicks, 3),
      cpm: round((c.spend / c.impressions) * 1000, 2),
      results: c.results,
      cost_per_result: c.results ? round(c.spend / c.results, 2) : null,
      conversion_rate: c.results ? round((c.results / c.clicks) * 100, 2) : null,
    };
    c.timeseries = ts;
    c.status = 'ACTIVE'; c.buying_type = 'AUCTION';
    delete c.spend; delete c.impressions; delete c.clicks; delete c.freq; delete c.trend; delete c.seed; delete c.results;
  });

  // ---------- Ad sets ----------
  const adsetsRaw = [
    { id: 'as_001', campaign_id: 'c_001', name: 'FR · 25-55 · LAL 1% acheteurs Maison Verde Drive 180j', audience_description: 'Lookalike 1% (acheteurs Maison Verde Drive 180j) + intérêts cuisine, recettes, parents jeunes enfants', optimization_goal: 'OFFSITE_CONVERSIONS', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed', 'instagram_reels', 'instagram_stories'], spend_share: 0.58, seed: 101 },
    { id: 'as_002', campaign_id: 'c_001', name: 'FR · 30-60 · Foodies + Parents', audience_description: 'Intérêts cuisine + recettes + courses en ligne, exclusion convertis 30j', optimization_goal: 'OFFSITE_CONVERSIONS', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed'], spend_share: 0.42, seed: 102 },
    { id: 'as_003', campaign_id: 'c_002', name: 'FR · CRM acheteurs 180j panier >50€', audience_description: 'Custom Audience CRM (panier > 50€ sur 180j) — retention', optimization_goal: 'OFFSITE_CONVERSIONS', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed', 'instagram_reels'], spend_share: 0.62, seed: 103 },
    { id: 'as_004', campaign_id: 'c_002', name: 'FR · CRM churn 6-12 mois', audience_description: 'Custom Audience CRM churnés 6-12 mois — réactivation', optimization_goal: 'OFFSITE_CONVERSIONS', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed'], spend_share: 0.38, seed: 104 },
    { id: 'as_005', campaign_id: 'c_003', name: 'Géo · 5km magasins · 25-65', audience_description: 'Géo-ciblage 5km autour des 1640 Magasins Verde, 25-65 ans', optimization_goal: 'LINK_CLICKS', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'audience_network', 'instagram_feed'], spend_share: 0.61, seed: 105 },
    { id: 'as_006', campaign_id: 'c_003', name: 'Géo · 5km · LAL visiteurs site 90j', audience_description: 'Géo 5km + Lookalike 2% visiteurs site 90j', optimization_goal: 'LINK_CLICKS', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed'], spend_share: 0.39, seed: 106 },
    { id: 'as_007', campaign_id: 'c_004', name: 'FR · Broad 25-55 · Cuisine', audience_description: 'Broad national 25-55 + intérêts cuisine, recettes', optimization_goal: 'REACH', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed', 'audience_network'], spend_share: 0.58, seed: 107 },
    { id: 'as_008', campaign_id: 'c_004', name: 'FR · Broad 25-55 · Éco-conso', audience_description: 'Broad national 25-55 + intérêts consommation responsable, bio, local', optimization_goal: 'REACH', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed'], spend_share: 0.42, seed: 108 },
    { id: 'as_009', campaign_id: 'c_005', name: 'Géo · 10km · 18-45 · Job seekers', audience_description: 'Géo 10km + intérêts emploi, recrutement, formation', optimization_goal: 'LEAD_GENERATION', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed'], spend_share: 0.63, seed: 109 },
    { id: 'as_010', campaign_id: 'c_005', name: 'FR · 18-45 · Job in retail', audience_description: 'National 18-45 + intérêts retail, distribution, grande consommation', optimization_goal: 'LEAD_GENERATION', bid_strategy: 'LOWEST_COST_WITHOUT_CAP', placements: ['facebook_feed', 'instagram_feed'], spend_share: 0.37, seed: 110 },
  ];

  const adsets = adsetsRaw.map((a) => {
    const camp = campaigns.find((c) => c.id === a.campaign_id);
    const spend = camp.totals.spend * a.spend_share;
    const impressions = camp.totals.impressions * a.spend_share;
    const clicks = camp.totals.clicks * a.spend_share;
    const reach = Math.round(camp.totals.reach * a.spend_share);
    const ts = dailyCurve(DATES, { spend, impressions, clicks }, { seed: a.seed, trend: 0, freq_start: camp.totals.frequency * 0.85, freq_end: camp.totals.frequency * 1.1 });
    return {
      id: a.id, campaign_id: a.campaign_id, name: a.name,
      audience_description: a.audience_description,
      optimization_goal: a.optimization_goal, bid_strategy: a.bid_strategy,
      placements: a.placements,
      totals: {
        spend: round(spend, 2), impressions: Math.round(impressions), clicks: Math.round(clicks),
        reach,
        frequency: round(camp.totals.frequency * (0.9 + (a.seed % 7) / 30), 2),
        ctr: round((clicks / impressions) * 100, 3),
        cpc: round(spend / clicks, 3),
        cpm: round((spend / impressions) * 1000, 2),
        results: camp.totals.results ? Math.round(camp.totals.results * a.spend_share) : 0,
      },
      timeseries: ts,
    };
  });

  // ---------- Ads ----------
  const adsRaw = [
    { id: 'ad_001', adset_id: 'as_001', name: 'Reel_FoodHack_BeefBourg_v3', type: 'video', spend_share: 0.45, ctr_lift: 2.1, freq_7d: 2.4, ctr_decay: -8 },
    { id: 'ad_002', adset_id: 'as_001', name: 'Static_PromoSemaine_W14', type: 'image', spend_share: 0.30, ctr_lift: 1.6, freq_7d: 2.1, ctr_decay: -5 },
    { id: 'ad_003', adset_id: 'as_001', name: 'Reel_DriveDelivery_v1', type: 'video', spend_share: 0.25, ctr_lift: 0.7, freq_7d: 5.2, ctr_decay: -38 },
    { id: 'ad_004', adset_id: 'as_002', name: 'Carousel_RecettesPrint_v2', type: 'carousel', spend_share: 0.55, ctr_lift: 1.9, freq_7d: 2.2, ctr_decay: -12 },
    { id: 'ad_005', adset_id: 'as_002', name: 'Static_Promo_v1', type: 'image', spend_share: 0.45, ctr_lift: 0.9, freq_7d: 3.1, ctr_decay: -22 },
    { id: 'ad_006', adset_id: 'as_003', name: 'Reel_RetentionOffer_v2', type: 'video', spend_share: 0.60, ctr_lift: 1.8, freq_7d: 3.6, ctr_decay: -15 },
    { id: 'ad_007', adset_id: 'as_003', name: 'Static_Fidelite_v1', type: 'image', spend_share: 0.40, ctr_lift: 1.1, freq_7d: 4.2, ctr_decay: -28 },
    { id: 'ad_008', adset_id: 'as_004', name: 'Video_BrandStory_v0', type: 'video', spend_share: 0.50, ctr_lift: 0.6, freq_7d: 4.8, ctr_decay: -34 },
    { id: 'ad_009', adset_id: 'as_004', name: 'Carousel_WinBack_v2', type: 'carousel', spend_share: 0.50, ctr_lift: 1.3, freq_7d: 2.6, ctr_decay: -10 },
    { id: 'ad_010', adset_id: 'as_005', name: 'Static_MagasinLocal_v3', type: 'image', spend_share: 0.55, ctr_lift: 1.2, freq_7d: 2.3, ctr_decay: -8 },
    { id: 'ad_011', adset_id: 'as_005', name: 'Reel_NewStoreOpening', type: 'video', spend_share: 0.45, ctr_lift: 1.5, freq_7d: 2.0, ctr_decay: -4 },
    { id: 'ad_012', adset_id: 'as_007', name: 'Static_BrandU_Cuisine', type: 'image', spend_share: 1.0, ctr_lift: 0.7, freq_7d: 4.6, ctr_decay: -25 },
    { id: 'ad_013', adset_id: 'as_009', name: 'Static_JobMagasin_v1', type: 'image', spend_share: 0.70, ctr_lift: 1.0, freq_7d: 2.2, ctr_decay: -7 },
    { id: 'ad_014', adset_id: 'as_009', name: 'Video_Temoignage_v2', type: 'video', spend_share: 0.30, ctr_lift: 1.4, freq_7d: 1.9, ctr_decay: -3 },
  ];

  const ads = adsRaw.map((ad) => {
    const adset = adsets.find((a) => a.id === ad.adset_id);
    const spend = adset.totals.spend * ad.spend_share;
    const impressions = adset.totals.impressions * ad.spend_share;
    const baseCtr = adset.totals.ctr / 100;
    const ctr = baseCtr * ad.ctr_lift;
    const clicks = Math.round(impressions * ctr);
    return {
      id: ad.id, adset_id: ad.adset_id, campaign_id: adset.campaign_id, name: ad.name,
      creative: {
        type: ad.type,
        first_3s_view_rate: ad.type === 'video' ? round(0.45 + (ad.ctr_lift - 1) * 0.15, 2) : null,
        thumbstop_ratio: ad.type === 'video' ? round(0.12 + (ad.ctr_lift - 1) * 0.04, 3) : null,
        watch_25_rate: ad.type === 'video' ? round(0.25 + (ad.ctr_lift - 1) * 0.08, 2) : null,
      },
      totals: {
        spend: round(spend, 2),
        impressions: Math.round(impressions),
        clicks,
        ctr: round(ctr * 100, 3),
        cpm: round((spend / impressions) * 1000, 2),
        cpc: round(spend / clicks, 3),
        frequency: round(adset.totals.frequency * (0.9 + ad.ctr_lift * 0.05), 2),
      },
      fatigue_signal: {
        frequency_7d: ad.freq_7d,
        ctr_decay_pct: ad.ctr_decay,
        flag: ad.freq_7d > 3 && ad.ctr_decay < -20 ? 'high_fatigue' : ad.freq_7d > 2 && ad.ctr_decay < -10 ? 'medium_fatigue' : 'ok',
      },
    };
  });

  // ---------- Hierarchy ----------
  const hierarchy = {};
  campaigns.forEach((c) => {
    hierarchy[c.id] = { adsets: {} };
    adsets.filter((a) => a.campaign_id === c.id).forEach((a) => {
      hierarchy[c.id].adsets[a.id] = ads.filter((ad) => ad.adset_id === a.id).map((ad) => ad.id);
    });
  });

  // ---------- Export ----------
  window.AUDIT_DATA = {
    meta: {
      account_id: 'act_demo_maison_verde',
      account_name: 'Maison Verde — Démo synthétique',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      generated_at: new Date().toISOString(),
      date_range: RANGE,
      granularity: 'weekly',
    },
    campaigns,
    adsets,
    ads,
    hierarchy,
    filters: {
      campaigns_available: campaigns.map((c) => ({ id: c.id, name: c.name })),
      adsets_available: adsets.map((a) => ({ id: a.id, name: a.name, campaign_id: a.campaign_id })),
      date_min: RANGE.start,
      date_max: RANGE.end,
    },
    data_quality: { completeness: 0.99, missing_dates: [], fields_missing: [], warnings: [] },
  };
})();
