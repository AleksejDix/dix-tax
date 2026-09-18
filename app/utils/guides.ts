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
  key: 'swissFromAbroad' | 'spanishHoliday'
  /** Path in the default locale; other locales may translate it in `i18n.pages` */
  path: string
  /** The country page this guide leads to */
  country: Product['key']
  /** When its facts were last checked against the sources, shown on the page */
  checked: string
  /** Base name under public/og/, drawn by `pnpm og` from this guide's own title */
  image: 'guide-swiss-from-abroad' | 'guide-spanish-holiday'
}

export const GUIDES: Guide[] = [
  {
    key: 'swissFromAbroad',
    path: '/guides/swiss-property-when-you-live-abroad',
    country: 'switzerland',
    checked: '2026-09',
    image: 'guide-swiss-from-abroad',
  },
  {
    key: 'spanishHoliday',
    path: '/guides/spanish-holiday-home-tax',
    country: 'spain',
    checked: '2026-09',
    image: 'guide-spanish-holiday',
  },
]
