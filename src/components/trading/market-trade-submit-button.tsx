import { LoaderCircleIcon } from 'lucide-react'
import type { MarketOutcome } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MarketTradeSubmitButtonProps {
  outcome?: MarketOutcome
  side: 'yes' | 'no'
  isTrading: boolean
  disabled: boolean
  onClick: () => void
}

export function MarketTradeSubmitButton({
  outcome,
  side,
  isTrading,
  disabled,
  onClick,
}: MarketTradeSubmitButtonProps) {
  const isMultiOutcome = outcome != null

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full',
        !isMultiOutcome && side === 'yes' && 'bg-[#22c55e] hover:bg-[#22c55e]/90',
        !isMultiOutcome && side === 'no' && 'bg-[#ef4444] hover:bg-[#ef4444]/90',
      )}
    >
      {isTrading ? (
        <>
          <LoaderCircleIcon className="size-3.5 animate-spin" />
          Processing...
        </>
      ) : (
        `Buy ${isMultiOutcome ? outcome.name : side === 'yes' ? 'Yes' : 'No'}`
      )}
    </Button>
  )
}
