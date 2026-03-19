import { makeRequest } from '@/lib/request'

export const GECKO_MEME_PAGE_SIZE = 20

interface GeckoTokenInclude {
  id: string
  type: 'token'
  attributes: {
    address: string
    name: string
    symbol: string
    image_url?: string | null
  }
}

interface GeckoPool {
  id: string
  type: 'pool'
  attributes: {
    address: string
    name: string
    base_token_price_usd?: string | null
    fdv_usd?: string | null
    market_cap_usd?: string | null
    pool_created_at?: string
    price_change_percentage?: {
      h24?: string | null
    }
    volume_usd?: {
      h24?: string | null
    }
    reserve_in_usd?: string | null
  }
  relationships?: {
    base_token?: {
      data?: {
        id: string
      }
    }
  }
}

interface GeckoPoolsResponse {
  data: Array<GeckoPool>
  included?: Array<GeckoTokenInclude>
}

interface GeckoTokenResponse {
  data?: {
    attributes?: {
      address: string
      name: string
      symbol: string
      image_url?: string | null
      price_usd?: string | null
      market_cap_usd?: string | null
      fdv_usd?: string | null
      total_reserve_in_usd?: string | null
      volume_usd?: {
        h24?: string | null
      }
      launchpad_details?: {
        graduation_percentage?: number | null
      }
    }
    relationships?: {
      top_pools?: {
        data?: Array<{
          id: string
        }>
      }
    }
  }
}

interface GeckoTokenInfoResponse {
  data?: {
    attributes?: {
      description?: string | null
      websites?: Array<string>
      twitter_handle?: string | null
      telegram_handle?: string | null
      gt_score?: number | null
      holders?: {
        count?: number | null
      }
      launchpad_details?: {
        graduation_percentage?: number | null
      }
      image_url?: string | null
      name?: string
      symbol?: string
    }
  }
}

interface GeckoTokenDetailPayload {
  token: GeckoTokenResponse
  info: GeckoTokenInfoResponse
}

export interface MemeToken {
  id: string
  address: string
  poolAddress: string
  name: string
  symbol: string
  price: number
  change24h: number
  volume24h: number
  liquidity: number
  valuation: number
  valuationLabel: 'Market Cap' | 'FDV'
  createdAt?: string
  priceHistory: Array<{ time: number; value: number }>
  imageUrl?: string
  description?: string | null
  holdersCount?: number
  gtScore?: number
  launchProgress?: number | null
  websites?: Array<string>
  twitterHandle?: string | null
  telegramHandle?: string | null
}

export interface MemeTokensPage {
  items: Array<MemeToken>
  nextPage: number | null
}

