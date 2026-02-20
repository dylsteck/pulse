export interface Token {
  id: string
  name: string
  symbol: string
  address: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  priceHistory: { time: number; value: number }[]
  imageUrl?: string
}

export interface MarketOutcome {
  name: string
  percent: number
}

export interface Market {
  id: string
  title: string
  yesPercent: number
  noPercent: number
  volume: number
  expiry: string
  priceHistory: { time: number; value: number }[]
  imageUrl?: string
  outcomes?: MarketOutcome[]
  clobTokenId?: string
}
