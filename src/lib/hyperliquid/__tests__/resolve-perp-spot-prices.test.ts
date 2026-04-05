import { describe, expect, test } from 'bun:test'
import { resolvePerpSpotPrices } from '@/lib/hyperliquid/service'

describe('resolvePerpSpotPrices', () => {
  test('uses allMids when mark and mid are 0', () => {
    const { markPx, midPx } = resolvePerpSpotPrices(
      { markPx: '0', midPx: null, oraclePx: '0' },
      { '2Z': '0.0042' },
      '2Z',
    )
    expect(midPx).toBeCloseTo(0.0042)
    expect(markPx).toBeCloseTo(0.0042)
  })

  test('prefers non-zero midPx from ctx', () => {
    const { midPx, markPx } = resolvePerpSpotPrices(
      { markPx: '0', midPx: '1.5', oraclePx: '1.4' },
      {},
      'ETH',
    )
    expect(midPx).toBe(1.5)
    expect(markPx).toBe(1.5)
  })

  test('falls back to oracle when mids missing', () => {
    const { midPx } = resolvePerpSpotPrices(
      { markPx: '0', midPx: null, oraclePx: '99.1' },
      {},
      'XYZ',
    )
    expect(midPx).toBeCloseTo(99.1)
  })
})
