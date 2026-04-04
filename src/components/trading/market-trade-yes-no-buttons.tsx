import type { Market } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface MarketTradeYesNoButtonsProps {
  market: Market
  side: 'yes' | 'no'
  isTrading: boolean
  onSideChange: (s: 'yes' | 'no') => void
}

export function MarketTradeYesNoButtons({
  market,
  side,
  isTrading,
  onSideChange,
}: MarketTradeYesNoButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onSideChange('yes')}
        disabled={isTrading}
        className={cn(
          'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          side === 'yes'
            ? 'bg-[#22c55e]/15 text-[#22c55e]'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
      >
        Yes {market.yesPercent.toFixed(0)}%
      </button>
      <button
        type="button"
        onClick={() => onSideChange('no')}
        disabled={isTrading}
        className={cn(
          'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          side === 'no'
            ? 'bg-[#ef4444]/15 text-[#ef4444]'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
      >
        No {market.noPercent.toFixed(0)}%
      </button>
    </div>
  )
}
