import {
  AssetDetailChartBleed,
  AssetDetailStatsGrid,
  ChangeBadge,
  DetailMessage,
  DetailRow,
  DetailSection,
  StatItem,
} from './shared'
import type { MemeToken } from '@/lib/geckoterminal'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { useMemeTokenDetail } from '@/hooks/use-meme-tokens'
import { useMemeOhlcv } from '@/hooks/use-meme-ohlcv'
import { useAssetChartHeight } from '@/hooks/use-asset-chart-height'
import { useWindowChange } from '@/hooks/use-window-change'
import { FadeImage } from '@/components/ui/fade-image'
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
          <div className="min-h-[520px] w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <AssetDetailStatsGrid>
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </AssetDetailStatsGrid>
      </div>
    )
  }

  if (isError) return <DetailMessage>Unable to load meme token</DetailMessage>
  if (!meme) return <DetailMessage>Meme token not found</DetailMessage>
  return <MemeDetailContent meme={meme} />
}

function MemeDetailContent({ meme }: { meme: MemeToken }) {
  const chartHeight = useAssetChartHeight()
  const primaryWebsite = meme.websites?.[0]
  const safePrimaryWebsite = sanitizeExternalHttpUrl(primaryWebsite)
  const { windowLabel, handleWindowChange } = useWindowChange()
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
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold tabular-nums sm:text-4xl">
              ${formatPrice(meme.price)}
            </span>
            <ChangeBadge value={meme.change24h} pill />
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

        <AssetDetailChartBleed className="mt-4 sm:mt-6">
          <LivelineChart
            data={chartData}
            value={meme.price}
            height={chartHeight}
            color={color}
            window={WINDOW_LABEL_TO_SECS[windowLabel]}
            onWindowChange={handleWindowChange}
            isLoading={isLoading && bars.length < 2}
            emptyText="No chart data available"
            exaggerate
            formatValue={(v) => `$${formatPrice(v)}`}
          />
        </AssetDetailChartBleed>
      </div>

      <AssetDetailStatsGrid>
        <StatItem label="24h Volume" value={formatCompact(meme.volume24h)} />
        <StatItem label="Liquidity" value={formatCompact(meme.liquidity)} />
        <StatItem
          label={meme.valuationLabel}
          value={formatCompact(meme.valuation)}
        />
        <StatItem
          label="Holders"
          value={meme.holdersCount?.toLocaleString('en-US') ?? '—'}
        />
      </AssetDetailStatsGrid>

      <DetailSection title="Token Details">
        <DetailRow label="Contract">
          <span className="font-mono text-xs">{meme.address}</span>
        </DetailRow>
        <DetailRow label="Pool">
          <a
            href={`https://www.geckoterminal.com/solana/pools/${meme.poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
          >
            {meme.poolAddress}
          </a>
        </DetailRow>
        {meme.createdAt && (
          <DetailRow label="Created">
            <span>{formatDate(meme.createdAt)}</span>
          </DetailRow>
        )}
        <DetailRow label="GT Score">
          <span>{meme.gtScore ? meme.gtScore.toFixed(1) : '—'}</span>
        </DetailRow>
        {safePrimaryWebsite && (
          <DetailRow label="Website">
            <a
              href={safePrimaryWebsite}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="truncate text-foreground underline underline-offset-2 hover:no-underline"
            >
              {safePrimaryWebsite}
            </a>
          </DetailRow>
        )}
        {meme.twitterHandle && (
          <DetailRow label="X">
            <a
              href={`https://x.com/${meme.twitterHandle.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:no-underline"
            >
              @{meme.twitterHandle.replace(/^@/, '')}
            </a>
          </DetailRow>
        )}
        {meme.telegramHandle && (
          <DetailRow label="Telegram">
            <a
              href={`https://t.me/${meme.telegramHandle.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:no-underline"
            >
              @{meme.telegramHandle.replace(/^@/, '')}
            </a>
          </DetailRow>
        )}
      </DetailSection>
    </div>
  )
}
