import type { Ref } from 'vue'

/**
 * The FAQ rich result for a page that shows one, in the language of that page.
 *
 * One node per question: passing a list from a single resolver collapses the whole FAQ into a
 * single Question. `nuxt-schema-org` puts them in the same graph as the site's identity, and
 * `nuxt-security` hashes the block into the content security policy at build time, so nothing
 * has to be opened up for it.
 */
export function useFaqSchema(items: Ref<{ q: string; a: string }[]>) {
  // Typing the page itself is what makes the questions its `mainEntity`. Without it they sit
  // in the graph unattached and a crawler has no reason to read them as this page's FAQ.
  useSchemaOrg([defineWebPage({ '@type': 'FAQPage' })])
  useSchemaOrg(
    computed(() => items.value.map((item) => defineQuestion({ name: item.q, acceptedAnswer: item.a }))),
  )
}
