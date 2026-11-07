/* ============================================================
   audit-meta · app.js (v1.1)
   - State management (mode + filters) qui propage à tous les onglets
   - Tableau générique (tri, toolbox colonnes, export Excel)
   - Comparaison vs moyenne du compte sur métriques de taux
   - Re-render orchestré
   ============================================================ */

(function () {
  'use strict';

  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const fmt = window.AuditCharts.fmt;

  // ---------- STATE ----------
  const STATE = window.AUDIT_STATE = {
    selected_tags: [],              // [] = aucun filtre tag, Array = filtre OR
    granularity: 'weekly',
  };

  let perfChart = null;
  let formatDonut = null;
  let priorityMatrix = null;
  let seriesVisible = { spend: true, cpm: true, cpc: true, frequency: false };

  /* ---------- DATA GETTERS ---------- */
  function getFilteredData() {
    const data = window.AUDIT_DATA;
    const sel_tags = STATE.selected_tags || [];

    let campaigns = [...data.campaigns];
    if (sel_tags.length) {
      campaigns = campaigns.filter(c => (c.tags || []).some(t => sel_tags.includes(t)));
    }
    const camp_ids = new Set(campaigns.map(c => c.id));
    const adsets = data.adsets.filter(a => camp_ids.has(a.campaign_id));
    const adset_ids = new Set(adsets.map(a => a.id));
    const ads = data.ads.filter(ad => adset_ids.has(ad.adset_id));
    return { campaigns, adsets, ads };
  }

  function getAllTags() {
    const set = new Set();
    (window.AUDIT_DATA?.campaigns || []).forEach(c => (c.tags || []).forEach(t => set.add(t)));
    return [...set].sort();
  }

  function getAccountAverages() {
    const { campaigns } = getFilteredData();
    const total = campaigns.reduce((acc, c) => ({
      spend: acc.spend + (c.totals.spend || 0),
      impressions: acc.impressions + (c.totals.impressions || 0),
      clicks: acc.clicks + (c.totals.clicks || 0),
      reach: acc.reach + (c.totals.reach || 0),
      results: acc.results + (c.totals.results || 0),
    }), { spend: 0, impressions: 0, clicks: 0, reach: 0, results: 0 });
    return {
      spend: total.spend,
      impressions: total.impressions,
      clicks: total.clicks,
      reach: total.reach,
      results: total.results,
      ctr: total.impressions ? (total.clicks / total.impressions) * 100 : 0,
      cpm: total.impressions ? (total.spend / total.impressions) * 1000 : 0,
      cpc: total.clicks ? total.spend / total.clicks : 0,
      frequency: total.reach ? total.impressions / total.reach : 0,
      cost_per_result: total.results ? total.spend / total.results : null,
      conversion_rate: total.clicks ? (total.results / total.clicks) * 100 : null,
    };
  }

  // Direction d'une métrique pour colorer la comparaison vs compte
  const METRIC_DIRECTION = {
    ctr: 'higher_better',
    cpm: 'lower_better',
    cpc: 'lower_better',
    cvr: 'higher_better',
    conversion_rate: 'higher_better',
    cost_per_result: 'lower_better',
    frequency: 'lower_better',
  };

  function compareToAvg(rowVal, accountVal, metric) {
    if (!accountVal || !rowVal) return null;
    const deltaPct = ((rowVal - accountVal) / accountVal) * 100;
    const dir = METRIC_DIRECTION[metric];
    let tone = 'neutral';
    if (dir === 'higher_better') tone = deltaPct >= 0 ? 'positive' : 'negative';
    if (dir === 'lower_better') tone = deltaPct <= 0 ? 'positive' : 'negative';
    return { pct: deltaPct, tone, text: `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(0)}% vs cpte` };
  }

  /* ---------- BOOTSTRAP ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    STATE.granularity = window.AUDIT_DATA.meta.granularity || 'weekly';
    renderHeader();
    setupTabs();
    renderAll();
    setupExports();
    // Global click-outside handler for all toolbox panels (single registration)
    document.addEventListener('click', () => {
      $$('.toolbox-panel').forEach(p => p.dataset.open = 'false');
    });
  });

  function renderAll() {
    renderGlobal();
    renderAdsets();
    renderCreatives();
    renderBenchmark();
    renderRecommendations();
  }

  /* ---------- HEADER ---------- */
  function renderHeader() {
    const m = window.AUDIT_DATA.meta;
    $('#h-account').textContent = m.account_name;
    $('#h-range').textContent = `${formatDateShort(m.date_range.start)} → ${formatDateShort(m.date_range.end)} · ${m.currency}`;
  }

  /* ---------- TABS ---------- */
  function setupTabs() {
    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.target));
      tab.addEventListener('keydown', (e) => {
        const tabs = $$('.tab');
        const idx = tabs.indexOf(tab);
        if (e.key === 'ArrowRight') tabs[(idx + 1) % tabs.length].focus();
        if (e.key === 'ArrowLeft') tabs[(idx - 1 + tabs.length) % tabs.length].focus();
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(tab.dataset.target); }
      });
    });
  }
  function activateTab(id) {
    $$('.tab').forEach((t) => t.setAttribute('aria-selected', t.dataset.target === id ? 'true' : 'false'));
    $$('.tabpanel').forEach((p) => p.setAttribute('data-active', p.id === id ? 'true' : 'false'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- TAG FILTER BAR ---------- */
  function renderTagBar(mountId) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const all = getAllTags();
    if (all.length === 0) { mount.innerHTML = ''; return; }
    const sel = new Set(STATE.selected_tags || []);
    mount.innerHTML = `
      <div class="tag-bar">
        <span class="tag-bar__label">Filtrer par étiquette :</span>
        ${all.map(t => `<button class="tag-chip" data-tag="${escape(t)}" data-active="${sel.has(t)}">${escape(t)}</button>`).join('')}
        ${sel.size ? `<button class="tag-chip tag-chip--reset" data-reset>Réinitialiser</button>` : ''}
      </div>`;
    mount.querySelectorAll('[data-tag]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const tag = btn.dataset.tag;
        const idx = STATE.selected_tags.indexOf(tag);
        if (idx === -1) STATE.selected_tags.push(tag);
        else STATE.selected_tags.splice(idx, 1);
        renderAll();
      };
    });
    const resetBtn = mount.querySelector('[data-reset]');
    if (resetBtn) resetBtn.onclick = () => { STATE.selected_tags = []; renderAll(); };
  }

  /* ---------- GLOBAL TAB ---------- */
  function renderGlobal() {
    const ins = window.AUDIT_INSIGHTS;
    const { campaigns } = getFilteredData();

    // Barre de filtre tags
    renderTagBar('global-tag-bar');

    // KPI cards — recompute selon filtre si possible, sinon utiliser headline_kpis
    const computed = computeKpis(campaigns);
    $('#kpi-grid').innerHTML = ins.headline_kpis.map((k, i) => {
      const c = computed[i];
      return `
        <div class="kpi">
          <div class="kpi__label">${escape(k.label)}</div>
          <div class="kpi__value num">${c?.value || k.value}</div>
          ${k.delta ? `<span class="kpi__delta kpi__delta--${k.delta_type}">${escape(k.delta)}</span>` : ''}
          <canvas class="kpi__spark"></canvas>
        </div>`;
    }).join('');
    $$('.kpi').forEach((card, i) => {
      const canvas = card.querySelector('canvas');
      const data = ins.headline_kpis[i]?.sparkline || [];
      window.AuditCharts.buildSparkline(canvas, data, window.AuditCharts.SERIES_COLORS[i % 7]);
    });

    // Performance chart
    perfChart?.destroy();
    perfChart = window.AuditCharts.buildPerfChart($('#perf-chart').getContext('2d'), { campaigns }, STATE.granularity, seriesVisible);
    setupChartControls();

    // Signals
    $('#signal-list').innerHTML = ins.global.signals.map(signalCard).join('');
    $('#global-summary').innerHTML = ins.global.summary;

    // Campaign table
    buildCampaignTable(campaigns);
  }

  function computeKpis(campaigns) {
    if (campaigns.length === 0) return [];
    const t = campaigns.reduce((acc, c) => ({
      spend: acc.spend + c.totals.spend, impressions: acc.impressions + c.totals.impressions,
      clicks: acc.clicks + c.totals.clicks, reach: acc.reach + (c.totals.reach || 0),
    }), { spend: 0, impressions: 0, clicks: 0, reach: 0 });
    return [
      { value: fmt.eur(t.spend) },
      { value: formatBig(t.impressions) },
      { value: fmt.pct(t.impressions ? (t.clicks / t.impressions) * 100 : 0) },
      { value: fmt.eur2(t.impressions ? (t.spend / t.impressions) * 1000 : 0) },
      { value: fmt.eur2(t.clicks ? t.spend / t.clicks : 0) },
      { value: fmt.num2(t.reach ? t.impressions / t.reach : 0) },
    ];
  }
  function formatBig(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + ' M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + ' k';
    return fmt.num(n);
  }

  function setupChartControls() {
    $$('#perf-gran button').forEach((btn) => {
      btn.onclick = () => {
        $$('#perf-gran button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        STATE.granularity = btn.dataset.gran;
        perfChart.destroy();
        const { campaigns } = getFilteredData();
        perfChart = window.AuditCharts.buildPerfChart($('#perf-chart').getContext('2d'), { campaigns }, STATE.granularity, seriesVisible);
      };
    });
    $$('#perf-legend .legend-pill').forEach((pill) => {
      pill.onclick = () => {
        const key = pill.dataset.key;
        seriesVisible[key] = !seriesVisible[key];
        pill.dataset.active = String(seriesVisible[key]);
        const idx = ['spend', 'cpm', 'cpc', 'frequency'].indexOf(key);
        perfChart.setDatasetVisibility(idx, seriesVisible[key]);
        perfChart.update();
      };
    });
  }

  /* ---------- GENERIC PERF TABLE ---------- */
  // Reusable builder for campaigns / adsets / ads
  function buildPerfTable(opts) {
    // opts: { mount, rows, columns, defaultSort, accountAvgs, exportName, filters }
    const state = {
      colVisible: Object.fromEntries(opts.columns.map(c => [c.key, c.default])),
      sort: opts.defaultSort ? { ...opts.defaultSort } : null,
    };

    function visibleCols() { return opts.columns.filter(c => state.colVisible[c.key]); }

    function draw() {
      const cols = visibleCols();
      const rows = [...opts.rows].sort((a, b) => {
        if (!state.sort) return 0;
        const col = opts.columns.find(c => c.key === state.sort.key);
        if (!col) return 0;
        const va = col.value(a), vb = col.value(b);
        const dir = state.sort.dir === 'asc' ? 1 : -1;
        if (typeof va === 'string') return va.localeCompare(vb) * dir;
        return ((va || 0) - (vb || 0)) * dir;
      });

      const thead = `<tr>${cols.map(c => {
        const active = state.sort?.key === c.key;
        const dir = active ? state.sort.dir : '';
        return `<th data-col="${c.key}" ${active ? `data-sort-active data-sort-dir="${dir}"` : ''} style="text-align:${c.align || 'left'}">${escape(c.label)}${c.sortable !== false ? ' <span class="sort-arrow">▼</span>' : ''}</th>`;
      }).join('')}</tr>`;

      const tbody = rows.map(row => `<tr>${cols.map(c => {
        const cell = c.render(row, opts.accountAvgs);
        return typeof cell === 'string' && cell.startsWith('<td') ? cell : `<td style="text-align:${c.align || 'left'}">${cell}</td>`;
      }).join('')}</tr>`).join('');

      opts.mount.querySelector('thead').innerHTML = thead;
      opts.mount.querySelector('tbody').innerHTML = tbody;

      // Sort handlers
      $$('thead th', opts.mount).forEach(th => {
        if (!opts.columns.find(c => c.key === th.dataset.col)?.sortable && opts.columns.find(c => c.key === th.dataset.col)?.sortable !== undefined) return;
        th.onclick = () => {
          const k = th.dataset.col;
          const col = opts.columns.find(c => c.key === k);
          if (col?.sortable === false) return;
          if (state.sort?.key === k) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
          else state.sort = { key: k, dir: 'desc' };
          draw();
        };
      });
    }

    // Toolbox panel + buttons (chercher dans le bloc .table-wrap parent, pas .table-scroll)
    const wrap = opts.mount.closest('.table-wrap');
    const tbHost = wrap?.querySelector('.toolbox-panel');
    if (tbHost) {
      tbHost.innerHTML = opts.columns
        .filter(c => c.key !== opts.columns[0].key)
        .map(c => `<label><input type="checkbox" data-col="${c.key}" ${state.colVisible[c.key] ? 'checked' : ''}><span>${escape(c.label)}</span></label>`)
        .join('');
      tbHost.onchange = (e) => {
        if (e.target.dataset.col) {
          state.colVisible[e.target.dataset.col] = e.target.checked;
          draw();
        }
      };
      tbHost.onclick = (e) => e.stopPropagation();
    }
    const tbBtn = wrap?.querySelector('.toolbox-btn');
    if (tbBtn && tbHost) {
      tbBtn.onclick = (e) => {
        e.stopPropagation();
        const willOpen = tbHost.dataset.open !== 'true';
        $$('.toolbox-panel').forEach(p => { if (p !== tbHost) p.dataset.open = 'false'; });
        tbHost.dataset.open = willOpen ? 'true' : 'false';
      };
    }

    // Export Excel
    const xlsBtn = wrap?.querySelector('.export-xls-btn');
    if (xlsBtn) {
      xlsBtn.onclick = () => exportTableToExcel(opts, visibleCols());
    }

    draw();
    return { redraw: draw, state };
  }

  function exportTableToExcel(opts, cols) {
    if (typeof XLSX === 'undefined') { alert('SheetJS non chargé'); return; }
    const rows = [...opts.rows].sort((a, b) => 0);
    const sheet = rows.map(r => {
      const obj = {};
      cols.forEach(c => {
        obj[c.label] = c.exportValue ? c.exportValue(r) : c.value(r);
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, opts.exportName || 'Sheet1');
    const slug = (window.AUDIT_DATA?.meta?.account_name || 'audit').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    XLSX.writeFile(wb, `audit-meta-${slug}-${opts.exportName || 'table'}.xlsx`);
  }

  /* ---------- DELTA HELPER ---------- */
  function cellWithDelta(value, formatted, accountVal, metric, align = 'right') {
    const cmp = compareToAvg(value, accountVal, metric);
    const deltaHtml = cmp ? `<div class="delta delta--${cmp.tone}">${escape(cmp.text)}</div>` : '';
    return `<td class="num" style="text-align:${align}"><div>${formatted}</div>${deltaHtml}</td>`;
  }

  /* ---------- CAMPAIGN TABLE ---------- */
  function buildCampaignTable(campaigns) {
    const avg = getAccountAverages();
    const cols = [
      { key: 'name', label: 'Campagne', default: true, sortable: true, align: 'left',
        value: c => c.name,
        render: c => `<td>
          <div class="row-name">${escape(c.name)}</div>
          <div class="row-desc">${escape(c.objective || '')}</div>
          ${(c.tags?.length) ? `<div class="row-tags">${c.tags.map(t => `<span class="row-tag">${escape(t)}</span>`).join('')}</div>` : ''}
        </td>`,
        exportValue: c => c.name },
      { key: 'tags', label: 'Étiquettes', default: false, sortable: false,
        value: c => (c.tags || []).join(', '),
        render: c => `<td>${(c.tags || []).map(t => `<span class="row-tag">${escape(t)}</span>`).join(' ')}</td>`,
        exportValue: c => (c.tags || []).join(', ') },
      { key: 'spend', label: 'Invest.', default: true, sortable: true,
        value: c => c.totals.spend,
        render: c => `<td class="num">${fmt.eur(c.totals.spend)}</td>`,
        exportValue: c => c.totals.spend },
      { key: 'impressions', label: 'Impr.', default: true, sortable: true,
        value: c => c.totals.impressions,
        render: c => `<td class="num">${fmt.num(c.totals.impressions)}</td>`,
        exportValue: c => c.totals.impressions },
      { key: 'clicks', label: 'Clics', default: true, sortable: true,
        value: c => c.totals.clicks,
        render: c => `<td class="num">${fmt.num(c.totals.clicks)}</td>`,
        exportValue: c => c.totals.clicks },
      { key: 'ctr', label: 'CTR', default: true, sortable: true,
        value: c => c.totals.ctr,
        render: c => cellWithDelta(c.totals.ctr, fmt.pct(c.totals.ctr), avg.ctr, 'ctr'),
        exportValue: c => c.totals.ctr },
      { key: 'cpm', label: 'CPM', default: true, sortable: true,
        value: c => c.totals.cpm,
        render: c => cellWithDelta(c.totals.cpm, fmt.eur2(c.totals.cpm), avg.cpm, 'cpm'),
        exportValue: c => c.totals.cpm },
      { key: 'cpc', label: 'CPC', default: true, sortable: true,
        value: c => c.totals.cpc,
        render: c => cellWithDelta(c.totals.cpc, fmt.eur2(c.totals.cpc), avg.cpc, 'cpc'),
        exportValue: c => c.totals.cpc },
      { key: 'frequency', label: 'Fréq.', default: false, sortable: true,
        value: c => c.totals.frequency,
        render: c => cellWithDelta(c.totals.frequency, fmt.num2(c.totals.frequency), avg.frequency, 'frequency'),
        exportValue: c => c.totals.frequency },
      { key: 'reach', label: 'Reach', default: false, sortable: true,
        value: c => c.totals.reach,
        render: c => `<td class="num">${fmt.num(c.totals.reach)}</td>`,
        exportValue: c => c.totals.reach },
      { key: 'results', label: 'Results', default: false, sortable: true,
        value: c => c.totals.results || 0,
        render: c => `<td class="num">${fmt.num(c.totals.results || 0)}</td>`,
        exportValue: c => c.totals.results || 0 },
      { key: 'cost_per_result', label: 'CPR', default: false, sortable: true,
        value: c => c.totals.cost_per_result,
        render: c => c.totals.cost_per_result
          ? cellWithDelta(c.totals.cost_per_result, fmt.eur2(c.totals.cost_per_result), avg.cost_per_result, 'cost_per_result')
          : '<td class="num">—</td>',
        exportValue: c => c.totals.cost_per_result },
      { key: 'cvr', label: 'CVR', default: false, sortable: true,
        value: c => c.totals.conversion_rate,
        render: c => c.totals.conversion_rate
          ? cellWithDelta(c.totals.conversion_rate, fmt.pct(c.totals.conversion_rate), avg.conversion_rate, 'conversion_rate')
          : '<td class="num">—</td>',
        exportValue: c => c.totals.conversion_rate },
    ];
    buildPerfTable({
      mount: $('#camp-table'),
      rows: campaigns,
      columns: cols,
      defaultSort: { key: 'spend', dir: 'desc' },
      accountAvgs: avg,
      exportName: 'campagnes',
    });
  }

  /* ---------- ADSETS TAB ---------- */
  function renderAdsets() {
    $('#adsets-summary').innerHTML = window.AUDIT_INSIGHTS.adsets.summary;
    renderTagBar('adsets-tag-bar');

    // Overlap warnings
    const ovHost = $('#adsets-overlap');
    const overlaps = window.AUDIT_INSIGHTS.adsets.audience_overlap_warnings || [];
    if (overlaps.length === 0) {
      ovHost.innerHTML = `<div class="signal signal--info"><div class="signal__icon"><svg class="icon"><use href="#i-check"/></svg></div><div class="signal__body"><div class="signal__title">Aucun chevauchement d'audience détecté</div></div></div>`;
    } else {
      ovHost.innerHTML = overlaps.map((o) => `
        <div class="signal signal--medium">
          <div class="signal__icon"><svg class="icon"><use href="#i-warn"/></svg></div>
          <div class="signal__body">
            <div class="signal__title">Chevauchement ${o.overlap_estimated_pct}% — ad sets ${o.adset_ids.join(' / ')}</div>
            <div class="signal__action">${escape(o.recommendation)}</div>
          </div>
        </div>`).join('');
    }

    // Campaign filter dropdown
    const { campaigns, adsets } = getFilteredData();
    const filterSel = $('#adsets-camp-filter');
    filterSel.innerHTML = '<option value="">Toutes campagnes</option>' +
      campaigns.map(c => `<option value="${c.id}">${escape(c.name)}</option>`).join('');
    filterSel.onchange = () => buildAdsetsTable(filterSel.value || null);

    buildAdsetsTable(null);
  }

  function buildAdsetsTable(campId) {
    const { adsets } = getFilteredData();
    const rows = campId ? adsets.filter(a => a.campaign_id === campId) : adsets;
    const avg = getAccountAverages();

    const cols = [
      { key: 'name', label: 'Ad set', default: true, sortable: true, align: 'left',
        value: a => a.name,
        render: a => `<td><div class="row-name">${escape(a.name)}</div><div class="row-desc">${escape(a.audience_description || '')} · <strong>${escape(a.optimization_goal || '')}</strong></div></td>`,
        exportValue: a => `${a.name} | ${a.audience_description} | ${a.optimization_goal}` },
      { key: 'spend', label: 'Invest.', default: true, sortable: true,
        value: a => a.totals.spend, render: a => `<td class="num">${fmt.eur(a.totals.spend)}</td>`, exportValue: a => a.totals.spend },
      { key: 'impressions', label: 'Impr.', default: true, sortable: true,
        value: a => a.totals.impressions, render: a => `<td class="num">${fmt.num(a.totals.impressions)}</td>`, exportValue: a => a.totals.impressions },
      { key: 'clicks', label: 'Clics', default: true, sortable: true,
        value: a => a.totals.clicks, render: a => `<td class="num">${fmt.num(a.totals.clicks)}</td>`, exportValue: a => a.totals.clicks },
      { key: 'ctr', label: 'CTR', default: true, sortable: true,
        value: a => a.totals.ctr,
        render: a => cellWithDelta(a.totals.ctr, fmt.pct(a.totals.ctr), avg.ctr, 'ctr'),
        exportValue: a => a.totals.ctr },
      { key: 'cpm', label: 'CPM', default: true, sortable: true,
        value: a => a.totals.cpm,
        render: a => cellWithDelta(a.totals.cpm, fmt.eur2(a.totals.cpm), avg.cpm, 'cpm'),
        exportValue: a => a.totals.cpm },
      { key: 'cpc', label: 'CPC', default: true, sortable: true,
        value: a => a.totals.cpc,
        render: a => cellWithDelta(a.totals.cpc, fmt.eur2(a.totals.cpc), avg.cpc, 'cpc'),
        exportValue: a => a.totals.cpc },
      { key: 'frequency', label: 'Fréq.', default: true, sortable: true,
        value: a => a.totals.frequency,
        render: a => cellWithDelta(a.totals.frequency, fmt.num2(a.totals.frequency), avg.frequency, 'frequency'),
        exportValue: a => a.totals.frequency },
      { key: 'reach', label: 'Reach', default: false, sortable: true,
        value: a => a.totals.reach, render: a => `<td class="num">${fmt.num(a.totals.reach)}</td>`, exportValue: a => a.totals.reach },
      { key: 'results', label: 'Results', default: false, sortable: true,
        value: a => a.totals.results, render: a => `<td class="num">${fmt.num(a.totals.results)}</td>`, exportValue: a => a.totals.results },
      { key: 'optim', label: 'Optimisation', default: false, sortable: true,
        value: a => a.optimization_goal,
        render: a => `<td><code style="font-size:.78em">${escape(a.optimization_goal)}</code></td>`,
        exportValue: a => a.optimization_goal },
    ];

    buildPerfTable({
      mount: $('#adsets-table'),
      rows,
      columns: cols,
      defaultSort: { key: 'spend', dir: 'desc' },
      accountAvgs: avg,
      exportName: 'adsets',
    });
  }

  /* ---------- CREATIVES TAB ---------- */
  function renderCreatives() {
    const ins = window.AUDIT_INSIGHTS.creatives;
    $('#creatives-summary').innerHTML = ins.summary;
    renderTagBar('creatives-tag-bar');

    const { ads } = getFilteredData();
    const adsById = Object.fromEntries(ads.map(a => [a.id, a]));

    // Top performers (avec badge format)
    $('#creatives-top').innerHTML = ins.top_performers.filter(p => adsById[p.ad_id]).map(p => {
      const ad = adsById[p.ad_id];
      const formatLabel = formatLabelFor(ad.creative.type);
      return `
        <div class="creative">
          <div class="creative__media">
            <span class="creative__badge creative__badge--top">Top · ${p.score}</span>
            <span class="creative__format">${formatLabel}</span>
            <svg class="icon" style="width:48px;height:48px"><use href="#i-${formatIcon(ad.creative.type)}"/></svg>
          </div>
          <div class="creative__body">
            <div class="creative__name" title="${escape(ad.name)}">${escape(ad.name)}</div>
            <div class="creative__metrics">
              <div class="creative__metric"><strong>${fmt.pct(ad.totals.ctr)}</strong> CTR</div>
              <div class="creative__metric"><strong>${fmt.num2(ad.totals.frequency)}</strong> Fréq.</div>
              <div class="creative__metric"><strong>${fmt.eur(ad.totals.spend)}</strong> Inv.</div>
            </div>
            <div class="creative__bar"><span style="width:${p.score}%"></span></div>
            <div class="signal__evidence" style="margin-top:8px;">${escape(p.why)}</div>
          </div>
        </div>`;
    }).join('');

    // Fatigue alerts
    $('#creatives-fatigue').innerHTML = ins.fatigue_alerts.filter(a => adsById[a.ad_id]).map(a => {
      const ad = adsById[a.ad_id];
      return `
        <div class="creative">
          <div class="creative__media">
            <span class="creative__badge creative__badge--fatigue">Fatigue</span>
            <span class="creative__format">${formatLabelFor(ad.creative.type)}</span>
            <svg class="icon" style="width:48px;height:48px"><use href="#i-${formatIcon(ad.creative.type)}"/></svg>
          </div>
          <div class="creative__body">
            <div class="creative__name" title="${escape(ad.name)}">${escape(ad.name)}</div>
            <div class="creative__metrics">
              <div class="creative__metric"><strong>${fmt.num2(ad.fatigue_signal.frequency_7d)}</strong> Fréq 7j</div>
              <div class="creative__metric"><strong>${ad.fatigue_signal.ctr_decay_pct}%</strong> ΔCTR</div>
              <div class="creative__metric"><strong>${fmt.eur(ad.totals.spend)}</strong> Inv.</div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Format donut
    formatDonut?.destroy();
    formatDonut = window.AuditCharts.buildFormatDonut($('#format-donut').getContext('2d'), ins.format_distribution);

    // Hook patterns
    $('#hooks-list').innerHTML = ins.hook_patterns_detected.map(h => `
      <div class="signal signal--info">
        <div class="signal__icon"><svg class="icon"><use href="#i-bolt"/></svg></div>
        <div class="signal__body">
          <div class="signal__title">${escape(h.pattern)}</div>
          <div class="signal__evidence">${h.count} créa · <strong>${escape(h.lift_ctr)}</strong> sur le CTR</div>
        </div>
      </div>`).join('');

    // Build creative perf table (NEW)
    renderCreativeTableFilters();
    buildCreativeTable();
  }

  function formatIcon(type) {
    return { video: 'image', image: 'image', carousel: 'layers', dynamic: 'spark' }[type] || 'image';
  }
  function formatLabelFor(type) {
    return { video: 'Vidéo / Reel', image: 'Image', carousel: 'Carrousel', dynamic: 'Dynamic' }[type] || type;
  }

  function renderCreativeTableFilters() {
    const { campaigns, adsets } = getFilteredData();
    const campSel = $('#creatives-camp-filter');
    campSel.innerHTML = '<option value="">Toutes campagnes</option>' +
      campaigns.map(c => `<option value="${c.id}">${escape(c.name)}</option>`).join('');
    const adsetSel = $('#creatives-adset-filter');
    function refillAdsets() {
      const cid = campSel.value;
      const list = cid ? adsets.filter(a => a.campaign_id === cid) : adsets;
      adsetSel.innerHTML = '<option value="">Tous ad sets</option>' +
        list.map(a => `<option value="${a.id}">${escape(a.name)}</option>`).join('');
    }
    refillAdsets();
    campSel.onchange = () => { refillAdsets(); buildCreativeTable(); };
    adsetSel.onchange = () => buildCreativeTable();
    $('#creatives-format-filter').onchange = () => buildCreativeTable();
  }

  function buildCreativeTable() {
    const { ads } = getFilteredData();
    const campId = $('#creatives-camp-filter').value;
    const adsetId = $('#creatives-adset-filter').value;
    const fmtFilter = $('#creatives-format-filter').value;
    let rows = ads;
    if (adsetId) rows = rows.filter(a => a.adset_id === adsetId);
    else if (campId) rows = rows.filter(a => a.campaign_id === campId);
    if (fmtFilter) rows = rows.filter(a => a.creative.type === fmtFilter);

    const avg = getAccountAverages();
    const cols = [
      { key: 'name', label: 'Créa', default: true, sortable: true, align: 'left',
        value: a => a.name,
        render: a => `<td><div class="row-name">${escape(a.name)}</div><div class="row-desc">${formatLabelFor(a.creative.type)} · ${fatigueLabel(a.fatigue_signal?.flag)}</div></td>`,
        exportValue: a => a.name },
      { key: 'format', label: 'Format', default: true, sortable: true,
        value: a => a.creative.type,
        render: a => `<td><span class="format-pill format-pill--${a.creative.type}">${formatLabelFor(a.creative.type)}</span></td>`,
        exportValue: a => a.creative.type },
      { key: 'spend', label: 'Invest.', default: true, sortable: true,
        value: a => a.totals.spend, render: a => `<td class="num">${fmt.eur(a.totals.spend)}</td>`, exportValue: a => a.totals.spend },
      { key: 'impressions', label: 'Impr.', default: true, sortable: true,
        value: a => a.totals.impressions, render: a => `<td class="num">${fmt.num(a.totals.impressions)}</td>`, exportValue: a => a.totals.impressions },
      { key: 'clicks', label: 'Clics', default: true, sortable: true,
        value: a => a.totals.clicks, render: a => `<td class="num">${fmt.num(a.totals.clicks)}</td>`, exportValue: a => a.totals.clicks },
      { key: 'ctr', label: 'CTR', default: true, sortable: true,
        value: a => a.totals.ctr,
        render: a => cellWithDelta(a.totals.ctr, fmt.pct(a.totals.ctr), avg.ctr, 'ctr'),
        exportValue: a => a.totals.ctr },
      { key: 'cpm', label: 'CPM', default: true, sortable: true,
        value: a => a.totals.cpm,
        render: a => cellWithDelta(a.totals.cpm, fmt.eur2(a.totals.cpm), avg.cpm, 'cpm'),
        exportValue: a => a.totals.cpm },
      { key: 'cpc', label: 'CPC', default: false, sortable: true,
        value: a => a.totals.cpc,
        render: a => cellWithDelta(a.totals.cpc, fmt.eur2(a.totals.cpc), avg.cpc, 'cpc'),
        exportValue: a => a.totals.cpc },
      { key: 'frequency', label: 'Fréq.', default: false, sortable: true,
        value: a => a.totals.frequency,
        render: a => cellWithDelta(a.totals.frequency, fmt.num2(a.totals.frequency), avg.frequency, 'frequency'),
        exportValue: a => a.totals.frequency },
      { key: 'fatigue_freq7', label: 'Fréq 7j', default: false, sortable: true,
        value: a => a.fatigue_signal?.frequency_7d || 0,
        render: a => `<td class="num">${fmt.num2(a.fatigue_signal?.frequency_7d || 0)}</td>`,
        exportValue: a => a.fatigue_signal?.frequency_7d || 0 },
      { key: 'fatigue_decay', label: 'ΔCTR', default: false, sortable: true,
        value: a => a.fatigue_signal?.ctr_decay_pct || 0,
        render: a => `<td class="num">${a.fatigue_signal?.ctr_decay_pct ?? 0}%</td>`,
        exportValue: a => a.fatigue_signal?.ctr_decay_pct || 0 },
    ];
    buildPerfTable({
      mount: $('#creatives-table'),
      rows,
      columns: cols,
      defaultSort: { key: 'spend', dir: 'desc' },
      accountAvgs: avg,
      exportName: 'creas',
    });
  }
  function fatigueLabel(flag) {
    return { ok: '<span style="color:var(--sev-success)">✓ stable</span>', medium_fatigue: '<span style="color:var(--sev-medium)">⚠ fatigue modérée</span>', high_fatigue: '<span style="color:var(--sev-high)">⚠ fatigue critique</span>' }[flag] || '—';
  }

  /* ---------- BENCHMARK TAB ---------- */
  function renderBenchmark() {
    const bench = window.AUDIT_BENCHMARK;
    $('#bench-summary').innerHTML = bench.summary;
    $('#bench-sector').textContent = bench.detection.detected_sector;
    $('#bench-confidence').textContent = `${Math.round(bench.detection.confidence * 100)}%`;

    $('#bench-list').innerHTML = bench.metrics.map(m => {
      if (m.benchmark.reliability === 'none') {
        return `
          <div class="bench bench--none">
            <div class="bench__head">
              <div class="bench__label">${escape(m.label)}</div>
              <span class="bench__verdict bench__verdict--none">Pas de bench fiable</span>
            </div>
            <div class="bench__verdict-text">${escape(m.benchmark.note)}</div>
            <div class="bench__source">Valeur compte : <strong>${formatMetricVal(m)}</strong></div>
          </div>`;
      }
      // Gauge clarifiée : on étend le range pour que l'account soit toujours visible
      const min = Math.min(m.account_value, m.benchmark.p25) * 0.92;
      const max = Math.max(m.account_value, m.benchmark.p75) * 1.08;
      const range = max - min;
      const pos = v => `${((v - min) / range) * 100}%`;
      return `
        <div class="bench">
          <div class="bench__head">
            <div class="bench__label">${escape(m.label)}</div>
            <span class="bench__verdict bench__verdict--${m.verdict}">${verdictLabel(m.verdict)}</span>
          </div>
          <div class="bench__gauge">
            <div class="bench__gauge-track">
              <div class="bench__gauge-band" style="left:${pos(m.benchmark.p25)}; right:calc(100% - ${pos(m.benchmark.p75)});"></div>
              <div class="bench__gauge-tick" style="left:${pos(m.benchmark.p25)};"><span>P25</span><span class="v">${formatBenchVal(m, m.benchmark.p25)}</span></div>
              <div class="bench__gauge-tick bench__gauge-tick--median" style="left:${pos(m.benchmark.median)};"><span>Médiane</span><span class="v">${formatBenchVal(m, m.benchmark.median)}</span></div>
              <div class="bench__gauge-tick" style="left:${pos(m.benchmark.p75)};"><span>P75</span><span class="v">${formatBenchVal(m, m.benchmark.p75)}</span></div>
              <div class="bench__gauge-you" style="left:${pos(m.account_value)};">
                <div class="bench__gauge-you-line"></div>
                <div class="bench__gauge-you-pin">
                  <span class="bench__gauge-you-label">Vous êtes ici</span>
                  <span class="bench__gauge-you-value">${formatMetricVal(m)}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="bench__verdict-text">${escape(m.verdict_text)}</div>
          <div class="bench__source">Source : <a href="${m.benchmark.source_url}" target="_blank" rel="noopener">${escape(m.benchmark.source)}</a> (${escape(m.benchmark.source_date)}) · fiabilité <strong>${escape(m.benchmark.reliability)}</strong></div>
        </div>`;
    }).join('');
  }

  function verdictLabel(v) {
    return { best: 'Top tier', above_median: 'Au-dessus médiane', below_median: 'Sous médiane', worst: 'Sous performant' }[v] || v;
  }
  function formatMetricVal(m) {
    if (m.unit === '€') return fmt.eur2(m.account_value);
    if (m.unit === '%') return fmt.pct(m.account_value);
    return fmt.num2(m.account_value);
  }
  function formatBenchVal(m, v) {
    if (m.unit === '€') return fmt.eur2(v);
    if (m.unit === '%') return fmt.pct(v);
    return fmt.num2(v);
  }

  /* ---------- RECOMMENDATIONS TAB ---------- */
  function renderRecommendations() {
    const r = window.AUDIT_RECOMMENDATIONS;
    $('#top-signals').innerHTML = r.top_5_signals.map(s => `
      <div class="signal signal--${s.severity}">
        <div class="signal__icon"><svg class="icon"><use href="#i-${escape(s.icon)}"/></svg></div>
        <div class="signal__body">
          <div class="signal__title">#${s.rank} — ${escape(s.title)}</div>
          ${s.kpi ? `<div style="margin: 4px 0 6px 0; font-family: var(--font-mono); font-weight: 600; color: var(--color-primary-dark)">${escape(s.kpi.value)} <span style="font-weight:400; color:var(--color-text-muted)">${escape(s.kpi.label)}</span></div>` : ''}
          <ul style="margin: 0; padding-left: 18px; font-size: .85rem; color: var(--color-text-muted)">${s.evidence_lines.map(l => `<li>${escape(l)}</li>`).join('')}</ul>
        </div>
      </div>`).join('');

    $('#reco-grid').innerHTML = r.recommendations.map(re => `
      <div class="reco reco--${re.impact}">
        <h3 class="reco__title">${escape(re.title)}</h3>
        <p class="reco__summary">${escape(re.summary)}</p>
        <div class="reco__chips">
          <span class="reco-chip"><span class="reco-chip__label">Impact</span><span class="reco-chip__value">${escape(re.impact)}</span></span>
          <span class="reco-chip"><span class="reco-chip__label">Effort</span><span class="reco-chip__value">${escape(re.effort)}</span></span>
          <span class="reco-chip"><svg class="icon"><use href="#i-clock"/></svg><span class="reco-chip__value">${escape(re.time_to_value.replace('_', ' '))}</span></span>
        </div>
        ${re.expected_outcome ? `<div class="reco__outcome">${escape(re.expected_outcome)}</div>` : ''}
        <div class="reco__footer">
          <span>${escape(re.category)}</span>
          <span>${escape(re.assignee_role || '')}</span>
        </div>
      </div>`).join('');

    priorityMatrix?.destroy();
    priorityMatrix = window.AuditCharts.buildPriorityMatrix($('#priority-matrix').getContext('2d'), r.recommendations);
    $('#closing-statement').innerHTML = r.closing_statement;
  }

  /* ---------- EXPORTS ---------- */
  function setupExports() {
    $('#export-pdf').addEventListener('click', () => window.AuditExport.toPDF());
    $('#export-pptx').addEventListener('click', () => window.AuditExport.toPPTX());
  }

  /* ---------- SIGNAL CARD ---------- */
  function signalCard(s) {
    return `
      <div class="signal signal--${s.severity}">
        <div class="signal__icon"><svg class="icon"><use href="#i-${signalIcon(s.category)}"/></svg></div>
        <div class="signal__body">
          <div class="signal__title">${escape(s.title)}</div>
          <div class="signal__evidence">${escape(s.evidence)}</div>
          <div class="signal__action"><strong>Action :</strong> ${escape(s.action)} ${s.impact_estimate ? `· <em>${escape(s.impact_estimate)}</em>` : ''}</div>
        </div>
      </div>`;
  }
  function signalIcon(cat) {
    return { fatigue: 'fire', targeting: 'target', budget: 'bolt', tracking: 'warn', structure: 'layers', creative: 'image' }[cat] || 'warn';
  }

  /* ---------- UTILS ---------- */
  function escape(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function formatDateShort(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Expose pour debug + tests
  window.AuditApp = { renderAll, getFilteredData, getAccountAverages, STATE };
})();
