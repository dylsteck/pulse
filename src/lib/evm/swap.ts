import {
  ExecutionError,
  executeQuote,
  getQuote,
} from '@spandex/core'
import {
  createWalletClient,
  formatUnits,
  http,
  parseUnits,
} from 'viem'
import { base } from 'wagmi/chains'
import type {
  ExactInSwapParams,
  SuccessfulSimulatedQuote,
} from '@spandex/core'
import type { LocalAccount } from 'viem'
import { getBasePublicClient, spandexConfig } from '@/lib/evm/spandex-config'

/** Default 0.5% slippage tolerance for meta-aggregated quotes */
export const DEFAULT_SWAP_SLIPPAGE_BPS = 50

export type SwapProgress = {
  message: string
}

export type SwapQuoteResult = {
  quote: SuccessfulSimulatedQuote
  swap: ExactInSwapParams
}

export type SwapRoutePreview = {
  provider: string
  estimatedOut: string
}

export function buildExactInSwapParams(params: {
  address: `0x${string}`
  fromToken: `0x${string}`
  toToken: `0x${string}`
  amount: string
  decimals: number
  slippageBps?: number
}): ExactInSwapParams | null {
  const { address, fromToken, toToken, amount, decimals } = params
  const slippageBps = params.slippageBps ?? DEFAULT_SWAP_SLIPPAGE_BPS

  const n = parseFloat(amount)
  if (!Number.isFinite(n) || n <= 0) return null

  let inputAmount: bigint
  try {
    inputAmount = parseUnits(amount, decimals)
  } catch {
    return null
  }
  if (inputAmount <= 0n) return null

  return {
    chainId: base.id,
    mode: 'exactIn',
    inputToken: fromToken,
    outputToken: toToken,
    inputAmount,
    slippageBps,
    swapperAccount: address,
  }
}

export async function getSwapQuote(params: {
  address: `0x${string}`
  fromToken: `0x${string}`
  toToken: `0x${string}`
  amount: string
  decimals: number
  slippageBps?: number
}): Promise<SwapQuoteResult | null> {
  const swap = buildExactInSwapParams(params)
  if (!swap) return null

  const quote = await getQuote({
    config: spandexConfig,
    swap,
    strategy: 'bestPrice',
    client: getBasePublicClient(),
  })

  if (!quote) return null
  return { quote, swap }
}

export function swapErrorMessage(err: unknown): string {
  if (err instanceof ExecutionError) return err.message
  if (err instanceof Error) return err.message
  return 'Swap failed'
}

export async function executeSwap(params: {
  quote: SuccessfulSimulatedQuote
  swap: ExactInSwapParams
  viemAccount: LocalAccount
  onProgress?: (data: SwapProgress) => void
}) {
  const { quote, swap, viemAccount, onProgress } = params

  const walletClient = createWalletClient({
    account: viemAccount,
    chain: base,
    transport: http(),
  })

  const publicClient = getBasePublicClient()

  onProgress?.({ message: 'Confirm in your wallet...' })

  try {
    await executeQuote({
      config: spandexConfig,
      swap,
      quote,
      walletClient,
      publicClient,
    })
    onProgress?.({ message: 'Finalizing...' })
  } catch (err) {
    throw err instanceof Error ? err : new Error(swapErrorMessage(err))
  }
}

/** Quote, show route preview, execute — for useSwap orchestration */
export async function runFullSwap(params: {
  evmAddress: `0x${string}`
  viemAccount: LocalAccount
  fromToken: `0x${string}`
  toToken: `0x${string}`
  amount: string
  decimals: number
  toDecimals?: number
  slippageBps?: number
  onProgress: (data: SwapProgress) => void
  onRoute: (preview: SwapRoutePreview) => void
}): Promise<boolean> {
  const slippageBps = params.slippageBps ?? DEFAULT_SWAP_SLIPPAGE_BPS
  params.onProgress({ message: 'Getting quote...' })

  const result = await getSwapQuote({
    address: params.evmAddress,
    fromToken: params.fromToken,
    toToken: params.toToken,
    amount: params.amount,
    decimals: params.decimals,
    slippageBps,
  })

  if (!result) return false

  const { quote, swap } = result
  const toDecimals = params.toDecimals ?? 18
  const estimatedOut = formatUnits(quote.simulation.outputAmount, toDecimals)
  params.onRoute({
    provider: quote.provider,
    estimatedOut,
  })

  await executeSwap({
    quote,
    swap,
    viemAccount: params.viemAccount,
    onProgress: params.onProgress,
  })

  return true
}
