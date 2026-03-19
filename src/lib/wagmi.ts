import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi'

export const cdpProjectId = import.meta.env.VITE_CDP_PROJECT_ID as
  | string
  | undefined

const cdpConnector =
  cdpProjectId &&
  createCDPEmbeddedWalletConnector({
    cdpConfig: { projectId: cdpProjectId },
    providerConfig: {
      chains: [base],
      transports: {
        [base.id]: http(),
      },
    },
  })

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: cdpConnector ? [cdpConnector] : [],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})
