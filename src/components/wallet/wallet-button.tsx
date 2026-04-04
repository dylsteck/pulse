import { Link } from '@tanstack/react-router'
import { ExternalLinkIcon, LogOutIcon, WalletIcon } from 'lucide-react'
import { SignInModal } from '@coinbase/cdp-react'
import { useAuth } from '@/components/providers/auth-provider'
import {
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardPositioner,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useErc20Balance } from '@/hooks/use-erc20-balance'
import { cn } from '@/lib/utils'
import {
  baseScanAddressUrl,
  formatUsdcBalance,
  shortWalletAddress,
} from '@/lib/wallet-format'
import { cdpProjectId, USDC_BASE, USDC_E_POLYGON } from '@/lib/wagmi'
import { base, polygon } from 'wagmi/chains'

export function WalletButton() {
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
      <SignInModal>
        <Button variant="outline" className="gap-1.5">
          <WalletIcon className="size-3.5" />
          Connect
        </Button>
      </SignInModal>
    )
  }

  const scanUrl = evmAddress ? baseScanAddressUrl(evmAddress) : null

  return (
    <HoverCard>
      <HoverCardTrigger
        render={<Button variant="outline" type="button" className="gap-1.5" />}
        delay={220}
        closeDelay={120}
      >
        <WalletIcon className="size-3.5 shrink-0" aria-hidden />
        {evmAddress ? shortWalletAddress(evmAddress) : 'Wallet'}
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardPositioner side="bottom" align="end" sideOffset={8}>
          <HoverCardContent className="w-[min(calc(100vw-1rem),280px)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <div className="space-y-3">
              {evmAddress ? (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Wallet
                  </p>
                  <p className="mt-0.5 font-mono text-xs">{evmAddress}</p>
                  {scanUrl ? (
                    <a
                      href={scanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Basescan
                      <ExternalLinkIcon className="size-3" aria-hidden />
                    </a>
                  ) : null}
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                  <div className="text-[10px] text-muted-foreground">
                    Base USDC
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {formatUsdcBalance(baseUsdc)}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                  <div className="text-[10px] text-muted-foreground">
                    Polygon USDC.e
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {formatUsdcBalance(polygonUsdc)}
                  </div>
                </div>
              </div>
              <Link
                to="/portfolio"
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'sm' }),
                  'inline-flex w-full justify-center no-underline',
                )}
              >
                View portfolio
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => {
                  void signOut()
                }}
              >
                <LogOutIcon className="size-3.5" aria-hidden />
                Disconnect
              </Button>
            </div>
          </HoverCardContent>
        </HoverCardPositioner>
      </HoverCardPortal>
    </HoverCard>
  )
}
