<script setup lang="ts">
// Label, control and hint in the order a screen reader wants them. A radio group cannot sit
// inside a label, so it passes `label-id` and points its own aria-labelledby at it instead.
withDefaults(defineProps<{ label: string; labelId?: string; hint?: string }>(), {
  labelId: undefined,
  hint: undefined,
})
</script>

<template>
  <component :is="labelId ? 'div' : 'label'" class="grid content-start gap-1.5">
    <span :id="labelId" class="text-xs font-medium">{{ label }}</span>
    <slot />
    <small v-if="hint" class="text-2xs leading-snug text-ink-soft"><slot name="hint">{{ hint }}</slot></small>
  </component>
</template>
