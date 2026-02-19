export interface MockPerpMarket {
  id: string
  coin: string
  markPx: number
  funding: number
  openInterest: number
  volume24h: number
  premium: number
  szDecimals: number
  maxLeverage: number
}

export const MOCK_PERPS: MockPerpMarket[] = [
  {
    id: 'btc-perp',
    coin: 'BTC',
    markPx: 97250,
    funding: 0.00012,
    openInterest: 845_000_000,
    volume24h: 2_950_000_000,
    premium: 0.0005,
    szDecimals: 5,
    maxLeverage: 40,
  },
  {
    id: 'eth-perp',
    coin: 'ETH',
    markPx: 3520,
    funding: 0.00018,
    openInterest: 510_000_000,
    volume24h: 1_600_000_000,
    premium: 0.0008,
    szDecimals: 4,
    maxLeverage: 25,
  },
  {
    id: 'sol-perp',
    coin: 'SOL',
    markPx: 198.2,
    funding: 0.00022,
    openInterest: 214_000_000,
    volume24h: 820_000_000,
    premium: 0.0012,
    szDecimals: 2,
    maxLeverage: 20,
  },
  {
    id: 'hype-perp',
    coin: 'HYPE',
    markPx: 11.43,
    funding: 0.00045,
    openInterest: 156_000_000,
    volume24h: 690_000_000,
    premium: 0.0018,
    szDecimals: 0,
    maxLeverage: 10,
  },
  {
    id: 'doge-perp',
    coin: 'DOGE',
    markPx: 0.2123,
    funding: -0.00009,
    openInterest: 178_000_000,
    volume24h: 410_000_000,
    premium: -0.0004,
    szDecimals: 0,
    maxLeverage: 10,
  },
]
