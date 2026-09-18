<script setup lang="ts">
// The filing calendar as a line you read left to right: the next deadline first, each stop
// carrying its date, what it is for and, once it is close enough to act on, how many days
// are left. Only the nearest stop is marked, so the mark still means something.
//
// A product page shows only its own stops; the hub shows the whole calendar. The dates come
// from `useToday`, which the browser corrects after hydration. The number of stops is the
// same on any date, and every stop reserves the line for its countdown, so the strip never
// changes height and nothing below it moves.
const props = withDefaults(defineProps<{ only?: Product['key'] }>(), { only: undefined })

const { t, localeProperties } = useI18n()

const today = useToday()

const stops = computed(() => {
  const all = upcomingDeadlines(today.value)
  return (props.only ? all.filter((d) => d.product === props.only) : all).map((d) => {
    const days = daysUntil(d, today.value)
    return {
      key: `${d.label}-${d.year}`,
      label: t(`deadlines.labels.${d.label}`, { year: d.year }),
      kind: t(`deadlines.kindNames.${d.kind}`),
      date: formatDeadlineDate(d.date, localeProperties.value.language),
      left: days <= 45 ? deadlineDaysLeft(days, t) : '',
      near: days <= 45,
    }
  })
})
</script>

<template>
  <!-- Bleeds into the page gutter so a long calendar can be scrolled without a cut edge. -->
  <!-- `tabindex` is what lets somebody scroll this strip with the keyboard; without it the
       later deadlines cannot be reached at all without a mouse. -->
  <div
    v-if="stops.length"
    tabindex="0"
    role="group"
    :aria-label="t('deadlines.title')"
    class="-mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <ol class="flex min-w-max">
      <li
        v-for="(stop, i) in stops"
        :key="stop.key"
        class="relative min-w-[11.5rem] flex-1 pt-7 pr-7 last:min-w-[9rem] last:pr-0"
      >
        <!-- The line runs to the next stop; after the last one it stops at its own dot. -->
        <span
          class="absolute top-2.5 left-0 h-px bg-rule"
          :class="i === stops.length - 1 ? 'w-2.5' : 'w-full'"
          aria-hidden="true"
        />
        <span
          class="absolute top-2.5 left-0 block size-2.5 -translate-y-1/2 rounded-full border-2 bg-surface"
          :class="i === 0 ? 'border-blue-deep bg-blue-deep' : 'border-rule'"
          aria-hidden="true"
        />
        <p class="num text-xs font-semibold whitespace-nowrap" :class="i === 0 ? 'text-blue-deep' : 'text-ink'">
          {{ stop.date }}
        </p>
        <p class="mt-1 max-w-[15ch] text-2xs leading-snug text-ink">{{ stop.label }}</p>
        <p class="mt-0.5 text-2xs text-ink-soft">{{ stop.kind }}</p>
        <!-- Always on its own line, empty or not, so the strip keeps its height all year. -->
        <p class="mt-1.5 text-2xs font-semibold" :class="stop.near ? 'text-warn' : 'text-transparent'">
          {{ stop.left || ' ' }}
        </p>
      </li>
    </ol>
  </div>
</template>
