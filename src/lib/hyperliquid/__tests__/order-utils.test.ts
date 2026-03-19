import { describe, expect, test } from 'bun:test'
import { prepareOrder } from '@/lib/hyperliquid/order-utils'

describe('prepareOrder', () => {
  test('formats market order with IOC and slippage', () => {
    const order = prepareOrder({
      side: 'buy',
      type: 'market',
      assetId: 0,
      rawPrice: 1000,
      rawSize: 0.1,
      szDecimals: 4,
      slippageBps: 100,
    })

    expect(order.a).toBe(0)
    expect(order.b).toBe(true)
    expect(order.t.limit.tif).toBe('Ioc')
    expect(Number(order.p)).toBeGreaterThan(1000)
  })

  test('throws on notional below minimum', () => {
    expect(() =>
      prepareOrder({
        side: 'buy',
        type: 'limit',
        assetId: 0,
        rawPrice: 100,
        rawSize: 0.0001,
        szDecimals: 4,
      }),
    ).toThrow('Order too small')
  })
})
