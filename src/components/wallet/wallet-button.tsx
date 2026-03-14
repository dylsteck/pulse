import { useState } from 'react'
import { WalletIcon, LogOutIcon } from 'lucide-react'
import { useAccount } from 'wagmi'
import { AuthButton } from '@coinbase/cdp-react'
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
import type { WalletState } from '@/hooks/use-wallet'
import { cdpProjectId } from '@/lib/wagmi'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function WalletButton({ wallet }: { wallet: WalletState }) {
  const [open, setOpen] = useState(false)
  const { address } = useAccount()

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

  return (
    <AuthButton
      className="inline-flex"
      signOutButton={({ onSuccess }) => (
        <>
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="gap-1.5 font-mono"
          >
            <WalletIcon className="size-3.5" />
            {address ? shortAddress(address) : 'Wallet'}
          </Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Wallet connected</AlertDialogTitle>
                <AlertDialogDescription>
                  {address ? shortAddress(address) : '—'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                <AlertDialogCancel>Close</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onSuccess?.()
                    wallet.disconnect()
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
      )}
    />
  )
}
