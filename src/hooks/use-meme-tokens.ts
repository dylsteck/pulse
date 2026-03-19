import { useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { MemeToken } from '@/lib/geckoterminal'
import { fetchMemeTokenDetail, fetchMemeTokens } from '@/lib/geckoterminal'

export function useMemeTokens() {
  const query = useInfiniteQuery({
    queryKey: ['geckoterminal', 'memes'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchMemeTokens(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: false,
  })

  const pageItems = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  )
  const [items, setItems] = useState<Array<MemeToken>>([])

  useEffect(() => {
    if (pageItems.length === 0) {
      setItems([])
      return
    }

    const now = Date.now() / 1000
    setItems((previous) => {
      const previousById = new Map(previous.map((item) => [item.id, item]))
      return pageItems.map((item) => {
        const previousItem = previousById.get(item.id)
        return {
          ...item,
          priceHistory: [
            ...(previousItem?.priceHistory ?? []),
            { time: now, value: item.price },
          ].slice(-600),
        }
      })
    })
  }, [pageItems])

  return {
    ...query,
    data: items,
    hasMore: query.hasNextPage ?? false,
    loadMore: query.fetchNextPage,
    isFetching: query.isFetchingNextPage,
  }
}

export function useMemeTokenDetail(address: string | null) {
  return useQuery({
    queryKey: ['geckoterminal', 'memes', 'detail', address],
    enabled: Boolean(address),
    queryFn: async () => fetchMemeTokenDetail(address!),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
