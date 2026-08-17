# NatWest xwalk demo

A demo NatWest-branded banking site built on **AEM Edge Delivery Services (EDS)**, authored via **Universal Editor / AEM as a Content Source (xwalk)**. Used as a hands-on demo of AEM CS + Universal Editor + EDS + Content Fragments working together.

## Environments

| Environment | URL |
|---|---|
| Author (edit content here) | https://author-p189773-e1977501.adobeaemcloud.com |
| Preview (previewed content) | https://main--natwest-xwalk--skiper76.aem.page/ |
| Live (published content) | https://main--natwest-xwalk--skiper76.aem.live/ |
| GitHub repo | https://github.com/Skiper76/natwest-xwalk |
| Cloud Manager program | "DEMO POT EMEA Program 6 - Natwest" |

To edit a page, open it on the **author** host and append `?cmd=open` via the Sidekick, or open the page directly in Universal Editor from AEM Sites.

## Site map

**Real page paths are nested one level under `/index/`** — this is a pre-existing quirk of how the pages were created, not a bug to "fix". Always link internally using these exact paths (never `/content/natwest-xwalk/...` — that only works when browsing the raw author host):

| Page | Path |
|---|---|
| Homepage | `/` |
| Bank accounts | `/index/bank-accounts` |
| Insurance | `/index/insurance` |
| First-time buyers (mortgages) | `/index/first-time-buyers` |
| Mortgage calculator | `/index/mortgage-calculator` |
| Contact us | `/index/contact-us` |
| Articles listing | `/index/articles` |
| Article: "Five simple ways to manage your money better" | `/index/articles/managing-your-money` |
| Article: "What to prepare before your mortgage application" | `/index/articles/mortgage-application-tips` |
| Nav (header content) | `/nav` |
| Footer content | `/footer` |

`/index/articles/article-template`, `/index/articles/zz-test2`, `/index/articles/zz-test3` are scratch/test pages — safe to ignore or delete.

The mortgage calculator **widget** (interactive form on the mortgage calculator page) is a static bundle served from the code repo at `/widgets/mortgage-calculator.{html,css,js}` — it is not AEM content, and is referenced by the `widget` block by that exact code path.

## Blocks

| Block | Purpose |
|---|---|
| `hero` / `hero-purple` | Full-width banner, image + heading + CTAs |
| `cards` / `cards-icon` / `cards-account` / `cards-cover` | Card grids, different visual treatments (bordered / icon+link-list / account promo / cover-image) |
| `cf-card` | Renders a Content Fragment (see below) as a styled card or raw JSON |
| `columns` / `columns-feature` | Generic multi-column layout / image+text feature row |
| `carousel-cards` | Horizontally scrollable card carousel |
| `accordion-help` / `accordion-legal` | Expandable FAQ / legal-copy accordions |
| `tabs-tracker` | Tabbed panel (used for the mortgage application tracker demo) |
| `search-faq` | Client-side search over an index (defaults to `query-index.json`) |
| `table-of-contents` | Auto-built from `<h2>`s in the same section — used on article pages |
| `article-byline` | Author + date row for articles |
| `articles` | Article listing / "related articles" — reads `query-index.json`, filters by path prefix |
| `breadcrumbs` | Auto-derived from the URL's last two path segments, with title lookups via `query-index.json` |
| `quote` | Pull-quote, built client-side (see gotchas — raw `<blockquote>` gets stripped server-side) |
| `ranking-chart` | Ranked percentage bar chart (e.g. the bank-accounts service-quality comparison) |
| `widget` | Embeds a static JS/CSS/HTML bundle from `/widgets/*` by code path |
| `fragment` | Includes another **EDS page's** content by path (page transclusion — not a Content Fragment) |
| `header` / `footer` | Site nav and footer, fed from the `/nav` and `/footer` pages |

Each block's fields are defined in `blocks/<name>/_<name>.json`; running `npm run build:json` merges every block's model/definition/filter into the root `component-*.json` files that Universal Editor actually reads. **Always run this after touching any `_*.json`.**

## Content Fragments

