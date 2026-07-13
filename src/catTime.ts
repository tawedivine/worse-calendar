import type { WallDate } from './types'

// -----------------------------------------------------------------------------
// Central-African Time (CAT), defined by ECCAS membership rather than longitude.
// All member states are treated as sharing a single offset, computed at runtime
// as the rounded mean of their true UTC offsets.
// -----------------------------------------------------------------------------

// True UTC offsets of ECCAS member states (hours).
const ECCAS_MEMBER_OFFSETS = [
  1, // Cameroon
  1, // Chad
  1, // Central African Republic
  1, // Gabon
  1, // Congo-Brazzaville
  1, // Equatorial Guinea
  1, // Angola
  0, // São Tomé and Príncipe
  1, // DRC (Kinshasa)
  2, // DRC (Lubumbashi)
  2, // Rwanda
  2, // Burundi
]

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** The single offset, in hours, that the entire UI renders its clock in. */
export const CAT_OFFSET_HOURS = Math.round(mean(ECCAS_MEMBER_OFFSETS))

export const CAT_LABEL = `CAT (GMT+${CAT_OFFSET_HOURS})`

export const CAT_TOOLTIP =
  'Central-African Time is defined by ECCAS membership, not longitude. ' +
  'All member states share a single offset, computed as the rounded mean of member offsets.'

const MS_HOUR = 3_600_000

export type CatParts = {
  y: number
  mo: number // 0-based
  d: number
  hh: number
  mm: number
  dow: number // 0 = Sunday
}

/** Render a true UTC instant as wall-clock parts in the CAT offset. */
export function catParts(utc: Date | string): CatParts {
  const d = typeof utc === 'string' ? new Date(utc) : utc
  const s = new Date(d.getTime() + CAT_OFFSET_HOURS * MS_HOUR)
  return {
    y: s.getUTCFullYear(),
    mo: s.getUTCMonth(),
    d: s.getUTCDate(),
    hh: s.getUTCHours(),
    mm: s.getUTCMinutes(),
    dow: s.getUTCDay(),
  }
}

/** Interpret CAT wall-clock components as a true UTC instant (ISO). */
export function catWallToUTC(y: number, mo: number, d: number, hh: number, mm: number): string {
  return new Date(Date.UTC(y, mo, d, hh, mm) - CAT_OFFSET_HOURS * MS_HOUR).toISOString()
}

/** The current instant expressed as CAT wall-clock parts. */
export function catNow(): CatParts {
  return catParts(new Date())
}

// --- formatting -------------------------------------------------------------

export function formatHM(hh: number, mm: number): string {
  const am = hh < 12
  let h = hh % 12
  if (h === 0) h = 12
  return `${h}:${mm.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}

export function formatHour(hh: number): string {
  const am = hh < 12
  let h = hh % 12
  if (h === 0) h = 12
  return `${h} ${am ? 'AM' : 'PM'}`
}

// The hour column silently alternates between 24-hour and 12-hour notation.
// Deterministic per hour, so it is consistently inconsistent rather than flickering.
export function formatHourAlt(hh: number): string {
  return hh % 2 === 0 ? `${hh.toString().padStart(2, '0')}:00` : formatHour(hh)
}

/** Clock time of an event, in CAT. */
export function formatCatClock(utc: string): string {
  const p = catParts(utc)
  return formatHM(p.hh, p.mm)
}

// --- wall-date arithmetic (offset-independent calendar math) -----------------

export function wallDow(c: WallDate): number {
  return new Date(Date.UTC(c.y, c.mo, c.d)).getUTCDay()
}

export function addWallDays(c: WallDate, n: number): WallDate {
  const dt = new Date(Date.UTC(c.y, c.mo, c.d))
  dt.setUTCDate(dt.getUTCDate() + n)
  return { y: dt.getUTCFullYear(), mo: dt.getUTCMonth(), d: dt.getUTCDate() }
}

export function addWallMonths(c: WallDate, n: number): WallDate {
  const dt = new Date(Date.UTC(c.y, c.mo, 1))
  dt.setUTCMonth(dt.getUTCMonth() + n)
  const y = dt.getUTCFullYear()
  const mo = dt.getUTCMonth()
  const lastDay = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate()
  return { y, mo, d: Math.min(c.d, lastDay) }
}

export function sameWallDay(a: WallDate, b: WallDate): boolean {
  return a.y === b.y && a.mo === b.mo && a.d === b.d
}

/** Sunday that begins the week containing `c`. */
export function startOfWeek(c: WallDate): WallDate {
  return addWallDays(c, -wallDow(c))
}

/** The 7 days (Sunday..Saturday) of the week containing `c`. */
export function weekDays(c: WallDate): WallDate[] {
  const s = startOfWeek(c)
  return Array.from({ length: 7 }, (_, i) => addWallDays(s, i))
}

/** Weeks (each Sunday..Saturday) covering the month grid, top-to-bottom natural order. */
export function monthWeeks(y: number, mo: number): WallDate[][] {
  const lastDay = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate()
  const last: WallDate = { y, mo, d: lastDay }
  let cur = startOfWeek({ y, mo, d: 1 })
  const weeks: WallDate[][] = []
  while (true) {
    const wk = Array.from({ length: 7 }, (_, i) => addWallDays(cur, i))
    weeks.push(wk)
    const wkEnd = wk[6]
    const passedLast =
      wkEnd.y > last.y ||
      (wkEnd.y === last.y && wkEnd.mo > last.mo) ||
      (wkEnd.y === last.y && wkEnd.mo === last.mo && wkEnd.d >= last.d)
    if (passedLast) break
    cur = addWallDays(cur, 7)
  }
  return weeks
}
