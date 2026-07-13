import type { CalEvent, WallDate } from '../types'
import { catParts, formatCatClock, monthWeeks, sameWallDay, type CatParts } from '../catTime'
import { clamp8, randomSwatch, randomWeight } from '../palette'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Props = {
  focus: WallDate
  events: CalEvent[]
  now: CatParts
  onCreate: (day: WallDate, hour: number) => void
  onDelete: (id: string) => void
}

// Month view stacks weeks BOTTOM TO TOP: the 1st of the month sits at the bottom,
// the last day at the top. Days within each week row run left to right normally.
export function MonthView({ focus, events, now, onCreate, onDelete }: Props) {
  const naturalWeeks = monthWeeks(focus.y, focus.mo) // week containing the 1st is first
  const displayWeeks = [...naturalWeeks].reverse() // render reversed → first week at the bottom

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {/* weekday header (columns are unaffected by the vertical reversal) */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAY_ABBR.map((name) => (
          <div
            key={name}
            className="hov surf relative py-2 text-center text-[11px] tracking-wide text-gray-400 uppercase"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(auto-fit,minmax(0,1fr))]">
        {displayWeeks.map((week) =>
          week.map((d) => {
            const inMonth = d.mo === focus.mo
            const isToday = sameWallDay(d, now)
            const dayEvents = events
              .filter((e) => sameWallDay(catParts(e.startUTC), d))
              .sort((a, b) => a.startUTC.localeCompare(b.startUTC))
            return (
              <div
                key={`${d.y}-${d.mo}-${d.d}`}
                onClick={() => onCreate(d, now.hh)}
                className={`hov surf relative min-h-[104px] cursor-pointer p-1.5 ${
                  inMonth ? '' : 'bg-gray-50/60'
                }`}
              >
                <div
                  className={
                    isToday
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white'
                      : `text-xs font-semibold ${inMonth ? 'text-gray-700' : 'text-gray-300'}`
                  }
                >
                  {d.d}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        onDelete(e.id)
                      }}
                      className="block w-full overflow-hidden rounded border border-gray-200 px-1.5 py-0.5 text-left text-[11px] whitespace-nowrap text-white shadow-sm"
                      style={{ backgroundColor: randomSwatch(), fontWeight: randomWeight() }}
                    >
                      <span className="text-white/80">{formatCatClock(e.startUTC)}</span>{' '}
                      {clamp8(e.title)}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="px-1 text-[11px] text-gray-400">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
