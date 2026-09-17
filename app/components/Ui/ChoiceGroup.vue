<script setup lang="ts">
// Options that need a sentence of explanation each, so they get a card with a radio dot
// rather than a segment. Used for "what do you do with the property".
defineProps<{
  options: readonly { value: string; title: string; hint: string }[]
  name: string
  labelledby?: string
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="grid gap-2.5 sm:grid-cols-2" role="radiogroup" :aria-labelledby="labelledby">
    <label v-for="option in options" :key="option.value" class="relative block">
      <input
        v-model="model"
        type="radio"
        :name="name"
        :value="option.value"
        class="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0"
      />
      <span
        class="dot grid h-full content-start gap-1 rounded-md border border-rule bg-surface py-3 pr-3.5 pl-10 leading-snug peer-checked:border-blue-deep peer-checked:bg-field peer-checked:shadow-[inset_0_0_0_1px_var(--color-blue-deep)] peer-focus-visible:outline-3 peer-focus-visible:-outline-offset-3 peer-focus-visible:outline-blue"
      >
        <strong class="text-xs font-semibold">{{ option.title }}</strong>
        <small class="text-2xs text-ink-soft">{{ option.hint }}</small>
      </span>
    </label>
  </div>
</template>

<style scoped>
/* The radio dot. It is drawn rather than shown, because the input itself is the hit area. */
.dot::before {
  content: '';
  position: absolute;
  left: 0.9rem;
  top: 0.95rem;
  width: 1rem;
  height: 1rem;
  border: 1.5px solid var(--color-ink-soft);
  border-radius: 50%;
  background: var(--color-surface);
}

input:checked + .dot::before {
  border: 5px solid var(--color-blue-deep);
}
</style>
