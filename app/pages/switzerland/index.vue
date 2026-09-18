<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings, objects } = useList()
const { price } = useAppConfig()

const sample = [sampleResult()]
const sampleRemark = remarkDe(summarise(sample, newHousehold()), 2025)

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
useSocialImage('ch-zurich')

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
    <section
      class="border-b border-rule bg-paper py-10 sm:py-14 lg:bg-[linear-gradient(var(--color-field),var(--color-field))] lg:bg-[length:38%_100%] lg:bg-right-top lg:bg-no-repeat"
    >
      <div class="wrap grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h1>{{ t('zh.hero.title') }}</h1>
          <p class="lead mt-6">{{ t('zh.hero.lead', { price }) }}</p>
          <div class="mt-9 flex flex-wrap gap-3">
            <UiButton :to="localePath('/switzerland/calculator')" variant="primary">{{ t('zh.hero.cta') }}</UiButton>
            <UiButton :to="{ path: localePath('/switzerland'), hash: '#how' }">{{ t('zh.hero.secondary') }}</UiButton>
          </div>
          <p class="mt-5 flex items-center gap-2 text-xs text-ink-soft">
            <svg viewBox="0 0 16 16" aria-hidden="true" class="size-4 flex-none text-ok">
              <path d="M4.5 7V5a3.5 3.5 0 017 0v2" fill="none" stroke="currentColor" stroke-width="1.5" />
              <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
            </svg>
            {{ t('zh.hero.note', { price }) }}
          </p>
          <DeadlineNote product="chZurich" class="mt-2" />
        </div>

        <figure class="m-0 max-w-[34rem] lg:max-w-none">
          <FormSheet :results="sample" :year="2025" notes animate />
          <figcaption class="mt-3.5 text-center text-xs text-ink-soft">{{ t('zh.sheet.caption') }}</figcaption>
        </figure>
      </div>
    </section>

    <UiSection :title="t('zh.facts.title')" title-id="facts-title">
      <ul class="grid gap-6 lg:grid-cols-3 lg:gap-12">
        <li
          v-for="(fact, i) in facts"
          :key="i"
          class="border-t-[3px] pt-5"
          :class="i === 1 ? 'border-ok' : 'border-ink'"
        >
          <h3 class="text-2xl" :class="{ 'text-ok': i === 1 }">{{ fact.title }}</h3>
          <p class="mt-3 text-ink-soft">{{ fact.body }}</p>
        </li>
      </ul>
    </UiSection>

    <section id="how" class="section scroll-mt-24 border-y border-rule bg-surface" aria-labelledby="how-title">
      <div class="wrap grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <div class="grid justify-items-start gap-8 lg:sticky lg:top-26">
          <h2 id="how-title">{{ t('zh.steps.title') }}</h2>
          <UiButton :to="localePath('/switzerland/calculator')" variant="primary">{{ t('zh.hero.cta') }}</UiButton>
        </div>
        <UiSteps :items="steps" />
      </div>
    </section>

    <section class="section" aria-labelledby="report-title">
      <div class="wrap grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <div class="section-head !mb-8">
            <h2 id="report-title">{{ t('zh.report.title') }}</h2>
            <p>{{ t('zh.report.lead') }}</p>
          </div>
          <UiCheckList :items="reportItems" />
        </div>
        <figure class="m-0 rounded-md border border-rule border-l-4 border-l-blue-deep bg-surface px-6 pt-6 pb-7 shadow-sheet">
          <figcaption class="mb-3 text-xs font-semibold text-blue-deep">
            {{ t('zh.calc.result.remarkTitle') }}
          </figcaption>
          <p lang="de" class="text-[0.9375rem] leading-relaxed hyphens-auto whitespace-pre-line">{{ sampleRemark }}</p>
        </figure>
      </div>
    </section>

    <UiSection :title="t('zh.compare.title')" title-id="compare-title" tone="field">
      <div class="overflow-hidden rounded-lg border border-rule bg-surface">
        <table class="stack-table">
          <thead>
            <tr>
              <th scope="col">{{ t('zh.compare.colOption') }}</th>
              <th scope="col">{{ t('zh.compare.colCost') }}</th>
              <th scope="col">{{ t('zh.compare.colEffort') }}</th>
              <th scope="col">{{ t('zh.compare.colResult') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in compareRows"
              :key="i"
              :class="
                i === compareRows.length - 1
                  ? 'bg-linear-to-r from-marker/55 to-marker/20 font-semibold [&>*]:border-t-transparent'
                  : ''
              "
            >
              <th scope="row">{{ row.option }}</th>
              <td :data-label="t('zh.compare.colCost')">{{ row.cost }}</td>
              <td :data-label="t('zh.compare.colEffort')">{{ row.effort }}</td>
              <td :data-label="t('zh.compare.colResult')">{{ row.result }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiSection>

    <UiSection :title="t('zh.fit.title')" title-id="fit-title">
      <div class="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <UiCard>
          <h3 class="mb-5">{{ t('zh.fit.yesTitle') }}</h3>
          <UiCheckList :items="fitYes" />
        </UiCard>
        <UiCard tone="quiet" class="border-dashed bg-transparent">
          <h3 class="mb-5">{{ t('zh.fit.noTitle') }}</h3>
          <UiCheckList :items="fitNo" tone="no" />
        </UiCard>
      </div>
    </UiSection>

    <section class="section border-y border-rule bg-surface" aria-labelledby="founder-title">
      <div class="wrap grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-20">
        <h2 id="founder-title">{{ t('founder.title') }}</h2>
        <div class="grid max-w-[40rem] gap-5 text-lg">
          <p v-for="(p, i) in founder" :key="i">{{ p }}</p>
          <p class="mt-2 grid text-xs text-ink-soft">
            <span
              class="mb-1.5 origin-bottom-left -rotate-2 font-hand text-[2.4rem] leading-none font-semibold text-blue-deep"
              lang="de"
            >
              Aleksej Dix
            </span>
            <span>{{ t('founder.role') }}</span>
          </p>
        </div>
      </div>
    </section>

    <section id="faq" class="section scroll-mt-24" aria-labelledby="faq-title">
      <div class="wrap grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-20">
        <h2 id="faq-title" class="lg:sticky lg:top-26">{{ t('zh.faq.title') }}</h2>
        <UiFaq :items="faq" />
      </div>
    </section>

    <UiCtaBand
      :title="t('zh.cta.title')"
      :body="t('zh.cta.body')"
      :label="t('zh.cta.button')"
      :to="localePath('/switzerland/calculator')"
    />
  </div>
</template>
