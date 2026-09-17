<script setup lang="ts">
import type { Currency, PropertyInput } from '~/composables/useDeclaration'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { strings } = useList()
const { year, properties, results, remark, hasResult, load, persist, add, remove, reset } = useDeclaration()

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

watch([year, properties], persist, { deep: true })

watch(
  properties,
  () => {
    if (!ready) return
    if (!started) {
      started = true
      track('calculator_started')
    }
    for (const r of results.value) {
      if (!r.complete || counted.has(r.input.id)) continue
      counted.add(r.input.id)
      // Coarse facts only. Never amounts, city, street or the free-text country name.
      track('property_completed', {
        country: r.input.country,
        kind: r.input.kind,
        usage: r.input.usage,
        currency: r.input.currency,
        properties: counted.size,
      })
    }
  },
  { deep: true },
)

const nextSteps = computed(() => strings('zh.calc.result.next'))
const assumptions = computed(() => strings('zh.calc.result.assumptions'))

// Sorted by the name the visitor sees, so the list is alphabetical in every language.
const countries = computed(() =>
  COUNTRIES.map((code) => ({ code, name: countryName(code, locale.value) })).sort((a, b) =>
    a.name.localeCompare(b.name, locale.value),
  ),
)

// Where each rule comes from. Official names stay in German; what the source covers is translated.
const SOURCES = [
  {
    name: 'Wegleitung zur Steuererklärung 2024, Kanton Zürich',
    url: 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/steuern-finanzen/steuern/natuerlichepersonen/2024/est-wegleitungen/305_Wegleitung_ZH_2024_HA%20bf%20DEF.pdf',
  },
  { name: 'Art. 6 Abs. 1 DBG', url: 'https://www.fedlex.admin.ch/eli/cc/1991/1184_1184_1184/de#art_6' },
  { name: 'Kurslisten der ESTV (ICTax)', url: 'https://www.ictax.admin.ch/extern/de.html#/ratelist' },
  {
    name: 'Findea: Eigenmietwert einer ausländischen Liegenschaft',
    url: 'https://blog.findea.ch/de-blog/eigenmietwert-einer-auslandischen-liegenschaft',
  },
]

const USAGES = ['self', 'family', 'rented', 'unusable'] as const
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
const bases = computed(() => [
  { value: 'purchase', label: t('zh.calc.fields.basisPurchase') },
  { value: 'market', label: t('zh.calc.fields.basisMarket') },
])

function onCurrencyChange(p: PropertyInput, currency: Currency) {
  p.currency = currency
  p.rate = APPROX_RATES[currency]
  p.rentRate = APPROX_AVERAGE_RATES[currency]
}

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
            <UiField :label="t('zh.calc.fields.country')">
              <select v-model="p.country" class="ui-control num font-medium">
                <!-- Selectable, not disabled: a browser refuses to show a disabled option as the
                     current one, so the list opened on the first country while the model was still
                     empty and the sheet stayed blank. -->
                <option value="">{{ t('zh.calc.fields.countryPlaceholder') }}</option>
                <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.name }}</option>
                <option value="other">{{ t('zh.calc.fields.countryOther') }}</option>
              </select>
            </UiField>
            <UiField :label="t('zh.calc.fields.city')">
              <input
                v-model="p.city"
                type="text"
                autocomplete="off"
                class="ui-control font-medium"
                :placeholder="t('zh.calc.fields.cityPlaceholder')"
              />
            </UiField>
          </div>

          <UiField v-if="p.country === 'other'" :label="t('zh.calc.fields.countryOtherLabel')">
            <input v-model="p.countryName" type="text" autocomplete="off" class="ui-control font-medium" />
          </UiField>

          <UiField :label="t('zh.calc.fields.street')" :hint="t('zh.calc.fields.streetHint')">
            <input v-model="p.street" type="text" autocomplete="off" class="ui-control font-medium" />
          </UiField>

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

          <UiField :label="t('zh.calc.fields.basis')" :label-id="`basis-${p.id}`" :hint="t('zh.calc.fields.basisHint')">
            <UiSegmented v-model="p.basis" :options="bases" :name="`basis-${p.id}`" :labelledby="`basis-${p.id}`" />
          </UiField>

          <div class="grid items-end gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(5.5rem,0.6fr)_minmax(0,1fr)]">
            <UiField :label="t('zh.calc.fields.amount')">
              <input v-model.number="p.amount" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
            </UiField>
            <UiField :label="t('zh.calc.fields.currency')">
              <select
                :value="p.currency"
                class="ui-control num font-medium"
                @change="onCurrencyChange(p, ($event.target as HTMLSelectElement).value as Currency)"
              >
                <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
              </select>
            </UiField>
            <UiField v-if="p.currency !== 'CHF'" :label="t('zh.calc.fields.rate', { currency: p.currency })">
              <input v-model.number="p.rate" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
            </UiField>
          </div>
          <p v-if="p.currency !== 'CHF'" class="-mt-2.5 text-2xs leading-snug text-ink-soft">
            {{ t('zh.calc.fields.rateHint') }}
            <a href="https://www.ictax.admin.ch/extern/de.html#/ratelist" target="_blank" rel="noopener">
              {{ t('zh.calc.fields.rateLink') }}
            </a>
          </p>

          <UiField :label="t('zh.calc.fields.usage')" :label-id="`usage-${p.id}`">
            <UiChoiceGroup v-model="p.usage" :options="usages" :name="`usage-${p.id}`" :labelledby="`usage-${p.id}`" />
          </UiField>

          <div v-if="p.usage === 'rented'" class="grid gap-4 sm:grid-cols-2">
            <UiField :label="`${t('zh.calc.fields.rent')} (${p.currency})`" :hint="t('zh.calc.fields.rentHint')">
              <input v-model.number="p.rent" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
            </UiField>
            <UiField
              v-if="p.currency !== 'CHF'"
              :label="t('zh.calc.fields.rentRate', { currency: p.currency })"
              :hint="t('zh.calc.fields.rentRateHint')"
            >
              <input v-model.number="p.rentRate" type="number" inputmode="decimal" min="0" step="any" class="ui-control num font-medium" />
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
          <NuxtLink :to="localePath('/ch/zurich/guide')">{{ t('zh.calc.result.guideLink') }}</NuxtLink>
        </div>
      </section>
    </div>

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
