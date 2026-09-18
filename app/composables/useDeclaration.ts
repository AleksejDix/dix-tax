// The Zurich declaration for somebody who owns property in the canton and lives abroad.
//
// Owning real estate in Switzerland makes a person liable here even without living here
// (wirtschaftliche Zugehörigkeit, Art. 4 Abs. 1 lit. c DBG, § 4 StG ZH). Only the property is
// taxed, but three things surprise people every year:
//
//  1. Nothing is estimated. The canton has already set the Eigenmietwert and the Steuerwert in
//     its assessment (amtliche Schätzung), and those are the figures the return wants.
//  2. Debts and debt interest are not deductible in full. They are split over all assets by
//     where the assets lie, so only the Swiss share counts here.
//  3. Worldwide income and wealth still have to be declared, not to be taxed, but to set the
//     rate the Swiss part is taxed at (Art. 7 Abs. 1 DBG).
export type PropertyKind = 'apartment' | 'house'
export type PropertyUsage = 'self' | 'family' | 'rented'
export type MaintenanceBasis = 'flat' | 'actual'

export interface PropertyInput {
  id: string
  /** Municipality in the canton of Zurich */
  municipality: string
  street: string
  kind: PropertyKind
  area: number | null
  /** Percent of the property owned, for co-ownership and inheritances */
  share: number
  /** Vermögenssteuerwert from the assessment, for the whole property */
  taxValue: number | null
  usage: PropertyUsage
  /** Eigenmietwert from the same assessment, for the whole property */
  eigenmietwert: number | null
  /** Rent received over the year, for the whole property, without utilities */
  rent: number | null
  maintenanceBasis: MaintenanceBasis
  /** Actual maintenance paid, for the whole property */
  maintenanceActual: number | null
}

export interface PropertyResult {
  input: PropertyInput
  taxValue: number
  gross: number
  maintenance: number
  net: number
  complete: boolean
}

/** Figures that belong to the person, not to one property. */
export interface Household {
  /** Gross assets worldwide on 31 December, this property included, at their tax values */
  worldAssets: number | null
  /** Income worldwide over the year */
  worldIncome: number | null
  /** All debts worldwide on 31 December, mortgages included */
  debt: number | null
  /** Debt interest paid worldwide over the year */
  interest: number | null
}

export interface DeclarationResult {
  properties: PropertyResult[]
  /** Swiss share of worldwide gross assets. Debts and interest follow it. */
  quota: number | null
  swissAssets: number
  /** Income from the properties, after maintenance, before interest */
  propertyIncome: number
  deductibleInterest: number
  taxableIncome: number
  deductibleDebt: number
  taxableWealth: number
  /** Not taxed here, only used to pick the rate */
  rateIncome: number | null
  rateWealth: number | null
  complete: boolean
}

/** Wegleitung ZH: maintenance and administration may be claimed as a flat 20% of the gross. */
export const MAINTENANCE_FLAT_RATE = 0.2

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
    municipality: '',
    street: '',
    kind: 'apartment',
    area: null,
    share: 100,
    taxValue: null,
    usage: 'self',
    eigenmietwert: null,
    rent: null,
    maintenanceBasis: 'flat',
    maintenanceActual: null,
  }
}

export function newHousehold(): Household {
  return { worldAssets: null, worldIncome: null, debt: null, interest: null }
}

export function calculate(input: PropertyInput): PropertyResult {
  const share = Math.min(Math.max(input.share || 0, 0), 100) / 100
  const taxValue = Math.round((input.taxValue || 0) * share)

  // Rented out: the rent actually received. Otherwise the Eigenmietwert the canton assessed,
  // which also applies when relatives live there for nothing.
  const gross =
    input.usage === 'rented'
      ? Math.round((input.rent || 0) * share)
      : Math.round((input.eigenmietwert || 0) * share)

  const maintenance =
    input.maintenanceBasis === 'actual'
      ? Math.round((input.maintenanceActual || 0) * share)
      : Math.round(gross * MAINTENANCE_FLAT_RATE)

  return {
    input,
    taxValue,
    gross,
    maintenance,
    net: gross - maintenance,
    complete: Boolean(input.municipality.trim() && input.taxValue && gross),
  }
}

/**
 * Debts and debt interest are split over all assets by where they lie
 * (quotenmässige Schuldenverlegung nach Lage der Aktiven), so a mortgage on a Zurich flat is
 * only deductible here to the extent the owner's assets are here. Without the worldwide total
 * there is no quota, and nothing is deducted rather than too much.
 */
export function summarise(properties: PropertyResult[], household: Household): DeclarationResult {
  const shown = properties.filter((p) => p.complete)
  const swissAssets = shown.reduce((sum, p) => sum + p.taxValue, 0)
  const propertyIncome = shown.reduce((sum, p) => sum + p.net, 0)

  const worldAssets = household.worldAssets || 0
  const quota = worldAssets > 0 ? Math.min(1, swissAssets / worldAssets) : null

  const deductibleInterest = quota === null ? 0 : Math.round((household.interest || 0) * quota)
  const deductibleDebt = quota === null ? 0 : Math.round((household.debt || 0) * quota)

  const rateWealth =
    household.worldAssets === null ? null : Math.max(0, worldAssets - (household.debt || 0))

  return {
    properties,
    quota,
    swissAssets,
    propertyIncome,
    deductibleInterest,
    taxableIncome: propertyIncome - deductibleInterest,
    deductibleDebt,
    taxableWealth: Math.max(0, swissAssets - deductibleDebt),
    rateIncome: household.worldIncome,
    rateWealth,
    complete: shown.length > 0,
  }
}

