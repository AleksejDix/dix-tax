<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings } = useList()

const founder = computed(() => strings('founder.body'))

useHead({ title: '' })
</script>

<template>
  <div>
    <section class="hero">
      <div class="wrap">
        <h1>{{ t('hub.title') }}</h1>
        <p class="lead">{{ t('hub.lead') }}</p>
      </div>
    </section>

    <section class="section choose" aria-labelledby="choose-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="choose-title">{{ t('hub.chooseTitle') }}</h2>
        </div>
        <ul class="products">
          <li v-for="p in PRODUCTS" :key="p.key" :class="{ live: p.status === 'live' }">
            <p class="meta">
              <span class="place">{{ t(`products.${p.key}.place`) }}</span>
              <span class="status" :class="p.status">
                {{ p.status === 'live' ? t('products.statusLive') : t('products.statusSoon') }}
              </span>
            </p>
            <h3>
              <NuxtLink :to="localePath(p.path)">{{ t(`products.${p.key}.name`) }}</NuxtLink>
            </h3>
            <p class="who">{{ t(`products.${p.key}.who`) }}</p>
            <p class="what">{{ t(`products.${p.key}.what`) }}</p>
            <p class="action">
              <NuxtLink v-if="p.start" :to="localePath(p.start)" class="btn btn-primary">
                {{ t(`products.${p.key}.cta`) }}
              </NuxtLink>
              <NuxtLink v-else :to="localePath(p.path)" class="btn btn-quiet">{{ t('products.more') }}</NuxtLink>
            </p>
            <p v-if="p.key === 'chZurich'" class="note">{{ t('products.chZurich.note') }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section id="need" class="section need" aria-labelledby="need-title">
      <div class="wrap need-grid">
        <div>
          <h2 id="need-title">{{ t('interest.title') }}</h2>
          <p class="need-lead">{{ t('interest.lead') }}</p>
        </div>
        <div class="need-form">
          <InterestForm choose />
        </div>
      </div>
    </section>

    <section class="section both" aria-labelledby="both-title">
      <div class="wrap both-grid">
        <h2 id="both-title">{{ t('hub.bothTitle') }}</h2>
        <p>{{ t('hub.bothBody') }}</p>
      </div>
    </section>

    <TrustBlock />

    <section class="section" aria-labelledby="founder-title">
      <div class="wrap founder-grid">
        <h2 id="founder-title">{{ t('founder.title') }}</h2>
        <div class="founder-body">
          <p v-for="(p, i) in founder" :key="i">{{ p }}</p>
          <p class="signature">
            <span class="signature-name" lang="de">Aleksej Dix</span>
            <span>{{ t('founder.role') }}</span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding-block: clamp(3.5rem, 2rem + 6vw, 7rem) clamp(2rem, 1rem + 3vw, 3.5rem);
}

.hero h1 {
  max-width: 18ch;
}

.hero .lead {
  margin-top: 1.75rem;
}

.choose {
  padding-top: clamp(1.5rem, 1rem + 2vw, 3rem);
}

.products {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr;
  gap: clamp(1rem, 0.5rem + 1.5vw, 1.75rem);
  align-items: stretch;
}

.products li {
  display: flex;
  flex-direction: column;
  padding: clamp(1.4rem, 1rem + 1.2vw, 2rem);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.products li.live {
  border-color: var(--blue-deep);
  box-shadow: var(--shadow-sheet);
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
}

.status {
  padding: 0.15rem 0.6rem;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.8125rem;
  white-space: nowrap;
  background: var(--field);
  color: var(--ink-soft);
}

.status.live {
  background: color-mix(in srgb, var(--ok) 14%, white);
  color: var(--ok);
}

.products h3 {
  margin-top: 1rem;
  font-size: var(--step-2);
  letter-spacing: -0.02em;
}

.products h3 a {
  color: inherit;
  text-decoration: none;
}

.products h3 a:hover {
  color: var(--blue-deep);
}

.who {
  margin-top: 0.75rem;
  font-weight: 500;
}

.what {
  margin-top: 0.5rem;
  color: var(--ink-soft);
  font-size: var(--step--1);
  line-height: 1.55;
}

.action {
  margin-top: auto;
  padding-top: 1.5rem;
}

.note {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--ink-soft);
}

.need {
  background: var(--surface);
  border-block: 1px solid var(--rule);
}

.need-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: clamp(2rem, 1rem + 4vw, 5rem);
  align-items: start;
}

.need-lead {
  margin-top: 1rem;
  font-size: var(--step-1);
  line-height: 1.5;
  color: var(--ink-soft);
  max-width: 34rem;
}

.need-form {
  padding: clamp(1.25rem, 1rem + 1vw, 2rem);
  border: 1px solid var(--blue-deep);
  border-radius: var(--radius-lg);
  background: var(--paper);
}

.both {
  background: var(--field);
}

.both-grid,
.founder-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: clamp(1.5rem, 1rem + 4vw, 5rem);
  align-items: start;
}

.both-grid p {
  font-size: var(--step-1);
  line-height: 1.5;
  max-width: 40rem;
}

.founder-body {
  display: grid;
  gap: 1.25rem;
  font-size: var(--step-1);
  line-height: 1.5;
  max-width: 40rem;
}

.signature {
  display: grid;
  margin-top: 0.5rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
}

.signature-name {
  font-family: var(--font-hand);
  font-size: 2.4rem;
  font-weight: 600;
  line-height: 1;
  color: var(--blue-deep);
  transform: rotate(-2deg);
  transform-origin: left bottom;
  margin-bottom: 0.35rem;
}

@media (max-width: 60rem) {
  .products,
  .need-grid,
  .both-grid,
  .founder-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
