import { useEffect, useState } from 'react'
import { ArrowUpDownIcon, SlidersHorizontalIcon } from 'lucide-react'
import type { ViewMode } from '@/components/dashboard/tabs'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { GridFilters, SortKey } from '@/lib/grid-filter-types'
import { cn } from '@/lib/utils'

export type { GridFilters, NetworkFilter, SortKey } from '@/lib/grid-filter-types'

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

export function coerceGridFilters(
  mode: ViewMode,
  filters: GridFilters,
): GridFilters {
  const keys = SORT_OPTIONS[mode].map((o) => o.key)
  if (keys.includes(filters.sort)) return filters
  return { ...filters, sort: SORT_OPTIONS[mode][0].key }
}

export function GridFilterPopover({
  mode,
  filters,
  onFiltersChange,
}: GridFilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const sortOptions = SORT_OPTIONS[mode]
  const showNetwork = mode === 'tokens' || mode === 'trending'

  useEffect(() => {
    setOpen(false)
  }, [mode])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-[1.575rem] w-[2.025rem] shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Sort and filter"
          >
            <SlidersHorizontalIcon className="size-[0.9rem] shrink-0" aria-hidden />
          </button>
        }
      />
      <PopoverPortal>
        <PopoverPositioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="max-w-[min(calc(100vw-1rem),240px)]"
        >
          <PopoverContent className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <ArrowUpDownIcon className="size-3 shrink-0" aria-hidden />
                  Sort by
                </div>
                <div
                  className="flex flex-wrap gap-1"
                  role="group"
                  aria-label="Sort by"
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      aria-pressed={filters.sort === opt.key}
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

              {showNetwork ? (
                <div>
                  <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Network
                  </div>
                  <div
                    className="flex flex-wrap gap-1"
                    role="group"
                    aria-label="Network"
                  >
                    {NETWORK_OPTIONS.map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        aria-pressed={filters.network === opt.value}
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
              ) : null}
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export const DEFAULT_FILTERS: GridFilters = {
  sort: 'change',
  network: 'all',
}
