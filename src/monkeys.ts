import { useEffect, useRef, useState } from 'react'

export type Monkey = { id: number; speed: number }

const MONKEY_COUNT = 7
const DRIFT_TICK_MS = 4_000
const DRIFT_STEP = 0.03
const MIN_SPEED = 0.6
const MAX_SPEED = 1.6
const SWAP_INTERVAL_MS = 60_000
const SWAP_TRANSITION_MS = 1_500

function shuffledIds(): number[] {
  const ids = Array.from({ length: MONKEY_COUNT }, (_, i) => i)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids
}

/**
 * Seven monkeys, never rendered. Each holds a speed that random-walks every
 * tick and is assigned to one day-of-week slot (0=Sun..6=Sat); the mapping
 * reshuffles on its own schedule. Callers only read back a per-day speed
 * multiplier and a matching transition duration — the grid geometry animates
 * off that, the monkeys themselves have no visible form.
 */
export function useMonkeys() {
  const [monkeys, setMonkeys] = useState<Monkey[]>(() =>
    Array.from({ length: MONKEY_COUNT }, (_, id) => ({ id, speed: 1 })),
  )
  const [assignment, setAssignment] = useState<number[]>(() => shuffledIds())
  const [swapping, setSwapping] = useState(false)
  const swapTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const t = setInterval(() => {
      setMonkeys((ms) =>
        ms.map((m) => {
          const next = m.speed + (Math.random() * 2 - 1) * DRIFT_STEP
          return { ...m, speed: Math.min(MAX_SPEED, Math.max(MIN_SPEED, next)) }
        }),
      )
    }, DRIFT_TICK_MS)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setAssignment(shuffledIds())
      setSwapping(true)
      clearTimeout(swapTimeout.current)
      swapTimeout.current = setTimeout(() => setSwapping(false), SWAP_TRANSITION_MS)
    }, SWAP_INTERVAL_MS)
    return () => {
      clearInterval(t)
      clearTimeout(swapTimeout.current)
    }
  }, [])

  return {
    speedForDow: (dow: number) => monkeys[assignment[dow]]?.speed ?? 1,
    transitionMs: swapping ? SWAP_TRANSITION_MS : DRIFT_TICK_MS,
  }
}
