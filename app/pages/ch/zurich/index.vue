<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings, objects } = useList()
const { price } = useAppConfig()

const sample = [sampleResult()]
const sampleRemark = remarkDe(sample, 2025)

const facts = computed(() => objects('zh.facts.items', ['title', 'body']))
const steps = computed(() => objects('zh.steps.items', ['title', 'body']))
const reportItems = computed(() => strings('zh.report.items'))
const compareRows = computed(() => objects('zh.compare.rows', ['option', 'cost', 'effort', 'result']))
const fitYes = computed(() => strings('zh.fit.yes'))
const fitNo = computed(() => strings('zh.fit.no'))
const founder = computed(() => strings('founder.body'))
const faq = computed(() => objects('zh.faq.items', ['q', 'a']))

useHead({ title: () => t('zh.meta.title'), titleTemplate: '%s' })
useSeoMeta({
  description: () => t('zh.meta.description'),
  ogTitle: () => t('zh.meta.title'),
  ogDescription: () => t('zh.meta.description'),
})

// FAQ rich result, in the language of the page.
useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.value.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
  ],
}))
</script>

<template>
  <div>
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <h1>{{ t('zh.hero.title') }}</h1>
          <p class="lead">{{ t('zh.hero.lead') }}</p>
          <div class="hero-actions">
            <NuxtLink :to="localePath('/ch/zurich/calculator')" class="btn btn-primary">{{ t('zh.hero.cta') }}</NuxtLink>
            <NuxtLink :to="{ path: localePath('/ch/zurich'), hash: '#how' }" class="btn btn-quiet">
              {{ t('zh.hero.secondary') }}
            </NuxtLink>
          </div>
          <p class="hero-note">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.5 7V5a3.5 3.5 0 017 0v2" fill="none" stroke="currentColor" stroke-width="1.5" />
              <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
            </svg>
            {{ t('zh.hero.note', { price }) }}
          </p>
        </div>

        <figure class="hero-sheet">
          <FormSheet :results="sample" :year="2025" notes animate />
          <figcaption>{{ t('zh.sheet.caption') }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="section facts" aria-labelledby="facts-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="facts-title">{{ t('zh.facts.title') }}</h2>
        </div>
        <ul class="facts-row">
          <li v-for="(fact, i) in facts" :key="i" :class="{ good: i === 1 }">
            <h3>{{ fact.title }}</h3>
            <p>{{ fact.body }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section id="how" class="section how" aria-labelledby="how-title">
      <div class="wrap how-grid">
        <div class="how-head">
          <h2 id="how-title">{{ t('zh.steps.title') }}</h2>
          <NuxtLink :to="localePath('/ch/zurich/calculator')" class="btn btn-primary">{{ t('zh.hero.cta') }}</NuxtLink>
        </div>
        <ol class="steps">
          <li v-for="(step, i) in steps" :key="i">
            <span class="step-n num" aria-hidden="true">{{ i + 1 }}</span>
            <div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.body }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="report-title">
      <div class="wrap report-grid">
        <div>
          <div class="section-head">
            <h2 id="report-title">{{ t('zh.report.title') }}</h2>
            <p>{{ t('zh.report.lead') }}</p>
          </div>
          <ul class="checks">
            <li v-for="(item, i) in reportItems" :key="i">{{ item }}</li>
          </ul>
        </div>
        <figure class="note-preview">
          <figcaption>{{ t('zh.calc.result.remarkTitle') }}</figcaption>
          <p lang="de">{{ sampleRemark }}</p>
        </figure>
      </div>
    </section>

    <section class="section compare" aria-labelledby="compare-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="compare-title">{{ t('zh.compare.title') }}</h2>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{{ t('zh.compare.colOption') }}</th>
                <th scope="col">{{ t('zh.compare.colCost') }}</th>
                <th scope="col">{{ t('zh.compare.colEffort') }}</th>
                <th scope="col">{{ t('zh.compare.colResult') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in compareRows" :key="i" :class="{ ours: i === compareRows.length - 1 }">
                <th scope="row">{{ row.option }}</th>
                <td :data-label="t('zh.compare.colCost')">{{ row.cost }}</td>
                <td :data-label="t('zh.compare.colEffort')">{{ row.effort }}</td>
                <td :data-label="t('zh.compare.colResult')">{{ row.result }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="fit-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="fit-title">{{ t('zh.fit.title') }}</h2>
        </div>
        <div class="fit-grid">
          <div class="fit fit--yes">
            <h3>{{ t('zh.fit.yesTitle') }}</h3>
            <ul>
              <li v-for="(item, i) in fitYes" :key="i">{{ item }}</li>
            </ul>
          </div>
          <div class="fit fit--no">
            <h3>{{ t('zh.fit.noTitle') }}</h3>
            <ul>
              <li v-for="(item, i) in fitNo" :key="i">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section founder" aria-labelledby="founder-title">
      <div class="wrap founder-grid">
        <h2 id="founder-title">{{ t('founder.title') }}</h2>
        <div class="founder-body">
          <p v-for="(p, i) in founder" :key="i">{{ p }}</p>
          <p class="signature">
            <span class="signature-name" lang="de">Aleksej Dix</span>
            <span>{{ t('founder.role') }}</span>
          </p>
        </div>
      </div>
    </section>

    <section id="faq" class="section" aria-labelledby="faq-title">
      <div class="wrap faq-grid">
        <h2 id="faq-title">{{ t('zh.faq.title') }}</h2>
        <div class="faq-list">
          <details v-for="(item, i) in faq" :key="i" :open="i === 0">
            <summary>
              <h3>{{ item.q }}</h3>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </summary>
            <p>{{ item.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <section class="closing" aria-labelledby="closing-title">
      <div class="wrap closing-inner">
        <div>
          <h2 id="closing-title">{{ t('zh.cta.title') }}</h2>
          <p>{{ t('zh.cta.body') }}</p>
        </div>
        <NuxtLink :to="localePath('/ch/zurich/calculator')" class="btn btn-light">{{ t('zh.cta.button') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  padding-block: clamp(2.5rem, 1rem + 5vw, 5.5rem) clamp(3rem, 2rem + 4vw, 6rem);
  background:
    linear-gradient(var(--field), var(--field)) right top / 38% 100% no-repeat,
    var(--paper);
  border-bottom: 1px solid var(--rule);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: clamp(2rem, 1rem + 4vw, 5rem);
  align-items: center;
}

.hero-copy .lead {
  margin-top: 1.5rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.25rem;
}

.hero-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
}

.hero-note svg {
  width: 1rem;
  height: 1rem;
  color: var(--ok);
  flex: none;
}

.hero-sheet {
  margin: 0;
}

.hero-sheet figcaption {
  margin-top: 0.9rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
  text-align: center;
}

/* Facts */
.facts-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.5rem, 1rem + 2vw, 3rem);
}

.facts-row li {
  padding-top: 1.25rem;
  border-top: 3px solid var(--ink);
}

.facts-row li.good {
  border-top-color: var(--ok);
}

.facts-row li.good h3 {
  color: var(--ok);
}

.facts-row h3 {
  font-size: var(--step-2);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.facts-row p {
  margin-top: 0.75rem;
  color: var(--ink-soft);
}

/* Steps */
.how {
  background: var(--surface);
  border-block: 1px solid var(--rule);
}

.how-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: clamp(2rem, 1rem + 4vw, 5rem);
  align-items: start;
}

.how-head {
  position: sticky;
  top: 6.5rem;
  display: grid;
  gap: 2rem;
  justify-items: start;
}

.steps li {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  gap: 1.25rem;
  padding-block: 1.75rem;
  border-top: 1px solid var(--rule);
}

.steps li:first-child {
  padding-top: 0;
  border-top: 0;
}

.step-n {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  background: var(--field);
  border-bottom: 2px solid var(--field-strong);
  border-radius: 3px 3px 0 0;
  font-size: var(--step-2);
  font-weight: 700;
  color: var(--blue-deep);
}

.steps p {
  margin-top: 0.5rem;
  color: var(--ink-soft);
  max-width: 52ch;
}

/* Report */
.report-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: clamp(2rem, 1rem + 4vw, 5rem);
  align-items: center;
}

.report-grid .section-head {
  margin-bottom: 2rem;
}

.checks {
  display: grid;
  gap: 0.9rem;
  max-width: 54ch;
}

.checks li,
.fit li {
  position: relative;
  padding-left: 2rem;
}

.checks li::before,
.fit--yes li::before {
  content: '';
  position: absolute;
  left: 0.15rem;
  top: 0.4em;
  width: 0.95rem;
  height: 0.5rem;
  border-left: 2.5px solid var(--ok);
  border-bottom: 2.5px solid var(--ok);
  transform: rotate(-45deg);
}

.note-preview {
  margin: 0;
  padding: 1.5rem 1.6rem 1.7rem;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--blue-deep);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sheet);
}

.note-preview figcaption {
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--blue-deep);
  margin-bottom: 0.75rem;
}

