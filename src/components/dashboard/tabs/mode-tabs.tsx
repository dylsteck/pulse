import React from 'react'
import {
  ArrowUpDownIcon,
  CoinsIcon,
  FlameIcon,
  TrendingUpIcon,
  ZapIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'trending' | 'tokens' | 'markets' | 'perps' | 'memes'

export const TAB_ICONS: Record<
  ViewMode,
  React.ComponentType<{ className?: string }>
> = {
  trending: ZapIcon,
  tokens: CoinsIcon,
  markets: TrendingUpIcon,
  perps: ArrowUpDownIcon,
  memes: FlameIcon,
}

const TABS: Array<ViewMode> = ['trending', 'tokens', 'markets', 'perps', 'memes']

interface ModeTabsProps {
  mode: ViewMode
  onModeChange: (tab: ViewMode) => void
}

export function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-1 sm:gap-5 sm:overflow-visible">
      {TABS.map((tab) => {
        const active = mode === tab
        const Icon = TAB_ICONS[tab]
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onModeChange(tab)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 text-sm font-medium capitalize transition-colors',
              active
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" />
            {tab}
          </button>
        )
      })}
    </div>
  )
}
