import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Token } from '@/lib/mock/tokens'

interface TradeFormProps {
  token: Token
  currentPrice: number
}

export function TradeForm({ token, currentPrice }: TradeFormProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')

  const mockBalance = side === 'buy' ? 4823.5 : 1.42
  const maxLabel = side === 'buy' ? `$${mockBalance.toLocaleString()}` : `${mockBalance} ${token.symbol}`

  const usdValue =
    amount && !isNaN(Number(amount)) && side === 'sell'
      ? Number(amount) * currentPrice
      : null

  function handleConfirm() {
    // TODO: wire to Spandex swap
  }

  return (
    <div className="border-t border-border pt-5">
      {/* Buy / Sell toggle */}
      <div className="mb-4 flex gap-1.5">
        <Button
          variant={side === 'buy' ? 'default' : 'outline'}
          size="lg"
          onClick={() => setSide('buy')}
          aria-pressed={side === 'buy'}
          className={cn('flex-1', side !== 'buy' && 'text-muted-foreground hover:text-foreground')}
        >
          Buy
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'outline'}
          size="lg"
          onClick={() => setSide('sell')}
          aria-pressed={side === 'sell'}
          className={cn('flex-1', side !== 'sell' && 'text-muted-foreground hover:text-foreground')}
        >
          Sell
        </Button>
      </div>

      {/* Amount input */}
      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {side === 'buy' ? '$' : token.symbol}
          </span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-7"
            aria-label={side === 'buy' ? 'USD amount to buy' : `${token.symbol} amount to sell`}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAmount(mockBalance.toString())} className="shrink-0 text-muted-foreground">
          Max
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Available: {maxLabel}</span>
        {usdValue !== null && <span>≈ ${usdValue.toFixed(2)}</span>}
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleConfirm}
        disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
      </Button>
    </div>
  )
}
