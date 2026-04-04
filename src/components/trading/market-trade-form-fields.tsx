import { LoaderCircleIcon } from 'lucide-react'
import type { Market, MarketOutcome } from '@/lib/types'
import type { TradeStatus } from '@/hooks/use-polymarket-trading'
import { MarketTradeOrderSummary } from '@/components/trading/market-trade-order-summary'
import { MarketTradeSubmitButton } from '@/components/trading/market-trade-submit-button'
import { MarketTradeYesNoButtons } from '@/components/trading/market-trade-yes-no-buttons'
import { tradingFieldLabelClass } from '@/components/trading/trading-field-label'
import { Input } from '@/components/ui/input'

const STATUS_LABELS: Record<TradeStatus, string> = {
  idle: '',
  'checking-balance': 'Checking balances...',
  bridging: 'Bridging USDC to Polygon...',
  approving: 'Approving USDC.e...',
  'deriving-creds': 'Setting up trading...',
  signing: 'Sign in your wallet...',
  submitting: 'Submitting order...',
  success: 'Order placed!',
  error: 'Trade failed',
}

export interface MarketTradeFormFieldsProps {
  market: Market
  outcome?: MarketOutcome
  side: 'yes' | 'no'
  setSide: (s: 'yes' | 'no') => void
  amount: string
  setAmount: (v: string) => void
  tradeParams: { tokenId: string; price: number } | null
  amountNum: number
  estimatedShares: string
  potentialPayout: string
  baseUsdcBalance: number
  polygonUsdcBalance: number
  error: string | null
  status: TradeStatus
  isTrading: boolean
  onTrade: () => Promise<void>
}

export function MarketTradeFormFields({
  market,
  outcome,
  side,
  setSide,
  amount,
  setAmount,
  tradeParams,
  amountNum,
  estimatedShares,
  potentialPayout,
  baseUsdcBalance,
  polygonUsdcBalance,
  error,
  status,
  isTrading,
  onTrade,
}: MarketTradeFormFieldsProps) {
  const isMultiOutcome = outcome != null

  return (
    <div className="flex flex-col gap-4">
      {!isMultiOutcome ? (
        <MarketTradeYesNoButtons
          market={market}
          side={side}
          isTrading={isTrading}
          onSideChange={setSide}
        />
      ) : null}

      <div>
        <label
          className={`mb-1 block ${tradingFieldLabelClass}`}
          htmlFor="market-trade-amount"
        >
          Amount (USDC)
        </label>
        <Input
          id="market-trade-amount"
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isTrading}
        />
      </div>

      {amountNum > 0 && tradeParams ? (
        <MarketTradeOrderSummary
          avgPricePct={`${(tradeParams.price * 100).toFixed(1)}%`}
          estimatedShares={estimatedShares}
          potentialPayout={potentialPayout}
        />
      ) : null}

      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] tabular-nums text-muted-foreground/90">
        <span>Base ${baseUsdcBalance.toFixed(2)}</span>
        <span>Polygon ${polygonUsdcBalance.toFixed(2)}</span>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      {isTrading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden />
          {STATUS_LABELS[status]}
        </div>
      ) : null}

      <MarketTradeSubmitButton
        outcome={outcome}
        side={side}
        isTrading={isTrading}
        disabled={!tradeParams || amountNum <= 0 || isTrading}
        onClick={() => {
          void onTrade()
        }}
      />
    </div>
  )
}
