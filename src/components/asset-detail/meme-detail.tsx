import { useCallback, useRef, useState } from 'react'
import type { MemeToken } from '@/lib/geckoterminal'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useMemeTokenDetail } from '@/hooks/use-meme-tokens'
import { useMemeOhlcv } from '@/hooks/use-meme-ohlcv'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact, formatDate, formatPrice } from '@/lib/format'
import { sanitizeExternalHttpUrl } from '@/lib/url'

export function MemeDetail({ id }: { id: string }) {
  const { data: meme, isLoading, isError } = useMemeTokenDetail(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <div className="size-14 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mb-6 h-9 w-40 animate-pulse rounded bg-muted" />
          <div className="h-[380px] w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load meme token
      </div>
    )
  }

  if (!meme) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Meme token not found
      </div>
    )
  }

  return <MemeDetailContent meme={meme} />
}

function MemeDetailContent({ meme }: { meme: MemeToken }) {
  const primaryWebsite = meme.websites?.[0]
  const safePrimaryWebsite = sanitizeExternalHttpUrl(primaryWebsite)
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useMemeOhlcv(meme.poolAddress, windowLabel)
  const chartData =
    bars.length >= 2
      ? bars
      : meme.priceHistory.length >= 2
        ? meme.priceHistory
        : [
            { time: Date.now() / 1000 - 3600, value: meme.price },
            { time: Date.now() / 1000, value: meme.price },
          ]

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const color = meme.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-4">
          {meme.imageUrl && (
            <FadeImage
              src={meme.imageUrl}
              alt=""
              wrapperClassName="size-12 shrink-0 rounded-full sm:size-14"
              className="size-12 rounded-full object-cover sm:size-14"
            />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">{meme.symbol}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {meme.name}
            </p>
          </div>
        </div>

        {meme.description?.trim() && (
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            {meme.description.trim()}
          </p>
        )}

        <div className="mb-1 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums sm:text-4xl">
              ${formatPrice(meme.price)}
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-sm font-medium',
                meme.change24h >= 0
                  ? 'bg-[#22c55e]/10 text-[#22c55e]'
                  : 'bg-[#ef4444]/10 text-[#ef4444]',
              )}
            >
              {meme.change24h >= 0 ? '+' : ''}
              {meme.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums">
              {formatCompact(meme.valuation)}
            </p>
            <p className="text-xs text-muted-foreground">
              {meme.valuationLabel}
            </p>
          </div>
        </div>

        {meme.launchProgress != null && (
          <div className="mt-4 rounded-xl border border-border/50 bg-card/30 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Launch progress</span>
              <span className="font-semibold tabular-nums">
                {meme.launchProgress.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/80 transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, meme.launchProgress))}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <LivelineChart
            data={chartData}
            value={meme.price}
            height={380}
            color={color}
            window={WINDOW_LABEL_TO_SECS[windowLabel]}
            onWindowChange={handleWindowChange}
            isLoading={isLoading && bars.length === 0}
            emptyText="No chart data available"
            exaggerate
            formatValue={(v) => `$${formatPrice(v)}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">24h Volume</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(meme.volume24h)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Liquidity</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(meme.liquidity)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">
            {meme.valuationLabel}
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(meme.valuation)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Holders</p>
          <p className="text-lg font-semibold tabular-nums">
            {meme.holdersCount?.toLocaleString('en-US') ?? '—'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          Token Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Contract</span>
            <span className="font-mono text-xs">{meme.address}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Pool</span>
            <a
              href={`https://www.geckoterminal.com/solana/pools/${meme.poolAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
            >
              {meme.poolAddress}
            </a>
          </div>
          {meme.createdAt && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(meme.createdAt)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">GT Score</span>
            <span>{meme.gtScore ? meme.gtScore.toFixed(1) : '—'}</span>
          </div>
          {safePrimaryWebsite && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Website</span>
              <a
                href={safePrimaryWebsite}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="truncate text-foreground underline underline-offset-2 hover:no-underline"
              >
                {safePrimaryWebsite}
              </a>
            </div>
          )}
          {meme.twitterHandle && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">X</span>
              <a
                href={`https://x.com/${meme.twitterHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                @{meme.twitterHandle.replace(/^@/, '')}
              </a>
            </div>
          )}
          {meme.telegramHandle && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Telegram</span>
              <a
                href={`https://t.me/${meme.telegramHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                @{meme.telegramHandle.replace(/^@/, '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
