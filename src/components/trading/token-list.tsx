import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { LivelineChart } from './liveline-chart'
import { useTokenPrice } from '@/hooks/use-token-price'
import { TOKENS, type Token } from '@/lib/mock/tokens'

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.001) return price.toFixed(6)
  return price.toFixed(8)
}

function formatCompact(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

interface TokenListPageProps {
  onOpen: (tokenId: string) => void
}

export function TokenListPage({ onOpen }: TokenListPageProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const onOpenRef = useRef(onOpen)
  const selectedIndexRef = useRef(selectedIndex)

  useEffect(() => { onOpenRef.current = onOpen }, [onOpen])
  useEffect(() => { selectedIndexRef.current = selectedIndex }, [selectedIndex])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => {
          const next = Math.min(i + 1, TOKENS.length - 1)
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
      } else if (e.key === 'Enter') {
        onOpenRef.current(TOKENS[selectedIndexRef.current].id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const selectedToken = TOKENS[selectedIndex]
  const handleOpenSelected = useCallback(() => onOpen(selectedToken.id), [onOpen, selectedToken.id])

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Left: token table */}
      <div className="flex-1 overflow-y-auto border-r border-border">
        <div className="sticky top-0 z-10 grid grid-cols-[2fr_1fr_0.7fr_0.8fr_0.8fr_16px] border-b border-border bg-background px-6 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Token</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Price</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">24h %</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Volume</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mkt Cap</span>
          <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">↑↓</span>
        </div>

        {TOKENS.map((token, i) => {
          const selected = i === selectedIndex
          const change = token.change24h
          return (
            <button
              key={token.id}
              ref={(el) => { rowRefs.current[i] = el }}
              className={cn(
                'w-full grid grid-cols-[2fr_1fr_0.7fr_0.8fr_0.8fr_16px] items-center border-b border-border px-6 py-3 text-left transition-colors last:border-0',
                selected ? 'bg-accent' : 'hover:bg-accent/40',
                selected ? 'border-l-2 border-l-foreground' : 'border-l-2 border-l-transparent',
              )}
              onClick={() => setSelectedIndex(i)}
              onDoubleClick={() => onOpen(token.id)}
              aria-selected={selected}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-semibold">{token.symbol}</span>
                <span className="truncate text-xs text-muted-foreground">{token.name}</span>
              </div>
              <span className="text-right font-mono text-sm tabular-nums">
                {formatPrice(token.price)}
              </span>
              <span className="text-right font-mono text-sm tabular-nums">
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatCompact(token.volume24h)}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatCompact(token.marketCap)}
              </span>
              <div />
            </button>
          )
        })}
      </div>

      {/* Right: chart panel */}
      <div className="w-[400px] shrink-0 overflow-y-auto">
        <ChartPanel token={selectedToken} onOpen={handleOpenSelected} />
      </div>
    </div>
  )
}

function ChartPanel({ token, onOpen }: { token: Token; onOpen: () => void }) {
  const { price, history } = useTokenPrice(token)
  const change = token.change24h

  return (
    <div className="flex flex-col px-6 py-5 gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold">{token.name}</h2>
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {token.symbol} · {token.address.slice(0, 10)}…
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onOpen} className="h-7 gap-1 text-xs">
          Open <ChevronRightIcon className="size-3" />
        </Button>
      </div>

      <div>
        <div className="font-mono text-2xl font-semibold tabular-nums">
          ${formatPrice(price)}
        </div>
        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
          {change >= 0 ? '+' : ''}{change.toFixed(2)}% · 24h
        </div>
      </div>

      <Separator />

      <LivelineChart data={history} value={price} height={200} />

      <Separator />

      <div className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 text-xs">
        <span className="text-muted-foreground">24h Volume</span>
        <span className="text-right font-mono tabular-nums">{formatCompact(token.volume24h)}</span>
        <span className="text-muted-foreground">Market Cap</span>
        <span className="text-right font-mono tabular-nums">{formatCompact(token.marketCap)}</span>
        <span className="text-muted-foreground">Contract</span>
        <span className="text-right font-mono text-muted-foreground">
          {token.address.slice(0, 6)}…{token.address.slice(-4)}
        </span>
      </div>
    </div>
  )
}
