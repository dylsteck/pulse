import { useQuery } from '@tanstack/react-query'
import { DetailMessage } from './shared'
import type { Market } from '@/lib/types'
import { MarketDetailBinaryBody } from '@/components/asset-detail/market-detail-binary-body'
import { MarketDetailMultiBody } from '@/components/asset-detail/market-detail-multi-body'
import { FadeImage } from '@/components/ui/fade-image'
import { fetchPolymarketEventById } from '@/lib/polymarket'

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
      <div className="space-y-4">
        <div>
          <div className="mb-1 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-full bg-muted sm:size-14" />
            <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="min-h-[520px] w-full animate-pulse rounded-lg bg-muted" />
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
    <div className="space-y-4">
      <MarketHeader market={market} />
      {isMultiOutcome ? (
        <MarketDetailMultiBody market={market} />
      ) : (
        <MarketDetailBinaryBody market={market} />
      )}
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

const META_TAGS = new Set(['hide from new', 'hide from trending'])

function MarketHeader({ market }: { market: Market }) {
  const breadcrumb = (market.tags ?? [])
    .filter((t) => !META_TAGS.has(t.toLowerCase()))
    .slice(0, 2)

  return (
    <div>
      {breadcrumb.length > 0 && (
        <p className="mb-1 text-sm text-muted-foreground">
          {breadcrumb.join(' · ')}
        </p>
      )}
      <div className="flex items-center gap-3 sm:gap-4">
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
        </div>
      </div>
    </div>
  )
}
