import { createConfig, http } from 'wagmi'
import { base, polygon } from 'wagmi/chains'
import { injected } from '@wagmi/connectors'
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi'

export const cdpProjectId = import.meta.env.VITE_CDP_PROJECT_ID as
  | string
  | undefined

const cdpConnector =
  cdpProjectId &&
  createCDPEmbeddedWalletConnector({
    cdpConfig: { projectId: cdpProjectId },
    providerConfig: {
      chains: [base, polygon],
      transports: {
        [base.id]: http(),
        [polygon.id]: http(),
      },
    },
  })

export const wagmiConfig = createConfig({
  chains: [base, polygon],
  connectors: [cdpConnector, injected()].filter(Boolean),
  transports: {
    [base.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
})

// Trading constants
export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
export const USDC_E_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const
export const CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E' as const
export const CONDITIONAL_TOKENS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045' as const
export const CLOB_HOST = 'https://clob.polymarket.com' as const
