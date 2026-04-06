import { createConfig, kyberswap, odos, relay } from '@spandex/core'
import { createPublicClient, http } from 'viem'
import { base } from 'wagmi/chains'
import type { PublicClient } from 'viem'

const baseRpcUrl = import.meta.env.VITE_BASE_RPC_URL as string | undefined

const basePublicClient = createPublicClient({
  chain: base,
  transport: http(baseRpcUrl),
})

export const spandexConfig = createConfig({
  providers: [relay({}), odos({}), kyberswap({ clientId: 'pulse' })],
  clients: [basePublicClient] as Array<PublicClient>,
  options: {
    deadlineMs: 25_000,
  },
})

export function getBasePublicClient(): PublicClient {
  return basePublicClient
}
