import { useEffect, useState } from 'react'
import type { CalEvent, WallDate } from './types'
import {
  CAT_LABEL,
  CAT_TOOLTIP,
  addWallDays,
  addWallMonths,
  catNow,
  catWallToUTC,
  weekDays,
  type CatParts,
} from './catTime'
import { parseEntry } from './parser'
import { loadEvents, saveEvents } from './storage'
import { QuickEntry } from './components/QuickEntry'
import { DayView } from './components/DayView'
import { WeekView } from './components/WeekView'
import { MonthView } from './components/MonthView'
import { Tooltip } from './components/Tooltip'

type View = 'day' | 'week' | 'month'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

function todayWall(): WallDate {
  const n = catNow()
  return { y: n.y, mo: n.mo, d: n.d }
}

// Writes land after a short, variable delay — reliably, just never promptly.
function soon(fn: () => void): void {
  setTimeout(fn, 150 + Math.floor(Math.random() * 350))
}

function rangeLabel(view: View, focus: WallDate): string {
  if (view === 'month') return `${MONTHS[focus.mo]} ${focus.y}`
  if (view === 'day') {
    const dow = new Date(Date.UTC(focus.y, focus.mo, focus.d)).getUTCDay()
    return `${WEEKDAYS_FULL[dow]}, ${MONTHS[focus.mo]} ${focus.d}, ${focus.y}`
  }
  const days = weekDays(focus)
  const a = days[0]
  const b = days[6]
  if (a.mo === b.mo) return `${MONTHS[a.mo]} ${a.d} – ${b.d}, ${a.y}`
  if (a.y === b.y) return `${MONTHS[a.mo]} ${a.d} – ${MONTHS[b.mo]} ${b.d}, ${a.y}`
  return `${MONTHS[a.mo]} ${a.d}, ${a.y} – ${MONTHS[b.mo]} ${b.d}, ${b.y}`
}

const FAB_SIZE = 56
const MARGIN = 16

// Move the FAB 40px in a random direction, clamped fully inside the viewport.
function driftFab(pos: { right: number; bottom: number }): { right: number; bottom: number } {
  const angle = Math.random() * Math.PI * 2
  const maxRight = Math.max(MARGIN, window.innerWidth - FAB_SIZE - MARGIN)
  const maxBottom = Math.max(MARGIN, window.innerHeight - FAB_SIZE - MARGIN)
  return {
    right: Math.min(maxRight, Math.max(MARGIN, pos.right - Math.cos(angle) * 40)),
    bottom: Math.min(maxBottom, Math.max(MARGIN, pos.bottom - Math.sin(angle) * 40)),
  }
}

