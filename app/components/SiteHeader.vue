<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

// Inside a product the menu belongs to that product; elsewhere it lists the forms.
const inZurich = computed(() => route.path.includes('/ch/zurich'))
const isCalculator = computed(() => route.path.endsWith('/calculator'))

const navLink = 'py-2 text-xs font-medium text-ink no-underline hover:text-blue'
</script>

<template>
  <header class="no-print sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur-md backdrop-saturate-150">
    <div class="wrap flex min-h-17 items-center gap-3 sm:gap-6 lg:gap-8">
      <NuxtLink
        :to="localePath('/')"
        :aria-label="t('nav.home')"
        class="mr-auto inline-flex items-center text-ink no-underline"
      >
        <BrandLogo />
      </NuxtLink>

      <nav v-if="inZurich" class="hidden gap-7 lg:flex" :aria-label="t('nav.menu')">
        <NuxtLink :to="{ path: localePath('/ch/zurich'), hash: '#how' }" :class="navLink">{{ t('nav.how') }}</NuxtLink>
        <NuxtLink :to="localePath('/ch/zurich/guide')" :class="navLink">{{ t('nav.guide') }}</NuxtLink>
        <NuxtLink :to="{ path: localePath('/ch/zurich'), hash: '#faq' }" :class="navLink">{{ t('nav.faq') }}</NuxtLink>
      </nav>
      <nav v-else class="hidden gap-7 lg:flex" :aria-label="t('nav.menu')">
        <NuxtLink v-for="p in PRODUCTS" :key="p.key" :to="localePath(p.path)" :class="navLink">
          {{ t(`products.${p.key}.name`) }}
        </NuxtLink>
      </nav>

      <ul class="flex overflow-hidden rounded-md border border-rule bg-surface" :aria-label="t('nav.language')">
        <li v-for="l in locales" :key="l.code">
          <NuxtLink
            :to="switchLocalePath(l.code)"
            :aria-current="l.code === locale ? 'true' : undefined"
            :lang="l.language"
            :title="l.name"
            class="block px-2.5 py-1.5 text-2xs font-semibold text-ink-soft no-underline hover:bg-field hover:text-ink aria-[current]:bg-ink aria-[current]:text-white focus-visible:-outline-offset-3"
          >
            {{ l.code === 'uk' ? 'UA' : l.code.toUpperCase() }}
            <span class="visually-hidden">{{ l.name }}</span>
          </NuxtLink>
        </li>
      </ul>

      <UiButton
        v-if="inZurich && !isCalculator"
        :to="localePath('/ch/zurich/calculator')"
        variant="primary"
        size="sm"
        class="hidden sm:inline-flex"
      >
        {{ t('nav.start') }}
      </UiButton>
    </div>
  </header>
</template>
