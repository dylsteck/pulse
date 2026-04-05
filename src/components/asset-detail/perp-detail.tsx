import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { useHyperliquidCandles } from '@/hooks/use-hyperliquid-candles'
import { usePerpMarkets } from '@/hooks/use-perps'
import { useWindowChange } from '@/hooks/use-window-change'
import { FadeImage } from '@/components/ui/fade-image'
import { formatPerpPrice } from '@/lib/hyperliquid/service'
import { formatCompact } from '@/lib/format'
import { useAssetChartHeight } from '@/hooks/use-asset-chart-height'
import {
  StatItem,
  DetailSection,
  DetailRow,
  ChangeBadge,
  DetailMessage,
} from './shared'
import { cn } from '@/lib/utils'

export function PerpDetail({ id }: { id: string }) {
  const { data: markets, isLoading, isError } = usePerpMarkets()
  const market = markets?.find((m) => m.id === id)

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
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) return <DetailMessage>Unable to load perp market</DetailMessage>
  if (!market) return <DetailMessage>Perp market not found</DetailMessage>
  return <PerpDetailContent market={market} />
}

function PerpDetailContent({ market }: { market: PerpMarketSnapshot }) {
  const chartHeight = useAssetChartHeight()
  const { windowLabel, handleWindowChange } = useWindowChange()
  const { data: candles, isLoading } = useHyperliquidCandles(
    market.coin,
    windowLabel,
  )
  const chartData = candles.length >= 2 ? candles : []
  const color = market.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-3 sm:gap-4">
          <FadeImage
            src={`https://app.hyperliquid.xyz/coins/${market.coin}.svg`}
            alt=""
            wrapperClassName="size-12 shrink-0 rounded-full sm:size-14"
            className="size-12 rounded-full object-cover sm:size-14"
          />
          <div>
            <h1 className="text-xl font-semibold">{market.coin} PERP</h1>
            <p className="text-sm text-muted-foreground">Perpetual Futures</p>
          </div>
        </div>

        <div className="mb-1 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold tabular-nums sm:text-4xl">
              {formatPerpPrice(market, market.markPx)}
            </span>
            <ChangeBadge value={market.change24h} pill />
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums">
              {formatCompact(market.volume24h)}
            </p>
            <p className="text-xs text-muted-foreground">24h Volume</p>
          </div>
        </div>

        <div className="mt-6">
          <LivelineChart
            data={chartData}
            value={market.markPx}
            height={chartHeight}
            color={color}
            window={WINDOW_LABEL_TO_SECS[windowLabel]}
            onWindowChange={handleWindowChange}
            isLoading={isLoading && candles.length < 2}
            emptyText="No chart data available"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <StatItem label="24h Volume" value={formatCompact(market.volume24h)} />
        <StatItem
          label="Funding Rate"
          value={`${(market.funding * 100).toFixed(4)}%`}
          className={cn(
            market.funding >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        />
        <StatItem
          label="Open Interest"
          value={formatCompact(market.openInterest)}
        />
        <StatItem
          label="24h Change"
          value={`${market.change24h >= 0 ? '+' : ''}${market.change24h.toFixed(2)}%`}
          className={cn(
            market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        />
      </div>

      <DetailSection title="Position Details">
        <DetailRow label="Mark Price">
          <span className="font-semibold tabular-nums">
            {formatPerpPrice(market, market.markPx)}
          </span>
        </DetailRow>
        <DetailRow label="Mid Price">
          <span className="font-semibold tabular-nums">
            {formatPerpPrice(market, market.midPx)}
          </span>
        </DetailRow>
        <DetailRow label="Prev Day">
          <span className="font-semibold tabular-nums">
            {formatPerpPrice(market, market.prevDayPx)}
          </span>
        </DetailRow>
        <DetailRow label="Max Leverage">
          <span className="font-semibold tabular-nums">
            {market.maxLeverage}x
          </span>
        </DetailRow>
      </DetailSection>
    </div>
  )
}
