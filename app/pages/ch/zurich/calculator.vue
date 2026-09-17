<script setup lang="ts">
import type { Currency, PropertyInput } from '~/composables/useDeclaration'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { strings } = useList()
const { year, properties, results, remark, hasResult, load, persist, add, remove, reset } = useDeclaration()

useHead({ title: () => t('zh.meta.calcTitle') })

onMounted(load)
watch([year, properties], persist, { deep: true })

const nextSteps = computed(() => strings('zh.calc.result.next'))
const assumptions = computed(() => strings('zh.calc.result.assumptions'))

// Sorted by the name the visitor sees, so the list is alphabetical in every language.
const countries = computed(() =>
  COUNTRIES.map((code) => ({ code, name: countryName(code, locale.value) })).sort((a, b) =>
    a.name.localeCompare(b.name, locale.value),
  ),
)

const usages = [
  { value: 'self', label: 'usageSelf', hint: 'usageSelfHint' },
  { value: 'family', label: 'usageFamily', hint: 'usageFamilyHint' },
  { value: 'rented', label: 'usageRented', hint: 'usageRentedHint' },
  { value: 'unusable', label: 'usageUnusable', hint: 'usageUnusableHint' },
] as const

function onCurrencyChange(p: PropertyInput, currency: Currency) {
  p.currency = currency
  p.rate = APPROX_RATES[currency]
}

