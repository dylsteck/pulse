export interface Market {
  id: string
  title: string
  yesPercent: number
  noPercent: number
  volume: number
  expiry: string
  priceHistory: { time: number; value: number }[]
}

// Probability history — values are yesPercent (0–100), 1440 pts × 60s = 24h
function generateProbabilityHistory(basePercent: number, points = 1440): { time: number; value: number }[] {
  const now = Date.now() / 1000
  const history: { time: number; value: number }[] = []
  let p = Math.max(5, Math.min(95, basePercent * (0.7 + Math.random() * 0.4)))
  for (let i = points; i >= 0; i--) {
    p = Math.max(1, Math.min(99, p + (Math.random() - 0.5) * 1.2))
    history.push({ time: now - i * 60, value: p })
  }
  return history
}

export const MARKETS: Market[] = [
  {
    id: 'btc-100k-march',
    title: 'BTC above $100k by March?',
    yesPercent: 41,
    noPercent: 59,
    volume: 12_800_000,
    expiry: '2026-03-31',
    priceHistory: generateProbabilityHistory(41),
  },
  {
    id: 'fed-cut-march',
    title: 'Fed rate cut in March?',
    yesPercent: 28,
    noPercent: 72,
    volume: 7_600_000,
    expiry: '2026-03-20',
    priceHistory: generateProbabilityHistory(28),
  },
  {
    id: 'recession-2026',
    title: 'US recession in 2026?',
    yesPercent: 31,
    noPercent: 69,
    volume: 15_200_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(31),
  },
  {
    id: 'stablecoin-bill',
    title: 'US stablecoin bill signed in 2026?',
    yesPercent: 71,
    noPercent: 29,
    volume: 23_100_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(71),
  },
  {
    id: 'btc-etf-100b',
    title: 'Bitcoin ETF inflows exceed $100B in 2026?',
    yesPercent: 58,
    noPercent: 42,
    volume: 18_500_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(58),
  },
  {
    id: 'eth-5k-2026',
    title: 'ETH reaches $5k in 2026?',
    yesPercent: 55,
    noPercent: 45,
    volume: 9_300_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(55),
  },
  {
    id: 'eth-10k-2026',
    title: 'ETH reaches $10k in 2026?',
    yesPercent: 29,
    noPercent: 71,
    volume: 14_800_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(29),
  },
  {
    id: 'gop-house-2026',
    title: 'Republicans keep House in 2026?',
    yesPercent: 62,
    noPercent: 38,
    volume: 8_100_000,
    expiry: '2026-11-03',
    priceHistory: generateProbabilityHistory(62),
  },
  {
    id: 'ukraine-ceasefire',
    title: 'Ukraine ceasefire by end of 2026?',
    yesPercent: 44,
    noPercent: 56,
    volume: 21_000_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(44),
  },
  {
    id: 'openai-ipo',
    title: 'OpenAI goes public in 2026?',
    yesPercent: 33,
    noPercent: 67,
    volume: 5_500_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(33),
  },
  {
    id: 'base-top3-l2',
    title: 'Base becomes top 3 L2 by TVL?',
    yesPercent: 67,
    noPercent: 33,
    volume: 3_900_000,
    expiry: '2026-06-30',
    priceHistory: generateProbabilityHistory(67),
  },
  {
    id: 'inflation-2pct',
    title: 'US inflation back to 2% by Q3?',
    yesPercent: 24,
    noPercent: 76,
    volume: 11_300_000,
    expiry: '2026-09-30',
    priceHistory: generateProbabilityHistory(24),
  },
  {
    id: 'coinbase-400',
    title: 'Coinbase stock exceeds $400?',
    yesPercent: 44,
    noPercent: 56,
    volume: 7_300_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(44),
  },
  {
    id: 'nvidia-200',
    title: 'Nvidia above $200 by EOY 2026?',
    yesPercent: 52,
    noPercent: 48,
    volume: 9_700_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(52),
  },
  {
    id: 'sp500-7000',
    title: 'S&P 500 reaches 7,000 in 2026?',
    yesPercent: 48,
    noPercent: 52,
    volume: 16_400_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(48),
  },
  {
    id: 'sol-500',
    title: 'SOL above $500 before June?',
    yesPercent: 38,
    noPercent: 62,
    volume: 6_700_000,
    expiry: '2026-05-31',
    priceHistory: generateProbabilityHistory(38),
  },
  {
    id: 'btc-reserve-g7',
    title: 'Any G7 country adopts BTC as reserve?',
    yesPercent: 12,
    noPercent: 88,
    volume: 31_200_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(12),
  },
  {
    id: 'apple-1t-profit',
    title: 'Apple posts $1T revenue in FY2026?',
    yesPercent: 19,
    noPercent: 81,
    volume: 2_400_000,
    expiry: '2026-10-31',
    priceHistory: generateProbabilityHistory(19),
  },
  {
    id: 'l2-beats-eth-tvl',
    title: 'Any L2 chain exceeds Ethereum mainnet TVL?',
    yesPercent: 23,
    noPercent: 77,
    volume: 4_800_000,
    expiry: '2026-12-31',
    priceHistory: generateProbabilityHistory(23),
  },
  {
    id: 'trump-exec-crypto',
    title: 'Trump signs pro-crypto executive order?',
    yesPercent: 81,
    noPercent: 19,
    volume: 5_400_000,
    expiry: '2026-03-31',
    priceHistory: generateProbabilityHistory(81),
  },
]
