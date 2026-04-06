import { useCallback, useState } from 'react'
import type {SwapRoutePreview} from '@/lib/evm/swap';
import { useAuth } from '@/components/providers/auth-provider'
import {
  
  runFullSwap,
  swapErrorMessage
} from '@/lib/evm/swap'

export type { SwapRoutePreview } from '@/lib/evm/swap'

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
  const [routePreview, setRoutePreview] = useState<SwapRoutePreview | null>(
    null,
  )

  const swap = useCallback(
    async (params: {
      fromToken: `0x${string}`
      toToken: `0x${string}`
      amount: string
      decimals: number
      toDecimals?: number
      slippageBps?: number
    }) => {
      if (!viemAccount || !evmAddress) {
        setError('Wallet not connected')
        setStatus('error')
        return false
      }

      try {
        setError(null)
        setRoutePreview(null)
        setStatus('quoting')
        setStatusMessage('Getting quote...')

        const ok = await runFullSwap({
          evmAddress,
          viemAccount,
          ...params,
          onProgress: (data) => {
            setStatusMessage(data.message)
            if (data.message.includes('Getting quote')) setStatus('quoting')
            else if (data.message.includes('Confirm in your'))
              setStatus('confirming')
            else if (data.message.includes('Finalizing')) setStatus('swapping')
          },
          onRoute: setRoutePreview,
        })

        if (!ok) {
          setError('No quote available')
          setStatus('error')
          return false
        }

        setStatus('complete')
        setStatusMessage('Swap complete!')
        return true
      } catch (err) {
        setRoutePreview(null)
        setError(swapErrorMessage(err))
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
    setRoutePreview(null)
  }, [])

  return {
    swap,
    status,
    statusMessage,
    error,
    reset,
    routePreview,
  }
}
