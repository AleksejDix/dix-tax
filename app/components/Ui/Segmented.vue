<script setup lang="ts">
// A short row of exclusive options that fit on one line: a tax year, apartment or house.
// Radio inputs under the hood, so a keyboard and a screen reader get a real radio group.
defineProps<{
  options: readonly { value: string | number; label: string }[]
  name: string
  labelledby?: string
  label?: string
}>()

const model = defineModel<string | number>({ required: true })
</script>

<template>
  <div
    class="flex overflow-hidden rounded-md border border-rule bg-surface"
    role="radiogroup"
    :aria-labelledby="labelledby"
    :aria-label="label"
  >
    <label v-for="option in options" :key="option.value" class="relative min-w-0 flex-1">
      <input
        v-model="model"
        type="radio"
        :name="name"
        :value="option.value"
        class="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0"
      />
      <span
        class="grid min-h-12 place-items-center border-l border-rule px-3 py-1.5 text-center text-xs leading-tight font-medium peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:-outline-offset-3 peer-focus-visible:outline-blue"
      >
        {{ option.label }}
      </span>
    </label>
  </div>
</template>

<style scoped>
label:first-child span {
  border-left: 0;
}
</style>
