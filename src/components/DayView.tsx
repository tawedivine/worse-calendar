import { useRef } from 'react'
import type { CalEvent, WallDate } from '../types'
import type { CatParts } from '../catTime'
import { useInvertedScroll } from '../hooks'
import { DayColumn, HourGutter } from './DayColumn'

type Props = {
  day: WallDate
  events: CalEvent[]
  now: CatParts
  onCreate: (day: WallDate, hour: number) => void
  onDelete: (id: string) => void
}

// Day view is completely normal and correct: hours run top to bottom.
export function DayView({ day, events, now, onCreate, onDelete }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useInvertedScroll(scrollRef)
  return (
    <div ref={scrollRef} className="flex-1 overflow-auto">
      <div className="flex min-h-full">
        <HourGutter />
        <div className="flex-1 border-l border-gray-200">
          <DayColumn day={day} events={events} now={now} onCreate={onCreate} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}
