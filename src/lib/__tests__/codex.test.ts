import { describe, expect, test } from 'bun:test'
import {
  buildBarsQuery,
  buildCodexBarsPath,
  buildCodexBaseTokensPath,
  buildCodexTokenPath,
  codexBarsTokenSymbol,
  normalizeCodexAddress,
  parseCodexBarsParams,
  parseCodexBaseTokensParams,
  parseCodexTokenParams,
  transformBars,
  transformBaseTokens,
} from '@/lib/codex'

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

describe('Codex parameter parsing', () => {
  test('parses base token params with defaults', () => {
    const params = new URLSearchParams()
    expect(parseCodexBaseTokensParams(params)).toEqual({
      limit: 50,
      offset: 0,
    })
  })

  test('rejects invalid base token params', () => {
    const params = new URLSearchParams({ limit: '500', offset: '-1' })
    expect(parseCodexBaseTokensParams(params)).toBeNull()
  })

  test('normalizes valid token addresses', () => {
    expect(normalizeCodexAddress('0xAbC1230000000000000000000000000000000000')).toBe(
      '0xabc1230000000000000000000000000000000000',
    )
  })

  test('rejects invalid token addresses', () => {
    expect(normalizeCodexAddress('not-an-address')).toBeNull()
    expect(parseCodexTokenParams(new URLSearchParams())).toBeNull()
  })

  test('parses bars params only for allowed windows', () => {
    const ok = new URLSearchParams({
      address: '0xabc1230000000000000000000000000000000000',
      windowLabel: '1D',
    })
    expect(parseCodexBarsParams(ok)).toEqual({
      address: '0xabc1230000000000000000000000000000000000',
      windowLabel: '1D',
    })

    const bad = new URLSearchParams({
      address: '0xabc1230000000000000000000000000000000000',
      windowLabel: '30D',
    })
    expect(parseCodexBarsParams(bad)).toBeNull()
  })

  test('builds typed endpoint paths', () => {
    expect(buildCodexBaseTokensPath(25, 50)).toBe(
      '/api/codex/base-tokens?limit=25&offset=50',
    )
    expect(
      buildCodexTokenPath('0xabc1230000000000000000000000000000000000'),
    ).toBe('/api/codex/token?address=0xabc1230000000000000000000000000000000000')
    expect(
      buildCodexBarsPath('0xabc1230000000000000000000000000000000000', '15m'),
    ).toBe(
      '/api/codex/bars?address=0xabc1230000000000000000000000000000000000&windowLabel=15m',
    )
  })
})

describe('buildBarsQuery', () => {
  test('uses Codex token symbol tokenAddress:networkId', () => {
    const addr = '0x4200000000000000000000000000000000000006'
    expect(codexBarsTokenSymbol(addr)).toBe(`${addr}:8453`)
    const q = buildBarsQuery(addr, '1H')
    const vars = q.variables as { symbol: string }
    expect(vars.symbol).toBe(`${addr}:8453`)
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

  test('normalizes millisecond timestamps to seconds', () => {
    const json = {
      data: {
        getTokenBars: {
          c: [1, 2],
          t: [1_700_000_000_000, 1_700_000_060_000],
          s: 'ok',
        },
      },
    }
    const result = transformBars(json)
    expect(result.bars[0]?.time).toBe(1_700_000_000)
    expect(result.bars[1]?.time).toBe(1_700_000_060)
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
