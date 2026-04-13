import { Link } from '@tanstack/react-router'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import type { SidebarItem } from './types'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/lib/format'
import { buildMarketId, buildMemeId, buildTokenId } from '@/lib/caip19'

function buildSidebarItemId(item: SidebarItem): string {
  if (item.kind === 'token') return buildTokenId(item.id)
  if (item.kind === 'meme') return buildMemeId(item.id)
  return buildMarketId(item.id)
}

export function SidebarRow({ item }: { item: SidebarItem }) {
  const isPositive = item.change >= 0
  const ChangeIcon = isPositive ? ChevronUpIcon : ChevronDownIcon

  return (
    <li>
      <Link
        to="/asset/$identifier"
        params={{ identifier: buildSidebarItemId(item) }}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
      >
        {item.imageUrl && (
          <FadeImage
            src={item.imageUrl}
            alt=""
            wrapperClassName="size-8 shrink-0 rounded-full"
            className="size-8 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {item.label}
          </div>
          {item.sublabel && (
            <div className="truncate text-xs text-muted-foreground">
              {item.sublabel}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {item.kind !== 'market' && item.change !== 0 && (
            <span
              className={cn(
                'flex items-center text-xs font-medium tabular-nums',
                isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]',
              )}
            >
              <ChangeIcon className="size-3" />
              {isPositive ? '+' : ''}
              {item.change.toFixed(1)}%
            </span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatCompact(item.volume)}
          </span>
        </div>
      </Link>
    </li>
  )
}
