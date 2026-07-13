import { useEffect, useState } from 'react'
import App from './App'
import { RaceApp } from './race/RaceApp'

type Mode = 'calendar' | 'race'

function modeFromHash(): Mode {
  return window.location.hash === '#race' ? 'race' : 'calendar'
}

export default function Root() {
  const [mode, setMode] = useState<Mode>(() => modeFromHash())

  useEffect(() => {
    const onHash = () => setMode(modeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (m: Mode) => {
    window.location.hash = m === 'race' ? 'race' : ''
    setMode(m)
  }

  return (
    <div className="h-full">
      {mode === 'race' ? <RaceApp /> : <App />}
      <button
        onClick={() => go(mode === 'race' ? 'calendar' : 'race')}
        title={mode === 'race' ? 'Switch to Anti-Calendar' : 'Switch to Monkey Race'}
        className="fixed top-1.5 right-1.5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/70 text-base shadow-lg backdrop-blur hover:bg-gray-900"
      >
        {mode === 'race' ? '📅' : '🐒'}
      </button>
    </div>
  )
}
