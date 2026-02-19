import {
  ExchangeClient,
  HttpTransport,
  InfoClient,
  SubscriptionClient,
  WebSocketTransport,
  type AbstractViemJsonRpcAccount,
} from '@nktkas/hyperliquid'
import { SymbolConverter } from '@nktkas/hyperliquid/utils'
import { getHyperliquidRuntimeConfig } from '@/lib/hyperliquid/env'

let httpTransport: HttpTransport | null = null
let wsTransport: WebSocketTransport | null = null
let infoClient: InfoClient | null = null
let subClient: SubscriptionClient | null = null
let symbolConverterPromise: Promise<SymbolConverter> | null = null

export function getHyperliquidHttpTransport(): HttpTransport {
  if (httpTransport) return httpTransport
  const cfg = getHyperliquidRuntimeConfig()
  httpTransport = new HttpTransport({
    apiUrl: cfg.apiUrl,
  })
  return httpTransport
}

export function getHyperliquidWebSocketTransport(): WebSocketTransport {
  if (wsTransport) return wsTransport
  const cfg = getHyperliquidRuntimeConfig()
  wsTransport = new WebSocketTransport({
    url: cfg.wsUrl,
  })
  return wsTransport
}

export function getHyperliquidInfoClient(): InfoClient {
  if (infoClient) return infoClient
  infoClient = new InfoClient({ transport: getHyperliquidHttpTransport() })
  return infoClient
}

export function getHyperliquidSubscriptionClient(): SubscriptionClient {
  if (subClient) return subClient
  subClient = new SubscriptionClient({ transport: getHyperliquidWebSocketTransport() })
  return subClient
}

export function getHyperliquidSymbolConverter(): Promise<SymbolConverter> {
  if (!symbolConverterPromise) {
    symbolConverterPromise = SymbolConverter.create({
      transport: getHyperliquidHttpTransport(),
    })
  }
  return symbolConverterPromise
}

export function createHyperliquidExchangeClient(wallet: AbstractViemJsonRpcAccount): ExchangeClient {
  return new ExchangeClient({
    transport: getHyperliquidHttpTransport(),
    wallet,
  })
}
