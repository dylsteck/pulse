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
      className="inline-flex w-max max-w-none min-w-0"
    >
      <TabsList className="h-auto gap-0 rounded-none border-0 bg-transparent p-0 shadow-none">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab]
          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="h-10 min-h-10 shrink-0 gap-2 rounded-none border-0 bg-transparent px-3.5 text-sm font-medium capitalize text-muted-foreground shadow-none data-active:bg-transparent data-active:text-foreground data-active:shadow-none dark:data-active:bg-transparent sm:h-8 sm:min-h-0 sm:gap-1.5 sm:px-2.5 sm:text-sm [&_svg]:text-muted-foreground data-active:[&_svg]:text-foreground"
            >
              <Icon className="size-4 sm:size-3.5" aria-hidden />
              {tab}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
