import { useState, useCallback } from 'react'
import { WalletIcon, LoaderCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import { useAuth } from '@/components/providers/auth-provider'
import {
  usePolymarketTrading,
  type TradeStatus,
} from '@/hooks/use-polymarket-trading'
import { usePolymarketGeoStatus } from '@/lib/polymarket/geo'
import { cdpProjectId } from '@/lib/wagmi'
import type { Market, MarketOutcome } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MarketTradePopoverProps {
  market: Market
  defaultOutcome?: 'yes' | 'no'
  outcome?: MarketOutcome
}

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

export function MarketTradePopover({
  market,
  defaultOutcome = 'yes',
  outcome,
}: MarketTradePopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" />
        }
      >
        Trade
      </DialogTrigger>
      <DialogContent showCloseButton>
        <TradeForm
          market={market}
          defaultOutcome={defaultOutcome}
          outcome={outcome}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function TradeForm({
  market,
  defaultOutcome,
  outcome,
  onClose,
}: MarketTradePopoverProps & { onClose: () => void }) {
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

  const [side, setSide] = useState<'yes' | 'no'>(defaultOutcome ?? 'yes')
  const [amount, setAmount] = useState('')

  const amountNum = parseFloat(amount) || 0
  const isMultiOutcome = outcome != null

  // Determine token ID and price based on selection
  const getTradeParams = useCallback(() => {
    if (isMultiOutcome && outcome) {
      return {
        tokenId: outcome.clobTokenId!,
        price: outcome.percent / 100,
      }
    }
    // Binary market
    const yesTokenId = market.clobTokenId
    if (!yesTokenId) return null

    const price = side === 'yes' ? market.yesPercent / 100 : market.noPercent / 100
    return { tokenId: yesTokenId, price }
  }, [market, side, outcome, isMultiOutcome])

  const tradeParams = getTradeParams()
  const estimatedShares = tradeParams && amountNum > 0
    ? (amountNum / tradeParams.price).toFixed(2)
    : '0'
  const potentialPayout = tradeParams && amountNum > 0
    ? (amountNum / tradeParams.price).toFixed(2)
    : '0'

  const handleTrade = async () => {
    if (!tradeParams || amountNum <= 0) return

    await trade({
      tokenId: tradeParams.tokenId,
      side: 'BUY',
      amount: amountNum,
      price: tradeParams.price,
      negRisk: market.negRisk ?? false,
    })
  }

  const isTrading = status !== 'idle' && status !== 'success' && status !== 'error'

  // Not connected
  if (!isSignedIn || !cdpProjectId) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <WalletIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Connect your wallet to trade
        </p>
        {cdpProjectId ? (
          <AuthButton className="inline-flex" />
        ) : (
          <p className="text-xs text-muted-foreground">
            Wallet not configured
          </p>
        )}
      </div>
    )
  }

  // Geo-blocked
  if (isGeoBlocked) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <XCircleIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-center text-muted-foreground">
          Trading is unavailable in your region
        </p>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircleIcon className="size-8 text-[#22c55e]" />
        <p className="text-sm font-medium">Order placed!</p>
        {result?.status && (
          <p className="text-xs text-muted-foreground">
            Status: {result.status}
          </p>
        )}
        <Button variant="outline" size="sm" onClick={() => { reset(); onClose() }}>
          Done
        </Button>
      </div>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-sm font-medium leading-tight">
          {isMultiOutcome ? outcome?.name : market.title}
        </DialogTitle>
      </DialogHeader>

      {/* Side selector (binary markets only) */}
      {!isMultiOutcome && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide('yes')}
            disabled={isTrading}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              side === 'yes'
                ? 'bg-[#22c55e]/15 text-[#22c55e]'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            Yes {market.yesPercent.toFixed(0)}%
          </button>
          <button
            type="button"
            onClick={() => setSide('no')}
            disabled={isTrading}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              side === 'no'
                ? 'bg-[#ef4444]/15 text-[#ef4444]'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            No {market.noPercent.toFixed(0)}%
          </button>
        </div>
      )}

      {/* Amount input */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Amount (USDC)
        </label>
        <Input
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isTrading}
        />
      </div>

      {/* Trade summary */}
      {amountNum > 0 && tradeParams && (
        <div className="space-y-1.5 rounded-lg bg-muted p-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Avg price</span>
            <span>{(tradeParams.price * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Est. shares</span>
            <span>{estimatedShares}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Potential payout</span>
            <span className="font-medium text-[#22c55e]">
              ${potentialPayout}
            </span>
          </div>
        </div>
      )}

      {/* Balances */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>Base: ${baseUsdcBalance.toFixed(2)}</span>
        <span>Polygon: ${polygonUsdcBalance.toFixed(2)}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Status */}
      {isTrading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircleIcon className="size-3.5 animate-spin" />
          {STATUS_LABELS[status]}
        </div>
      )}

      {/* Trade button */}
      <Button
        onClick={handleTrade}
        disabled={!tradeParams || amountNum <= 0 || isTrading}
        className={cn(
          'w-full',
          !isMultiOutcome && side === 'yes' && 'bg-[#22c55e] hover:bg-[#22c55e]/90',
          !isMultiOutcome && side === 'no' && 'bg-[#ef4444] hover:bg-[#ef4444]/90',
        )}
      >
        {isTrading ? (
          <>
            <LoaderCircleIcon className="size-3.5 animate-spin" />
            Processing...
          </>
        ) : (
          `Buy ${isMultiOutcome ? outcome?.name : side === 'yes' ? 'Yes' : 'No'}`
        )}
      </Button>
    </>
  )
}