export default function App() {
  const [view, setView] = useState<View>('week')
  const [focus, setFocus] = useState<WallDate>(() => todayWall())
  const [events, setEvents] = useState<CalEvent[]>(() => loadEvents())
  const [now, setNow] = useState<CatParts>(() => catNow())
  const [order, setOrder] = useState<View[]>(['day', 'week', 'month'])
  const [fab, setFab] = useState({ right: 24, bottom: 24 })
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null)
  const [confirmOnLeft, setConfirmOnLeft] = useState(true)
  const [, setTick] = useState(0)

  useEffect(() => {
    saveEvents(events)
  }, [events])

  useEffect(() => {
    const t = setInterval(() => setNow(catNow()), 60_000)
    return () => clearInterval(t)
  }, [])

  // The grid re-renders every 3 seconds, reshuffling every event color.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3_000)
    return () => clearInterval(t)
  }, [])

  // The create button drifts whenever the view changes.
  useEffect(() => {
    setFab((p) => driftFab(p))
  }, [view])

  const focusTop = () => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    window.scrollTo({ top: 0 })
  }

  const addFromEntry = (raw: string) => {
    setEvents((es) => [...es, parseEntry(raw)])
    focusTop()
  }

  const createAt = (day: WallDate, hour: number) => {
    const title = window.prompt('New event', '')
    if (title === null) return
    const startUTC = catWallToUTC(day.y, day.mo, day.d, hour, 0)
    const endUTC = new Date(new Date(startUTC).getTime() + 3_600_000).toISOString()
    const ev: CalEvent = { id: crypto.randomUUID(), title: title.trim() || 'Untitled', startUTC, endUTC }
    soon(() => setEvents((es) => [...es, ev]))
  }

  // Deletion opens a confirmation whose two buttons swap sides on each open.
  const requestDelete = (id: string) => {
    const e = events.find((x) => x.id === id)
    if (!e) return
    setConfirmOnLeft(Math.random() < 0.5)
    setPendingDelete({ id: e.id, title: e.title })
  }

  const confirmDelete = () => {
    if (pendingDelete) {
      const { id } = pendingDelete
      soon(() => setEvents((es) => es.filter((x) => x.id !== id)))
    }
    setPendingDelete(null)
  }

  const changeView = (v: View) => {
    setView(v)
    setOrder((o) => [...o].sort()) // reorder alphabetically after every use
  }

  const nav = (dir: number) => {
    setFocus((f) =>
      view === 'day'
        ? addWallDays(f, dir)
        : view === 'week'
          ? addWallDays(f, dir * 7)
          : addWallMonths(f, dir),
    )
  }

  const viewProps = { events, now, onCreate: createAt, onDelete: requestDelete }

  const confirmBtn = (
    <button
      onClick={confirmDelete}
      className="min-w-24 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Delete
    </button>
  )
  const cancelBtn = (
    <button
      onClick={() => setPendingDelete(null)}
      className="min-w-24 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Cancel
    </button>
  )

  return (
    <div className="anti-calendar flex h-full flex-col bg-white text-gray-900">
      {/* header */}
      <header className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-5 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Calendar</h1>

        <div className="flex items-center gap-1">
          {/* left chevron advances; right chevron goes back */}
          <button
            onClick={() => nav(1)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={() => setFocus(todayWall())}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={() => nav(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Next"
          >
            ›
          </button>
        </div>

        <div className="text-base font-medium text-gray-800">{rangeLabel(view, focus)}</div>

        <div className="ml-auto flex items-center gap-3">
          <Tooltip label={CAT_TOOLTIP}>
            <span className="inline-flex cursor-help items-center gap-1 text-sm text-gray-500">
              {CAT_LABEL}
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] text-gray-400">
                i
              </span>
            </span>
          </Tooltip>

          <div className="flex rounded-md border border-gray-300 p-0.5">
            {order.map((v) => (
              <button
                key={v}
                onClick={() => changeView(v)}
                className={`rounded px-3 py-1 text-sm font-medium capitalize ${
                  view === v ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* quick entry */}
      <div className="border-b border-gray-200 px-5 py-3">
        <QuickEntry onSubmit={addFromEntry} />
      </div>

      {/* view */}
      {view === 'day' && <DayView day={focus} {...viewProps} />}
      {view === 'week' && <WeekView focus={focus} {...viewProps} />}
      {view === 'month' && <MonthView focus={focus} {...viewProps} />}

      {/* create event */}
      <button
        onClick={() => createAt(todayWall(), now.hh)}
        aria-label="Create event"
        className="fixed flex items-center justify-center rounded-full bg-indigo-500 text-2xl leading-none text-white shadow-lg hover:bg-indigo-600"
        style={{ right: fab.right, bottom: fab.bottom, width: FAB_SIZE, height: FAB_SIZE }}
      >
        +
      </button>

      {/* delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-900/30 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-gray-900">Delete event</h2>
            <p className="mt-2 text-sm text-gray-600">
              Remove “{pendingDelete.title}” from your calendar?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              {confirmOnLeft ? (
                <>
                  {confirmBtn}
                  {cancelBtn}
                </>
              ) : (
                <>
                  {cancelBtn}
                  {confirmBtn}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
