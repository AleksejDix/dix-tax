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
useSocialImage(props.ns === 'modelo210' ? 'modelo-210' : 'anlage-v')

// The namespace names the form, the registry names the country.
const country = computed(() => (props.ns === 'modelo210' ? 'spain' : 'germany') as const)
</script>

<template>
  <div class="wrap pt-10 sm:pt-16">
    <header class="mb-10 max-w-[50rem] sm:mb-16">
      <UiBadge class="mb-5">{{ t('soon.status') }}</UiBadge>
      <h1 class="text-3xl">{{ t(`${ns}.title`) }}</h1>
      <p class="lead mt-4">{{ t(`${ns}.lead`) }}</p>
    </header>

    <div class="grid items-start gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
      <section aria-labelledby="facts-title">
        <h2 id="facts-title" class="text-lg">{{ t('soon.factsTitle') }}</h2>
        <dl class="mt-6">
          <div
            v-for="(f, i) in facts"
            :key="i"
            class="grid gap-x-8 gap-y-2 border-t border-rule py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
          >
            <dt class="font-semibold">{{ f.label }}</dt>
            <dd class="m-0 max-w-[52ch] text-ink-soft">{{ f.value }}</dd>
          </div>
        </dl>

        <h2 class="mt-12 text-lg">{{ t('deadlines.title') }}</h2>
        <div class="mt-4">
          <DeadlineTable :only="country" />
        </div>
        <p class="mt-3 text-2xs text-ink-soft">{{ t('deadlines.note') }}</p>
      </section>

      <aside class="grid gap-5">
        <UiCard tone="accent" class="grid justify-items-start gap-3.5">
          <h2 class="text-lg">{{ t('soon.notifyTitle') }}</h2>
          <p class="text-xs text-ink-soft">{{ t('soon.notifyBody') }}</p>
          <InterestForm :product="ns" />
        </UiCard>
        <UiCard tone="quiet" class="grid justify-items-start gap-3.5 border-dashed">
          <h2 class="text-lg">{{ t('soon.swissTitle') }}</h2>
          <p class="text-xs text-ink-soft">{{ t('soon.swissBody') }}</p>
          <NuxtLink :to="localePath('/switzerland')">{{ t('soon.swissCta') }}</NuxtLink>
        </UiCard>
      </aside>
    </div>
  </div>
</template>
