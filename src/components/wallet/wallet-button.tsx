import { useState, useEffect } from 'react'
import { WalletIcon, LogOutIcon } from 'lucide-react'
import { useConnect, useConnectors } from 'wagmi'
import type { Connector } from 'wagmi'
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

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function ConnectorButton({ connector, onClick }: { connector: Connector; onClick: () => void }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    connector.getProvider().then((p) => setReady(!!p))
  }, [connector])

  return (
    <Button
      variant="outline"
      disabled={!ready}
      onClick={onClick}
      className="justify-start gap-2"
    >
      {connector.icon && (
        <img src={connector.icon} alt="" className="size-4 rounded-sm" aria-hidden />
      )}
      {connector.name}
    </Button>
  )
}

function ConnectorList({ onConnect }: { onConnect: () => void }) {
  const { connect } = useConnect()
  const connectors = useConnectors()

  return (
    <div className="grid gap-2">
      {connectors.map((connector) => (
        <ConnectorButton
          key={connector.uid}
          connector={connector}
          onClick={() => {
            connect({ connector })
            onConnect()
          }}
        />
      ))}
    </div>
  )
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
              Choose a wallet to connect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ConnectorList onConnect={() => setOpen(false)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
