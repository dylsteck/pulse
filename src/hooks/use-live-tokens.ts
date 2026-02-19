import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCodexBaseTokens } from '@/lib/codex'
import type { Token } from '@/lib/mock/tokens'

export function useLiveTokens(limit = 40) {
  const query = useQuery({
    queryKey: ['codex', 'base-tokens', limit],
    queryFn: () => fetchCodexBaseTokens(limit),
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
        const history = [...(prev?.priceHistory ?? []), { time: now, value: token.price }].slice(-600)
        return {
          ...token,
          priceHistory: history,
        }
      })
    })
  }, [query.data])

  return useMemo(
    () => ({
      ...query,
      data: tokens,
    }),
    [query, tokens],
  )
}
