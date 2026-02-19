import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPolymarketEvents } from '@/lib/polymarket'

const PAGE_SIZE = 20

export function useLiveMarkets() {
  const query = useInfiniteQuery({
    queryKey: ['polymarket', 'events', PAGE_SIZE],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchPolymarketEvents(PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    refetchInterval: 15_000,
  })

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  )

  return {
    ...query,
    data: items,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
  }
}