.note-preview p {
  white-space: pre-line;
  font-size: 0.9375rem;
  line-height: 1.55;
  hyphens: auto;
}

/* Compare */
.compare {
  background: var(--field);
}

.table-scroll {
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 1.1rem 1.25rem;
  vertical-align: top;
  border-top: 1px solid var(--rule);
}

thead th {
  border-top: 0;
  font-size: var(--step--1);
  font-weight: 500;
  color: var(--ink-soft);
}

tbody th {
  font-weight: 600;
  width: 22%;
}

tr.ours {
  background: linear-gradient(90deg, color-mix(in srgb, var(--marker) 55%, white), color-mix(in srgb, var(--marker) 22%, white));
}

tr.ours th,
tr.ours td {
  font-weight: 600;
  border-top-color: transparent;
}

/* Fit */
.fit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.5rem, 1rem + 2vw, 3rem);
}

.fit {
  padding: clamp(1.5rem, 1rem + 1.5vw, 2.25rem);
  border-radius: var(--radius-lg);
  border: 1px solid var(--rule);
  background: var(--surface);
}

.fit--no {
  background: transparent;
  border-style: dashed;
}

.fit h3 {
  margin-bottom: 1.25rem;
}

.fit ul {
  display: grid;
  gap: 0.8rem;
}

