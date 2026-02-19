import { useState, useEffect } from 'react'
import type { Market } from '@/lib/types'

export interface LiveOdds {
  yesPercent: number
  noPercent: number
  history: { time: number; value: number }[]
}

export function useMarketOdds(market: Market): LiveOdds {
  const [yesPercent, setYesPercent] = useState(market.yesPercent)
  const [history, setHistory] = useState(market.priceHistory)

  useEffect(() => {
    setYesPercent(market.yesPercent)
    setHistory(market.priceHistory)
  }, [market.id, market.yesPercent, market.priceHistory])

  return {
    yesPercent,
    noPercent: parseFloat((100 - yesPercent).toFixed(1)),
    history,
  }
}
