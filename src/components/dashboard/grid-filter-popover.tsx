import { useState } from 'react'
import { ArrowUpDownIcon, FilterIcon } from 'lucide-react'
import type { ViewMode } from '@/components/dashboard/tabs'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type SortKey =
  | 'change'
  | 'volume'
  | 'marketCap'
  | 'liquidity'
  | 'valuation'

export type NetworkFilter = 'all' | number

export interface GridFilters {
  sort: SortKey
  network: NetworkFilter
}

const SORT_OPTIONS: Record<ViewMode, Array<{ key: SortKey; label: string }>> = {
  trending: [
    { key: 'change', label: '24h Change' },
    { key: 'volume', label: 'Volume' },
    { key: 'marketCap', label: 'Market Cap' },
  ],
  tokens: [
    { key: 'change', label: '24h Change' },
    { key: 'volume', label: 'Volume' },
    { key: 'marketCap', label: 'Market Cap' },
  ],
  markets: [
    { key: 'volume', label: 'Volume' },
    { key: 'liquidity', label: 'Liquidity' },
  ],
  perps: [
    { key: 'volume', label: 'Volume' },
    { key: 'change', label: '24h Change' },
  ],
  memes: [
    { key: 'change', label: '24h Change' },
    { key: 'volume', label: 'Volume' },
    { key: 'valuation', label: 'Valuation' },
    { key: 'liquidity', label: 'Liquidity' },
  ],
}

const NETWORK_OPTIONS: Array<{ value: NetworkFilter; label: string }> = [
  { value: 'all', label: 'All Networks' },
  { value: 8453, label: 'Base' },
  { value: 1, label: 'Ethereum' },
  { value: 10, label: 'Optimism' },
  { value: 42161, label: 'Arbitrum' },
  { value: 1399811149, label: 'Solana' },
]

interface GridFilterPopoverProps {
  mode: ViewMode
  filters: GridFilters
  onFiltersChange: (filters: GridFilters) => void
}

export function GridFilterPopover({
  mode,
  filters,
  onFiltersChange,
}: GridFilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const sortOptions = SORT_OPTIONS[mode]
  const showNetwork = mode === 'tokens' || mode === 'trending'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="hidden shrink-0 items-center justify-center rounded-md border border-border px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
            aria-label="Filter grid"
          />
        }
      >
        <FilterIcon className="size-4" />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="max-w-[min(calc(100vw-1rem),240px)]"
        >
          <PopoverContent className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <div className="space-y-3">
              {/* Sort */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <ArrowUpDownIcon className="size-3" />
                  Sort by
                </div>
                <div className="flex flex-wrap gap-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() =>
                        onFiltersChange({ ...filters, sort: opt.key })
                      }
                      className={cn(
                        'rounded-md px-2 py-1 text-xs transition-colors',
                        filters.sort === opt.key
                          ? 'bg-foreground text-background'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network filter */}
              {showNetwork && (
                <div>
                  <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Network
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {NETWORK_OPTIONS.map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() =>
                          onFiltersChange({ ...filters, network: opt.value })
                        }
                        className={cn(
                          'rounded-md px-2 py-1 text-xs transition-colors',
                          filters.network === opt.value
                            ? 'bg-foreground text-background'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export const DEFAULT_FILTERS: GridFilters = { sort: 'change', network: 'all' }
