<script setup lang="ts">
// A short status word: whether a form is ready, and how near its deadline is.
const props = withDefaults(defineProps<{ tone?: 'neutral' | 'positive' | 'warning' | 'info' }>(), { tone: 'neutral' })

const TONES = {
  neutral: 'bg-field text-ink-soft',
  positive: 'bg-ok-tint text-ok',
  warning: 'bg-warn-tint text-warn',
  info: 'bg-field-strong text-blue-deep',
} as const
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-semibold whitespace-nowrap"
    :class="TONES[props.tone]"
  >
    <slot />
  </span>
</template>
