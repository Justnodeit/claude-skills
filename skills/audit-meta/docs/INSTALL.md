# INSTALL (audit-meta)

Guide d'installation et d'utilisation du skill `audit-meta` selon votre profil.

> **TL;DR** : vous voulez juste voir ce que produit le skill ?
> Ouvrez la démo : [`examples/maison-verde-demo/index.html`](../examples/maison-verde-demo/index.html).
> Données 100% fictives, design final.

---

## Sommaire

- [Profil 1 : Dev / freelance / agence (utilise Claude Code)](#profil-1)
- [Profil 2 : CMO / annonceur (commande un audit à un prestataire)](#profil-2)
- [Profil 3 : Agence qui veut white-labeller et héberger](#profil-3)
- [Troubleshooting](#troubleshooting)

---

<a id="profil-1"></a>
## Profil 1 : Dev / freelance / agence

Vous utilisez Claude Code et voulez générer des audits Meta Ads sur des comptes que vous gérez (les vôtres ou ceux de vos clients).

### 1.1 Pré-requis

| Outil | Version min. | Vérification |
|---|---|---|
| Claude Code | dernière | `claude --version` |
| Node.js | 18+ | `node --version` |
| Python 3 | 3.9+ (pour le serveur de preview local) | `python3 --version` |
| Compte Meta Business Manager | Sans objet | Avoir un Business Manager actif |
| Système User Meta | Sans objet | Voir étape 1.3 |

### 1.2 Installer le skill

Le skill est publié dans le dépôt public [Justnodeit/claude-skills](https://github.com/Justnodeit/claude-skills). Deux options :

**Option A : par le catalogue de plugins de Claude Code** :

```
/plugin marketplace add Justnodeit/claude-skills
/plugin install node-it-skills@node-it
```

**Option B : en copiant le dossier** :

```bash
git clone https://github.com/Justnodeit/claude-skills.git
cp -r claude-skills/skills/audit-meta ~/.claude/skills/
ls ~/.claude/skills/audit-meta   # vous devez voir SKILL.md, agents/, examples/, etc.
```

### 1.3 Connecter le MCP Meta Ads

Le skill consomme l'API Meta via le **MCP Meta Ads**.

#### Étape 1 : Créer un System User dans Meta Business Manager

Un System User est un utilisateur technique qui peut générer un token long-life pour accéder à un ou plusieurs comptes publicitaires.

1. Ouvrir [business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users)
2. Cliquer **Ajouter** → choisir **Administrateur** (pour audit complet)
3. Nommer le System User (ex. `audit-nodeit-systemuser`)
4. Cliquer sur le System User créé → **Ajouter des actifs** → cocher les **comptes publicitaires** à auditer
5. Permissions : `ads_read` minimum (suffisant pour audit lecture seule)

#### Étape 2 : Générer le token

1. Sur la page du System User → **Générer un nouveau token**
2. Sélectionner l'application Meta (créer une App vide si vous n'en avez pas : [developers.facebook.com/apps](https://developers.facebook.com/apps))
3. Permissions à cocher : `ads_read`, `ads_management` (read-only suffit pour l'audit), `business_management`
4. Copier le token (commence par `EAA...`)

> ⚠️ **Ne stockez jamais ce token dans le repo.** Le MCP s'en charge via variables d'environnement chiffrées.

#### Étape 3 : Configurer le MCP dans Claude Code

```bash
# Méthode 1 — Via slash command
/mcp

# Méthode 2 — Via CLI
claude mcp add meta-ads
# → suit le prompt interactif, colle le token, valide
```

Vérifier la connexion :

```bash
claude mcp list   # doit afficher meta-ads → connected
```

### 1.4 Lancer un premier audit (mode démo, sans MCP)

Pour tester le rendu sans toucher à Meta :

```bash
cd skills/audit-meta
python3 -m http.server 8000 --directory examples/maison-verde-demo
# Ouvrir http://localhost:8000 dans le navigateur
```

Vous voyez le rapport final avec données fictives Maison Verde.

### 1.5 Lancer un audit sur un vrai compte

> ⚠️ **À ce jour, le plugin Claude Code (`/audit-meta act_xxx`) n'est pas encore implémenté.** L'orchestration des 5 sous-agents se fait à la main. Voir [`plugin-spec.md`](plugin-spec.md) pour la spec du plugin à venir.

Workflow manuel temporaire :

1. **Lister les comptes accessibles** dans Claude Code :
   ```
   Liste mes comptes Meta accessibles
   ```
   (Claude appelle `mcp__ads_get_ad_accounts`)

2. **Lancer le sous-agent data-engineer** :
   ```
   Utilise le sous-agent data-engineer du skill audit-meta pour pull
   le compte act_123456789 sur les 90 derniers jours en granularité
   hebdomadaire. Output : examples/<mon-client>/data.js
   ```

3. **Lancer les autres sous-agents en chaîne** (ou en parallèle où possible) :
   - `media-expert` → `insights.js`
   - `benchmark-researcher` → `benchmark.js`
   - `recommendation-engine` → `recommendations.js`
   - `designer` → assemble `index.html` + `theme.css`

4. **Ouvrir le rapport** :
   ```bash
   open examples/<mon-client>/index.html
   ```

### 1.6 Garde-fous volume (à connaître)

Le sous-agent `data-engineer` applique des seuils automatiques :

| Volume compte | Comportement |
|---|---|
| < 200 ads et < 20k records | Fetch direct, pas d'alerte |
| 200-1000 ads ou 20-100k records | ⚠️ Demande confirmation (durée estimée) |
| ≥ 1000 ads ou ≥ 100k records | 🚨 Bloc dur, propose 3 options (réduire fenêtre, actives only, mode reporting) |
| > 500k records | Refus : fenêtre obligatoire < 30j ou pré-sélection |

Détail : [`../agents/data-engineer.md`](../agents/data-engineer.md) section R5.

---

<a id="profil-2"></a>
## Profil 2 : CMO / annonceur

Vous voulez recevoir un audit Meta Ads sur vos comptes, livré par une agence ou un freelance qui utilise ce skill.

### 2.1 Ce que vous allez recevoir

Un rapport HTML interactif avec 6 onglets :
1. **Setup** : votre périmètre (campagnes, dates, granularité)
2. **Vue globale** : courbes invest/CPM/CPC/fréquence, tableau campagnes
3. **Ad sets** : perf par audience + optimisation choisie
4. **Créas** : top performers, alertes fatigue, patterns détectés
5. **Benchmark sectoriel** : comparaison médianes/percentiles
6. **Recommandations** : top 5 signaux + plan d'actions priorisé

Exports natifs : **PDF** + **PPTX** (boutons dans le rapport).

### 2.2 Ce que vous devez fournir à votre prestataire

| Élément | Comment l'obtenir |
|---|---|
| **Account ID Meta** (format `act_xxxxx`) | Meta Ads Manager → URL ou menu compte |
| **Accès lecture seule** au compte | Business Manager → Utilisateurs → Ajouter le System User du prestataire en `Advertiser - read only` |
| **URL de votre site** | Pour la détection sectorielle automatique |
| **Fenêtre temporelle** | Ex. 90 derniers jours, T1 2026, etc. |
| **Logo + couleurs** (optionnel) | Si vous voulez le rapport à votre marque |

### 2.3 Combien de temps ça prend

- Compte < 200 ads : **5-10 minutes**
- Compte 200-1000 ads : **15-30 minutes**
- Compte > 1000 ads : voir avec votre prestataire (segmentation conseillée)

### 2.4 Confidentialité

- Le token Meta ne quitte jamais l'environnement du prestataire (MCP chiffré)
- Les données du rapport sont **stockées localement** chez le prestataire, sans envoi à des tiers
- Si le rapport est hébergé en ligne (Vercel, etc.), demandez à votre prestataire d'**activer la protection par mot de passe** (voir Profil 3 § 3.4)

---

<a id="profil-3"></a>
## Profil 3 : Agence qui veut white-labeller et héberger

Vous voulez utiliser `audit-meta` comme outil commercial sous votre marque, hébergé sur votre domaine.

### 3.1 White-label visuel (5 minutes)

Voir [how-to-customize.md § Niveau 1](how-to-customize.md#niveau-1).

Résumé :

```bash
cp brand/_template.json brand/<votre-agence>.json
$EDITOR brand/<votre-agence>.json   # 8 couleurs + logo SVG inline
# Puis passer --theme <votre-agence> au plugin (ou éditer brand.js manuellement)
```

### 3.2 Adapter à un nouveau secteur (30 min)

Voir [how-to-customize.md § Niveau 2](how-to-customize.md#niveau-2).

### 3.3 Bonus : héberger le rapport en ligne avec Vercel + domaine custom

Au lieu d'envoyer un `.html` par email (signal amateur, fichier perdu, pas de mise à jour), publiez chaque audit sur une URL pro à votre nom de domaine.

#### Pourquoi héberger

- **URL pro = signal de qualité** (ex. `audit-acme.votre-agence.com`)
- **Protection par mot de passe** native (Vercel Pro)
- **Mises à jour sans renvoyer un fichier** : l'URL reste stable, vous redéployez par-dessus
- **Tracking optionnel** : vous savez quand le client a ouvert
- **Expiration contrôlée** : vous retirez le déploiement après livraison + 30j

#### Méthode rapide (5 min) : Vercel CLI

```bash
# 1. Installer Vercel CLI (une seule fois)
npm i -g vercel
vercel login

# 2. Déployer le rapport
cd examples/<client-slug>/
vercel --prod
# → Vercel crée un déploiement à https://audit-<slug>-xxxx.vercel.app
```

#### Méthode pro : domaine custom

Pattern recommandé : `audit-<client-slug>.<votre-domaine>.com`.

**Setup DNS** (chez votre registrar : Hostinger, OVH, Cloudflare…) :

| Type | Nom | Valeur |
|---|---|---|
| `CNAME` | `audit-<client-slug>` | `cname.vercel-dns.com` |

OU (si CNAME root non supporté) :

| Type | Nom | Valeur |
|---|---|---|
| `A` | `audit-<client-slug>` | `76.76.21.21` |

> **Note Node it** : ce pattern A record `76.76.21.21` est éprouvé sur `proposals.nodeit.fr`.

**Associer le domaine au déploiement Vercel** :

```bash
vercel domains add audit-<client-slug>.votre-domaine.com
# SSL automatique en 1-2 minutes
```

#### 3.4 Sécuriser le partage

**Option 1 : Password Protection Vercel (recommandé)**

- Disponible sur les plans **Pro** Vercel (~20 $/mois pour l'équipe)
- Activer : Vercel Dashboard → Project → Settings → Deployment Protection → Password Protection
- Vous définissez un mot de passe partagé avec le client
- L'URL reste publique mais nécessite le mot de passe

**Option 2 (gratuite) : URL obscure + retrait programmé**

- Garder l'URL Vercel auto-générée (slug aléatoire long : `audit-xyz-7k2-mq.vercel.app`)
- Envoyer URL + accès par 2 canaux séparés (email + SMS)
- Programmer un rappel J+30 pour `vercel rm <deployment>`

**Option 3 : Anonymiser le contenu**

Pour le partage externe (étude de cas, RP), passer le flag `--anonymize` (à venir, sprint 4 du roadmap client-ready) qui :
- Remplace `account_id` par un hash
- Remplace les noms campagnes par `Campagne A, B, C…`
- Convertit les montants en relatif (% du spend total)

#### Workflow type pour une livraison client

```
1. Générer le rapport en local                 → examples/acme/index.html
2. Activer Vercel Password Protection si Pro    → optionnel
3. vercel --prod dans examples/acme/            → URL stable
4. Assigner audit-acme.votre-agence.com         → branding pro
5. Envoyer URL + mot de passe par canaux séparés
6. Tracking : Vercel Analytics / Plausible      → savoir si le client a ouvert
7. Rappel J+30 → vercel rm si nécessaire
```

---

<a id="troubleshooting"></a>
## Troubleshooting

### `mcp__ads_get_ad_accounts` retourne `500`

L'API Meta connaît des incidents ponctuels.

**Que faire :**
1. Retry après 30 secondes
2. Si persistant : vérifier le statut Meta sur [metastatus.com](https://metastatus.com)
3. Vérifier que le token n'a pas expiré (System User tokens : durée 60 jours par défaut)
4. Fallback : exporter manuellement depuis Ads Manager (CSV) et fournir le fichier au sous-agent `data-engineer` en mode CSV (à venir, sprint 1 du roadmap)

### `is_queryable: false` sur le compte

Le MCP ne peut pas requêter ce compte. Causes typiques :
- Compte inactif depuis > 12 mois
- System User pas ajouté en `Advertiser` sur le compte
- Limites API atteintes (quotas Business Manager)

**Que faire :** afficher le champ `not_queryable_reason` retourné par le MCP, traiter selon le message.

### Le rapport HTML est cassé / blanc

Vérifier dans la console du navigateur (`Cmd+Opt+I`) :
- Fichiers `.js` manquants → le sous-agent designer n'a pas assemblé tous les outputs
- Erreurs CDN (Chart.js, html2canvas-pro…) → vérifier la connexion réseau

### `data.js` fait > 10 MB

Le `data-engineer` est censé refuser au-delà (voir § 1.6). Si vous arrivez à ce cas :
- Réduire la fenêtre temporelle
- Pré-sélectionner des campagnes (mode `campaign_report`)
- Agréger en hebdomadaire au lieu de quotidien

### Le compte audité contient une marque tierce

Avant toute publication externe (Vercel, étude de cas, RP) :
- Utiliser le mode `--anonymize` (à venir)
- Demander l'accord écrit du client (clause confidentialité contrat)

---

## Versions & support

- Version du skill : voir [SKILL.md](../SKILL.md) frontmatter
- Changelog : [docs/CHANGELOG.md](CHANGELOG.md)
- Owner : Node it
- Issues : [github.com/Justnodeit/claude-skills/issues](https://github.com/Justnodeit/claude-skills/issues) ou hello@nodeit.fr

## Pour aller plus loin

- [SKILL.md](../SKILL.md) : vue d'ensemble du skill
- [agents/data-engineer.md](../agents/data-engineer.md) : règles de pull data
- [how-to-customize.md](how-to-customize.md) : 5 niveaux de personnalisation
- [plugin-spec.md](plugin-spec.md) : spec du plugin Claude Code à venir
