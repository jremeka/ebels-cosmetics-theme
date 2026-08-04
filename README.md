# Ebels Cosmetics — Storefront Theme

The custom Shopify storefront for **Ebels Cosmetics**, a US-market cosmetics and lifestyle
brand — handbags, perfumes, wigs, foundation, and lipsticks. Every customer-facing page is
purpose-built for the brand: fully custom sections, fully editable from the theme editor,
no code required for day-to-day content changes.

## Live theme

- Shopify admin theme name: **Ebels Custom Dev**
- Storefront: `ebelscosmetics.com`
- Shopify store (admin/CLI): `ebelscosmetics.myshopify.com`

## Design system

- **Colors**: flame-orange (`#EA5B1D`) → golden-amber (`#F7B733`) gradient, warm neutrals,
  and category accents (berry, terracotta, blush, espresso)
- **Typography**: Fraunces (display/headings) + Archivo (body/UI)
- **Spacing**: 4px base scale
- All design tokens live in `assets/ebels-tokens.css`

## Project structure

Every custom file is prefixed `ebels-*` throughout `sections/`, `assets/`, and `snippets/`.
Each section is generally a trio:

```
sections/ebels-example.liquid
assets/ebels-example.css
assets/ebels-example.js   (only when real interactivity is needed)
```

Real per-product content (descriptions, ingredients, how-to-use, cross-sells, UGC posts)
is driven by Shopify metafields rather than static template content, so every product
page reflects that specific product — not shared, duplicated content across the catalog.

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

## License

Private, proprietary theme built for Ebels Cosmetics. Not for redistribution.
