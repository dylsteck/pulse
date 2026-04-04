import { CheckCircleIcon, WalletIcon } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import { Button } from '@/components/ui/button'

export function SwapConfigGate() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <WalletIcon className="size-9 text-muted-foreground" aria-hidden />
      <p className="text-xs text-muted-foreground">Wallet not configured</p>
    </div>
  )
}

export function SwapSignInGate() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <WalletIcon className="size-9 text-muted-foreground" aria-hidden />
      <p className="text-center text-sm text-muted-foreground">
        Connect your wallet to swap on Base.
      </p>
      <AuthButton className="inline-flex" />
    </div>
  )
}

export function SwapCompleteGate({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <CheckCircleIcon className="size-10 text-[#22c55e]" aria-hidden />
      <p className="text-sm font-medium">Swap complete</p>
      <Button variant="outline" size="sm" onClick={onDone}>
        Done
      </Button>
    </div>
  )
}
