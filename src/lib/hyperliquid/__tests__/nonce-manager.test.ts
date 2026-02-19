import { describe, expect, it } from 'vitest'
import { NonceManager } from '@/lib/hyperliquid/nonce-manager'

describe('NonceManager', () => {
  it('returns strictly increasing values', () => {
    const manager = new NonceManager()
    const first = manager.next()
    const second = manager.next()
    const third = manager.next()

    expect(second).toBeGreaterThan(first)
    expect(third).toBeGreaterThan(second)
  })
})
