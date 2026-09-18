<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings } = useList()
const { price } = useAppConfig()

// The hub leads with the one thing that works today, so the hero shows the finished sheet
// rather than describing it. The same example as on the Zurich page.
const sample = [sampleResult()]

const founder = computed(() => strings('founder.body'))
const soon = computed(() => PRODUCTS.filter((p) => p.status !== 'live'))

useHead({ title: '' })
useSocialImage('home')
</script>

<template>
  <div>
    <section class="pt-10 pb-10 sm:pt-16 sm:pb-14">
      <div class="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16">
        <div>
          <h1 class="max-w-[20ch]">{{ t('hub.title') }}</h1>
          <p class="lead mt-6 max-w-[34rem]">{{ t('hub.lead') }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UiButton :to="localePath('/switzerland/calculator')" variant="primary">{{ t('hub.cta') }}</UiButton>
            <UiButton :to="{ path: localePath('/'), hash: '#choose' }">{{ t('hub.secondary') }}</UiButton>
          </div>
          <p class="mt-4 max-w-[34rem] text-xs text-ink-soft">{{ t('hub.ctaNote', { price }) }}</p>
          <p class="mt-1.5 max-w-[34rem] text-xs text-ink-soft/80">{{ t('hub.liveNote') }}</p>
        </div>

        <figure class="m-0">
          <FormSheet :results="sample" :year="2025" notes animate />
          <figcaption class="mt-3.5 text-center text-xs text-ink-soft">{{ t('zh.sheet.caption') }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="border-y border-rule bg-surface py-10 sm:py-14" aria-labelledby="deadlines-title">
      <div class="wrap grid items-start gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,2fr)] lg:gap-14">
        <div>
          <h2 id="deadlines-title" class="text-2xl">{{ t('deadlines.title') }}</h2>
          <p class="mt-3 max-w-[30rem] text-xs text-ink-soft">{{ t('deadlines.lead') }}</p>
        </div>
        <div>
          <DeadlineTimeline />
          <p class="mt-3 text-2xs text-ink-soft">{{ t('deadlines.note') }}</p>
        </div>
      </div>
    </section>

    <UiSection
      id="choose"
      :title="t('hub.chooseTitle')"
      :lead="t('hub.chooseLead')"
      title-id="choose-title"
      class="scroll-mt-24"
    >
      <ul class="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr] lg:gap-6">
        <UiCard
          v-for="p in PRODUCTS"
          :key="p.key"
          as="li"
          :tone="p.status === 'live' ? 'accent' : 'plain'"
          class="flex flex-col"
        >
          <p class="flex items-center justify-between gap-3 text-xs text-ink-soft">
            <span>{{ t(`products.${p.key}.place`) }}</span>
            <UiBadge :tone="p.status === 'live' ? 'positive' : 'neutral'">
              {{ p.status === 'live' ? t('products.statusLive') : t('products.statusSoon') }}
            </UiBadge>
          </p>
          <h3 class="mt-4 text-2xl">
            <NuxtLink :to="localePath(p.path)" class="text-inherit no-underline hover:text-blue-deep">
              {{ t(`products.${p.key}.name`) }}
            </NuxtLink>
          </h3>
          <p class="mt-3 font-medium">{{ t(`products.${p.key}.who`) }}</p>
          <p class="mt-2 text-xs text-ink-soft">{{ t(`products.${p.key}.what`) }}</p>
          <DeadlineNote :product="p.key" class="mt-4" />
          <p class="mt-auto pt-6">
            <UiButton v-if="p.start" :to="localePath(p.start)" variant="primary">
              {{ t(`products.${p.key}.cta`) }}
            </UiButton>
            <UiButton v-else :to="localePath(p.path)">{{ t('products.more') }}</UiButton>
          </p>
          <p v-if="p.note" class="mt-3 text-2xs text-ink-soft">{{ t(`products.${p.key}.note`) }}</p>
        </UiCard>
      </ul>
    </UiSection>

    <section class="section bg-field" aria-labelledby="both-title">
      <div class="wrap grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-20">
        <h2 id="both-title">{{ t('hub.bothTitle') }}</h2>
        <div>
          <p class="max-w-[40rem] text-lg">{{ t('hub.bothBody') }}</p>
          <ul class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <li v-for="p in soon" :key="p.key" class="flex items-baseline gap-2">
              <NuxtLink :to="localePath(p.path)">{{ t(`products.${p.key}.name`) }}</NuxtLink>
              <span class="text-ink-soft">{{ t(`products.${p.key}.place`) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section id="need" class="section border-y border-rule bg-surface" aria-labelledby="need-title">
      <div class="wrap grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <h2 id="need-title">{{ t('interest.title') }}</h2>
          <p class="lead mt-4 max-w-[34rem]">{{ t('interest.lead') }}</p>
        </div>
        <UiCard tone="accent">
          <InterestForm choose />
        </UiCard>
      </div>
    </section>

    <TrustBlock />

    <section class="section" aria-labelledby="founder-title">
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
  </div>
</template>
