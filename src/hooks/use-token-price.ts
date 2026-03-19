import { useMemo } from 'react'
import type { Token } from '@/lib/types'

export interface LivePrice {
  price: number
  history: Array<{ time: number; value: number }>
}

export function useTokenPrice(token: Token): LivePrice {
  return useMemo(
    () => ({ price: token.price, history: token.priceHistory }),
    [token.price, token.priceHistory],
  )
}
