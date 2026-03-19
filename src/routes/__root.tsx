import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CDPReactProvider } from '@coinbase/cdp-react'

import appCss from '../styles.css?url'

import { Header } from '@/components/layout/header'
import { CommandPalette } from '@/components/command-palette'
import { ThemeProvider } from '@/components/theme-provider'
import { cdpProjectId, wagmiConfig } from '@/lib/wagmi'

const cdpConfig = cdpProjectId ? { projectId: cdpProjectId } : null

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 60_000,
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Pulse' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {(() => {
          const inner = (
            <WagmiProvider config={wagmiConfig}>
              <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                  <Header />
                  <CommandPalette />
                  {children}
                </ThemeProvider>
              </QueryClientProvider>
            </WagmiProvider>
          )
          return cdpConfig ? (
            <CDPReactProvider config={cdpConfig}>{inner}</CDPReactProvider>
          ) : (
            inner
          )
        })()}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
