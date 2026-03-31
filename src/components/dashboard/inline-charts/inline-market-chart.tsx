import React, { useCallback, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Market } from '@/lib/types'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useMarketHistory } from '@/hooks/use-market-history'
import { buildMarketId } from '@/lib/caip19'

export function InlineMarketChart({ market }: { market: Market }) {
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
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium">{market.title}</span>
        <span className="text-sm font-semibold text-[#22c55e]">
          {Math.round(yesPercent)}% Yes
        </span>
      </div>
      <LivelineChart
        data={chartData}
        value={yesPercent}
        height={280}
        formatValue={(v) => `${Math.round(v)}%`}
        window={WINDOW_LABEL_TO_SECS[windowLabel]}
        onWindowChange={handleWindowChange}
        isLoading={isLoading && history.length === 0}
        emptyText="No chart data available"
      />
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
