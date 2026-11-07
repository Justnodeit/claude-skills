# Logos clients (audit-meta)

Ce dossier contient les logos des clients, organisés par slug client.

## Structure

```
brand/logos/
├── README.md                  ← ce fichier
├── nodeit.svg                 ← logo Node it (par défaut)
├── maison-verde-demo/
│   └── logo.svg               ← logo démo fictif Maison Verde
└── <client-slug>/
    └── logo.svg               ← logo du client (SVG inline recommandé)
```

## Comment ajouter le logo de votre client

1. **Créer un dossier** au nom du client (slugifié, minuscules, tirets) :
   ```bash
   mkdir brand/logos/<client-slug>
   ```

2. **Y déposer le fichier `logo.svg`** :
   ```bash
   cp /chemin/vers/logo-client.svg brand/logos/<client-slug>/logo.svg
   ```

3. **Passer le chemin en input du skill** :
   ```yaml
   logo_svg_path: "brand/logos/<client-slug>/logo.svg"
   client_slug: "<client-slug>"
   ```

Le sous-agent Designer l'injectera automatiquement dans le header HTML et les slides PPTX.

## Recommandations format SVG

- Fond transparent (pas de `<rect>` blanc)
- Viewbox carrée ou 16:9 selon le logo
- Taille recommandée : 200×60 px (ou équivalent en ratio)
- Couleurs : soit en valeurs fixes, soit utilisant `currentColor` pour hériter le thème

## Sécurité

Ne pas committer de logo contenant des données sensibles ou à usage restreint sans accord client.
