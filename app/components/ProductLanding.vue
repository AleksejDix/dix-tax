<script setup lang="ts">
// The page for a form whose guided tool is still being built. It has two honest jobs: explain
// the tax well enough that a reader recognises their own case, and say plainly what dix.tax
// will do for them, without implying the tool is there yet. Every rule it states is sourced.
const props = defineProps<{ ns: 'modelo210' | 'anlageV' }>()

const { t } = useI18n()
const localePath = useLocalePath()
const { price } = useAppConfig()
const { strings, objects } = useList()

// The namespace names the form, the registry names the country.
const country = computed(() => (props.ns === 'modelo210' ? 'spain' : 'germany') as const)

const facts = computed(() => objects(`${props.ns}.facts`, ['label', 'value']))
const steps = computed(() => objects(`${props.ns}.how.steps`, ['title', 'body']))
const example = computed(() => objects(`${props.ns}.how.example`, ['label', 'value']))
const offerItems = computed(() => strings(`${props.ns}.offer.items`))
const faq = computed(() => objects(`${props.ns}.faq.items`, ['q', 'a']))
const docs = computed(() => strings(`${props.ns}.docs.items`))

// The law each page rests on, checked against the text itself. Official names stay in their
// own language; what the source covers is translated.
const SOURCES = {
  modelo210: [
    { name: 'Art. 24 y 25, Real Decreto Legislativo 5/2004 (IRNR)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4527' },
    { name: 'Art. 85, Ley 35/2006 (IRPF)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764' },
    {
      name: 'Agencia Tributaria: rentas imputadas de bienes inmuebles urbanos',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-tributacion-no-residentes/capitulo-03-tributacion-rentas-comunes-nr/rentas-imputadas-bienes-inmuebles-urbanos.html',
    },
  ],
  anlageV: [
    { name: '§ 49 Abs. 1 Nr. 6 EStG', url: 'https://www.gesetze-im-internet.de/estg/__49.html' },
    { name: '§ 50 Abs. 1 EStG', url: 'https://www.gesetze-im-internet.de/estg/__50.html' },
    { name: '§ 1 Abs. 3 EStG', url: 'https://www.gesetze-im-internet.de/estg/__1.html' },
    { name: '§ 7 Abs. 4 EStG', url: 'https://www.gesetze-im-internet.de/estg/__7.html' },
    { name: '§ 19 Abs. 2 AO', url: 'https://www.gesetze-im-internet.de/ao_1977/__19.html' },
  ],
} as const

const sources = computed(() => SOURCES[props.ns])

useHead({ title: () => t(`${props.ns}.metaTitle`) })
useSeoMeta({
  description: () => t(`${props.ns}.metaDescription`),
  ogTitle: () => t(`${props.ns}.metaTitle`),
  ogDescription: () => t(`${props.ns}.metaDescription`),
})
useSocialImage(props.ns === 'modelo210' ? 'modelo-210' : 'anlage-v')
</script>

