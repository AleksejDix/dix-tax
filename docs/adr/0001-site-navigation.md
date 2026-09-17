# ADR 0001: Site navigation

Status: proposed
Date: 2026-09-17
Deciders: Aleksej Dix
Related: #21 (canton pages, currently `/ch/<canton>`), #9 (guide pages per search query)

## Context

Today the site is a hub (`/`) plus three form pages, one of them live with two subpages.
`app/components/SiteHeader.vue` holds the whole navigation.

### What is broken now

1. **No navigation on phones.** `.nav { display: none }` below 56rem and there is no drawer.
   Below 38rem the CTA is hidden too. A phone visitor sees a logo and five language codes.
2. **The header swaps instead of nesting.** Inside `/ch/zurich` the global nav is replaced by
   the product nav, so the only way back to the hub is the logo. The `nav.forms` key
   ("All forms") exists in every locale file and is used nowhere: the parent link was intended
   and never built.
3. **The language switcher spends the header's width.** Five always-visible codes compete with
   the primary nav for the same row, which is why the nav had nowhere to go on small screens.
4. Smaller defects in the same component: `aria-current="true"` on the language links (the valid
   token here is `page`), no active state on nav links, and the skip link in `app/app.vue` is
   labelled with `nav.start` ("Prepare my declaration") instead of "Skip to content".

### What will break next

Paths are inconsistent: `/ch/zurich` is country first, `/modelo-210` and `/anlage-v` are form
named at the root. `i18n.strategy` is `prefix_except_default`, so `/de`, `/es`, `/uk`, `/ru` are
locale prefixes, not available as path segments. `/ch` is safe only by luck. Issue #21 plans
French for the Romandy cantons, and Italy and France are the likeliest next property countries
for a Swiss resident, so `/fr` and `/it` are on the way in as locales and would have been wanted
as countries.

### Three axes, only one of which can be the path

- **Filing jurisdiction**: which tax office receives the form. Has real children in one place
  only: 26 cantons under the Swiss return (#21).
- **Form name**: what people actually type. "Modelo 210", "Anlage V",
  "Liegenschaft im Ausland Steuererklärung Zürich" (#9).
- **Country**: ambiguous for this audience. Switzerland is where the visitor lives, Spain is
  where the property stands, and `hub.bothBody` says the normal case is both at once. A page
  called "Spain" has to serve a Swiss resident with a flat in Valencia and a non-resident owner
  filing Modelo 210. As an editorial page it can pick one intent and say so. As a path parent it
  cannot.

## Decision

### 1. Form first, region as child

```
/                                     hub: choose your form
/<form>                               form page
/<form>/<region>                      region page, where a form differs by region
/<form>[/<region>]/calculator|guide   the tool and its guide
/guides/<slug>                        query-shaped entry pages (#9)
```

So `/modelo-210`, `/anlage-v`, `/swiss-tax-return` with `/swiss-tax-return/zurich`,
`/swiss-tax-return/zug`. Slugs are translated per locale through `i18n.pages`
(`/de/schweizer-steuererklaerung/zuerich`).

The hierarchy sits where there are real children. Spain and Germany get no country level to
stand empty, and the term people search for stays at the root. Per-country pages, when they come,
are entry pages in `/guides/`, addressed to one reader each, and they link into the forms.

**Rule: no path segment may be a two letter code.** The locale prefixes own that namespace, and
the ones still free today are exactly the ones a growing site wants (`fr`, `it`). This retires
`/ch/zurich` and supersedes the `/ch/<canton>` path in #21.

### 2. The header always carries the global level

One shape everywhere: logo, nav, language, CTA. It never swaps out. Inside a form, the product
level gets its own row: a breadcrumb (`All forms > Swiss tax return > Zurich`) and the section
links that are in the header today (How it works, Guide, Questions). The header CTA becomes the
product CTA on those pages, as it does now.

### 3. Phones get the same links, in a drawer

A `<details>`/`<summary>` disclosure: no JavaScript state, no hydration dependency, every link
present in the prerendered HTML for the crawler and the five sitemaps. The language switcher
collapses into the same pattern at every width: one control labelled with the current language,
the five alternates as real `switchLocalePath` links inside it. The CTA stays visible at every
width; it is the one action the site exists for.

### 4. Details that come with it

- `aria-current="page"` for the active nav link and the active language, from `NuxtLink`.
- A new `nav.skip` key, "Skip to content", in all five locale files.
- `BreadcrumbList` JSON-LD on form, region and tool pages, from the same breadcrumb data.
- A 301 in `routeRules` for every retired path, once per locale, alongside the `/legal` ones.

## Alternatives considered

| Option | Why not |
| --- | --- |
| Country first (`/switzerland/zurich`, `/spain/modelo-210`) | Reads well and matches how the hub talks, but "country" means residence in one product and property location in the next, and it builds a level for Spain and Germany that has one child each. Was this ADR's first draft. |
| Country ISO codes (`/ch`, `/es`, `/de`), as in #21 | Collides with the locale prefixes. `/es` and `/de` are unavailable today, `/fr` and `/it` go the same way as soon as Romandy needs French. |
| Flat slugs for everything, cantons included | 26 canton slugs at the root read as a list, not a structure, and there is nowhere to put what the cantons share. |
| Mega menu over all forms | Three forms today. The hub already is that menu, and it earns the landing traffic. |
| Locale strategy `prefix` (`/en/...` too) | Would free the two letter namespace, at the cost of the default locale's URLs and every existing link. Reconsider only if country codes become worth it. |

## Consequences

- One migration: pages move under `app/pages/`, `products.ts` paths change, `i18n.pages` gains
  the translated slugs, redirects are added, the `README.md` table and #21 are updated. Cheap
  now, expensive after launch and after the first inbound link.
- `/ch/zurich` becomes `/swiss-tax-return/zurich`, one level deeper, and every locale needs a
  translated form slug that reads naturally. This is copy work, not code.
- Social images are named by page key, not by path (`useSocialImage('ch-zurich')`), so the
  rename does not touch `public/og/`.
- `tests/ch-zurich.test.ts` tests the calculation, not routes, so it is unaffected.
- New copy keys per language: skip link, breadcrumb labels, form slugs.
- Sections 2, 3 and 4 do not depend on section 1 and can ship first.

## Open questions

1. Is `swiss-tax-return` the right umbrella, given that the form is really the
   Liegenschaftenverzeichnis inside the cantonal return? Alternatives: `/tax-return-switzerland`,
   or keeping the canton at the root (`/zurich-tax-return`) until a second canton exists.
2. Are slugs translated per locale, or English everywhere? Translation reads better and doubles
   the redirect surface.
3. Does `/ch/zurich` stay alive as a canonical alias, or 301 only? (301 only, unless it already
   has inbound links worth keeping direct.)
4. With three forms, does the header list forms, or one "All forms" link with the hub doing the
   choosing? A three item nav is fine; a twenty item one is not, so the answer changes once
   cantons land.
