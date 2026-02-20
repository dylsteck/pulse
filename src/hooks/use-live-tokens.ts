import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCodexBaseTokens } from '@/lib/codex'
import type { Token } from '@/lib/types'

const PAGE_SIZE = 50

export function useLiveTokens(initialLimit = PAGE_SIZE) {
  const [limit, setLimit] = useState(initialLimit)

  const query = useQuery({
    queryKey: ['codex', 'base-tokens', limit],
    queryFn: () => fetchCodexBaseTokens(limit),
    staleTime: 15_000,
    refetchInterval: 15_000,
  })

  const [tokens, setTokens] = useState<Token[]>([])

  useEffect(() => {
    if (!query.data) return
    const now = Date.now() / 1000
    setTokens((previous) => {
      const prevById = new Map(previous.map((token) => [token.id, token]))
      return query.data!.map((token) => {
        const prev = prevById.get(token.id)
        const history = [
          ...(prev?.priceHistory ?? []),
          { time: now, value: token.price },
        ].slice(-600)
        return {
          ...token,
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
      data: tokens,
      loadMore,
      hasMore: tokens.length >= limit,
    }),
    [query, tokens, loadMore, limit],
  )
}
