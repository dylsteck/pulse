import { useCallback, useRef, useState } from 'react'
import type { CreatorToken } from '@/lib/zora/service'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useZoraCreators } from '@/hooks/use-zora-creators'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/lib/format'

export function CreatorDetail({ id }: { id: string }) {
  const creatorsQuery = useZoraCreators(100)
  const creator = creatorsQuery.items.find((c) => c.id === id)
  if (creatorsQuery.isLoading || !creator) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        {creatorsQuery.isLoading ? 'Loading…' : 'Creator not found'}
      </div>
    )
  }
  return <CreatorDetailContent creator={creator} />
}

function CreatorDetailContent({ creator }: { creator: CreatorToken }) {
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading: barsLoading } = useTokenBars(
    creator.address,
    windowLabel,
  )
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
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {creator.imageUrl && (
              <FadeImage
                src={creator.imageUrl}
                alt=""
                wrapperClassName="size-14 shrink-0 rounded-lg"
                className="size-14 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{creator.symbol}</h1>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    creator.marketCapDelta24h >= 0
                      ? 'bg-[#22c55e]/10 text-[#22c55e]'
                      : 'bg-[#ef4444]/10 text-[#ef4444]',
                  )}
                >
                  {creator.marketCapDelta24h >= 0 ? '+' : ''}
                  {creator.marketCapDelta24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {creator.creatorHandle ?? creator.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">
              ${lastValue.toFixed(lastValue >= 1 ? 4 : 8)}
            </div>
            <p className="text-xs text-muted-foreground">Token Price</p>
          </div>
        </div>
        <LivelineChart
          data={chartData}
          value={lastValue}
          height={380}
          color={color}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={barsLoading && chartData.length === 0}
          emptyText="No chart data available"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Market Cap
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(creator.marketCap)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Volume
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(creator.volume24h)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Holders
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {creator.uniqueHolders.toLocaleString('en-US')}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Change
          </p>
          <p
            className={cn(
              'text-lg font-semibold tabular-nums',
              creator.marketCapDelta24h >= 0
                ? 'text-[#22c55e]'
                : 'text-[#ef4444]',
            )}
          >
            {creator.marketCapDelta24h >= 0 ? '+' : ''}
            {formatCompact(creator.marketCapDelta24h)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Creator Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Contract</span>
            <a
              href={`https://basescan.org/address/${creator.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
            >
              {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
              <svg
                className="size-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
          {creator.creatorHandle && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Creator</span>
              <span className="font-medium">@{creator.creatorHandle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
