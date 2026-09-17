<script setup lang="ts">
// The filing calendar, printed the way a tax administration prints one: a plain table,
// dates in one column, figures aligned. Only the deadline that is actually close is
// marked, so the mark still means something.
//
// The pages are prerendered, so "today" cannot come from the build: a static page would
// still be counting down to a date that passed weeks ago. The dates are therefore worked
// out in the browser, and the server renders nothing.
// A product page shows only its own rows; the hub shows the whole calendar.
const props = withDefaults(defineProps<{ only?: Product['key'] }>(), { only: undefined })

const { t, localeProperties } = useI18n()

const today = ref<Date | null>(null)
onMounted(() => {
  today.value = new Date()
})

const rows = computed(() => {
  if (!today.value) return []
  const all = upcomingDeadlines(today.value)
  return (props.only ? all.filter((d) => d.product === props.only) : all).map((d) => {
    const days = daysUntil(d, today.value!)
    return {
      key: `${d.label}-${d.year}`,
      label: t(`deadlines.labels.${d.label}`, { year: d.year }),
      kind: t(`deadlines.kindNames.${d.kind}`),
      date: formatDeadlineDate(d.date, localeProperties.value.language),
      left: days <= 45 ? deadlineDaysLeft(days, t) : '',
    }
  })
})
</script>

<template>
  <ClientOnly>
    <table v-if="rows.length" class="w-full border-collapse text-left">
      <caption class="sr-only">
        {{ t('deadlines.title') }}
      </caption>
      <thead>
        <tr class="border-b border-ink text-2xs font-medium tracking-wide text-ink-soft uppercase">
          <th scope="col" class="py-2 pr-4 font-medium">{{ t('deadlines.colForm') }}</th>
          <th scope="col" class="py-2 pr-4 font-medium">{{ t('deadlines.colKind') }}</th>
          <th scope="col" class="py-2 text-right font-medium">{{ t('deadlines.colDate') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key" class="border-b border-rule align-baseline">
          <th scope="row" class="py-3.5 pr-4 font-medium">{{ row.label }}</th>
          <td class="py-3.5 pr-4 text-xs text-ink-soft">{{ row.kind }}</td>
          <td class="num py-3.5 text-right whitespace-nowrap">
            {{ row.date }}
            <span v-if="row.left" class="block text-2xs font-semibold text-warn">{{ row.left }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </ClientOnly>
</template>
