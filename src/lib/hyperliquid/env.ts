export interface HyperliquidRuntimeConfig {
  apiUrl?: string
  wsUrl?: string
}

export function getHyperliquidRuntimeConfig(): HyperliquidRuntimeConfig {
  return {
    apiUrl: (import.meta.env.VITE_HYPERLIQUID_API_URL as string | undefined) || undefined,
    wsUrl: (import.meta.env.VITE_HYPERLIQUID_WS_URL as string | undefined) || undefined,
  }
}
