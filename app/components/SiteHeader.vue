<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { cta } = useProductNav()

// The header never swaps out. Search drops readers straight into a country page, and from
// there the other countries have to stay one click away. What belongs to a single country is
// in `SiteProductBar`, on its own row.
// `router-link-active` also covers the pages under a country, so the country a reader is
// inside stays marked while they are on its guide or its calculator.
const navLink =
  'py-2 text-xs font-medium text-ink no-underline hover:text-blue [&.router-link-active]:text-blue-deep'
const menuLink =
  'flex items-center justify-between gap-3 rounded-sm px-2 py-2.5 text-base font-medium text-ink no-underline hover:bg-field'

// Ukrainian is `uk`, which reads as the United Kingdom on a flag-free switcher.
const short = (code: string) => (code === 'uk' ? 'UA' : code.toUpperCase())
</script>

<template>
  <header class="no-print sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur-md backdrop-saturate-150">
    <div class="wrap flex min-h-17 items-center gap-2.5 sm:gap-5 lg:gap-8">
      <NuxtLink
        :to="localePath('/')"
        :aria-label="t('nav.home')"
        class="mr-auto inline-flex items-center text-ink no-underline"
      >
        <BrandLogo />
      </NuxtLink>

      <nav class="hidden gap-7 lg:flex" :aria-label="t('nav.menu')">
        <NuxtLink v-for="p in PRODUCTS" :key="p.key" :to="localePath(p.path)" :class="navLink">
          {{ t(`products.${p.key}.country`) }}
        </NuxtLink>
      </nav>

      <UiDisclosure
        summary-class="rounded-md border border-rule bg-surface px-2.5 py-1.5 text-2xs font-semibold text-ink-soft hover:text-ink"
      >
        <template #summary>
          <span class="visually-hidden">{{ t('nav.language') }}</span>
          <span aria-hidden="true">{{ short(locale) }}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </template>
        <ul>
          <li v-for="l in locales" :key="l.code">
            <NuxtLink
              :to="switchLocalePath(l.code)"
              :lang="l.language"
              :aria-current="l.code === locale ? 'page' : undefined"
              class="block rounded-sm px-2.5 py-2 text-xs whitespace-nowrap text-ink-soft no-underline hover:bg-field hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
            >
              {{ l.name }}
            </NuxtLink>
          </li>
        </ul>
      </UiDisclosure>

      <UiButton v-if="cta" :to="cta.to" variant="primary" size="sm">
        <span class="sm:hidden">{{ cta.short }}</span>
        <span class="hidden sm:inline">{{ cta.label }}</span>
      </UiButton>

      <UiDisclosure
        panel="sheet"
        class="lg:hidden"
        summary-class="rounded-md border border-rule bg-surface p-2 text-ink-soft hover:text-ink"
      >
        <template #summary>
          <span class="visually-hidden">{{ t('nav.menu') }}</span>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
          </svg>
        </template>
        <ul class="grid gap-0.5">
            <li v-for="p in PRODUCTS" :key="p.key">
              <NuxtLink :to="localePath(p.path)" :class="menuLink">
                {{ t(`products.${p.key}.country`) }}
                <span v-if="p.status === 'soon'" class="text-2xs font-normal text-ink-soft">
                  {{ t('products.statusSoon') }}
                </span>
              </NuxtLink>
            </li>
        </ul>
      </UiDisclosure>
    </div>
  </header>
</template>
