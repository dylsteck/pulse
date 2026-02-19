import { useState } from 'react'
import { WalletIcon, LogOutIcon } from 'lucide-react'
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
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton'
import type { WalletState } from '@/hooks/use-wallet'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function WalletButton({ wallet }: { wallet: WalletState }) {
  const [open, setOpen] = useState(false)

  if (wallet.connected && wallet.address) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="gap-1.5 font-mono"
        >
          <WalletIcon className="size-3.5" />
          {shortAddress(wallet.address)}
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Wallet connected</AlertDialogTitle>
              <AlertDialogDescription>
                {shortAddress(wallet.address)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => {
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
    )
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        Connect
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Connect wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new wallet or connect an existing one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            {wallet.cdpEmbeddedAvailable ? (
              <AuthButton
                onSignInSuccess={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2"
              />
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  wallet.connectEmbedded()
                  setOpen(false)
                }}
                className="justify-start"
              >
                <WalletIcon className="size-3.5" />
                Create wallet
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                wallet.connectExternal()
                setOpen(false)
              }}
              className="justify-start"
            >
              <WalletIcon className="size-3.5 text-muted-foreground" />
              Connect existing
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
