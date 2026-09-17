<script setup lang="ts">
const { t } = useI18n()
const { strings } = useList()

useHead({ title: () => t('meta.legalTitle') })

const privacy = computed(() => strings('legal.privacy'))
const email = useAppConfig().contactEmail
</script>

<template>
  <div class="wrap page">
    <h1>{{ t('legal.title') }}</h1>

    <section>
      <h2>{{ t('legal.disclaimerTitle') }}</h2>
      <p>{{ t('legal.disclaimer') }}</p>
    </section>

    <section>
      <h2>{{ t('legal.privacyTitle') }}</h2>
      <p v-for="(p, i) in privacy" :key="i">{{ p }}</p>
    </section>

    <section>
      <h2>{{ t('legal.contactTitle') }}</h2>
      <p>{{ t('legal.contactBody') }}</p>
      <p>
        {{ t('legal.contactEmail') }}:
        <a :href="`mailto:${email}`">{{ email }}</a>
      </p>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(2.5rem, 1rem + 4vw, 5rem);
  max-width: 50rem;
}

h1 {
  font-size: var(--step-3);
  letter-spacing: -0.02em;
  margin-bottom: 2.5rem;
}

section {
  padding-block: 1.75rem;
  border-top: 1px solid var(--rule);
  display: grid;
  gap: 0.9rem;
}

h2 {
  font-size: var(--step-1);
}

p {
  color: var(--ink-soft);
  max-width: var(--measure);
}
</style>
