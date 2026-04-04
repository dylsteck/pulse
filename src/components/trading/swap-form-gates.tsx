import { CheckCircleIcon, WalletIcon } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import { TradingDrawerEmptyState } from '@/components/trading/trading-drawer-empty-state'
import { Button } from '@/components/ui/button'

export function SwapConfigGate() {
  return (
    <TradingDrawerEmptyState icon={<WalletIcon className="size-9" aria-hidden />}>
      <p className="text-muted-foreground">Wallet not configured</p>
    </TradingDrawerEmptyState>
  )
}

export function SwapSignInGate() {
  return (
    <TradingDrawerEmptyState
      icon={<WalletIcon className="size-9" aria-hidden />}
      actions={<AuthButton className="inline-flex" />}
    >
      <p className="text-muted-foreground">
        Connect your wallet to swap on Base.
      </p>
    </TradingDrawerEmptyState>
  )
}

export function SwapCompleteGate({ onDone }: { onDone: () => void }) {
  return (
    <TradingDrawerEmptyState
      icon={<CheckCircleIcon className="size-10 text-[#22c55e]" aria-hidden />}
      actions={
        <Button variant="outline" size="sm" onClick={onDone}>
          Done
        </Button>
      }
      className="gap-4"
    >
      <p className="font-medium text-foreground">Swap complete</p>
    </TradingDrawerEmptyState>
  )
}
