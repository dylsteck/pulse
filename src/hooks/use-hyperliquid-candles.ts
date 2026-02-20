import { useQuery } from '@tanstack/react-query'
import {
  fetchHyperliquidCandles,
  type PerpCandleDataPoint,
} from '@/lib/hyperliquid/service'

export function useHyperliquidCandles(
  coin: string,
  windowLabel: string,
): {
  data: PerpCandleDataPoint[]
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hyperliquid', 'candles', coin, windowLabel],
    queryFn: () => fetchHyperliquidCandles(coin, windowLabel),
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled: !!coin,
  })

  return {
    data: data?.candles ?? [],
    isLoading,
    isError,
  }
}
