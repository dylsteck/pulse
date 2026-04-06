import { useMemo } from 'react'
import { AssetDetailChartBleed } from './shared'
import type { Market } from '@/lib/types'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { LivelineMultiChart } from '@/components/trading/liveline-multi-chart'
import { MarketTradePopover } from '@/components/trading/market-trade-popover'
import { useAssetChartHeight } from '@/hooks/use-asset-chart-height'
import { useMarketBatchHistory } from '@/hooks/use-market-batch-history'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useWindowChange } from '@/hooks/use-window-change'
import { hasAnyPriceHistoryRecord } from '@/lib/polymarket'
import {
  POLYMARKET_MULTI_OUTCOME_COLORS,
  buildPolymarketLivelineSeries,
} from '@/lib/polymarket-liveline-series'
import { cn } from '@/lib/utils'

const MULTI_OUTCOME_CHART_CAP = 20

/* eslint-disable max-lines-per-function -- multi-series chart + outcome list */
export function MarketDetailMultiBody({ market }: { market: Market }) {
  const chartHeight = useAssetChartHeight()
  const outcomes = market.outcomes!

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

  const multiSeries = useMemo(() => {
    if (outcomesWithTokens.length === 0) return []
    return buildPolymarketLivelineSeries(
      batchHistories,
      outcomesWithTokens.map((o, i) => ({
        id: `outcome-${i}-${o.name}`,
        label: o.name,
        color:
          POLYMARKET_MULTI_OUTCOME_COLORS[
            i % POLYMARKET_MULTI_OUTCOME_COLORS.length
          ],
        tokenId: o.clobTokenId!,
        currentPercent: o.percent,
      })),
      windowSecs,
    )
  }, [batchHistories, outcomesWithTokens, windowSecs])

  const chartValue = leadingOutcome.percent
  const chartData =
    fallbackHistory.length >= 2
      ? fallbackHistory
      : [
          { time: Date.now() / 1000 - 60, value: chartValue },
          { time: Date.now() / 1000, value: chartValue },
        ]

  const maxPercent = outcomes[0].percent

  const showMultiChart = multiSeries.length > 0

  return (
    <div className="space-y-6">
      <AssetDetailChartBleed>
        {showMultiChart ? (
          <LivelineMultiChart
            series={multiSeries}
            height={chartHeight}
            formatValue={(v) => `${v.toFixed(1)}%`}
            window={windowSecs}
            onWindowChange={handleWindowChange}
            isLoading={batchLoading && !hasAnyPriceHistoryRecord(batchHistories)}
            emptyText="No chart data available"
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
          />
        )}
      </AssetDetailChartBleed>

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
