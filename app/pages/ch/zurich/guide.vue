<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings, objects } = useList()

useHead({ title: () => t('zh.meta.guideTitle') })
useSocialImage('ch-zurich')

const steps = computed(() => objects('zh.guide.steps', ['title', 'body']))
const docs = computed(() => strings('zh.guide.docs'))

// German terms are fixed; only the explanation is translated.
const terms = [
  { key: 'liegenschaftenverzeichnis', de: 'Liegenschaftenverzeichnis' },
  { key: 'eigenmietwert', de: 'Eigenmietwert' },
  { key: 'steuerwert', de: 'Steuerwert' },
  { key: 'pauschalabzug', de: 'Pauschalabzug' },
  { key: 'satzbestimmend', de: 'satzbestimmend' },
  { key: 'steuerausscheidung', de: 'Steuerausscheidung' },
  { key: 'quellensteuer', de: 'Quellensteuer' },
  { key: 'schutzstatus', de: 'Schutzstatus S' },
  { key: 'gemeindesteueramt', de: 'Gemeindesteueramt' },
  { key: 'fristerstreckung', de: 'Fristerstreckung' },
  { key: 'bemerkungen', de: 'Bemerkungen' },
  { key: 'selbstanzeige', de: 'Straflose Selbstanzeige' },
]
</script>

<template>
  <div class="wrap pt-10 sm:pt-16">
    <header class="mb-10 max-w-[48rem] sm:mb-16">
      <h1 class="text-3xl">{{ t('zh.guide.title') }}</h1>
      <p class="lead mt-4">{{ t('zh.guide.lead') }}</p>
    </header>

    <div class="grid items-start gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
      <div>
        <section aria-labelledby="steps-title">
          <h2 id="steps-title" class="mb-7 text-2xl">{{ t('zh.guide.stepsTitle') }}</h2>
          <UiSteps :items="steps" />
        </section>

        <section class="mt-14 mb-10" aria-labelledby="docs-title">
          <h2 id="docs-title" class="mb-7 text-2xl">{{ t('zh.guide.docsTitle') }}</h2>
          <ul class="grid gap-3">
            <li v-for="(d, i) in docs" :key="i" class="box relative max-w-[60ch] pl-8">{{ d }}</li>
          </ul>
        </section>

        <UiButton :to="localePath('/ch/zurich/calculator')" variant="primary">{{ t('zh.guide.cta') }}</UiButton>
      </div>

      <UiCard as="aside" aria-labelledby="glossary-title" class="lg:sticky lg:top-22">
        <h2 id="glossary-title" class="mb-4 text-lg">{{ t('zh.guide.glossaryTitle') }}</h2>
        <dl class="m-0">
          <div v-for="term in terms" :key="term.key" class="border-t border-dashed border-rule py-3.5">
            <dt lang="de" class="marked inline font-semibold [overflow-wrap:anywhere]">{{ term.de }}</dt>
            <dd class="mt-1.5 mb-0 ml-0 text-xs text-ink-soft">{{ t(`zh.guide.glossary.${term.key}`) }}</dd>
          </div>
        </dl>
      </UiCard>
    </div>
  </div>
</template>

<style scoped>
/* An empty checkbox, so the list of documents looks like something to tick off. */
.box::before {
  content: '';
  position: absolute;
  left: 0.1rem;
  top: 0.3em;
  width: 1rem;
  height: 1rem;
  border: 1.5px solid var(--color-ink-soft);
  border-radius: 2px;
  background: var(--color-surface);
}

/* A highlighter stroke through the German term, not a solid block behind it. */
.marked {
  background: linear-gradient(
    transparent 58%,
    var(--color-marker) 58%,
    var(--color-marker) 92%,
    transparent 92%
  );
}
</style>
