export interface HyperliquidRuntimeConfig {
  useLiveData: boolean
  apiUrl?: string
  wsUrl?: string
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback
  return value.toLowerCase() === 'true'
}

export function getHyperliquidRuntimeConfig(): HyperliquidRuntimeConfig {
  return {
    useLiveData: parseBoolean(import.meta.env.VITE_USE_LIVE_DATA as string | undefined, false),
    apiUrl: (import.meta.env.VITE_HYPERLIQUID_API_URL as string | undefined) || undefined,
    wsUrl: (import.meta.env.VITE_HYPERLIQUID_WS_URL as string | undefined) || undefined,
  }
}
