import type { WallDate } from '../types'

// Independent of catTime.ts on purpose: Monkey Race is a separate, honest mode.
// No artificial offset — this is the browser's real local time, always.

export type LocalParts = {
  y: number
  mo: number // 0-based
  d: number
  hh: number
  mm: number
  dow: number // 0 = Sunday
}

export function localParts(utc: Date | string): LocalParts {
  const n = typeof utc === 'string' ? new Date(utc) : utc
  return {
    y: n.getFullYear(),
    mo: n.getMonth(),
    d: n.getDate(),
    hh: n.getHours(),
    mm: n.getMinutes(),
    dow: n.getDay(),
  }
}

export function localNow(): LocalParts {
  return localParts(new Date())
}

/** Interpret local wall-clock components as a true UTC instant (ISO). */
export function wallToUTC(y: number, mo: number, d: number, hh: number, mm: number): string {
  return new Date(y, mo, d, hh, mm).toISOString()
}

export function sameWallDay(a: { y: number; mo: number; d: number }, b: { y: number; mo: number; d: number }): boolean {
  return a.y === b.y && a.mo === b.mo && a.d === b.d
}

export function addWallDays(c: WallDate, n: number): WallDate {
  const dt = new Date(c.y, c.mo, c.d)
  dt.setDate(dt.getDate() + n)
  return { y: dt.getFullYear(), mo: dt.getMonth(), d: dt.getDate() }
}

export function wallDow(c: WallDate): number {
  return new Date(c.y, c.mo, c.d).getDay()
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

export function compareWallDay(a: WallDate, b: WallDate): number {
  if (a.y !== b.y) return a.y - b.y
  if (a.mo !== b.mo) return a.mo - b.mo
  return a.d - b.d
}

/** Fraction of the day elapsed, 0..1, from local hh:mm. */
export function dayFraction(hh: number, mm: number): number {
  return (hh * 60 + mm) / (24 * 60)
}

export function formatClock(hh: number, mm: number): string {
  const am = hh < 12
  let h = hh % 12
  if (h === 0) h = 12
  return `${h}:${mm.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}

export function formatClockUTC(utc: string): string {
  const p = localParts(utc)
  return formatClock(p.hh, p.mm)
}

const MONTHS_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatDayLabel(d: WallDate): string {
  return `${MONTHS_ABBR[d.mo]} ${d.d}`
}
