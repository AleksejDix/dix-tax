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

  const trail = computed<Crumb[]>(() => {
    const p = product.value
    if (!p) return []
    const crumbs: Crumb[] = [{ label: t('nav.forms'), to: localePath('/') }]
    crumbs.push(leaf.value ? { label: name(p), to: localePath(p.path) } : { label: name(p) })
    if (leaf.value) crumbs.push({ label: leaf.value })
    return crumbs
  })

  // An anchor is a plain href: `NuxtLink` decides what is current from the path alone, so
  // every anchor on the page would be marked as the current one at the same time.
  const sections = computed(() => {
    const p = product.value
    if (!p?.sections) return []
    return p.sections.map((s) => ({
      key: s.key,
      label: t(`nav.${s.key}`),
      href: s.hash ? `${localePath(p.path)}${s.hash}` : undefined,
      to: s.path ? localePath(s.path) : undefined,
    }))
  })

  // One step forward, and never on the page it leads to.
  const cta = computed(() => {
    const p = product.value
    if (!p?.start || route.path.endsWith('/calculator')) return undefined
    return { to: localePath(p.start), label: t('nav.start'), short: t('nav.startShort') }
  })

  return { product, trail, sections, cta }
}
