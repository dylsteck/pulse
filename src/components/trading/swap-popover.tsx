import { useState } from 'react'
import {
  ArrowDownUpIcon,
  LoaderCircleIcon,
  CheckCircleIcon,
  WalletIcon,
} from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useSwap, type SwapStatus } from '@/hooks/use-swap'
import { cdpProjectId, USDC_BASE } from '@/lib/wagmi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Common Base tokens
const TOKENS: Record<
  string,
  { address: `0x${string}`; symbol: string; decimals: number }
> = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
  },
  USDC: { address: USDC_BASE, symbol: 'USDC', decimals: 6 },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    decimals: 18,
  },
}

const STATUS_LABELS: Record<SwapStatus, string> = {
  idle: '',
  quoting: 'Getting quote...',
  confirming: 'Confirm in wallet...',
  swapping: 'Swapping...',
  complete: 'Swap complete!',
  error: 'Swap failed',
}

interface SwapPopoverProps {
  defaultFromToken?: string
  defaultToToken?: string
}

export function SwapPopover({
  defaultFromToken = 'ETH',
  defaultToToken = 'USDC',
}: SwapPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" />
        }
      >
        <ArrowDownUpIcon className="size-3" />
        Swap
      </DialogTrigger>
      <DialogContent showCloseButton>
        <SwapForm
          defaultFromToken={defaultFromToken}
          defaultToToken={defaultToToken}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function SwapForm({
  defaultFromToken,
  defaultToToken,
  onClose,
}: SwapPopoverProps & { onClose: () => void }) {
  const { isSignedIn } = useAuth()
  const { swap, status, error, reset } = useSwap()

  const [fromKey, setFromKey] = useState(defaultFromToken ?? 'ETH')
  const [toKey, setToKey] = useState(defaultToToken ?? 'USDC')
  const [amount, setAmount] = useState('')

  const fromToken = TOKENS[fromKey]
  const toToken = TOKENS[toKey]
  const amountNum = parseFloat(amount) || 0
  const isSwapping =
    status !== 'idle' && status !== 'complete' && status !== 'error'

  if (!isSignedIn || !cdpProjectId) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <WalletIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Connect your wallet to swap
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

  if (status === 'complete') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircleIcon className="size-8 text-[#22c55e]" />
        <p className="text-sm font-medium">Swap complete!</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            reset()
            onClose()
          }}
        >
          Done
        </Button>
      </div>
    )
  }

  const handleSwap = async () => {
    if (!fromToken || !toToken || amountNum <= 0) return
    await swap({
      fromToken: fromToken.address,
      toToken: toToken.address,
      amount,
      decimals: fromToken.decimals,
    })
  }

  const tokenKeys = Object.keys(TOKENS)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Swap on Base</DialogTitle>
      </DialogHeader>

      {/* From */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          From
        </label>
        <div className="flex gap-2">
          <select
            value={fromKey}
            onChange={(e) => setFromKey(e.target.value)}
            disabled={isSwapping}
            className="h-7 rounded-md border border-input bg-input/20 px-2 text-xs"
          >
            {tokenKeys
              .filter((k) => k !== toKey)
              .map((k) => (
                <option key={k} value={k}>
                  {TOKENS[k].symbol}
                </option>
              ))}
          </select>
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSwapping}
          />
        </div>
      </div>

      {/* Swap direction indicator */}
      <div className="flex justify-center">
        <ArrowDownUpIcon className="size-4 text-muted-foreground" />
      </div>

      {/* To */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">To</label>
        <select
          value={toKey}
          onChange={(e) => setToKey(e.target.value)}
          disabled={isSwapping}
          className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs"
        >
          {tokenKeys
            .filter((k) => k !== fromKey)
            .map((k) => (
              <option key={k} value={k}>
                {TOKENS[k].symbol}
              </option>
            ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {isSwapping && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircleIcon className="size-3.5 animate-spin" />
          {STATUS_LABELS[status]}
        </div>
      )}

      <Button
        onClick={handleSwap}
        disabled={amountNum <= 0 || isSwapping}
        className="w-full"
      >
        {isSwapping ? (
          <>
            <LoaderCircleIcon className="size-3.5 animate-spin" />
            Processing...
          </>
        ) : (
          'Swap'
        )}
      </Button>
    </>
  )
}
