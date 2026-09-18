<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { strings } = useList()
const { year, properties, household, results, summary, remark, hasResult, load, persist, add, remove, reset } =
  useDeclaration()

useHead({ title: () => t('zh.meta.calcTitle') })
useSocialImage('ch-zurich')

const { track } = useAnalytics()

// Properties that were already complete when the page opened (restored from this browser)
// are not news; only count what gets completed during this visit.
const counted = new Set<string>()
let started = false
let ready = false

onMounted(async () => {
  load()
  for (const r of results.value) if (r.complete) counted.add(r.input.id)
  // Restoring saved entries changes the form too; start listening only after that settled.
  await nextTick()
  ready = true
})

watch([year, properties, household], persist, { deep: true })

watch(
  [properties, household],
  () => {
    if (!ready) return
    if (!started) {
      started = true
      track('calculator_started')
    }
    for (const r of results.value) {
      if (!r.complete || counted.has(r.input.id)) continue
      counted.add(r.input.id)
      // Coarse facts only. Never amounts, the municipality or the street.
      track('property_completed', {
        country: 'switzerland',
        kind: r.input.kind,
        usage: r.input.usage,
        properties: counted.size,
      })
    }
  },
  { deep: true },
)

const nextSteps = computed(() => strings('zh.calc.result.next'))
const assumptions = computed(() => strings('zh.calc.result.assumptions'))

// Where each rule comes from. Official names stay in German; what the source covers is translated.
const SOURCES = [
  {
    name: 'Wegleitung zur Steuererklärung 2024, Kanton Zürich',
    url: 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/steuern-finanzen/steuern/natuerlichepersonen/2024/est-wegleitungen/305_Wegleitung_ZH_2024_HA%20bf%20DEF.pdf',
  },
  { name: 'Art. 4 Abs. 1 lit. c DBG', url: 'https://www.fedlex.admin.ch/eli/cc/1991/1184_1184_1184/de#art_4' },
  { name: 'Art. 7 Abs. 1 DBG', url: 'https://www.fedlex.admin.ch/eli/cc/1991/1184_1184_1184/de#art_7' },
]

const USAGES = ['self', 'family', 'rented'] as const
const usages = computed(() =>
  USAGES.map((value) => {
    const key = value.charAt(0).toUpperCase() + value.slice(1)
    return {
      value,
      title: t(`zh.calc.fields.usage${key}`),
      hint: t(`zh.calc.fields.usage${key}Hint`),
    }
  }),
)

const years = computed(() => TAX_YEARS.map((y) => ({ value: y, label: String(y) })))
const kinds = computed(() => [
  { value: 'apartment', label: t('zh.calc.fields.apartment') },
  { value: 'house', label: t('zh.calc.fields.house') },
])
const upkeep = computed(() => [
  { value: 'flat', label: t('zh.calc.fields.maintenanceFlat') },
  { value: 'actual', label: t('zh.calc.fields.maintenanceActual') },
])

const chf = (value: number) => formatChf(value)
// One decimal is enough to recognise your own quota, and it matches the German note.
const quotaText = computed(() =>
  summary.value.quota === null ? '' : `${(summary.value.quota * 100).toFixed(1).replace('.0', '')}%`,
)

const copied = ref(false)
async function copyRemark() {
  try {
    await navigator.clipboard.writeText(remark.value)
    copied.value = true
    track('note_copied')
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard blocked: the text stays selectable on the page.
  }
}

function printSheet() {
  track('sheet_printed', { properties: results.value.filter((r) => r.complete).length })
  window.print()
}

function confirmReset() {
  if (window.confirm(t('zh.calc.result.resetConfirm'))) reset()
}
</script>

