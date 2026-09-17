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
  <div class="wrap max-w-[54rem] pt-10 sm:pt-16">
    <h1 class="text-3xl">{{ t('privacy.title') }}</h1>
    <p class="mt-3 text-xs text-ink-soft">{{ t('privacy.updated', { date: updated }) }}</p>
    <p class="lead mt-7">{{ t('privacy.intro') }}</p>

    <ol class="mt-10 [counter-reset:section]">
      <li v-for="(s, i) in sections" :key="i" class="grid gap-3 border-t border-rule py-7 [counter-increment:section]">
        <h2 class="text-lg before:text-blue-deep before:content-[counter(section)'._']">{{ s.title }}</h2>
        <p v-for="(p, j) in s.body" :key="j" class="max-w-(--spacing-measure) text-ink-soft">{{ p }}</p>
        <p v-if="i === 0">
          <NuxtLink :to="localePath('legal-notice')">{{ t('footer.legalNotice') }}</NuxtLink>
        </p>
      </li>
    </ol>
  </div>
</template>
