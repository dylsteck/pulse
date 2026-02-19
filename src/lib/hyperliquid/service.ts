import type {
  Address,
  CancelSuccessResponse,
  ClearinghouseStateResponse,
  FrontendOpenOrdersResponse,
  OrderSuccessResponse,
  UserFillsResponse,
} from '@nktkas/hyperliquid'
import {
  type ExchangeClient,
  type OrderParameters,
} from '@nktkas/hyperliquid'
import {
  createHyperliquidExchangeClient,
  getHyperliquidInfoClient,
  getHyperliquidSymbolConverter,
} from '@/lib/hyperliquid/clients'
import { getHyperliquidRuntimeConfig } from '@/lib/hyperliquid/env'
import { type PreparedOrder, prepareOrder } from '@/lib/hyperliquid/order-utils'
import { normalizeHyperliquidError } from '@/lib/hyperliquid/errors'
import { parseCancelStatuses, parseOrderStatuses, type ParsedCancelStatus, type ParsedOrderStatus } from '@/lib/hyperliquid/status'
import { OrderBatchQueue } from '@/lib/hyperliquid/batch-queue'
import { ScheduleCancelHeartbeat } from '@/lib/hyperliquid/heartbeat'
import { toHyperliquidWallet } from '@/lib/hyperliquid/signer'
import type { WalletClient } from 'viem'
import { formatPrice } from '@nktkas/hyperliquid/utils'

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

export async function fetchPerpMarketsSnapshot(): Promise<PerpMarketSnapshot[]> {
  const info = getHyperliquidInfoClient()
  const [metaAndCtxs, mids, converter] = await Promise.all([
    info.metaAndAssetCtxs(),
    info.allMids(),
    getHyperliquidSymbolConverter(),
  ])
  const [meta, ctxs] = metaAndCtxs

  return meta.universe
    .map((asset, index) => {
      const ctx = ctxs[index]
      if (!ctx || asset.isDelisted) return null

      const assetId = converter.getAssetId(asset.name)
      if (assetId == null) return null

      const markPx = Number(ctx.markPx)
      const midPx = Number(ctx.midPx ?? ctx.markPx ?? mids[asset.name] ?? 0)
      const prevDayPx = Number(ctx.prevDayPx)
      const change24h = prevDayPx > 0 ? ((midPx - prevDayPx) / prevDayPx) * 100 : 0

      return {
        id: `${asset.name.toLowerCase()}-perp`,
        assetId,
        coin: asset.name,
        markPx,
        midPx,
        prevDayPx,
        change24h,
        funding: Number(ctx.funding),
        openInterest: Number(ctx.openInterest),
        premium: Number(ctx.premium ?? 0),
        volume24h: Number(ctx.dayNtlVlm),
        szDecimals: asset.szDecimals,
        maxLeverage: asset.maxLeverage,
      } satisfies PerpMarketSnapshot
    })
    .filter((market): market is PerpMarketSnapshot => market !== null)
    .sort((a, b) => b.volume24h - a.volume24h)
}

export async function fetchPerpAccountState(user: Address): Promise<ClearinghouseStateResponse> {
  return getHyperliquidInfoClient().clearinghouseState({ user })
}

export async function fetchPerpOpenOrders(user: Address): Promise<FrontendOpenOrdersResponse> {
  return getHyperliquidInfoClient().frontendOpenOrders({ user })
}

export async function fetchPerpFills(user: Address): Promise<UserFillsResponse> {
  return getHyperliquidInfoClient().userFills({ user, aggregateByTime: true })
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

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
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

export async function placeBatchOrders(input: PlaceBatchOrdersInput): Promise<PlaceOrderResult> {
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

export async function armDeadManSwitch(walletClient: WalletClient): Promise<void> {
  const { heartbeat } = getTradingContext(walletClient)
  try {
    await heartbeat.arm()
  } catch (error) {
    throw new Error(normalizeHyperliquidError(error))
  }
}

export async function disarmDeadManSwitch(walletClient: WalletClient): Promise<void> {
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

export function isLivePerpsEnabled(): boolean {
  return getHyperliquidRuntimeConfig().useLiveData
}

export function formatPerpPrice(market: PerpMarketSnapshot, price: number): string {
  return formatPrice(price, market.szDecimals, 'perp')
}
