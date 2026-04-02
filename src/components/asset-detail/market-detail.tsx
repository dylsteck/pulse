import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Market } from '@/lib/types'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useWindowChange } from '@/hooks/use-window-change'
import { fetchPolymarketEventById } from '@/lib/polymarket'
import { formatCompact, formatDate } from '@/lib/format'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { StatItem, DetailMessage } from './shared'

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
      <div className="space-y-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-full bg-muted sm:size-14" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mb-6 h-2 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-[340px] w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) return <DetailMessage>Unable to load market</DetailMessage>
  if (!market) return <DetailMessage>Market not found</DetailMessage>
  return <MarketDetailContent market={market} />
}

function MarketDetailContent({ market }: { market: Market }) {
  const isMultiOutcome = market.outcomes && market.outcomes.length > 0

  return (
    <div className="space-y-6">
      <MarketHeader market={market} />
      {isMultiOutcome ? (
        <MultiOutcomeBody market={market} />
      ) : (
        <BinaryBody market={market} />
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <StatItem label="Volume" value={formatCompact(market.volume)} />
        {market.liquidity != null && market.liquidity > 0 && (
          <StatItem
            label="Liquidity"
            value={formatCompact(market.liquidity)}
          />
        )}
        <StatItem label="End Date" value={formatDate(market.expiry)} />
      </div>
      {market.description && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            About this market
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {market.description}
          </p>
        </div>
      )}
    </div>
  )
}

function MarketHeader({ market }: { market: Market }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3 sm:gap-4">
        {market.imageUrl && (
          <FadeImage
            src={market.imageUrl}
            alt=""
            wrapperClassName="size-12 shrink-0 rounded-full sm:size-14"
            className="size-12 rounded-full object-cover sm:size-14"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
            {market.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>Ends {formatDate(market.expiry)}</span>
            <span>{formatCompact(market.volume)} vol</span>
          </div>
        </div>
      </div>
      {market.tags && market.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {market.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function BinaryBody({ market }: { market: Market }) {
  const isMobile = useIsMobile()
  const { yesPercent } = useMarketOdds(market)
  const { windowLabel, handleWindowChange } = useWindowChange('15m')
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

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className="flex cursor-default items-center gap-2 rounded-lg bg-[#22c55e]/15 px-4 py-2"
        >
          <span className="text-sm font-medium text-[#22c55e]">Yes</span>
          <span className="font-semibold text-[#22c55e]">
            {yesPercent.toFixed(0)}%
          </span>
        </button>
        <button
          type="button"
          className="flex cursor-default items-center gap-2 rounded-lg bg-[#ef4444]/15 px-4 py-2"
        >
          <span className="text-sm font-medium text-[#ef4444]">No</span>
          <span className="font-semibold text-[#ef4444]">
            {(100 - yesPercent).toFixed(0)}%
          </span>
        </button>
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
        height={isMobile ? 200 : 340}
        formatValue={(v) => `${v.toFixed(1)}%`}
        window={WINDOW_LABEL_TO_SECS[windowLabel]}
        onWindowChange={handleWindowChange}
        isLoading={isLoading && history.length === 0}
        emptyText="No chart data available"
      />
    </div>
  )
}

function MultiOutcomeBody({ market }: { market: Market }) {
  const isMobile = useIsMobile()
  const outcomes = market.outcomes!

  const leadingOutcome = useMemo(() => outcomes[0], [outcomes])
  const chartClobId = leadingOutcome?.clobTokenId

  const { windowLabel, handleWindowChange } = useWindowChange('15m')
  const { data: history, isLoading } = useMarketHistory(
    chartClobId,
    windowLabel,
  )

  const chartValue = leadingOutcome?.percent ?? 0
  const chartData =
    history.length >= 2
      ? history
      : [
          { time: Date.now() / 1000 - 60, value: chartValue },
          { time: Date.now() / 1000, value: chartValue },
        ]

  const maxPercent = outcomes[0]?.percent ?? 1

  return (
    <div className="space-y-6">
      <LivelineChart
        data={chartData}
        value={chartValue}
        height={isMobile ? 200 : 340}
        formatValue={(v) => `${v.toFixed(1)}%`}
        window={WINDOW_LABEL_TO_SECS[windowLabel]}
        onWindowChange={handleWindowChange}
        isLoading={isLoading && history.length === 0}
        emptyText="No chart data available"
      />

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Outcomes
        </h2>
        <div className="space-y-2">
          {outcomes.map((outcome) => {
            const isLeading = outcome.percent === maxPercent
            return (
              <div key={outcome.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{outcome.name}</span>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      isLeading ? 'text-[#22c55e]' : 'text-muted-foreground',
                    )}
                  >
                    {outcome.percent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isLeading ? 'bg-[#22c55e]' : 'bg-muted-foreground/30',
                    )}
                    style={{ width: `${outcome.percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
