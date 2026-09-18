<script setup lang="ts">
// A guide, rendered from the locale files. Narrow measure, headings a reader can scan, and
// one way out at the end: the form this question belongs to.
const props = defineProps<{ guide: Guide['key'] }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { strings, objects } = useList()

const entry = computed(() => GUIDES.find((g) => g.key === props.guide)!)
const country = computed(() => PRODUCTS.find((p) => p.key === entry.value.country))
const points = computed(() => strings(`guides.${props.guide}.points`))
const sections = computed(() => objects(`guides.${props.guide}.sections`, ['title', 'body']))
const faq = computed(() => objects(`guides.${props.guide}.faq.items`, ['q', 'a']))

const checked = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : locale.value, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${entry.value.checked}-01T00:00:00Z`)),
)

useHead({ title: () => t(`guides.${props.guide}.metaTitle`) })
useSeoMeta({
  description: () => t(`guides.${props.guide}.metaDescription`),
  ogTitle: () => t(`guides.${props.guide}.metaTitle`),
  ogDescription: () => t(`guides.${props.guide}.metaDescription`),
  ogType: 'article',
})
useSocialImage(entry.value.image)
useFaqSchema(faq)
useSchemaOrg([
  defineArticle({
    headline: () => t(`guides.${props.guide}.title`),
    description: () => t(`guides.${props.guide}.metaDescription`),
    inLanguage: () => locale.value,
    datePublished: `${entry.value.checked}-01`,
    dateModified: `${entry.value.checked}-01`,
  }),
])
</script>

<template>
  <article class="wrap pt-10 sm:pt-16">
    <header class="max-w-[46rem]">
      <p class="mb-4 text-2xs text-ink-soft">{{ t('guides.kicker') }}</p>
      <h1>{{ t(`guides.${guide}.title`) }}</h1>
      <p class="lead mt-5">{{ t(`guides.${guide}.lead`) }}</p>
      <p class="mt-5 text-2xs text-ink-soft">{{ t('guides.checked', { date: checked }) }}</p>
    </header>

    <UiCard tone="accent" class="mt-10 max-w-[46rem]">
      <h2 class="text-lg">{{ t('guides.shortTitle') }}</h2>
      <UiCheckList :items="points" class="mt-4" />
    </UiCard>

    <div class="mt-14 grid items-start gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
      <div class="max-w-[46rem]">
        <section v-for="(s, i) in sections" :key="i" class="mb-10">
          <h2 class="text-2xl">{{ s.title }}</h2>
          <p class="mt-4 leading-relaxed text-ink-soft">{{ s.body }}</p>
        </section>

        <section v-if="faq.length" class="mt-14" aria-labelledby="guide-faq">
          <h2 id="guide-faq" class="mb-6 text-2xl">{{ t(`guides.${guide}.faq.title`) }}</h2>
          <UiFaq :items="faq" />
        </section>
      </div>

      <UiCard as="aside" class="grid justify-items-start gap-3.5 lg:sticky lg:top-28">
        <h2 class="text-lg">{{ t(`guides.${guide}.cta.title`) }}</h2>
        <p class="text-xs text-ink-soft">{{ t(`guides.${guide}.cta.body`) }}</p>
        <UiButton v-if="country" :to="localePath(country.path)" variant="primary">
          {{ t(`guides.${guide}.cta.label`) }}
        </UiButton>
      </UiCard>
    </div>
  </article>
</template>
