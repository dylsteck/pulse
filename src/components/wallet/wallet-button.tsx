import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { WalletIcon, LogOutIcon, UserIcon } from 'lucide-react'
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

const cdpProjectId = import.meta.env.VITE_CDP_PROJECT_ID as string | undefined

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
                <Link
                  to="/profile"
                  className="order-2 w-full sm:order-1 sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <UserIcon className="size-3.5" />
                    Profile
                  </Button>
                </Link>
                <AlertDialogCancel className="order-1 sm:order-2">Close</AlertDialogCancel>
                <Button
                  variant="destructive"
                  className="order-3"
                  onClick={() => {
                    wallet.disconnect()
                    setOpen(false)
                    onSuccess?.()
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
