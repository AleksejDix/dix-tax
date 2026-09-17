<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings, objects } = useList()

useHead({ title: () => t('zh.meta.guideTitle') })
useSocialImage('ch-zurich')

const steps = computed(() => objects('zh.guide.steps', ['title', 'body']))
const docs = computed(() => strings('zh.guide.docs'))

// German terms are fixed; only the explanation is translated.
const terms = [
  { key: 'liegenschaftenverzeichnis', de: 'Liegenschaftenverzeichnis' },
  { key: 'eigenmietwert', de: 'Eigenmietwert' },
  { key: 'steuerwert', de: 'Steuerwert' },
  { key: 'pauschalabzug', de: 'Pauschalabzug' },
  { key: 'satzbestimmend', de: 'satzbestimmend' },
  { key: 'steuerausscheidung', de: 'Steuerausscheidung' },
  { key: 'quellensteuer', de: 'Quellensteuer' },
  { key: 'schutzstatus', de: 'Schutzstatus S' },
  { key: 'gemeindesteueramt', de: 'Gemeindesteueramt' },
  { key: 'fristerstreckung', de: 'Fristerstreckung' },
  { key: 'bemerkungen', de: 'Bemerkungen' },
  { key: 'selbstanzeige', de: 'Straflose Selbstanzeige' },
]
</script>

<template>
  <div class="wrap page">
    <header class="page-head">
      <h1>{{ t('zh.guide.title') }}</h1>
      <p class="lead">{{ t('zh.guide.lead') }}</p>
    </header>

    <div class="layout">
      <div>
        <section aria-labelledby="steps-title">
          <h2 id="steps-title">{{ t('zh.guide.stepsTitle') }}</h2>
          <ol class="steps">
            <li v-for="(step, i) in steps" :key="i">
              <span class="n num" aria-hidden="true">{{ i + 1 }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.body }}</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="docs" aria-labelledby="docs-title">
          <h2 id="docs-title">{{ t('zh.guide.docsTitle') }}</h2>
          <ul>
            <li v-for="(d, i) in docs" :key="i">{{ d }}</li>
          </ul>
        </section>

        <NuxtLink :to="localePath('/ch/zurich/calculator')" class="btn btn-primary">{{ t('zh.guide.cta') }}</NuxtLink>
      </div>

      <aside class="glossary" aria-labelledby="glossary-title">
        <h2 id="glossary-title">{{ t('zh.guide.glossaryTitle') }}</h2>
        <dl>
          <div v-for="term in terms" :key="term.key">
            <dt lang="de">{{ term.de }}</dt>
            <dd>{{ t(`zh.guide.glossary.${term.key}`) }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(2.5rem, 1rem + 4vw, 5rem);
}

.page-head {
  max-width: 48rem;
  margin-bottom: clamp(2.5rem, 1.5rem + 3vw, 4.5rem);
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
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: clamp(2.5rem, 1rem + 5vw, 6rem);
  align-items: start;
}

h2 {
  font-size: var(--step-2);
  margin-bottom: 1.75rem;
}

.steps li {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  gap: 1.1rem;
  padding-block: 1.4rem;
  border-top: 1px solid var(--rule);
}

.n {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--field);
  border-bottom: 2px solid var(--field-strong);
  border-radius: 3px 3px 0 0;
  font-size: var(--step-1);
  font-weight: 700;
  color: var(--blue-deep);
}

.steps p {
  margin-top: 0.4rem;
  color: var(--ink-soft);
  max-width: 56ch;
}

.docs {
  margin-block: 3.5rem 2.5rem;
}

.docs ul {
  display: grid;
  gap: 0.75rem;
}

.docs li {
  position: relative;
  padding-left: 2rem;
  max-width: 60ch;
}

.docs li::before {
  content: '';
  position: absolute;
  left: 0.1rem;
  top: 0.3em;
  width: 1rem;
  height: 1rem;
  border: 1.5px solid var(--ink-soft);
  border-radius: 2px;
  background: var(--surface);
}

.glossary {
  position: sticky;
  top: 5.5rem;
  padding: clamp(1.25rem, 1rem + 1vw, 2rem);
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
}

.glossary h2 {
  font-size: var(--step-1);
  margin-bottom: 1rem;
}

.glossary dl {
  margin: 0;
}

.glossary dl > div {
  padding-block: 0.85rem;
  border-top: 1px dashed var(--rule);
}

.glossary dt {
  display: inline;
  font-weight: 600;
  background: linear-gradient(transparent 58%, var(--marker) 58%, var(--marker) 92%, transparent 92%);
  overflow-wrap: anywhere;
}

.glossary dd {
  margin: 0.3rem 0 0;
  font-size: var(--step--1);
  color: var(--ink-soft);
}

@media (max-width: 58rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .glossary {
    position: static;
  }
}
</style>
