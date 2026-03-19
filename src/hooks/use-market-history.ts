import { useQuery } from '@tanstack/react-query'
import { fetchPolymarketPriceHistory } from '@/lib/polymarket'

export function useMarketHistory(
  clobTokenId: string | undefined,
  windowLabel: string,
): {
  data: Array<{ time: number; value: number }>
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: ['polymarket', 'history', clobTokenId, windowLabel],
    queryFn: () => fetchPolymarketPriceHistory(clobTokenId!, windowLabel),
    staleTime: 60_000,
    refetchInterval: 60_000,
    enabled: !!clobTokenId,
  })

  return {
    data: data ?? [],
    isLoading,
  }
}
