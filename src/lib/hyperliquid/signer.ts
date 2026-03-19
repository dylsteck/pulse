import type { WalletClient } from 'viem'
import type { AbstractViemJsonRpcAccount } from '@nktkas/hyperliquid'

export interface SignerPreflightInput {
  connected: boolean
  address: `0x${string}` | null
  walletClient: WalletClient | undefined
}

export class SignerPreflightError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SignerPreflightError'
  }
}

export function assertSignerReady(
  input: SignerPreflightInput,
): asserts input is {
  connected: true
  address: `0x${string}`
  walletClient: WalletClient
} {
  if (!input.connected || !input.address) {
    throw new SignerPreflightError(
      'Connect your wallet before placing Hyperliquid orders.',
    )
  }
  if (!input.walletClient) {
    throw new SignerPreflightError(
      'Wallet signer unavailable. Reconnect your wallet and try again.',
    )
  }
}

export function toHyperliquidWallet(
  walletClient: WalletClient,
): AbstractViemJsonRpcAccount {
  return {
    getAddresses: async () => {
      const account = walletClient.account
      if (!account?.address) return []
      return [account.address]
    },
    getChainId: async () => walletClient.getChainId(),
    signTypedData: async (params) => walletClient.signTypedData(params),
  }
}
