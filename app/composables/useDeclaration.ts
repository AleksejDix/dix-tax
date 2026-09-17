export type PropertyKind = 'apartment' | 'house'
export type PropertyUsage = 'self' | 'family' | 'rented' | 'unusable'
export type ValueBasis = 'purchase' | 'market'
export type Currency = 'EUR' | 'USD' | 'GBP' | 'UAH' | 'CHF'

export interface PropertyInput {
  id: string
  /** ISO country code, or 'other' together with `countryName`. */
  country: string
  countryName: string
  city: string
  street: string
  kind: PropertyKind
  area: number | null
  share: number
  basis: ValueBasis
  amount: number | null
  currency: Currency
  /** Year-end rate: converts the value, because wealth is measured on 31 December */
  rate: number | null
  usage: PropertyUsage
  rent: number | null
  /** Average rate of the year: converts rent, because income is earned over the year */
  rentRate: number | null
}

export interface PropertyResult {
  input: PropertyInput
  valueChf: number
  taxValue: number
  gross: number
  maintenance: number
  net: number
  complete: boolean
}

// Published Zurich practice for property abroad (see /guide and FAQ).
export const TAX_VALUE_FACTOR = 0.7
export const NOTIONAL_RENT_RATE: Record<PropertyKind, number> = { apartment: 0.0425, house: 0.035 }
export const MAINTENANCE_FLAT_RATE = 0.2

// Approximate year-end rates, only used to prefill the rate field.
// The user is asked to replace them with the official ICTax rate.
export const APPROX_RATES: Record<Currency, number> = {
  EUR: 0.93,
  USD: 0.79,
  GBP: 1.06,
  UAH: 0.0187,
  CHF: 1,
}

// Approximate annual average rates, used to prefill the rate for rent.
export const APPROX_AVERAGE_RATES: Record<Currency, number> = {
  EUR: 0.94,
  USD: 0.83,
  GBP: 1.1,
  UAH: 0.02,
  CHF: 1,
}

export const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'UAH', 'CHF']

// Countries offered in the form. Names come from Intl.DisplayNames, so they need no translation:
// the visitor sees them in their language, the tax form and the German note get the German name.
export const COUNTRIES = [
  'AL', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BY', 'BE', 'BA', 'BR', 'BG', 'CA', 'CL', 'CN', 'CO', 'HR', 'CY', 'CZ',
  'DK', 'DO', 'EG', 'EE', 'FI', 'FR', 'GE', 'DE', 'GR', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'KZ', 'XK',
  'LV', 'LB', 'LT', 'LU', 'MK', 'MT', 'MX', 'MD', 'ME', 'MA', 'NL', 'NZ', 'NO', 'PE', 'PH', 'PL', 'PT', 'RO',
  'RU', 'RS', 'SK', 'SI', 'ZA', 'KR', 'ES', 'LK', 'SE', 'TH', 'TN', 'TR', 'UA', 'AE', 'GB', 'US', 'UY', 'VN',
]

export function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}

/** Country as it is written on the Zurich form and in the German note. */
export function countryDe(p: Pick<PropertyInput, 'country' | 'countryName'>) {
  if (p.country === 'other') return p.countryName.trim()
  return p.country ? countryName(p.country, 'de-CH') : ''
}
export const TAX_YEARS = [2026, 2025, 2024]

const KIND_DE: Record<PropertyKind, string> = {
  apartment: 'Stockwerkeigentum',
  house: 'Einfamilienhaus',
}

export function kindLabelDe(kind: PropertyKind) {
  return KIND_DE[kind]
}

export function newProperty(): PropertyInput {
  return {
    id: Math.random().toString(36).slice(2, 10),
    country: '',
    countryName: '',
    city: '',
    street: '',
    kind: 'apartment',
    area: null,
    share: 100,
    basis: 'purchase',
    amount: null,
    currency: 'EUR',
    rate: APPROX_RATES.EUR,
    usage: 'self',
    rent: null,
    rentRate: APPROX_AVERAGE_RATES.EUR,
  }
}

export function calculate(input: PropertyInput): PropertyResult {
  const share = Math.min(Math.max(input.share || 0, 0), 100) / 100
  const rate = input.currency === 'CHF' ? 1 : input.rate || 0
  const valueChf = (input.amount || 0) * rate * share
  const taxValue = Math.round(valueChf * TAX_VALUE_FACTOR)

  // Rent is income: the federal annual average rate applies, not the year-end rate.
  const rentRate = input.currency === 'CHF' ? 1 : input.rentRate || rate

  let gross = 0
  if (input.usage === 'rented') gross = Math.round((input.rent || 0) * rentRate * share)
  else if (input.usage !== 'unusable') gross = Math.round(taxValue * NOTIONAL_RENT_RATE[input.kind])

  const maintenance = Math.round(gross * MAINTENANCE_FLAT_RATE)

  return {
    input,
    valueChf: Math.round(valueChf),
    taxValue,
    gross,
    maintenance,
    net: gross - maintenance,
    complete: Boolean(countryDe(input) && input.city.trim() && input.amount && rate),
  }
}

