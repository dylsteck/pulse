import type { Token, Market } from '@/lib/types'
import type { MemeToken } from '@/lib/geckoterminal'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import type { NetworkFilter, SortKey } from '@/lib/grid-filter-types'

function num(n: number | undefined) {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

export function filterTokensByNetwork(
  tokens: Token[],
  network: NetworkFilter,
): Token[] {
  if (network === 'all') return tokens
  return tokens.filter((t) => t.networkId === network)
}

export function sortTokensForGrid(tokens: Token[], sort: SortKey): Token[] {
  const copy = tokens.slice()
  switch (sort) {
    case 'change':
      return copy.sort((a, b) => b.change24h - a.change24h)
    case 'volume':
      return copy.sort((a, b) => b.volume24h - a.volume24h)
    case 'marketCap':
      return copy.sort((a, b) => b.marketCap - a.marketCap)
    default:
      return copy
  }
}

export function sortMarketsForGrid(markets: Market[], sort: SortKey): Market[] {
  const copy = markets.slice()
  switch (sort) {
    case 'volume':
      return copy.sort((a, b) => b.volume - a.volume)
    case 'liquidity':
      return copy.sort((a, b) => num(b.liquidity) - num(a.liquidity))
    default:
      return copy.sort((a, b) => b.volume - a.volume)
  }
}

export function sortMemesForGrid(memes: MemeToken[], sort: SortKey): MemeToken[] {
  const copy = memes.slice()
  switch (sort) {
    case 'change':
      return copy.sort((a, b) => b.change24h - a.change24h)
    case 'volume':
      return copy.sort((a, b) => b.volume24h - a.volume24h)
    case 'valuation':
      return copy.sort((a, b) => b.valuation - a.valuation)
    case 'liquidity':
      return copy.sort((a, b) => b.liquidity - a.liquidity)
    default:
      return copy
  }
}

export function sortPerpsForGrid(
  markets: PerpMarketSnapshot[],
  sort: SortKey,
): PerpMarketSnapshot[] {
  const copy = markets.slice()
  switch (sort) {
    case 'volume':
      return copy.sort((a, b) => b.volume24h - a.volume24h)
    case 'change':
      return copy.sort((a, b) => b.change24h - a.change24h)
    default:
      return copy.sort((a, b) => b.volume24h - a.volume24h)
  }
}

/** Per-category sort for trending interleave (metrics align with tab “Sort by” labels). */
export function sortMarketsForTrending(markets: Market[], sort: SortKey): Market[] {
  const copy = markets.slice()
  switch (sort) {
    case 'change':
      return copy.sort((a, b) => b.volume - a.volume)
    case 'volume':
      return copy.sort((a, b) => b.volume - a.volume)
    case 'marketCap':
      return copy.sort((a, b) => num(b.liquidity) - num(a.liquidity))
    default:
      return copy
  }
}

export function sortPerpsForTrending(
  markets: PerpMarketSnapshot[],
  sort: SortKey,
): PerpMarketSnapshot[] {
  const copy = markets.slice()
  switch (sort) {
    case 'change':
      return copy.sort((a, b) => b.change24h - a.change24h)
    case 'volume':
      return copy.sort((a, b) => b.volume24h - a.volume24h)
    case 'marketCap':
      return copy.sort((a, b) => b.openInterest - a.openInterest)
    default:
      return copy
  }
}

export function sortMemesForTrending(memes: MemeToken[], sort: SortKey): MemeToken[] {
  const copy = memes.slice()
  switch (sort) {
    case 'change':
      return copy.sort((a, b) => b.change24h - a.change24h)
    case 'volume':
      return copy.sort((a, b) => b.volume24h - a.volume24h)
    case 'marketCap':
      return copy.sort((a, b) => b.valuation - a.valuation)
    default:
      return copy
  }
}
