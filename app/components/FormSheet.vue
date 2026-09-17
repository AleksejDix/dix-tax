<script setup lang="ts">
import type { PropertyResult } from '~/composables/useDeclaration'

// A facsimile of the Zurich "Liegenschaftenverzeichnis". German labels are the
// official ones and stay German in every locale; the line below each is translated.
const props = defineProps<{
  results: PropertyResult[]
  year: number
  notes?: boolean
  animate?: boolean
}>()

const { t, locale } = useI18n()

// In German the short field labels would just repeat themselves ("Strasse / Strasse").
const factSub = computed(() => locale.value !== 'de')

const shown = computed(() => props.results.filter((r) => r.complete))
const totals = computed(() => ({
  net: shown.value.reduce((sum, r) => sum + r.net, 0),
  taxValue: shown.value.reduce((sum, r) => sum + r.taxValue, 0),
}))

function chf(value: number) {
  return formatChf(value)
}
</script>

<template>
  <article class="sheet" :class="{ 'sheet--animate': animate }" lang="de">
    <header class="sheet-head">
      <div>
        <p class="sheet-title">Liegenschaftenverzeichnis</p>
        <p class="sheet-sub">Steuererklärung {{ year }}</p>
      </div>
      <p class="sheet-canton">
        <svg viewBox="0 0 20 22" aria-hidden="true" class="sheet-shield">
          <path d="M1 1h18v11c0 5-4 8-9 9-5-1-9-4-9-9z" fill="#fff" stroke="currentColor" stroke-width="1.4" />
          <path d="M1.7 1.7h16.6L1.7 17.2z" fill="currentColor" />
        </svg>
        Kanton Zürich
      </p>
    </header>

    <p v-if="!shown.length" class="sheet-empty" :lang="$i18n.locale">{{ t('zh.sheet.empty') }}</p>

    <section v-for="(r, i) in shown" :key="r.input.id" class="prop">
      <h3 class="prop-title">Liegenschaft {{ i + 1 }}</h3>

      <dl class="prop-facts">
        <div class="fact fact--wide">
          <dt>Ort <span v-if="factSub" :lang="$i18n.locale">{{ t('zh.sheet.place') }}</span></dt>
          <dd>{{ r.input.city }}</dd>
        </div>
        <div v-if="r.input.street" class="fact fact--wide">
          <dt>Strasse <span v-if="factSub" :lang="$i18n.locale">{{ t('zh.sheet.street') }}</span></dt>
          <dd>{{ r.input.street }}</dd>
        </div>
        <div class="fact">
          <dt>Kanton / Land <span v-if="factSub" :lang="$i18n.locale">{{ t('zh.sheet.country') }}</span></dt>
          <dd>{{ countryDe(r.input) }}</dd>
        </div>
        <div class="fact">
          <dt>Art <span v-if="factSub" :lang="$i18n.locale">{{ t('zh.sheet.kind') }}</span></dt>
          <dd>{{ kindLabelDe(r.input.kind) }}</dd>
        </div>
        <div v-if="r.input.area" class="fact">
          <dt>Fläche <span v-if="factSub" :lang="$i18n.locale">{{ t('zh.sheet.area') }}</span></dt>
          <dd class="num">{{ r.input.area }} m²</dd>
        </div>
      </dl>

      <dl class="lines">
        <div class="line">
          <dt>
            Eigenmietwert / Mietzinseinnahmen
            <span :lang="$i18n.locale">{{ t('zh.sheet.gross') }}</span>
          </dt>
          <dd class="num"><span class="cur">CHF</span>{{ chf(r.gross) }}</dd>
        </div>
        <p v-if="notes && i === 0" class="hand hand--1" :lang="$i18n.locale">
          <HandArrow />{{ t('zh.hero.noteIncome') }}
        </p>
        <div class="line">
          <dt>
            Unterhalts- und Verwaltungskosten, pauschal
            <span :lang="$i18n.locale">{{ t('zh.sheet.maintenance') }}</span>
          </dt>
          <dd class="num"><span class="cur">−</span>{{ chf(r.maintenance) }}</dd>
        </div>
        <div class="line line--sum">
          <dt>
            Verbleibender Ertrag
            <span :lang="$i18n.locale">{{ t('zh.sheet.net') }}</span>
          </dt>
          <dd class="num">{{ chf(r.net) }}</dd>
        </div>
        <div class="line line--sum">
          <dt>
            Verkehrswert
            <span :lang="$i18n.locale">{{ t('zh.sheet.value') }}</span>
          </dt>
          <dd class="num">{{ chf(r.taxValue) }}</dd>
        </div>
        <p v-if="notes && i === 0" class="hand hand--2" :lang="$i18n.locale">
          <HandArrow />{{ t('zh.hero.noteValue') }}
        </p>
      </dl>
    </section>

    <footer v-if="shown.length" class="totals">
      <dl>
        <div class="total">
          <dt>
            Nettoertrag aus Liegenschaften
            <span :lang="$i18n.locale">
              {{ t('zh.sheet.totalNet') }}. {{ t('zh.sheet.transfer', { line: '6' }) }}
            </span>
          </dt>
          <dd>
            <span class="code num" :title="t('zh.sheet.code', { code: 188 })">188</span>
            <mark class="num">{{ chf(totals.net) }}</mark>
          </dd>
        </div>
        <div class="total">
          <dt>
            Liegenschaften zum Verkehrswert
            <span :lang="$i18n.locale">
              {{ t('zh.sheet.totalValue') }}. {{ t('zh.sheet.transfer', { line: '31.1' }) }}
            </span>
          </dt>
          <dd>
            <span class="code num" :title="t('zh.sheet.code', { code: 421 })">421</span>
            <mark class="num">{{ chf(totals.taxValue) }}</mark>
          </dd>
        </div>
      </dl>
      <p v-if="notes" class="hand hand--3" :lang="$i18n.locale"><HandArrow flip />{{ t('zh.hero.noteResult') }}</p>
    </footer>
  </article>
