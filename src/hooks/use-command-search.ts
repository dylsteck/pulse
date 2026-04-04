import { useMemo } from 'react'
import type { Market, Token } from '@/lib/types'
import type { MemeToken } from '@/lib/geckoterminal'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { useMemeTokens } from '@/hooks/use-meme-tokens'
import { usePerpMarkets } from '@/hooks/use-perps'

export type CommandSearchAssetType =
  | 'tokens'
  | 'markets'
  | 'perps'
  | 'memes'

export interface CommandSearchItem {
  type: CommandSearchAssetType
  id: string
  label: string
  subtitle?: string
  value: string
  raw: Token | Market | MemeToken | PerpMarketSnapshot
}

export function useCommandSearch() {
  const liveTokens = useLiveTokens()
  const liveMarkets = useLiveMarkets()
  const memeTokens = useMemeTokens()
  const perpsQuery = usePerpMarkets()

  const tokens = liveTokens.data ?? []
  const markets = liveMarkets.data ?? []
  const memes = memeTokens.data ?? []
  const perps = perpsQuery.data ?? []

  const items = useMemo(() => {
    const result: Array<CommandSearchItem> = []

    for (const t of tokens) {
      result.push({
        type: 'tokens',
        id: t.id,
        label: t.symbol,
        subtitle: t.name,
        value: `tokens:${t.id}`,
        raw: t,
      })
    }
    for (const m of markets) {
      result.push({
        type: 'markets',
        id: m.id,
        label: m.title,
        subtitle: undefined,
        value: `markets:${m.id}`,
        raw: m,
      })
    }
    for (const p of perps) {
      result.push({
        type: 'perps',
        id: p.id,
        label: p.coin,
        subtitle: undefined,
        value: `perps:${p.id}`,
        raw: p,
      })
    }
    for (const m of memes) {
      result.push({
        type: 'memes',
        id: m.id,
        label: m.symbol,
        subtitle: m.name,
        value: `memes:${m.id}`,
        raw: m,
      })
    }

    return result
  }, [tokens, markets, perps, memes])

  return { items }
}