<template>
  <div class="wrap pt-8 sm:pt-12">
    <header class="no-print mb-8 sm:mb-12">
      <h1 class="text-3xl">{{ t('zh.calc.title') }}</h1>
      <p class="lead mt-3">{{ t('zh.calc.lead') }}</p>
    </header>

    <div class="layout grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
      <form class="no-print min-w-0" @submit.prevent>
        <UiCard as="fieldset" class="mb-6 grid min-w-0 gap-5">
          <legend class="legend">{{ t('zh.calc.year.label') }}</legend>
          <UiSegmented v-model="year" :options="years" name="year" :label="t('zh.calc.year.label')" />
          <p class="-mt-2.5 text-2xs leading-snug text-ink-soft">{{ t('zh.calc.year.hint') }}</p>
        </UiCard>

        <UiCard v-for="(p, i) in properties" :key="p.id" as="fieldset" class="mb-6 grid min-w-0 gap-5">
          <legend class="legend">
            {{ t('zh.calc.property.heading', { n: i + 1 }) }}
            <button v-if="properties.length > 1" type="button" class="link-btn" @click="remove(p.id)">
              {{ t('zh.calc.property.remove') }}
            </button>
          </legend>

          <div class="grid gap-4 sm:grid-cols-2">
            <UiField :label="t('zh.calc.fields.municipality')" :hint="t('zh.calc.fields.municipalityHint')">
              <input
                v-model="p.municipality"
                type="text"
                autocomplete="off"
                class="ui-control font-medium"
                :placeholder="t('zh.calc.fields.municipalityPlaceholder')"
              />
            </UiField>
            <UiField :label="t('zh.calc.fields.street')" :hint="t('zh.calc.fields.streetHint')">
              <input v-model="p.street" type="text" autocomplete="off" class="ui-control font-medium" />
            </UiField>
          </div>

          <div class="grid items-end gap-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <UiField :label="t('zh.calc.fields.type')" :label-id="`kind-${p.id}`">
              <UiSegmented v-model="p.kind" :options="kinds" :name="`kind-${p.id}`" :labelledby="`kind-${p.id}`" />
            </UiField>
            <UiField :label="t('zh.calc.fields.area')">
              <input v-model.number="p.area" type="number" inputmode="decimal" min="0" step="1" class="ui-control num font-medium" />
            </UiField>
            <UiField :label="t('zh.calc.fields.share')">
              <input v-model.number="p.share" type="number" inputmode="decimal" min="1" max="100" step="1" class="ui-control num font-medium" />
            </UiField>
          </div>
          <p class="-mt-2.5 text-2xs leading-snug text-ink-soft">{{ t('zh.calc.fields.shareHint') }}</p>

          <UiField :label="t('zh.calc.fields.taxValue')" :hint="t('zh.calc.fields.taxValueHint')">
            <input v-model.number="p.taxValue" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
          </UiField>

          <UiField :label="t('zh.calc.fields.usage')" :label-id="`usage-${p.id}`">
            <UiChoiceGroup v-model="p.usage" :options="usages" :name="`usage-${p.id}`" :labelledby="`usage-${p.id}`" />
          </UiField>

          <UiField
            v-if="p.usage === 'rented'"
            :label="t('zh.calc.fields.rent')"
            :hint="t('zh.calc.fields.rentHint')"
          >
            <input v-model.number="p.rent" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
          </UiField>
          <UiField v-else :label="t('zh.calc.fields.eigenmietwert')" :hint="t('zh.calc.fields.eigenmietwertHint')">
            <input v-model.number="p.eigenmietwert" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
          </UiField>

          <UiField
            :label="t('zh.calc.fields.maintenance')"
            :label-id="`upkeep-${p.id}`"
            :hint="t('zh.calc.fields.maintenanceHint')"
          >
            <UiSegmented
              v-model="p.maintenanceBasis"
              :options="upkeep"
              :name="`upkeep-${p.id}`"
              :labelledby="`upkeep-${p.id}`"
            />
          </UiField>
          <UiField v-if="p.maintenanceBasis === 'actual'" :label="t('zh.calc.fields.maintenanceAmount')">
            <input v-model.number="p.maintenanceActual" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
          </UiField>
        </UiCard>

        <UiCard as="fieldset" class="mb-6 grid min-w-0 gap-5">
          <legend class="legend">{{ t('zh.calc.world.title') }}</legend>
          <p class="-mt-1 text-xs leading-snug text-ink-soft">{{ t('zh.calc.world.lead') }}</p>

          <div class="grid gap-4 sm:grid-cols-2">
            <UiField :label="t('zh.calc.world.assets')" :hint="t('zh.calc.world.assetsHint')">
              <input v-model.number="household.worldAssets" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
            </UiField>
            <UiField :label="t('zh.calc.world.income')" :hint="t('zh.calc.world.incomeHint')">
              <input v-model.number="household.worldIncome" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
            </UiField>
            <UiField :label="t('zh.calc.world.debt')" :hint="t('zh.calc.world.debtHint')">
              <input v-model.number="household.debt" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
            </UiField>
            <UiField :label="t('zh.calc.world.interest')" :hint="t('zh.calc.world.interestHint')">
              <input v-model.number="household.interest" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
            </UiField>
          </div>
        </UiCard>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <UiButton @click="add"><span aria-hidden="true">+</span> {{ t('zh.calc.property.add') }}</UiButton>
          <button type="button" class="link-btn" @click="confirmReset">{{ t('zh.calc.result.reset') }}</button>
        </div>
        <p class="mt-4 text-2xs leading-snug text-ink-soft">{{ t('zh.calc.privacy') }}</p>
      </form>

      <aside class="output min-w-0" aria-live="polite">
        <h2 class="mb-4 text-lg">{{ t('zh.calc.result.title') }}</h2>
        <FormSheet :results="results" :year="year" />

        <div v-if="hasResult" class="mt-5 rounded-md border border-rule bg-surface p-4.5">
          <h3 class="text-xs font-semibold">{{ t('zh.calc.result.summaryTitle') }}</h3>
          <dl class="mt-3 grid gap-2 text-xs">
            <div class="flex justify-between gap-4">
              <dt>{{ t('zh.calc.result.taxableIncome') }}</dt>
              <dd class="num font-semibold">{{ chf(summary.taxableIncome) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt>{{ t('zh.calc.result.taxableWealth') }}</dt>
              <dd class="num font-semibold">{{ chf(summary.taxableWealth) }}</dd>
            </div>
          </dl>

          <dl v-if="summary.quota !== null" class="mt-3 grid gap-2 border-t border-rule-soft pt-3 text-xs text-ink-soft">
            <div class="flex justify-between gap-4">
              <dt>{{ t('zh.calc.result.quota') }}</dt>
              <dd class="num">{{ quotaText }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt>{{ t('zh.calc.result.deductibleInterest') }}</dt>
              <dd class="num">{{ chf(summary.deductibleInterest) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt>{{ t('zh.calc.result.deductibleDebt') }}</dt>
              <dd class="num">{{ chf(summary.deductibleDebt) }}</dd>
            </div>
            <p class="text-2xs leading-snug">{{ t('zh.calc.result.quotaHint') }}</p>
          </dl>
          <p v-else class="mt-3 border-t border-rule-soft pt-3 text-2xs leading-snug text-warn">
            {{ t('zh.calc.result.quotaMissing') }}
          </p>

          <template v-if="summary.rateIncome !== null || summary.rateWealth !== null">
            <h3 class="mt-4 text-xs font-semibold">{{ t('zh.calc.result.rateTitle') }}</h3>
            <dl class="mt-3 grid gap-2 text-xs text-ink-soft">
              <div v-if="summary.rateIncome !== null" class="flex justify-between gap-4">
                <dt>{{ t('zh.calc.result.rateIncome') }}</dt>
                <dd class="num">{{ chf(summary.rateIncome) }}</dd>
              </div>
              <div v-if="summary.rateWealth !== null" class="flex justify-between gap-4">
                <dt>{{ t('zh.calc.result.rateWealth') }}</dt>
                <dd class="num">{{ chf(summary.rateWealth) }}</dd>
              </div>
              <p class="text-2xs leading-snug">{{ t('zh.calc.result.rateHint') }}</p>
            </dl>
          </template>
        </div>

        <p
          v-if="hasResult"
          class="mt-4 rounded-r-md border-l-[3px] border-ok bg-ok-tint px-4 py-3 text-xs font-medium"
        >
          {{ t('zh.calc.result.notTaxed') }}
        </p>
      </aside>
    </div>

    <div
      v-if="hasResult"
      class="followup mt-10 grid gap-8 border-t border-rule pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
    >
      <section>
        <div class="mb-2.5 flex items-center justify-between gap-4">
          <h2 class="text-lg">{{ t('zh.calc.result.remarkTitle') }}</h2>
          <UiButton size="sm" class="no-print" @click="copyRemark">
            {{ copied ? t('zh.calc.result.copied') : t('zh.calc.result.copy') }}
          </UiButton>
        </div>
        <p
          lang="de"
          class="rounded-md border border-rule border-l-4 border-l-blue-deep bg-surface px-4.5 py-4 text-[0.9375rem] leading-normal whitespace-pre-line select-all"
        >
          {{ remark }}
        </p>
        <p class="no-print mt-2 text-2xs leading-snug text-ink-soft">{{ t('zh.calc.result.remarkHint') }}</p>
      </section>

      <section class="after">
        <h2 class="text-lg">{{ t('zh.calc.result.nextTitle') }}</h2>
        <ol class="mt-4 mb-7 grid gap-2.5 [counter-reset:next]">
          <li v-for="(s, i) in nextSteps" :key="i" class="relative pl-8 [counter-increment:next]">{{ s }}</li>
        </ol>
        <div class="no-print flex flex-wrap items-center gap-x-6 gap-y-4">
          <UiButton variant="primary" @click="printSheet">{{ t('zh.calc.result.print') }}</UiButton>
          <NuxtLink :to="localePath('/switzerland/guide')">{{ t('zh.calc.result.guideLink') }}</NuxtLink>
        </div>
      </section>
    </div>

    <!-- Where the value has just been delivered is the only place asking for an address is
         not an interruption. -->
    <ReminderForm v-if="hasResult" product="switzerland" class="no-print mt-10" />

    <details class="assumptions mt-10 border-t border-rule pt-4 text-xs">
      <summary class="cursor-pointer font-semibold">{{ t('zh.calc.result.assumptionsTitle') }}</summary>
      <ul class="mt-3 grid list-disc gap-2 pl-4.5 text-ink-soft">
        <li v-for="(a, i) in assumptions" :key="i">{{ a }}</li>
      </ul>
      <h3 class="mt-5 text-xs font-semibold">{{ t('zh.calc.sources.title') }}</h3>
      <ul class="mt-3 grid gap-2 pl-0 text-ink-soft">
        <li v-for="(src, i) in SOURCES" :key="i" class="grid gap-0.5">
          <a :href="src.url" target="_blank" rel="noopener" lang="de">{{ src.name }}</a>
          <span>{{ t(`zh.calc.sources.items[${i}]`) }}</span>
        </li>
      </ul>
    </details>

    <p class="print-only mt-6 text-ink-soft">{{ t('footer.disclaimer') }}</p>
  </div>
</template>

<style scoped>
/* A legend cannot be a grid item, so it is floated out of the card's own grid. */
.legend {
  float: left;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.legend + * {
  clear: both;
}

/* A destructive action that is not a button shape: removing a property, starting over. */
.link-btn {
  padding: 0.25rem 0;
  background: none;
  border: 0;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-ink-soft);
  text-decoration: underline;
  text-underline-offset: 0.18em;
  cursor: pointer;
}

.link-btn:hover {
  color: var(--color-warn);
}

/* The numbered next steps, with the number in a small filled square. */
.after li::before {
  content: counter(next);
  position: absolute;
  left: 0;
  top: 0.05rem;
  display: grid;
  place-items: center;
  width: 1.3rem;
  height: 1.3rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-field-strong);
  color: var(--color-blue-deep);
  border-radius: 2px;
}

/* The sheet follows the form down the page when the window is tall enough to hold it. */
@media (min-height: 50rem) and (width >= 64rem) {
  .output {
    position: sticky;
    top: 5.5rem;
  }
}

.print-only {
  display: none;
}

@media print {
  .layout,
  .followup {
    display: block;
  }

  .output {
    position: static;
  }

  .after {
    margin-top: 1.5rem;
  }

  .assumptions {
    display: block;
  }

  .print-only {
    display: block;
    font-size: 8.5pt;
    color: #444;
  }
}
</style>
