import { useLayoutEffect, useState } from 'react'

const MOBILE_BREAKPOINT_PX = 768

const MOBILE_MIN = 260
const MOBILE_MAX = 380
const DEFAULT_DESKTOP = 520
const MIN_DESKTOP = 400
const MAX_DESKTOP = 640

/** Pixel height for main Liveline on asset detail pages — scales with viewport. */
export function useAssetChartHeight(): number {
  const [h, setH] = useState(DEFAULT_DESKTOP)

  useLayoutEffect(() => {
    const calc = () => {
      const mobile = window.matchMedia(
        `(max-width: ${MOBILE_BREAKPOINT_PX}px)`,
      ).matches
      if (mobile) {
        setH(
          Math.min(
            MOBILE_MAX,
            Math.max(MOBILE_MIN, Math.round(window.innerHeight * 0.4)),
          ),
        )
      } else {
        setH(
          Math.min(
            MAX_DESKTOP,
            Math.max(MIN_DESKTOP, Math.round(window.innerHeight * 0.48)),
          ),
        )
      }
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  return h
}
