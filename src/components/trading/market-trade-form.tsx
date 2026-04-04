import type { Market, MarketOutcome } from '@/lib/types'
import {
  MarketTradeGeoBlocked,
  MarketTradeSignInPrompt,
  MarketTradeSuccess,
  MarketTradeWalletNotConfigured,
} from '@/components/trading/market-trade-form-gates'
import { MarketTradeFormFields } from '@/components/trading/market-trade-form-fields'
import { useMarketTradeForm } from '@/hooks/use-market-trade-form'

interface MarketTradeFormProps {
  market: Market
  defaultOutcome?: 'yes' | 'no'
  outcome?: MarketOutcome
  onClose: () => void
}

export function MarketTradeForm({
  market,
  defaultOutcome = 'yes',
  outcome,
  onClose,
}: MarketTradeFormProps) {
  const {
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
  } = useMarketTradeForm(market, outcome, defaultOutcome)

  if (!cdpProjectId) {
    return <MarketTradeWalletNotConfigured />
  }

  if (!isSignedIn) {
    return <MarketTradeSignInPrompt />
  }

  if (isGeoBlocked) {
    return <MarketTradeGeoBlocked />
  }

  if (status === 'success') {
    return (
      <MarketTradeSuccess
        resultStatus={result?.status}
        onDone={() => {
          reset()
          onClose()
        }}
      />
    )
  }

  return (
    <MarketTradeFormFields
      market={market}
      outcome={outcome}
      side={side}
      setSide={setSide}
      amount={amount}
      setAmount={setAmount}
      tradeParams={tradeParams}
      amountNum={amountNum}
      estimatedShares={estimatedShares}
      potentialPayout={potentialPayout}
      baseUsdcBalance={baseUsdcBalance}
      polygonUsdcBalance={polygonUsdcBalance}
      error={error}
      status={status}
      isTrading={isTrading}
      onTrade={handleTrade}
    />
  )
}
