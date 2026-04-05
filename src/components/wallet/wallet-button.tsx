import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { CheckIcon, CopyIcon, ExternalLinkIcon, LogOutIcon, WalletIcon } from 'lucide-react'
import { SignInModal } from '@coinbase/cdp-react'
import { useAuth } from '@/components/providers/auth-provider'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button, buttonVariants } from '@/components/ui/button'
import { useErc20Balance } from '@/hooks/use-erc20-balance'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { cn } from '@/lib/utils'
import {
  baseScanAddressUrl,
  formatTotalUsdcBalance,
  shortWalletAddress,
} from '@/lib/wallet-format'
import { cdpProjectId, USDC_BASE, USDC_E_POLYGON } from '@/lib/wagmi'
import { base, polygon } from 'wagmi/chains'

export function WalletButton() {
  const { isSignedIn, evmAddress, signOut } = useAuth()
  const isMobile = useIsMobile()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

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
      <SignInModal>
        <Button variant="outline" className="gap-1.5">
          <WalletIcon className="size-3.5" />
          Connect
        </Button>
      </SignInModal>
    )
  }

  const scanUrl = evmAddress ? baseScanAddressUrl(evmAddress) : null

  function copyAddress() {
    if (!evmAddress) return
    void navigator.clipboard.writeText(evmAddress).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <div
            className="inline-flex items-center gap-1.5 cursor-default rounded-md px-3 py-1.5 text-sm font-medium text-foreground"
          />
        }
        openOnHover={!isMobile}
        delay={220}
        closeDelay={120}
      >
        <WalletIcon className="size-3.5 shrink-0" aria-hidden />
        {evmAddress ? shortWalletAddress(evmAddress) : 'Wallet'}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="max-w-[min(calc(100vw-1rem),280px)]"
        >
          <PopoverContent className="box-border w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <div className="w-full min-w-0 space-y-3">
              {evmAddress ? (
                <div className="w-full min-w-0 max-w-full">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Wallet
                  </p>
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    <p
                      className="min-w-0 flex-1 truncate font-mono text-[11px]"
                      title={evmAddress}
                    >
                      {evmAddress}
                    </p>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <CheckIcon className="size-3 text-green-500" aria-hidden />
                      ) : (
                        <CopyIcon className="size-3" aria-hidden />
                      )}
                    </button>
                    {scanUrl ? (
                      <a
                        href={scanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        title="View on Basescan"
                      >
                        <ExternalLinkIcon className="size-3" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                <div className="text-[10px] text-muted-foreground">Balance</div>
                <div className="text-sm font-semibold tabular-nums">
                  {formatTotalUsdcBalance(baseUsdc, polygonUsdc)}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/portfolio"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: 'secondary', size: 'sm' }),
                    'flex-1 justify-center no-underline',
                  )}
                >
                  Profile
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  <LogOutIcon className="size-3.5" aria-hidden />
                  Disconnect
                </Button>
              </div>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}
