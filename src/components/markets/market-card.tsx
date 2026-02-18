import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Market } from '@/lib/mock/markets'

function formatVolume(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

function formatExpiry(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface MarketCardProps {
  market: Market
  expanded: boolean
  onToggle: () => void
}

export function MarketCard({ market, expanded, onToggle }: MarketCardProps) {
  const [pick, setPick] = useState<'yes' | 'no'>('yes')
  const [amount, setAmount] = useState('')

  function handleTrade() {
    // TODO: wire to Polymarket CLOB
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-sm font-medium leading-snug text-black">{market.title}</p>

        {/* Yes / No bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#888]">
            <span>Yes {market.yesPercent}%</span>
            <span>No {market.noPercent}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
            <div className="h-full rounded-full bg-black" style={{ width: `${market.yesPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[0.68rem] text-[#888]">
          <span>{formatVolume(market.volume)} vol</span>
          <span>ends {formatExpiry(market.expiry)}</span>
        </div>

        <Button
          variant={expanded ? 'default' : 'outline'}
          size="sm"
          onClick={onToggle}
          className="w-full"
        >
          {expanded ? 'Close' : 'Trade'}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-[#E5E5E5] p-4">
          <div className="flex gap-1.5">
            <Button
              variant={pick === 'yes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPick('yes')}
              aria-pressed={pick === 'yes'}
              className={cn('flex-1', pick !== 'yes' && 'text-[#888]')}
            >
              Yes
            </Button>
            <Button
              variant={pick === 'no' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPick('no')}
              aria-pressed={pick === 'no'}
              className={cn('flex-1', pick !== 'no' && 'text-[#888]')}
            >
              No
            </Button>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#888]">$</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="pl-6 text-xs"
              aria-label="Trade amount in USD"
            />
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={handleTrade}
            disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
          >
            Buy {pick === 'yes' ? 'Yes' : 'No'}
          </Button>
        </div>
      )}
    </div>
  )
}
