export interface Token {
  id: string
  name: string
  symbol: string
  address: string
  networkId?: number
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  priceHistory: Array<{ time: number; value: number }>
  imageUrl?: string
}

export interface MarketOutcome {
  name: string
  percent: number
  clobTokenId?: string
}

export interface Market {
  id: string
  title: string
  yesPercent: number
  noPercent: number
  volume: number
  expiry: string
  priceHistory: Array<{ time: number; value: number }>
  imageUrl?: string
  outcomes?: Array<MarketOutcome>
  /** CLOB token id for the Yes outcome (binary markets). */
  clobTokenId?: string
  /** CLOB token id for the No outcome when Gamma returns two ids (index 1). */
  noClobTokenId?: string
  description?: string
  tags?: Array<string>
  liquidity?: number
  negRisk?: boolean
}
