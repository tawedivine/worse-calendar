import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { CalEvent, WallDate } from '../types'
import { compareWallDay, dayFraction, localNow, localParts, sameWallDay, weekDays } from './raceTime'
import { loadRaceEvents, saveRaceEvents } from './raceStorage'
import { parseRaceEntry } from './raceParser'
import { Lane } from './Lane'
import { QuickEntryRace } from './QuickEntryRace'
import type { MonkeyState } from './Monkey'

const TICK_MS = 15_000

function todayWall(): WallDate {
  const n = localNow()
  return { y: n.y, mo: n.mo, d: n.d }
}

/** Per-hop cycle length while jumping, scaled from the obstacle's real duration. */
function hopSecondsFor(durationMs: number): number {
  return Math.min(3, Math.max(0.5, durationMs / 200_000))
}

function Cloud({ style }: { style: CSSProperties }) {
  return (
    <div
      className="pointer-events-none absolute opacity-90"
      style={{ animation: 'race-cloud-drift 14s ease-in-out infinite alternate', ...style }}
    >
      <svg width="70" height="30" viewBox="0 0 70 30" aria-hidden>
        <ellipse cx="20" cy="18" rx="18" ry="11" fill="#fff" />
        <ellipse cx="38" cy="12" rx="16" ry="12" fill="#fff" />
        <ellipse cx="52" cy="18" rx="14" ry="9" fill="#fff" />
      </svg>
    </div>
  )
}

function Crowd() {
  const colors = ['#e5484d', '#f5a623', '#4c9aff', '#7ed321', '#bd4cff', '#ff7ab6']
  return (
    <div className="flex h-full w-full items-end gap-1 px-2">
      {Array.from({ length: 60 }, (_, i) => (
        <div
          key={i}
          className="h-3.5 w-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  )
}

export function RaceApp() {
  const [events, setEvents] = useState<CalEvent[]>(() => loadRaceEvents())
  const [now, setNow] = useState<Date>(() => new Date())
  const [trippingId, setTrippingId] = useState<string | null>(null)
  const tripTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    saveRaceEvents(events)
  }, [events])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), TICK_MS)
    return () => clearInterval(t)
  }, [])

  useEffect(() => () => clearTimeout(tripTimeout.current), [])

  const today = todayWall()
  const days = useMemo(() => weekDays(today), [today.y, today.mo, today.d])
  const nowParts = localParts(now)

  const addFromEntry = (raw: string) => {
    setEvents((es) => [...es, parseRaceEntry(raw)])
  }

  const createAt = (day: WallDate, hh: number, mm: number) => {
    const h12 = hh % 12 === 0 ? 12 : hh % 12
    const label = `${h12}:${mm.toString().padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`
    const title = window.prompt(`New event at ${label}`, '')
    if (title === null) return
    const startUTC = new Date(day.y, day.mo, day.d, hh, mm).toISOString()
    const endUTC = new Date(new Date(startUTC).getTime() + 3_600_000).toISOString()
    const ev: CalEvent = { id: crypto.randomUUID(), title: title.trim() || 'Untitled', startUTC, endUTC }
    setEvents((es) => [...es, ev])
  }

  const requestDelete = (event: CalEvent) => {
    if (trippingId) return
    setTrippingId(event.id)
    tripTimeout.current = setTimeout(() => {
      setEvents((es) => es.filter((e) => e.id !== event.id))
      setTrippingId(null)
    }, 550)
  }

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: 'linear-gradient(#8fd3ff 0%, #bfe8ff 55%, #d8f3c7 100%)' }}
    >
      <div className="pointer-events-none absolute top-6 right-10 h-16 w-16 rounded-full bg-yellow-200 shadow-[0_0_40px_12px_rgba(255,241,150,0.8)]" />
      <Cloud style={{ top: 20, left: '10%' }} />
      <Cloud style={{ top: 55, left: '55%' }} />

      <div className="pointer-events-none relative z-0 h-6 shrink-0 overflow-hidden opacity-70">
        <Crowd />
      </div>

      <header className="relative z-10 px-6 pt-2 pb-3 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
          🐒 Monkey Race
        </h1>
      </header>

      <div className="relative z-10 flex-1 space-y-2.5 overflow-auto px-6 pb-3">
        {days.map((day) => {
          const cmp = compareWallDay(day, today)
          const status: 'past' | 'today' | 'future' = cmp < 0 ? 'past' : cmp > 0 ? 'future' : 'today'
          const dayEvents = events.filter((e) => sameWallDay(localParts(e.startUTC), day))

          const monkeyFraction =
            status === 'past' ? 1 : status === 'future' ? 0 : dayFraction(nowParts.hh, nowParts.mm)
          let monkeyState: MonkeyState = status === 'today' ? 'running' : 'idle'
          let hopSeconds: number | undefined

          if (status === 'today') {
            const active = dayEvents.find(
              (e) => new Date(e.startUTC).getTime() <= now.getTime() && now.getTime() < new Date(e.endUTC).getTime(),
            )
            if (active) {
              monkeyState = 'jumping'
              hopSeconds = hopSecondsFor(new Date(active.endUTC).getTime() - new Date(active.startUTC).getTime())
            }
          }
          if (trippingId && dayEvents.some((e) => e.id === trippingId)) {
            monkeyState = 'tripping'
          }

          return (
            <Lane
              key={`${day.y}-${day.mo}-${day.d}`}
              day={day}
              dayEvents={dayEvents}
              status={status}
              monkeyFraction={monkeyFraction}
              monkeyState={monkeyState}
              hopSeconds={hopSeconds}
              transitionMs={TICK_MS}
              trippingId={trippingId}
              onCreate={createAt}
              onDeleteRequest={requestDelete}
            />
          )
        })}
      </div>

      <div className="relative z-10 px-6 pb-6">
        <QuickEntryRace onSubmit={addFromEntry} />
      </div>
    </div>
  )
}
