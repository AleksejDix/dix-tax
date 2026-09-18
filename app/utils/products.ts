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

/** Where a country's own copy lives, and the social image drawn from it. */
export interface ProductContent {
  /** Locale file under i18n/locales/<lang>/ */
  file: 'ch-zurich' | 'modelo-210' | 'anlage-v'
  /** Keys inside that file */
  title: string
  description: string
  /** Base name under public/og/ */
  image: 'ch-zurich' | 'modelo-210' | 'anlage-v'
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
  /** Whether `products.<key>.note` exists and should be shown under the card */
  note?: boolean
  sections?: ProductSection[]
  content: ProductContent
}

export const PRODUCTS: Product[] = [
  {
    key: 'switzerland',
    path: '/switzerland',
    start: '/switzerland/calculator',
    status: 'live',
    note: true,
    content: {
      file: 'ch-zurich',
      title: 'zh.meta.title',
      description: 'zh.meta.description',
      image: 'ch-zurich',
    },
    sections: [
      { key: 'how', hash: '#how' },
      { key: 'guide', path: '/switzerland/guide' },
      { key: 'faq', hash: '#faq' },
    ],
  },
  {
    key: 'spain',
    path: '/spain',
    status: 'soon',
    content: {
      file: 'modelo-210',
      title: 'modelo210.metaTitle',
      description: 'modelo210.metaDescription',
      image: 'modelo-210',
    },
  },
  {
    key: 'germany',
    path: '/germany',
    status: 'soon',
    content: {
      file: 'anlage-v',
      title: 'anlageV.metaTitle',
      description: 'anlageV.metaDescription',
      image: 'anlage-v',
    },
  },
]

/**
 * The country a path belongs to, locale prefix and subpage included. These paths are the same
 * in every language (only the legal pages are translated, see `i18n.pages`), so the prefix can
 * be ignored.
 */
export function productForPath(path: string): Product | undefined {
  return PRODUCTS.find((p) => path === p.path || path.endsWith(p.path) || path.includes(`${p.path}/`))
}
