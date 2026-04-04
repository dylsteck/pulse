import React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Token } from '@/lib/types'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { useTokenPrice } from '@/hooks/use-token-price'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useWindowChange } from '@/hooks/use-window-change'
import { formatPrice } from '@/lib/format'
import { buildTokenId } from '@/lib/caip19'

export function InlineTokenChart({ token }: { token: Token }) {
  const { price } = useTokenPrice(token)
  const { windowLabel, handleWindowChange } = useWindowChange('15m')
  const { data: bars, isLoading } = useTokenBars(token.address, windowLabel)
  const chartData = bars.length >= 2 ? bars : token.priceHistory

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{token.symbol}</span>
        <span className="text-lg font-semibold tabular-nums">
          ${formatPrice(price)}
        </span>
      </div>
      <LivelineChart
        data={chartData}
        value={price}
        height={280}
        window={WINDOW_LABEL_TO_SECS[windowLabel]}
        onWindowChange={handleWindowChange}
        isLoading={isLoading && bars.length < 2}
        emptyText="No chart data available"
      />
      <Link
        to="/asset/$identifier"
        params={{ identifier: buildTokenId(token.id) }}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View full page
        <ArrowUpRight className="size-3" />
      </Link>
    </div>
  )
}
