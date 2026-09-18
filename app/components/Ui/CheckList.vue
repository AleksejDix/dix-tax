<script setup lang="ts">
// A list where each item carries a mark: a tick for what the tool covers, a dash for what
// it does not. Drawn with a border rather than a character so it never reads as text.
withDefaults(defineProps<{ items: string[]; tone?: 'yes' | 'no' }>(), { tone: 'yes' })
</script>

<template>
  <ul class="grid max-w-[54ch] gap-3.5">
    <li v-for="(item, i) in items" :key="i" class="relative pl-8" :class="tone === 'yes' ? 'yes' : 'no'">
      {{ item }}
    </li>
  </ul>
</template>

<style scoped>
.yes::before {
  content: '';
  position: absolute;
  left: 0.15rem;
  top: 0.4em;
  width: 0.95rem;
  height: 0.5rem;
  border-left: 2.5px solid var(--color-ok);
  border-bottom: 2.5px solid var(--color-ok);
  transform: rotate(-45deg);
}

.no::before {
  content: '';
  position: absolute;
  left: 0.2rem;
  top: 0.72em;
  width: 0.85rem;
  height: 2.5px;
  background: var(--color-warn);
}
</style>