export function formatChf(value: number) {
  // Swiss grouping with a straight apostrophe, as printed on the tax form.
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

function formatAmount(value: number) {
  return formatChf(value)
}

function formatPercentDe(value: number) {
  return (value * 100).toString().replace('.', ',')
}

/** German note for the remarks field of the tax return. Always German: the tax office reads it. */
export function remarkDe(results: PropertyResult[], year: number) {
  const lines = results
    .filter((r) => r.complete)
    .map((r, i) => {
      const p = r.input
      const where = [p.city.trim(), p.street.trim()].filter(Boolean).join(', ')
      const basis = p.basis === 'purchase' ? 'des Kaufpreises' : 'des geschätzten Verkehrswerts'
      const conversion =
        p.currency === 'CHF'
          ? `${basis} von CHF ${formatAmount(p.amount || 0)}`
          : `${basis} von ${p.currency} ${formatAmount(p.amount || 0)} (Kurs ${p.rate})`
      const shareText = p.share < 100 ? `, Anteil ${p.share}%` : ''

      const usage: Record<PropertyUsage, string> = {
        self: `Die Liegenschaft steht zur eigenen Verfügung. Eigenmietwert: ${formatPercentDe(NOTIONAL_RENT_RATE[p.kind])}% des Steuerwerts.`,
        family: `Die Liegenschaft wird unentgeltlich von Angehörigen bewohnt. Eigenmietwert: ${formatPercentDe(NOTIONAL_RENT_RATE[p.kind])}% des Steuerwerts.`,
        rented:
          p.currency === 'CHF'
            ? 'Die Liegenschaft ist vermietet. Deklariert sind die effektiven Mietzinseinnahmen.'
            : `Die Liegenschaft ist vermietet. Deklariert sind die effektiven Mietzinseinnahmen von ${p.currency} ${formatAmount(p.rent || 0)}, umgerechnet zum Jahresmittelkurs ${p.rentRate || p.rate}.`,
        unusable:
          'Die Liegenschaft ist nicht nutzbar (zerstört, stark beschädigt oder nicht zugänglich). Es wird deshalb kein Eigenmietwert deklariert. Belege können auf Wunsch nachgereicht werden.',
      }

      return `${i + 1}. ${kindLabelDe(p.kind)} in ${where}, ${countryDe(p)}${shareText}. Steuerwert CHF ${formatChf(r.taxValue)}: 70% ${conversion}. ${usage[p.usage]}`
    })

  if (!lines.length) return ''

  return [
    `Liegenschaften im Ausland, Steuerperiode ${year}:`,
    ...lines,
    'Grundstücke im Ausland sind von der schweizerischen Steuerpflicht ausgenommen (Art. 6 Abs. 1 DBG); das Besteuerungsrecht liegt beim Belegenheitsstaat. Wir bitten um Ausscheidung ins Ausland; die Werte sind nur satzbestimmend zu berücksichtigen. Unterhaltskosten: Pauschalabzug 20%.',
  ].join('\n')
}

const STORAGE_KEY = 'dixtax:declaration:v1'

export function useDeclaration() {
  const year = useState<number>('decl-year', () => 2025)
  const properties = useState<PropertyInput[]>('decl-properties', () => [newProperty()])
  const loaded = useState<boolean>('decl-loaded', () => false)

  const results = computed(() => properties.value.map(calculate))
  const totals = computed(() => ({
    net: results.value.reduce((sum, r) => sum + r.net, 0),
    taxValue: results.value.reduce((sum, r) => sum + r.taxValue, 0),
  }))
  const remark = computed(() => remarkDe(results.value, year.value))
  const hasResult = computed(() => results.value.some((r) => r.complete))

  function load() {
    if (loaded.value || !import.meta.client) return
    loaded.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (TAX_YEARS.includes(saved.year)) year.value = saved.year
      if (Array.isArray(saved.properties) && saved.properties.length) {
        // Entries saved before the rent rate existed get the average rate of their own currency.
        properties.value = saved.properties.map((p: Partial<PropertyInput>) => ({
          ...newProperty(),
          ...p,
          rentRate: p.rentRate ?? APPROX_AVERAGE_RATES[p.currency ?? 'EUR'],
        }))
      }
    } catch {
      // Corrupt or blocked storage: start with an empty form.
    }
  }

  function persist() {
    if (!import.meta.client || !loaded.value) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ year: year.value, properties: properties.value }))
    } catch {
      // Private mode: the form still works, it just is not remembered.
    }
  }

  function add() {
    properties.value.push(newProperty())
  }

  function remove(id: string) {
    properties.value = properties.value.filter((p) => p.id !== id)
    if (!properties.value.length) properties.value = [newProperty()]
  }

  function reset() {
    properties.value = [newProperty()]
    year.value = 2025
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // nothing to clear
    }
  }

  return { year, properties, results, totals, remark, hasResult, load, persist, add, remove, reset }
}

/** Fixed example shown on the landing page. Runs through the same calculation as the tool. */
export function sampleResult(): PropertyResult {
  return calculate({
    id: 'sample',
    country: 'ES',
    countryName: '',
    city: 'Valencia',
    street: 'Carrer de Colón 27',
    kind: 'apartment',
    area: 68,
    share: 100,
    basis: 'purchase',
    amount: 120000,
    currency: 'EUR',
    rate: APPROX_RATES.EUR,
    usage: 'self',
    rent: null,
    rentRate: APPROX_AVERAGE_RATES.EUR,
  })
}
