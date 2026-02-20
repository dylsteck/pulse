import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchCreatorsPage } from '@/lib/zora/service'

export function useZoraCreators(pageSize = 20) {
  const query = useInfiniteQuery({
    queryKey: ['zora', 'creators', pageSize],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchCreatorsPage({
        first: pageSize,
        after: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60_000,
  })

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  )

  return {
    ...query,
    items,
  }
}
