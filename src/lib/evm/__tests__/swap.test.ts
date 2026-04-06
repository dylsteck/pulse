import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_SWAP_SLIPPAGE_BPS,
  buildExactInSwapParams,
} from '@/lib/evm/swap'

const addr = '0x1234567890123456789012345678901234567890' as `0x${string}`
const usdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`
const weth = '0x4200000000000000000000000000000000000006' as `0x${string}`

describe('buildExactInSwapParams', () => {
  test('returns null for invalid amount', () => {
    expect(
      buildExactInSwapParams({
        address: addr,
        fromToken: weth,
        toToken: usdc,
        amount: '',
        decimals: 18,
      }),
    ).toBeNull()
    expect(
      buildExactInSwapParams({
        address: addr,
        fromToken: weth,
        toToken: usdc,
        amount: '-1',
        decimals: 18,
      }),
    ).toBeNull()
  })

  test('maps exact-in params with default slippage', () => {
    const p = buildExactInSwapParams({
      address: addr,
      fromToken: weth,
      toToken: usdc,
      amount: '1',
      decimals: 18,
    })
    expect(p).not.toBeNull()
    expect(p!.mode).toBe('exactIn')
    expect(p!.slippageBps).toBe(DEFAULT_SWAP_SLIPPAGE_BPS)
    expect(p!.inputAmount).toBe(10n ** 18n)
    expect(p!.swapperAccount).toBe(addr)
  })

  test('respects custom slippageBps', () => {
    const p = buildExactInSwapParams({
      address: addr,
      fromToken: usdc,
      toToken: weth,
      amount: '100',
      decimals: 6,
      slippageBps: 100,
    })
    expect(p!.slippageBps).toBe(100)
    expect(p!.inputAmount).toBe(100_000_000n)
  })
})
