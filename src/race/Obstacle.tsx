import { useState, type ReactElement } from 'react'
import type { CalEvent } from '../types'
import { formatClockUTC } from './raceTime'

export type ObstacleKind = 'hurdle' | 'tyres' | 'crate'

type Props = {
  event: CalEvent
  kind: ObstacleKind
  leftPct: number
  widthPct: number
  tripping: boolean
  onDelete: () => void
}

function Hurdle() {
  return (
    <svg viewBox="0 0 40 30" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
      <rect x="4" y="8" width="3.5" height="20" rx="1" fill="#4b4b4b" />
      <rect x="32.5" y="8" width="3.5" height="20" rx="1" fill="#4b4b4b" />
      <rect x="3" y="9" width="34" height="6" rx="1.5" fill="#e14b4b" />
      <rect x="14.5" y="9" width="6" height="6" fill="#f5f5f5" />
      <rect x="26" y="9" width="6" height="6" fill="#f5f5f5" />
    </svg>
  )
}

function Tyres() {
  return (
    <svg viewBox="0 0 40 30" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
      <ellipse cx="15" cy="22" rx="11" ry="6" fill="#2b2b2b" />
      <ellipse cx="15" cy="22" rx="5.5" ry="3" fill="#565656" />
      <ellipse cx="24" cy="15" rx="11" ry="6" fill="#333" />
      <ellipse cx="24" cy="15" rx="5.5" ry="3" fill="#5f5f5f" />
    </svg>
  )
}

function Crate() {
  return (
    <svg viewBox="0 0 40 30" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
      <rect x="4" y="6" width="32" height="22" rx="1.5" fill="#b9793f" />
      <path d="M4,6 L36,28 M36,6 L4,28" stroke="#8a5a2c" strokeWidth={2} />
      <rect x="4" y="6" width="32" height="22" rx="1.5" fill="none" stroke="#8a5a2c" strokeWidth={2} />
      <path
        d="M12,5 Q13,0 18,0 Q23,0 24,5 Q18,3 12,5 Z"
        fill="#f3d13a"
        stroke="#c9a622"
        strokeWidth={0.6}
      />
    </svg>
  )
}

const SHAPES: Record<ObstacleKind, () => ReactElement> = {
  hurdle: Hurdle,
  tyres: Tyres,
  crate: Crate,
}

export function Obstacle({ event, kind, leftPct, widthPct, tripping, onDelete }: Props) {
  const [hovered, setHovered] = useState(false)
  const Shape = SHAPES[kind]

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onDelete()
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        minWidth: 22,
        height: 30,
        animation: tripping ? 'race-obstacle-hit 0.6s ease-in-out 1' : undefined,
        transformOrigin: '50% 100%',
      }}
      aria-label={`${event.title} — click to remove`}
    >
      <Shape />
      {hovered && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-56 -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-left text-xs leading-snug text-gray-700 shadow-lg ring-1 ring-black/5">
          <div className="font-semibold text-gray-900">{event.title}</div>
          <div className="text-gray-500">
            {formatClockUTC(event.startUTC)} – {formatClockUTC(event.endUTC)}
          </div>
          {event.location && <div className="text-gray-500">{event.location}</div>}
        </div>
      )}
    </button>
  )
}