const copied = ref(false)
async function copyRemark() {
  try {
    await navigator.clipboard.writeText(remark.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard blocked: the text stays selectable on the page.
  }
}

function printSheet() {
  window.print()
}

function confirmReset() {
  if (window.confirm(t('zh.calc.result.resetConfirm'))) reset()
}
</script>

<template>
  <div class="wrap page">
    <header class="page-head no-print">
      <h1>{{ t('zh.calc.title') }}</h1>
      <p class="lead">{{ t('zh.calc.lead') }}</p>
    </header>

    <div class="layout">
      <form class="inputs no-print" @submit.prevent>
        <fieldset class="block">
          <legend>{{ t('zh.calc.year.label') }}</legend>
          <div class="segmented" role="radiogroup" :aria-label="t('zh.calc.year.label')">
            <label v-for="y in TAX_YEARS" :key="y">
              <input v-model="year" type="radio" name="year" :value="y" />
              <span class="num">{{ y }}</span>
            </label>
          </div>
          <p class="hint">{{ t('zh.calc.year.hint') }}</p>
        </fieldset>

        <fieldset v-for="(p, i) in properties" :key="p.id" class="block">
          <legend>
            {{ t('zh.calc.property.heading', { n: i + 1 }) }}
            <button v-if="properties.length > 1" type="button" class="link-btn" @click="remove(p.id)">
              {{ t('zh.calc.property.remove') }}
            </button>
          </legend>

          <div class="row row--2">
            <label class="field">
              <span>{{ t('zh.calc.fields.country') }}</span>
              <select v-model="p.country">
                <option value="" disabled>{{ t('zh.calc.fields.countryPlaceholder') }}</option>
                <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.name }}</option>
                <option value="other">{{ t('zh.calc.fields.countryOther') }}</option>
              </select>
            </label>
            <label class="field">
              <span>{{ t('zh.calc.fields.city') }}</span>
              <input v-model="p.city" type="text" autocomplete="off" :placeholder="t('zh.calc.fields.cityPlaceholder')" />
            </label>
          </div>

          <label v-if="p.country === 'other'" class="field">
            <span>{{ t('zh.calc.fields.countryOtherLabel') }}</span>
            <input v-model="p.countryName" type="text" autocomplete="off" />
          </label>

          <label class="field">
            <span>{{ t('zh.calc.fields.street') }}</span>
            <input v-model="p.street" type="text" autocomplete="off" />
            <small>{{ t('zh.calc.fields.streetHint') }}</small>
          </label>

          <div class="row row--3">
            <div class="field">
              <span :id="`kind-${p.id}`">{{ t('zh.calc.fields.type') }}</span>
              <div class="segmented" role="radiogroup" :aria-labelledby="`kind-${p.id}`">
                <label>
                  <input v-model="p.kind" type="radio" :name="`kind-${p.id}`" value="apartment" />
                  <span>{{ t('zh.calc.fields.apartment') }}</span>
                </label>
                <label>
                  <input v-model="p.kind" type="radio" :name="`kind-${p.id}`" value="house" />
                  <span>{{ t('zh.calc.fields.house') }}</span>
                </label>
              </div>
            </div>
            <label class="field">
              <span>{{ t('zh.calc.fields.area') }}</span>
              <input v-model.number="p.area" type="number" inputmode="decimal" min="0" step="1" />
            </label>
            <label class="field">
              <span>{{ t('zh.calc.fields.share') }}</span>
              <input v-model.number="p.share" type="number" inputmode="decimal" min="1" max="100" step="1" />
            </label>
          </div>
          <p class="hint">{{ t('zh.calc.fields.shareHint') }}</p>

          <div class="field">
            <span :id="`basis-${p.id}`">{{ t('zh.calc.fields.basis') }}</span>
            <div class="segmented" role="radiogroup" :aria-labelledby="`basis-${p.id}`">
              <label>
                <input v-model="p.basis" type="radio" :name="`basis-${p.id}`" value="purchase" />
                <span>{{ t('zh.calc.fields.basisPurchase') }}</span>
              </label>
              <label>
                <input v-model="p.basis" type="radio" :name="`basis-${p.id}`" value="market" />
                <span>{{ t('zh.calc.fields.basisMarket') }}</span>
              </label>
            </div>
            <small>{{ t('zh.calc.fields.basisHint') }}</small>
          </div>

          <div class="row row--money">
            <label class="field">
              <span>{{ t('zh.calc.fields.amount') }}</span>
              <input v-model.number="p.amount" type="number" inputmode="decimal" min="0" step="any" />
            </label>
            <label class="field">
              <span>{{ t('zh.calc.fields.currency') }}</span>
              <select :value="p.currency" @change="onCurrencyChange(p, ($event.target as HTMLSelectElement).value as Currency)">
                <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
              </select>
            </label>
            <label v-if="p.currency !== 'CHF'" class="field">
              <span>{{ t('zh.calc.fields.rate', { currency: p.currency }) }}</span>
              <input v-model.number="p.rate" type="number" inputmode="decimal" min="0" step="any" />
            </label>
          </div>
          <p v-if="p.currency !== 'CHF'" class="hint">
            {{ t('zh.calc.fields.rateHint') }}
            <a href="https://www.ictax.admin.ch/extern/de.html#/ratelist" target="_blank" rel="noopener">{{ t('zh.calc.fields.rateLink') }}</a>
          </p>

          <div class="field">
            <span :id="`usage-${p.id}`">{{ t('zh.calc.fields.usage') }}</span>
            <div class="choices" role="radiogroup" :aria-labelledby="`usage-${p.id}`">
              <label v-for="u in usages" :key="u.value" class="choice">
                <input v-model="p.usage" type="radio" :name="`usage-${p.id}`" :value="u.value" />
                <span>
                  <strong>{{ t(`zh.calc.fields.${u.label}`) }}</strong>
                  <small>{{ t(`zh.calc.fields.${u.hint}`) }}</small>
                </span>
              </label>
            </div>
          </div>

          <label v-if="p.usage === 'rented'" class="field">
            <span>{{ t('zh.calc.fields.rent') }} ({{ p.currency }})</span>
            <input v-model.number="p.rent" type="number" inputmode="decimal" min="0" step="any" />
            <small>{{ t('zh.calc.fields.rentHint') }}</small>
          </label>
        </fieldset>

        <div class="form-actions">
          <button type="button" class="btn btn-quiet" @click="add">
            <span aria-hidden="true">+</span> {{ t('zh.calc.property.add') }}
          </button>
          <button type="button" class="link-btn" @click="confirmReset">{{ t('zh.calc.result.reset') }}</button>
        </div>
        <p class="hint privacy">{{ t('zh.calc.privacy') }}</p>
      </form>

      <aside class="output" aria-live="polite">
        <h2 class="output-title">{{ t('zh.calc.result.title') }}</h2>
        <FormSheet :results="results" :year="year" />
        <p v-if="hasResult" class="not-taxed">{{ t('zh.calc.result.notTaxed') }}</p>
      </aside>
    </div>

    <div v-if="hasResult" class="followup">
      <section class="remark">
        <div class="remark-head">
          <h2>{{ t('zh.calc.result.remarkTitle') }}</h2>
          <button type="button" class="btn btn-quiet btn-small no-print" @click="copyRemark">
            {{ copied ? t('zh.calc.result.copied') : t('zh.calc.result.copy') }}
          </button>
        </div>
        <p class="remark-text" lang="de">{{ remark }}</p>
        <p class="hint no-print">{{ t('zh.calc.result.remarkHint') }}</p>
      </section>

      <section class="after">
        <h2>{{ t('zh.calc.result.nextTitle') }}</h2>
        <ol>
          <li v-for="(s, i) in nextSteps" :key="i">{{ s }}</li>
        </ol>
        <div class="after-actions no-print">
          <button type="button" class="btn btn-primary" @click="printSheet">{{ t('zh.calc.result.print') }}</button>
          <NuxtLink :to="localePath('/ch/zurich/guide')">{{ t('zh.calc.result.guideLink') }}</NuxtLink>
        </div>
      </section>
    </div>

    <details class="assumptions">
      <summary>{{ t('zh.calc.result.assumptionsTitle') }}</summary>
      <ul>
        <li v-for="(a, i) in assumptions" :key="i">{{ a }}</li>
      </ul>
    </details>

    <p class="print-only disclaimer">{{ t('footer.disclaimer') }}</p>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(2rem, 1rem + 3vw, 4rem);
}

