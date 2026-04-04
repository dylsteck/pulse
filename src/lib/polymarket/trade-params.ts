import type { Market, MarketOutcome } from '@/lib/types'

export function computeMarketTradeParams(
  market: Market,
  side: 'yes' | 'no',
  outcome?: MarketOutcome,
): { tokenId: string; price: number } | null {
  if (outcome) {
    return {
      tokenId: outcome.clobTokenId!,
      price: outcome.percent / 100,
    }
  }
  const yesTokenId = market.clobTokenId
  if (!yesTokenId) return null

  const price = side === 'yes' ? market.yesPercent / 100 : market.noPercent / 100
  return { tokenId: yesTokenId, price }
}