</template>

<style scoped>
.sheet {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sheet);
  font-size: var(--step--1);
  line-height: 1.35;
  overflow: hidden;
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.1rem 1.25rem 1rem;
  background: var(--blue-deep);
  color: #fff;
}

.sheet-title {
  font-size: var(--step-1);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
  hyphens: auto;
}

.sheet-sub {
  margin-top: 0.2rem;
  opacity: 0.8;
}

.sheet-canton {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 500;
  white-space: nowrap;
  color: #fff;
}

.sheet-shield {
  width: 1.05rem;
  height: auto;
  color: #6f9bea;
  flex: none;
}

.sheet-empty {
  padding: 2.5rem 1.25rem;
  color: var(--ink-soft);
  text-align: center;
  font-size: var(--step-0);
}

.prop {
  padding: 1.1rem 1.25rem 0.4rem;
  border-bottom: 1px solid var(--rule);
}

.prop-title {
  font-size: var(--step--1);
  font-weight: 600;
  letter-spacing: 0;
  color: var(--blue-deep);
  margin-bottom: 0.7rem;
}

.prop-facts {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(min-content, 1.5fr) minmax(0, 0.8fr);
  gap: 0.5rem;
  margin: 0 0 0.9rem;
}

.fact {
  display: grid;
  align-content: end;
}

.fact--wide {
  grid-column: 1 / -1;
}

dt {
  font-weight: 500;
}

dt span {
  display: block;
  font-weight: 400;
  color: var(--ink-soft);
}

.fact dt {
  font-size: 0.75rem;
  color: var(--ink-soft);
}

.fact dt span {
  display: inline;
}

.fact dt span::before {
  content: '/ ';
  opacity: 0.6;
}

