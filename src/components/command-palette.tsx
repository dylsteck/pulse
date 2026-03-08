'use client'

import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowUpDownIcon,
  CoinsIcon,
  FlameIcon,
  GithubIcon,
  MusicIcon,
  SparklesIcon,
  TrendingUpIcon,
} from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { FadeImage } from '@/components/ui/fade-image'
import { SparklineChart } from '@/components/trading/liveline-chart'
import { useCommandSearch, type CommandSearchItem } from '@/hooks/use-command-search'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useMemeOhlcv } from '@/hooks/use-meme-ohlcv'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useHyperliquidCandles } from '@/hooks/use-hyperliquid-candles'
import { useTokenPrice } from '@/hooks/use-token-price'
import type { Token } from '@/lib/types'
import type { Market } from '@/lib/types'
import type { CreatorToken } from '@/lib/zora/service'
import type { MemeToken } from '@/lib/geckoterminal'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { imageUrl, type Song } from '@/lib/tortoise'
import { cn } from '@/lib/utils'

const ASSET_ICONS: Record<
  CommandSearchItem['type'],
  React.ComponentType<{ className?: string }>
> = {
  tokens: CoinsIcon,
  markets: TrendingUpIcon,
  creators: SparklesIcon,
  music: MusicIcon,
  perps: ArrowUpDownIcon,
  memes: FlameIcon,
}

const GROUP_HEADINGS: Record<CommandSearchItem['type'], string> = {
  tokens: 'Tokens',
  markets: 'Markets',
  creators: 'Creators',
  music: 'Music',
  perps: 'Perps',
  memes: 'Memes',
}