.page-head {
  margin-bottom: clamp(2rem, 1rem + 3vw, 3.5rem);
}

.page-head h1 {
  font-size: var(--step-3);
  letter-spacing: -0.02em;
}

.page-head .lead {
  margin-top: 0.75rem;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: clamp(2rem, 1rem + 3vw, 4rem);
  align-items: start;
}

.output {
  min-width: 0;
}

@media (min-height: 50rem) {
  .output {
    position: sticky;
    top: 5.5rem;
  }
}

.output-title {
  font-size: var(--step-1);
  margin-bottom: 1rem;
}

/* Inputs */
.block {
  margin: 0 0 1.5rem;
  padding: clamp(1.1rem, 0.8rem + 1vw, 1.75rem);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  background: var(--surface);
  display: grid;
  gap: 1.25rem;
  min-width: 0;
}

legend {
  float: left;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0;
  font-size: var(--step-1);
  font-weight: 600;
  letter-spacing: -0.01em;
}

legend + * {
  clear: both;
}

.row {
  display: grid;
  gap: 1rem;
}

.row--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.row--3 {
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: end;
}

.row--money {
  grid-template-columns: minmax(0, 1.4fr) minmax(5.5rem, 0.6fr) minmax(0, 1fr);
  align-items: end;
}

.field {
  display: grid;
  align-content: start;
  gap: 0.4rem;
  min-width: 0;
}

.field > span {
  font-size: var(--step--1);
  font-weight: 500;
}

.field small,
.hint {
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--ink-soft);
}

.hint {
  margin-top: -0.6rem;
}

input[type='text'],
input[type='number'],
select {
  width: 100%;
  min-height: 2.9rem;
  padding: 0.5rem 0.75rem;
  background: var(--field);
  border: 0;
  border-bottom: 2px solid var(--field-strong);
  border-radius: 4px 4px 0 0;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

input::placeholder {
  color: color-mix(in srgb, var(--ink-soft) 60%, transparent);
  font-weight: 400;
}

input:hover,
select:hover {
  border-bottom-color: var(--blue);
}

input:focus-visible,
select:focus-visible {
  outline: 0;
  border-bottom-color: var(--blue-deep);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 30%, transparent);
  background: var(--surface);
}

.segmented {
  display: flex;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}

.segmented label {
  flex: 1;
  position: relative;
  min-width: 0;
}

