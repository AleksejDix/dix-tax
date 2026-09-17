<script setup lang="ts">
// Page for a form that is announced but not built yet: says plainly what the form is,
// who files it and when, and that the guided tool is still in preparation.
const props = defineProps<{ ns: 'modelo210' | 'anlageV' }>()

const { t } = useI18n()
const localePath = useLocalePath()
const { objects } = useList()
const facts = computed(() => objects(`${props.ns}.facts`, ['label', 'value']))

useHead({ title: () => t(`${props.ns}.metaTitle`) })
useSeoMeta({
  description: () => t(`${props.ns}.metaDescription`),
  ogTitle: () => t(`${props.ns}.metaTitle`),
  ogDescription: () => t(`${props.ns}.metaDescription`),
})
</script>

<template>
  <div class="wrap page">
    <header class="page-head">
      <p class="status">{{ t('soon.status') }}</p>
      <h1>{{ t(`${ns}.title`) }}</h1>
      <p class="lead">{{ t(`${ns}.lead`) }}</p>
    </header>

    <div class="layout">
      <section aria-labelledby="facts-title">
        <h2 id="facts-title">{{ t('soon.factsTitle') }}</h2>
        <dl class="facts">
          <div v-for="(f, i) in facts" :key="i">
            <dt>{{ f.label }}</dt>
            <dd>{{ f.value }}</dd>
          </div>
        </dl>
      </section>

      <aside class="side">
        <div class="box">
          <h2>{{ t('soon.notifyTitle') }}</h2>
          <p>{{ t('soon.notifyBody') }}</p>
          <InterestForm :product="ns" />
        </div>
        <div class="box box--quiet">
          <h2>{{ t('soon.swissTitle') }}</h2>
          <p>{{ t('soon.swissBody') }}</p>
          <NuxtLink :to="localePath('/ch/zurich')">{{ t('soon.swissCta') }}</NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(2.5rem, 1rem + 4vw, 5rem);
}

.page-head {
  max-width: 50rem;
  margin-bottom: clamp(2.5rem, 1.5rem + 3vw, 4.5rem);
}

.status {
  display: inline-block;
  margin-bottom: 1.25rem;
  padding: 0.2rem 0.7rem;
  border-radius: 99px;
  background: var(--field);
  color: var(--ink-soft);
  font-size: 0.8125rem;
  font-weight: 600;
}

.page-head h1 {
  font-size: var(--step-3);
  letter-spacing: -0.02em;
}

.page-head .lead {
  margin-top: 1rem;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: clamp(2.5rem, 1rem + 5vw, 6rem);
  align-items: start;
}

h2 {
  font-size: var(--step-1);
}

.facts {
  margin: 1.5rem 0 0;
}

.facts > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 0.5rem 2rem;
  padding-block: 1.25rem;
  border-top: 1px solid var(--rule);
}

.facts dt {
  font-weight: 600;
}

.facts dd {
  margin: 0;
  color: var(--ink-soft);
  max-width: 52ch;
}

.side {
  display: grid;
  gap: 1.25rem;
}

.box {
  display: grid;
  gap: 0.9rem;
  justify-items: start;
  padding: clamp(1.25rem, 1rem + 1vw, 2rem);
  border: 1px solid var(--blue-deep);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.box--quiet {
  border-color: var(--rule);
  border-style: dashed;
  background: transparent;
}

.box p {
  color: var(--ink-soft);
  font-size: var(--step--1);
}

@media (max-width: 58rem) {
  .layout,
  .facts > div {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
