import type {
  CancelSuccessResponse,
  ClearinghouseStateResponse,
  FrontendOpenOrdersResponse,
  OrderSuccessResponse,
  UserFillsResponse,
} from '@nktkas/hyperliquid'
import { type ExchangeClient, type OrderParameters } from '@nktkas/hyperliquid'
import { createHyperliquidExchangeClient } from '@/lib/hyperliquid/clients'
import { makeRequest } from '@/lib/request'
import { type PreparedOrder, prepareOrder } from '@/lib/hyperliquid/order-utils'
import { normalizeHyperliquidError } from '@/lib/hyperliquid/errors'
import {
  parseCancelStatuses,
  parseOrderStatuses,
  type ParsedCancelStatus,
  type ParsedOrderStatus,
} from '@/lib/hyperliquid/status'
import { OrderBatchQueue } from '@/lib/hyperliquid/batch-queue'
import { ScheduleCancelHeartbeat } from '@/lib/hyperliquid/heartbeat'
import { toHyperliquidWallet } from '@/lib/hyperliquid/signer'
import type { WalletClient } from 'viem'

export interface PerpMarketSnapshot {
  id: string
  assetId: number
  coin: string
  markPx: number
  midPx: number
  prevDayPx: number
  change24h: number
  funding: number
  openInterest: number
  premium: number
  volume24h: number
  szDecimals: number
  maxLeverage: number
}

const hlPost = (body: Record<string, unknown>): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export async function fetchPerpMarketsSnapshot(): Promise<PerpMarketSnapshot[]> {
  return makeRequest<PerpMarketSnapshot[]>(
    '/api/hyperliquid',
    hlPost({ type: 'markets' }),
  )
}

export async function fetchPerpAccountState(
  user: string,
): Promise<ClearinghouseStateResponse> {
  return makeRequest<ClearinghouseStateResponse>(
    '/api/hyperliquid',
    hlPost({ type: 'account', params: { user } }),
  )
}

export async function fetchPerpOpenOrders(
  user: string,
): Promise<FrontendOpenOrdersResponse> {
  return makeRequest<FrontendOpenOrdersResponse>(
    '/api/hyperliquid',
    hlPost({ type: 'orders', params: { user } }),
  )
}

export async function fetchPerpFills(user: string): Promise<UserFillsResponse> {
  return makeRequest<UserFillsResponse>(
    '/api/hyperliquid',
    hlPost({ type: 'fills', params: { user, aggregateByTime: true } }),
  )
}

export async function fetchHyperliquidCandles(
  coin: string,
  windowLabel: string,
): Promise<PerpCandlesResponse> {
  return makeRequest<PerpCandlesResponse>(
    '/api/hyperliquid',
    hlPost({ type: 'candles', params: { coin, windowLabel } }),
  )
}

interface TradingContext {
  exchange: ExchangeClient
  queue: OrderBatchQueue
  heartbeat: ScheduleCancelHeartbeat
}

const contexts = new Map<string, TradingContext>()

function getTradingContext(walletClient: WalletClient): TradingContext {
  const wallet = toHyperliquidWallet(walletClient)
  const key = walletClient.account?.address ?? 'unknown'
  const existing = contexts.get(key)
  if (existing) return existing

  const exchange = createHyperliquidExchangeClient(wallet)
  const queue = new OrderBatchQueue(exchange, 100)
  const heartbeat = new ScheduleCancelHeartbeat(exchange)
  const ctx = { exchange, queue, heartbeat }
  contexts.set(key, ctx)
  return ctx
}

export function newCloid(): `0x${string}` {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `0x${hex}` as `0x${string}`
}

export interface PlaceOrderInput {
  walletClient: WalletClient
  order: PreparedOrder
  expiresAfter?: number
}

