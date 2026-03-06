import { useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { fetchTrendingSongs, fetchAudioDetail } from '@/lib/tortoise'

const PAGE_SIZE = 12

export function useTortoiseSongs(limit = PAGE_SIZE) {
  const query = useInfiniteQuery({
    queryKey: ['tortoise', 'trending', limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchTrendingSongs('30d', pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : null,
    staleTime: 3_600_000,
    gcTime: 3_600_000,
  })

  const data = useMemo(() => {
    const pages = query.data?.pages ?? []
    const lastPage = pages.at(-1)
    return {
      songs: pages.flatMap((page) => page.songs),
      pagination:
        lastPage?.pagination ?? {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      timeframe: lastPage?.timeframe,
    }
  }, [query.data, limit])

  return {
    ...query,
    data,
    hasMore: query.hasNextPage ?? false,
    loadMore: query.fetchNextPage,
    isFetchingMore: query.isFetchingNextPage,
  }
}

export function useAudioDetail(slug: string | null) {
  return useQuery({
    queryKey: ['tortoise', 'audio', slug],
    queryFn: () => fetchAudioDetail(slug!),
    enabled: !!slug,
  })
}
