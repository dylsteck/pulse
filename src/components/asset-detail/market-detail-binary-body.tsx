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
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useWindowChange } from '@/hooks/use-window-change'
import { hasAnyPriceHistoryRecord } from '@/lib/polymarket'
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
    <div>
      <div className="mb-4 flex items-center gap-2">
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

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[#22c55e] transition-all"
          style={{ width: `${yesPercent}%` }}
        />
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
          />
        )}
      </AssetDetailChartBleed>
    </div>
  )
}
