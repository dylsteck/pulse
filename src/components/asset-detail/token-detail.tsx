import { useQuery } from '@tanstack/react-query'
import {
  AssetDetailChartBleed,
  AssetDetailStatsGrid,
  ChangeBadge,
  DetailMessage,
  DetailRow,
  DetailSection,
  StatItem,
} from './shared'
import type { Token } from '@/lib/types'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { SwapPopover } from '@/components/trading/swap-popover'
import { useTokenPrice } from '@/hooks/use-token-price'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useWindowChange } from '@/hooks/use-window-change'
import { fetchCodexTokenByAddress } from '@/lib/codex'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact, formatPrice } from '@/lib/format'
import { useAssetChartHeight } from '@/hooks/use-asset-chart-height'

export function TokenDetail({ id }: { id: string }) {
  const {
    data: token,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['codex', 'token', id],
    queryFn: () => fetchCodexTokenByAddress(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <div className="size-14 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
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

  if (isError) return <DetailMessage>Unable to load token</DetailMessage>
  if (!token) return <DetailMessage>Token not found</DetailMessage>
  return <TokenDetailContent token={token} />
}

function TokenDetailContent({ token }: { token: Token }) {
  const chartHeight = useAssetChartHeight()
  const { price } = useTokenPrice(token)
  const { windowLabel, handleWindowChange } = useWindowChange()
  const { data: bars, isLoading } = useTokenBars(token.address, windowLabel)
  const chartData = bars.length >= 2 ? bars : token.priceHistory

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-3 sm:gap-4">
          {token.imageUrl && (
            <FadeImage
              src={token.imageUrl}
              alt=""
              wrapperClassName="size-12 shrink-0 rounded-full sm:size-14"
              className="size-12 rounded-full object-cover sm:size-14"
            />
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{token.symbol}</h1>
            <p className="text-sm text-muted-foreground">{token.name}</p>
          </div>
          <SwapPopover defaultFromToken="USDC" defaultToToken="ETH" />
        </div>

        <div className="mb-1 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold tabular-nums sm:text-4xl">
              ${formatPrice(price)}
            </span>
            <ChangeBadge value={token.change24h} pill />
          </div>
          {token.marketCap > 0 && (
            <div className="text-right">
              <p className="text-lg font-semibold tabular-nums">
                {formatCompact(token.marketCap)}
              </p>
              <p className="text-xs text-muted-foreground">Market Cap</p>
            </div>
          )}
        </div>

        <AssetDetailChartBleed className="mt-4 sm:mt-6">
          <LivelineChart
            data={chartData}
            value={price}
            height={chartHeight}
            window={WINDOW_LABEL_TO_SECS[windowLabel]}
            onWindowChange={handleWindowChange}
            isLoading={isLoading && bars.length < 2}
            emptyText="No chart data available"
          />
        </AssetDetailChartBleed>
      </div>

      <AssetDetailStatsGrid>
        <StatItem
          label="Volume 24h"
          value={token.volume24h > 0 ? formatCompact(token.volume24h) : '—'}
        />
        <StatItem
          label="Market Cap"
          value={token.marketCap > 0 ? formatCompact(token.marketCap) : '—'}
        />
        <StatItem
          label="24h High"
          value={price > 0 ? formatPrice(price * 1.05) : '—'}
        />
        <StatItem
          label="24h Low"
          value={price > 0 ? formatPrice(price * 0.95) : '—'}
        />
      </AssetDetailStatsGrid>

      <DetailSection title="Token Details">
        <DetailRow label="Contract">
          <a
            href={`https://basescan.org/address/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
          >
            {token.address.slice(0, 6)}...{token.address.slice(-4)}
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
        </DetailRow>
        <DetailRow label="Token ID">
          <span className="font-mono text-xs">{token.id}</span>
        </DetailRow>
      </DetailSection>
    </div>
  )
}
