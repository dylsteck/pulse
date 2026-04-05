import React from 'react'
import type { Token, Market } from '@/lib/types'
import type { MemeToken } from '@/lib/geckoterminal'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import type { GridFilters } from '@/lib/grid-filter-types'
import {
  TokenGridCard,
  MarketGridCard,
  MemeGridCard,
  PerpGridCard,
} from '@/components/dashboard/cards'
import { CardGrid, LoadingPanel } from '@/components/dashboard/shared'
import {
  filterTokensByNetwork,
  sortMemesForTrending,
  sortMarketsForTrending,
  sortPerpsForTrending,
  sortTokensForGrid,
} from '@/lib/grid-sorts'

type TrendingItem =
  | { kind: 'token'; data: Token }
  | { kind: 'market'; data: Market }
  | { kind: 'perp'; data: PerpMarketSnapshot }
  | { kind: 'meme'; data: MemeToken }

interface TrendingGridProps {
  tokens: Token[]
  markets: Market[]
  perps: PerpMarketSnapshot[]
  memes: MemeToken[]
  tokensLoading: boolean
  marketsLoading: boolean
  perpsLoading: boolean
  memesLoading: boolean
  filters: GridFilters
}

export function TrendingGrid({
  tokens,
  markets,
  perps,
  memes,
  tokensLoading,
  marketsLoading,
  perpsLoading,
  memesLoading,
  filters,
}: TrendingGridProps) {
  const allLoading = tokensLoading && marketsLoading && perpsLoading && memesLoading
  if (allLoading) {
    return <LoadingPanel label="Loading trending..." />
  }

  const topTokens = sortTokensForGrid(
    filterTokensByNetwork(tokens, filters.networks),
    filters.sort,
  )

  const topMarkets = sortMarketsForTrending(markets, filters.sort)

  const topPerps = sortPerpsForTrending(perps, filters.sort)

  const topMemes = sortMemesForTrending(memes, filters.sort)

  // Interleave: round-robin across categories
  const items: TrendingItem[] = []
  const maxLen = Math.max(topTokens.length, topMarkets.length, topPerps.length, topMemes.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < topTokens.length) items.push({ kind: 'token', data: topTokens[i] })
    if (i < topMarkets.length) items.push({ kind: 'market', data: topMarkets[i] })
    if (i < topPerps.length) items.push({ kind: 'perp', data: topPerps[i] })
    if (i < topMemes.length) items.push({ kind: 'meme', data: topMemes[i] })
  }

  return (
    <CardGrid>
      {items.map((item) => {
        switch (item.kind) {
          case 'token':
            return <TokenGridCard key={`t-${item.data.id}`} token={item.data} />
          case 'market':
            return <MarketGridCard key={`m-${item.data.id}`} market={item.data} />
          case 'perp':
            return <PerpGridCard key={`p-${item.data.id}`} market={item.data} />
          case 'meme':
            return <MemeGridCard key={`e-${item.data.id}`} meme={item.data} />
        }
      })}
    </CardGrid>
  )
}
