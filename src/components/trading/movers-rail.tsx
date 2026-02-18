import { cn } from '@/lib/utils'
import type { Token } from '@/lib/mock/tokens'

interface MoversRailProps {
  movers: Token[]
  selectedId: string
  onSelect: (token: Token) => void
}

export function MoversRail({ movers, selectedId, onSelect }: MoversRailProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-white to-transparent" />
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-1 py-0.5">
        {movers.map((token) => {
          const up = token.change24h >= 0
          const selected = token.id === selectedId
          return (
            <button
              key={token.id}
              onClick={() => onSelect(token)}
              aria-pressed={selected}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                selected
                  ? 'border-black bg-black text-white'
                  : 'border-[#E5E5E5] bg-white text-black hover:border-black/40',
              )}
            >
              <span>{token.symbol}</span>
              <span className={cn('text-[0.65rem]', selected ? 'text-white/70' : 'text-[#888]')}>
                {up ? '↑' : '↓'}{Math.abs(token.change24h).toFixed(1)}%
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
