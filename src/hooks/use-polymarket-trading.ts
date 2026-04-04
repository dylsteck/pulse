import { useState, useCallback } from 'react'
import { formatUnits } from 'viem'
import { base, polygon } from 'wagmi/chains'
import { useAuth } from '@/components/providers/auth-provider'
import { useErc20Balance } from '@/hooks/use-erc20-balance'
import { useBridge } from '@/hooks/use-bridge'
import { getOrDeriveCredentials } from '@/lib/polymarket/credentials'
import {
  createAndSubmitOrder,
  type OrderResult,
} from '@/lib/polymarket/orders'
import { USDC_BASE, USDC_E_POLYGON } from '@/lib/wagmi'

export type TradeStatus =
  | 'idle'
  | 'checking-balance'
  | 'bridging'
  | 'approving'
  | 'deriving-creds'
  | 'signing'
  | 'submitting'
  | 'success'
  | 'error'

export function usePolymarketTrading() {
  const { viemAccount, evmAddress, isSignedIn } = useAuth()
  const { data: baseUsdc, refetch: refetchBase } = useErc20Balance(
    base.id,
    USDC_BASE,
    evmAddress,
  )
  const { data: polygonUsdc, refetch: refetchPolygon } = useErc20Balance(
    polygon.id,
    USDC_E_POLYGON,
    evmAddress,
    { refetchInterval: 10_000 },
  )
  const { bridge } = useBridge()

  const [status, setStatus] = useState<TradeStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OrderResult | null>(null)

  const trade = useCallback(
    async (params: {
      tokenId: string
      side: 'BUY' | 'SELL'
      amount: number
      price: number
      tickSize?: string
      negRisk?: boolean
    }) => {
      if (!viemAccount || !evmAddress) {
        setError('Wallet not connected')
        setStatus('error')
        return null
      }

      try {
        setError(null)
        setResult(null)

        // Check Polygon USDC.e balance
        setStatus('checking-balance')
        setStatusMessage('Checking balances...')
        await refetchPolygon()

        const polygonBalance = polygonUsdc
          ? parseFloat(formatUnits(polygonUsdc, 6))
          : 0
        const needed = params.amount

        // Bridge if insufficient USDC.e on Polygon
        if (polygonBalance < needed) {
          setStatus('bridging')
          setStatusMessage('Bridging USDC to Polygon...')

          const bridgeAmount = Math.ceil(needed - polygonBalance + 1).toString()
          const bridgeSuccess = await bridge(bridgeAmount)
          if (!bridgeSuccess) {
            setError('Bridge failed')
            setStatus('error')
            return null
          }

          // Wait for balance to update
          await new Promise((resolve) => setTimeout(resolve, 5000))
          await refetchPolygon()
        }

        // Derive CLOB credentials
        setStatus('deriving-creds')
        setStatusMessage('Setting up trading credentials...')
        const creds = await getOrDeriveCredentials(viemAccount)

        // Sign and submit order
        setStatus('signing')
        setStatusMessage('Sign the order in your wallet...')

        const size = params.amount / params.price

        const orderResult = await createAndSubmitOrder(
          {
            tokenId: params.tokenId,
            side: params.side,
            price: params.price,
            size,
          },
          viemAccount,
          creds,
          params.tickSize ?? '0.01',
          params.negRisk ?? false,
        )

        if (!orderResult.success) {
          setError(orderResult.error || 'Order failed')
          setStatus('error')
          return orderResult
        }

        setResult(orderResult)
        setStatus('success')
        setStatusMessage('Order placed!')

        // Refresh balances
        await Promise.all([refetchBase(), refetchPolygon()])

        return orderResult
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Trade failed'
        setError(msg)
        setStatus('error')
        return null
      }
    },
    [viemAccount, evmAddress, polygonUsdc, bridge, refetchBase, refetchPolygon],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setStatusMessage('')
    setError(null)
    setResult(null)
  }, [])

  return {
    trade,
    status,
    statusMessage,
    error,
    result,
    reset,
    isSignedIn,
    baseUsdcBalance: baseUsdc
      ? parseFloat(formatUnits(baseUsdc, 6))
      : 0,
    polygonUsdcBalance: polygonUsdc
      ? parseFloat(formatUnits(polygonUsdc, 6))
      : 0,
  }
}
