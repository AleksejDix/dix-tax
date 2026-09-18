<script setup lang="ts">
// A bordered panel. The look leans on a hairline rule rather than a shadow, the way a
// printed form separates its boxes; `accent` is the one card on a screen that matters most.
const props = withDefaults(
  defineProps<{
    tone?: 'plain' | 'accent' | 'quiet'
    size?: 'md' | 'sm'
    as?: string
  }>(),
  { tone: 'plain', size: 'md', as: 'div' },
)

const TONES = {
  plain: 'border-rule bg-surface',
  accent: 'border-blue-deep bg-surface shadow-raise',
  quiet: 'border-rule-soft bg-paper',
} as const

const SIZES = {
  md: 'p-6 sm:p-7',
  sm: 'p-4 sm:p-5',
} as const

const classes = computed(() => ['rounded-lg border', TONES[props.tone], SIZES[props.size]])
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
