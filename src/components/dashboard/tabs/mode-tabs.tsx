import React from 'react'
import {
  ArrowUpDownIcon,
  CoinsIcon,
  FlameIcon,
  TrendingUpIcon,
  ZapIcon,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    <Tabs
      value={mode}
      onValueChange={(value) => onModeChange(value as ViewMode)}
      className="min-w-0 flex-1"
    >
      <TabsList className="h-auto gap-0.5">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab]
          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="text-sm font-medium capitalize"
            >
              <Icon className="size-3.5" />
              {tab}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
