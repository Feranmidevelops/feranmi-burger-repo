# Feranmi Restaurant

A TypeScript + React implementation of the Figma file **`Burger_Landing`**
(`restaurant.fig`), built from the design data rather than from a screenshot.

```bash
npm install
npm run dev
```

| script            | what it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Vite dev server on <http://localhost:5173> |
| `npm run build`   | typecheck + production build to `dist/` |
| `npm run preview` | serve the production build            |
| `npm run typecheck` | `tsc --noEmit`                      |

## How the design was read

`restaurant.fig` is a ZIP holding `canvas.fig`, a `fig-kiwi` v25 binary. The
embedded Kiwi schema was parsed, the document message decoded, and the node tree
walked to recover every frame, fill, font, corner radius, transform and text
run. Every number below comes from that dump — nothing was eyeballed.

Two frames were implemented as the two ends of one responsive page:

- `Burger Landing` — 1440 × 6496
- `Burger Landing Mobile` — 375 × 6921

## Design tokens

Extracted colours and type live in [`src/styles/tokens.css`](src/styles/tokens.css).

| token             | value     | used for                                  |
| ----------------- | --------- | ----------------------------------------- |
| `--c-orange`      | `#EE4A1E` | hero plate, footer, section headings       |
| `--c-orange-ink`  | `#E94F1D` | marquee text (warmer in the source file)   |
| `--c-cream`       | `#F6F2F0` | about / menu / reviews plates              |
| `--c-yellow`      | `#EEF866` | burst badges, marquee band, follow card    |
| `--c-ink`         | `#000000` | body copy, buttons                         |
| `--c-placeholder` | `#D9D9D9` | image mask fallback                        |

Type is **Bowlby One** (display) + **Oswald** 400/600 (body), loaded from Google
Fonts. Each size token is a `clamp()` fitted to the two frames, so it resolves to
the exact Figma value at 375px and at 1440px — hero 40 → 110, section heading
32 → 72, lead 18 → 24, gutter 20 → 50. Nothing in the file uses a corner radius
except the review avatars; every other corner is square.

## Structure

```
src/
  App.tsx                  section order = frame order, top to bottom
  data/content.ts          all copy + asset paths, typed
  hooks/useMediaQuery.ts   drives the desktop/mobile review layouts
  styles/                  tokens + global primitives
  components/              one .tsx + .module.css per section
public/img/                images extracted from the .fig archive
```

Sections, in frame order: `Hero` → `About` → `Different` (full-bleed photo band)
→ `Menu` → `Marquee` → `Reviews` → `Instagram` → `Footer`.

Details worth knowing:

- **Marquee** — the file has two yellow strips crossing at `-2.66°` and `+2.71°`.
  Both are reproduced, scrolling in opposite directions, paused under
  `prefers-reduced-motion`.
- **Reviews** — desktop keeps the three masonry columns of the frame; below
  900px it collapses to one stack showing three cards behind the frame's
  `Load more` button.
- **Menu** — the `new` burst overhangs the card corner, so it lives outside the
  image mask; the wordmark plate is pulled up to straddle the photo band above it.
- **Newsletter form** — the design has no backend, so submit is handled locally
  and acknowledged in a `role="status"` region.

## Interpretations

Three things in the file were flattened vector outlines with no recoverable
source text, so they were rebuilt rather than traced:

1. **`ICONS_22`** — five outlined glyphs in the header and footer. The layer
   names are all `Vector`, so the brands aren't recorded. Reimplemented as
   Instagram, Facebook, TikTok, YouTube and X in
   [`src/components/Icons.tsx`](src/components/Icons.tsx); swap the paths if the
   real set differs.
2. **The wordmark plate** (`Group 3539`, 178 × 123) — two rows of outlined
   letterforms. Re-typeset as "Feranmi / Restaurant" in Bowlby One, matching the
   brand used throughout the page.
3. **The burst badges** — the hero seal and the `new` flag are drawn as a
   parametric `<Burst>` SVG rather than the original outlines.

Copy is transcribed verbatim from the file, including the typos in the source
design ("Life is to short to eat just salads", "toped with ragu sauce"). The one
deliberate departure is the brand: the design's "Jo's Burgers" is rebranded to
**Feranmi Restaurant** throughout — page title, wordmark, the "Hi, We're…"
heading, the founder caption, and the "Juicy Jo" burger, now "Juicy Feranmi".

## Images

The 16 photos used by the design were pulled out of the archive. They ship at up
to 4096px in the `.fig`; they've been resampled to roughly 2× their largest
rendered size and re-encoded as progressive JPEG — **12.05 MB → 1.22 MB** with no
visible change at any breakpoint. Everything below the fold is `loading="lazy"`;
the hero image is `fetchPriority="high"`.
