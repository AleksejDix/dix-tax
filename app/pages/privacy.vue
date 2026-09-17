<script setup lang="ts">
const { t, tm, locale } = useI18n()
const localePath = useLocalePath()
const { privacyUpdated } = useAppConfig()

useHead({ title: () => t('privacy.metaTitle') })

// Sections hold a title and a list of paragraphs; `tm` is only used for the counts.
const sections = computed(() => {
  const raw = tm('privacy.sections') as unknown as { body: unknown[] }[]
  return raw.map((section, i) => ({
    title: t(`privacy.sections[${i}].title`),
    body: section.body.map((_, j) => t(`privacy.sections[${i}].body[${j}]`)),
  }))
})

const updated = computed(() =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(privacyUpdated)),
)
</script>

<template>
  <div class="wrap page">
    <h1>{{ t('privacy.title') }}</h1>
    <p class="updated">{{ t('privacy.updated', { date: updated }) }}</p>
    <p class="intro">{{ t('privacy.intro') }}</p>

    <ol class="sections">
      <li v-for="(s, i) in sections" :key="i">
        <h2>{{ s.title }}</h2>
        <p v-for="(p, j) in s.body" :key="j">{{ p }}</p>
        <p v-if="i === 0">
          <NuxtLink :to="localePath('legal-notice')">{{ t('footer.legalNotice') }}</NuxtLink>
        </p>
      </li>
    </ol>
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
}

.updated {
  margin-top: 0.75rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
}

.intro {
  margin-top: 1.75rem;
  font-size: var(--step-1);
  line-height: 1.5;
  color: var(--ink-soft);
  max-width: var(--measure);
}

.sections {
  margin-top: 2.5rem;
  counter-reset: section;
}

.sections li {
  counter-increment: section;
  display: grid;
  gap: 0.8rem;
  padding-block: 1.75rem;
  border-top: 1px solid var(--rule);
}

h2 {
  font-size: var(--step-1);
}

h2::before {
  content: counter(section) '. ';
  color: var(--blue-deep);
}

.sections p {
  color: var(--ink-soft);
  max-width: var(--measure);
}
</style>