.fact dd {
  margin: 0.2rem 0 0;
  padding: 0.4rem 0.55rem;
  background: var(--field);
  border-bottom: 1.5px solid var(--field-strong);
  border-radius: 3px 3px 0 0;
  font-weight: 500;
  min-height: 2rem;
  overflow-wrap: break-word;
}

.lines {
  margin: 0;
}

.line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(6.5rem, auto);
  gap: 0.75rem;
  align-items: end;
  padding: 0.55rem 0;
  border-top: 1px dashed var(--rule);
}

.line--sum dt {
  font-weight: 600;
}

.line dd {
  margin: 0;
  padding: 0.35rem 0.55rem;
  background: var(--field);
  border-bottom: 1.5px solid var(--field-strong);
  border-radius: 3px 3px 0 0;
  text-align: right;
  font-weight: 600;
  font-size: var(--step-0);
  white-space: nowrap;
}

.cur {
  float: left;
  margin-right: 0.6rem;
  font-weight: 400;
  font-size: 0.75rem;
  line-height: 1.9;
  color: var(--ink-soft);
}

.totals {
  padding: 0.5rem 1.25rem 1.1rem;
  background: linear-gradient(var(--field), var(--field)) top / 100% 100% no-repeat;
}

.totals dl {
  margin: 0;
}

.total {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.7rem 0;
}

.total + .total {
  border-top: 1px solid var(--field-strong);
}

.total dt {
  font-weight: 600;
}

.total dd {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.code {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  border: 1px solid var(--ink-soft);
  border-radius: 2px;
  font-size: 0.75rem;
  color: var(--ink-soft);
  background: var(--surface);
}

mark {
  display: inline-block;
  min-width: 5.5rem;
  padding: 0.2rem 0.5rem;
  text-align: right;
  font-size: var(--step-1);
  font-weight: 700;
  color: var(--ink);
  background: linear-gradient(100deg, transparent 0.2rem, var(--marker) 0.5rem, var(--marker) calc(100% - 0.4rem), transparent calc(100% - 0.1rem))
    no-repeat left center / 100% 78%;
  border-radius: 2px;
}

/* Handwritten margin notes: the voice of a friend who has done this before. */
.hand {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.35rem;
  margin: -0.15rem 0.2rem 0.35rem 0;
  font-family: var(--font-hand);
  font-size: 1.45rem;
  font-weight: 500;
  line-height: 1.05;
  color: var(--blue);
  text-align: right;
  transform: rotate(-1.5deg);
  transform-origin: right center;
}

.hand--2 {
  transform: rotate(1deg);
  margin-bottom: 0.7rem;
}

.hand--3 {
  margin: 0.3rem 0 0;
  transform: rotate(-1deg);
}

.sheet--animate mark {
  animation: sweep 0.7s cubic-bezier(0.3, 0.7, 0.2, 1) both;
}

.sheet--animate .total:nth-child(1) mark {
  animation-delay: 0.5s;
}

.sheet--animate .total:nth-child(2) mark {
  animation-delay: 0.85s;
}

.sheet--animate .hand {
  animation: jot 0.5s ease-out both;
}

.sheet--animate .hand--1 {
  animation-delay: 1.3s;
}

.sheet--animate .hand--2 {
  animation-delay: 1.7s;
}

.sheet--animate .hand--3 {
  animation-delay: 2.1s;
}

@keyframes sweep {
  from {
    background-size: 0% 78%;
  }
  to {
    background-size: 100% 78%;
  }
}

@keyframes jot {
  from {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

@media (max-width: 30rem) {
  .prop-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sheet-head {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .sheet-canton {
    font-size: 0.75rem;
  }

  .line {
    grid-template-columns: minmax(0, 1fr) minmax(5.5rem, auto);
  }

  mark {
    min-width: 4.5rem;
  }
}

@media print {
  .sheet {
    box-shadow: none;
    border-color: #999;
    break-inside: avoid;
  }

  .sheet-head {
    background: #fff;
    color: #000;
    border-bottom: 2px solid #000;
  }

  .sheet-canton {
    color: #000;
  }
}
</style>
