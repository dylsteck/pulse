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

// 1440 points × 60s = 86400s = 24h (covers all time windows including 1D)
function generateHistory(
  basePrice: number,
  points = 1440,
): { time: number; value: number }[] {
  const now = Date.now() / 1000
  const history: { time: number; value: number }[] = []
  let price = basePrice * 0.88
  for (let i = points; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.48) * 0.012)
    history.push({
      time: now - i * 60,
      value: Math.max(price, 0.0001),
    })
  }
  return history
}

export const TOKENS: Token[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x4200000000000000000000000000000000000006',
    price: 3241.5,
    change24h: 2.4,
    volume24h: 14_200_000_000,
    marketCap: 389_000_000_000,
    priceHistory: generateHistory(3241.5),
  },
  {
    id: 'cbbtc',
    name: 'Coinbase Wrapped BTC',
    symbol: 'cbBTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    price: 97_842.0,
    change24h: -3.4,
    volume24h: 210_000_000,
    marketCap: 2_900_000_000,
    priceHistory: generateHistory(97842),
  },
  {
    id: 'cbeth',
    name: 'Coinbase Staked ETH',
    symbol: 'cbETH',
    address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    price: 3_412.0,
    change24h: 2.3,
    volume24h: 28_000_000,
    marketCap: 1_100_000_000,
    priceHistory: generateHistory(3412),
  },
  {
    id: 'wsteth',
    name: 'Wrapped stETH',
    symbol: 'wstETH',
    address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
    price: 3_821.0,
    change24h: 2.1,
    volume24h: 19_000_000,
    marketCap: 890_000_000,
    priceHistory: generateHistory(3821),
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    price: 1.0,
    change24h: 0.01,
    volume24h: 2_100_000_000,
    marketCap: 43_000_000_000,
    priceHistory: generateHistory(1.0),
  },
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    price: 1.0,
    change24h: -0.01,
    volume24h: 1_400_000_000,
    marketCap: 137_000_000_000,
    priceHistory: generateHistory(1.0),
  },
  {
    id: 'aero',
    name: 'Aerodrome Finance',
    symbol: 'AERO',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    price: 1.24,
    change24h: -1.8,
    volume24h: 22_000_000,
    marketCap: 490_000_000,
    priceHistory: generateHistory(1.24),
  },
  {
    id: 'virtual',
    name: 'Virtuals Protocol',
    symbol: 'VIRTUAL',
    address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
    price: 2.15,
    change24h: 15.3,
    volume24h: 89_000_000,
    marketCap: 2_150_000_000,
    priceHistory: generateHistory(2.15),
  },
  {
    id: 'brett',
    name: 'Brett',
    symbol: 'BRETT',
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    price: 0.1824,
    change24h: 14.2,
    volume24h: 42_000_000,
    marketCap: 182_000_000,
    priceHistory: generateHistory(0.1824),
  },
  {
    id: 'higher',
    name: 'Higher',
    symbol: 'HIGHER',
    address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
    price: 0.0521,
    change24h: 22.3,
    volume24h: 5_800_000,
    marketCap: 52_000_000,
    priceHistory: generateHistory(0.0521),
  },
  {
    id: 'degen',
    name: 'Degen',
    symbol: 'DEGEN',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    price: 0.00842,
    change24h: 8.1,
    volume24h: 8_700_000,
    marketCap: 51_000_000,
    priceHistory: generateHistory(0.00842),
  },
  {
    id: 'well',
    name: 'Moonwell',
    symbol: 'WELL',
    address: '0xA88594D404727625A9437C3f886C7643872296AE',
    price: 0.0347,
    change24h: 5.2,
    volume24h: 4_100_000,
    marketCap: 98_000_000,
    priceHistory: generateHistory(0.0347),
  },
  {
    id: 'mochi',
    name: 'Mochi',
    symbol: 'MOCHI',
    address: '0xF6e932Ca12afa26665dC4dDE7e27be02A7c02e50',
    price: 0.000241,
    change24h: 32.1,
    volume24h: 12_000_000,
    marketCap: 24_000_000,
    priceHistory: generateHistory(0.000241),
  },
  {
    id: 'normie',
    name: 'Normie',
    symbol: 'NORMIE',
    address: '0x7F12d13B34F5F4f0a9449c89bC51DD3461c36BF0',
    price: 0.0000892,
    change24h: 18.7,
    volume24h: 3_400_000,
    marketCap: 8_900_000,
    priceHistory: generateHistory(0.0000892),
  },
  {
    id: 'toshi',
    name: 'Toshi',
    symbol: 'TOSHI',
    address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4',
    price: 0.000312,
    change24h: 5.7,
    volume24h: 3_200_000,
    marketCap: 19_000_000,
    priceHistory: generateHistory(0.000312),
  },
  {
    id: 'bald',
    name: 'Bald',
    symbol: 'BALD',
    address: '0x27D2DECb4bFC9C76F0309b8E88dec3a601Fe25a8',
    price: 0.00462,
    change24h: -12.5,
    volume24h: 1_800_000,
    marketCap: 4_600_000,
    priceHistory: generateHistory(0.00462),
  },
]

export const DEFAULT_TOKEN = TOKENS[0]
