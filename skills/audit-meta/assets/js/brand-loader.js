/* ============================================================
   audit-meta · brand-loader.js
   Pivot du design system : lit window.BRAND_INPUT (depuis brand.js)
   et conditionne TOUT le rapport — HTML, PDF, PPT.

   Sequencing :
   1. (sync) Inject CSS variables dans :root → pilote tout le rendu HTML
   2. (sync) Inject le logo SVG dans le sprite #brand-logo
   3. (sync) Met à jour les zones brand_name/footer du DOM
   4. (async) Rasterise le SVG en PNG dataURL pour PDF/PPT
   5. (async) Expose window.BRAND.ready (Promise) — l'export l'attend
   ============================================================ */

(function () {
  'use strict';

  const input = window.BRAND_INPUT;
  if (!input) {
    console.error('[brand-loader] window.BRAND_INPUT manquant. Le rapport utilisera le theme par défaut.');
    return;
  }

  /* ---------- 1. Inject CSS variables ---------- */
  function injectCssVars() {
    const root = document.documentElement;
    const c = input.colors || {};
    const t = input.typography || {};
    const r = input.radius || {};

    const setVar = (name, val) => { if (val) root.style.setProperty(name, val); };

    setVar('--color-primary', c.primary);
    setVar('--color-primary-dark', c['primary-dark']);
    setVar('--color-primary-soft', c['primary-soft']);
    setVar('--color-accent', c.accent);
    setVar('--color-bg', c.bg);
    setVar('--color-surface', c.surface);
    setVar('--color-surface-2', c['surface-2']);
    setVar('--color-border', c.border);
    setVar('--color-text', c.text);
    setVar('--color-text-muted', c['text-muted']);
    setVar('--color-text-on-primary', c['text-on-primary']);

    if (c.dataviz) {
      for (let i = 1; i <= 7; i++) setVar('--series-' + i, c.dataviz['series-' + i]);
    }
    if (c.severity) {
      Object.entries(c.severity).forEach(([k, v]) => setVar('--' + k, v));
    }

    setVar('--font-display', t.display);
    setVar('--font-body', t.body);
    setVar('--font-mono', t.mono);

    setVar('--radius-sm', r.sm);
    setVar('--radius-md', r.md);
    setVar('--radius-lg', r.lg);
  }

  /* ---------- 2. Inject logo dans le sprite ---------- */
  function injectLogoSprite() {
    const svgText = input.logo?.svg_inline;
    if (!svgText) return;
    // Parser le SVG client, extraire son contenu et son viewBox
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return;
    const viewBox = svgEl.getAttribute('viewBox') || '0 0 32 32';
    // Strip scripts et attributs on* pour sécurité
    [...doc.querySelectorAll('script')].forEach(s => s.remove());
    [...doc.querySelectorAll('*')].forEach(el => {
      [...el.attributes].forEach(a => { if (a.name.toLowerCase().startsWith('on')) el.removeAttribute(a.name); });
    });

    // Cherche le <symbol id="i-logo"> existant et le remplace
    const existing = document.querySelector('symbol#i-logo');
    if (existing) {
      existing.setAttribute('viewBox', viewBox);
      existing.innerHTML = svgEl.innerHTML;
    } else {
      // Crée un sprite si absent
      const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      wrapper.setAttribute('style', 'display:none');
      wrapper.setAttribute('aria-hidden', 'true');
      const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
      symbol.id = 'i-logo';
      symbol.setAttribute('viewBox', viewBox);
      symbol.innerHTML = svgEl.innerHTML;
      wrapper.appendChild(symbol);
      document.body.insertBefore(wrapper, document.body.firstChild);
    }
  }

  /* ---------- 3. Met à jour les zones brand du DOM ---------- */
  function injectBrandText() {
    document.querySelectorAll('[data-brand="name"]').forEach(el => el.textContent = input.name || '');
    document.querySelectorAll('[data-brand="footer"]').forEach(el => el.innerHTML = input.footer_html || '');
    document.querySelectorAll('[data-brand="website"]').forEach(el => {
      el.textContent = (input.website || '').replace(/^https?:\/\//, '');
      el.href = input.website || '#';
    });
    if (input.name) {
      document.title = `Audit Meta Ads · ${input.name}`;
    }
  }

  /* ---------- 4. Rasterise SVG → PNG dataURL ---------- */
  function rasterizeLogo(size = 256) {
    return new Promise((resolve) => {
      const svgText = input.logo?.svg_inline;
      if (!svgText) { resolve(null); return; }
      // Important : appliquer un fill par défaut (currentColor → couleur primaire) car canvas ne résout pas currentColor
      const primary = input.colors?.primary || '#5B5FEF';
      const themed = svgText.replace(/currentColor/g, primary);
      const blob = new Blob([themed], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  /* ---------- Helpers ---------- */
  function stripHash(s) { return (s || '').replace('#', ''); }

  /* ---------- 5. Build window.BRAND + ready promise ----------
     Découpage de l'exécution :
     - immédiat : CSS vars (document.documentElement dispo depuis le head)
       + window.BRAND construit + ready promise (rasterizeLogo n'a pas besoin du body)
     - DOMContentLoaded : injectLogoSprite + injectBrandText (nécessitent body)
  */
  injectCssVars();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { injectLogoSprite(); } catch (e) { console.warn('[brand-loader] injectLogoSprite:', e); }
      try { injectBrandText(); } catch (e) { console.warn('[brand-loader] injectBrandText:', e); }
    });
  } else {
    try { injectLogoSprite(); } catch (e) { console.warn('[brand-loader] injectLogoSprite:', e); }
    try { injectBrandText(); } catch (e) { console.warn('[brand-loader] injectBrandText:', e); }
  }

  const c = input.colors || {};
  const sev = c.severity || {};
  const t = input.typography || {};

  window.BRAND = {
    name: input.name || 'Brand',
    tagline: input.tagline || '',
    website: input.website || '',
    contact_email: input.contact_email || '',
    footer_html: input.footer_html || '',

    colors: c,
    typography: t,

    // Pré-calculés pour jsPDF (pas de #) et PptxGenJS
    pdf: {
      font: t.pdf_font || 'helvetica',
      primary_hex: stripHash(c.primary || '#5B5FEF'),
      primary_dark_hex: stripHash(c['primary-dark'] || '#4338CA'),
      text_hex: stripHash(c.text || '#0F172A'),
      muted_hex: stripHash(c['text-muted'] || '#64748B'),
      border_hex: stripHash(c.border || '#E5E7EB'),
      surface_hex: stripHash(c.surface || '#FAFAFB'),
      sev_success_hex: stripHash(sev['sev-success'] || '#10B981'),
      sev_high_hex: stripHash(sev['sev-high'] || '#EF4444'),
      sev_medium_hex: stripHash(sev['sev-medium'] || '#F59E0B'),
      sev_info_hex: stripHash(sev['sev-info'] || '#06B6D4'),
      logo_png_data_url: null,                    // rempli async ci-dessous
    },
    pptx: {
      font: t.pptx_font || 'Inter',
      primary_hex: stripHash(c.primary || '#5B5FEF'),
      text_hex: stripHash(c.text || '#0F172A'),
      muted_hex: stripHash(c['text-muted'] || '#64748B'),
      surface_hex: stripHash(c.surface || 'FAFAFB'),
      border_hex: stripHash(c.border || 'E5E7EB'),
      sev_success_hex: stripHash(sev['sev-success'] || '#10B981'),
      sev_high_hex: stripHash(sev['sev-high'] || '#EF4444'),
      sev_medium_hex: stripHash(sev['sev-medium'] || '#F59E0B'),
      logo_png_data_url: null,
    },

    ready: null,                                  // rempli ci-dessous
  };

  window.BRAND.ready = rasterizeLogo(256).then(dataUrl => {
    window.BRAND.pdf.logo_png_data_url = dataUrl;
    window.BRAND.pptx.logo_png_data_url = dataUrl;
    return dataUrl;
  });
})();
