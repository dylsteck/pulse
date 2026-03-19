import { describe, expect, test } from 'bun:test'
import {
  GECKO_MEME_PAGE_SIZE,
  transformMemeTokenDetail,
  transformMemeTokensPage,
} from '@/lib/geckoterminal'

describe('transformMemeTokensPage', () => {
  test('transforms pools with included tokens', () => {
    const json = {
      data: [
        {
          id: 'pool-1',
          type: 'pool',
          attributes: {
            address: 'pool-addr-1',
            name: 'TOKEN / USDC',
            base_token_price_usd: '0.001',
            market_cap_usd: '100000',
            fdv_usd: '150000',
            price_change_percentage: { h24: '10.5' },
            volume_usd: { h24: '50000' },
            reserve_in_usd: '25000',
          },
          relationships: { base_token: { data: { id: 'solana_token1' } } },
        },
      ],
      included: [
        {
          id: 'solana_token1',
          type: 'token',
          attributes: {
            address: 'token1',
            name: 'Test Token',
            symbol: 'TEST',
            image_url: 'https://example.com/img.png',
          },
        },
      ],
    }
    const result = transformMemeTokensPage(json, 1)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.id).toBe('token1')
    expect(result.items[0]?.symbol).toBe('TEST')
    expect(result.items[0]?.name).toBe('Test Token')
    expect(result.items[0]?.price).toBe(0.001)
    expect(result.items[0]?.change24h).toBe(10.5)
    expect(result.items[0]?.imageUrl).toBe('https://example.com/img.png')
  })

  test('sets nextPage when page is full', () => {
    const data = Array.from({ length: GECKO_MEME_PAGE_SIZE }, (_, i) => ({
      id: `pool-${i}`,
      type: 'pool',
      attributes: {
        address: `addr-${i}`,
        name: `TOKEN${i} / USDC`,
        base_token_price_usd: '1',
        market_cap_usd: '1000',
        fdv_usd: '1000',
        volume_usd: { h24: '100' },
        reserve_in_usd: '500',
      },
      relationships: {},
    }))
    const result = transformMemeTokensPage({ data }, 1)
    expect(result.items).toHaveLength(GECKO_MEME_PAGE_SIZE)
    expect(result.nextPage).toBe(2)
  })
})

describe('transformMemeTokenDetail', () => {
  test('transforms token detail payload', () => {
    const payload = {
      token: {
        data: {
          attributes: {
            address: 'token-addr',
            name: 'Detail Token',
            symbol: 'DET',
            price_usd: '0.5',
            market_cap_usd: '500000',
            volume_usd: { h24: '10000' },
            total_reserve_in_usd: '25000',
          },
          relationships: {
            top_pools: { data: [{ id: 'solana_pool123' }] },
          },
        },
      },
      info: {
        data: {
          attributes: {
            description: 'A test token',
            holders: { count: 100 },
          },
        },
      },
    }
    const result = transformMemeTokenDetail(payload)
    expect(result).not.toBeNull()
    expect(result?.id).toBe('token-addr')
    expect(result?.symbol).toBe('DET')
    expect(result?.price).toBe(0.5)
    expect(result?.holdersCount).toBe(100)
    expect(result?.description).toBe('A test token')
  })

  test('returns null when address or pool missing', () => {
    expect(
      transformMemeTokenDetail({
        token: { data: { attributes: {} } },
        info: { data: {} },
      }),
    ).toBeNull()
  })
})