<template>
  <div>
    <header class="wrap pt-10 sm:pt-16">
      <div class="max-w-[52rem]">
        <UiBadge class="mb-5">{{ t('soon.status') }}</UiBadge>
        <h1>{{ t(`${ns}.title`) }}</h1>
        <p class="lead mt-5">{{ t(`${ns}.lead`) }}</p>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <UiButton :to="{ path: localePath(`/${country}`), hash: '#need' }" variant="primary">
            {{ t(`${ns}.hero.cta`) }}
          </UiButton>
          <UiButton :to="{ path: localePath(`/${country}`), hash: '#how' }">
            {{ t(`${ns}.hero.secondary`) }}
          </UiButton>
        </div>
        <p class="mt-4 text-xs text-ink-soft">{{ t(`${ns}.hero.note`) }}</p>
      </div>
    </header>

    <UiSection :title="t('soon.factsTitle')" title-id="facts-title">
      <dl class="max-w-[62rem]">
        <div
          v-for="(f, i) in facts"
          :key="i"
          class="grid gap-x-8 gap-y-2 border-t border-rule py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
        >
          <dt class="font-semibold">{{ f.label }}</dt>
          <dd class="m-0 max-w-[58ch] text-ink-soft">{{ f.value }}</dd>
        </div>
      </dl>
    </UiSection>

    <section id="how" class="section scroll-mt-24 border-y border-rule bg-surface" aria-labelledby="how-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="how-title">{{ t(`${ns}.how.title`) }}</h2>
          <p>{{ t(`${ns}.how.lead`) }}</p>
        </div>
        <div class="grid items-start gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <UiSteps :items="steps" />
          <UiCard tone="accent" class="grid gap-4">
            <h3>{{ t(`${ns}.how.exampleTitle`) }}</h3>
            <dl class="m-0 grid gap-0">
              <div
                v-for="(row, i) in example"
                :key="i"
                class="flex items-baseline justify-between gap-6 border-t border-rule py-2.5 first:border-t-0"
              >
                <dt class="text-xs text-ink-soft">{{ row.label }}</dt>
                <dd class="num m-0 font-semibold whitespace-nowrap">{{ row.value }}</dd>
              </div>
            </dl>
            <p class="text-2xs leading-snug text-ink-soft">{{ t(`${ns}.how.exampleNote`) }}</p>
          </UiCard>
        </div>
      </div>
    </section>

    <UiSection :title="t(`${ns}.offer.title`)" :lead="t(`${ns}.offer.lead`)" title-id="offer-title">
      <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <UiCheckList :items="offerItems" />
        <UiCard class="grid justify-items-start gap-3.5">
          <h3>{{ t('deadlines.title') }}</h3>
          <DeadlineTable :only="country" />
          <p class="text-2xs text-ink-soft">{{ t('deadlines.note') }}</p>
        </UiCard>
      </div>
      <p class="mt-8 max-w-[62ch] text-xs text-ink-soft">{{ t(`${ns}.offer.note`, { price }) }}</p>
    </UiSection>

    <UiSection :title="t(`${ns}.docs.title`)" title-id="docs-title" tone="field">
      <ul class="grid max-w-[60ch] gap-3">
        <li v-for="(d, i) in docs" :key="i" class="border-t border-rule pt-3">{{ d }}</li>
      </ul>
    </UiSection>

    <section id="faq" class="section scroll-mt-24" aria-labelledby="faq-title">
      <div class="wrap grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <h2 id="faq-title" class="lg:sticky lg:top-26">{{ t(`${ns}.faq.title`) }}</h2>
        <UiFaq :items="faq" />
      </div>
    </section>

    <UiSection id="need" title-id="need-title" tone="surface" bordered>
      <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 id="need-title" class="scroll-mt-24">{{ t('soon.notifyTitle') }}</h2>
          <p class="lead mt-4">{{ t('soon.notifyBody') }}</p>
          <div class="mt-7 max-w-[34rem]">
            <InterestForm :product="ns" />
          </div>
        </div>
        <UiCard tone="quiet" class="grid justify-items-start gap-3.5 border-dashed">
          <h3>{{ t('soon.swissTitle') }}</h3>
          <p class="text-xs text-ink-soft">{{ t('soon.swissBody') }}</p>
          <NuxtLink :to="localePath('/switzerland')">{{ t('soon.swissCta') }}</NuxtLink>
        </UiCard>
      </div>

      <details class="mt-12 border-t border-rule pt-4 text-xs">
        <summary class="cursor-pointer font-semibold">{{ t(`${ns}.sources.title`) }}</summary>
        <ul class="mt-3 grid gap-2">
          <li v-for="(src, i) in sources" :key="i" class="grid gap-0.5">
            <a :href="src.url" target="_blank" rel="noopener">{{ src.name }}</a>
            <span class="text-ink-soft">{{ t(`${ns}.sources.items[${i}]`) }}</span>
          </li>
        </ul>
      </details>
    </UiSection>
  </div>
</template>
