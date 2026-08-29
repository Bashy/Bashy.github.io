# benjamin.pham.pm

Page personnelle + blog, construite avec [Astro](https://astro.build).

## Développement local

```bash
npm install
npm run dev
```

Le site est servi sur `http://localhost:4321`.

## Structure

```
src/
  content/blog/     → articles au format Markdown (frontmatter: title, description, pubDate, tags)
  layouts/          → BaseLayout (structure commune) et BlogPost (mise en page d'un article)
  pages/            → index.astro (accueil), blog/index.astro (liste), blog/[...slug].astro (article)
  components/       → Mermaid.astro (rendu client des diagrammes ```mermaid)
  styles/           → global.css
public/
  CNAME             → domaine custom pour GitHub Pages
.github/workflows/
  deploy.yml        → build + déploiement automatique sur push vers main
```

## Écrire un article

Créer un fichier dans `src/content/blog/mon-article.md` :

```md
---
title: "Titre de l'article"
description: "Résumé court."
pubDate: 2026-08-29
tags: ["nso", "automatisation"]
---

Contenu en Markdown standard, y compris les blocs ```mermaid.
```

## Déploiement

1. Créer le repo GitHub `<ton-user>.github.io` et y pousser ce contenu sur `main`.
2. Dans **Settings > Pages**, choisir la source **GitHub Actions** (pas la branche
   directement — le workflow `deploy.yml` s'en charge).
3. Configurer le DNS chez ton registrar : un enregistrement **CNAME**
   `benjamin` → `<ton-user>.github.io`.
4. Dans **Settings > Pages**, champ **Custom domain**, renseigner
   `benjamin.pham.pm`, attendre la validation DNS, puis cocher
   **Enforce HTTPS**.

## Mermaid

Les blocs de code ` ```mermaid ` sont automatiquement convertis en SVG côté
client via [mermaid.js](https://mermaid.js.org), chargé depuis un CDN — aucune
dépendance de build supplémentaire.
