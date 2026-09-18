# SA Group design tokens

This folder is the contract between the dashboard and the parent-company site
(built in Claude Design). Components never hardcode colors, fonts, or radii —
they read CSS variables from here.

## How inheritance works

1. Claude Design publishes a UI kit (palette, type, radius, button/nav patterns).
2. Copy those CSS variables into `brand.override.css` (or replace `primitives.css`
   if the names already match).
3. If their names differ (`--sa-primary` vs `--color-accent`), map them in
   `brand.override.css`:
   ```css
   :root {
     --color-accent: var(--sa-primary);
     --font-sans: var(--sa-font-sans);
     --radius-md: var(--sa-radius);
     --button-radius: var(--sa-button-radius);
   }
   ```
4. Do not restyle individual React files. If a component looks wrong after a
   token drop, the mapping is incomplete — add the semantic alias.

Specialty v1 (September 2026) lives in `brand.override.css` (palette, type,
radius) and `surfaces.css` (washes, dark grounds, grain, corner glyph).
Replace `/public/brand/grain.png` and the outline SVGs with production files
when they arrive — class names stay the same.

## Layers

| File | Role |
|---|---|
| `primitives.css` | Raw palette / type / space. Safe to replace. |
| `semantic.css` | Intent names used by UI (`--color-accent`, `--color-text`, …). |
| `components.css` | Button, input, card, nav, menu aliases. |
| `brands.css` | Per-lab accent only. |
| `surfaces.css` | Washes, dark grounds, grain, corner glyph (`ds-surface-*`). |
| `brand.override.css` | **Drop the live SA Group system here.** |

UI lives in `components/ui`. Class prefix: `ds-`.
