import { Link } from '@tanstack/react-router'
import { ExternalLinkIcon, LogOutIcon, WalletIcon } from 'lucide-react'
import { formatUnits } from 'viem'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { useErc20Balance } from '@/hooks/use-erc20-balance'
import { baseScanAddressUrl, formatUsdcBalance } from '@/lib/wallet-format'
import { USDC_BASE, USDC_E_POLYGON } from '@/lib/wagmi'
import { base, polygon } from 'wagmi/chains'

export function PortfolioPage() {
  const { evmAddress, signOut } = useAuth()
  const { data: baseUsdc } = useErc20Balance(base.id, USDC_BASE, evmAddress)
  const { data: polygonUsdc } = useErc20Balance(
    polygon.id,
    USDC_E_POLYGON,
    evmAddress,
  )

  const scanUrl = evmAddress ? baseScanAddressUrl(evmAddress) : null
  const fullAddress = evmAddress ?? ''

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <WalletIcon className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Portfolio</h1>
            {fullAddress ? (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {fullAddress}
              </p>
            ) : null}
            {scanUrl ? (
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                View on Basescan
                <ExternalLinkIcon className="size-3" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 self-start"
          onClick={() => {
            void signOut()
          }}
        >
          <LogOutIcon className="size-3.5" aria-hidden />
          Disconnect
        </Button>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Balances
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <BalanceCard label="Base USDC" value={formatUsdcBalance(baseUsdc)} />
          <BalanceCard
            label="Polygon USDC.e"
            value={formatUsdcBalance(polygonUsdc)}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Total (USDC only):{' '}
          <span className="font-medium tabular-nums text-foreground">
            {formatTotalUsd(baseUsdc, polygonUsdc)}
          </span>
        </p>
      </section>

      <section className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
        <h2 className="text-sm font-medium text-foreground">Performance</h2>
        <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
          PnL charts and history will show here in a future update.
        </p>
      </section>

      <p className="mt-8 text-center">
        <Link
          to="/"
          search={{ type: 'tokens' }}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to Pulse
        </Link>
      </p>
    </div>
  )
}

function BalanceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function formatTotalUsd(
  baseRaw: bigint | undefined,
  polyRaw: bigint | undefined,
): string {
  const b = baseRaw != null ? parseFloat(formatUnits(baseRaw, 6)) : 0
  const p = polyRaw != null ? parseFloat(formatUnits(polyRaw, 6)) : 0
  return `$${(b + p).toFixed(2)}`
}
