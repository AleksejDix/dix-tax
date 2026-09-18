<script setup lang="ts">
// One line under a product: the next date for that form. No box and no badge, so a card
// stays a card; the days left appear only when the date is near enough to act on.
const props = defineProps<{ product: Product['key'] }>()

const { t, localeProperties } = useI18n()

const today = useToday()

const next = computed(() => {
  const deadline = nextDeadline(props.product, today.value)
  if (!deadline) return null
  const days = daysUntil(deadline, today.value)
  return {
    text: t('deadlines.next', {
      year: deadline.year,
      date: formatDeadlineDate(deadline.date, localeProperties.value.language),
    }),
    left: days <= 45 ? deadlineDaysLeft(days, t) : '',
  }
})
</script>

<template>
  <p v-if="next" class="text-xs text-ink-soft">
    {{ next.text }}<template v-if="next.left">, <span class="font-semibold text-warn">{{ next.left }}</span></template>
  </p>
</template>
