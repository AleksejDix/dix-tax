// Registry of forms Dix.Tax covers. Adding a product means: one entry here, one locale
// file per language (i18n/locales/<lang>/<id>.json), and its pages under `path`.
export interface Product {
  /** Key under `products.*` in common.json */
  key: 'chZurich' | 'modelo210' | 'anlageV'
  path: string
  /** Where the tool starts; only for live products */
  start?: string
  status: 'live' | 'soon'
}

export const PRODUCTS: Product[] = [
  { key: 'chZurich', path: '/ch/zurich', start: '/ch/zurich/calculator', status: 'live' },
  { key: 'modelo210', path: '/modelo-210', status: 'soon' },
  { key: 'anlageV', path: '/anlage-v', status: 'soon' },
]
