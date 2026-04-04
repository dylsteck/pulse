import { createWalletClient, http, parseUnits } from 'viem'
import { base, polygon } from 'wagmi/chains'
import { createClient } from '@reservoir0x/relay-sdk'
import type { LocalAccount } from 'viem'
import { USDC_BASE, USDC_E_POLYGON } from '@/lib/wagmi'

const relayClient = createClient({ source: 'pulse' })

export type BridgeProgress = {
  message: string
}

export async function bridgeUsdcToPolygon(params: {
  viemAccount: LocalAccount
  address: `0x${string}`
  amount: string
  onProgress?: (data: BridgeProgress) => void
}) {
  const { viemAccount, address, amount, onProgress } = params

  const walletClient = createWalletClient({
    account: viemAccount,
    chain: base,
    transport: http(),
  })

  const amountWei = parseUnits(amount, 6)

  onProgress?.({ message: 'Getting bridge quote...' })

  const quote = await relayClient.actions.getQuote({
    user: address,
    chainId: base.id,
    toChainId: polygon.id,
    currency: USDC_BASE,
    toCurrency: USDC_E_POLYGON,
    amount: amountWei.toString(),
    recipient: address,
    tradeType: 'EXACT_INPUT',
    options: {
      usePermit: true,
      topupGas: true,
      topupGasAmount: '500000',
    },
  })

  if (!quote) {
    throw new Error('Failed to get bridge quote')
  }

  onProgress?.({ message: 'Confirm bridge transaction...' })

  await relayClient.actions.execute({
    quote,
    wallet: walletClient,
    onProgress: (data) => {
      if (data && typeof data === 'object' && 'message' in data) {
        onProgress?.({ message: String(data.message) })
      }
    },
  })

  onProgress?.({ message: 'Bridge complete!' })
}
