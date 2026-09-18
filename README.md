# dix.tax

Tax forms for people who own property abroad. Nuxt 4, `@nuxtjs/i18n`, five languages:
English (default), German, Spanish, Ukrainian, Russian.

The reader owns property in a country they do not live in. The country is always where the
property stands, which is also where the form is filed (`docs/adr/0001-site-navigation.md`).

| Country | Form | Path | Status |
| --- | --- | --- | --- |
| Switzerland | cantonal return, canton of Zurich | `/switzerland` | live |
| Spain | Modelo 210 | `/spain` | information page, tool in preparation |
| Germany | Anlage V | `/germany` | information page, tool in preparation |

No path segment may be a two letter code: `de`, `es`, `uk` and `ru` are locale prefixes, and
`fr` and `it` follow when those languages are added. Retired paths are redirected in
`movedRules` in `nuxt.config.ts`, once per language.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # reference cases for the calculations
pnpm typecheck  # types, including the generated ones
pnpm generate   # static site in .output/public
```

All three run on every push and pull request (`.github/workflows/ci.yml`).

## Structure

- `app/utils/products.ts` registry of countries; the home page, header, footer and both nav
  components read it, and `productForPath()` answers which country a path belongs to
- `app/pages/index.vue` hub: choose your country
- `app/pages/switzerland/` landing, calculator and guide for the Zurich declaration
- `app/pages/spain.vue`, `app/pages/germany.vue` use `ProductSoon.vue` until their tools exist
- `app/components/SiteHeader.vue` the countries, the language menu and the call to action, the
  same at every width; below 64rem the countries move into a `<details>` drawer
- `app/components/SiteProductBar.vue` breadcrumb and the pages of the country the reader is in
- `app/composables/useProductNav.ts` what both of those read: the country, the trail, its
  sections and the one step forward
- `app/components/FormSheet.vue` facsimile of the Liegenschaftenverzeichnis, used as hero and as live result
- `app/pages/legal-notice.vue`, `app/pages/privacy.vue` legal notice and privacy policy (German: `/de/impressum`, `/de/datenschutz`; Spanish: `/es/aviso-legal`, `/es/privacidad`). Operator details come from `company` in `app/app.config.ts`
- `server/api/interest.post.ts` signup form: emails the owner over SMTP (`SMTP_USER`, `SMTP_PASS`). The form only renders when both variables exist at build time (`signupEnabled` in `nuxt.config.ts`); otherwise visitors get a "write to us" mail link, so a form that cannot deliver is never shown
- `app/components/TrustBlock.vue` trust signals; shows "Independent review" only for entries in `app.config.ts`
- `app/components/Ui/` the design system: Button, Card, Badge, Section, Field, Segmented, ChoiceGroup, CheckList, Steps, Faq, CtaBand
- `app/utils/deadlines.ts` filing deadlines, with the source of every date in a comment; `DeadlineTimeline.vue` shows them as a horizontal line and `DeadlineNote.vue` as one line under a card
- `scripts/og-images.mjs` builds the social preview images from the locale files (`pnpm og`), committed under `public/og/`
- `app/composables/useDeclaration.ts` Zurich tax logic for an owner living abroad: the assessed
  values per property, the proportional debt split, and the German note for the remarks field
- `app/utils/countries.ts` a country name in the reader's language, used by the legal notice
- `tests/` reference cases with hand-calculated results
- `i18n/locales/<lang>/<file>.json` copy, one file per product plus `common.json` and `legal.json`. English is the source;
  keep keys and array lengths identical across languages. Zurich keys live under `zh.`.
  Do not use `@`, `|` or braces (other than placeholders) in values, vue-i18n treats them as syntax.

## Security, robots and sitemap

- `nuxt-security`: security headers, a content security policy (script hashes for the prerendered pages),
  a 20 KB body limit and a rate limit of five posts a minute on `/api/interest`. Configured under `security`
  in `nuxt.config.ts`. When you add a third-party script, font or API, it must be allowed there or the
  browser will block it.
- `@nuxtjs/robots` and `@nuxtjs/sitemap`: `robots.txt` and one sitemap per language with alternates.
  Both read `site.url`. Preview deployments are kept out of search engines automatically.

## Styling

Tailwind v4, loaded as a Vite plugin (`nuxt.config.ts`). The whole design system lives in
`app/assets/css/main.css`:

- `@theme` holds the tokens and is what makes `bg-field`, `text-ink-soft`, `text-2xs` and
  `shadow-sheet` exist. Change a colour or a step of the type scale there and it changes
  everywhere.
- The `:root` block below it keeps the short names (`--ink`, `--step-1`) alive for the
  component styles that are still hand written, above all the form facsimile.
- `@layer base` styles the bare elements, `@layer components` holds the four patterns that
  only CSS can express: `.wrap`, `.section`, `.ui-control` (one form control for the whole
  site) and `.stack-table` (a table that becomes labelled rows on a narrow screen).

Everything with a shape of its own is a component under `app/components/Ui/`, auto-imported
as `<UiButton>`, `<UiCard>`, `<UiField>` and so on. Reach for one of those before writing a
`<style>` block; the next calculator should be assembled from the same parts.

The look is meant to read as an official document: hairline rules instead of shadows, small
radii, a restrained type scale, one accent colour and the yellow used only to mark a number
the reader has to copy.

## Filing deadlines

`app/utils/deadlines.ts` holds the deadline for each form, with the tax administration it comes
from named in the file. `tests/deadlines.test.ts` pins every date. The dates are worked out in the
browser and the two components render nothing on the server: the pages are prerendered, so a
deadline baked in at build time would keep counting down to a date that has passed.
`DeadlineTable.vue` is the full calendar, `DeadlineNote.vue` the one line under a product card.

Two facts on the Modelo 210 page repeat these dates in prose. When a deadline moves, change
`deadlines.ts`, its test and that fact in all five locale files together.

## Social previews

`pnpm og` writes `public/og/<page>-<locale>.png`, one 1200 by 630 image per page and language,
from the titles and descriptions in the locale files. The images are committed, so the build and
the request path stay untouched and a shared link renders the same picture whether or not the
visitor's chat app can reach our server.

The page list is not written in the script: it reads `PRODUCTS` and `GUIDES` directly, so a
country or a guide added to a registry gets a picture without anyone remembering to add it.
CI redraws them on every push and fails if the committed files differ, so a changed title
cannot leave a stale preview behind. `useSocialImage()` points a page at its own image, and the
allowed names come from the same registries.

## Analytics

PostHog (EU cloud), switched on by setting `NUXT_PUBLIC_POSTHOG_KEY` at build time; without it the
library is not even downloaded. `app/plugins/analytics.client.ts` configures it: no cookies or device
storage, no session recording, no automatic capture, no person profiles, Do Not Track respected.

Events are sent only through `useAnalytics().track`, and the list in `app/composables/useAnalytics.ts`
is the complete list: `calculator_started`, `property_completed` (country code, property type, use,
currency), `sheet_printed`, `note_copied`, `signup_sent`. Never pass amounts, addresses or free text.
When this list changes, the privacy policy (`legal.json`, section "Cookies, fonts and tracking") and the
trust block must change with it. PostHog's endpoint is allowed in the content security policy.

PostHog drops traffic from automated browsers, so end-to-end tests see no events unless they call
`set_config({ opt_out_useragent_filter: true })` at runtime.

## Adding a product

1. Add an entry to `app/utils/products.ts` and `products.<key>` texts, including `country`, to
   every `common.json`.
2. Add `i18n/locales/<lang>/<id>.json` for each language and list the file in `localeFiles` in `nuxt.config.ts`.
3. Put pages under its path, the calculation in a composable, and reference cases in `tests/`.

## Reviews and certificates

Never show a review, audit or certificate that has not happened. When a tax adviser or auditor has
really reviewed a product, add them to `reviews` in `app/app.config.ts`; the block then appears by itself.

## Tax rules encoded

The reader owns property in the canton and lives abroad, so nothing is estimated: the canton
has already valued the property and the tool only arranges what the assessment says.

| Rule | Value | Source |
| --- | --- | --- |
| Owning property here makes a person taxable here, whatever their address | | Art. 4 Abs. 1 lit. c DBG, § 4 StG ZH |
| Steuerwert and Eigenmietwert | as assessed by the canton | amtliche Schätzung, entered by the reader |
| Rented out: the rent received replaces the Eigenmietwert | | Wegleitung ZH 2024 |
| Flat maintenance deduction | 20% of the gross | Wegleitung ZH 2024 |
| Debts and debt interest are split over all assets by where they lie | Swiss assets / worldwide gross assets | quotenmässige Schuldenverlegung |
| Net income transfers to line 6 (code 188), value to line 31.1 (code 421) | | Wegleitung ZH 2024 |
| Only the property is taxed, at the rate of the owner's worldwide income and wealth | | Art. 7 Abs. 1 DBG |
| For the federal tax the rate is at least the one matching the income earned in Switzerland | | Art. 7 Abs. 2 DBG |
| An owner abroad without a representative here can be served by publication in the official gazette | | Art. 116 Abs. 2 DBG |
| Eigenmietwert abolished, second homes to get a cantonal property tax instead | from 1 January 2029 | Federal decision, 2026 |

No currencies and no exchange rates: a Zurich property is assessed in francs. The whole model
is in `app/composables/useDeclaration.ts`, and `tests/ch-zurich.test.ts` pins every number.

## Before launch

- Payment is not built yet. The price (CHF 49.95 per apartment, first declaration) is set in `app/app.config.ts` and shown in the copy, but the calculator is still open. Stripe is ruled out. Later years are meant to be cheaper; the amount is not set. When payment is added, update the privacy text on the legal page, which currently says nothing is transmitted.
- Have a Zurich tax adviser review the copy, the proportional debt split and the wording about
  rate-determining income and wealth. Every article cited on the site was checked against the
  federal law itself (fedlex); the cantonal paragraphs have not been. The flat 20% deduction is taken from the Wegleitung and has
  not been checked against the federal rule for buildings under ten years old.
- Have native speakers proofread the `uk`, `ru` and `es` locale files.
- Replace the contact email in `app/app.config.ts` and add a postal address on the legal page.
