<script setup lang="ts">
defineProps<{ flip?: boolean }>()
</script>

<template>
  <svg class="arrow" :class="{ flip }" viewBox="0 0 34 26" aria-hidden="true">
    <path d="M3 22c9 1 19-3 25-16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    <path d="M20 7l8.5-2 1.5 8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
.arrow {
  order: 2;
  flex: none;
  width: 1.9rem;
  height: auto;
  margin-top: -0.55rem;
}

.arrow.flip {
  margin-top: -0.75rem;
}
</style>
