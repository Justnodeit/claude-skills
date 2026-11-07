<p align="center">
  <a href="https://www.nodeit.fr/?utm_source=github&utm_medium=referral&utm_campaign=claude-skills">
    <img src="assets/node-it-logo.png" alt="Node it" width="96">
  </a>
</p>

<h1 align="center">Skills Claude de Node it</h1>

<p align="center">
  Des skills Claude gratuits, en français, pour faire travailler l'IA sur des tâches concrètes :<br>
  agent WhatsApp, audit Meta Ads, SEO et GEO, montage vidéo, Webflow, Figma, open data public.
</p>

<p align="center">
  <a href="https://www.nodeit.fr/skills-ia?utm_source=github&utm_medium=referral&utm_campaign=claude-skills">Tous les skills sur nodeit.fr</a>
  ·
  <a href="https://www.nodeit.fr/formations?utm_source=github&utm_medium=referral&utm_campaign=claude-skills">Nos formations IA</a>
  ·
  <a href="mailto:hello@nodeit.fr">hello@nodeit.fr</a>
</p>

Un skill est un dossier d'instructions que Claude charge quand la tâche s'y prête. Il lui apporte une méthode, des étapes et des modèles prêts à l'emploi : vous décrivez ce que vous voulez, Claude suit la procédure du skill.

Ce dépôt reprend les skills publiés sur [nodeit.fr](https://www.nodeit.fr/skills-ia?utm_source=github&utm_medium=referral&utm_campaign=claude-skills). Il se met à jour tout seul chaque jour quand un skill est ajouté ou modifié sur le site.

## Les skills

<!-- skills:start -->
| Skill | Ce qu'il fait | Page |
|---|---|---|
| [`agent-ia-whatsapp`](skills/agent-ia-whatsapp) | Le skill Claude qui construit votre agent IA WhatsApp : Twilio, n8n ou Make, votre CRM, AI Act inclus. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/agent-ia-whatsapp-skill?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`audit-meta`](skills/audit-meta) | Le skill Claude pour auditer un compte Meta Ads via MCP : tracking, structure, audiences, créas et budget en quelques minutes. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/mcp-meta-audit?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`datagouv-apis`](skills/datagouv-apis) | Connectez Claude Code à plus de 70 000 jeux de données publics de l'État via MCP : SIREN, INSEE, marchés publics, données géo à jour. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/mcp-datagouv-open-data-claude?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`figma-expert`](skills/figma-expert) | Le skill Claude pour concevoir dans Figma : composants, auto-layout, design tokens et prototypes livrés directement depuis vos prompts. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/figma-expert-skill-md?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`media-buying-expert`](skills/media-buying-expert) | Le skill Claude pour le media buying : audit de compte, structure de campagne, tracking et optimisation sur Meta, Google et TikTok. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/media-buyer-expert-automation-md?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`montage-video-motion`](skills/montage-video-motion) | Le skill Claude qui monte vos vidéos motion : Reels, Shorts, LinkedIn, sous-titres au mot, rendu contrôlé image par image. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/montage-video-motion-skill?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`reseaux-sociaux-expert`](skills/reseaux-sociaux-expert) | Le skill Claude pour créer des posts LinkedIn, Reels et carrousels Instagram qui engagent : stratégie éditoriale, hooks et CTA inclus. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/social-media-expert-skill-md?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`seo-geo-expert`](skills/seo-geo-expert) | Le skill Claude pour le SEO et le GEO : optimiser pour Google et les moteurs IA comme ChatGPT et Perplexity. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/seo-geo-expert-skill-md?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
| [`webflow-expert`](skills/webflow-expert) | La compétence Claude AI qu'il manque à votre projet pour commencer à construire et gérer un site web avec Webflow, sans les mains. | [Fiche sur nodeit.fr](https://www.nodeit.fr/ressources/web-developer-expert-skill-md?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) |
<!-- skills:end -->

## Installer un skill

### Dans Claude Code

Ajoutez ce dépôt comme catalogue de plugins, puis installez les skills :

```
/plugin marketplace add Justnodeit/claude-skills
/plugin install node-it-skills@node-it
```

Pour un seul skill, copiez son dossier dans `~/.claude/skills/` (pour tous vos projets) ou dans `.claude/skills/` à la racine d'un projet.

### Dans l'application Claude (claude.ai, bureau)

1. Ouvrez le dossier du skill ci-dessus et téléchargez-le en .zip (ou téléchargez tout le dépôt avec le bouton « Code », puis « Download ZIP »).
2. Dans Claude, ouvrez Paramètres, puis Capacités, et ajoutez le skill depuis la rubrique Skills.
3. Posez votre question normalement : Claude utilise le skill quand votre demande correspond à sa description.

## Qui sommes-nous

[Node it](https://www.nodeit.fr/?utm_source=github&utm_medium=referral&utm_campaign=claude-skills) est un organisme de formation certifié Qualiopi. Nous formons les entreprises à l'intelligence artificielle, au marketing digital et à la vente B2B, avec un réseau de dix formateurs répartis sur quatre univers : IA et automatisation, growth marketing, go to market, product building. Ces skills viennent de nos formations : en session, on apprend à les adapter à son activité et à construire les siens.

## Licence

MIT, sauf `skills/datagouv-apis`, publié par la DINUM sous sa propre licence MIT et redistribué tel quel. Vous pouvez utiliser, modifier et partager ces skills, y compris pour un usage commercial, en gardant la mention de licence.

Une erreur, une idée de skill ? Ouvrez une issue ou écrivez à [hello@nodeit.fr](mailto:hello@nodeit.fr).
