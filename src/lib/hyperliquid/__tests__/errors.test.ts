import { describe, expect, test } from 'bun:test'
import { normalizeHyperliquidError } from '@/lib/hyperliquid/errors'

describe('normalizeHyperliquidError', () => {
  test('maps tick size / precision errors', () => {
    const result = normalizeHyperliquidError(
      new Error('Invalid tick size for this market'),
    )
    expect(result).toContain('Invalid price precision')
    expect(result).toContain('Invalid tick size')
  })

  test('maps too small / min notional errors', () => {
    const result = normalizeHyperliquidError('Order too small for this pair')
    expect(result).toContain('Order size is below the minimum notional')
  })

  test('maps insufficient margin errors', () => {
    const result = normalizeHyperliquidError(
      new Error('Insufficient margin to place order'),
    )
    expect(result).toContain('Insufficient margin')
  })

  test('maps liquidation errors', () => {
    const result = normalizeHyperliquidError(
      'This order would immediately liquidate',
    )
    expect(result).toContain('liquidation risk')
  })

  test('maps signer/wallet errors', () => {
    const result = normalizeHyperliquidError('API wallet does not exist')
    expect(result).toContain('Signer is not recognized')
  })

  test('returns raw message for unknown errors', () => {
    const msg = 'Some unknown error'
    expect(normalizeHyperliquidError(new Error(msg))).toBe(msg)
    expect(normalizeHyperliquidError(msg)).toBe(msg)
  })

  test('handles non-Error unknown', () => {
    expect(normalizeHyperliquidError(123)).toBe('Unknown Hyperliquid error')
  })
})
