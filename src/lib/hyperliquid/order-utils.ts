import { formatPrice, formatSize } from '@nktkas/hyperliquid/utils'

export type HyperliquidOrderSide = 'buy' | 'sell'
export type HyperliquidOrderType = 'market' | 'limit'

export interface PrepareOrderInput {
  side: HyperliquidOrderSide
  type: HyperliquidOrderType
  assetId: number
  rawPrice: number
  rawSize: number
  szDecimals: number
  reduceOnly?: boolean
  slippageBps?: number
  tif?: 'Gtc' | 'Ioc'
  cloid?: `0x${string}`
}

export interface PreparedOrder {
  a: number
  b: boolean
  p: string
  s: string
  r: boolean
  t: { limit: { tif: 'Gtc' | 'Ioc' } }
  c?: `0x${string}`
}

export function validateNotional(
  size: number,
  price: number,
  minNotional = 10,
): void {
  const notional = size * price
  if (notional < minNotional) {
    throw new Error(
      `Order too small: $${notional.toFixed(2)} < $${minNotional.toFixed(2)}`,
    )
  }
}

export function prepareOrder(input: PrepareOrderInput): PreparedOrder {
  const {
    side,
    type,
    assetId,
    rawPrice,
    rawSize,
    szDecimals,
    reduceOnly = false,
    slippageBps = 50,
    tif,
    cloid,
  } = input

  validateNotional(rawSize, rawPrice)

  const slippageMultiplier =
    type === 'market'
      ? side === 'buy'
        ? 1 + slippageBps / 10_000
        : 1 - slippageBps / 10_000
      : 1

  const formattedPrice = formatPrice(
    rawPrice * slippageMultiplier,
    szDecimals,
    'perp',
  )
  const formattedSize = formatSize(rawSize, szDecimals)

  return {
    a: assetId,
    b: side === 'buy',
    p: formattedPrice,
    s: formattedSize,
    r: reduceOnly,
    t: { limit: { tif: tif ?? (type === 'market' ? 'Ioc' : 'Gtc') } },
    c: cloid,
  }
}
