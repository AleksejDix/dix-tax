// Registry of the countries dix.tax covers. The reader owns property in a country they do
// not live in, so the country is always where the property stands and where the form is
// filed. Adding one means: an entry here, a locale file per language
// (i18n/locales/<lang>/<id>.json) and its pages under `path`.

/** A link inside a country, shown in its own row under the header. */
export interface ProductSection {
  /** Label key under `nav.*` in common.json */
  key: 'how' | 'guide' | 'faq'
  /** A page of its own, or an anchor on the country's landing page */
  path?: string
  hash?: string
}

export interface Product {
  /** Key under `products.*` in common.json */
  key: 'switzerland' | 'spain' | 'germany'
  /**
   * No path segment may be a two letter code: `de`, `es`, `uk` and `ru` are locale prefixes
   * (see `i18n.strategy`), and `fr` and `it` follow as soon as those languages are added.
   */
  path: string
  /** Where the tool starts; only for countries whose tool is built */
  start?: string
  status: 'live' | 'soon'
  sections?: ProductSection[]
}

export const PRODUCTS: Product[] = [
  {
    key: 'switzerland',
    path: '/switzerland',
    start: '/switzerland/calculator',
    status: 'live',
    sections: [
      { key: 'how', hash: '#how' },
      { key: 'guide', path: '/switzerland/guide' },
      { key: 'faq', hash: '#faq' },
    ],
  },
  { key: 'spain', path: '/spain', status: 'soon' },
  { key: 'germany', path: '/germany', status: 'soon' },
]

/**
 * The country a path belongs to, locale prefix and subpage included. These paths are the same
 * in every language (only the legal pages are translated, see `i18n.pages`), so the prefix can
 * be ignored.
 */
export function productForPath(path: string): Product | undefined {
  return PRODUCTS.find((p) => path === p.path || path.endsWith(p.path) || path.includes(`${p.path}/`))
}
