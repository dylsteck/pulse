import { useState, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { getSwapQuote, executeSwap } from '@/lib/evm/swap'

export type SwapStatus =
  | 'idle'
  | 'quoting'
  | 'confirming'
  | 'swapping'
  | 'complete'
  | 'error'

export function useSwap() {
  const { viemAccount, evmAddress } = useAuth()
  const [status, setStatus] = useState<SwapStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const swap = useCallback(
    async (params: {
      fromToken: `0x${string}`
      toToken: `0x${string}`
      amount: string
      decimals: number
    }) => {
      if (!viemAccount || !evmAddress) {
        setError('Wallet not connected')
        setStatus('error')
        return false
      }

      try {
        setError(null)
        setStatus('quoting')
        setStatusMessage('Getting quote...')

        const quote = await getSwapQuote({
          address: evmAddress,
          ...params,
        })

        if (!quote) {
          setError('No quote available')
          setStatus('error')
          return false
        }

        setStatus('confirming')
        setStatusMessage('Confirm in your wallet...')

        await executeSwap({
          quote,
          viemAccount,
          onProgress: (data) => {
            setStatusMessage(data.message)
            if (data.message.includes('complete')) setStatus('complete')
            else setStatus('swapping')
          },
        })

        setStatus('complete')
        setStatusMessage('Swap complete!')
        return true
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Swap failed'
        setError(msg)
        setStatus('error')
        return false
      }
    },
    [viemAccount, evmAddress],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setStatusMessage('')
    setError(null)
  }, [])

  return { swap, status, statusMessage, error, reset }
}
