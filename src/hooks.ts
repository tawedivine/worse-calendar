import { useEffect, type RefObject } from 'react'

// Vertical wheel scrolling is inverted: scrolling down moves the grid down.
// Attached as a non-passive native listener so the default can be suppressed.
export function useInvertedScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      e.preventDefault()
      el.scrollTop -= e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [ref])
}
