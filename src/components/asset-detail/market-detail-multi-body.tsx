import { useMemo, useState } from 'react'
import { AssetDetailChartBleed } from './shared'
import type { Market } from '@/lib/types'
import {
  LivelineChart,
  MARKET_TIME_WINDOWS,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { LivelineMultiChart } from '@/components/trading/liveline-multi-chart'
import { TimeframeSegmentedControl } from '@/components/trading/timeframe-segmented-control'
import { MarketTradePopover } from '@/components/trading/market-trade-popover'
import { useAssetChartHeight } from '@/hooks/use-asset-chart-height'
import { useMarketBatchHistory } from '@/hooks/use-market-batch-history'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useWindowChange } from '@/hooks/use-window-change'
import { useTheme } from '@/components/theme-provider'
import { hasAnyPriceHistoryRecord } from '@/lib/polymarket'
import { formatCompact, formatDate } from '@/lib/format'
import {
  POLYMARKET_MULTI_OUTCOME_COLORS,
  buildPolymarketLivelineSeries,
} from '@/lib/polymarket-liveline-series'
import { cn } from '@/lib/utils'

const MULTI_OUTCOME_CHART_CAP = 20
const LEGEND_VISIBLE_COUNT = 4

/* eslint-disable max-lines-per-function -- multi-series chart + outcome list */
export function MarketDetailMultiBody({ market }: { market: Market }) {
  const chartHeight = useAssetChartHeight()
  const outcomes = market.outcomes!
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const outcomesWithTokens = useMemo(
    () =>
      outcomes
        .filter((o) => o.clobTokenId)
        .slice(0, MULTI_OUTCOME_CHART_CAP),
    [outcomes],
  )

  const tokenIdsForBatch = useMemo(
    () =>
      outcomesWithTokens
        .map((o) => o.clobTokenId)
        .filter((id): id is string => Boolean(id)),
    [outcomesWithTokens],
  )

  const { windowLabel, handleWindowChange } = useWindowChange()
  const windowSecs = WINDOW_LABEL_TO_SECS[windowLabel]

  const { data: batchHistories, isLoading: batchLoading } =
    useMarketBatchHistory(tokenIdsForBatch, windowLabel)

  const leadingOutcome = outcomes[0]
  const chartClobId = leadingOutcome.clobTokenId

  const { data: fallbackHistory, isLoading: fallbackLoading } =
    useMarketHistory(
      tokenIdsForBatch.length > 0 ? undefined : chartClobId,
      windowLabel,
    )

  /* ── legend state ── */
  const [legendExpanded, setLegendExpanded] = useState(false)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const outcomeColors = useMemo(
    () =>
      outcomesWithTokens.map(
        (_, i) =>
          POLYMARKET_MULTI_OUTCOME_COLORS[
            i % POLYMARKET_MULTI_OUTCOME_COLORS.length
          ],
      ),
    [outcomesWithTokens],
  )

  const allSeries = useMemo(() => {
    if (outcomesWithTokens.length === 0) return []
    return buildPolymarketLivelineSeries(
      batchHistories,
      outcomesWithTokens.map((o, i) => ({
        id: `outcome-${i}-${o.name}`,
        label: o.name,
        color: outcomeColors[i],
        tokenId: o.clobTokenId!,
        currentPercent: o.percent,
      })),
      windowSecs,
    )
  }, [batchHistories, outcomesWithTokens, windowSecs, outcomeColors])

  const visibleSeries = useMemo(
    () => allSeries.filter((s) => !hiddenIds.has(s.id)),
    [allSeries, hiddenIds],
  )

  const toggleOutcome = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const chartValue = leadingOutcome.percent
  const chartData =
    fallbackHistory.length >= 2
      ? fallbackHistory
      : [
          { time: Date.now() / 1000 - 60, value: chartValue },
          { time: Date.now() / 1000, value: chartValue },
        ]

  const maxPercent = outcomes[0].percent
  const showMultiChart = visibleSeries.length > 0

  /* ── legend items (sorted by percent, top 4 visible by default) ── */
  const sortedForLegend = useMemo(
    () =>
      outcomesWithTokens
        .map((o, i) => ({ outcome: o, idx: i }))
        .sort((a, b) => b.outcome.percent - a.outcome.percent),
    [outcomesWithTokens],
  )
  const visibleLegend = legendExpanded
    ? sortedForLegend
    : sortedForLegend.slice(0, LEGEND_VISIBLE_COUNT)
  const hiddenCount = sortedForLegend.length - LEGEND_VISIBLE_COUNT

  return (
    <div className="space-y-4">
      {/* ── custom legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {visibleLegend.map(({ outcome, idx }) => {
          const seriesId = `outcome-${idx}-${outcome.name}`
          const isHidden = hiddenIds.has(seriesId)
          return (
            <button
              key={seriesId}
              type="button"
              onClick={() => toggleOutcome(seriesId)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 text-sm transition-opacity',
                isHidden ? 'opacity-35' : 'opacity-100',
              )}
            >
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: outcomeColors[idx] }}
              />
              <span className="text-muted-foreground">{outcome.name}</span>
              <span className="font-medium tabular-nums">
                {outcome.percent.toFixed(1)}%
              </span>
            </button>
          )
        })}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setLegendExpanded((v) => !v)}
            className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {legendExpanded ? 'Show less' : `+${hiddenCount} more`}
          </button>
        )}
      </div>

      {/* ── chart ── */}
      <AssetDetailChartBleed>
        {showMultiChart ? (
          <LivelineMultiChart
            series={visibleSeries}
            height={chartHeight}
            formatValue={(v) => `${v.toFixed(1)}%`}
            window={windowSecs}
            onWindowChange={handleWindowChange}
            isLoading={batchLoading && !hasAnyPriceHistoryRecord(batchHistories)}
            emptyText="No chart data available"
            hideToolbar
            hideSeriesToggle
          />
        ) : (
          <LivelineChart
            data={chartData}
            value={chartValue}
            height={chartHeight}
            formatValue={(v) => `${v.toFixed(1)}%`}
            window={windowSecs}
            onWindowChange={handleWindowChange}
            isLoading={fallbackLoading && fallbackHistory.length === 0}
            emptyText="No chart data available"
            hideToolbar
          />
        )}
      </AssetDetailChartBleed>

      {/* ── chart footer: volume + date (left) | timeframes (right) ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{formatCompact(market.volume)} Vol.</span>
          <span>·</span>
          <span>{formatDate(market.expiry)}</span>
        </div>
        <TimeframeSegmentedControl
          windows={MARKET_TIME_WINDOWS}
          value={windowSecs}
          onChange={(secs) => handleWindowChange(secs)}
          isDark={isDark}
        />
      </div>

      {/* ── outcomes list ── */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Outcomes
        </h2>
        <div className="space-y-2">
          {outcomes.map((outcome, idx) => {
            const isLeading = outcome.percent === maxPercent
            return (
              <div key={`${outcome.name}-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{outcome.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        isLeading ? 'text-[#22c55e]' : 'text-muted-foreground',
                      )}
                    >
                      {outcome.percent.toFixed(1)}%
                    </span>
                    {outcome.clobTokenId && (
                      <MarketTradePopover
                        market={market}
                        outcome={outcome}
                      />
                    )}
                  </div>
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
