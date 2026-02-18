import { useState } from 'react'
import { WalletIcon, ChevronDownIcon, LogOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton'
import type { WalletState } from '@/hooks/use-wallet'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function WalletButton({ wallet }: { wallet: WalletState }) {
  const [open, setOpen] = useState(false)

  if (wallet.connected && wallet.address) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setOpen((o) => !o)}
          className="gap-1.5 font-mono"
        >
          <WalletIcon className="size-3.5" />
          {shortAddress(wallet.address)}
          <ChevronDownIcon className="size-3.5" />
        </Button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-md">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-[#F9F9F9]"
                onClick={() => {
                  wallet.disconnect()
                  setOpen(false)
                }}
              >
                <LogOutIcon className="size-3.5" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className="gap-1.5"
      >
        Connect
        <ChevronDownIcon className="size-3.5" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-md">
            {wallet.cdpEmbeddedAvailable ? (
              <div
                className="px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <AuthButton
                  onSignInSuccess={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 py-2 text-xs hover:bg-[#F9F9F9]"
                />
              </div>
            ) : (
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[#F9F9F9]"
                onClick={() => {
                  wallet.connectEmbedded()
                  setOpen(false)
                }}
              >
                <WalletIcon className="size-3.5" />
                Create wallet
              </button>
            )}
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[#F9F9F9]"
              onClick={() => {
                wallet.connectExternal()
                setOpen(false)
              }}
            >
              <WalletIcon className="size-3.5 text-muted-foreground" />
              Connect existing
            </button>
          </div>
        </>
      )}
    </div>
  )
}