function toNumber(value: string | number | null | undefined) {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function fallbackTokenAddress(pool: GeckoPool) {
  const baseTokenId = pool.relationships?.base_token?.data?.id
  return baseTokenId?.replace(/^solana_/, '') ?? pool.attributes.address
}

function baseNameFromPool(poolName: string | undefined) {
  return poolName?.split(' / ')[0]?.trim() || 'Unknown'
}

function buildMemeToken(
  pool: GeckoPool,
  includedToken: GeckoTokenInclude | undefined,
  now: number,
): MemeToken {
  const price = toNumber(pool.attributes.base_token_price_usd)
  const marketCap = toNumber(pool.attributes.market_cap_usd)
  const fdv = toNumber(pool.attributes.fdv_usd)
  const valuation = marketCap > 0 ? marketCap : fdv
  const valuationLabel = marketCap > 0 ? 'Market Cap' : 'FDV'
  const address =
    includedToken?.attributes.address ?? fallbackTokenAddress(pool)
  const name =
    includedToken?.attributes.name ?? baseNameFromPool(pool.attributes.name)
  const symbol =
    includedToken?.attributes.symbol ?? baseNameFromPool(pool.attributes.name)

  return {
    id: address,
    address,
    poolAddress: pool.attributes.address,
    name,
    symbol,
    price,
    change24h: toNumber(pool.attributes.price_change_percentage?.h24),
    volume24h: toNumber(pool.attributes.volume_usd?.h24),
    liquidity: toNumber(pool.attributes.reserve_in_usd),
    valuation,
    valuationLabel,
    createdAt: pool.attributes.pool_created_at ?? new Date().toISOString(),
    priceHistory: [{ time: now, value: price }],
    imageUrl: includedToken?.attributes.image_url ?? undefined,
  }
}

export function transformMemeTokensPage(
  json: GeckoPoolsResponse,
  page: number,
): MemeTokensPage {
  const now = Date.now() / 1000
  const includedById = new Map(
    (json.included ?? [])
      .filter((item): item is GeckoTokenInclude => item.type === 'token')
      .map((item) => [item.id, item]),
  )

  const items = (json.data ?? []).map((pool) =>
    buildMemeToken(
      pool,
      includedById.get(pool.relationships?.base_token?.data?.id ?? ''),
      now,
    ),
  )

  // Use API-provided nextPage for infinite scroll (based on upstream full page)
  const apiNextPage = (json as { nextPage?: number | null }).nextPage
  const nextPage =
    apiNextPage ?? (items.length >= GECKO_MEME_PAGE_SIZE ? page + 1 : null)

  return {
    items,
    nextPage,
  }
}

export function transformMemeTokenDetail(
  payload: GeckoTokenDetailPayload,
): MemeToken | null {
  const tokenAttributes = payload.token.data?.attributes
  const infoAttributes = payload.info.data?.attributes
  const topPoolId = payload.token.data?.relationships?.top_pools?.data?.[0]?.id

  if (!tokenAttributes?.address || !topPoolId) return null

  const marketCap = toNumber(tokenAttributes.market_cap_usd)
  const fdv = toNumber(tokenAttributes.fdv_usd)
  const price = toNumber(tokenAttributes.price_usd)

  return {
    id: tokenAttributes.address,
    address: tokenAttributes.address,
    poolAddress: topPoolId.replace(/^solana_/, ''),
    name: infoAttributes?.name ?? tokenAttributes.name,
    symbol: infoAttributes?.symbol ?? tokenAttributes.symbol,
    price,
    change24h: 0,
    volume24h: toNumber(tokenAttributes.volume_usd?.h24),
    liquidity: toNumber(tokenAttributes.total_reserve_in_usd),
    valuation: marketCap > 0 ? marketCap : fdv,
    valuationLabel: marketCap > 0 ? 'Market Cap' : 'FDV',
    createdAt: undefined,
    priceHistory: [{ time: Date.now() / 1000, value: price }],
    description: infoAttributes?.description ?? null,
    holdersCount: Math.trunc(toNumber(infoAttributes?.holders?.count)),
    gtScore: infoAttributes?.gt_score ?? undefined,
    launchProgress:
      infoAttributes?.launchpad_details?.graduation_percentage ??
      tokenAttributes.launchpad_details?.graduation_percentage ??
      null,
    websites: infoAttributes?.websites ?? [],
    twitterHandle: infoAttributes?.twitter_handle ?? null,
    telegramHandle: infoAttributes?.telegram_handle ?? null,
    imageUrl:
      infoAttributes?.image_url ?? tokenAttributes.image_url ?? undefined,
  }
}

export async function fetchMemeTokens(page = 1): Promise<MemeTokensPage> {
  const json = await makeRequest<GeckoPoolsResponse>(
    `/api/geckoterminal/memes?page=${page}`,
  )

  return transformMemeTokensPage(json, page)
}

export async function fetchMemeTokenDetail(
  address: string,
): Promise<MemeToken | null> {
  const payload = await makeRequest<GeckoTokenDetailPayload>(
    `/api/geckoterminal/token-detail?address=${encodeURIComponent(address)}`,
  )

  return transformMemeTokenDetail(payload)
}
