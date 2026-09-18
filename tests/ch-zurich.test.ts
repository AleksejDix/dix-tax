// Reference cases for the Zurich declaration of somebody who owns property in the canton and
// lives abroad. Expected values were worked out by hand from the rules in README.md; if a rule
// changes, these numbers must be changed on purpose.
import { describe, expect, it } from 'vitest'
import {
  calculate,
  formatChf,
  newHousehold,
  remarkDe,
  summarise,
  type Household,
  type PropertyInput,
} from '../app/composables/useDeclaration'

// A flat in Winterthur: the canton assessed it at CHF 486'000 with an Eigenmietwert of 16'800.
const base: PropertyInput = {
  id: 't',
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
}

describe('one property', () => {
  it('own use: the assessed Eigenmietwert, less the 20% flat deduction', () => {
    const r = calculate(base)
    expect(r.taxValue).toBe(486000)
    expect(r.gross).toBe(16800)
    expect(r.maintenance).toBe(3360)
    expect(r.net).toBe(13440)
    expect(r.complete).toBe(true)
  })

  it('nothing is derived from the type of building: a house with the same assessment is the same', () => {
    expect(calculate({ ...base, kind: 'house' }).gross).toBe(16800)
  })

  it('relatives living there for nothing still means the Eigenmietwert', () => {
    expect(calculate({ ...base, usage: 'family' }).gross).toBe(16800)
  })

  it('rented out: the rent received replaces the Eigenmietwert', () => {
    const r = calculate({ ...base, usage: 'rented', rent: 22800 })
    expect(r.gross).toBe(22800)
    expect(r.maintenance).toBe(4560)
    expect(r.net).toBe(18240)
  })

  it('actual maintenance is taken instead of the flat deduction when it is chosen', () => {
    const r = calculate({ ...base, maintenanceBasis: 'actual', maintenanceActual: 9100 })
    expect(r.maintenance).toBe(9100)
    expect(r.net).toBe(7700)
  })

  it('a share applies to the value, the income and the actual costs alike', () => {
    const r = calculate({ ...base, share: 50, maintenanceBasis: 'actual', maintenanceActual: 9100 })
    expect(r.taxValue).toBe(243000)
    expect(r.gross).toBe(8400)
    expect(r.maintenance).toBe(4550)
  })

  it('is incomplete without a municipality, an assessed value or an income figure', () => {
    expect(calculate({ ...base, municipality: ' ' }).complete).toBe(false)
    expect(calculate({ ...base, taxValue: null }).complete).toBe(false)
    expect(calculate({ ...base, eigenmietwert: null }).complete).toBe(false)
    expect(calculate({ ...base, usage: 'rented', rent: null }).complete).toBe(false)
  })
})

describe('debts follow where the assets lie', () => {
  const house: Household = {
    worldAssets: 1620000, // the Zurich flat plus CHF 1'134'000 elsewhere
    worldIncome: 95000,
    debt: 400000,
    interest: 6000,
  }

  it('deducts only the Swiss share of debt and interest', () => {
    const s = summarise([calculate(base)], house)
    expect(s.quota).toBeCloseTo(0.3, 10) // 486'000 / 1'620'000
    expect(s.deductibleInterest).toBe(1800)
    expect(s.deductibleDebt).toBe(120000)
    expect(s.taxableIncome).toBe(13440 - 1800)
    expect(s.taxableWealth).toBe(486000 - 120000)
  })

  it('deducts nothing while the worldwide total is missing, rather than too much', () => {
    const s = summarise([calculate(base)], { ...house, worldAssets: null })
    expect(s.quota).toBeNull()
    expect(s.deductibleInterest).toBe(0)
    expect(s.deductibleDebt).toBe(0)
    expect(s.taxableIncome).toBe(13440)
    expect(s.taxableWealth).toBe(486000)
  })

  it('never lets the quota pass 1, however the figures are entered', () => {
    const s = summarise([calculate(base)], { ...house, worldAssets: 100000 })
    expect(s.quota).toBe(1)
    expect(s.deductibleDebt).toBe(400000)
    expect(s.taxableWealth).toBe(86000)
  })

  it('stops at zero when the debt is larger than the property', () => {
    const s = summarise([calculate(base)], { ...house, worldAssets: 486000, debt: 600000 })
    expect(s.taxableWealth).toBe(0)
  })

  it('carries the worldwide figures through untaxed, for the rate only', () => {
    const s = summarise([calculate(base)], house)
    expect(s.rateIncome).toBe(95000)
    expect(s.rateWealth).toBe(1220000) // 1'620'000 less the 400'000 of debt
  })

  it('adds several properties up before splitting the debt', () => {
    const second = calculate({ ...base, id: 'u', municipality: 'Uster', taxValue: 324000, eigenmietwert: 11200 })
    const s = summarise([calculate(base), second], house)
    expect(s.swissAssets).toBe(810000)
    expect(s.quota).toBeCloseTo(0.5, 10)
    expect(s.deductibleInterest).toBe(3000)
  })

  it('ignores incomplete properties', () => {
    const s = summarise([calculate(base), calculate({ ...base, id: 'x', municipality: '' })], newHousehold())
    expect(s.swissAssets).toBe(486000)
    expect(s.complete).toBe(true)
  })

  it('is not complete with no property at all', () => {
    expect(summarise([], newHousehold()).complete).toBe(false)
  })
})

describe('the German note', () => {
  const note = () =>
    remarkDe(
      summarise([calculate(base)], { worldAssets: 1620000, worldIncome: 95000, debt: 400000, interest: 6000 }),
      2025,
    )

  it('names the ground of liability and the tax year', () => {
    expect(note()).toContain('Art. 4 Abs. 1 lit. c DBG')
    expect(note()).toContain('Steuerperiode 2025')
    expect(note()).toContain('Wohnsitz im Ausland')
  })

  it('states the assessed value, the Eigenmietwert and the flat deduction', () => {
    expect(note()).toContain("Steuerwert gemäss amtlicher Schätzung CHF 486'000")
    expect(note()).toContain("Eigenmietwert CHF 16'800")
    expect(note()).toContain("Pauschalabzug 20% (CHF 3'360)")
  })

  it('asks for the debt split and gives the quota', () => {
    expect(note()).toContain('quotenmässig nach Lage der Aktiven')
    expect(note()).toContain('30%')
    expect(note()).toContain("abzugsfähige Schulden CHF 120'000")
  })

  it('says the rest is only rate determining', () => {
    expect(note()).toContain('Satzbestimmung')
    expect(note()).toContain('Art. 7 Abs. 1 DBG')
  })

  it('says so plainly when the split has not been worked out', () => {
    const n = remarkDe(summarise([calculate(base)], newHousehold()), 2025)
    expect(n).toContain('noch nicht vorgenommen')
  })

  it('is empty when nothing is filled in', () => {
    expect(remarkDe(summarise([], newHousehold()), 2025)).toBe('')
  })
})

describe('francs are printed the Swiss way', () => {
  it('groups thousands with an apostrophe', () => {
    expect(formatChf(1234567)).toBe("1'234'567")
    expect(formatChf(486000)).toBe("486'000")
    expect(formatChf(940)).toBe('940')
  })
})
