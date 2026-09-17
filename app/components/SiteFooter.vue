<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="footer no-print">
    <div class="wrap grid">
      <div>
        <BrandLogo class="name" />
        <p class="small">{{ t('footer.rights') }}</p>
      </div>
      <div class="text">
        <p>{{ t('footer.disclaimer') }}</p>
        <p>{{ t('footer.sources') }}</p>
      </div>
      <ul class="links">
        <li v-for="p in PRODUCTS" :key="p.key">
          <NuxtLink :to="localePath(p.path)">{{ t(`products.${p.key}.name`) }}</NuxtLink>
        </li>
        <li>
          <NuxtLink :to="localePath('/legal')">{{ t('footer.legal') }}</NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: var(--space-section);
  padding-block: 3rem;
  background: var(--ink);
  color: #c9d3ea;
  font-size: var(--step--1);
}

.grid {
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) minmax(0, 3fr) minmax(12rem, 1fr);
  gap: 2rem 3rem;
}

.name {
  color: #fff;
  --logo-accent: var(--marker);
}

.small {
  margin-top: 0.8rem;
}

.text {
  display: grid;
  gap: 0.75rem;
  max-width: 60ch;
}

.links {
  display: grid;
  gap: 0.6rem;
  align-content: start;
}

.links a {
  color: #fff;
}

@media (max-width: 52rem) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
