import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPolymarketBatchPriceHistory } from '@/lib/polymarket'

function dedupeSortedIds(ids: Array<string>): Array<string> {
  return [...new Set(ids)].filter(Boolean).sort()
}

/**
 * Batched Polymarket CLOB price history for multiple token ids (one request per window).
 */
export function useMarketBatchHistory(
  tokenIds: Array<string>,
  windowLabel: string,
): {
  data: Record<string, Array<{ time: number; value: number }>>
  isLoading: boolean
} {
  const idsFingerprint = [...tokenIds].filter(Boolean).sort().join('|')
  const uniqueSorted = useMemo(() => dedupeSortedIds(tokenIds), [idsFingerprint])
  const { data, isLoading } = useQuery({
    queryKey: ['polymarket', 'batch-history', idsFingerprint, windowLabel],
    queryFn: () => fetchPolymarketBatchPriceHistory(uniqueSorted, windowLabel),
    staleTime: 60_000,
    refetchInterval: 60_000,
    enabled: uniqueSorted.length > 0,
  })

  return {
    data: data ?? {},
    isLoading,
  }
}
