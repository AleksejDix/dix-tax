<script setup lang="ts">
// The last thing on a product page: one sentence and one button, on the brand blue.
// It sits flush against the footer, which is why the page's bottom margin is pulled back.
defineProps<{ title: string; body: string; label: string; to: string }>()
</script>

<template>
  <section class="-mb-(--spacing-section) bg-blue-deep text-white" aria-labelledby="closing-title">
    <div class="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-8 py-12 sm:py-16">
      <div>
        <h2 id="closing-title" class="max-w-[22ch]">{{ title }}</h2>
        <p class="mt-3.5 text-lg text-[#c9d8f5]">{{ body }}</p>
      </div>
      <UiButton :to="to" variant="marker">{{ label }}</UiButton>
    </div>
  </section>
</template>
