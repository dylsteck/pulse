import { useCallback, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { CreatorToken } from '@/lib/zora/service'
import type { Market, Token } from '@/lib/types'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { ArrowLeft } from 'lucide-react'
import type { Song } from '@/lib/tortoise'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useTokenPrice } from '@/hooks/use-token-price'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useHyperliquidCandles } from '@/hooks/use-hyperliquid-candles'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useAudioDetail, useTortoiseSongs } from '@/hooks/use-tortoise-songs'
import { usePerpMarkets } from '@/hooks/use-perps'
import { useZoraCreators } from '@/hooks/use-zora-creators'
import { fetchCodexTokenByAddress } from '@/lib/codex'
import { fetchPolymarketEventById } from '@/lib/polymarket'
import { FadeImage } from '@/components/ui/fade-image'
import { imageUrl } from '@/lib/tortoise'
import { formatPerpPrice } from '@/lib/hyperliquid/service'
import { cn } from '@/lib/utils'
import { formatCompact, formatPrice, formatDate } from '@/lib/format'

const BACK_ROUTES: Record<string, string> = {
  tokens: '/tokens',
  markets: '/markets',
  creators: '/creators',
  music: '/music',
  perps: '/perps',
}

export function AssetDetailPage({ type, id }: { type: string; id: string }) {
  const navigate = useNavigate()
  const backTo = BACK_ROUTES[type] ?? '/tokens'

  return (
    <div className="mx-auto flex min-h-[calc(100vh-37px)] max-w-2xl flex-col px-3 py-4 sm:px-6">
      <button
        type="button"
        onClick={() => navigate({ to: backTo })}
        className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Back"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {type === 'tokens' && <TokenDetail id={id} />}
      {type === 'markets' && <MarketDetail id={id} />}
      {type === 'creators' && <CreatorDetail id={id} />}
      {type === 'music' && <MusicDetail id={id} />}
      {type === 'perps' && <PerpDetail id={id} />}
      {!['tokens', 'markets', 'creators', 'music', 'perps'].includes(type) && (
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Unknown asset type
        </div>
      )}
    </div>
  )
}

function TokenDetail({ id }: { id: string }) {
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
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load token
      </div>
    )
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Token not found
      </div>
    )
  }
  return <TokenDetailContent token={token} />
}

