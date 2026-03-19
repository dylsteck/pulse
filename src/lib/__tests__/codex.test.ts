import { describe, expect, test } from 'bun:test'
import { transformBars, transformBaseTokens } from '@/lib/codex'

describe('transformBaseTokens', () => {
  test('transforms Codex token results', () => {
    const json = {
      data: {
        filterTokens: {
          results: [
            {
              priceUSD: '1.5',
              change24: '0.05',
              volume24: '100000',
              marketCap: '500000',
              token: {
                address: '0xABC123',
                symbol: 'TKN',
                name: 'Test Token',
                networkId: 8453,
                info: { imageSmallUrl: 'https://example.com/img.png' },
              },
            },
          ],
        },
      },
    }
    const result = transformBaseTokens(json)
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('0xabc123')
    expect(result[0]?.symbol).toBe('TKN')
    expect(result[0]?.price).toBe(1.5)
    expect(result[0]?.change24h).toBe(5)
    expect(result[0]?.volume24h).toBe(100000)
    expect(result[0]?.imageUrl).toBe('https://example.com/img.png')
  })

  test('filters out non-Base tokens', () => {
    const json = {
      data: {
        filterTokens: {
          results: [
            {
              priceUSD: '1',
              change24: '0',
              volume24: '0',
              marketCap: '0',
              token: {
                address: '0x123',
                symbol: 'T',
                name: 'T',
                networkId: 1,
              },
            },
          ],
        },
      },
    }
    const result = transformBaseTokens(json)
    expect(result).toHaveLength(0)
  })

  test('throws on Codex errors', () => {
    expect(() =>
      transformBaseTokens({ errors: [{ message: 'Query failed' }] }),
    ).toThrow('Codex query failed')
  })
})

describe('transformBars', () => {
  test('transforms bars response', () => {
    const json = {
      data: {
        getTokenBars: {
          c: [100, 101, 102],
          t: [1000, 2000, 3000],
          s: 'ok',
        },
      },
    }
    const result = transformBars(json)
    expect(result.bars).toHaveLength(3)
    expect(result.bars[0]).toEqual({ time: 1000, value: 100 })
    expect(result.bars[1]).toEqual({ time: 2000, value: 101 })
    expect(result.status).toBe('ok')
  })

  test('returns empty bars for no data', () => {
    const result = transformBars({
      data: { getTokenBars: { c: null, t: null, s: 'no_data' } },
    })
    expect(result.bars).toEqual([])
    expect(result.status).toBe('no_data')
  })

  test('throws on Codex errors', () => {
    expect(() =>
      transformBars({ errors: [{ message: 'Bars failed' }] }),
    ).toThrow('Codex bars query failed')
  })
})
