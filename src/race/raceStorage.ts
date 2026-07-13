import type { CalEvent } from '../types'

// Deliberately its own key: Monkey Race keeps a fully separate event list from
// the Anti-Calendar, even though both use the same CalEvent shape.
const KEY = 'race.events.v1'

export function loadRaceEvents(): CalEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CalEvent[]) : []
  } catch {
    return []
  }
}

export function saveRaceEvents(events: CalEvent[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(events))
  } catch {
    // storage unavailable; events remain in memory for this session
  }
}
