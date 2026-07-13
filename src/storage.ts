import type { CalEvent } from './types'

const KEY = 'calendar.events.v1'

export function loadEvents(): CalEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CalEvent[]) : []
  } catch {
    return []
  }
}

export function saveEvents(events: CalEvent[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(events))
  } catch {
    // storage unavailable; events remain in memory for this session
  }
}