.fit--no li::before {
  content: '';
  position: absolute;
  left: 0.2rem;
  top: 0.72em;
  width: 0.85rem;
  height: 2.5px;
  background: var(--warn);
}

/* Founder */
.founder {
  background: var(--surface);
  border-block: 1px solid var(--rule);
}

.founder-grid,
.faq-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: clamp(1.5rem, 1rem + 4vw, 5rem);
  align-items: start;
}

.founder-body {
  display: grid;
  gap: 1.25rem;
  font-size: var(--step-1);
  line-height: 1.5;
  max-width: 40rem;
}

.signature {
  display: grid;
  margin-top: 0.5rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
}

.signature-name {
  font-family: var(--font-hand);
  font-size: 2.4rem;
  font-weight: 600;
  line-height: 1;
  color: var(--blue-deep);
  transform: rotate(-2deg);
  transform-origin: left bottom;
  margin-bottom: 0.35rem;
}

/* FAQ */
.faq-grid h2 {
  position: sticky;
  top: 6.5rem;
}

.faq-list {
  border-bottom: 1px solid var(--rule);
}

details {
  border-top: 1px solid var(--rule);
}

summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.35rem 0;
  cursor: pointer;
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}

summary h3 {
  font-size: var(--step-1);
  font-weight: 600;
}

summary:hover h3 {
  color: var(--blue-deep);
}

summary svg {
  flex: none;
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.35rem;
  color: var(--blue);
  transition: transform 0.2s ease;
}

details[open] summary svg {
  transform: rotate(180deg);
}

details p {
  padding-bottom: 1.6rem;
  max-width: var(--measure);
  color: var(--ink-soft);
}

/* Closing */
.closing {
  background: var(--blue-deep);
  color: #fff;
  margin-bottom: calc(var(--space-section) * -1);
}

.closing-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem 3rem;
  flex-wrap: wrap;
  padding-block: clamp(3rem, 2rem + 4vw, 5rem);
}

.closing h2 {
  max-width: 22ch;
}

.closing p {
  margin-top: 0.9rem;
  color: #c9d8f5;
  font-size: var(--step-1);
}

.btn-light {
  background: var(--marker);
  color: var(--ink);
}

.btn-light:hover {
  background: #fff;
  color: var(--ink);
}

@media (max-width: 60rem) {
  .hero {
    background: var(--paper);
  }

  .hero-grid,
  .how-grid,
  .report-grid,
  .founder-grid,
  .faq-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .how-head,
  .faq-grid h2 {
    position: static;
  }

  .facts-row,
  .fit-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-sheet {
    max-width: 34rem;
  }
}

@media (max-width: 44rem) {
  thead {
    display: none;
  }

  tr,
  th,
  td {
    display: block;
    width: auto;
  }

  tbody th {
    width: auto;
    padding-bottom: 0.25rem;
    font-size: var(--step-1);
  }

  tbody tr:first-child th {
    border-top: 0;
  }

  td {
    border-top: 0;
    padding-block: 0.35rem;
  }

  td:last-child {
    padding-bottom: 1.25rem;
  }

  td::before {
    content: attr(data-label);
    display: block;
    font-size: 0.8125rem;
    font-weight: 400;
    color: var(--ink-soft);
  }

  .steps li {
    grid-template-columns: 2.75rem minmax(0, 1fr);
    gap: 1rem;
  }

  .step-n {
    width: 2.75rem;
    height: 2.75rem;
    font-size: var(--step-1);
  }
}
</style>
