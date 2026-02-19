import { useState, useEffect } from 'react'
import type { Token } from '@/lib/types'

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
  }, [token.id, token.price, token.priceHistory])

  return { price, history }
}
