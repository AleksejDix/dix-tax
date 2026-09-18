<script setup lang="ts">
// A band of the page: the vertical rhythm, the page width and, when it is given a title,
// the heading that labels it for a screen reader.
const props = withDefaults(
  defineProps<{
    title?: string
    titleId?: string
    lead?: string
    tone?: 'paper' | 'surface' | 'field'
    bordered?: boolean
    tight?: boolean
  }>(),
  { title: undefined, titleId: undefined, lead: undefined, tone: 'paper', bordered: false, tight: false },
)

const TONES = {
  paper: '',
  surface: 'bg-surface',
  field: 'bg-field',
} as const
</script>

<template>
  <section
    :class="[TONES[props.tone], props.bordered ? 'border-y border-rule' : '', props.tight ? 'py-10 sm:py-14' : 'section']"
    :aria-labelledby="titleId"
  >
    <div class="wrap">
      <div v-if="title" class="section-head">
        <h2 :id="titleId">{{ title }}</h2>
        <p v-if="lead">{{ lead }}</p>
      </div>
      <slot />
    </div>
  </section>
</template>
