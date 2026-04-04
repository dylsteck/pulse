import { CheckCircleIcon, WalletIcon, XCircleIcon } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import { Button } from '@/components/ui/button'

export function MarketTradeWalletNotConfigured() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <WalletIcon className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-xs text-muted-foreground">Wallet not configured</p>
    </div>
  )
}

export function MarketTradeSignInPrompt() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <WalletIcon className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">
        Connect your wallet to trade
      </p>
      <AuthButton className="inline-flex" />
    </div>
  )
}

export function MarketTradeGeoBlocked() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <XCircleIcon className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-center text-sm text-muted-foreground">
        Trading is unavailable in your region
      </p>
    </div>
  )
}

interface MarketTradeSuccessProps {
  resultStatus?: string
  onDone: () => void
}

export function MarketTradeSuccess({ resultStatus, onDone }: MarketTradeSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <CheckCircleIcon className="size-8 text-[#22c55e]" aria-hidden />
      <p className="text-sm font-medium">Order placed!</p>
      {resultStatus ? (
        <p className="text-xs text-muted-foreground">
          Status: {resultStatus}
        </p>
      ) : null}
      <Button variant="outline" size="sm" onClick={onDone}>
        Done
      </Button>
    </div>
  )
}