function AssetIcon({ item }: { item: CommandSearchItem }) {
  const raw = item.raw
  const rounded = item.type === 'tokens' || item.type === 'memes' ? 'rounded-full' : 'rounded-sm'
  if (item.type === 'tokens') {
    const token = raw as Token
    if (token.imageUrl) {
      return (
        <FadeImage
          src={token.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  if (item.type === 'markets') {
    const market = raw as Market
    if (market.imageUrl) {
      return (
        <FadeImage
          src={market.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  if (item.type === 'creators') {
    const creator = raw as CreatorToken
    if (creator.imageUrl) {
      return (
        <FadeImage
          src={creator.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  if (item.type === 'music') {
    const song = raw as Song
    return (
      <FadeImage
        src={imageUrl(song.image_ipfs_cid)}
        alt=""
        wrapperClassName={`size-6 shrink-0 ${rounded}`}
        className="size-full object-cover"
      />
    )
  }
  if (item.type === 'memes') {
    const meme = raw as MemeToken
    if (meme.imageUrl) {
      return (
        <FadeImage
          src={meme.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  const Icon = ASSET_ICONS[item.type]
  return <Icon className="size-5 shrink-0 text-muted-foreground" />
}

function TokenChartPreview({ token }: { token: Token }) {
  const { data: bars, isLoading } = useTokenBars(token.address, '1D')
  const { price } = useTokenPrice(token)
  const chartData = bars.length >= 2 ? bars : token.priceHistory
  const color = token.change24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || chartData.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart data={chartData} value={price} color={color} height={80} />
    </div>
  )
}

function CreatorChartPreview({ creator }: { creator: CreatorToken }) {
  const { data: bars, isLoading } = useTokenBars(creator.address, '1D')
  const chartData = bars.length >= 2 ? bars : creator.sparkline
  const value = creator.sparkline[creator.sparkline.length - 1]?.value ?? 0
  const color = creator.marketCapDelta24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || chartData.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart data={chartData} value={value} color={color} height={80} />
    </div>
  )
}

function MemeChartPreview({ meme }: { meme: MemeToken }) {
  const { data: bars, isLoading } = useMemeOhlcv(meme.poolAddress, '1D')
  const chartData =
    bars.length >= 2 ? bars : meme.priceHistory.length >= 2 ? meme.priceHistory : []
  const color = meme.change24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || chartData.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={chartData}
        value={meme.price}
        color={color}
        height={80}
      />
    </div>
  )
}

function MarketChartPreview({ market }: { market: Market }) {
  const clobTokenId = market.clobTokenId
  if (!clobTokenId) return null
  const { data: history, isLoading } = useMarketHistory(clobTokenId, '1D')
  const color = '#3b82f6'
  if (isLoading || !history || history.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={history}
        value={market.yesPercent}
        color={color}
        height={80}
      />
    </div>
  )
}

function PerpChartPreview({ perp }: { perp: PerpMarketSnapshot }) {
  const { data: candles, isLoading } = useHyperliquidCandles(perp.coin, '1D')
  const color = perp.change24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || !candles || candles.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={candles}
        value={perp.markPx}
        color={color}
        height={80}
      />
    </div>
  )
}

function ChartPreview({ item }: { item: CommandSearchItem }) {
  if (!item.hasChart) return null
  const raw = item.raw
  let chart: React.ReactNode = null
  switch (item.type) {
    case 'tokens':
      chart = <TokenChartPreview token={raw as Token} />
      break
    case 'creators':
      chart = <CreatorChartPreview creator={raw as CreatorToken} />
      break
    case 'memes':
      chart = <MemeChartPreview meme={raw as MemeToken} />
      break
    case 'markets':
      chart = <MarketChartPreview market={raw as Market} />
      break
    case 'perps':
      chart = <PerpChartPreview perp={raw as PerpMarketSnapshot} />
      break
  }
  if (!chart) return null
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-popover/95 backdrop-blur-sm">
      {chart}
    </div>
  )
}

const OPEN_COMMAND_PALETTE = 'open-command-palette'

export function openCommandPalette() {
  document.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE))
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState<string>('')
  const navigate = useNavigate()
  const { items } = useCommandSearch()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    document.addEventListener('keydown', down)
    document.addEventListener(OPEN_COMMAND_PALETTE, onOpen)
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener(OPEN_COMMAND_PALETTE, onOpen)
    }
  }, [])

  React.useEffect(() => {
    if (!open) setSelectedValue('')
  }, [open])

  const selectedItem = React.useMemo(
    () => items.find((i) => i.value === selectedValue),
    [items, selectedValue],
  )

  const itemsByType = React.useMemo(() => {
    const map = new Map<CommandSearchItem['type'], CommandSearchItem[]>()
    for (const item of items) {
      const list = map.get(item.type) ?? []
      list.push(item)
      map.set(item.type, list)
    }
    return map
  }, [items])

  const handleSelect = React.useCallback(
    (value: string) => {
      if (value === 'github') {
        window.open('https://github.com/dylsteck/pulse', '_blank')
        setOpen(false)
        return
      }
      const item = items.find((i) => i.value === value)
      if (item) {
        navigate({ to: '/asset/$type/$id', params: { type: item.type, id: item.id } })
        setOpen(false)
      }
    },
    [items, navigate],
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search tokens, markets, creators, music, perps, and memes"
      showCloseButton={false}
      className="max-w-xl"
    >
      <Command
        value={selectedValue}
        onValueChange={setSelectedValue}
        className="rounded-lg border-0"
      >
        <div className="relative border-b border-border/50">
          <CommandInput
            placeholder="Search tokens, markets, creators..."
            className="pr-12 placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <CommandList
            className={cn(
              "max-h-[min(20rem,60vh)] flex-1 overflow-y-auto",
              selectedItem?.hasChart && "pb-28",
            )}
          >
            <CommandEmpty>No results found.</CommandEmpty>
          {(['tokens', 'markets', 'creators', 'music', 'perps', 'memes'] as const).map(
            (type) => {
              const typeItems = itemsByType.get(type) ?? []
              if (typeItems.length === 0) return null
              return (
                <CommandGroup key={type} heading={GROUP_HEADINGS[type]}>
                  {typeItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      keywords={[item.label, item.subtitle].filter(Boolean)}
                      onSelect={() => handleSelect(item.value)}
                      className="gap-2.5"
                    >
                      <AssetIcon item={item} />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.label}
                      </span>
                      {item.subtitle && (
                        <span className="truncate text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            },
          )}
          <CommandSeparator />
          <CommandGroup heading="Quick actions">
            <CommandItem value="github" onSelect={() => handleSelect('github')}>
              <GithubIcon className="size-3.5 shrink-0" />
              <span>Open GitHub</span>
              <CommandShortcut>⌘G</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          </CommandList>
          {selectedItem?.hasChart && <ChartPreview item={selectedItem} />}
        </div>
      </Command>
    </CommandDialog>
  )
}
