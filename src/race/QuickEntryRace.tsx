import { useState } from 'react'

type Props = {
  onSubmit: (raw: string) => void
}

// A perfectly ordinary text field — this mode has nothing to hide.
export function QuickEntryRace({ onSubmit }: Props) {
  const [value, setValue] = useState('')

  const submit = () => {
    if (value.trim().length === 0) return
    onSubmit(value)
    setValue('')
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') submit()
      }}
      placeholder="Lunch with Sam Thursday 1pm at Kilo"
      spellCheck={false}
      autoComplete="off"
      className="h-11 w-full rounded-full border-2 border-white/70 bg-white/95 px-5 text-[15px] text-gray-800 shadow-md outline-none placeholder:text-gray-400 focus:border-yellow-300"
    />
  )
}
