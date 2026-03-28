import { useState } from 'react'
import { ChevronRightIcon, FlameIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Token } from '@/lib/types'
import { FadeImage } from '@/components/ui/fade-image'
import { Button } from '@/components/ui/button'
import { formatCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TrendingSidebarProps {
  tokens: Token[]
}

export function TrendingSidebar({ tokens }: TrendingSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const trending = tokens
    .slice()
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 15)

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
          'overflow-y-auto transition-[width] duration-200',
          collapsed ? 'w-0 overflow-hidden' : 'w-64',
        )}
      >
        <div className="w-64 pl-4 pr-2 pt-4">
          <div className="mb-2 flex items-center gap-1.5 pb-2 pt-1 text-xs font-medium text-muted-foreground">
            <FlameIcon className="size-3.5" />
            Trending
          </div>

          <div className="flex flex-col">
            {trending.map((token) => (
              <Link
                key={token.id}
                to="/"
                search={{ type: 'tokens' }}
                className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-muted/50"
              >
                {token.imageUrl ? (
                  <FadeImage
                    src={token.imageUrl}
                    alt={token.name}
                    className="size-6 rounded-full object-cover"
                    wrapperClassName="size-6 shrink-0 rounded-full"
                  />
                ) : (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-medium text-foreground">
                      {token.symbol}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatCompact(token.marketCap)}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-xs font-medium tabular-nums',
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
      </div>
    </div>
  )
}
