import type { CalEvent, WallDate } from './types'
import { addWallDays, catNow, catWallToUTC } from './catTime'

// The parser is genuinely correct. It consumes the raw, unmodified string and
// resolves the event's true instant. Times are interpreted in the CAT clock the
// user sees, so a typed "1pm" lands where the UI shows 1pm — internally coherent.
// On failure it silently defaults to today at the current hour (no error signal).

const WEEKDAY_INDEX: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
}

const WEEKDAY_ALTERNATION = Object.keys(WEEKDAY_INDEX).sort((a, b) => b.length - a.length).join('|')

type ParsedTime = { hh: number; mm: number } | null

function parseTime(s: string): { time: ParsedTime; rest: string } {
  // 12-hour, with optional minutes: "1pm", "1:30 pm", "12am"
  const ampm = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
  if (ampm) {
    let hh = parseInt(ampm[1], 10) % 12
    if (ampm[3].toLowerCase() === 'pm') hh += 12
    const mm = ampm[2] ? parseInt(ampm[2], 10) : 0
    return { time: { hh, mm }, rest: s.replace(ampm[0], ' ') }
  }
  // 24-hour: "13:00"
  const h24 = s.match(/\b(\d{1,2}):(\d{2})\b/)
  if (h24) {
    const hh = parseInt(h24[1], 10)
    const mm = parseInt(h24[2], 10)
    if (hh < 24 && mm < 60) return { time: { hh, mm }, rest: s.replace(h24[0], ' ') }
  }
  return { time: null, rest: s }
}

function parseLocation(s: string): { location?: string; rest: string } {
  // Trailing "at <place>".
  const m = s.match(/\bat\s+(.+?)\s*$/i)
  if (m && m.index !== undefined) {
    return { location: m[1].trim(), rest: s.slice(0, m.index) }
  }
  return { rest: s }
}

function parseDay(s: string, today: WallDate, todayDow: number): { day: WallDate; rest: string } {
  const re = new RegExp(`\\b(today|tomorrow|${WEEKDAY_ALTERNATION})\\b`, 'i')
  const m = s.match(re)
  if (!m) return { day: today, rest: s }
  const word = m[1].toLowerCase()
  const rest = s.replace(m[0], ' ')
  if (word === 'today') return { day: today, rest }
  if (word === 'tomorrow') return { day: addWallDays(today, 1), rest }
  const target = WEEKDAY_INDEX[word]
  const diff = (target - todayDow + 7) % 7 // 0..6; 0 means today
  return { day: addWallDays(today, diff), rest }
}

function cleanTitle(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > 0 ? t : 'Untitled'
}

export function parseEntry(raw: string): CalEvent {
  const now = catNow()
  const today: WallDate = { y: now.y, mo: now.mo, d: now.d }

  const { time, rest: afterTime } = parseTime(raw)
  const { location, rest: afterLoc } = parseLocation(afterTime)
  const { day, rest: afterDay } = parseDay(afterLoc, today, now.dow)

  const hh = time ? time.hh : now.hh
  const mm = time ? time.mm : 0

  const startUTC = catWallToUTC(day.y, day.mo, day.d, hh, mm)
  const endUTC = new Date(new Date(startUTC).getTime() + 3_600_000).toISOString()

  return {
    id: crypto.randomUUID(),
    title: cleanTitle(afterDay),
    startUTC,
    endUTC,
    ...(location ? { location } : {}),
  }
}
