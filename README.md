# Feranmi Restaurant

A working ordering app for a fictional Lagos burger restaurant — browse the
menu, build a cart, check out, and book a table. Built in TypeScript from a
Figma design file, then extended well past it.

**Live:** https://feranmidevelops.github.io/feranmi-burger-repo/

```bash
npm install
npm run dev
```

| script              | what it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Vite dev server on <http://localhost:5173> |
| `npm run build`     | typecheck + production build to `dist/`    |
| `npm run preview`   | serve the production build                 |
| `npm run typecheck` | `tsc --noEmit`                             |

## What it does

- **Menu** — 10 dishes across four categories, with search, category filters and
  price sorting. Filter state lives in the URL, so a filtered menu is a
  shareable link and the back button steps through it.
- **Cart** — add, change quantity, leave a note for the kitchen, remove. Persists
  to `localStorage`, so a refresh or a closed tab doesn't lose the order.
- **Checkout** — delivery or pickup, eight Lagos delivery zones with their own
  fees and ETAs, a ₦5,000 delivery minimum, and Nigerian phone validation. On
  submit it mints an order reference and builds a formatted WhatsApp message.
- **Reservations** — date, time, party size and occasion, validated against the
  restaurant's actual seating slots, ending in the same WhatsApp handoff.
- **Invoice** — every placed order renders a one-page A4 PDF (jsPDF, loaded on
  demand) that the customer can download, or push straight into WhatsApp via the
  native share sheet on mobile.

### Why WhatsApp

Most Lagos restaurants genuinely take orders on WhatsApp, so that is the
handoff. It also means the app has no backend to keep alive: the demo works the
same in a year as it does today, which matters for something people click on
from a CV.

Nothing is charged in-app — payment is on delivery or at the counter, which is
how the model actually works.

## Architecture

```
src/
  routes/        one file per page (home, menu, cart, checkout, reservations, 404)
  components/    layout, header/footer, page sections, shared UI primitives
  cart/          cart reducer + context, localStorage persistence
  lib/           money, validation, WhatsApp message builders, asset paths
  data/          menu, business details, landing-page copy
  hooks/         media query, document title
```

React 18 + TypeScript (`strict`, plus `noUnusedLocals` and
`exactOptionalPropertyTypes`), React Router, CSS Modules, Vite. No UI framework,
no state library, no styling dependency.

Decisions worth flagging:

- **Money is integers.** Every price is stored in kobo and only formatted at the
  edge with `Intl.NumberFormat('en-NG')`. Bills never accumulate float error.
- **The cart reducer is pure.** `localStorage` hydration happens in an effect,
  not in the reducer's initial state, so the reducer is a plain function of
  state and action.
- **Stored carts are re-validated.** Anything in `localStorage` that no longer
  matches a menu item is dropped on load — the menu can change under a cart that
  has been sitting in a browser for weeks.
- **Accessibility is wired, not sprinkled.** Focus moves to `<main>` on route
  change, there's a skip link, form errors are tied to their inputs with
  `aria-describedby` and `aria-invalid`, and the first invalid field takes focus
  on a failed submit.
- **Selects are a custom combobox.** A native `<select>`'s option list is painted
  by the OS and cannot be themed, so brand colours would stop at the closed
  control. [`Select.tsx`](src/components/Select.tsx) implements the WAI-ARIA 1.2
  select-only combobox pattern — `aria-activedescendant`, arrow/Home/End keys,
  typeahead, Escape, and flip-up when there's no room below.
- **One set of control metrics.** `--control-min-h`, `--control-pad-x` and
  `--control-pad-y` in `tokens.css` are shared by every input, textarea and
  select, so nothing drifts out of alignment.

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
typecheck, build with the Pages sub-path as the Vite base, publish.
`scripts/postbuild.mjs` copies `index.html` to `404.html` so deep links like
`/menu` boot the router — GitHub Pages has no SPA rewrite and serves `404.html`
for unknown paths.

## Where the design came from

`restaurant.fig` is a ZIP holding `canvas.fig`, a `fig-kiwi` v25 binary. The
embedded Kiwi schema was parsed and the document message decoded, then the node
tree walked to recover every frame, fill, font, transform and text run — so the
landing page's numbers come from the file rather than from eyeballing a
screenshot. Two frames were implemented as the two ends of one responsive page:
desktop 1440 × 6496 and mobile 375 × 6921.

### Design tokens

In [`src/styles/tokens.css`](src/styles/tokens.css).

| token             | value     | used for                                 |
| ----------------- | --------- | ---------------------------------------- |
| `--c-orange`      | `#EE4A1E` | hero, app bar, footer, section headings  |
| `--c-orange-ink`  | `#E94F1D` | marquee text (warmer in the source file) |
| `--c-cream`       | `#F6F2F0` | page backgrounds                         |
| `--c-yellow`      | `#EEF866` | burst badges, marquee band, follow card  |
| `--c-ink`         | `#000000` | body copy, buttons                       |
| `--c-placeholder` | `#D9D9D9` | image mask fallback                      |

Type is **Bowlby One** (display) + **Oswald** 400/600 (body). Each size token is
a `clamp()` fitted to the two frames, so it resolves to the exact Figma value at
375px and at 1440px — hero 40 → 110, section heading 32 → 72, gutter 20 → 50.
Nothing in the file uses a corner radius except the review avatars.

### Departures from the file

- **Brand and location.** The design's "Jo's Burgers" in New York is now Feranmi
  Restaurant on Admiralty Way, Lekki. Prices are Naira, delivery zones are real
  Lagos areas, and the menu is Nigerian — Suya Smash, Dodo Stack, Obe Ata
  Chicken, Chapman.
- **The app.** The Figma file is a landing page. Everything from `/menu` onward
  — cart, checkout, reservations, routing, validation — is new.
- **Three flattened vectors were rebuilt, not traced.** The five `ICONS_22`
  social glyphs (layer names are all `Vector`, so the brands aren't recorded),
  the wordmark plate, and the burst badges. See
  [`src/components/Icons.tsx`](src/components/Icons.tsx).

## Images

All photography came out of the `.fig` archive, including ten assets the design
never placed. They ship at up to 4096px in the file and have been resampled to
roughly 2× their largest rendered size as progressive JPEG — **12.05 MB →
1.6 MB**. Everything below the fold is `loading="lazy"`.

They are placeholders from the design file, not photographs of the dishes they
are labelled with. Swapping in real photography means replacing files in
`public/img/` and updating the paths in [`src/data/menu.ts`](src/data/menu.ts).
