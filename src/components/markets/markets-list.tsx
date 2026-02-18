import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { LivelineChart } from '@/components/trading/liveline-chart'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { MARKETS, type Market } from '@/lib/mock/markets'

function formatCompact(v: number): string {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v}`
}

function formatExpiry(s: string): string {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function MarketsList() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const selectedIndexRef = useRef(selectedIndex)

  useEffect(() => { selectedIndexRef.current = selectedIndex }, [selectedIndex])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => {
          const next = Math.min(i + 1, MARKETS.length - 1)
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => {
          const next = Math.max(i - 1, 0)
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const selectedMarket = MARKETS[selectedIndex]

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Left: market table */}
      <div className="flex-1 overflow-y-auto border-r border-border">
        <div className="sticky top-0 z-10 grid grid-cols-[3fr_0.6fr_0.8fr_0.8fr_16px] border-b border-border bg-background px-6 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Market</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Yes</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Volume</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Expires</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">↑↓</span>
        </div>

        {MARKETS.map((market, i) => {
          const selected = i === selectedIndex
          return (
            <button
              key={market.id}
              ref={(el) => { rowRefs.current[i] = el }}
              className={cn(
                'w-full grid grid-cols-[3fr_0.6fr_0.8fr_0.8fr_16px] items-center border-b border-border px-6 py-3.5 text-left transition-colors last:border-0',
                selected ? 'bg-accent' : 'hover:bg-accent/40',
                selected ? 'border-l-2 border-l-foreground' : 'border-l-2 border-l-transparent',
              )}
              onClick={() => setSelectedIndex(i)}
              aria-selected={selected}
            >
              <span className="text-sm">{market.title}</span>
              <span className="text-right font-mono text-sm tabular-nums">{market.yesPercent}%</span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatCompact(market.volume)}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatExpiry(market.expiry)}
              </span>
              <div />
            </button>
          )
        })}
      </div>

      {/* Right: detail + trade panel */}
      <div className="w-[400px] shrink-0 overflow-y-auto">
        <MarketDetailPanel market={selectedMarket} />
      </div>
    </div>
  )
}

function MarketDetailPanel({ market }: { market: Market }) {
  const { yesPercent, noPercent, history } = useMarketOdds(market)
  const [pick, setPick] = useState<'yes' | 'no'>('yes')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    setPick('yes')
    setAmount('')
  }, [market.id])

  function handleTrade() {
    // TODO: wire to Polymarket CLOB
  }

  return (
    <div className="flex flex-col px-6 py-5 gap-4">
      {/* Title */}
      <div>
        <h2 className="text-sm font-semibold leading-snug">{market.title}</h2>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
          ends {formatExpiry(market.expiry)}
        </div>
      </div>

      {/* Probability */}
      <div>
        <div className="mb-1.5 flex justify-between font-mono text-xs">
          <span>Yes <span className="font-semibold">{yesPercent.toFixed(1)}%</span></span>
          <span>No <span className="font-semibold">{noPercent.toFixed(1)}%</span></span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: `${yesPercent}%` }} />
        </div>
      </div>

      <Separator />

      {/* Chart */}
      <LivelineChart
        data={history}
        value={yesPercent}
        height={180}
        formatValue={(v) => `${v.toFixed(1)}%`}
      />

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 text-xs">
        <span className="text-muted-foreground">24h Volume</span>
        <span className="text-right font-mono tabular-nums">{formatCompact(market.volume)}</span>
        <span className="text-muted-foreground">Resolution</span>
        <span className="text-right font-mono tabular-nums">
          {new Date(market.expiry).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      </div>

      <Separator />

      {/* Trade */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          <Button
            variant={pick === 'yes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPick('yes')}
            aria-pressed={pick === 'yes'}
            className={cn('flex-1', pick !== 'yes' && 'text-muted-foreground')}
          >
            Yes · {yesPercent.toFixed(0)}¢
          </Button>
          <Button
            variant={pick === 'no' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPick('no')}
            aria-pressed={pick === 'no'}
            className={cn('flex-1', pick !== 'no' && 'text-muted-foreground')}
          >
            No · {noPercent.toFixed(0)}¢
          </Button>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-6 text-sm"
            aria-label="Trade amount in USD"
          />
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={handleTrade}
          disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
        >
          Buy {pick === 'yes' ? 'Yes' : 'No'}
        </Button>
      </div>
    </div>
  )
}