.segmented input,
.choice input {
  position: absolute;
  opacity: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.segmented span {
  display: grid;
  place-items: center;
  min-height: 2.9rem;
  padding: 0.4rem 0.75rem;
  font-size: var(--step--1);
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  border-left: 1px solid var(--rule);
}

.segmented label:first-child span {
  border-left: 0;
}

.segmented input:checked + span {
  background: var(--ink);
  color: #fff;
}

.segmented input:focus-visible + span,
.choice input:focus-visible + span {
  outline: 3px solid var(--blue);
  outline-offset: -3px;
}

.choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.choice {
  position: relative;
  display: block;
}

.choice > span {
  display: grid;
  align-content: start;
  gap: 0.2rem;
  height: 100%;
  padding: 0.8rem 0.9rem 0.85rem 2.5rem;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  background: var(--surface);
  line-height: 1.3;
}

.choice > span::before {
  content: '';
  position: absolute;
  left: 0.9rem;
  top: 0.95rem;
  width: 1rem;
  height: 1rem;
  border: 1.5px solid var(--ink-soft);
  border-radius: 50%;
  background: var(--surface);
}

.choice strong {
  font-size: var(--step--1);
  font-weight: 600;
}

.choice input:checked + span {
  border-color: var(--blue-deep);
  background: var(--field);
  box-shadow: inset 0 0 0 1px var(--blue-deep);
}

.choice input:checked + span::before {
  border: 5px solid var(--blue-deep);
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.link-btn {
  padding: 0.25rem 0;
  background: none;
  border: 0;
  font-size: var(--step--1);
  font-weight: 500;
  color: var(--ink-soft);
  text-decoration: underline;
  text-underline-offset: 0.18em;
  cursor: pointer;
}

.link-btn:hover {
  color: var(--warn);
}

.privacy {
  margin-top: 1rem;
}

/* Output */
.not-taxed {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border-left: 3px solid var(--ok);
  background: color-mix(in srgb, var(--ok) 8%, white);
  border-radius: 0 var(--radius) var(--radius) 0;
  font-size: var(--step--1);
  font-weight: 500;
}

.followup {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: clamp(2rem, 1rem + 3vw, 4rem);
  margin-top: clamp(2.5rem, 1.5rem + 3vw, 4rem);
  padding-top: clamp(2rem, 1.5rem + 2vw, 3rem);
  border-top: 1px solid var(--rule);
}

.remark-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.remark h2,
.after h2 {
  font-size: var(--step-1);
}

.remark-text {
  padding: 1rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--blue-deep);
  border-radius: var(--radius);
  white-space: pre-line;
  font-size: 0.9375rem;
  line-height: 1.5;
  user-select: all;
}

.remark .hint {
  margin-top: 0.5rem;
}

.after-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
}

.after ol {
  counter-reset: next;
  display: grid;
  gap: 0.6rem;
  margin: 1rem 0 1.75rem;
}

.after li {
  counter-increment: next;
  position: relative;
  padding-left: 1.9rem;
}

.after li::before {
  content: counter(next);
  position: absolute;
  left: 0;
  top: 0.05rem;
  width: 1.3rem;
  height: 1.3rem;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--field-strong);
  color: var(--blue-deep);
  border-radius: 2px;
}

.assumptions {
  margin-top: 2.5rem;
  font-size: var(--step--1);
  border-top: 1px solid var(--rule);
  padding-top: 1rem;
}

.assumptions summary {
  font-weight: 600;
  cursor: pointer;
}

.assumptions ul {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.8rem;
  padding-left: 1.1rem;
  list-style: disc;
  color: var(--ink-soft);
}

.print-only {
  display: none;
}

@media (max-width: 62rem) {
  .layout,
  .followup {
    grid-template-columns: minmax(0, 1fr);
  }

  .output {
    position: static;
  }
}

@media (max-width: 36rem) {
  .row--2,
  .row--3,
  .choices {
    grid-template-columns: minmax(0, 1fr);
  }

  .row--money {
    grid-template-columns: minmax(0, 1.4fr) minmax(5.5rem, 0.6fr);
  }

  .row--money .field:nth-child(3) {
    grid-column: 1 / -1;
  }
}

@media print {
  .page {
    padding: 0;
  }

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

  .assumptions > ul {
    display: grid;
  }

  .print-only {
    display: block;
  }

  .disclaimer {
    margin-top: 1.5rem;
    font-size: 8.5pt;
    color: #444;
  }
}
</style>
