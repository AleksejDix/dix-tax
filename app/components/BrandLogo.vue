<script setup lang="ts">
// Plain wordmark in the system font: every letter a small cap of the same height,
// in the heaviest weight the system offers.
// Letters follow `color`; ".tax" uses `--logo-accent` (deep blue on light, yellow on dark).
</script>

<template>
  <span
    class="logo inline-block font-logo text-lg leading-none font-black tracking-[0.09em] whitespace-nowrap uppercase sm:text-xl"
    role="img"
    aria-label="Dix.Tax"
  >
    <span aria-hidden="true">dix</span><span class="tld" aria-hidden="true">.tax</span>
  </span>
</template>

<style scoped>
.tld {
  color: var(--logo-accent, var(--color-blue-deep));
}
</style>
