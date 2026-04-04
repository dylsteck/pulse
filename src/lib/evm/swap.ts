import { createWalletClient, http, parseUnits } from 'viem'
import { base } from 'wagmi/chains'
import { createClient } from '@reservoir0x/relay-sdk'
import type { LocalAccount } from 'viem'

const relayClient = createClient({ source: 'pulse' })

export type SwapProgress = {
  message: string
}

export async function getSwapQuote(params: {
  address: `0x${string}`
  fromToken: `0x${string}`
  toToken: `0x${string}`
  amount: string
  decimals: number
}) {
  const { address, fromToken, toToken, amount, decimals } = params
  const amountWei = parseUnits(amount, decimals)

  return relayClient.actions.getQuote({
    user: address,
    chainId: base.id,
    toChainId: base.id,
    currency: fromToken,
    toCurrency: toToken,
    amount: amountWei.toString(),
    recipient: address,
    tradeType: 'EXACT_INPUT',
  })
}

export async function executeSwap(params: {
  quote: Awaited<ReturnType<typeof getSwapQuote>>
  viemAccount: LocalAccount
  onProgress?: (data: SwapProgress) => void
}) {
  const { quote, viemAccount, onProgress } = params

  const walletClient = createWalletClient({
    account: viemAccount,
    chain: base,
    transport: http(),
  })

  await relayClient.actions.execute({
    quote,
    wallet: walletClient,
    onProgress: (data) => {
      if (data && typeof data === 'object' && 'message' in data) {
        onProgress?.({ message: String(data.message) })
      }
    },
  })
}
