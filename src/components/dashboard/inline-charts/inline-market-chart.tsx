import React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Market } from '@/lib/types'
import {
  LivelineChart,
} from '@/components/trading/liveline-chart'
import { LivelineMultiChart } from '@/components/trading/liveline-multi-chart'
import { hasAnyPriceHistoryRecord } from '@/lib/polymarket'
import { buildMarketId } from '@/lib/caip19'
import { useInlineMarketChartModel } from '@/components/dashboard/inline-charts/use-inline-market-chart-model'

export function InlineMarketChart({ market }: { market: Market }) {
  const m = useInlineMarketChartModel(market)

  const headerRight =
    m.isMultiOutcome && m.outcomesLeading ? (
    <span className="text-sm font-semibold text-[#22c55e]">
      Leading {m.outcomesLeading.percent.toFixed(0)}%
    </span>
  ) : (
    <span className="text-sm font-semibold text-[#22c55e]">
      {Math.round(m.yesPercent)}% Yes
    </span>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{market.title}</span>
        {headerRight}
      </div>
      {m.showBinaryMulti ? (
        <LivelineMultiChart
          series={m.binaryDualSeries}
          height={280}
          formatValue={(v) => `${Math.round(v)}%`}
          window={m.windowSecs}
          onWindowChange={m.handleWindowChange}
          isLoading={
            m.batchLoading && !hasAnyPriceHistoryRecord(m.batchHistories)
          }
          emptyText="No chart data available"
        />
      ) : m.showMultiOutcomeChart ? (
        <LivelineMultiChart
          series={m.multiSeries}
          height={280}
          formatValue={(v) => `${Math.round(v)}%`}
          window={m.windowSecs}
          onWindowChange={m.handleWindowChange}
          isLoading={
            m.batchLoading && !hasAnyPriceHistoryRecord(m.batchHistories)
          }
          emptyText="No chart data available"
        />
      ) : (
        <LivelineChart
          data={m.chartData}
          value={m.yesPercent}
          height={280}
          formatValue={(v) => `${Math.round(v)}%`}
          window={m.windowSecs}
          onWindowChange={m.handleWindowChange}
          isLoading={m.singleLoading && m.singleHistory.length === 0}
          emptyText="No chart data available"
        />
      )}
      <Link
        to="/asset/$identifier"
        params={{ identifier: buildMarketId(market.id) }}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View full page
        <ArrowUpRight className="size-3" />
      </Link>
    </div>
  )
}
