// Reference cases for the Zurich calculation. Expected values were worked out by hand
// from the rules in README.md; if a rule changes, these numbers must be changed on purpose.
import { describe, expect, it } from 'vitest'
import { calculate, countryDe, formatChf, remarkDe, type PropertyInput } from '../app/composables/useDeclaration'

const base: PropertyInput = {
  id: 't',
  country: 'ES',
  countryName: '',
  city: 'Valencia',
  street: '',
  kind: 'apartment',
  area: 68,
  share: 100,
  basis: 'purchase',
  amount: 120000,
  currency: 'EUR',
  rate: 0.93,
  usage: 'self',
  rent: null,
  rentRate: 0.94,
}

describe('Zurich: property abroad', () => {
  it('apartment kept for own use: 70% tax value, 4.25% notional rent, 20% flat deduction', () => {
    const r = calculate(base)
    expect(r.valueChf).toBe(111600)
    expect(r.taxValue).toBe(78120)
    expect(r.gross).toBe(3320)
    expect(r.maintenance).toBe(664)
    expect(r.net).toBe(2656)
    expect(r.complete).toBe(true)
  })

  it('house uses 3.5% notional rent', () => {
    const r = calculate({ ...base, kind: 'house' })
    expect(r.gross).toBe(2734)
    expect(r.net).toBe(2734 - 547)
  })

  it('family living there for free counts as own use', () => {
    expect(calculate({ ...base, usage: 'family' }).gross).toBe(3320)
  })

  it('rented property declares the rent received, converted with the annual average rate', () => {
    const r = calculate({ ...base, usage: 'rented', rent: 9600 })
    expect(r.gross).toBe(9024) // 9600 x 0.94, not x 0.93 (the year-end rate)
    expect(r.maintenance).toBe(1805)
    expect(r.net).toBe(7219)
    expect(r.taxValue).toBe(78120) // the value still uses the year-end rate
  })

  it('rent falls back to the year-end rate when no average rate is given', () => {
    expect(calculate({ ...base, usage: 'rented', rent: 9600, rentRate: null }).gross).toBe(8928)
  })

  it('rent in francs ignores both rates', () => {
    const r = calculate({ ...base, currency: 'CHF', amount: 200000, usage: 'rented', rent: 12000, rentRate: 9 })
    expect(r.gross).toBe(12000)
  })

  it('unusable property has a tax value but no income', () => {
    const r = calculate({ ...base, usage: 'unusable' })
    expect(r.taxValue).toBe(78120)
    expect(r.gross).toBe(0)
    expect(r.net).toBe(0)
  })

  it('ownership share scales value and income', () => {
    const r = calculate({ ...base, share: 50 })
    expect(r.taxValue).toBe(39060)
    expect(r.gross).toBe(1660)
  })

  it('amounts in francs ignore the rate field', () => {
    const r = calculate({ ...base, currency: 'CHF', rate: 5, amount: 200000 })
    expect(r.taxValue).toBe(140000)
  })

  it('US dollar example from the first version of the site', () => {
    const r = calculate({ ...base, country: 'UA', city: 'Kharkiv', currency: 'USD', rate: 0.79, amount: 38000 })
    expect(r.taxValue).toBe(21014)
    expect(r.gross).toBe(893)
    expect(r.net).toBe(893 - 179)
  })

  it('is incomplete without country, city, amount or rate', () => {
    expect(calculate({ ...base, country: '' }).complete).toBe(false)
    expect(calculate({ ...base, city: ' ' }).complete).toBe(false)
    expect(calculate({ ...base, amount: null }).complete).toBe(false)
    expect(calculate({ ...base, rate: null }).complete).toBe(false)
    expect(calculate({ ...base, country: 'other', countryName: '' }).complete).toBe(false)
    expect(calculate({ ...base, country: 'other', countryName: 'Andorra' }).complete).toBe(true)
  })
})

describe('Zurich: what goes on the form', () => {
  it('writes the country in German', () => {
    expect(countryDe({ country: 'ES', countryName: '' })).toBe('Spanien')
    expect(countryDe({ country: 'UA', countryName: '' })).toBe('Ukraine')
    expect(countryDe({ country: 'other', countryName: ' Andorra ' })).toBe('Andorra')
  })

  it('formats francs the Swiss way', () => {
    expect(formatChf(78120)).toBe("78'120")
    expect(formatChf(846)).toBe('846')
    expect(formatChf(1234567.4)).toBe("1'234'567")
  })

  it('German note names place, valuation, usage and the legal basis', () => {
    const note = remarkDe([calculate(base)], 2025)
    expect(note).toContain('Steuerperiode 2025')
    expect(note).toContain('Stockwerkeigentum in Valencia, Spanien')
    expect(note).toContain("Steuerwert CHF 78'120")
    expect(note).toContain("EUR 120'000 (Kurs 0.93)")
    expect(note).toContain('4,25% des Steuerwerts')
    expect(note).toContain('Art. 6 Abs. 1 DBG')
  })

  it('German note states the average rate used for rent', () => {
    const note = remarkDe([calculate({ ...base, usage: 'rented', rent: 9600 })], 2025)
    expect(note).toContain("EUR 9'600, umgerechnet zum Jahresmittelkurs 0.94")
  })

  it('German note skips incomplete properties and is empty when nothing is complete', () => {
    expect(remarkDe([calculate({ ...base, amount: null })], 2025)).toBe('')
  })
})
