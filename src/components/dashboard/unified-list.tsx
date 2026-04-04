import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'
import type { ViewMode } from '@/components/dashboard/tabs'
import { cn } from '@/lib/utils'

import { usePerpMarkets } from '@/hooks/use-perps'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { useMemeTokens } from '@/hooks/use-meme-tokens'
import { PerpsPanel } from '@/components/perps/perps-panel'
import {
  MarketGrid,
  MemeGrid,
  TokenGrid,
  TrendingGrid,
} from '@/components/dashboard/grids'
import {
  ErrorPanel,
  LoadingPanel,
  MemeRetryState,
} from '@/components/dashboard/shared'
import { ModeTabs } from '@/components/dashboard/tabs'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { TrendingSidebar } from '@/components/dashboard/trending-sidebar'

export type { ViewMode } from '@/components/dashboard/tabs'

interface UnifiedListProps {
  initialMode?: ViewMode
}

export function UnifiedList({ initialMode = 'trending' }: UnifiedListProps) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const trendingLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const tokensLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const marketsLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const memesLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const perpsQuery = usePerpMarkets()
  const perpMarkets = perpsQuery.data
  const isPerpsLoading = perpsQuery.isLoading
  const liveTokensQuery = useLiveTokens()
  const liveMarketsQuery = useLiveMarkets()
  const memeTokensQuery = useMemeTokens()
  const liveTokens = liveTokensQuery.data
  const liveMarkets = liveMarketsQuery.data
  const memeTokens = memeTokensQuery.data

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const trendingHasMore =
    liveTokensQuery.hasMore ||
    liveMarketsQuery.hasMore ||
    memeTokensQuery.hasMore
  const trendingIsFetching =
    liveTokensQuery.isFetching &&
    liveMarketsQuery.isFetching &&
    memeTokensQuery.isFetching
  useInfiniteScroll(trendingLoadMoreRef, {
    hasMore: trendingHasMore,
    isFetching: trendingIsFetching,
    loadMore: () => {
      if (liveTokensQuery.hasMore) liveTokensQuery.loadMore()
      if (liveMarketsQuery.hasMore) liveMarketsQuery.loadMore()
      if (memeTokensQuery.hasMore) void memeTokensQuery.loadMore()
    },
    enabled: mode === 'trending',
  })
  useInfiniteScroll(tokensLoadMoreRef, {
    hasMore: liveTokensQuery.hasMore,
    isFetching: liveTokensQuery.isFetching,
    loadMore: () => liveTokensQuery.loadMore(),
    enabled: mode === 'tokens',
  })
  useInfiniteScroll(marketsLoadMoreRef, {
    hasMore: liveMarketsQuery.hasMore,
    isFetching: liveMarketsQuery.isFetching,
    loadMore: () => liveMarketsQuery.loadMore(),
    enabled: mode === 'markets',
  })
  useInfiniteScroll(memesLoadMoreRef, {
    hasMore: memeTokensQuery.hasMore,
    isFetching: memeTokensQuery.isFetching,
    loadMore: () => void memeTokensQuery.loadMore(),
    enabled: mode === 'memes',
    rootMargin: '400px 0px',
    threshold: 0,
  })

  return (
    <div className="mx-auto flex w-full max-w-7xl sm:px-6">
      <div className="min-w-0 flex-1">
        <div ref={scrollRef} className="scroll-mt-1 min-w-0">
          <div className="sticky top-12 z-20 -mx-2 flex items-center gap-2 bg-background/95 px-4 pb-1.5 pt-1 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85 sm:-mx-6 sm:px-6">
            <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ModeTabs
                mode={mode}
                onModeChange={(tab) => {
                  navigate({
                    to: '/',
                    search: { type: tab },
                    resetScroll: false,
                  })
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="hidden shrink-0 items-center justify-center rounded-md border border-border px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
              aria-label={
                sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
              }
            >
              <ChevronRightIcon
                className={cn(
                  'size-4 transition-transform duration-200',
                  sidebarCollapsed ? 'rotate-180' : '',
                )}
              />
            </button>
          </div>

          <div className="mt-2 overflow-x-clip px-2 sm:px-0">
            {mode === 'trending' ? (
              <TrendingGrid
                tokens={liveTokens ?? []}
                markets={liveMarkets ?? []}
                perps={perpMarkets ?? []}
                memes={memeTokens ?? []}
                tokensLoading={liveTokensQuery.isLoading}
                marketsLoading={liveMarketsQuery.isLoading}
                perpsLoading={isPerpsLoading}
                memesLoading={memeTokensQuery.isLoading}
              />
            ) : mode === 'tokens' ? (
              liveTokensQuery.isLoading ? (
                <LoadingPanel label="Loading live token data..." />
              ) : liveTokensQuery.error ? (
                <ErrorPanel
                  label={
                    liveTokensQuery.error instanceof Error
                      ? liveTokensQuery.error.message
                      : 'Failed to load live token data.'
                  }
                  onRetry={() => void liveTokensQuery.refetch()}
                />
              ) : (
                <TokenGrid tokens={liveTokens} />
              )
            ) : mode === 'markets' ? (
              liveMarketsQuery.isLoading ? (
                <LoadingPanel label="Loading Polymarket events..." />
              ) : liveMarketsQuery.error ? (
                <ErrorPanel
                  label={
                    liveMarketsQuery.error instanceof Error
                      ? liveMarketsQuery.error.message
                      : 'Failed to load live market data.'
                  }
                  onRetry={() => void liveMarketsQuery.refetch()}
                />
              ) : (
                <MarketGrid markets={liveMarkets} />
              )
            ) : mode === 'memes' ? (
              memeTokensQuery.isLoading ? (
                <LoadingPanel label="Loading memes..." />
              ) : memeTokensQuery.error ? (
                <MemeRetryState onRetry={() => memeTokensQuery.refetch()} />
              ) : (
                <MemeGrid memes={memeTokens} isLoading={false} />
              )
            ) : isPerpsLoading ? (
              <LoadingPanel label="Loading perps..." />
            ) : perpsQuery.error ? (
              <ErrorPanel
                label={
                  perpsQuery.error instanceof Error
                    ? perpsQuery.error.message
                    : 'Failed to load perps data.'
                }
                onRetry={() => void perpsQuery.refetch()}
              />
            ) : (
              <PerpsPanel
                markets={perpMarkets ?? []}
                isLoading={false}
                layout="grid"
              />
            )}
            {mode === 'trending' && trendingHasMore && (
              <div ref={trendingLoadMoreRef} className="h-6" aria-hidden />
            )}
            {mode === 'tokens' && liveTokensQuery.hasMore && (
              <div ref={tokensLoadMoreRef} className="h-6" aria-hidden />
            )}
            {mode === 'markets' && liveMarketsQuery.hasMore && (
              <div ref={marketsLoadMoreRef} className="h-6" aria-hidden />
            )}
            {mode === 'memes' && memeTokensQuery.hasMore && (
              <div
                ref={memesLoadMoreRef}
                className="flex min-h-[120px] items-center justify-center py-8"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!memeTokensQuery.isFetching)
                      void memeTokensQuery.loadMore()
                  }}
                  disabled={memeTokensQuery.isFetching}
                  className="rounded-md border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {memeTokensQuery.isFetching ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <TrendingSidebar
        tokens={liveTokens}
        markets={liveMarkets}
        collapsed={sidebarCollapsed}
      />
    </div>
  )
}
