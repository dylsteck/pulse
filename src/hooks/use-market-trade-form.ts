import { useCallback, useMemo, useState } from 'react'
import type { Market, MarketOutcome } from '@/lib/types'
import { useAuth } from '@/components/providers/auth-provider'
import { usePolymarketTrading } from '@/hooks/use-polymarket-trading'
import { usePolymarketGeoStatus } from '@/lib/polymarket/geo'
import { computeMarketTradeParams } from '@/lib/polymarket/trade-params'
import { cdpProjectId } from '@/lib/wagmi'

export function useMarketTradeForm(
  market: Market,
  outcome: MarketOutcome | undefined,
  defaultOutcome: 'yes' | 'no',
) {
  const { isSignedIn } = useAuth()
  const { data: isGeoBlocked } = usePolymarketGeoStatus()
  const {
    trade,
    status,
    error,
    result,
    reset,
    baseUsdcBalance,
    polygonUsdcBalance,
  } = usePolymarketTrading()

  const [side, setSide] = useState<'yes' | 'no'>(defaultOutcome)
  const [amount, setAmount] = useState('')

  const amountNum = parseFloat(amount) || 0

  const tradeParams = useMemo(
    () => computeMarketTradeParams(market, side, outcome),
    [market, side, outcome],
  )

  const estimatedShares =
    tradeParams && amountNum > 0
      ? (amountNum / tradeParams.price).toFixed(2)
      : '0'
  const potentialPayout =
    tradeParams && amountNum > 0
      ? (amountNum / tradeParams.price).toFixed(2)
      : '0'

  const handleTrade = useCallback(async () => {
    if (!tradeParams || amountNum <= 0) return

    await trade({
      tokenId: tradeParams.tokenId,
      side: 'BUY',
      amount: amountNum,
      price: tradeParams.price,
      negRisk: market.negRisk ?? false,
    })
  }, [trade, tradeParams, amountNum, market.negRisk])

  const isTrading =
    status !== 'idle' && status !== 'success' && status !== 'error'

  return {
    cdpProjectId,
    isSignedIn,
    isGeoBlocked,
    tradeParams,
    estimatedShares,
    potentialPayout,
    handleTrade,
    isTrading,
    status,
    error,
    result,
    reset,
    baseUsdcBalance,
    polygonUsdcBalance,
    side,
    setSide,
    amount,
    setAmount,
    amountNum,
  }
}
