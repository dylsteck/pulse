import React from 'react'
import type { Token, Market } from '@/lib/types'
import type { MemeToken } from '@/lib/geckoterminal'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import {
  TokenGridCard,
  MarketGridCard,
  MemeGridCard,
  PerpGridCard,
} from '@/components/dashboard/cards'
import { LoadingPanel } from '@/components/dashboard/shared'

const ITEMS_PER_TYPE = 6

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
}: TrendingGridProps) {
  const allLoading = tokensLoading && marketsLoading && perpsLoading && memesLoading
  if (allLoading) {
    return <LoadingPanel label="Loading trending..." />
  }

  const topTokens = tokens
    .slice()
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, ITEMS_PER_TYPE)

  const topMarkets = markets
    .slice()
    .sort((a, b) => b.volume - a.volume)
    .slice(0, ITEMS_PER_TYPE)

  const topPerps = perps
    .slice()
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, ITEMS_PER_TYPE)

  const topMemes = memes
    .slice()
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, ITEMS_PER_TYPE)

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
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
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
    </div>
  )
}
