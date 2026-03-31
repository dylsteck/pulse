import React, { useCallback, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { MemeToken } from '@/lib/geckoterminal'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useMemeOhlcv } from '@/hooks/use-meme-ohlcv'
import { formatPrice } from '@/lib/format'
import { buildMemeId } from '@/lib/caip19'

export function InlineMemeChart({ meme }: { meme: MemeToken }) {
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useMemeOhlcv(meme.poolAddress, windowLabel)
  const chartData =
    bars.length >= 2
      ? bars
      : meme.priceHistory.length >= 2
        ? meme.priceHistory
        : (() => {
            const now = Date.now() / 1000
            const val = meme.priceHistory[0]?.value ?? meme.price
            return [
              { time: now - 3600, value: val },
              { time: now, value: meme.price },
            ]
          })()

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]!
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const color = meme.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{meme.symbol}</span>
        <span className="text-lg font-semibold tabular-nums">
          ${formatPrice(meme.price)}
        </span>
      </div>
      <LivelineChart
        data={chartData}
        value={meme.price}
        height={280}
        color={color}
        window={WINDOW_LABEL_TO_SECS[windowLabel]}
        onWindowChange={handleWindowChange}
        isLoading={isLoading && bars.length === 0}
        emptyText="No chart data available"
        exaggerate
        formatValue={(v) => `$${formatPrice(v)}`}
      />
      <Link
        to="/asset/$identifier"
        params={{ identifier: buildMemeId(meme.id) }}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View full page
        <ArrowUpRight className="size-3" />
      </Link>
    </div>
  )
}
