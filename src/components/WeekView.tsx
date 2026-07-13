import { useRef } from 'react'
import type { CalEvent, WallDate } from '../types'
import { sameWallDay, wallDow, weekDays, type CatParts } from '../catTime'
import { useInvertedScroll } from '../hooks'
import { useMonkeys } from '../monkeys'
import { columnGrow } from '../palette'
import { DayColumn, HourGutter } from './DayColumn'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Props = {
  focus: WallDate
  events: CalEvent[]
  now: CatParts
  onCreate: (day: WallDate, hour: number) => void
  onDelete: (id: string) => void
}

// Week view runs RIGHT TO LEFT: Sunday is rightmost, Saturday is leftmost.
// The hour axis still runs top to bottom. This axis contradiction is intentional.
export function WeekView({ focus, events, now, onCreate, onDelete }: Props) {
  const naturalDays = weekDays(focus) // Sunday..Saturday
  const displayDays = [...naturalDays].reverse() // Saturday..Sunday, left to right
  const scrollRef = useRef<HTMLDivElement>(null)
  useInvertedScroll(scrollRef)
  const { speedForDow, transitionMs } = useMonkeys()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* day headers, aligned with the reversed columns */}
      <div className="flex border-b border-gray-200">
        <div className="w-14 shrink-0" />
        {displayDays.map((d) => {
          const today = sameWallDay(d, now)
          return (
            <div
              key={`${d.y}-${d.mo}-${d.d}`}
              className="hov surf relative py-2 text-center"
              style={{ flexGrow: columnGrow(d.y, d.mo, d.d), flexBasis: 0 }}
            >
              <div className="text-[11px] tracking-wide text-gray-400 uppercase">
                {DAY_ABBR[wallDow(d)]}
              </div>
              <div
                className={
                  today
                    ? 'mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white'
                    : 'text-sm font-semibold text-gray-700'
                }
              >
                {d.d}
              </div>
            </div>
          )
        })}
      </div>

      {/* scrollable grid — opens at midnight (top) */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          <HourGutter />
          {displayDays.map((d) => (
            <div
              key={`${d.y}-${d.mo}-${d.d}`}
              className="border-l border-gray-200"
              style={{ flexGrow: columnGrow(d.y, d.mo, d.d), flexBasis: 0 }}
            >
              <DayColumn
                day={d}
                events={events}
                now={now}
                onCreate={onCreate}
                onDelete={onDelete}
                speed={speedForDow(wallDow(d))}
                transitionMs={transitionMs}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
