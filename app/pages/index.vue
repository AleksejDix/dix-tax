<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings } = useList()
const { price } = useAppConfig()

// The hub leads with the one thing that works today, so the hero shows the finished sheet
// rather than describing it. The same example as on the Zurich page.
const sample = [sampleResult()]

const founder = computed(() => strings('founder.body'))
const soon = computed(() => PRODUCTS.filter((p) => p.status !== 'live'))

useHead({ title: '' })
useSocialImage('home')
</script>

<template>
  <div>
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <h1>{{ t('hub.title') }}</h1>
          <p class="lead">{{ t('hub.lead') }}</p>
          <div class="hero-actions">
            <NuxtLink :to="localePath('/ch/zurich/calculator')" class="btn btn-primary">
              {{ t('hub.cta') }}
            </NuxtLink>
            <NuxtLink :to="{ path: localePath('/'), hash: '#choose' }" class="btn btn-quiet">
              {{ t('hub.secondary') }}
            </NuxtLink>
          </div>
          <p class="hero-note">{{ t('hub.ctaNote', { price }) }}</p>
          <p class="hero-note quiet">{{ t('hub.liveNote') }}</p>
        </div>

        <figure class="hero-sheet">
          <FormSheet :results="sample" :year="2025" notes animate />
          <figcaption>{{ t('zh.sheet.caption') }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="section deadlines-section" aria-labelledby="deadlines-title">
      <div class="wrap deadlines-grid">
        <div>
          <h2 id="deadlines-title">{{ t('deadlines.title') }}</h2>
          <p class="deadlines-lead">{{ t('deadlines.lead') }}</p>
          <p class="deadlines-note">{{ t('deadlines.note') }}</p>
        </div>
        <DeadlineList />
      </div>
    </section>

    <section id="choose" class="section choose" aria-labelledby="choose-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="choose-title">{{ t('hub.chooseTitle') }}</h2>
          <p>{{ t('hub.chooseLead') }}</p>
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
            <DeadlineList :only="p.key" compact class="card-deadlines" />
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

    <section class="section both" aria-labelledby="both-title">
      <div class="wrap both-grid">
        <h2 id="both-title">{{ t('hub.bothTitle') }}</h2>
        <div>
          <p>{{ t('hub.bothBody') }}</p>
          <ul class="both-links">
            <li v-for="p in soon" :key="p.key">
              <NuxtLink :to="localePath(p.path)">{{ t(`products.${p.key}.name`) }}</NuxtLink>
              <span>{{ t(`products.${p.key}.place`) }}</span>
            </li>
          </ul>
        </div>
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
  padding-block: clamp(2.5rem, 1.5rem + 4vw, 5rem) clamp(2rem, 1rem + 3vw, 3.5rem);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  gap: clamp(2rem, 1rem + 4vw, 4.5rem);
  align-items: center;
}

.hero h1 {
  max-width: 20ch;
}

.hero .lead {
  margin-top: 1.5rem;
  max-width: 34rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.hero-note {
  margin-top: 1rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
  max-width: 34rem;
}

.hero-note.quiet {
  margin-top: 0.35rem;
  opacity: 0.8;
}

.hero-sheet {
  margin: 0;
}

.hero-sheet figcaption {
  margin-top: 0.85rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
  text-align: center;
}

.deadlines-section {
  padding-block: clamp(2rem, 1rem + 3vw, 3.5rem);
  background: var(--field);
}

.deadlines-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: clamp(1.5rem, 1rem + 3vw, 4rem);
  align-items: start;
}

.deadlines-lead {
  margin-top: 1rem;
  color: var(--ink-soft);
  max-width: 34rem;
}

.deadlines-note {
  margin-top: 0.75rem;
  font-size: var(--step--1);
  color: var(--ink-soft);
  max-width: 34rem;
}

.choose {
  padding-top: clamp(2.5rem, 1.5rem + 3vw, 4rem);
}

.products {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr;
  gap: clamp(1rem, 0.5rem + 1.5vw, 1.75rem);
  align-items: stretch;
  margin-top: 2rem;
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

.card-deadlines {
  margin-top: 1rem;
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

.both-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin-top: 1.25rem;
  font-size: var(--step--1);
}

.both-links li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.both-links span {
  color: var(--ink-soft);
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
  .hero-grid,
  .deadlines-grid,
  .products,
  .need-grid,
  .both-grid,
  .founder-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero h1 {
    max-width: none;
  }
}
</style>
