/* ============================================================
   audit-meta · brand.js (générée par le sous-agent Designer)
   À l'exécution réelle : ce fichier est produit en lisant
   brand/<name>.json + brand/logos/<name>.svg, puis injecté
   dans le dossier de sortie examples/<client-slug>/.

   Pour la démo, on utilise le theme Node it par défaut.
   Pour changer : remplacer ce fichier par celui généré
   depuis brand/<votre-theme>.json.
   ============================================================ */

window.BRAND_INPUT = {
  name: "Node it",
  tagline: "Organisme de formation en IA certifié Qualiopi",
  website: "https://www.nodeit.fr",
  contact_email: "hello@nodeit.fr",
  footer_html: "Rapport généré par <strong>Node it</strong> · <a href=\"https://www.nodeit.fr\">nodeit.fr</a>",

  logo: {
    // Le SVG est inliné pour que le rapport soit autonome (file://)
    svg_inline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-label="Node it logo"><rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/><path d="M9 22V10h2.4l5.1 7.3V10H19v12h-2.4l-5.1-7.3V22H9Z" fill="#FFFFFF"/><circle cx="23.5" cy="11.5" r="1.7" fill="#10B981"/></svg>`,
    width: 32,
    height: 32,
  },

  colors: {
    primary: "#5B5FEF",
    "primary-dark": "#4338CA",
    "primary-soft": "#EEF0FF",
    accent: "#10B981",
    bg: "#FFFFFF",
    surface: "#FAFAFB",
    "surface-2": "#F4F4F7",
    border: "#E5E7EB",
    text: "#0F172A",
    "text-muted": "#64748B",
    "text-on-primary": "#FFFFFF",

    dataviz: {
      "series-1": "#5B5FEF",
      "series-2": "#10B981",
      "series-3": "#F59E0B",
      "series-4": "#EC4899",
      "series-5": "#8B5CF6",
      "series-6": "#06B6D4",
      "series-7": "#EF4444",
    },

    severity: {
      "sev-info": "#06B6D4",
      "sev-medium": "#F59E0B",
      "sev-high": "#EF4444",
      "sev-critical": "#B91C1C",
      "sev-success": "#10B981",
    },
  },

  typography: {
    display: "'Inter Display', 'Inter', system-ui, -apple-system, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
    pdf_font: "helvetica",
    pptx_font: "Inter",
  },

  radius: {
    sm: "6px",
    md: "12px",
    lg: "20px",
  },
};
