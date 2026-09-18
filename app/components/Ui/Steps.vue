<script setup lang="ts">
// Numbered steps. The number sits in a box shaped like a field on the form, so the page
// keeps saying "this is paperwork" even where it is only explaining itself.
defineProps<{ items: { title: string; body: string }[] }>()
</script>

<template>
  <ol>
    <li
      v-for="(step, i) in items"
      :key="i"
      class="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 border-t border-rule py-7 first:border-t-0 first:pt-0 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-5"
    >
      <span
        class="num grid h-11 w-11 place-items-center rounded-t-xs border-b-2 border-field-strong bg-field text-lg font-bold text-blue-deep sm:h-14 sm:w-14 sm:text-2xl"
        aria-hidden="true"
      >
        {{ i + 1 }}
      </span>
      <div>
        <h3>{{ step.title }}</h3>
        <p class="mt-2 max-w-[52ch] text-ink-soft">{{ step.body }}</p>
      </div>
    </li>
  </ol>
</template>
