import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPolymarketEvents } from '@/lib/polymarket'
import type { Market } from '@/lib/mock/markets'

const PAGE_SIZE = 50

export function useLiveMarkets(initialLimit = PAGE_SIZE) {
  const [limit, setLimit] = useState(initialLimit)

  const query = useQuery({
    queryKey: ['polymarket', 'events', limit],
    queryFn: () => fetchPolymarketEvents(limit),
    refetchInterval: 15_000,
  })

  const [markets, setMarkets] = useState<Market[]>([])

  useEffect(() => {
    if (!query.data) return
    const now = Date.now() / 1000
    setMarkets((previous) => {
      const prevById = new Map(previous.map((market) => [market.id, market]))
      return query.data!.map((market) => {
        const prev = prevById.get(market.id)
        const history = [
          ...(prev?.priceHistory ?? []),
          { time: now, value: market.yesPercent },
        ].slice(-600)
        return {
          ...market,
          priceHistory: history,
        }
      })
    })
  }, [query.data])

  const loadMore = useCallback(() => {
    setLimit((prev) => prev + PAGE_SIZE)
  }, [])

  return useMemo(
    () => ({
      ...query,
      data: markets,
      loadMore,
      hasMore: markets.length >= limit,
    }),
    [query, markets, loadMore, limit],
  )
}
