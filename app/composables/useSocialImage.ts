/**
 * Points a page's link preview at its own picture, in the reader's language.
 *
 * Shared links are how these communities find each other, so a link pasted into a chat
 * or a group has to show the form it is about rather than a blank rectangle. The images
 * are plain files under `public/og`, rebuilt from the locale files by `pnpm og`.
 */
import type { Product } from '~/utils/products'
import type { Guide } from '~/utils/guides'

/** Every picture `pnpm og` draws: the home page, one per country, one per guide. */
export type SocialImage = 'home' | Product['content']['image'] | Guide['image']

export function useSocialImage(name: SocialImage) {
  const { locale, localeProperties } = useI18n()
  const site = useSiteConfig()
  const route = useRoute()

  const absolute = (path: string) => `${site.url?.replace(/\/$/, '') ?? ''}${path}`

  useSeoMeta({
    ogImage: () => absolute(`/og/${name}-${locale.value}.png`),
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/png',
    ogUrl: () => absolute(route.path),
    // og:locale wants language_TERRITORY; a bare language is accepted where we have no region.
    ogLocale: () => (localeProperties.value.language || 'en').replace('-', '_'),
    ogSiteName: 'dix.tax',
    twitterCard: 'summary_large_image',
    twitterImage: () => absolute(`/og/${name}-${locale.value}.png`),
  })
}
