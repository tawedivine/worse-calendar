import { useRef, useState } from 'react'

type Props = {
  onSubmit: (raw: string) => void
}

const PLACEHOLDER = 'Lunch with Sam Thursday 1pm at Kilo'

// Quick-entry field. The value is captured and submitted verbatim; the parser
// receives the raw string. The rendering is the only thing altered: the first
// four characters of the whole entry show normally, and every character from
// index 4 onward is horizontally mirrored — mid-word included. A monospace face
// keeps each glyph's advance fixed, so the (transparent) input's caret stays
// aligned with the visible, mirrored overlay.
export function QuickEntry({ onSubmit }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const syncScroll = () => {
    if (overlayRef.current && inputRef.current) {
      overlayRef.current.scrollLeft = inputRef.current.scrollLeft
    }
  }

  const submit = () => {
    if (value.trim().length === 0) return
    onSubmit(value)
    setValue('')
    if (overlayRef.current) overlayRef.current.scrollLeft = 0
    inputRef.current?.blur()
  }

  return (
    <div className="relative h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-white font-mono text-[15px] shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
      {/* visible overlay */}
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-4"
      >
        {value.length === 0 ? (
          <span className="text-gray-400">{PLACEHOLDER}</span>
        ) : (
          [...value].map((ch, i) => (
            <span
              key={i}
              style={i >= 4 ? { display: 'inline-block', transform: 'scaleX(-1)' } : undefined}
            >
              {ch}
            </span>
          ))
        )}
      </div>

      {/* real input — captures typing; text itself is transparent, caret visible */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        onScroll={syncScroll}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="absolute inset-0 h-full w-full bg-transparent px-4 text-transparent whitespace-pre caret-gray-900 outline-none"
      />
    </div>
  )
}
