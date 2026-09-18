import type { Product } from '~/utils/products'

export interface Crumb {
  label: string
  /** The last crumb is the current page and has no link. */
  to?: string
}

/**
 * Where the reader is and where they can go from here. The header uses it for the call to
 * action, `SiteProductBar` for the breadcrumb and the links inside the product.
 */
export function useProductNav() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()

  const product = computed<Product | undefined>(() => productForPath(route.path))

  const name = (p: Product) => t(`products.${p.key}.name`)

  // The tool pages have no section entry of their own, so they are named here.
  const leaf = computed(() => {
    const p = product.value
    if (!p) return undefined
    if (route.path.endsWith('/calculator')) return t('nav.calculator')
    const section = p.sections?.find((s) => s.path && route.path.endsWith(s.path))
    return section ? t(`nav.${section.key}`) : undefined
  })

  // Route names carry the locale as a suffix (`privacy___de`).
  const page = computed(() => String(route.name ?? '').split('___')[0])

  const OUTSIDE: Record<string, string> = {
    'legal-notice': 'footer.legalNotice',
    privacy: 'footer.privacy',
  }

  const trail = computed<Crumb[]>(() => {
    const home: Crumb = { label: t('nav.forms'), to: localePath('/') }
    const p = product.value

    if (p) {
      const crumbs: Crumb[] = [home]
      crumbs.push(leaf.value ? { label: name(p), to: localePath(p.path) } : { label: name(p) })
      if (leaf.value) crumbs.push({ label: leaf.value })
      return crumbs
    }

    const outside = OUTSIDE[page.value]
    if (outside) return [home, { label: t(outside) }]

    // The hub is the top of the tree, so there it is the only crumb there is.
    return [{ label: t('nav.forms') }]
  })

  // Anchors travel through the router like everything else, but they cannot be plain
  // `NuxtLink`s: it decides what is current from the path alone, so every anchor on the page
  // would be marked as the current one at once. `SiteProductBar` renders them with `custom`.
  const sections = computed(() => {
    const p = product.value
    if (!p?.sections) return []
    return p.sections.map((s) => ({
      key: s.key,
      label: t(`nav.${s.key}`),
      anchor: s.hash ? { path: localePath(p.path), hash: s.hash } : undefined,
      to: s.path ? localePath(s.path) : undefined,
    }))
  })

  /**
   * The one step forward, and the header's only action.
   *
   * It is deliberately not conditional. A header that gains and loses a button as the reader
   * moves between the hub and a country page re-lays itself out on every navigation, which is
   * the kind of change that makes a site feel unsteady. So the action is always there, always
   * in the same place: the tool of the country the reader is in when that country has one, and
   * otherwise the tool that is ready. It scales by itself as more countries go live.
   */
  const cta = computed(() => {
    const here = product.value
    const live = here?.start ? here : PRODUCTS.find((p) => p.start)
    if (!live?.start) return undefined
    return { to: localePath(live.start), label: t('nav.start'), short: t('nav.startShort') }
  })

  return { product, trail, sections, cta }
}
