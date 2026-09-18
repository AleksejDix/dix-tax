<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { objects } = useList()
const { price } = useAppConfig()

const sample = [sampleResult()]
const sampleRemark = remarkDe(summarise(sample, newHousehold()), 2025)

const facts = computed(() => objects('zh.facts.items', ['title', 'body']))
const steps = computed(() => objects('zh.steps.items', ['title', 'body']))

useHead({ title: () => t('zh.meta.title'), titleTemplate: '%s' })
useSeoMeta({
  description: () => t('zh.meta.description'),
  ogTitle: () => t('zh.meta.title'),
  ogDescription: () => t('zh.meta.description'),
})
useSocialImage('ch-zurich')
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
            <UiButton :to="localePath(GUIDES[0]!.path)">{{ t('zh.hero.secondary') }}</UiButton>
          </div>
          <p class="mt-5 flex items-center gap-2 text-xs text-ink-soft">
            <svg viewBox="0 0 16 16" aria-hidden="true" class="size-4 flex-none text-ok">
              <path d="M4.5 7V5a3.5 3.5 0 017 0v2" fill="none" stroke="currentColor" stroke-width="1.5" />
              <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
            </svg>
            {{ t('zh.hero.note', { price }) }}
          </p>
          <DeadlineNote product="switzerland" class="mt-2" />
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

    <UiCtaBand
      :title="t('zh.cta.title')"
      :body="t('zh.cta.body')"
      :label="t('zh.cta.button')"
      :to="localePath('/switzerland/calculator')"
    />
  </div>
</template>
