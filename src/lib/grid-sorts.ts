import type { Market, Token } from '@/lib/types'
import type { MemeToken } from '@/lib/geckoterminal'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import type { SortKey } from '@/lib/grid-filter-types'

function num(n: number | undefined) {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

export function filterTokensByNetwork(
  tokens: Array<Token>,
  networks: Array<number>,
): Array<Token> {
  if (networks.length === 0) return tokens
  const set = new Set(networks)
  return tokens.filter((t) => set.has(t.networkId))
}

export function sortTokensForGrid(tokens: Array<Token>, sort: SortKey): Array<Token> {
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

export function sortMarketsForGrid(markets: Array<Market>, sort: SortKey): Array<Market> {
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

export function sortMemesForGrid(memes: Array<MemeToken>, sort: SortKey): Array<MemeToken> {
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
  markets: Array<PerpMarketSnapshot>,
  sort: SortKey,
): Array<PerpMarketSnapshot> {
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
export function sortMarketsForTrending(markets: Array<Market>, sort: SortKey): Array<Market> {
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
  markets: Array<PerpMarketSnapshot>,
  sort: SortKey,
): Array<PerpMarketSnapshot> {
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

export function sortMemesForTrending(memes: Array<MemeToken>, sort: SortKey): Array<MemeToken> {
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
