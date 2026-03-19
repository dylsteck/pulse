import { useCallback, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Market } from '@/lib/types'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useMarketHistory } from '@/hooks/use-market-history'
import { fetchPolymarketEventById } from '@/lib/polymarket'
import { formatCompact, formatDate } from '@/lib/format'

export function MarketDetail({ id }: { id: string }) {
  const {
    data: market,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['polymarket', 'event', id],
    queryFn: () => fetchPolymarketEventById(id),
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-2 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load market
      </div>
    )
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Market not found
      </div>
    )
  }
  return <MarketDetailContent market={market} />
}

function MarketDetailContent({ market }: { market: Market }) {
  const { yesPercent } = useMarketOdds(market)
  const [windowLabel, setWindowLabel] = useState('1D')
  const { data: history, isLoading } = useMarketHistory(
    market.clobTokenId,
    windowLabel,
  )

  const chartData =
    history.length >= 2
      ? history
      : [
          { time: Date.now() / 1000 - 60, value: yesPercent },
          { time: Date.now() / 1000, value: yesPercent },
        ]

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="mb-3 text-2xl font-semibold leading-tight sm:text-3xl">
              {market.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {market.clobTokenId && (
                <span className="font-mono text-xs">
                  ID: {market.clobTokenId.slice(0, 8)}...
                </span>
              )}
              <span>Ends {formatDate(market.expiry)}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#22c55e]/15 px-4 py-2 transition-all hover:bg-[#22c55e]/25"
            >
              <span className="text-sm font-medium text-[#22c55e]">Yes</span>
              <span className="font-semibold text-[#22c55e]">
                {yesPercent.toFixed(0)}%
              </span>
            </button>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#ef4444]/15 px-4 py-2 transition-all hover:bg-[#ef4444]/25"
            >
              <span className="text-sm font-medium text-[#ef4444]">No</span>
              <span className="font-semibold text-[#ef4444]">
                {(100 - yesPercent).toFixed(0)}%
              </span>
            </button>
          </div>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#22c55e] transition-all"
            style={{ width: `${yesPercent}%` }}
          />
        </div>

        <LivelineChart
          data={chartData}
          value={yesPercent}
          height={340}
          formatValue={(v) => `${v.toFixed(1)}%`}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={isLoading && history.length === 0}
          emptyText="No chart data available"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Volume</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(market.volume)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Yes</p>
          <p className="text-lg font-semibold tabular-nums text-[#22c55e]">
            ${(yesPercent / 100).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">No</p>
          <p className="text-lg font-semibold tabular-nums text-[#ef4444]">
            ${((100 - yesPercent) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {market.outcomes && market.outcomes.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/30 p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Other Outcomes
          </h2>
          <div className="space-y-3">
            {market.outcomes.map((outcome) => (
              <div
                key={outcome.name}
                className="flex items-center justify-between rounded-lg bg-card/50 p-3"
              >
                <span className="font-medium">{outcome.name}</span>
                <span className="font-semibold tabular-nums">
                  {outcome.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
