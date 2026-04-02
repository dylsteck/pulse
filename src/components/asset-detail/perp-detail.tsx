import { useCallback, useRef, useState } from 'react'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useHyperliquidCandles } from '@/hooks/use-hyperliquid-candles'
import { usePerpMarkets } from '@/hooks/use-perps'
import { FadeImage } from '@/components/ui/fade-image'
import { formatPerpPrice } from '@/lib/hyperliquid/service'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/lib/format'
import { useIsMobile } from '@/hooks/use-is-mobile'

export function PerpDetail({ id }: { id: string }) {
  const { data: markets, isLoading, isError } = usePerpMarkets()
  const market = markets?.find((m) => m.id === id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <div className="size-14 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mb-6 h-9 w-40 animate-pulse rounded bg-muted" />
          <div className="h-[380px] w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load perp market
      </div>
    )
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Perp market not found
      </div>
    )
  }
  return <PerpDetailContent market={market} />
}

function PerpDetailContent({ market }: { market: PerpMarketSnapshot }) {
  const isMobile = useIsMobile()
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: candles, isLoading } = useHyperliquidCandles(
    market.coin,
    windowLabel,
  )

  const chartData = candles.length >= 2 ? candles : []

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const color = market.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-3 sm:gap-4">
          <FadeImage
            src={`https://app.hyperliquid.xyz/coins/${market.coin}.svg`}
            alt=""
            wrapperClassName="size-12 shrink-0 rounded-full sm:size-14"
            className="size-12 rounded-full object-cover sm:size-14"
          />
          <div>
            <h1 className="text-xl font-semibold">{market.coin} PERP</h1>
            <p className="text-sm text-muted-foreground">Perpetual Futures</p>
          </div>
        </div>

        <div className="mb-1 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums sm:text-4xl">
              ${formatPerpPrice(market, market.markPx)}
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-sm font-medium',
                market.change24h >= 0
                  ? 'bg-[#22c55e]/10 text-[#22c55e]'
                  : 'bg-[#ef4444]/10 text-[#ef4444]',
              )}
            >
              {market.change24h >= 0 ? '+' : ''}
              {market.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums">
              {formatCompact(market.volume24h)}
            </p>
            <p className="text-xs text-muted-foreground">24h Volume</p>
          </div>
        </div>

        <div className="mt-6">
          <LivelineChart
            data={chartData}
            value={market.markPx}
            height={isMobile ? 200 : 380}
            color={color}
            window={WINDOW_LABEL_TO_SECS[windowLabel]}
            onWindowChange={handleWindowChange}
            isLoading={isLoading && chartData.length === 0}
            emptyText="No chart data available"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">24h Volume</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(market.volume24h)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Funding Rate</p>
          <p
            className={cn(
              'text-lg font-semibold tabular-nums',
              market.funding >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
            )}
          >
            {(market.funding * 100).toFixed(4)}%
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Open Interest</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(market.openInterest)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">24h Change</p>
          <p
            className={cn(
              'text-lg font-semibold tabular-nums',
              market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
            )}
          >
            {market.change24h >= 0 ? '+' : ''}
            {market.change24h.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          Position Details
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 sm:p-3">
            <span className="text-muted-foreground">Mark Price</span>
            <span className="font-semibold tabular-nums">
              ${formatPerpPrice(market, market.markPx)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 sm:p-3">
            <span className="text-muted-foreground">Mid Price</span>
            <span className="font-semibold tabular-nums">
              ${formatPerpPrice(market, market.midPx)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 sm:p-3">
            <span className="text-muted-foreground">Prev Day</span>
            <span className="font-semibold tabular-nums">
              ${formatPerpPrice(market, market.prevDayPx)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 sm:p-3">
            <span className="text-muted-foreground">Max Leverage</span>
            <span className="font-semibold tabular-nums">
              {market.maxLeverage}x
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
