<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { company, contactEmail } = useAppConfig()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer no-print">
    <div class="wrap">
      <div class="top">
        <div class="brand">
          <BrandLogo class="name" />
          <p>{{ t('footer.tagline') }}</p>
        </div>

        <nav :aria-label="t('footer.formsTitle')">
          <h2>{{ t('footer.formsTitle') }}</h2>
          <ul>
            <li v-for="p in PRODUCTS" :key="p.key">
              <NuxtLink :to="localePath(p.path)">{{ t(`products.${p.key}.name`) }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <nav :aria-label="t('footer.companyTitle')">
          <h2>{{ t('footer.companyTitle') }}</h2>
          <ul>
            <li>
              <NuxtLink :to="localePath('legal-notice')">{{ t('footer.legalNotice') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('privacy')">{{ t('footer.privacy') }}</NuxtLink>
            </li>
            <li>
              <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="notes">
        <p>{{ t('footer.disclaimer') }}</p>
        <p>{{ t('footer.sources') }}</p>
      </div>

      <div class="bottom">
        <p>{{ t('footer.copyright', { year, name: company.name }) }}</p>
        <p>{{ t('footer.made') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: var(--space-section);
  padding-block: clamp(2.5rem, 2rem + 2vw, 4rem) 1.5rem;
  background: var(--ink);
  color: #c9d3ea;
  font-size: var(--step--1);
}

.top {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 2.5rem 3rem;
}

.name {
  color: #fff;
  --logo-accent: var(--marker);
}

.brand p {
  margin-top: 1rem;
  max-width: 30ch;
  line-height: 1.5;
}

h2 {
  margin-bottom: 0.9rem;
  font-size: var(--step--1);
  font-weight: 600;
  letter-spacing: 0;
  color: #fff;
}

ul {
  display: grid;
  gap: 0.6rem;
}

a {
  color: #c9d3ea;
  text-decoration: none;
}

a:hover {
  color: #fff;
  text-decoration: underline;
}

.notes {
  display: grid;
  gap: 0.6rem;
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
  padding-top: 1.5rem;
  border-top: 1px solid rgb(255 255 255 / 0.14);
  max-width: 78ch;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #9fabc8;
}

.bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 2rem;
  margin-top: 1.75rem;
  font-size: 0.8125rem;
  color: #9fabc8;
}

@media (max-width: 52rem) {
  .top {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .brand {
    grid-column: 1 / -1;
  }
}
</style>
