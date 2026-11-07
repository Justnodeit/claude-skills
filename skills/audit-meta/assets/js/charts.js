/* ============================================================
   audit-meta · charts.js
   Configurations Chart.js — courbes multi-séries, sparklines,
   donuts. Reçoit data depuis window.AUDIT_DATA.
   ============================================================ */

(function () {
  const SERIES_COLORS = [
    getCss('--series-1'),
    getCss('--series-2'),
    getCss('--series-3'),
    getCss('--series-4'),
    getCss('--series-5'),
    getCss('--series-6'),
    getCss('--series-7'),
  ];
  const TEXT_MUTED = getCss('--color-text-muted');
  const BORDER = getCss('--color-border');
  const SURFACE = getCss('--color-surface');

  function getCss(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';
  }

  /* ---------- Aggregation cumulative (CPM/CPC = cum_spend / cum_X × ratio) ----------
     Convention agence : à chaque date T on affiche le KPI calculé sur le CUMUL depuis
     le début de la période. Cela lisse les variations journalières et reflète la
     vraie trajectoire de la performance.
     - Investissement : cumul croissant
     - CPM : cum_spend_T / cum_impr_T × 1000
     - CPC : cum_spend_T / cum_clicks_T
     - Frequency : moyenne pondérée sur la période (impr_cum / reach_cum si reach
       est dispo, sinon moyenne sur la fenêtre)
  */
  function bucketKey(dateIso, granularity) {
    const dt = new Date(dateIso);
    if (granularity === 'daily') return dateIso;
    if (granularity === 'weekly') {
      const dow = dt.getUTCDay() || 7;
      const monday = new Date(dt);
      monday.setUTCDate(dt.getUTCDate() - dow + 1);
      return monday.toISOString().slice(0, 10);
    }
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-01`;
  }

  function aggregateAll(timeseries, granularity) {
    // 1) Bucket en granularité
    const buckets = new Map();
    timeseries.forEach((d) => {
      const key = bucketKey(d.date, granularity);
      if (!buckets.has(key)) buckets.set(key, { date: key, spend: 0, impressions: 0, clicks: 0, frequency_sum: 0, n: 0 });
      const b = buckets.get(key);
      b.spend += d.spend || 0;
      b.impressions += d.impressions || 0;
      b.clicks += d.clicks || 0;
      b.frequency_sum += d.frequency || 0;
      b.n += 1;
    });
    const points = [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));

    // 2) Cumuls
    let cumSpend = 0, cumImpr = 0, cumClk = 0;
    const out = { spend: [], cpm: [], cpc: [], frequency: [] };
    points.forEach((p) => {
      cumSpend += p.spend;
      cumImpr += p.impressions;
      cumClk += p.clicks;
      out.spend.push({ x: p.date, y: round(cumSpend, 2) });
      out.cpm.push({ x: p.date, y: cumImpr ? round((cumSpend / cumImpr) * 1000, 2) : 0 });
      out.cpc.push({ x: p.date, y: cumClk ? round(cumSpend / cumClk, 3) : 0 });
      out.frequency.push({ x: p.date, y: p.n ? round(p.frequency_sum / p.n, 2) : 0 });
    });
    return out;
  }
  function round(n, d) { const k = Math.pow(10, d); return Math.round(n * k) / k; }

  function mergeTimeseries(campaigns) {
    const merged = {};
    campaigns.forEach((c) => {
      c.timeseries.forEach((d) => {
        if (!merged[d.date]) merged[d.date] = { date: d.date, spend: 0, impressions: 0, clicks: 0, frequency_sum: 0, ctr_sum: 0, n: 0 };
        merged[d.date].spend += d.spend || 0;
        merged[d.date].impressions += d.impressions || 0;
        merged[d.date].clicks += d.clicks || 0;
        merged[d.date].frequency_sum += d.frequency || 0;
        merged[d.date].ctr_sum += d.ctr || 0;
        merged[d.date].n += 1;
      });
    });
    return Object.values(merged).sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({
      date: d.date,
      spend: d.spend,
      impressions: d.impressions,
      clicks: d.clicks,
      ctr: d.n ? d.ctr_sum / d.n : 0,
      frequency: d.n ? d.frequency_sum / d.n : 0,
    }));
  }

  /* ---------- Custom tooltip (Chart.js) ----------
     Affichage TOUJOURS visible quand on est dans le chart, montre toutes
     les séries actives avec leur valeur à la date hoverée. */
  function customTooltip(context) {
    let el = document.getElementById('cjs-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cjs-tooltip';
      el.className = 'cjs-tooltip';
      document.body.appendChild(el);
    }
    const tt = context.tooltip;
    if (!tt || tt.opacity === 0) { el.dataset.visible = 'false'; return; }

    const title = tt.title?.[0] || '';
    // Inclure toutes les séries actives (pas seulement le point intersecté)
    const allSeries = context.chart.data.datasets
      .map((ds, idx) => ({ ds, idx, hidden: !context.chart.isDatasetVisible(idx) }))
      .filter(s => !s.hidden);

    // dp.parsed.y peut manquer si la série n'a pas de point à cette date — on fallback sur la valeur du dataset
    const xLabel = tt.dataPoints?.[0]?.label || title;
    const rows = allSeries.map(s => {
      const dp = tt.dataPoints.find(p => p.datasetIndex === s.idx);
      const color = Array.isArray(s.ds.borderColor) ? s.ds.borderColor[0] : s.ds.borderColor;
      const fmtFn = s.ds.metaFormatter || ((v) => v);
      const val = dp ? fmtFn(dp.parsed.y) : '—';
      return `<div class="cjs-tooltip__row">
        <span class="swatch" style="background:${color}"></span>
        <span class="lbl">${s.ds.label}</span>
        <span class="val">${val}</span>
      </div>`;
    }).join('');
    el.innerHTML = `<div class="cjs-tooltip__date">${formatDate(title)}</div>${rows}`;
    el.dataset.visible = 'true';

    const rect = context.chart.canvas.getBoundingClientRect();
    const left = rect.left + window.scrollX + tt.caretX;
    const top = rect.top + window.scrollY + tt.caretY - 12;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  /* ---------- Formatters ---------- */
  const fmt = {
    eur: (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v),
    eur2: (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(v),
    num: (v) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v),
    num2: (v) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(v),
    pct: (v) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(v) + ' %',
  };
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---------- Build main performance chart ---------- */
  function buildPerfChart(ctx, data, granularity, visible) {
    const merged = mergeTimeseries(data.campaigns);
    const agg = aggregateAll(merged, granularity);
    const cfg = {
      type: 'line',
      data: {
        datasets: [
          buildDataset('Invest. cumulé', agg.spend, SERIES_COLORS[0], 'y_eur', fmt.eur, visible.spend),
          buildDataset('CPM cumulé', agg.cpm, SERIES_COLORS[1], 'y_unit', fmt.eur2, visible.cpm),
          buildDataset('CPC cumulé', agg.cpc, SERIES_COLORS[2], 'y_unit', fmt.eur2, visible.cpc),
          buildDataset('Fréquence', agg.frequency, SERIES_COLORS[4], 'y_freq', fmt.num2, visible.frequency),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 600, easing: 'easeOutCubic' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false, external: customTooltip },
        },
        scales: {
          x: {
            type: 'time',
            time: { tooltipFormat: 'yyyy-MM-dd', displayFormats: { day: 'd MMM', week: 'd MMM', month: 'MMM yy' } },
            grid: { display: false },
            ticks: { color: TEXT_MUTED, font: { size: 11 }, maxRotation: 0 },
            border: { color: BORDER },
          },
          y_eur: {
            type: 'linear', position: 'left',
            grid: { color: BORDER, drawBorder: false },
            ticks: { color: TEXT_MUTED, font: { size: 11 }, callback: (v) => fmt.eur(v) },
            border: { display: false },
          },
          y_unit: {
            type: 'linear', position: 'right',
            grid: { display: false },
            ticks: { color: TEXT_MUTED, font: { size: 11 }, callback: (v) => fmt.eur2(v) },
            border: { display: false },
          },
          y_freq: { display: false, type: 'linear' },
        },
      },
    };
    return new Chart(ctx, cfg);
  }

  function buildDataset(label, data, color, yAxis, formatter, visible) {
    return {
      label,
      data,
      yAxisID: yAxis,
      borderColor: color,
      backgroundColor: color + '22',
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointRadius: 0,
      pointHoverRadius: 5,
      borderWidth: 2.2,
      tension: 0.3,
      fill: false,
      hidden: !visible,
      metaFormatter: formatter,
    };
  }

  /* ---------- Sparkline (used in KPI cards) ---------- */
  function buildSparkline(canvas, points, color) {
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels: points.map((_, i) => i),
        datasets: [{
          data: points,
          borderColor: color,
          borderWidth: 1.8,
          pointRadius: 0,
          fill: true,
          backgroundColor: (ctx) => {
            const c = ctx.chart.ctx;
            const g = c.createLinearGradient(0, 0, 0, ctx.chart.height);
            g.addColorStop(0, color + '44');
            g.addColorStop(1, color + '00');
            return g;
          },
          tension: 0.35,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: { duration: 800 },
      },
    });
  }

  /* ---------- Format distribution donut ---------- */
  function buildFormatDonut(canvas, distribution) {
    const labels = Object.keys(distribution);
    const data = labels.map((k) => Math.round((distribution[k].share_spend || 0) * 100));
    const colors = labels.map((_, i) => SERIES_COLORS[i % SERIES_COLORS.length]);
    return new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#fff', borderWidth: 3, hoverOffset: 6 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        plugins: {
          legend: { position: 'bottom', labels: { color: TEXT_MUTED, font: { size: 12 }, padding: 14, usePointStyle: true } },
          tooltip: { backgroundColor: getCss('--color-text'), padding: 10, displayColors: false, callbacks: { label: (c) => `${c.label} : ${c.parsed}% du spend` } },
        },
        animation: { animateRotate: true, duration: 900, easing: 'easeOutCubic' },
      },
    });
  }

  /* ---------- Priority matrix (scatter Impact × Effort) ---------- */
  function buildPriorityMatrix(canvas, recos) {
    const data = recos.map((r) => ({ x: impactScore(r.impact), y: effortScore(r.effort), label: r.id, title: r.title }));
    return new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          data,
          backgroundColor: SERIES_COLORS[0],
          pointRadius: 9,
          pointHoverRadius: 12,
          borderColor: '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: getCss('--color-text'), padding: 12, displayColors: false, callbacks: { label: (c) => c.raw.title } },
        },
        scales: {
          x: { min: 0, max: 1, title: { display: true, text: 'Impact →', color: TEXT_MUTED, font: { size: 12, weight: 'bold' } }, grid: { color: BORDER }, ticks: { display: false }, border: { color: BORDER } },
          y: { min: 0, max: 1, reverse: true, title: { display: true, text: 'Effort →', color: TEXT_MUTED, font: { size: 12, weight: 'bold' } }, grid: { color: BORDER }, ticks: { display: false }, border: { color: BORDER } },
        },
        animation: { duration: 800 },
      },
    });
  }
  function impactScore(i) { return i === 'high' ? 0.85 : i === 'medium' ? 0.55 : 0.25; }
  function effortScore(e) { return e === 'high' ? 0.85 : e === 'medium' ? 0.5 : 0.2; }

  /* ---------- Export to window ---------- */
  window.AuditCharts = {
    buildPerfChart,
    buildSparkline,
    buildFormatDonut,
    buildPriorityMatrix,
    aggregateAll,
    mergeTimeseries,
    fmt,
    SERIES_COLORS,
  };
})();
