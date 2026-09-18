<script setup lang="ts">
// Questions people ask, one open by default. The same shape will serve every product,
// and the page that uses it also publishes the questions as a FAQ rich result.
defineProps<{ items: { q: string; a: string }[] }>()
</script>

<template>
  <div class="border-b border-rule">
    <details v-for="(item, i) in items" :key="i" :open="i === 0" class="group border-t border-rule">
      <summary class="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
        <h3 class="text-lg font-semibold group-hover:text-blue-deep">{{ item.q }}</h3>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          class="mt-1.5 size-4.5 flex-none text-blue transition-transform duration-200 group-open:rotate-180"
        >
          <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </summary>
      <p class="max-w-(--spacing-measure) pb-6 text-ink-soft">{{ item.a }}</p>
    </details>
  </div>
</template>
