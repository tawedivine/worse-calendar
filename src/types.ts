export type CalEvent = {
  id: string
  title: string
  startUTC: string // ISO, always the true instant
  endUTC: string // ISO, always the true instant
  location?: string
}

// A wall-clock calendar date (no time-of-day, no zone attached).
export type WallDate = { y: number; mo: number; d: number }
