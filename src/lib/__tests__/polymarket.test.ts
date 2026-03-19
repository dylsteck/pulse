import { describe, expect, test } from 'bun:test'
import {
  transformPolymarketEvents,
  transformPriceHistory,
} from '@/lib/polymarket'

describe('transformPolymarketEvents', () => {
  test('transforms events with outcome prices', () => {
    const json = [
      {
        id: '1',
        title: 'Will X win?',
        volume24hr: 100000,
        endDate: '2025-12-31T00:00:00Z',
        image: 'https://example.com/img.png',
        markets: [
          {
            outcomePrices: '["0.65","0.35"]',
            clobTokenIds: '["123"]',
          },
        ],
      },
    ]
    const result = transformPolymarketEvents(json, 10, 0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.id).toBe('1')
    expect(result.items[0]?.title).toBe('Will X win?')
    expect(result.items[0]?.yesPercent).toBe(65)
    expect(result.items[0]?.noPercent).toBe(35)
    expect(result.items[0]?.volume).toBe(100000)
    expect(result.items[0]?.imageUrl).toBe('https://example.com/img.png')
    expect(result.nextOffset).toBeNull()
  })

  test('returns nextOffset when limit reached', () => {
    const json = [
      {
        id: '1',
        title: 'Event 1',
        markets: [{ outcomePrices: '["0.5","0.5"]' }],
      },
      {
        id: '2',
        title: 'Event 2',
        markets: [{ outcomePrices: '["0.6","0.4"]' }],
      },
    ]
    const result = transformPolymarketEvents(json, 2, 0)
    expect(result.items).toHaveLength(2)
    expect(result.nextOffset).toBe(2)
  })

  test('filters out events without valid prices', () => {
    const json = [
      {
        id: '1',
        title: 'Valid',
        markets: [{ outcomePrices: '["0.5","0.5"]' }],
      },
      { id: '2', title: 'No prices', markets: [{}] },
    ]
    const result = transformPolymarketEvents(json, 10, 0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.id).toBe('1')
  })
})

describe('transformPriceHistory', () => {
  test('transforms history array', () => {
    const json = {
      history: [
        { t: 1000, p: 0.5 },
        { t: 2000, p: 0.55 },
      ],
    }
    const result = transformPriceHistory(json)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ time: 1000, value: 50 })
    expect(result[1]).toEqual({ time: 2000, value: 55 })
  })

  test('returns empty array for empty history', () => {
    expect(transformPriceHistory({})).toEqual([])
    expect(transformPriceHistory({ history: [] })).toEqual([])
  })
})