function TokenDetailContent({ token }: { token: Token }) {
  const { price } = useTokenPrice(token)
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useTokenBars(token.address, windowLabel)
  const chartData = bars.length >= 2 ? bars : token.priceHistory

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {token.imageUrl && (
            <FadeImage
              src={token.imageUrl}
              alt=""
              wrapperClassName="size-10 shrink-0 rounded-full"
              className="size-10 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-lg font-semibold">{token.symbol}</h1>
            <p className="text-sm text-muted-foreground">{token.name}</p>
          </div>
        </div>
        <span
          className={cn(
            'text-sm tabular-nums',
            token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        >
          {token.change24h >= 0 ? '+' : ''}
          {token.change24h.toFixed(2)}%
        </span>
      </div>
      <div className="mb-6 text-2xl tabular-nums">${formatPrice(price)}</div>
      {isLoading && chartData.length === 0 ? (
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
      ) : (
        <LivelineChart
          data={chartData}
          value={price}
          height={280}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
        />
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Volume</span>
          <p className="">
            {token.volume24h > 0 ? formatCompact(token.volume24h) : '—'}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Mkt Cap</span>
          <p className="">
            {token.marketCap > 0 ? formatCompact(token.marketCap) : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

function MarketDetail({ id }: { id: string }) {
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
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-2 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load market
      </div>
    )
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Market not found
      </div>
    )
  }
  return <MarketDetailContent market={market} />
}

function MarketDetailContent({ market }: { market: Market }) {
  const { yesPercent } = useMarketOdds(market)
  const [windowLabel, setWindowLabel] = useState('1D')
  const { data: history, isLoading } = useMarketHistory(
    market.clobTokenId,
    windowLabel,
  )

  const chartData =
    history.length >= 2
      ? history
      : [
          { time: Date.now() / 1000 - 60, value: yesPercent },
          { time: Date.now() / 1000, value: yesPercent },
        ]

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-medium">{market.title}</h1>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Yes {yesPercent.toFixed(1)}%
        </span>
        <span className="font-semibold text-[#22c55e]">
          {yesPercent.toFixed(1)}% Yes
        </span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[#22c55e]"
          style={{ width: `${yesPercent}%` }}
        />
      </div>
      {isLoading && history.length === 0 ? (
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
      ) : (
        <LivelineChart
          data={chartData}
          value={yesPercent}
          height={280}
          formatValue={(v) => `${v.toFixed(1)}%`}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
        />
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Volume</span>
          <p className="">{formatCompact(market.volume)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Expires</span>
          <p className="">{formatDate(market.expiry)}</p>
        </div>
      </div>
    </div>
  )
}

function CreatorDetail({ id }: { id: string }) {
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
  // Prefer Codex bars over Zora sparkline
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
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        {creator.imageUrl && (
          <FadeImage
            src={creator.imageUrl}
            alt=""
            wrapperClassName="size-14 rounded-lg"
            className="size-14 rounded-lg object-cover"
          />
        )}
        <div>
          <h1 className="text-lg font-semibold">{creator.symbol}</h1>
          <p className="text-sm text-muted-foreground">
            {creator.creatorHandle ?? creator.name}
          </p>
        </div>
        <span
          className={cn(
            'ml-auto text-sm tabular-nums',
            creator.marketCapDelta24h >= 0
              ? 'text-[#22c55e]'
              : 'text-[#ef4444]',
          )}
        >
          {creator.marketCapDelta24h >= 0 ? '+' : ''}
          {creator.marketCapDelta24h.toFixed(2)}%
        </span>
      </div>
      <div className="mb-6 text-2xl tabular-nums">
        ${lastValue.toFixed(lastValue >= 1 ? 4 : 8)}
      </div>
      {barsLoading && chartData.length === 0 ? (
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
      ) : chartData.length >= 2 ? (
        <LivelineChart
          data={chartData}
          value={lastValue}
          height={280}
          color={color}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
        />
      ) : (
        <div className="flex h-[280px] items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
          No chart data available
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Mkt Cap</span>
          <p className="">{formatCompact(creator.marketCap)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">24h Vol</span>
          <p className="">{formatCompact(creator.volume24h)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Holders</span>
          <p className="">{creator.uniqueHolders.toLocaleString('en-US')}</p>
        </div>
      </div>
    </div>
  )
}

function MusicDetail({ id }: { id: string }) {
  const { data: songsData, isLoading, isError } = useTortoiseSongs()
  const song = songsData?.songs.find((s) => s.id === id)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex gap-4">
          <div className="size-24 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load song
      </div>
    )
  }

  if (!song) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Song not found
      </div>
    )
  }
  return <MusicDetailContent song={song} />
}

function MusicDetailContent({ song }: { song: Song }) {
  const { data: audio, isLoading } = useAudioDetail(song.url_slug)
  const coverUrl = song.image_ipfs_cid ? imageUrl(song.image_ipfs_cid) : null
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex gap-4">
        {coverUrl ? (
          <FadeImage
            src={coverUrl}
            alt=""
            wrapperClassName="size-24 shrink-0 rounded-lg"
            className="size-24 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium">{song.title}</h1>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{song.collection_count} collections</span>
            {audio && <span>{audio.price} ETH</span>}
          </div>
          {isLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
          ) : audio?.url ? (
            <div className="mt-3">
              <audio controls src={audio.url} className="w-full max-w-md" />
            </div>
          ) : null}
          <a
            href={`https://tortoise.studio/song/${song.url_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
          >
            Collect on Tortoise
          </a>
        </div>
      </div>
    </div>
  )
}

function PerpDetail({ id }: { id: string }) {
  const { data: markets, isLoading, isError } = usePerpMarkets()
  const market = markets?.find((m) => m.id === id)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load perp market
      </div>
    )
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Perp market not found
      </div>
    )
  }
  return <PerpDetailContent market={market} />
}

function PerpDetailContent({ market }: { market: PerpMarketSnapshot }) {
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: candles, isLoading } = useHyperliquidCandles(
    market.coin,
    windowLabel,
  )

  const chartData = candles.length >= 2 ? candles : []

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const color = market.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FadeImage
            src={`https://app.hyperliquid.xyz/coins/${market.coin}.svg`}
            alt=""
            wrapperClassName="size-8 shrink-0 rounded-full"
            className="size-8 rounded-full object-cover"
          />
          <h1 className="text-lg font-semibold">{market.coin} PERP</h1>
        </div>
        <span
          className={cn(
            'text-sm tabular-nums',
            market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        >
          {market.change24h >= 0 ? '+' : ''}
          {market.change24h.toFixed(2)}%
        </span>
      </div>
      <div className="mb-6 text-2xl tabular-nums">
        ${formatPerpPrice(market, market.markPx)}
      </div>
      {isLoading && chartData.length === 0 ? (
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
      ) : chartData.length >= 2 ? (
        <LivelineChart
          data={chartData}
          value={market.markPx}
          height={280}
          color={color}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
        />
      ) : (
        <div className="flex h-[280px] items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
          No chart data available
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Volume</span>
          <p className="">{formatCompact(market.volume24h)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Funding</span>
          <p className="">{(market.funding * 100).toFixed(4)}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Open Interest</span>
          <p className="">{formatCompact(market.openInterest)}</p>
        </div>
      </div>
    </div>
  )
}
