import { useQuery } from '@tanstack/react-query'
import {
  AssetDetailStatsGrid,
  DetailMessage,
  StatItem,
} from './shared'
import type { Market } from '@/lib/types'
import { MarketDetailBinaryBody } from '@/components/asset-detail/market-detail-binary-body'
import { MarketDetailMultiBody } from '@/components/asset-detail/market-detail-multi-body'
import { FadeImage } from '@/components/ui/fade-image'
import { fetchPolymarketEventById } from '@/lib/polymarket'
import { formatCompact, formatDate } from '@/lib/format'

export function MarketDetail({ id }: { id: string }) {
  const {
    data: market,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['polymarket', 'event', id],
    queryFn: () => fetchPolymarketEventById(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-full bg-muted sm:size-14" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="mb-6 h-2 w-full animate-pulse rounded-full bg-muted" />
          <div className="min-h-[520px] w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <AssetDetailStatsGrid cols={3}>
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </AssetDetailStatsGrid>
      </div>
    )
  }

  if (isError) return <DetailMessage>Unable to load market</DetailMessage>
  if (!market) return <DetailMessage>Market not found</DetailMessage>
  return <MarketDetailContent market={market} />
}

function MarketDetailContent({ market }: { market: Market }) {
  const isMultiOutcome = market.outcomes && market.outcomes.length > 0

  return (
    <div className="space-y-6">
      <MarketHeader market={market} />
      {isMultiOutcome ? (
        <MarketDetailMultiBody market={market} />
      ) : (
        <MarketDetailBinaryBody market={market} />
      )}
      <AssetDetailStatsGrid cols={3}>
        <StatItem label="Volume" value={formatCompact(market.volume)} />
        {market.liquidity != null && market.liquidity > 0 && (
          <StatItem
            label="Liquidity"
            value={formatCompact(market.liquidity)}
          />
        )}
        <StatItem label="End Date" value={formatDate(market.expiry)} />
      </AssetDetailStatsGrid>
      {market.description && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            About this market
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {market.description}
          </p>
        </div>
      )}
    </div>
  )
}

function MarketHeader({ market }: { market: Market }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3 sm:gap-4">
        {market.imageUrl && (
          <FadeImage
            src={market.imageUrl}
            alt=""
            wrapperClassName="size-12 shrink-0 rounded-full sm:size-14"
            className="size-12 rounded-full object-cover sm:size-14"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
            {market.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>Ends {formatDate(market.expiry)}</span>
            <span>{formatCompact(market.volume)} vol</span>
          </div>
        </div>
      </div>
      {market.tags && market.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {market.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