export function formatChf(value: number) {
  // Swiss grouping with a straight apostrophe, as printed on the tax form.
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

function formatPercentDe(value: number) {
  return (value * 100).toFixed(1).replace('.0', '').replace('.', ',')
}

/** German note for the remarks field of the tax return. Always German: the tax office reads it. */
export function remarkDe(result: DeclarationResult, year: number) {
  const shown = result.properties.filter((r) => r.complete)
  if (!shown.length) return ''

  const lines = shown.map((r, i) => {
    const p = r.input
    const where = [p.municipality.trim(), p.street.trim()].filter(Boolean).join(', ')
    const shareText = p.share < 100 ? `, Anteil ${p.share}%` : ''
    const income =
      p.usage === 'rented'
        ? `Vermietet. Mietzinseinnahmen CHF ${formatChf(r.gross)}.`
        : p.usage === 'family'
          ? `Unentgeltlich von Angehörigen bewohnt; deklariert ist der Eigenmietwert von CHF ${formatChf(r.gross)}.`
          : `Selbst genutzt oder leer stehend; Eigenmietwert CHF ${formatChf(r.gross)}.`
    const upkeep =
      p.maintenanceBasis === 'actual'
        ? `Unterhaltskosten effektiv CHF ${formatChf(r.maintenance)}.`
        : `Unterhalts- und Verwaltungskosten: Pauschalabzug 20% (CHF ${formatChf(r.maintenance)}).`

    return `${i + 1}. ${kindLabelDe(p.kind)} in ${where}${shareText}. Steuerwert gemäss amtlicher Schätzung CHF ${formatChf(r.taxValue)}. ${income} ${upkeep}`
  })

  const allocation =
    result.quota === null
      ? 'Die Verlegung der Schulden und Schuldzinsen nach Lage der Aktiven ist noch nicht vorgenommen; die Angaben werden nachgereicht.'
      : `Schulden und Schuldzinsen wurden quotenmässig nach Lage der Aktiven verlegt. Anteil der schweizerischen Aktiven am Bruttovermögen: ${formatPercentDe(result.quota)}%. Abzugsfähige Schuldzinsen CHF ${formatChf(result.deductibleInterest)}, abzugsfähige Schulden CHF ${formatChf(result.deductibleDebt)}.`

  return [
    `Beschränkte Steuerpflicht aufgrund von Grundeigentum im Kanton Zürich (Art. 4 Abs. 1 lit. c DBG, § 4 StG ZH), Steuerperiode ${year}. Wohnsitz im Ausland.`,
    ...lines,
    allocation,
    'Das übrige Einkommen und Vermögen ist nicht in der Schweiz steuerbar und wird nur zur Satzbestimmung deklariert (Art. 7 Abs. 1 DBG).',
  ].join('\n')
}

const STORAGE_KEY = 'dixtax:declaration:v2'

export function useDeclaration() {
  const year = useState<number>('decl-year', () => 2025)
  const properties = useState<PropertyInput[]>('decl-properties', () => [newProperty()])
  const household = useState<Household>('decl-household', () => newHousehold())
  const loaded = useState<boolean>('decl-loaded', () => false)

  const results = computed(() => properties.value.map(calculate))
  const summary = computed(() => summarise(results.value, household.value))
  const remark = computed(() => remarkDe(summary.value, year.value))
  const hasResult = computed(() => summary.value.complete)

  function load() {
    if (loaded.value || !import.meta.client) return
    loaded.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (TAX_YEARS.includes(saved.year)) year.value = saved.year
      if (Array.isArray(saved.properties) && saved.properties.length) {
        properties.value = saved.properties.map((p: Partial<PropertyInput>) => ({ ...newProperty(), ...p }))
      }
      if (saved.household) household.value = { ...newHousehold(), ...saved.household }
    } catch {
      // Corrupt or blocked storage: start with an empty form.
    }
  }

  function persist() {
    if (!import.meta.client || !loaded.value) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ year: year.value, properties: properties.value, household: household.value }),
      )
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
    household.value = newHousehold()
    year.value = 2025
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // nothing to clear
    }
  }

  return { year, properties, household, results, summary, remark, hasResult, load, persist, add, remove, reset }
}

/** Fixed example shown on the landing page. Runs through the same calculation as the tool. */
export function sampleResult(): PropertyResult {
  return calculate({
    id: 'sample',
    municipality: 'Winterthur',
    street: 'Tösstalstrasse 14',
    kind: 'apartment',
    area: 68,
    share: 100,
    taxValue: 486000,
    usage: 'self',
    eigenmietwert: 16800,
    rent: null,
    maintenanceBasis: 'flat',
    maintenanceActual: null,
  })
}
