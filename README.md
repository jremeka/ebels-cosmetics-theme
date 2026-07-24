# Ebels Cosmetics — Shopify Theme

Custom Shopify storefront for **Ebels Cosmetics**, a US-market cosmetics and lifestyle
brand selling handbags, perfumes, wigs, foundation, and lipsticks.

This theme is a heavily customized fork of Shopify's [Dawn](https://github.com/Shopify/dawn)
reference theme. Every customer-facing page is being rebuilt with custom, brand-specific
sections — fully editable from the Shopify theme editor, no code required for day-to-day
content changes.

## Live theme

- Shopify admin theme name: **Ebels Custom Dev**
- Store: `ebelscosmetics.myshopify.com`

## Design system

- **Colors**: flame-orange (`#EA5B1D`) → golden-amber (`#F7B733`) gradient, warm neutrals,
  and category accents (berry, terracotta, blush, espresso)
- **Typography**: Fraunces (display/headings) + Archivo (body/UI)
- **Spacing**: 4px base scale
- All design tokens live in `assets/ebels-tokens.css`

## Project structure

Custom files are prefixed `ebels-*` throughout `sections/`, `assets/`, and `snippets/` to
keep them clearly separated from Dawn's original files. Each custom section is generally
a trio:

```
sections/ebels-example.liquid
assets/ebels-example.css
assets/ebels-example.js   (only when real interactivity is needed)
```

## Local development

```bash
cd ebels-cosmetics-theme
shopify theme dev
```

This starts a local live-reload preview **and syncs local file changes to the live theme
while it's running.** If you stop this process, further local edits will NOT reach the
live theme until you either restart `theme dev` or run `shopify theme push` manually.

## Deploying changes

```bash
shopify theme push
```

Uploads the current local files to the theme on Shopify's servers. Confirm you're pushing
to **Ebels Custom Dev**, not creating a new theme, when prompted.

## Contributing / working on this project

See `CLAUDE.md` in the project root for full build context, design system details, naming
conventions, and a running list of known bug patterns to avoid repeating — kept up to date
as the project progresses.

## License

Private, proprietary theme built for Ebels Cosmetics. Not for redistribution.
