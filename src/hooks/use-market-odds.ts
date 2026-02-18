import { useState, useEffect } from 'react'
import type { Market } from '@/lib/mock/markets'

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
  }, [market.id])

  useEffect(() => {
    const interval = setInterval(() => {
      setYesPercent((prev) => {
        const drift = (Math.random() - 0.5) * 0.3
        const next = Math.max(1, Math.min(99, prev + drift))
        setHistory((h) => {
          const updated = [...h, { time: Date.now() / 1000, value: next }]
          return updated.slice(-600)
        })
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [market.id])

  return { yesPercent, noPercent: parseFloat((100 - yesPercent).toFixed(1)), history }
}
