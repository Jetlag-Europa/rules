# Jet Lag Community Rules

This repository contains a Starlight documentation site for master rules and game-specific rule documents.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Content

- `src/content/docs/main/` contains the current master rulebook pages.
- `src/content/docs/games/` contains game-specific rule pages.

Docs are regular Starlight Markdown files. Page titles, descriptions, and sidebar order live in frontmatter; navigation is generated from the file structure configured in `astro.config.mjs`.
