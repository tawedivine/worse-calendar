import { useRef, type MouseEvent } from 'react'
import type { CalEvent, WallDate } from '../types'
import { formatDayLabel, localParts } from './raceTime'
import { Monkey, type MonkeyState } from './Monkey'
import { Obstacle, type ObstacleKind } from './Obstacle'

const OBSTACLE_KINDS: ObstacleKind[] = ['hurdle', 'tyres', 'crate']

function obstacleKind(id: string): ObstacleKind {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return OBSTACLE_KINDS[h % OBSTACLE_KINDS.length]
}

function eventFraction(iso: string): number {
  const p = localParts(iso)
  return (p.hh * 60 + p.mm) / (24 * 60)
}

type Props = {
  day: WallDate
  dayEvents: CalEvent[]
  status: 'past' | 'today' | 'future'
  monkeyFraction: number
  monkeyState: MonkeyState
  hopSeconds?: number
  transitionMs: number
  trippingId: string | null
  onCreate: (day: WallDate, hh: number, mm: number) => void
  onDeleteRequest: (event: CalEvent) => void
}

export function Lane({
  day,
  dayEvents,
  status,
  monkeyFraction,
  monkeyState,
  hopSeconds,
  transitionMs,
  trippingId,
  onCreate,
  onDeleteRequest,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handleTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const totalMinutes = Math.round((fraction * 24 * 60) / 5) * 5
    const clamped = Math.min(23 * 60 + 59, totalMinutes)
    onCreate(day, Math.floor(clamped / 60), clamped % 60)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 shrink-0 text-right text-[11px] font-semibold text-white/90 drop-shadow-sm">
        {formatDayLabel(day)}
      </div>
      {/* Positioning root — NOT clipped, so obstacle tooltips can escape upward. */}
      <div ref={trackRef} onClick={handleTrackClick} className="relative h-16 flex-1 cursor-pointer">
        {/* Decorative track surface — clipped to its rounded shape, sits behind everything. */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl shadow-inner"
          style={{
            background:
              'repeating-linear-gradient(90deg, #6bbf59 0, #6bbf59 22px, #5fae4e 22px, #5fae4e 44px)',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35), inset 0 6px 10px rgba(0,0,0,0.08)',
          }}
        >
          {/* fenceposts — faint, unlabelled hour marks */}
          {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
            <div
              key={h}
              className="absolute top-1/2 -translate-y-1/2 rounded-full bg-black/15"
              style={{ left: `${(h / 24) * 100}%`, width: 2, height: '55%' }}
            />
          ))}

          {/* start line */}
          <div className="absolute top-0 left-0 h-full w-1.5 bg-white/70" />
          {/* finish line — checkered */}
          <div
            className="absolute top-0 right-0 h-full w-2.5"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)',
              backgroundSize: '5px 5px',
              backgroundColor: '#f5f5f5',
            }}
          />
        </div>

        {dayEvents.map((ev) => {
          const leftPct = eventFraction(ev.startUTC) * 100
          const durMin = (new Date(ev.endUTC).getTime() - new Date(ev.startUTC).getTime()) / 60_000
          const widthPct = Math.max((durMin / (24 * 60)) * 100, 1.6)
          return (
            <Obstacle
              key={ev.id}
              event={ev}
              kind={obstacleKind(ev.id)}
              leftPct={leftPct}
              widthPct={widthPct}
              tripping={trippingId === ev.id}
              onDelete={() => onDeleteRequest(ev)}
            />
          )
        })}

        <div
          className="pointer-events-none absolute top-1/2 z-10"
          style={{
            left: `${monkeyFraction * 100}%`,
            transform: `translate(${status === 'past' ? '-100%' : status === 'future' ? '0%' : '-50%'}, -50%)`,
            transition: `left ${transitionMs}ms linear`,
          }}
        >
          <Monkey state={monkeyState} hopSeconds={hopSeconds} />
        </div>
      </div>
    </div>
  )
}
