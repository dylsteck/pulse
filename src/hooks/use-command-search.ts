import { useMemo } from 'react'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { useMemeTokens } from '@/hooks/use-meme-tokens'
import { useZoraCreators } from '@/hooks/use-zora-creators'
import { useTortoiseSongs } from '@/hooks/use-tortoise-songs'
import { usePerpMarkets } from '@/hooks/use-perps'
import type { Token } from '@/lib/types'
import type { Market } from '@/lib/types'
import type { CreatorToken } from '@/lib/zora/service'
import type { MemeToken } from '@/lib/geckoterminal'
import type { Song } from '@/lib/tortoise'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'

export type CommandSearchAssetType =
  | 'tokens'
  | 'markets'
  | 'creators'
  | 'music'
  | 'perps'
  | 'memes'

export interface CommandSearchItem {
  type: CommandSearchAssetType
  id: string
  label: string
  subtitle?: string
  value: string
  hasChart: boolean
  raw: Token | Market | CreatorToken | MemeToken | Song | PerpMarketSnapshot
}

export function useCommandSearch() {
  const liveTokens = useLiveTokens()
  const liveMarkets = useLiveMarkets()
  const memeTokens = useMemeTokens()
  const creatorsQuery = useZoraCreators(20)
  const songsQuery = useTortoiseSongs()
  const perpsQuery = usePerpMarkets()

  const tokens = liveTokens.data ?? []
  const markets = liveMarkets.data ?? []
  const memes = memeTokens.data ?? []
  const creators = creatorsQuery.items
  const songs = songsQuery.data?.songs ?? []
  const perps = perpsQuery.data ?? []

  const items = useMemo(() => {
    const result: CommandSearchItem[] = []

    for (const t of tokens) {
      result.push({
        type: 'tokens',
        id: t.id,
        label: t.symbol,
        subtitle: t.name,
        value: `tokens:${t.id}`,
        hasChart: true,
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
        hasChart: true,
        raw: m,
      })
    }
    for (const c of creators) {
      result.push({
        type: 'creators',
        id: c.id,
        label: c.name,
        subtitle: c.symbol,
        value: `creators:${c.id}`,
        hasChart: true,
        raw: c,
      })
    }
    for (const s of songs) {
      result.push({
        type: 'music',
        id: s.id,
        label: s.title,
        subtitle: s.artist,
        value: `music:${s.id}`,
        hasChart: false,
        raw: s,
      })
    }
    for (const p of perps) {
      result.push({
        type: 'perps',
        id: p.id,
        label: p.coin,
        subtitle: undefined,
        value: `perps:${p.id}`,
        hasChart: true,
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
        hasChart: true,
        raw: m,
      })
    }

    return result
  }, [tokens, markets, creators, songs, perps, memes])

  return { items }
}
