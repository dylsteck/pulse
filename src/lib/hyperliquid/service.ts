import type {
  CancelSuccessResponse,
  ClearinghouseStateResponse,
  ExchangeClient,
  FrontendOpenOrdersResponse,
  OrderParameters,
  OrderSuccessResponse,
  UserFillsResponse,
} from '@nktkas/hyperliquid'
import type { PreparedOrder } from '@/lib/hyperliquid/order-utils'
import type {
  ParsedCancelStatus,
  ParsedOrderStatus,
} from '@/lib/hyperliquid/status'
import type { WalletClient } from 'viem'
import { createHyperliquidExchangeClient } from '@/lib/hyperliquid/clients'
import { makeRequest } from '@/lib/request'
import { prepareOrder } from '@/lib/hyperliquid/order-utils'
import { normalizeHyperliquidError } from '@/lib/hyperliquid/errors'
import {
  parseCancelStatuses,
  parseOrderStatuses,
} from '@/lib/hyperliquid/status'
import { OrderBatchQueue } from '@/lib/hyperliquid/batch-queue'
import { ScheduleCancelHeartbeat } from '@/lib/hyperliquid/heartbeat'
import { toHyperliquidWallet } from '@/lib/hyperliquid/signer'
import { formatPrice } from '@/lib/format'

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

/** Hyperliquid sometimes returns markPx/midPx as 0; allMids() / oraclePx still have the live price. */
export function resolvePerpSpotPrices(
  ctx: {
    markPx: string
    midPx: string | null
    oraclePx: string
  },
  mids: Record<string, string>,
  coin: string,
): { markPx: number; midPx: number } {
  const midFromCtx =
    ctx.midPx != null && ctx.midPx !== '' ? Number(ctx.midPx) : NaN
  const markFromCtx = Number(ctx.markPx)
  const midFromMids = mids[coin] != null ? Number(mids[coin]) : NaN
  const oraclePx = Number(ctx.oraclePx)

  const pickFirstPositive = (...vals: number[]): number => {
    for (const v of vals) {
      if (Number.isFinite(v) && v > 0) return v
    }
    return 0
  }

  const midPx = pickFirstPositive(
    midFromCtx,
    markFromCtx,
    midFromMids,
    oraclePx,
  )
  const markPx =
    Number.isFinite(markFromCtx) && markFromCtx > 0 ? markFromCtx : midPx

  return { markPx, midPx }
}

const hlPost = (body: Record<string, unknown>): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export async function fetchPerpMarketsSnapshot(): Promise<
  Array<PerpMarketSnapshot>
> {
  return makeRequest<Array<PerpMarketSnapshot>>(
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
  return `0x${hex}`
}

export interface PlaceOrderInput {
  walletClient: WalletClient
  order: PreparedOrder
  expiresAfter?: number
}

export interface PlaceOrderResult {
  raw: OrderSuccessResponse
  statuses: Array<ParsedOrderStatus>
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
  orders: Array<PreparedOrder>
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
): Promise<{
  raw: CancelSuccessResponse
  statuses: Array<ParsedCancelStatus>
}> {
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
  _market: PerpMarketSnapshot,
  price: number,
): string {
  if (!Number.isFinite(price) || price <= 0) {
    return '—'
  }
  return `$${formatPrice(price)}`
}

export interface PerpCandleDataPoint {
  time: number
  value: number
}

export interface PerpCandlesResponse {
  candles: Array<PerpCandleDataPoint>
  status: string
}
