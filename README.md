# Feranmi Restaurant

A working ordering app for a fictional Lagos burger restaurant — browse the
menu, build a cart, check out, and book a table. Built in TypeScript from a
Figma design file, then extended well past it.

**Live:** https://feranmidevelops.github.io/feranmi-burger-repo/

```bash
npm install
npm run dev
```

| script               | what it does                               |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Vite dev server on <http://localhost:5173> |
| `npm run build`      | typecheck + production build to `dist/`    |
| `npm test`           | Vitest, one pass                           |
| `npm run test:watch` | Vitest in watch mode                       |
| `npm run preview`    | serve the production build                 |
| `npm run typecheck`  | `tsc --noEmit`                             |

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
- **Opening hours that mean something.** The trading state is computed against
  the clock in `Africa/Lagos`, not the visitor's timezone: a live badge in the
  header, and a notice at checkout when the kitchen is shut.
- **A page per dish** at `/menu/:id`, with the long-form copy, a quantity
  stepper, breadcrumbs and "goes well with". Each one is a static HTML file with
  its own title, description and photo, so a dish link pasted into a chat
  previews as that dish.
- **Order again.** Placed orders are kept on the device and re-orderable in one
  tap, notes included. No account, nothing sent anywhere.
- **"Anything with that?"** — a side or a drink offered at the cart when the
  order has a main but no complement. Never a second main.

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
  cart/          cart reducer + context, order history, localStorage persistence
  lib/           money, hours, SEO metadata, upsell rules, validation, WhatsApp
  data/          menu, business details, landing-page copy
  hooks/         media query, trading state, per-route head tags
  test/          Vitest setup
plugins/         build-time SEO: per-route HTML, JSON-LD, sitemap, robots
scripts/         brand asset generation, Pages postbuild
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
- **The kitchen has a clock.** Opening hours are stored as day *numbers* in
  [`site.ts`](src/data/site.ts) and the words ("Monday – Thursday") are derived,
  so the label can never disagree with the schedule. `openState()` in
  [`hours.ts`](src/lib/hours.ts) is pure — `now` is always passed in — and works
  in `Africa/Lagos`, so somebody browsing from London at midnight is told the
  kitchen is shut rather than being sold a burger nobody is there to cook. It is
  a warning at checkout, not a block: the order still goes through as a
  pre-order, because refusing it just sends the customer elsewhere.
- **Crawlers get real HTML.** A single-page app ships one `index.html` with one
  title, and neither Google nor the WhatsApp link unfurler runs JavaScript — so
  a pasted link shows no preview card and the whole site indexes as one untitled
  page. [`plugins/seo.ts`](plugins/seo.ts) emits a separate static file per route
  at build time (`menu/index.html` and so on), each with its own title,
  description, canonical and Open Graph tags, plus `Restaurant` / `Menu` JSON-LD,
  `sitemap.xml` and `robots.txt`. All of it is generated from `src/data/*` and
  the route table in [`seo.ts`](src/lib/seo.ts), so the markup cannot drift from
  the app, and [`useSeo`](src/hooks/useSeo.ts) keeps the same tags in step during
  client-side navigation.
- **Nothing goes blank.** An error boundary wraps the whole app and a second one
  wraps the route outlet, keyed on the pathname so navigating away clears the
  error. A crash costs a section, not the page — and the fallback still offers
  the WhatsApp number, because a customer who wants food should not be blocked
  by a rendering bug.
- **Icon weight follows text weight.** Icons are Phosphor. An icon's stroke
  matches the weight of the text it sits beside — `regular` next to Oswald 400,
  `bold` next to Oswald 600 — expressed as `ICON.body` / `ICON.strong` in
  [`Icons.tsx`](src/components/Icons.tsx) rather than picked per call site.
  Sizing is `1em` via a root `IconContext`, so a glyph tracks the font-size of
  its line instead of carrying its own scale. Brand marks (WhatsApp, the marquee
  sparkle) use `fill`, matching how the Figma file drew them.

## Tests

252 tests, `npm test`. They sit on the parts where a bug is expensive rather
than chasing a coverage number:

