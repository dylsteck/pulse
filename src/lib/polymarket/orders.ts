import type { LocalAccount } from 'viem'
import type { ClobCredentials } from './credentials'
import { CLOB_HOST } from '@/lib/wagmi'
import { makeRequest } from '@/lib/request'

export interface PolymarketOrder {
  tokenId: string
  side: 'BUY' | 'SELL'
  price: number
  size: number
}

export interface OrderResult {
  success: boolean
  orderId?: string
  transactionHash?: string
  status?: 'matched' | 'live' | 'delayed' | 'unmatched'
  error?: string
}

export async function createAndSubmitOrder(
  order: PolymarketOrder,
  viemAccount: LocalAccount,
  creds: ClobCredentials,
  tickSize: string,
  negRisk: boolean,
): Promise<OrderResult> {
  // Dynamic import to avoid SSR issues
  const { ClobClient, Side } = await import('@polymarket/clob-client')

  // Create ethers-compatible signer adapter from viem account
  const signer = {
    address: viemAccount.address,
    getAddress: async () => viemAccount.address,
    _signTypedData: async (
      domain: unknown,
      types: unknown,
      value: unknown,
    ) => {
      const typesObj = types as Record<string, unknown>
      const primaryType =
        Object.keys(typesObj).find((t) => t !== 'EIP712Domain') || 'Order'

      return viemAccount.signTypedData({
        domain: domain as Parameters<
          typeof viemAccount.signTypedData
        >[0]['domain'],
        types: typesObj as Parameters<
          typeof viemAccount.signTypedData
        >[0]['types'],
        primaryType,
        message: value as Record<string, unknown>,
      })
    },
  }

  // Initialize CLOB client with EOA signature type (0)
  const client = new ClobClient(
    CLOB_HOST,
    137,
    signer as unknown as ConstructorParameters<typeof ClobClient>[2],
    creds,
    0,
    viemAccount.address,
  )

  try {
    const signedOrder = await client.createOrder(
      {
        tokenID: order.tokenId,
        price: order.price,
        side: order.side === 'BUY' ? Side.BUY : Side.SELL,
        size: order.size,
      },
      {
        tickSize: tickSize as '0.1' | '0.01' | '0.001' | '0.0001',
        negRisk,
      },
    )

    // Submit via proxy to avoid CORS
    const result = await makeRequest<{
      orderID?: string
      id?: string
      status?: string
      transactionsHashes?: Array<string>
      error?: string
    }>('/api/polymarket/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedOrder, credentials: creds }),
    })

    if (result.error) {
      return { success: false, error: result.error }
    }

    return {
      success: true,
      orderId: result.orderID || result.id,
      transactionHash: result.transactionsHashes?.[0],
      status: result.status as OrderResult['status'],
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Order failed',
    }
  }
}
