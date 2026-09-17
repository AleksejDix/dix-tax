<script setup lang="ts">
// Plain wordmark in the system font: every letter a small cap of the same height,
// in the heaviest weight the system offers.
// Letters follow `color`; ".tax" uses `--logo-accent` (deep blue on light, yellow on dark).
</script>

<template>
  <span class="logo" role="img" aria-label="Dix.Tax">
    <span aria-hidden="true">dix</span><span class="tld" aria-hidden="true">.tax</span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-block;
  font-family: var(--font-logo);
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  white-space: nowrap;
}

.tld {
  color: var(--logo-accent, var(--blue-deep));
}
</style>
