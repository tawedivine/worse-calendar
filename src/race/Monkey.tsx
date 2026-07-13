import type { CSSProperties } from 'react'

export type MonkeyState = 'idle' | 'running' | 'jumping' | 'tripping'

type Props = {
  state: MonkeyState
  /** Seconds per hop cycle while jumping — derived from the obstacle's real duration. */
  hopSeconds?: number
}

const BODY = '#8B5E34'
const BODY_DARK = '#6E4A29'
const BELLY = '#EAC79C'
const INK = '#3D2A1A'

/** A small, expressive monkey sprite. Built from flat shapes, not an image asset,
 * so it stays crisp at any size and self-contained (no external files to fetch). */
export function Monkey({ state, hopSeconds = 1.2 }: Props) {
  const bodyAnim =
    state === 'jumping'
      ? { animation: `race-jump-hop ${hopSeconds}s ease-in-out infinite` }
      : state === 'tripping'
        ? { animation: 'race-trip 0.6s ease-in-out 1' }
        : state === 'running'
          ? { animation: 'race-run-bob 0.5s ease-in-out infinite' }
          : { animation: 'race-idle-bob 2.4s ease-in-out infinite' }

  const legStyle = (which: 'front' | 'back'): CSSProperties => {
    if (state === 'running') {
      return {
        transformBox: 'fill-box',
        transformOrigin: '50% 0%',
        animation: `race-leg-${which} 0.4s ease-in-out infinite`,
      }
    }
    if (state === 'jumping') {
      return {
        transformBox: 'fill-box',
        transformOrigin: '50% 0%',
        transform: which === 'front' ? 'rotate(46deg)' : 'rotate(-40deg)',
      }
    }
    if (state === 'tripping') {
      return {
        transformBox: 'fill-box',
        transformOrigin: '50% 0%',
        transform: which === 'front' ? 'rotate(-30deg)' : 'rotate(38deg)',
      }
    }
    return { transformBox: 'fill-box', transformOrigin: '50% 0%', transform: 'rotate(6deg)' }
  }

  return (
    <svg viewBox="0 0 48 40" width="40" height="34" style={bodyAnim} aria-hidden>
      {/* tail */}
      <path
        d="M6,24 C-2,18 0,8 9,10"
        fill="none"
        stroke={BODY}
        strokeWidth={3.2}
        strokeLinecap="round"
        style={{
          transformBox: 'fill-box',
          transformOrigin: '100% 60%',
          animation: state === 'idle' || state === 'running' ? 'race-tail-sway 1.1s ease-in-out infinite' : undefined,
        }}
      />
      {/* back leg */}
      <g style={legStyle('back')}>
        <rect x="15" y="31" width="4.5" height="9" rx="2.2" fill={BODY_DARK} />
      </g>
      {/* back arm */}
      <rect x="12" y="19" width="4" height="9" rx="2" fill={BODY_DARK} />
      {/* body */}
      <ellipse cx="22" cy="25" rx="11" ry="9" fill={BODY} />
      <ellipse cx="23.5" cy="27" rx="6" ry="5.3" fill={BELLY} />
      {/* front arm */}
      <rect x="29" y="18" width="4" height="9" rx="2" fill={BODY} />
      {/* front leg */}
      <g style={legStyle('front')}>
        <rect x="26" y="31" width="4.5" height="9" rx="2.2" fill={BODY} />
      </g>
      {/* head */}
      <circle cx="33" cy="15" r="8" fill={BODY} />
      <circle cx="27.2" cy="9.2" r="3.2" fill={BODY} />
      <circle cx="27.2" cy="9.2" r="1.7" fill={BELLY} />
      <circle cx="37.4" cy="9" r="3.2" fill={BODY} />
      <circle cx="37.4" cy="9" r="1.7" fill={BELLY} />
      <ellipse cx="35.5" cy="17.2" rx="5" ry="4.4" fill={BELLY} />
      <circle cx="33.6" cy="13.6" r="1" fill={INK} />
      <circle cx="37.4" cy="13.4" r="1" fill={INK} />
      <circle cx="39.3" cy="16.6" r="0.8" fill={INK} />
      <path d="M36.2,18.2 Q38.2,19.8 40,18" fill="none" stroke={INK} strokeWidth={0.8} strokeLinecap="round" />
    </svg>
  )
}
