import { useState, useEffect } from 'react'
import type { Token } from '@/lib/mock/tokens'

export interface LivePrice {
  price: number
  history: { time: number; value: number }[]
}

export function useTokenPrice(token: Token): LivePrice {
  const [price, setPrice] = useState(token.price)
  const [history, setHistory] = useState(token.priceHistory)

  useEffect(() => {
    setPrice(token.price)
    setHistory(token.priceHistory)
  }, [token.id])

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = prev * (Math.random() - 0.49) * 0.003
        const next = Math.max(prev + change, 0.0001)
        setHistory((h) => {
          const updated = [...h, { time: Date.now() / 1000, value: next }]
          // Keep enough points to fill the 9000s window (600 × 1.5s = 900s of live data)
          return updated.slice(-600)
        })
        return next
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [token.id])

  return { price, history }
}
