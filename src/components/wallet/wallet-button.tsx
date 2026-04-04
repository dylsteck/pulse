import { useState } from 'react'
import { LogOutIcon, WalletIcon } from 'lucide-react'
import { AuthButton } from '@coinbase/cdp-react'
import { formatUnits } from 'viem'
import { useAuth } from '@/components/providers/auth-provider'
import { useErc20Balance } from '@/hooks/use-erc20-balance'
import { cdpProjectId, USDC_BASE, USDC_E_POLYGON } from '@/lib/wagmi'
import { base, polygon } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function formatUsdcBalance(raw: bigint | undefined): string {
  if (raw == null) return '—'
  return `$${parseFloat(formatUnits(raw, 6)).toFixed(2)}`
}

export function WalletButton() {
  const [open, setOpen] = useState(false)
  const { isSignedIn, evmAddress, signOut } = useAuth()

  const { data: baseUsdc } = useErc20Balance(
    base.id,
    USDC_BASE,
    evmAddress,
  )
  const { data: polygonUsdc } = useErc20Balance(
    polygon.id,
    USDC_E_POLYGON,
    evmAddress,
  )

  if (!cdpProjectId) {
    return (
      <Button
        variant="outline"
        disabled
        className="gap-1.5 text-muted-foreground"
        title="Set VITE_CDP_PROJECT_ID in .env to enable wallet"
      >
        <WalletIcon className="size-3.5" />
        Connect
      </Button>
    )
  }

  if (!isSignedIn) {
    return (
      <AuthButton className="inline-flex" />
    )
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 font-mono"
      >
        <WalletIcon className="size-3.5" />
        {evmAddress ? shortAddress(evmAddress) : 'Wallet'}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              {evmAddress ? shortAddress(evmAddress) : '—'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-xs text-muted-foreground">Base USDC</div>
              <div className="text-lg font-semibold">
                {formatUsdcBalance(baseUsdc)}
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-xs text-muted-foreground">
                Polygon USDC.e
              </div>
              <div className="text-lg font-semibold">
                {formatUsdcBalance(polygonUsdc)}
              </div>
            </div>
          </div>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                signOut()
                setOpen(false)
              }}
            >
              <LogOutIcon className="size-3.5" />
              Disconnect
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
