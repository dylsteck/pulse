import { CheckCircleIcon, WalletIcon, XCircleIcon } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import { TradingDrawerEmptyState } from '@/components/trading/trading-drawer-empty-state'
import { Button } from '@/components/ui/button'

export function MarketTradeWalletNotConfigured() {
  return (
    <TradingDrawerEmptyState icon={<WalletIcon className="size-9" aria-hidden />}>
      <p className="text-muted-foreground">Wallet not configured</p>
    </TradingDrawerEmptyState>
  )
}

export function MarketTradeSignInPrompt() {
  return (
    <TradingDrawerEmptyState
      icon={<WalletIcon className="size-9" aria-hidden />}
      actions={<AuthButton className="inline-flex" />}
    >
      <p className="text-muted-foreground">
        Connect your wallet to trade on Polymarket.
      </p>
    </TradingDrawerEmptyState>
  )
}

export function MarketTradeGeoBlocked() {
  return (
    <TradingDrawerEmptyState icon={<XCircleIcon className="size-9" aria-hidden />}>
      <p className="text-muted-foreground">
        Trading is unavailable in your region.
      </p>
    </TradingDrawerEmptyState>
  )
}

interface MarketTradeSuccessProps {
  resultStatus?: string
  onDone: () => void
}

export function MarketTradeSuccess({ resultStatus, onDone }: MarketTradeSuccessProps) {
  return (
    <TradingDrawerEmptyState
      icon={<CheckCircleIcon className="size-9 text-[#22c55e]" aria-hidden />}
      actions={
        <Button variant="outline" size="sm" onClick={onDone}>
          Done
        </Button>
      }
      className="gap-4"
    >
      <p className="font-medium text-foreground">Order placed!</p>
      {resultStatus ? (
        <p className="text-xs text-muted-foreground">Status: {resultStatus}</p>
      ) : null}
    </TradingDrawerEmptyState>
  )
}
