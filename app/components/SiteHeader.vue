<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

// Inside a product the menu belongs to that product; elsewhere it lists the forms.
const inZurich = computed(() => route.path.includes('/ch/zurich'))
const isCalculator = computed(() => route.path.endsWith('/calculator'))
</script>

<template>
  <header class="header no-print">
    <div class="wrap bar">
      <NuxtLink :to="localePath('/')" class="brand" :aria-label="t('nav.home')">
        <BrandLogo />
      </NuxtLink>

      <nav v-if="inZurich" class="nav" :aria-label="t('nav.menu')">
        <NuxtLink :to="{ path: localePath('/ch/zurich'), hash: '#how' }">{{ t('nav.how') }}</NuxtLink>
        <NuxtLink :to="localePath('/ch/zurich/guide')">{{ t('nav.guide') }}</NuxtLink>
        <NuxtLink :to="{ path: localePath('/ch/zurich'), hash: '#faq' }">{{ t('nav.faq') }}</NuxtLink>
      </nav>
      <nav v-else class="nav" :aria-label="t('nav.menu')">
        <NuxtLink v-for="p in PRODUCTS" :key="p.key" :to="localePath(p.path)">
          {{ t(`products.${p.key}.name`) }}
        </NuxtLink>
      </nav>

      <ul class="langs" :aria-label="t('nav.language')">
        <li v-for="l in locales" :key="l.code">
          <NuxtLink
            :to="switchLocalePath(l.code)"
            :aria-current="l.code === locale ? 'true' : undefined"
            :lang="l.language"
            :title="l.name"
          >
            {{ l.code === 'uk' ? 'UA' : l.code.toUpperCase() }}
            <span class="visually-hidden">{{ l.name }}</span>
          </NuxtLink>
        </li>
      </ul>

      <NuxtLink
        v-if="inZurich && !isCalculator"
        :to="localePath('/ch/zurich/calculator')"
        class="btn btn-primary btn-small cta"
      >
        {{ t('nav.start') }}
      </NuxtLink>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--rule);
}

.bar {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 2rem);
  min-height: 4.25rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 700;
  font-size: var(--step-1);
  letter-spacing: -0.03em;
  color: var(--ink);
  text-decoration: none;
  margin-right: auto;
}

.nav {
  display: flex;
  gap: 1.75rem;
}

.nav a {
  color: var(--ink);
  text-decoration: none;
  font-size: var(--step--1);
  font-weight: 500;
  padding-block: 0.5rem;
}

.nav a:hover {
  color: var(--blue);
}

.langs {
  display: flex;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}

.langs a {
  display: block;
  padding: 0.35rem 0.6rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--ink-soft);
}

.langs a:hover {
  background: var(--field);
  color: var(--ink);
}

.langs a[aria-current] {
  background: var(--ink);
  color: #fff;
}

.langs a:focus-visible {
  outline-offset: -3px;
}

@media (max-width: 56rem) {
  .nav {
    display: none;
  }
}

@media (max-width: 38rem) {
  .cta {
    display: none;
  }

  .brand :deep(.logo) {
    font-size: 1.125rem;
  }
}
</style>
