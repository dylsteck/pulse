import { useMemo } from 'react'
import type { Market } from '@/lib/types'

export interface LiveOdds {
  yesPercent: number
  noPercent: number
  history: { time: number; value: number }[]
}

export function useMarketOdds(market: Market): LiveOdds {
  return useMemo(
    () => ({
      yesPercent: market.yesPercent,
      noPercent: parseFloat((100 - market.yesPercent).toFixed(1)),
      history: market.priceHistory,
    }),
    [market.yesPercent, market.priceHistory],
  )
}
