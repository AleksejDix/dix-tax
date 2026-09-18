// Filing deadlines for the forms dix.tax covers. A deadline is the strongest reason a
// visitor acts today instead of next month, so every date here is taken from the tax
// administration itself and is dated; when a rule changes, change it here and nowhere else.
//
// Sources:
//   Zurich    31 March of the following year; a free extension to 30 September can be
//             requested until 31 March, and that extension can be stretched to 30 November.
//             zh.ch, Steuererklärung natürliche Personen.
//   Spain     Modelo 210 for imputed income of a home that is not rented: 1 April to
//             31 December of the following year, first for income of 2026. For income of
//             2025 the old window still applies: 1 January to 31 December 2026.
//             Rented out, filed as one annual declaration: the first twenty days of April
//             of the following year, first for income of 2026 (for 2025: 1 to 20 January
//             2026). Orden HAC/623/2026, as published by the Agencia Tributaria.
//   Germany   Income tax return including Anlage V: 31 July of the following year, or the
//             end of February of the year after that when a tax adviser files it.
//             Same deadline for people who live abroad. § 149 AO.

import type { Product } from './products'

export type DeadlineKind = 'due' | 'extended' | 'final'

export interface Deadline {
  product: Product['key']
  /** Tax year the filing is about */
  year: number
  /** The date itself, as UTC midnight */
  date: Date
  /** Key under `deadlines.kinds.*`; says what kind of date this is */
  kind: DeadlineKind
  /** Key under `deadlines.labels.*`; names the filing in the reader's language */
  label: string
}

const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day))

/** Every deadline for a tax year, in the order they fall. */
function scheduleFor(year: number): Deadline[] {
  const next = year + 1
  return [
    { product: 'switzerland', year, date: utc(next, 3, 31), kind: 'due', label: 'zurich' },
    { product: 'switzerland', year, date: utc(next, 9, 30), kind: 'extended', label: 'zurich' },
    { product: 'switzerland', year, date: utc(next, 11, 30), kind: 'final', label: 'zurich' },
    // The April window opened with the 2026 tax year; before that, filing ran all year.
    { product: 'spain', year, date: utc(next, 12, 31), kind: 'due', label: 'modelo210Own' },
    {
      product: 'spain',
      year,
      date: year >= 2026 ? utc(next, 4, 20) : utc(next, 1, 20),
      kind: 'due',
      label: 'modelo210Rented',
    },
    { product: 'germany', year, date: utc(next, 7, 31), kind: 'due', label: 'anlageV' },
    // "The last day of February" of the year after next, so a leap year moves it to the 29th.
    { product: 'germany', year, date: utc(next + 1, 3, 0), kind: 'final', label: 'anlageVAdviser' },
  ].sort((a, b) => a.date.getTime() - b.date.getTime()) as Deadline[]
}

/**
 * The next deadline still ahead for each product, newest tax year first. Two tax years are
 * enough: a return is never open longer than that.
 */
export function upcomingDeadlines(today: Date): Deadline[] {
  const from = today.getUTCFullYear() - 2
  const all = [from, from + 1, from + 2, from + 3].flatMap(scheduleFor)
  const seen = new Set<string>()
  return all
    .filter((d) => d.date.getTime() >= startOfDay(today).getTime())
    .filter((d) => {
      if (seen.has(d.label)) return false
      seen.add(d.label)
      return true
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

/** The next deadline for one product, or null when nothing is known for it. */
export function nextDeadline(product: Product['key'], today: Date): Deadline | null {
  return upcomingDeadlines(today).find((d) => d.product === product) ?? null
}

/** Whole days from today until the deadline; 0 means it falls today. */
export function daysUntil(deadline: Deadline, today: Date): number {
  const ms = deadline.date.getTime() - startOfDay(today).getTime()
  return Math.round(ms / 86_400_000)
}

function startOfDay(date: Date) {
  return utc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

/** The deadline date as the reader's language writes it. */
export function formatDeadlineDate(date: Date, language: string) {
  // Readers are in Europe, so plain "en" must not turn into the American "September 30, 2026".
  return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** "in 13 days", and its own word for today and tomorrow: the locale files carry no plurals. */
export function deadlineDaysLeft(days: number, t: (key: string, values?: Record<string, unknown>) => string) {
  if (days === 0) return t('deadlines.left.today')
  if (days === 1) return t('deadlines.left.tomorrow')
  return t('deadlines.left.days', { days })
}
