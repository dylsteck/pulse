import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { ViewMode } from '@/components/dashboard/tabs'

import { useTortoiseSongs } from '@/hooks/use-tortoise-songs'
import { usePerpMarkets } from '@/hooks/use-perps'
import { useZoraCreators } from '@/hooks/use-zora-creators'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { useMemeTokens } from '@/hooks/use-meme-tokens'
import { PerpsPanel } from '@/components/perps/perps-panel'
import {
  CreatorsGrid,
  MarketGrid,
  MemeGrid,
  MusicGrid,
  TokenGrid,
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

export function UnifiedList({ initialMode = 'tokens' }: UnifiedListProps) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const creatorsLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const tokensLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const marketsLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const memesLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const musicLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const songsQuery = useTortoiseSongs()
  const songsData = songsQuery.data
  const perpsQuery = usePerpMarkets()
  const perpMarkets = perpsQuery.data
  const isPerpsLoading = perpsQuery.isLoading
  const creatorsQuery = useZoraCreators(20)
  const creators = creatorsQuery.items
  const liveTokensQuery = useLiveTokens()
  const liveMarketsQuery = useLiveMarkets()
  const memeTokensQuery = useMemeTokens()
  const liveTokens = liveTokensQuery.data
  const liveMarkets = liveMarketsQuery.data
  const memeTokens = memeTokensQuery.data

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useInfiniteScroll(creatorsLoadMoreRef, {
    hasMore: creatorsQuery.hasNextPage ?? false,
    isFetching: creatorsQuery.isFetchingNextPage,
    loadMore: () => void creatorsQuery.fetchNextPage(),
    enabled: mode === 'creators',
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
  useInfiniteScroll(musicLoadMoreRef, {
    hasMore: songsQuery.hasMore,
    isFetching: songsQuery.isFetchingMore,
    loadMore: () => void songsQuery.loadMore(),
    enabled: mode === 'music',
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
      <div ref={scrollRef} className="scroll-mt-4 pt-4">
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
          {mode === 'tokens' ? (
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
          ) : mode === 'creators' ? (
            creatorsQuery.isLoading ? (
              <LoadingPanel label="Loading creators..." />
            ) : creatorsQuery.error ? (
              <ErrorPanel
                label={
                  creatorsQuery.error instanceof Error
                    ? creatorsQuery.error.message
                    : 'Failed to load creator data.'
                }
              />
            ) : (
              <CreatorsGrid creators={creators} isLoading={false} />
            )
          ) : mode === 'music' ? (
            songsQuery.isLoading ? (
              <LoadingPanel label="Loading music..." />
            ) : songsQuery.error ? (
              <ErrorPanel
                label={
                  songsQuery.error instanceof Error
                    ? songsQuery.error.message
                    : 'Failed to load music data.'
                }
              />
            ) : (
              <MusicGrid songs={songsData.songs} isLoading={false} />
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
          {mode === 'creators' && creatorsQuery.hasNextPage && (
            <div ref={creatorsLoadMoreRef} className="h-6" aria-hidden />
          )}
          {mode === 'tokens' && liveTokensQuery.hasMore && (
            <div ref={tokensLoadMoreRef} className="h-6" aria-hidden />
          )}
          {mode === 'markets' && liveMarketsQuery.hasMore && (
            <div ref={marketsLoadMoreRef} className="h-6" aria-hidden />
          )}
          {mode === 'music' && songsQuery.hasMore && (
            <div ref={musicLoadMoreRef} className="h-6" aria-hidden />
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
      <TrendingSidebar tokens={liveTokens} />
    </div>
  )
}