export interface PlaceOrderResult {
  raw: OrderSuccessResponse
  statuses: ParsedOrderStatus[]
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const { queue } = getTradingContext(input.walletClient)
  try {
    const raw = await queue.enqueueOrder({
      orders: [input.order],
      grouping: 'na',
      expiresAfter: input.expiresAfter,
    })
    return { raw, statuses: parseOrderStatuses(raw) }
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export interface PlaceBatchOrdersInput {
  walletClient: WalletClient
  orders: PreparedOrder[]
}

export async function placeBatchOrders(
  input: PlaceBatchOrdersInput,
): Promise<PlaceOrderResult> {
  const { queue } = getTradingContext(input.walletClient)
  try {
    const raw = await queue.enqueueOrder({
      orders: input.orders,
      grouping: 'na',
    })
    return { raw, statuses: parseOrderStatuses(raw) }
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function cancelOrders(
  walletClient: WalletClient,
  cancels: Array<{ a: number; o: number }>,
): Promise<{ raw: CancelSuccessResponse; statuses: ParsedCancelStatus[] }> {
  const { queue } = getTradingContext(walletClient)
  try {
    const raw = await queue.enqueueCancel({ cancels })
    return { raw, statuses: parseCancelStatuses(raw) }
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function cancelByCloid(
  walletClient: WalletClient,
  cancels: Array<{ asset: number; cloid: `0x${string}` }>,
): Promise<void> {
  const { exchange } = getTradingContext(walletClient)
  try {
    await exchange.cancelByCloid({ cancels })
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function updateLeverage(
  walletClient: WalletClient,
  params: { asset: number; isCross: boolean; leverage: number },
): Promise<void> {
  const { exchange } = getTradingContext(walletClient)
  try {
    await exchange.updateLeverage(params)
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function updateIsolatedMargin(
  walletClient: WalletClient,
  params: { asset: number; isBuy: boolean; ntli: number },
): Promise<void> {
  const { exchange } = getTradingContext(walletClient)
  try {
    await exchange.updateIsolatedMargin(params)
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function batchModify(
  walletClient: WalletClient,
  modifies: Array<{ oid: number; order: OrderParameters['orders'][number] }>,
): Promise<void> {
  const { exchange } = getTradingContext(walletClient)
  try {
    await exchange.batchModify({ modifies })
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function armDeadManSwitch(
  walletClient: WalletClient,
): Promise<void> {
  const { heartbeat } = getTradingContext(walletClient)
  try {
    await heartbeat.arm()
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function disarmDeadManSwitch(
  walletClient: WalletClient,
): Promise<void> {
  const { heartbeat } = getTradingContext(walletClient)
  try {
    await heartbeat.disarm()
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function createMarketOrderForUsdSize(params: {
  market: PerpMarketSnapshot
  usdSize: number
  side: 'buy' | 'sell'
  reduceOnly?: boolean
  slippageBps?: number
  cloid?: `0x${string}`
}): Promise<PreparedOrder> {
  const size = params.usdSize / params.market.midPx
  return prepareOrder({
    side: params.side,
    type: 'market',
    assetId: params.market.assetId,
    rawPrice: params.market.midPx,
    rawSize: size,
    szDecimals: params.market.szDecimals,
    reduceOnly: params.reduceOnly,
    slippageBps: params.slippageBps,
    cloid: params.cloid,
  })
}

export async function createLimitOrder(params: {
  market: PerpMarketSnapshot
  side: 'buy' | 'sell'
  size: number
  limitPrice: number
  reduceOnly?: boolean
  cloid?: `0x${string}`
}): Promise<PreparedOrder> {
  return prepareOrder({
    side: params.side,
    type: 'limit',
    assetId: params.market.assetId,
    rawPrice: params.limitPrice,
    rawSize: params.size,
    szDecimals: params.market.szDecimals,
    reduceOnly: params.reduceOnly,
    cloid: params.cloid,
  })
}

export function formatPerpPrice(
  market: PerpMarketSnapshot,
  price: number,
): string {
  const maxDecimals = price >= 1000 ? 0 : price >= 1 ? 2 : market.szDecimals
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  })
}

export interface PerpCandleDataPoint {
  time: number
  value: number
}

export interface PerpCandlesResponse {
  candles: PerpCandleDataPoint[]
  status: string
}
