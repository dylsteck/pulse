import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { ViewMode } from '@/components/dashboard/tabs'

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
  const scrollRef = useRef<HTMLDivElement | null>(null)
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
    <div className="mx-auto flex w-full max-w-7xl py-2 sm:px-6">
      <div className="min-w-0 flex-1">
      <div ref={scrollRef} className="scroll-mt-2 pt-1">
        <div className="sticky top-12 z-20 -mx-2 mb-2 flex items-end justify-between gap-2 bg-background px-2 pb-2 pt-1 sm:-mx-6 sm:px-6">
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

        <div className="px-2 sm:px-0">
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
            />
          ) : (
            <PerpsPanel
              markets={perpMarkets ?? []}
              isLoading={false}
              layout="grid"
            />
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
      <TrendingSidebar tokens={liveTokens} markets={liveMarkets} />
    </div>
  )
}
