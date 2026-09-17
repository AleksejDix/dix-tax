<script setup lang="ts">
// The next deadline for each filing, with the days left. A deadline is the reason a
// visitor acts today rather than in three months, so it belongs on the first screen.
//
// The pages are prerendered, so "today" cannot come from the build: a static page would
// still be counting down to a date that passed weeks ago. The dates are therefore worked
// out in the browser, and the server renders nothing.
const props = withDefaults(defineProps<{ only?: Product['key']; compact?: boolean }>(), {
  only: undefined,
  compact: false,
})

const { t, localeProperties } = useI18n()

const today = ref<Date | null>(null)
onMounted(() => {
  today.value = new Date()
})

const items = computed(() => {
  if (!today.value) return []
  const all = upcomingDeadlines(today.value)
  const list = props.only ? all.filter((d) => d.product === props.only) : all
  return list.map((d) => ({
    key: `${d.label}-${d.year}`,
    label: t(`deadlines.labels.${d.label}`, { year: d.year }),
    when: t(`deadlines.kinds.${d.kind}`, { date: formatDate(d.date) }),
    left: left(daysUntil(d, today.value!)),
    soon: daysUntil(d, today.value!) <= 30,
  }))
})

function formatDate(date: Date) {
  // Readers are in Europe, so plain "en" must not turn into the American "September 30, 2026".
  const language = localeProperties.value.language === 'en' ? 'en-GB' : localeProperties.value.language
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

// The locale files may not use vue-i18n plurals, so the two small counts get their own key.
function left(days: number) {
  if (days === 0) return t('deadlines.left.today')
  if (days === 1) return t('deadlines.left.tomorrow')
  return t('deadlines.left.days', { days })
}
</script>

<template>
  <ClientOnly>
    <ul v-if="items.length" class="deadlines" :class="{ compact }">
      <li v-for="item in items" :key="item.key" :class="{ soon: item.soon }">
        <p class="what">{{ item.label }}</p>
        <p class="when">
          <span>{{ item.when }}</span>
          <span class="left">{{ item.left }}</span>
        </p>
      </li>
    </ul>
  </ClientOnly>
</template>

<style scoped>
.deadlines {
  display: grid;
  gap: 0.75rem;
}

.deadlines li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.35rem 1.5rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--rule);
  border-left: 3px solid var(--rule);
  border-radius: var(--radius);
  background: var(--surface);
}

.deadlines li.soon {
  border-left-color: var(--warn);
}

.what {
  font-weight: 500;
}

.when {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
  white-space: nowrap;
}

.left {
  padding: 0.1rem 0.5rem;
  border-radius: 99px;
  background: var(--field);
  color: var(--ink-soft);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.soon .left {
  background: color-mix(in srgb, var(--warn) 14%, white);
  color: var(--warn);
}

.compact li {
  padding: 0.6rem 0.9rem;
  font-size: var(--step--1);
}
</style>
