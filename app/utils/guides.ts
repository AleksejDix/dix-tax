// Guide pages: one per question somebody actually types into a search box, in their own
// language. They are not product pages. Each one answers the question in full and then says
// which of our forms it belongs to, so a reader who arrived from a search leaves knowing
// what to do even if they never touch the tool.
//
// Adding one means: an entry here, a page file under `app/pages/guides/` whose name matches
// `path`, a `guides.<key>` block in every `i18n/locales/<lang>/guides.json`, and, where the
// language is worth a slug of its own, an entry in `i18n.pages` in nuxt.config.
export interface Guide {
  /** Key under `guides.*` in guides.json */
  key: 'abroadFromZurich' | 'spanishHoliday'
  /** Path in the default locale; other locales may translate it in `i18n.pages` */
  path: string
  /** The form this guide leads to, by the country it is filed in */
  country: Product['key']
  /** When its facts were last checked against the sources, shown on the page */
  checked: string
  /** Base name under public/og/, drawn by `pnpm og` from this guide's own title */
  image: 'guide-abroad-from-zurich' | 'guide-spanish-holiday'
}

export const GUIDES: Guide[] = [
  {
    key: 'abroadFromZurich',
    path: '/guides/property-abroad-in-the-zurich-tax-return',
    country: 'switzerland',
    checked: '2026-09',
    image: 'guide-abroad-from-zurich',
  },
  {
    key: 'spanishHoliday',
    path: '/guides/spanish-holiday-home-tax',
    country: 'spain',
    checked: '2026-09',
    image: 'guide-spanish-holiday',
  },
]
