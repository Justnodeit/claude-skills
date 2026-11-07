/* ============================================================
   audit-meta · export.js (v1.2)
   PDF : pagination block-aware (aucune coupure en milieu de section)
   PPTX : cover + synthèse + slide résumé par section + annexes capture
   Excel : SheetJS, déclenché par chaque tableau (logique dans app.js)
   ============================================================ */

(function () {
  'use strict';

  const TABS = [
    { id: 'panel-global',    title: 'Vue globale' },
    { id: 'panel-adsets',    title: 'Ad sets' },
    { id: 'panel-creatives', title: 'Créatives' },
    { id: 'panel-benchmark', title: 'Benchmark sectoriel' },
    { id: 'panel-reco',      title: 'Recommandations' },
  ];

  function getColor(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
  function hex(name, fallback) {
    return getColor(name, fallback).replace('#', '');
  }

  // Garantit que le logo est rasterisé et brand prêt avant tout export
  async function awaitBrand() {
    if (window.BRAND?.ready) {
      try { await window.BRAND.ready; } catch (_) { /* on continue sans logo */ }
    }
  }

  /* ============ Tab activation helper ============ */
  async function activateTab(tabId) {
    document.querySelectorAll('.tabpanel').forEach(p => p.setAttribute('data-active', p.id === tabId ? 'true' : 'false'));
    // laisser le temps aux charts de re-render
    await new Promise(r => setTimeout(r, 350));
  }
  function restoreView() {
    document.body.removeAttribute('data-export-mode');
    const currentTab = document.querySelector('.tab[aria-selected="true"]')?.dataset.target;
    if (currentTab) document.querySelectorAll('.tabpanel').forEach(p => p.setAttribute('data-active', p.id === currentTab ? 'true' : 'false'));
  }

  /* ============ Block collection (regroupe section-head + next) ============ */
  function collectBlocks(tabEl) {
    const children = [...tabEl.children].filter(c => {
      if (c.classList.contains('no-print')) return false;
      if (c.offsetHeight === 0) return false;
      // skip pure decorative wrappers vides
      if (c.children.length === 0 && !c.textContent.trim()) return false;
      return true;
    });
    return children;
  }

  /* ============ Capture d'un élément en canvas ============ */
  async function captureElement(el, scale = 2) {
    return await html2canvas(el, {
      scale,
      backgroundColor: getColor('--color-bg', '#ffffff'),
      useCORS: true,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
    });
  }

  /* ============ PDF ============ */
  async function toPDF() {
    if (typeof window.jspdf === 'undefined') { alert('jsPDF non chargé'); return; }
    const btn = document.getElementById('export-pdf');
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg class="icon"><use href="#i-download"/></svg> Génération…';
    document.body.setAttribute('data-export-mode', 'true');
    await awaitBrand();

    try {
      const B = window.BRAND?.pdf || {};
      const brandName = window.BRAND?.name || 'Node it';
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
      const PAGE_W = pdf.internal.pageSize.getWidth();
      const PAGE_H = pdf.internal.pageSize.getHeight();
      const MARGIN_X = 36;
      const MARGIN_TOP = 64;
      const MARGIN_BOT = 40;
      const USABLE_W = PAGE_W - 2 * MARGIN_X;
      const USABLE_H = PAGE_H - MARGIN_TOP - MARGIN_BOT;
      const BLOCK_GAP = 14;

      const m = window.AUDIT_DATA.meta;
      const state = window.AUDIT_STATE;
      const primaryHex = B.primary_hex || '5B5FEF';
      const textHex = B.text_hex || '0F172A';
      const mutedHex = B.muted_hex || '64748B';
      const font = B.font || 'helvetica';

      // Police par défaut pour tout le PDF (helvetica = sécurisée)
      pdf.setFont(font, 'normal');

      /* --- Cover --- */
      drawCover(pdf, m, state, PAGE_W, PAGE_H, MARGIN_X, primaryHex, textHex, mutedHex, brandName, B.logo_png_data_url, font);

      /* --- Synthèse exécutive (page 2) --- */
      pdf.addPage();
      drawHeader(pdf, 'Synthèse exécutive', m.account_name, PAGE_W, MARGIN_X, textHex, mutedHex, font);
      drawExecSummary(pdf, PAGE_W, PAGE_H, MARGIN_X, MARGIN_TOP, MARGIN_BOT, primaryHex, textHex, mutedHex, font);

      /* --- Onglets : 1 nouvelle page par onglet, pagination block-aware --- */
      for (let ti = 0; ti < TABS.length; ti++) {
        const tab = TABS[ti];
        await activateTab(tab.id);
        pdf.addPage();
        drawHeader(pdf, tab.title, m.account_name, PAGE_W, MARGIN_X, textHex, mutedHex, font);
        let cursorY = MARGIN_TOP;
        let pageInTab = 1;

        const tabEl = document.getElementById(tab.id);
        const blocks = collectBlocks(tabEl);

        // Pré-capture des canvases pour chaque bloc + calcul des hauteurs scalées
        const captured = [];
        for (const block of blocks) {
          const canvas = await captureElement(block, 2);
          const w = USABLE_W;
          const h = (canvas.height / canvas.width) * w;
          captured.push({ el: block, canvas, w, h });
        }

        for (let bi = 0; bi < captured.length; bi++) {
          const b = captured[bi];
          const isHeader = b.el.classList.contains('section-head');
          const next = captured[bi + 1];

          // Bloc plus haut que la page entière : on lui consacre une page
          if (b.h > USABLE_H) {
            if (cursorY > MARGIN_TOP) {
              pdf.addPage();
              pageInTab++;
              drawHeader(pdf, `${tab.title} · suite`, m.account_name, PAGE_W, MARGIN_X, textHex, mutedHex, font);
              cursorY = MARGIN_TOP;
            }
            // Scale pour rentrer en hauteur ; on conserve la proportion donc on perd un peu en largeur
            const fitH = USABLE_H;
            const fitW = (b.canvas.width / b.canvas.height) * fitH;
            const x = MARGIN_X + (USABLE_W - fitW) / 2;
            pdf.addImage(b.canvas.toDataURL('image/jpeg', 0.92), 'JPEG', x, cursorY, fitW, fitH);
            cursorY = MARGIN_TOP + USABLE_H;
            // Force page suivante pour le prochain block
            if (bi + 1 < captured.length) {
              pdf.addPage();
              pageInTab++;
              drawHeader(pdf, `${tab.title} · suite`, m.account_name, PAGE_W, MARGIN_X, textHex, mutedHex, font);
              cursorY = MARGIN_TOP;
            }
            continue;
          }

          // Si c'est une section-head et qu'il n'y a pas de place pour elle + le bloc suivant → nouvelle page
          if (isHeader && next) {
            const needed = b.h + BLOCK_GAP + Math.min(next.h, USABLE_H * 0.4);
            if (cursorY + needed > MARGIN_TOP + USABLE_H) {
              pdf.addPage();
              pageInTab++;
              drawHeader(pdf, `${tab.title} · suite`, m.account_name, PAGE_W, MARGIN_X, textHex, mutedHex, font);
              cursorY = MARGIN_TOP;
            }
          } else {
            // Bloc normal : nouvelle page si pas de place
            if (cursorY + b.h > MARGIN_TOP + USABLE_H) {
              pdf.addPage();
              pageInTab++;
              drawHeader(pdf, `${tab.title} · suite`, m.account_name, PAGE_W, MARGIN_X, textHex, mutedHex, font);
              cursorY = MARGIN_TOP;
            }
          }

          pdf.addImage(b.canvas.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN_X, cursorY, b.w, b.h);
          cursorY += b.h + BLOCK_GAP;
        }
      }

      // Pied de page sur toutes les pages
      const total = pdf.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        pdf.setPage(p);
        pdf.setFont(font, 'normal'); pdf.setFontSize(8); pdf.setTextColor(mutedHex);
        pdf.text(`${p} / ${total}`, PAGE_W - MARGIN_X, PAGE_H - 18, { align: 'right' });
        if (p > 1) pdf.text(`Audit Meta Ads · ${brandName}`, MARGIN_X, PAGE_H - 18);
      }

      const slug = (m.account_name || 'audit').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      pdf.save(`audit-meta-${slug}.pdf`);
    } catch (e) {
      console.error('PDF export error', e);
      alert('Erreur export PDF : ' + e.message);
    } finally {
      restoreView();
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  }

  /* ============ PDF helpers ============ */
  function drawCover(pdf, m, state, PAGE_W, PAGE_H, MARGIN, primaryHex, textHex, mutedHex, brandName, logoPng, font) {
    // Bandeau coloré primary
    pdf.setFillColor(primaryHex);
    pdf.rect(0, 0, PAGE_W, 110, 'F');

    // Logo en haut à gauche (si disponible)
    if (logoPng) {
      try { pdf.addImage(logoPng, 'PNG', MARGIN, 32, 46, 46); } catch (_) {}
    }
    const titleX = logoPng ? MARGIN + 60 : MARGIN;
    pdf.setFont(font, 'bold'); pdf.setFontSize(11); pdf.setTextColor('FFFFFF');
    pdf.text(`${brandName.toUpperCase()} · AUDIT META ADS`, titleX, 56);
    pdf.setFont(font, 'normal'); pdf.setFontSize(9); pdf.setTextColor('FFFFFF');
    if (window.BRAND?.tagline) pdf.text(window.BRAND.tagline, titleX, 72);

    // Titre principal
    pdf.setFont(font, 'bold'); pdf.setFontSize(38); pdf.setTextColor(textHex);
    pdf.text(m.account_name, MARGIN, 200);
    pdf.setFont(font, 'normal'); pdf.setFontSize(16); pdf.setTextColor(mutedHex);
    pdf.text(`${m.date_range.start} → ${m.date_range.end} · ${m.currency}`, MARGIN, 230);

    // Carte info
    const cardY = 280, cardH = 160;
    pdf.setDrawColor('E5E7EB'); pdf.setFillColor('FAFAFB');
    pdf.roundedRect(MARGIN, cardY, PAGE_W - 2 * MARGIN, cardH, 8, 8, 'FD');
    pdf.setFont(font, 'bold'); pdf.setFontSize(10); pdf.setTextColor(mutedHex);
    pdf.text('MODE', MARGIN + 24, cardY + 32);
    pdf.text('PÉRIODE', MARGIN + 220, cardY + 32);
    pdf.text('GRANULARITÉ', MARGIN + 420, cardY + 32);
    pdf.text('GÉNÉRÉ LE', MARGIN + 620, cardY + 32);
    pdf.setFont(font, 'bold'); pdf.setFontSize(14); pdf.setTextColor(textHex);
    pdf.text(state?.mode === 'campaign_report' ? 'Reporting campagnes' : 'Audit de compte', MARGIN + 24, cardY + 60);
    pdf.text(`${daysBetween(m.date_range.start, m.date_range.end)} jours`, MARGIN + 220, cardY + 60);
    pdf.text(({ daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel' })[state?.granularity || 'weekly'], MARGIN + 420, cardY + 60);
    pdf.text(new Date().toLocaleDateString('fr-FR'), MARGIN + 620, cardY + 60);

    // Compteurs
    const data = window.AUDIT_DATA;
    pdf.setFont(font, 'normal'); pdf.setFontSize(11); pdf.setTextColor(mutedHex);
    pdf.text(`Périmètre analysé : ${data.campaigns.length} campagnes · ${data.adsets.length} ad sets · ${data.ads.length} créas`, MARGIN + 24, cardY + 110);

    // Pied
    pdf.setFont(font, 'normal'); pdf.setFontSize(9); pdf.setTextColor(mutedHex);
    const website = (window.BRAND?.website || '').replace(/^https?:\/\//, '');
    pdf.text(`${website} · audit-meta v1.3`, MARGIN, PAGE_H - 24);
  }

  function drawHeader(pdf, title, account, PAGE_W, MARGIN, textHex, mutedHex, font) {
    pdf.setFont(font, 'normal'); pdf.setFontSize(9); pdf.setTextColor(mutedHex);
    pdf.text(account, MARGIN, 28);
    pdf.setFont(font, 'bold'); pdf.setFontSize(20); pdf.setTextColor(textHex);
    pdf.text(title, MARGIN, 50);
    // Ligne sous le titre
    pdf.setDrawColor('E5E7EB');
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN, 56, PAGE_W - MARGIN, 56);
  }

  function drawExecSummary(pdf, PAGE_W, PAGE_H, MARGIN, MARGIN_TOP, MARGIN_BOT, primaryHex, textHex, mutedHex, font) {
    const insights = window.AUDIT_INSIGHTS;
    const recos = window.AUDIT_RECOMMENDATIONS;
    let y = MARGIN_TOP;

    // KPI grid 3×2
    const kpis = insights.headline_kpis.slice(0, 6);
    const cellW = (PAGE_W - 2 * MARGIN - 16) / 3;
    const cellH = 70;
    kpis.forEach((k, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = MARGIN + col * (cellW + 8);
      const cy = y + row * (cellH + 8);
      pdf.setDrawColor('E5E7EB'); pdf.setFillColor('FAFAFB');
      pdf.roundedRect(x, cy, cellW, cellH, 6, 6, 'FD');
      pdf.setFont(font, 'normal'); pdf.setFontSize(9); pdf.setTextColor(mutedHex);
      pdf.text(k.label.toUpperCase(), x + 14, cy + 18);
      pdf.setFont(font, 'bold'); pdf.setFontSize(18); pdf.setTextColor(textHex);
      pdf.text(k.value, x + 14, cy + 42);
      if (k.delta) {
        pdf.setFont(font, 'normal'); pdf.setFontSize(8);
        const dCol = k.delta_type === 'positive' ? (window.BRAND?.pdf?.sev_success_hex || '10B981') : k.delta_type === 'negative' ? (window.BRAND?.pdf?.sev_high_hex || 'EF4444') : mutedHex;
        pdf.setTextColor(dCol);
        pdf.text(k.delta, x + 14, cy + 58);
      }
    });
    y += 2 * (cellH + 8) + 12;

    // Closing statement
    pdf.setFont(font, 'bold'); pdf.setFontSize(11); pdf.setTextColor(textHex);
    pdf.text('Synthèse', MARGIN, y);
    y += 16;
    pdf.setFont(font, 'normal'); pdf.setFontSize(11); pdf.setTextColor(textHex);
    const stripped = stripHtml(recos.closing_statement);
    const lines = pdf.splitTextToSize(stripped, PAGE_W - 2 * MARGIN);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 14 + 16;

    // Top 5 signaux
    pdf.setFont(font, 'bold'); pdf.setFontSize(11); pdf.setTextColor(textHex);
    pdf.text('Top 5 signaux opérationnels', MARGIN, y);
    y += 16;
    const B = window.BRAND?.pdf || {};
    recos.top_5_signals.forEach((s) => {
      if (y > PAGE_H - MARGIN_BOT - 20) return;
      const dotCol = ({ high: B.sev_high_hex || 'EF4444', critical: 'B91C1C', medium: B.sev_medium_hex || 'F59E0B', info: B.sev_info_hex || '06B6D4' })[s.severity] || mutedHex;
      pdf.setFillColor(dotCol);
      pdf.circle(MARGIN + 4, y - 4, 3.5, 'F');
      pdf.setFont(font, 'bold'); pdf.setFontSize(10); pdf.setTextColor(textHex);
      const tline = pdf.splitTextToSize(`#${s.rank} — ${s.title}`, PAGE_W - 2 * MARGIN - 16);
      pdf.text(tline, MARGIN + 14, y);
      y += tline.length * 12;
      if (s.kpi) {
        pdf.setFont(font, 'normal'); pdf.setFontSize(9); pdf.setTextColor(primaryHex);
        pdf.text(`${s.kpi.value} ${s.kpi.label}`, MARGIN + 14, y);
        y += 12;
      }
      y += 6;
    });
  }

  /* ============ PPTX ============ */
  async function toPPTX() {
    if (typeof PptxGenJS === 'undefined') { alert('PptxGenJS non chargé'); return; }
    const btn = document.getElementById('export-pptx');
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg class="icon"><use href="#i-download"/></svg> Génération…';
    document.body.setAttribute('data-export-mode', 'true');
    await awaitBrand();

    try {
      const B = window.BRAND?.pptx || {};
      const brandName = window.BRAND?.name || 'Node it';
      const website = (window.BRAND?.website || '').replace(/^https?:\/\//, '');
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.title = 'Audit Meta Ads';
      const m = window.AUDIT_DATA.meta;
      const slug = (m.account_name || 'audit').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const primaryHex = B.primary_hex || '5B5FEF';
      const text = B.text_hex || '0F172A';
      const muted = B.muted_hex || '64748B';
      const font = B.font || 'Inter';

      // Cover
      const cover = pptx.addSlide();
      cover.background = { color: 'FFFFFF' };
      cover.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 1.2, fill: { color: primaryHex }, line: { type: 'none' } });
      // Logo si dispo
      if (B.logo_png_data_url) {
        cover.addImage({ data: B.logo_png_data_url, x: 0.5, y: 0.3, w: 0.6, h: 0.6 });
      }
      const titleX = B.logo_png_data_url ? 1.25 : 0.5;
      cover.addText(`${brandName.toUpperCase()} · AUDIT META ADS`, { x: titleX, y: 0.35, w: 11, h: 0.4, fontSize: 13, bold: true, color: 'FFFFFF', fontFace: font });
      if (window.BRAND?.tagline) cover.addText(window.BRAND.tagline, { x: titleX, y: 0.65, w: 11, h: 0.3, fontSize: 10, color: 'FFFFFF', fontFace: font });
      cover.addText(m.account_name, { x: 0.5, y: 2.0, w: 12, h: 1.0, fontSize: 42, bold: true, color: text, fontFace: font });
      cover.addText(`${m.date_range.start} → ${m.date_range.end} · ${m.currency}`, { x: 0.5, y: 3.2, w: 12, h: 0.5, fontSize: 18, color: muted, fontFace: font });
      cover.addText(`Mode : ${window.AUDIT_STATE?.mode === 'campaign_report' ? 'Reporting de campagnes' : 'Audit de compte'} · ${window.AUDIT_DATA.campaigns.length} campagnes`, { x: 0.5, y: 3.8, w: 12, h: 0.4, fontSize: 13, color: muted, fontFace: font });
      cover.addText(`Généré par ${brandName} · ${website}`, { x: 0.5, y: 6.9, w: 12, h: 0.3, fontSize: 10, color: '94A3B8', fontFace: font });

      // Synthèse exécutive
      const summary = pptx.addSlide();
      summary.addText('Synthèse exécutive', { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 22, bold: true, color: text, fontFace: font });
      const insights = window.AUDIT_INSIGHTS;
      const reco = window.AUDIT_RECOMMENDATIONS;
      const kpis = insights.headline_kpis.slice(0, 6);
      const cellW = 4, cellH = 1;
      kpis.forEach((k, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = 0.5 + col * (cellW + 0.2);
        const y = 1.0 + row * (cellH + 0.2);
        summary.addShape(pptx.shapes.RECTANGLE, { x, y, w: cellW, h: cellH, fill: { color: B.surface_hex || 'FAFAFB' }, line: { color: B.border_hex || 'E5E7EB', width: 1 } });
        summary.addText(k.label, { x: x + 0.15, y: y + 0.08, w: cellW - 0.3, h: 0.25, fontSize: 10, color: muted, fontFace: font });
        summary.addText(k.value, { x: x + 0.15, y: y + 0.32, w: cellW - 0.3, h: 0.45, fontSize: 22, bold: true, color: text, fontFace: font });
        if (k.delta) summary.addText(k.delta, { x: x + 0.15, y: y + 0.75, w: cellW - 0.3, h: 0.18, fontSize: 9, color: k.delta_type === 'positive' ? (B.sev_success_hex || '10B981') : k.delta_type === 'negative' ? (B.sev_high_hex || 'EF4444') : muted, fontFace: font });
      });
      summary.addText(stripHtml(reco.closing_statement), { x: 0.5, y: 3.6, w: 12.3, h: 1.5, fontSize: 14, color: text, fontFace: font, valign: 'top' });
      summary.addText('Top signaux :', { x: 0.5, y: 5.3, w: 12, h: 0.3, fontSize: 13, bold: true, color: text, fontFace: font });
      reco.top_5_signals.slice(0, 3).forEach((s, i) => {
        summary.addText(`#${s.rank} · ${s.title}${s.kpi ? ` — ${s.kpi.value} ${s.kpi.label}` : ''}`,
          { x: 0.5, y: 5.6 + i * 0.35, w: 12.3, h: 0.3, fontSize: 12, color: text, fontFace: font });
      });

      // Slides résumé par section
      addSummarySlide(pptx, font, 'Vue globale', [
        { kind: 'paragraph', text: stripHtml(insights.global.summary) },
        { kind: 'bullets', title: 'Signaux principaux', items: insights.global.signals.slice(0, 6).map(s => `${sevDot(s.severity)} ${s.title} — ${s.evidence}`) },
      ]);
      addSummarySlide(pptx, font, 'Ad sets', [
        { kind: 'paragraph', text: stripHtml(insights.adsets.summary) },
        { kind: 'bullets', title: 'Top efficacité', items: insights.adsets.rankings.best_efficiency.map(id => `• ${idToName(id, 'adsets')}`) },
        { kind: 'bullets', title: 'Chevauchements détectés', items: (insights.adsets.audience_overlap_warnings || []).map(o => `⚠ ${o.adset_ids.join(' ∩ ')} (${o.overlap_estimated_pct}%) — ${o.recommendation}`) },
      ]);
      addSummarySlide(pptx, font, 'Créatives', [
        { kind: 'paragraph', text: stripHtml(insights.creatives.summary) },
        { kind: 'bullets', title: 'Top performers', items: insights.creatives.top_performers.map(p => `★ ${idToName(p.ad_id, 'ads')} (score ${p.score}) — ${p.format_insight}`) },
        { kind: 'bullets', title: 'Patterns gagnants', items: insights.creatives.hook_patterns_detected.map(h => `• ${h.pattern} — ${h.lift_ctr}`) },
      ]);
      const bench = window.AUDIT_BENCHMARK;
      addSummarySlide(pptx, font, 'Benchmark sectoriel', [
        { kind: 'paragraph', text: `Secteur détecté : ${bench.detection.detected_sector} (confiance ${Math.round(bench.detection.confidence * 100)}%). ${stripHtml(bench.summary)}` },
        { kind: 'bullets', title: 'Métriques benchmarkées', items: bench.metrics.filter(b => b.benchmark.reliability !== 'none').map(b => `${b.label} : compte ${formatMetric(b)} — bench médiane ${formatBench(b)} → ${verdictText(b.verdict)}`) },
      ]);
      addSummarySlide(pptx, font, 'Recommandations', [
        { kind: 'paragraph', text: 'Plan d\'action priorisé par impact × effort × time-to-value.' },
        { kind: 'bullets', title: 'Actions immédiates (<1 sem)', items: reco.execution_plan.immediate.map(id => `• ${recoText(reco, id)}`) },
        { kind: 'bullets', title: 'Court terme (2-4 sem)', items: reco.execution_plan.short_term.map(id => `• ${recoText(reco, id)}`) },
        { kind: 'bullets', title: 'Moyen terme', items: reco.execution_plan.medium_term.map(id => `• ${recoText(reco, id)}`) },
      ]);

      // Annexes : capture brute par onglet (1 slide chacun)
      for (const t of TABS) {
        await activateTab(t.id);
        const tabEl = document.getElementById(t.id);
        const canvas = await captureElement(tabEl, 1.4);
        const slide = pptx.addSlide();
        slide.addText(`${t.title} — capture détaillée`, { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 18, bold: true, color: text, fontFace: font });
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const slideW = 13.33, slideH = 7.5;
        const maxW = slideW - 1, maxH = slideH - 1.1;
        const r = canvas.width / canvas.height;
        let w = maxW, h = maxW / r;
        if (h > maxH) { h = maxH; w = maxH * r; }
        slide.addImage({ data: imgData, x: (slideW - w) / 2, y: 1, w, h });
      }

      await pptx.writeFile({ fileName: `audit-meta-${slug}.pptx` });
    } catch (e) {
      console.error('PPTX export error', e);
      alert('Erreur export PPTX : ' + e.message);
    } finally {
      restoreView();
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  }

  function addSummarySlide(pptx, font, title, blocks) {
    const slide = pptx.addSlide();
    const B = window.BRAND?.pptx || {};
    const text = B.text_hex || '0F172A', muted = B.muted_hex || '64748B';
    slide.addText(title, { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 24, bold: true, color: text, fontFace: font });
    let y = 1.0;
    blocks.forEach((b) => {
      if (b.kind === 'paragraph') {
        slide.addText(b.text, { x: 0.5, y, w: 12.3, h: 1, fontSize: 13, color: text, fontFace: font, valign: 'top' });
        y += 1.1;
      } else if (b.kind === 'bullets') {
        if (b.title) {
          slide.addText(b.title, { x: 0.5, y, w: 12, h: 0.3, fontSize: 13, bold: true, color: muted, fontFace: font });
          y += 0.35;
        }
        const items = b.items.filter(Boolean);
        if (items.length === 0) return;
        const itemsH = Math.max(0.3, items.length * 0.32);
        slide.addText(items.join('\n'), { x: 0.6, y, w: 12.1, h: itemsH, fontSize: 11, color: text, fontFace: font, valign: 'top' });
        y += itemsH + 0.2;
      }
    });
  }

  /* ============ Helpers ============ */
  function sevDot(s) { return { high: '🔴', critical: '🔴', medium: '🟠', info: '🔵' }[s] || '•'; }
  function stripHtml(s) { return String(s ?? '').replace(/<[^>]*>/g, ''); }
  function daysBetween(a, b) {
    const da = new Date(a), db = new Date(b);
    return Math.round((db - da) / 86400000) + 1;
  }
  function idToName(id, kind) {
    const arr = (window.AUDIT_DATA?.[kind]) || [];
    return arr.find(x => x.id === id)?.name || id;
  }
  function recoText(reco, id) {
    const r = reco.recommendations.find(x => x.id === id);
    return r ? r.title : id;
  }
  function formatMetric(m) {
    if (m.unit === '€') return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(m.account_value);
    if (m.unit === '%') return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(m.account_value) + ' %';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(m.account_value);
  }
  function formatBench(m) {
    if (m.benchmark.reliability === 'none') return '—';
    if (m.unit === '€') return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(m.benchmark.median);
    if (m.unit === '%') return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(m.benchmark.median) + ' %';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(m.benchmark.median);
  }
  function verdictText(v) {
    return { best: 'top tier ✓', above_median: 'au-dessus médiane ✓', below_median: 'sous médiane ⚠', worst: 'sous performant ✗' }[v] || '—';
  }

  window.AuditExport = { toPDF, toPPTX };
})();
