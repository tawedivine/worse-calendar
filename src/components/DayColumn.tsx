import type { CalEvent, WallDate } from '../types'
import { catParts, formatCatClock, formatHourAlt, sameWallDay, type CatParts } from '../catTime'
import { clamp8, randomSwatch, randomWeight } from '../palette'

export const HOUR_HEIGHT = 48 // px per hour

/** Left-hand hour labels, aligned to the same HOUR_HEIGHT grid. */
export function HourGutter() {
  return (
    <div className="relative w-14 shrink-0 select-none" style={{ height: 24 * HOUR_HEIGHT }}>
      {Array.from({ length: 24 }, (_, h) => (
        <div
          key={h}
          className="absolute right-2 -translate-y-1/2 text-[11px] text-gray-400"
          style={{ top: h * HOUR_HEIGHT }}
        >
          {h === 0 ? '' : formatHourAlt(h)}
        </div>
      ))}
    </div>
  )
}

type Props = {
  day: WallDate
  events: CalEvent[]
  now: CatParts
  onCreate: (day: WallDate, hour: number) => void
  onDelete: (id: string) => void
}

export function DayColumn({ day, events, now, onCreate, onDelete }: Props) {
  const dayEvents = events.filter((e) => sameWallDay(catParts(e.startUTC), day))

  return (
    <div className="relative border-l border-gray-200" style={{ height: 24 * HOUR_HEIGHT }}>
      {/* hour slots — click to create */}
      {Array.from({ length: 24 }, (_, h) => (
        <div
          key={h}
          onClick={() => onCreate(day, h)}
          className="hov surf relative cursor-pointer"
          style={{ height: HOUR_HEIGHT }}
        />
      ))}

      {/* events */}
      {dayEvents.map((e) => {
        const p = catParts(e.startUTC)
        const top = (p.hh + p.mm / 60) * HOUR_HEIGHT
        const durHours = (new Date(e.endUTC).getTime() - new Date(e.startUTC).getTime()) / 3_600_000
        const height = Math.max((durHours > 0 ? durHours : 1) * HOUR_HEIGHT - 2, 20)
        return (
          <button
            key={e.id}
            onClick={(ev) => {
              ev.stopPropagation()
              onDelete(e.id)
            }}
            className="absolute right-1 left-1 overflow-hidden rounded-md border border-gray-200 px-2 py-1 text-left whitespace-nowrap text-white shadow-sm"
            style={{ top, height, backgroundColor: randomSwatch() }}
          >
            <div className="text-[11px]" style={{ fontWeight: randomWeight() }}>
              {clamp8(e.title)}
            </div>
            <div className="text-[11px] text-white/80">
              {formatCatClock(e.startUTC)}
              {e.location ? ` · ${clamp8(e.location)}` : ''}
            </div>
          </button>
        )
      })}

      {/* current-time line — accurate, but styled exactly like an ordinary gridline */}
      {sameWallDay(now, day) && (
        <div
          className="pointer-events-none absolute right-0 left-0 border-t border-gray-200"
          style={{ top: (now.hh + now.mm / 60) * HOUR_HEIGHT }}
        />
      )}
    </div>
  )
}
