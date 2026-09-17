# Dix.Tax

Tax forms for people who own property abroad. Nuxt 4, `@nuxtjs/i18n`, five languages:
English (default), German, Spanish, Ukrainian, Russian.

| Product | Path | Status |
| --- | --- | --- |
| Swiss tax return, canton of Zurich | `/ch/zurich` | live |
| Modelo 210 (Spain) | `/modelo-210` | information page, tool in preparation |
| Anlage V (Germany) | `/anlage-v` | information page, tool in preparation |

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # reference cases for the calculations
pnpm generate   # static site in .output/public
```

## Structure

- `app/utils/products.ts` registry of products; the home page, header and footer read it
- `app/pages/index.vue` hub: choose your form
- `app/pages/ch/zurich/` landing, calculator and guide for the Zurich declaration
- `app/pages/modelo-210.vue`, `app/pages/anlage-v.vue` use `ProductSoon.vue` until their tools exist
- `app/components/FormSheet.vue` facsimile of the Liegenschaftenverzeichnis, used as hero and as live result
- `app/pages/legal-notice.vue`, `app/pages/privacy.vue` legal notice and privacy policy (German: `/de/impressum`, `/de/datenschutz`; Spanish: `/es/aviso-legal`, `/es/privacidad`). Operator details come from `company` in `app/app.config.ts`
- `server/api/interest.post.ts` signup form: emails the owner over SMTP (`SMTP_USER`, `SMTP_PASS`). The form only renders when both variables exist at build time (`signupEnabled` in `nuxt.config.ts`); otherwise visitors get a "write to us" mail link, so a form that cannot deliver is never shown
- `app/components/TrustBlock.vue` trust signals; shows "Independent review" only for entries in `app.config.ts`
- `app/composables/useDeclaration.ts` Zurich tax logic and the German note for the remarks field
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

1. Add an entry to `app/utils/products.ts` and `products.<key>` texts to every `common.json`.
2. Add `i18n/locales/<lang>/<id>.json` for each language and list the file in `localeFiles` in `nuxt.config.ts`.
3. Put pages under its path, the calculation in a composable, and reference cases in `tests/`.

## Reviews and certificates

Never show a review, audit or certificate that has not happened. When a tax adviser or auditor has
really reviewed a product, add them to `reviews` in `app/app.config.ts`; the block then appears by itself.

## Tax rules encoded

| Rule | Value | Source |
| --- | --- | --- |
| All property, including abroad, goes in the Liegenschaftenverzeichnis | | Wegleitung ZH 2024 |
| Net income transfers to line 6 (code 188), value to line 31.1 (code 421) | | Wegleitung ZH 2024 |
| Notional rent (Eigenmietwert) | 4.25% apartment, 3.5% house | Liegenschaftenverzeichnis form |
| Flat maintenance deduction | 20% | Wegleitung ZH 2024 |
| Tax value of property abroad | 70% of purchase price | Zurich practice as published by fiduciaries, not an official directive |
| Source-taxed residents must file | other income >= CHF 3'000 or wealth >= CHF 80'000 / 160'000 | Wegleitung ZH 2024 |
| Eigenmietwert abolished | from 1 January 2029 | Federal Council, 1 April 2026 |

Two exchange rates are used, both prefilled with approximations in `useDeclaration.ts`:
the year-end rate for the value (wealth) and the annual average rate for rent (income).
Update both each January from the ICTax rate list.

## Before launch

- Payment is not built yet. The price (CHF 49.95 per apartment, first declaration) is set in `app/app.config.ts` and shown in the copy, but the calculator is still open. Stripe is ruled out. Later years are meant to be cheaper; the amount is not set. When payment is added, update the privacy text on the legal page, which currently says nothing is transmitted.
- Have a Zurich tax adviser review the copy and the 70% valuation rule.
- Have native speakers proofread the `uk`, `ru` and `es` locale files.
- Replace the contact email in `app/app.config.ts` and add a postal address on the legal page.
