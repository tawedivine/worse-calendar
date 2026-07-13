import { useRef, useState, type ReactNode } from 'react'

const SHOW_DELAY = 1200
const HIDE_AFTER = 800

type Props = {
  label: string
  children: ReactNode
  className?: string
}

// Appears only after a long hover, then dismisses itself shortly after.
export function Tooltip({ label, children, className }: Props) {
  const [open, setOpen] = useState(false)
  const showTimer = useRef<number | undefined>(undefined)
  const hideTimer = useRef<number | undefined>(undefined)

  const clear = () => {
    window.clearTimeout(showTimer.current)
    window.clearTimeout(hideTimer.current)
  }

  const onEnter = () => {
    clear()
    showTimer.current = window.setTimeout(() => {
      setOpen(true)
      hideTimer.current = window.setTimeout(() => setOpen(false), HIDE_AFTER)
    }, SHOW_DELAY)
  }

  const onLeave = () => {
    clear()
    setOpen(false)
  }

  return (
    <span className={`relative inline-flex ${className ?? ''}`} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {open && (
        <span className="absolute top-full right-0 z-20 mt-2 w-72 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed font-normal text-gray-100 shadow-lg">
          {label}
        </span>
      )}
    </span>
  )
}
