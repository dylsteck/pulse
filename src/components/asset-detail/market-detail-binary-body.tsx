import { useMemo } from 'react'
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
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useWindowChange } from '@/hooks/use-window-change'
import { useTheme } from '@/components/theme-provider'
import { hasAnyPriceHistoryRecord } from '@/lib/polymarket'
import { formatCompact, formatDate } from '@/lib/format'
import {
  POLYMARKET_NO_COLOR,
  POLYMARKET_YES_COLOR,
  buildPolymarketLivelineSeries,
} from '@/lib/polymarket-liveline-series'

/* eslint-disable max-lines-per-function -- chart + Yes/No controls */
export function MarketDetailBinaryBody({ market }: { market: Market }) {
  const chartHeight = useAssetChartHeight()
  const { yesPercent, noPercent } = useMarketOdds(market)
  const { windowLabel, handleWindowChange } = useWindowChange()
  const windowSecs = WINDOW_LABEL_TO_SECS[windowLabel]
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const useDual = Boolean(market.clobTokenId && market.noClobTokenId)

  const { data: batchHistories, isLoading: batchLoading } =
    useMarketBatchHistory(
      useDual && market.clobTokenId && market.noClobTokenId
        ? [market.clobTokenId, market.noClobTokenId]
        : [],
      windowLabel,
    )

  const { data: history, isLoading: singleLoading } = useMarketHistory(
    useDual ? undefined : market.clobTokenId,
    windowLabel,
  )

  const dualSeries = useMemo(() => {
    if (!useDual || !market.clobTokenId || !market.noClobTokenId) {
      return []
    }
    return buildPolymarketLivelineSeries(
      batchHistories,
      [
        {
          id: 'yes',
          label: 'Yes',
          color: POLYMARKET_YES_COLOR,
          tokenId: market.clobTokenId,
          currentPercent: yesPercent,
        },
        {
          id: 'no',
          label: 'No',
          color: POLYMARKET_NO_COLOR,
          tokenId: market.noClobTokenId,
          currentPercent: noPercent,
        },
      ],
      windowSecs,
    )
  }, [
    useDual,
    batchHistories,
    market.clobTokenId,
    market.noClobTokenId,
    yesPercent,
    noPercent,
    windowSecs,
  ])

  const chartData =
    history.length >= 2
      ? history
      : [
          { time: Date.now() / 1000 - 60, value: yesPercent },
          { time: Date.now() / 1000, value: yesPercent },
        ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
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
            {noPercent.toFixed(0)}%
          </span>
        </button>
        <MarketTradePopover market={market} defaultOutcome="yes" />
      </div>

      <AssetDetailChartBleed>
        {useDual && dualSeries.length >= 1 ? (
          <LivelineMultiChart
            series={dualSeries}
            height={chartHeight}
            formatValue={(v) => `${v.toFixed(1)}%`}
            window={windowSecs}
            onWindowChange={handleWindowChange}
            isLoading={batchLoading && !hasAnyPriceHistoryRecord(batchHistories)}
            emptyText="No chart data available"
            hideToolbar
          />
        ) : (
          <LivelineChart
            data={chartData}
            value={yesPercent}
            height={chartHeight}
            formatValue={(v) => `${v.toFixed(1)}%`}
            window={windowSecs}
            onWindowChange={handleWindowChange}
            isLoading={singleLoading && history.length === 0}
            emptyText="No chart data available"
            hideToolbar
          />
        )}
      </AssetDetailChartBleed>

      {/* chart footer: volume + date (left) | timeframes (right) */}
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
    </div>
  )
}
