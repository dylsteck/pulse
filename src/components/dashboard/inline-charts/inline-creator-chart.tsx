import React, { useCallback, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { CreatorToken } from '@/lib/zora/service'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useTokenBars } from '@/hooks/use-token-bars'

export function InlineCreatorChart({ creator }: { creator: CreatorToken }) {
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useTokenBars(creator.address, windowLabel)

  const chartData =
    bars.length >= 2
      ? bars
      : creator.sparkline.length >= 2
        ? creator.sparkline
        : []

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const lastValue = chartData.at(-1)?.value ?? 0
  const color = creator.marketCapDelta24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{creator.symbol}</span>
        <span className="text-lg font-semibold tabular-nums">
          ${lastValue.toFixed(lastValue >= 1 ? 4 : 8)}
        </span>
      </div>
      <LivelineChart
        data={chartData}
        value={lastValue}
        height={280}
        color={color}
        window={WINDOW_LABEL_TO_SECS[windowLabel]}
        onWindowChange={handleWindowChange}
        isLoading={isLoading && chartData.length === 0}
        emptyText="No chart data available"
      />
      <Link
        to="/asset/$type/$id"
        params={{ type: 'creators', id: creator.id }}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View full page
        <ArrowUpRight className="size-3" />
      </Link>
    </div>
  )
}