| suite                  | what it protects                                             |
| ---------------------- | ------------------------------------------------------------ |
| `money`                | kobo → naira at the one point integers become text            |
| `hours`                | open/closed across every boundary, timezone, and past midnight |
| `cartReducer`          | merging, clamping, unknown ids, and that it never mutates      |
| `validation`           | Nigerian mobile formats, E.164, the booking window             |
| `whatsapp`             | the order message — the only record the kitchen ever sees      |
| `seo`                  | titles and descriptions inside the lengths Google truncates at |
| `Select`               | the WAI-ARIA combobox keyboard contract, end to end            |
| `MenuCard`             | price, alt text, eager-vs-lazy, and the write to storage       |
| `OpeningHours`         | the live badge, against a faked clock                          |
| `orders`               | history survives a changing menu; nothing personal is stored   |
| `upsell`               | only ever complements — never a second main                    |
| `RecentOrders`         | one-tap re-order puts the whole order back, notes included     |
| `assets`               | every image path matches a real file, case included            |

The WhatsApp suite is the one worth reading. There is no database and no order
API, so whatever lands in that chat *is* the order — anything missing from the
message is an order that cannot be cooked or delivered.

## Deployment

Everything the site serves — HTML, JS, CSS and every photograph — is one static
bundle built from the repo and published to GitHub Pages. There is no image host,
no CDN account and no hotlinked URL that can expire: `public/img` is committed,
Vite copies it into `dist/` verbatim, and the whole directory is uploaded as the
Pages artifact. The images keep working for exactly as long as the repo exists.

Paths go through [`asset()`](src/lib/asset.ts), which prefixes
`import.meta.env.BASE_URL`, because Pages serves the site from `/<repo>/` and a
bare `/img/x.jpg` would 404 there.

The one way this breaks quietly is filename case. Windows and macOS do not care;
the Linux runner and Pages do, so `/img/Chapman.jpg` against `chapman.jpg` works
on a laptop and 404s in production. [`assets.test.ts`](src/data/assets.test.ts)
checks every referenced path against the real filenames, catches a src that
skips `asset()`, and pins the list of unused files — and it runs before the
deploy step, so a mismatch fails the build rather than the site.

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
typecheck, test, build with the Pages sub-path as the Vite base, publish. Every
other branch and pull request runs the same checks via
[`ci.yml`](.github/workflows/ci.yml) without deploying.

GitHub Pages has no SPA rewrite and serves `404.html` for unknown paths, so the
SEO plugin emits the app shell there too — a deep link still boots the router
while the HTTP status stays a truthful 404.

One caveat of the `github.io/<repo>/` sub-path: crawlers only read `robots.txt`
from a domain root, so the generated one is advisory until the site moves to a
custom domain. The `noindex` meta tags on `/cart` and `/checkout` do the real
work, and `sitemap.xml` can be submitted directly in Search Console.

## Brand assets

`public/favicon.svg`, the PNG icon set, `favicon.ico` and the 1200×630 Open Graph
card are generated by [`scripts/make-icons.mjs`](scripts/make-icons.mjs) from one
shared path definition, so no size can drift from another. The output is
committed; `sharp` is not a project dependency. Regenerate with:

```bash
npx --yes --package sharp node scripts/make-icons.mjs
```

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
never placed. They ship at up to 4096px in the file and are resampled to roughly
2× their largest rendered size as progressive JPEG — 12.05 MB → 1.9 MB.
Everything below the fold is `loading="lazy"`.

[`scripts/resample-dish-photos.mjs`](scripts/resample-dish-photos.mjs) re-derives
the large photographs from the archive. It matches shipped files to their sources
by perceptual signature, and the direction of that matching matters: it runs
**original → shipped file**, never the reverse. The archive holds only ten
distinct food photographs and several shipped images are crops of them, so asking
"what is the best source for this crop?" answers with the crop's parent and
quietly gives two dishes the same picture. Asking "which one file is this
original?" cannot. A crop finds no original of its own and is left at the size it
already had. The script hashes the results afterwards and fails if any two came
out identical.

### These are placeholders

The photographs are from the design file, not of the dishes they are labelled
with. Most are at least plausible; one is not — **Chapman, a drink, is
illustrated with a cheeseburger**, because the archive contains no photograph of
a drink and the only glass in it is an out-of-focus background element. That one
needs a real photograph.

Swapping in real photography means replacing files in `public/img/` and updating
the paths in [`src/data/menu.ts`](src/data/menu.ts). Dish pages render at 640px,
so supply at least 1280px on the long edge.
