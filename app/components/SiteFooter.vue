<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { company, contactEmail } = useAppConfig()

const year = new Date().getFullYear()

const footerLink = 'text-[#c9d3ea] no-underline hover:text-white hover:underline'
const columnTitle = 'mb-3.5 text-xs font-semibold tracking-normal text-white'
</script>

<template>
  <footer class="no-print mt-(--spacing-section) bg-ink pt-10 pb-6 text-xs text-[#c9d3ea] sm:pt-14">
    <div class="wrap">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div class="sm:col-span-2 lg:col-span-1">
          <BrandLogo class="text-white [--logo-accent:var(--color-marker)]" />
          <p class="mt-4 max-w-[30ch]">{{ t('footer.tagline') }}</p>
        </div>

        <nav :aria-label="t('footer.formsTitle')">
          <h2 :class="columnTitle">{{ t('footer.formsTitle') }}</h2>
          <ul class="grid gap-2.5">
            <li v-for="p in PRODUCTS" :key="p.key">
              <NuxtLink :to="localePath(p.path)" :class="footerLink">{{ t(`products.${p.key}.name`) }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <nav :aria-label="t('footer.companyTitle')">
          <h2 :class="columnTitle">{{ t('footer.companyTitle') }}</h2>
          <ul class="grid gap-2.5">
            <li>
              <NuxtLink :to="localePath('legal-notice')" :class="footerLink">{{ t('footer.legalNotice') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('privacy')" :class="footerLink">{{ t('footer.privacy') }}</NuxtLink>
            </li>
            <li>
              <a :href="`mailto:${contactEmail}`" :class="footerLink">{{ contactEmail }}</a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="mt-10 grid max-w-[78ch] gap-2.5 border-t border-white/15 pt-6 text-2xs text-[#9fabc8] sm:mt-14">
        <p>{{ t('footer.disclaimer') }}</p>
        <p>{{ t('footer.sources') }}</p>
      </div>

      <div class="mt-7 flex flex-wrap justify-between gap-x-8 gap-y-2 text-2xs text-[#9fabc8]">
        <p>{{ t('footer.copyright', { year, name: company.name }) }}</p>
        <p>{{ t('footer.made') }}</p>
      </div>
    </div>
  </footer>
</template>
