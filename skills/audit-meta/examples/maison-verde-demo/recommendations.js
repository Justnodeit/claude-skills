/* ============================================================
   AUDIT_RECOMMENDATIONS — Maison Verde démo
   Produit par Recommendation Engine (sous-agent).
   ============================================================ */

window.AUDIT_RECOMMENDATIONS = {
  top_5_signals: [
    { rank: 1, icon: 'fire', title: 'Fatigue créa concentrée sur 3 campagnes principales', kpi: { value: '−34%', label: 'CTR vs S1' }, evidence_lines: ['3 ad sets représentant 47% du spend', 'Frequency moyenne 7j : 4,8 (médiane sectorielle 2,1)', '~12 600 € de spend potentiellement non-incrémental par mois'], severity: 'high' },
    { rank: 2, icon: 'target', title: 'Chevauchement audience 38% sur la campagne Brand', kpi: { value: '38%', label: 'overlap as_007 ∩ as_008' }, evidence_lines: ['Vous payez 2 fois pour toucher les mêmes utilisateurs', 'Camp Brand : 38 110 € impactés', 'Fréquence cumulée artificiellement gonflée'], severity: 'medium' },
    { rank: 3, icon: 'spark', title: 'Pattern hook "UGC food" détecté comme gagnant', kpi: { value: '+62%', label: 'lift CTR' }, evidence_lines: ['4 créas avec ce pattern dans le top 25%', 'Effet maintenu sur 6+ semaines', 'Cluster identifié : Reel < 15s + visage cam + texte burned-in'], severity: 'info' },
    { rank: 4, icon: 'check', title: 'CPM 24% sous la médiane secteur — qualité ciblage', kpi: { value: '4,68 €', label: 'vs 6,20 € médiane' }, evidence_lines: ['Top quartile retail FR FY2025', 'Stable sur 12 semaines', 'Levier saturé — ne pas chercher à réduire davantage'], severity: 'info' },
    { rank: 5, icon: 'bolt', title: 'Recrutement Magasins sous-investi vs potentiel', kpi: { value: '24,30 €', label: 'CPL vs bench 35-50 €' }, evidence_lines: ['Budget 21 620 € (9% du total)', 'CPL au top de l\'industrie', '+30% volume estimé par doublement budget'], severity: 'info' },
  ],

  recommendations: [
    {
      id: 'reco-001',
      title: 'Renouveler les créas des 3 ad sets en fatigue avant S+2',
      summary: 'Produire 6 nouvelles variantes (3 par ad set) en remplacement progressif. Priorité format Reel vertical < 15s avec hook visage cam — pattern gagnant détecté sur le compte (+62% CTR).',
      impact: 'high', effort: 'medium', time_to_value: '2_weeks',
      expected_outcome: 'Baisse CPM -10 à -15% sous 30j, économie estimée 8-12 k€/mois',
      category: 'creative', assignee_role: 'Creative Lead',
      linked_signals: ['signal-1'],
    },
    {
      id: 'reco-002',
      title: 'Pause immédiate de Reel_DriveDelivery_v1',
      summary: 'Cette créa sature son audience (freq 5,2 / 7j, CTR -38%). Le coût d\'opportunité d\'1 semaine supplémentaire ≈ 1 200 €. Remplacement par variante UGC déjà en test sur as_002.',
      impact: 'high', effort: 'low', time_to_value: '1_week',
      expected_outcome: 'Reallocation 4 200 € restants vers créas performantes du même ad set',
      category: 'creative', assignee_role: 'Media Buyer',
    },
    {
      id: 'reco-003',
      title: 'Fusionner les ad sets Brand chevauchants en un seul CBO',
      summary: 'as_007 (Cuisine) et as_008 (Éco-conso) ont 38% d\'overlap. Consolidation en un unique ad set CBO avec exclusions mutuelles ou unification audience.',
      impact: 'medium', effort: 'low', time_to_value: '1_week',
      expected_outcome: 'Baisse fréquence brand de 5,2 à ~3,5 sous 14j, réduction du coût par reach incrémental',
      category: 'structure', assignee_role: 'Media Buyer',
    },
    {
      id: 'reco-004',
      title: 'Activer frequency cap 2/7j sur la campagne Brand',
      summary: 'La campagne Brand n\'a aucun plafond de fréquence configuré — la fréquence dérive vers 5,2/7j. Setup d\'un cap natif Meta à 2/7j minimum.',
      impact: 'medium', effort: 'low', time_to_value: '1_week',
      expected_outcome: 'Préserver la fraîcheur de la mémorisation brand, réallocation natif vers nouveaux reaches',
      category: 'structure', assignee_role: 'Media Buyer',
    },
    {
      id: 'reco-005',
      title: 'Industrialiser la production Reel UGC food (pipeline mensuel)',
      summary: 'Le pattern UGC < 15s + visage cam + texte burned-in délivre +62% CTR. Mettre en place un pipeline de 8 variantes/mois (briefs créa-friendly, contrat créateurs locaux) pour alimenter l\'A/B continu.',
      impact: 'high', effort: 'high', time_to_value: '1_month',
      expected_outcome: 'Stabilisation CTR > 1,8% sur 6 mois, baisse CAC -8 à -12% T+2',
      category: 'creative', assignee_role: 'Creative Lead + Brand',
    },
    {
      id: 'reco-006',
      title: 'Scaler "Recrutement Magasins" budget x1,5',
      summary: 'CPL actuel 24,30 € vs bench retail/HR 35-50 €. Marge de manœuvre confortable pour absorber un scaling. Tester +50% budget sur as_009 (best performer) pendant 4 semaines.',
      impact: 'medium', effort: 'low', time_to_value: '2_weeks',
      expected_outcome: '+30% volume de leads sans dégradation CPL au-delà de 30 €',
      category: 'budget', assignee_role: 'Media Buyer + Talent Acquisition',
    },
    {
      id: 'reco-007',
      title: 'Test incrementality sur Maison Verde Drive Retention (2 semaines)',
      summary: 'La part de retention (as_003, as_004) capture beaucoup de demande organique. Conversion lift test Meta sur 14 jours pour mesurer le vrai incrémental — variable structurante pour la stratégie 2026.',
      impact: 'high', effort: 'medium', time_to_value: '1_month',
      expected_outcome: 'Décision data-driven sur 73 k€ de spend annualisé (potentiellement -20% sans impact CA)',
      category: 'measurement', assignee_role: 'Insight Lead',
    },
    {
      id: 'reco-008',
      title: 'Setup Advanced Matching server-side complet',
      summary: 'Le pixel CAPI est en place mais match rate seulement 78%. Compléter advanced matching (téléphone hashé + ZIP) côté serveur — déjà fait sur plusieurs comptes retail.',
      impact: 'medium', effort: 'medium', time_to_value: '1_month',
      expected_outcome: 'Match rate cible 88-92%, attribution +5-8%, ré-optimisation auto plus efficace',
      category: 'tracking', assignee_role: 'Engineering + Data',
    },
  ],

  prioritization_matrix: [
    { id: 'reco-001', impact: 0.85, effort: 0.5 },
    { id: 'reco-002', impact: 0.80, effort: 0.15 },
    { id: 'reco-003', impact: 0.55, effort: 0.2 },
    { id: 'reco-004', impact: 0.50, effort: 0.15 },
    { id: 'reco-005', impact: 0.85, effort: 0.85 },
    { id: 'reco-006', impact: 0.55, effort: 0.2 },
    { id: 'reco-007', impact: 0.80, effort: 0.55 },
    { id: 'reco-008', impact: 0.55, effort: 0.5 },
  ],

  execution_plan: {
    immediate: ['reco-002', 'reco-003', 'reco-004', 'reco-006'],
    short_term: ['reco-001'],
    medium_term: ['reco-005', 'reco-007', 'reco-008'],
    long_term: [],
  },

  closing_statement: 'L\'audit identifie un potentiel d\'économie de <strong>18-25 k€/mois</strong> (-10 à -12% du spend actuel) via 4 actions priorisées sous 30 jours, sans impact négatif sur le volume. La marge structurelle à 6 mois passe par l\'industrialisation de la production Reel UGC (pattern gagnant identifié) et la mesure d\'incrémental sur la retention.',
};
