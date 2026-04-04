import { useState, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { bridgeUsdcToPolygon } from '@/lib/polymarket/bridge'

export type BridgeStatus =
  | 'idle'
  | 'quoting'
  | 'confirming'
  | 'bridging'
  | 'complete'
  | 'error'

export function useBridge() {
  const { viemAccount, evmAddress } = useAuth()
  const [status, setStatus] = useState<BridgeStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const bridge = useCallback(
    async (amount: string) => {
      if (!viemAccount || !evmAddress) {
        setError('Wallet not connected')
        return false
      }

      try {
        setStatus('quoting')
        setError(null)

        await bridgeUsdcToPolygon({
          viemAccount,
          address: evmAddress,
          amount,
          onProgress: (data) => {
            setStatusMessage(data.message)
            if (data.message.includes('quote')) setStatus('quoting')
            else if (data.message.includes('Confirm')) setStatus('confirming')
            else if (data.message.includes('complete')) setStatus('complete')
            else setStatus('bridging')
          },
        })

        setStatus('complete')
        return true
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Bridge failed'
        // Filter out telemetry errors
        if (!msg.includes('Failed to fetch') && !msg.includes('ERR_BLOCKED')) {
          setError(msg)
          setStatus('error')
        }
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

  return { bridge, status, statusMessage, error, reset }
}
