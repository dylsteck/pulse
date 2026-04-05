import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/use-is-mobile'

const MOBILE = 200
const DEFAULT_DESKTOP = 520
const MIN_DESKTOP = 400
const MAX_DESKTOP = 640

/** Pixel height for main Liveline on asset detail pages — scales with viewport. */
export function useAssetChartHeight(): number {
  const isMobile = useIsMobile()
  const [h, setH] = useState(DEFAULT_DESKTOP)

  useEffect(() => {
    if (isMobile) return
    const calc = () => {
      const next = Math.min(
        MAX_DESKTOP,
        Math.max(MIN_DESKTOP, Math.round(window.innerHeight * 0.48)),
      )
      setH(next)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [isMobile])

  return isMobile ? MOBILE : h
}
