import { useCallback, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Token } from '@/lib/types'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useTokenPrice } from '@/hooks/use-token-price'
import { useTokenBars } from '@/hooks/use-token-bars'
import { fetchCodexTokenByAddress } from '@/lib/codex'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact, formatPrice } from '@/lib/format'

export function TokenDetail({ id }: { id: string }) {
  const {
    data: token,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['codex', 'token', id],
    queryFn: () => fetchCodexTokenByAddress(id),
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load token
      </div>
    )
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Token not found
      </div>
    )
  }
  return <TokenDetailContent token={token} />
}

function TokenDetailContent({ token }: { token: Token }) {
  const { price } = useTokenPrice(token)
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useTokenBars(token.address, windowLabel)
  const chartData = bars.length >= 2 ? bars : token.priceHistory

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {token.imageUrl && (
              <FadeImage
                src={token.imageUrl}
                alt=""
                wrapperClassName="size-14 shrink-0 rounded-full"
                className="size-14 rounded-full object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{token.symbol}</h1>
                <span
                  className={cn(
                    'rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-xs font-medium',
                    token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                  )}
                >
                  {token.change24h >= 0 ? '+' : ''}
                  {token.change24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{token.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl tabular-nums">${formatPrice(price)}</div>
            <p className="text-xs text-muted-foreground">Current Price</p>
          </div>
        </div>
        <LivelineChart
          data={chartData}
          value={price}
          height={380}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={isLoading && chartData.length === 0}
          emptyText="No chart data available"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Volume 24h
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {token.volume24h > 0 ? formatCompact(token.volume24h) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Market Cap
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {token.marketCap > 0 ? formatCompact(token.marketCap) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h High
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {price > 0 ? formatPrice(price * 1.05) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Low
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {price > 0 ? formatPrice(price * 0.95) : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Token Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Contract</span>
            <a
              href={`https://basescan.org/address/${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
            >
              {token.address.slice(0, 6)}...{token.address.slice(-4)}
              <svg
                className="size-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Token ID</span>
            <span className="font-mono text-xs">{token.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