A "Product Card" Content Fragment Model exists at `/conf/global/settings/dam/cfm/models/product-card` (fields: `title`, `description`, `image`, `linkHref`, `linkText`). Three fragments live under `/content/dam/natwest-xwalk/`: `current-accounts`, `mortgages`, `talk-to-us` — used by the `cf-card` blocks in the homepage's "Popular products" section.

A GraphQL endpoint named **"natwest"** is published at `/content/cq:graphql/global/endpoint` and exposes the `productCard` type. The `cf-card` block queries it client-side, filtered by the fragment's path.

**Known limitation:** this query only resolves when the visitor has an authenticated AEM session (author host / Universal Editor) — same-origin, credentialed request. Anonymous public delivery on the publish tier is blocked by the dispatcher (no allow-rule for `/content/cq:graphql/*` yet), which needs a `dispatcher.any` change deployed via Cloud Manager. That's outside this repo.

## Experimentation

The [`aem-experimentation`](https://github.com/adobe/aem-experimentation) plugin is vendored under `plugins/experimentation` via `git subtree`. To pull the latest version:
```sh
git subtree pull --squash --prefix plugins/experimentation https://github.com/adobe/aem-experimentation.git v2
```
The Sidekick "Experimentation" button (preview/dev only) opens the simulation panel — see `scripts/experiment-loader.js` for the wiring.

## Local development

```sh
npm i
npx -y @adobe/aem-cli up --no-open --forward-browser-logs
```
Serves `http://localhost:3000`, proxying real AEM content by default. Static test pages live under `drafts/` — pass `--html-folder drafts --html-mount /` to serve those instead of/alongside live content.

```sh
npm run lint       # eslint + stylelint
npm run lint:fix    # auto-fix
npm run build:json  # regenerate component-definition/models/filters.json from models/_*.json and blocks/*/_*.json
```

## Gotchas (read before you lose an hour to these)

- **`/index/` path prefix** — see Site map above. Never hardcode `/content/natwest-xwalk/...` in authored links or block JS; that only resolves on the raw author host, not on the real EDS site.
- **Universal Editor appends `.html`** to internal content-reference links in its canvas. If a block's JS treats a picked reference as a JCR/DAM path (not a page URL), strip a trailing `.html` before using it (see `cf-card.js`).
- **`name` is a reserved property.** AEM uses it for a component's authoring display label (`data-aue-label`). A model field also called `name` will never render as visible content — pick a different field name (e.g. `bankName`, not `name`).
- **Plain `text`-component fields don't render as visible HTML** for generic `block`/`block/item` components (only `richtext`, `reference`, and `aem-content`/`aem-content-fragment` do). When patching content directly via the AEM API, set `modelFields` accordingly (e.g. `"percentage@richtext"`, not `"percentage@text"`) even if the authored model declares a different component type.
- **Content-Fragment picker field:** use `aem-content-fragment` (not `aem-content`, which only browses pages), and nest `rootPath` under `validation` — `{ "validation": { "rootPath": "/content/dam/natwest-xwalk" } }`, not a top-level property.
- **CSS Grid columns going uneven?** Grid items default to `min-width: auto`, so a wide image can force its column past its `1fr` share. Reset `min-width: 0` on the grid's direct children.
- **SVGs without `width`/`height`** (only a `viewBox`) can fail Adobe's `html2md` image validation during preview/publish, blocking the whole page with a 409. If a page won't preview and the error mentions "Images N and M have failed validation," swap those two images for a raster (JPEG/PNG) or a well-formed SVG.
- **Raw `<blockquote>` gets stripped** by the server-side richtext sanitizer (falls back to plain `<p>`). The `quote` block works around this by building the `<blockquote>` client-side from unwrapped content.
- **`query-index.json`** only reflects **published** (not just previewed) pages. If a listing/search block shows nothing, check whether the source pages were actually published (Sidekick "Publish", not AEM's native Publish button — see below).
- **Two different "Publish" buttons.** AEM's own Publish button (in Universal Editor / Sites console) replicates to the classic AEM publish tier — unrelated to EDS. Use the **Sidekick's** Publish button (on the actual `aem.page` URL, not inside the UE canvas) to publish to `aem.live` and refresh `query-index.json`.
