import { useState } from 'react'
import type { SwapPanelProps } from '@/components/trading/swap-constants'
import { SwapFormTrade } from '@/components/trading/swap-form-parts'
import {
  SwapCompleteGate,
  SwapConfigGate,
  SwapSignInGate,
} from '@/components/trading/swap-form-gates'
import { useAuth } from '@/components/providers/auth-provider'
import { useSwap } from '@/hooks/use-swap'
import { SWAP_TOKENS } from '@/components/trading/swap-constants'
import { cdpProjectId } from '@/lib/wagmi'

export function SwapForm({
  defaultFromToken,
  defaultToToken,
  onClose,
}: SwapPanelProps & { onClose: () => void }) {
  const { isSignedIn } = useAuth()
  const { swap, status, error, reset, routePreview } = useSwap()

  const [fromKey, setFromKey] = useState(defaultFromToken ?? 'ETH')
  const [toKey, setToKey] = useState(defaultToToken ?? 'USDC')
  const [amount, setAmount] = useState('')

  const fromToken = SWAP_TOKENS[fromKey]
  const toToken = SWAP_TOKENS[toKey]
  const amountNum = parseFloat(amount) || 0
  const isSwapping =
    status !== 'idle' && status !== 'complete' && status !== 'error'

  const bumpUsdc = (delta: number) => {
    setAmount((prev) => {
      const sum = parseFloat(prev || '0') + delta
      return sum.toFixed(6).replace(/\.?0+$/, '')
    })
  }

  const flipPair = () => {
    setFromKey(toKey)
    setToKey(fromKey)
    setAmount('')
  }

  const handleSwap = async () => {
    if (amountNum <= 0) return
    await swap({
      fromToken: fromToken.address,
      toToken: toToken.address,
      amount,
      decimals: fromToken.decimals,
      toDecimals: toToken.decimals,
    })
  }

  if (!cdpProjectId) return <SwapConfigGate />
  if (!isSignedIn) return <SwapSignInGate />
  if (status === 'complete') {
    return (
      <SwapCompleteGate
        onDone={() => {
          reset()
          onClose()
        }}
      />
    )
  }

  return (
    <SwapFormTrade
      amount={amount}
      amountNum={amountNum}
      bumpUsdc={bumpUsdc}
      error={error}
      flipPair={flipPair}
      fromKey={fromKey}
      handleSwap={handleSwap}
      isSwapping={isSwapping}
      receiveSymbol={toToken.symbol}
      routePreview={routePreview}
      setAmount={setAmount}
      setFromKey={setFromKey}
      setToKey={setToKey}
      status={status}
      toKey={toKey}
    />
  )
}
