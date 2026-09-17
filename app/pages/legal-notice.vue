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
  <div class="wrap page">
    <h1>{{ t('legal.title') }}</h1>

    <div class="cols">
      <section>
        <h2>{{ t('legal.operatorTitle') }}</h2>
        <address>
          <strong>{{ company.name }}</strong>
          <span v-if="company.legalForm">{{ company.legalForm }}</span>
          <span v-if="company.street">{{ company.street }}</span>
          <span v-if="cityLine">{{ cityLine }}</span>
          <span>{{ country }}</span>
        </address>
        <p v-if="company.uid" class="meta">{{ t('legal.uidLabel') }}: {{ company.uid }}</p>
      </section>

      <section>
        <h2>{{ t('legal.contactTitle') }}</h2>
        <p>
          {{ t('legal.emailLabel') }}:
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        </p>
        <h2 class="second">{{ t('legal.responsibleTitle') }}</h2>
        <p>{{ company.name }}</p>
      </section>
    </div>

    <section v-for="b in blocks" :key="b" class="block">
      <h2>{{ t(`legal.${b}Title`) }}</h2>
      <p>{{ t(`legal.${b}`) }}</p>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(2.5rem, 1rem + 4vw, 5rem);
  max-width: 54rem;
}

h1 {
  font-size: var(--step-3);
  letter-spacing: -0.02em;
  margin-bottom: 2.5rem;
}

h2 {
  font-size: var(--step-1);
  margin-bottom: 0.75rem;
}

h2.second {
  margin-top: 1.75rem;
}

.cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem 3rem;
  padding: clamp(1.25rem, 1rem + 1vw, 2rem);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

address {
  display: grid;
  gap: 0.15rem;
  font-style: normal;
}

.meta {
  margin-top: 0.75rem;
  color: var(--ink-soft);
  font-size: var(--step--1);
}

.block {
  padding-block: 1.75rem;
  border-bottom: 1px solid var(--rule);
}

.block:first-of-type {
  margin-top: 1rem;
}

.block p {
  color: var(--ink-soft);
  max-width: var(--measure);
}

@media (max-width: 40rem) {
  .cols {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
