# ADR 0001: Site navigation

Status: accepted
Date: 2026-09-17
Deciders: Aleksej Dix
Related: #28 (this decision), #21 (cantons), #9 (guide pages)

## Context

The site was a hub plus three form pages, one of them live with two subpages, and
`app/components/SiteHeader.vue` held the whole navigation.

### What was broken

1. **No navigation on phones.** The nav was `hidden lg:flex` with no drawer, and the call to
   action was `hidden sm:inline-flex`. On a 390px screen the header was a logo and five
   language codes.
2. **The header swapped instead of nesting.** Inside the product the global nav was replaced by
   the product nav, so the only way back to the hub was the logo. The `nav.forms` key
   ("All forms") existed in all five locale files and was used nowhere.
3. **The language switcher spent the header's width.** Five always-visible codes sat in the row
   the nav needed, which is why the nav had nowhere to go on a small screen.
4. `aria-current="true"` on the language links (the valid token is `page`), no active state on
   nav links, and a skip link labelled "Prepare my declaration".

### What the paths could not do

`/ch/zurich` was country first, `/modelo-210` and `/anlage-v` were form named at the root.
`i18n.strategy` is `prefix_except_default`, so `/de`, `/es`, `/uk` and `/ru` are locale
prefixes and cannot be path segments. `/ch` was free by luck. #21 plans French for the Romandy
cantons, and Italy and France are the likeliest next property countries, so `/fr` and `/it` are
on their way in as locales too.

### What settled it

The site is for one reader: **somebody who owns property in a country they do not live in.**
The countries covered are Spain, Switzerland and Germany. That fixes the meaning of a country:
it is where the property stands, which is also where the form is filed. Before that decision a
country page was ambiguous, because Switzerland was where the reader lived while Spain was
where their flat was, and no hierarchy could hold both.

## Decision

### 1. The country is the level, and it is spelled out

```
/                          hub: where is your property?
/spain                     Modelo 210
/switzerland               cantonal return under limited tax liability
/switzerland/guide
/switzerland/calculator
/germany                   Anlage V
/guides/<slug>             query-shaped entry pages (#9)
```

One country, one page, and the form is what that page is about, so there is no empty container
anywhere. Cantons nest under `/switzerland` when a second one lands (#21).

**Rule: no path segment is a two letter code.** The locale prefixes own that namespace, and the
codes still free today (`fr`, `it`) are the ones a growing site wants. So `/switzerland`, not
`/ch`. This supersedes the `/ch/<canton>` path in #21.

### 2. The header always carries the country level

One shape everywhere: logo, the three countries, language, call to action. It never swaps out,
because search drops readers straight into a country page and the others have to stay one click
away. What belongs to a single country sits on its own row underneath: a breadcrumb and that
country's pages (`SiteProductBar`).

### 3. Phones get the same links, in a drawer

A `<details>` disclosure: it opens with no script at all, so every link is in the prerendered
HTML for the crawler and the five sitemaps, and it closes itself on navigation and on Escape.
The language switcher uses the same pattern at every width, one control labelled with the
current language. The call to action is visible at every width, with a short label below 40rem.

### 4. Details that came with it

- `aria-current="page"` on the active country, the active language and the last breadcrumb.
- Anchors in the country row are plain `<a href>`: `NuxtLink` decides what is current from the
  path alone, so every anchor on a page would be marked current at the same time.
- `nav.skip` ("Skip to content"), `nav.startShort`, `nav.calculator`, `nav.here` and
  `products.<country>.country` in all five locale files.
- A 301 in `routeRules` for every retired path, once per locale (`movedRules` in the config).

## Alternatives considered

| Option | Why not |
| --- | --- |
| Form first (`/modelo-210`, `/swiss-tax-return/zurich`) | The right answer while the reader was a Swiss resident with a flat abroad, because "country" was then ambiguous. Once the reader became the non-resident owner, the ambiguity went and the country became the thing they identify with: they know where their flat is, not what the form is called. |
| Country first with ISO codes (`/ch`, `/es`, `/de`), as in #21 | Collides with the locale prefixes. `/es` and `/de` are gone already, `/fr` and `/it` go the same way. |
| A country level plus a separate form page under it | One form per country today. The second page would say the same thing twice. |
| Mega menu over all forms | Three countries. The hub already is that menu, and it earns the landing traffic. |
| Locale strategy `prefix` (`/en/...` too) | Would free the two letter namespace, at the cost of the default locale's URLs and every existing link. Reconsider only if country codes become worth it. |

## Consequences

- `/ch/zurich`, `/ch/zurich/guide`, `/ch/zurich/calculator`, `/modelo-210` and `/anlage-v` are
  retired, with a 301 each in five languages. 126 routes still prerender.
- The registry keys became `switzerland`, `spain` and `germany`. The locale **files** are still
  `ch-zurich.json`, `modelo-210.json` and `anlage-v.json`, and the Zurich content still lives
  under the `zh.` namespace. Those follow with the copy, not with the paths.
- **The copy now points the wrong way.** Every page still addresses a Swiss resident with a flat
  abroad, and the Swiss calculator computes that case: 70 percent of the purchase price, an
  estimated Eigenmietwert and two exchange rates. For a Swiss property held from abroad the
  canton issues the Eigenmietwert and the Steuerwert, so none of that applies. This is the next
  piece of work and it needs an adviser (#15).
- Slugs are English in every language for now. Translating them (`/de/schweiz`) reads better and
  doubles the redirect surface; it belongs with the copy rewrite.
- Social images are named by page key, not by path, so the move did not touch `public/og/`.

## Open questions

1. Do slugs get translated per locale, or stay English?
2. Does `/switzerland` stay the Swiss page, with `/switzerland/zurich` appearing only when a
   second canton lands (#21), or does Zurich get its own page straight away?
3. Is "All forms" still the right name for the hub crumb now that the hub asks where the
   property is, rather than which form is needed?
