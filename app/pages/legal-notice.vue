<script setup lang="ts">
const { t, locale } = useI18n()
const { company, contactEmail } = useAppConfig()

const blocks = ['advice', 'liability', 'links', 'copyright'] as const
const cityLine = computed(() => [company.postalCode, company.city].filter(Boolean).join(' '))
const country = computed(() => countryName(company.countryCode, locale.value))
const complete = computed(() => Boolean(company.street && company.postalCode))

useHead({ title: () => t('legal.metaTitle') })
// An unfinished legal notice should not be what search engines show for the site.
useSeoMeta({ robots: () => (complete.value ? 'index, follow' : 'noindex') })
</script>

<template>
  <div class="wrap max-w-[54rem] pt-10 sm:pt-16">
    <h1 class="mb-10 text-3xl">{{ t('legal.title') }}</h1>

    <UiCard class="grid gap-x-12 gap-y-8 sm:grid-cols-2">
      <section>
        <h2 class="mb-3 text-lg">{{ t('legal.operatorTitle') }}</h2>
        <address class="grid gap-0.5 not-italic">
          <strong>{{ company.name }}</strong>
          <span v-if="company.legalForm">{{ company.legalForm }}</span>
          <span v-if="company.street">{{ company.street }}</span>
          <span v-if="cityLine">{{ cityLine }}</span>
          <span>{{ country }}</span>
        </address>
        <p v-if="company.uid" class="mt-3 text-xs text-ink-soft">{{ t('legal.uidLabel') }}: {{ company.uid }}</p>
      </section>

      <section>
        <h2 class="mb-3 text-lg">{{ t('legal.contactTitle') }}</h2>
        <p>
          {{ t('legal.emailLabel') }}:
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        </p>
        <h2 class="mt-7 mb-3 text-lg">{{ t('legal.responsibleTitle') }}</h2>
        <p>{{ company.name }}</p>
      </section>
    </UiCard>

    <section v-for="(b, i) in blocks" :key="b" class="border-b border-rule py-7" :class="{ 'mt-4': i === 0 }">
      <h2 class="mb-3 text-lg">{{ t(`legal.${b}Title`) }}</h2>
      <p class="max-w-(--spacing-measure) text-ink-soft">{{ t(`legal.${b}`) }}</p>
    </section>
  </div>
</template>
