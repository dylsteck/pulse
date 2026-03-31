import { useState } from 'react'
import { ChevronRightIcon, FlameIcon, TrendingUpIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Token, Market } from '@/lib/types'
import { FadeImage } from '@/components/ui/fade-image'
import { Button } from '@/components/ui/button'
import { formatCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TrendingSidebarProps {
  tokens: Token[]
  markets: Market[]
}

export function TrendingSidebar({ tokens, markets }: TrendingSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const trending = tokens
    .slice()
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 20)

  const topMarkets = markets
    .slice()
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20)

  return (
    <div className="sticky top-12 hidden h-[calc(100vh-3rem)] lg:flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed((c) => !c)}
        className="mt-5 h-8 w-6 shrink-0 rounded-r-none"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronRightIcon
          className={cn(
            'size-3.5 transition-transform',
            !collapsed && 'rotate-180',
          )}
        />
      </Button>

      <div
        className={cn(
          'flex flex-col transition-[width] duration-200',
          collapsed ? 'w-0 overflow-hidden' : 'w-64',
        )}
      >
        <div className="flex h-full w-64 flex-col gap-1 pt-1">
          {/* Trending Tokens */}
          <div className="flex min-h-0 flex-1 flex-col pl-4 pr-1">
            <div className="mb-1.5 flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
              <FlameIcon className="size-3" />
              Trending
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {trending.map((token) => (
                <Link
                  key={token.id}
                  to="/"
                  search={{ type: 'tokens' }}
                  className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted/50"
                >
                  {token.imageUrl ? (
                    <FadeImage
                      src={token.imageUrl}
                      alt={token.name}
                      className="size-5 rounded-full object-cover"
                      wrapperClassName="size-5 shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">
                    {token.symbol}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatCompact(token.marketCap)}
                  </span>
                  <span
                    className={cn(
                      'w-14 shrink-0 text-right text-[11px] font-medium tabular-nums',
                      token.change24h >= 0 ? 'text-green-500' : 'text-red-500',
                    )}
                  >
                    {token.change24h >= 0 ? '+' : ''}
                    {token.change24h.toFixed(1)}%
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Markets */}
          <div className="flex min-h-0 flex-1 flex-col pl-4 pr-1">
            <div className="mb-1.5 flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
              <TrendingUpIcon className="size-3" />
              Top Markets
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {topMarkets.map((market) => (
                <Link
                  key={market.id}
                  to="/"
                  search={{ type: 'markets' }}
                  className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted/50"
                >
                  {market.imageUrl ? (
                    <FadeImage
                      src={market.imageUrl}
                      alt={market.title}
                      className="size-5 rounded object-cover"
                      wrapperClassName="size-5 shrink-0 rounded"
                    />
                  ) : (
                    <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-medium text-muted-foreground">
                      ?
                    </div>
                  )}
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">
                    {market.title}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-[11px] font-medium tabular-nums',
                      market.yesPercent >= 50
                        ? 'text-green-500'
                        : 'text-red-500',
                    )}
                  >
                    {market.yesPercent}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
