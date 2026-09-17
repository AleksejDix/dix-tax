// Reference dates for the filing deadlines. Each expectation comes from the source named
// in app/utils/deadlines.ts; if a tax administration moves a date, change it there and
// change the case here on purpose.
import { describe, expect, it } from 'vitest'
import { daysUntil, nextDeadline, upcomingDeadlines } from '../app/utils/deadlines'

const on = (iso: string) => new Date(`${iso}T09:00:00Z`)
const iso = (d: Date) => d.toISOString().slice(0, 10)

describe('Zurich tax return', () => {
  it('is due on 31 March of the following year', () => {
    const d = nextDeadline('chZurich', on('2026-02-10'))!
    expect(d.year).toBe(2025)
    expect(iso(d.date)).toBe('2026-03-31')
    expect(d.kind).toBe('due')
  })

  it('moves to the extended 30 September once 31 March has passed', () => {
    const d = nextDeadline('chZurich', on('2026-04-01'))!
    expect(d.year).toBe(2025)
    expect(iso(d.date)).toBe('2026-09-30')
    expect(d.kind).toBe('extended')
  })

  it('moves to the last extension, 30 November, and then to the next tax year', () => {
    expect(iso(nextDeadline('chZurich', on('2026-10-01'))!.date)).toBe('2026-11-30')
    const after = nextDeadline('chZurich', on('2026-12-01'))!
    expect(after.year).toBe(2026)
    expect(iso(after.date)).toBe('2027-03-31')
  })

  it('counts the deadline day itself as still open', () => {
    const d = nextDeadline('chZurich', on('2026-03-31'))!
    expect(iso(d.date)).toBe('2026-03-31')
    expect(daysUntil(d, on('2026-03-31'))).toBe(0)
  })
})

describe('Modelo 210', () => {
  it('gives income of 2025 until 31 December 2026', () => {
    const d = upcomingDeadlines(on('2026-09-17')).find((x) => x.label === 'modelo210Own')!
    expect(d.year).toBe(2025)
    expect(iso(d.date)).toBe('2026-12-31')
  })

  it('files a rented home for 2026 in the first twenty days of April 2027', () => {
    const d = upcomingDeadlines(on('2026-09-17')).find((x) => x.label === 'modelo210Rented')!
    expect(d.year).toBe(2026)
    expect(iso(d.date)).toBe('2027-04-20')
  })

  it('still uses the January window for a home rented out in 2025', () => {
    const d = upcomingDeadlines(on('2025-12-01')).find((x) => x.label === 'modelo210Rented')!
    expect(d.year).toBe(2025)
    expect(iso(d.date)).toBe('2026-01-20')
  })
})

describe('German return with Anlage V', () => {
  it('is due on 31 July of the following year', () => {
    const d = upcomingDeadlines(on('2026-05-01')).find((x) => x.label === 'anlageV')!
    expect(d.year).toBe(2025)
    expect(iso(d.date)).toBe('2026-07-31')
  })

  it('runs to the end of February two years later when an adviser files it', () => {
    const d = upcomingDeadlines(on('2026-09-17')).find((x) => x.label === 'anlageVAdviser')!
    expect(d.year).toBe(2025)
    expect(iso(d.date)).toBe('2027-02-28')
  })

  it('lands on 29 February in a leap year', () => {
    const d = upcomingDeadlines(on('2027-06-01')).find((x) => x.label === 'anlageVAdviser')!
    expect(d.year).toBe(2026)
    expect(iso(d.date)).toBe('2028-02-29')
  })
})

describe('the list as a whole', () => {
  it('shows every filing once, in the order the dates fall', () => {
    const list = upcomingDeadlines(on('2026-09-17'))
    expect(list.map((d) => d.label)).toEqual([
      'zurich',
      'modelo210Own',
      'anlageVAdviser',
      'modelo210Rented',
      'anlageV',
    ])
    expect(list.map((d) => iso(d.date))).toEqual([
      '2026-09-30',
      '2026-12-31',
      '2027-02-28',
      '2027-04-20',
      '2027-07-31',
    ])
  })

  it('never looks back', () => {
    for (const day of ['2026-01-01', '2026-06-15', '2026-12-31', '2027-08-01']) {
      for (const d of upcomingDeadlines(on(day))) expect(daysUntil(d, on(day))).toBeGreaterThanOrEqual(0)
    }
  })
})
