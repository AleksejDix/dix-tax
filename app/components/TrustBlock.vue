<script setup lang="ts">
// Trust signals that are true today, plus reviews once they exist in app.config.
const { t } = useI18n()
const { objects } = useList()
const items = computed(() => objects('trust.items', ['title', 'body']))
const reviews = useAppConfig().reviews
</script>

<template>
  <section class="section trust" aria-labelledby="trust-title">
    <div class="wrap">
      <div class="section-head">
        <h2 id="trust-title">{{ t('trust.title') }}</h2>
      </div>
      <ul class="grid">
        <li v-for="(item, i) in items" :key="i">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </li>
      </ul>
      <div v-if="reviews.length" class="reviews">
        <h3>{{ t('trust.reviewTitle') }}</h3>
        <p v-for="(r, i) in reviews" :key="i">
          {{ t('trust.reviewedBy', { name: r.name, firm: r.firm, date: r.date }) }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trust {
  background: var(--surface);
  border-block: 1px solid var(--rule);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1.5rem, 1rem + 2vw, 2.5rem);
}

.grid li {
  padding-top: 1.1rem;
  border-top: 3px solid var(--blue-deep);
}

.grid h3 {
  font-size: var(--step-1);
}

.grid p {
  margin-top: 0.6rem;
  color: var(--ink-soft);
  font-size: var(--step--1);
  line-height: 1.55;
}

.reviews {
  margin-top: 2.5rem;
  padding: 1.25rem 1.5rem;
  border-left: 4px solid var(--ok);
  background: color-mix(in srgb, var(--ok) 7%, white);
  border-radius: 0 var(--radius) var(--radius) 0;
}

.reviews h3 {
  font-size: var(--step-0);
  margin-bottom: 0.35rem;
}

@media (max-width: 60rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 34rem) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
