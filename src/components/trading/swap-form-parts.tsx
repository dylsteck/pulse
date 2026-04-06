import {
  ArrowDownUpIcon,
  LoaderCircleIcon,
} from 'lucide-react'
import type { SwapRoutePreview, SwapStatus } from '@/hooks/use-swap'
import { SwapRoutePreviewLine } from '@/components/trading/swap-route-preview'
import { tradingFieldLabelClass } from '@/components/trading/trading-field-label'
import { SWAP_STATUS_LABELS, SWAP_TOKENS } from '@/components/trading/swap-constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SwapFormTrade({
  amount,
  amountNum,
  bumpUsdc,
  error,
  flipPair,
  fromKey,
  handleSwap,
  isSwapping,
  receiveSymbol,
  routePreview,
  setAmount,
  setFromKey,
  setToKey,
  status,
  toKey,
}: {
  amount: string
  amountNum: number
  bumpUsdc: (n: number) => void
  error: string | null
  flipPair: () => void
  fromKey: string
  handleSwap: () => void
  isSwapping: boolean
  receiveSymbol: string
  routePreview: SwapRoutePreview | null
  setAmount: (v: string) => void
  setFromKey: (k: string) => void
  setToKey: (k: string) => void
  status: SwapStatus
  toKey: string
}) {
  const tokenKeys = Object.keys(SWAP_TOKENS)
  const fromOptions = tokenKeys.filter((k) => k !== toKey)
  const toOptions = tokenKeys.filter((k) => k !== fromKey)

  return (
    <div className="flex flex-col gap-4">
      <SwapPayBlock
        amount={amount}
        bumpUsdc={bumpUsdc}
        fromKey={fromKey}
        fromOptions={fromOptions}
        isSwapping={isSwapping}
        setAmount={setAmount}
        setFromKey={setFromKey}
      />

      <SwapFlipRow disabled={isSwapping} onFlip={flipPair} />

      <SwapReceiveBlock
        isSwapping={isSwapping}
        setToKey={setToKey}
        toKey={toKey}
        toOptions={toOptions}
      />

      {routePreview ? (
        <SwapRoutePreviewLine
          preview={routePreview}
          receiveSymbol={receiveSymbol}
        />
      ) : null}

      <SwapFormSubmit
        amountNum={amountNum}
        error={error}
        handleSwap={handleSwap}
        isSwapping={isSwapping}
        status={status}
      />
    </div>
  )
}

function SwapFlipRow({
  disabled,
  onFlip,
}: {
  disabled: boolean
  onFlip: () => void
}) {
  return (
    <div className="flex justify-center">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="size-9 rounded-full border-dashed"
        onClick={onFlip}
        disabled={disabled}
        aria-label="Flip tokens"
      >
        <ArrowDownUpIcon className="size-4" />
      </Button>
    </div>
  )
}

function SwapFormSubmit({
  amountNum,
  error,
  handleSwap,
  isSwapping,
  status,
}: {
  amountNum: number
  error: string | null
  handleSwap: () => void
  isSwapping: boolean
  status: SwapStatus
}) {
  return (
    <>
      {error ? (
        <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      {isSwapping ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden />
          {SWAP_STATUS_LABELS[status]}
        </div>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="h-12 w-full rounded-xl text-base font-semibold shadow-md"
        onClick={handleSwap}
        disabled={amountNum <= 0 || isSwapping}
      >
        {isSwapping ? (
          <>
            <LoaderCircleIcon
              className="size-4 animate-spin"
              data-icon="inline-start"
            />
            Processing…
          </>
        ) : (
          'Swap'
        )}
      </Button>
    </>
  )
}

function SwapPayBlock({
  fromKey,
  setFromKey,
  fromOptions,
  amount,
  setAmount,
  isSwapping,
  bumpUsdc,
}: {
  fromKey: string
  setFromKey: (k: string) => void
  fromOptions: Array<string>
  amount: string
  setAmount: (v: string) => void
  isSwapping: boolean
  bumpUsdc: (n: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={tradingFieldLabelClass}>You pay</span>
      <div className="flex items-stretch gap-2">
        <select
          value={fromKey}
          onChange={(e) => setFromKey(e.target.value)}
          disabled={isSwapping}
          aria-label="Pay with token"
          className="h-11 shrink-0 rounded-xl border border-border bg-muted/40 px-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {fromOptions.map((k) => (
            <option key={k} value={k}>
              {SWAP_TOKENS[k].symbol}
            </option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="0.00"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isSwapping}
          className="h-11 min-w-0 flex-1 rounded-xl border-border bg-muted/20 text-right text-xl font-semibold tabular-nums"
        />
      </div>
      {fromKey === 'USDC' ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {[1, 5, 10, 100].map((n) => (
            <button
              key={n}
              type="button"
              disabled={isSwapping}
              onClick={() => bumpUsdc(n)}
              className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              +${n}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SwapReceiveBlock({
  toKey,
  setToKey,
  toOptions,
  isSwapping,
}: {
  toKey: string
  setToKey: (k: string) => void
  toOptions: Array<string>
  isSwapping: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={tradingFieldLabelClass}>You receive</span>
      <select
        value={toKey}
        onChange={(e) => setToKey(e.target.value)}
        disabled={isSwapping}
        aria-label="Receive token"
        className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {toOptions.map((k) => (
          <option key={k} value={k}>
            {SWAP_TOKENS[k].symbol}
          </option>
        ))}
      </select>
    </div>
  )
}
