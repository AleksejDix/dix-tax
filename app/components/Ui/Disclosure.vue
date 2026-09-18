<script setup lang="ts">
// A menu that is a real `<details>` element: it opens before Vue has hydrated and without any
// script at all, so every link inside sits in the prerendered HTML where a crawler and a phone
// can both reach it. Closing on navigation and on Escape is the only part `<details>` does not
// do by itself.
const props = withDefaults(defineProps<{ panel?: 'anchored' | 'sheet'; summaryClass?: string }>(), {
  panel: 'anchored',
  summaryClass: '',
})

const open = ref(false)
const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

const PANELS = {
  anchored: 'absolute right-0 top-[calc(100%+0.6rem)] min-w-44 rounded-md border border-rule bg-surface p-1.5 shadow-raise',
  sheet: 'absolute inset-x-0 top-full border-b border-rule bg-paper px-gutter py-4',
} as const
</script>

<template>
  <details
    :open="open"
    :class="props.panel === 'anchored' ? 'relative' : ''"
    @toggle="open = ($event.target as HTMLDetailsElement).open"
    @keydown.esc="open = false"
  >
    <summary
      :class="[
        'flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden',
        props.summaryClass,
      ]"
    >
      <slot name="summary" />
    </summary>
    <div :class="PANELS[props.panel]">
      <slot />
    </div>
  </details>
</template>
