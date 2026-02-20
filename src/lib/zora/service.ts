import { createServerFn } from '@tanstack/react-start'

const ZORA_GRAPHQL_URL = 'https://api.zora.co/universal/graphql'
const TRENDING_LIST_TYPE = 'TRENDING_ALL'
const INITIAL_TRENDING_HASH = '18479101426df2b30828ff4778579280'
const PAGINATION_TRENDING_HASH = 'e128c68eae591cddd2ec71d367684d7c'

interface GraphqlSparkPoint {
  timestamp: string
  closePrice: string
}

interface GraphqlCreatorProfile {
  handle?: string | null
  avatar?: {
    downloadableUri?: string | null
  } | null
}

interface GraphqlExploreNode {
  id: string
  address: string
  chainId: number
  name: string
  symbol?: string | null
  marketCap?: string | null
  marketCapDelta24h?: string | null
  totalVolume?: string | null
  volume24h?: string | null
  uniqueHolders?: number | null
  createdAt?: string | null
  creatorProfile?: GraphqlCreatorProfile | null
  mediaContent?: {
    previewImage?: {
      downloadableUri?: string | null
    } | null
    downloadableUri?: string | null
  } | null
  sparklineData?: GraphqlSparkPoint[] | null
}

interface GraphqlEdge {
  cursor: string
  node: GraphqlExploreNode
}

interface GraphqlResponse {
  data?: {
    exploreList?: {
      edges?: GraphqlEdge[]
    }
  }
}

export interface CreatorToken {
  id: string
  address: string
  chainId: number
  name: string
  symbol: string
  marketCap: number
  marketCapDelta24h: number
  volume24h: number
  totalVolume: number
  uniqueHolders: number
  createdAt: string | null
  creatorHandle: string | null
  imageUrl: string | null
  sparkline: Array<{ time: number; value: number }>
}

export interface CreatorsPage {
  items: CreatorToken[]
  nextCursor: string | null
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeSparkline(
  points: GraphqlSparkPoint[] | null | undefined,
): Array<{ time: number; value: number }> {
  if (!points || points.length === 0) return []
  return points
    .map((point) => {
      const time = Date.parse(point.timestamp)
      const value = Number(point.closePrice)
      if (!Number.isFinite(time) || !Number.isFinite(value)) return null
      return { time, value }
    })
    .filter((point): point is { time: number; value: number } => point !== null)
}

function mapNodeToToken(node: GraphqlExploreNode): CreatorToken {
  return {
    id: node.id,
    address: node.address,
    chainId: node.chainId,
    name: node.name,
    symbol: node.symbol ?? node.name,
    marketCap: toNumber(node.marketCap),
    marketCapDelta24h: toNumber(node.marketCapDelta24h),
    volume24h: toNumber(node.volume24h),
    totalVolume: toNumber(node.totalVolume),
    uniqueHolders: Math.max(0, Math.trunc(toNumber(node.uniqueHolders))),
    createdAt: node.createdAt ?? null,
    creatorHandle: node.creatorProfile?.handle ?? null,
    imageUrl:
      node.creatorProfile?.avatar?.downloadableUri ??
      node.mediaContent?.previewImage?.downloadableUri ??
      node.mediaContent?.downloadableUri ??
      null,
    sparkline: normalizeSparkline(node.sparklineData),
  }
}

const fetchCreatorsPageServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { first?: number; after?: string | null }) => input)
  .handler(async ({ data }): Promise<CreatorsPage> => {
    const first = Math.max(1, Math.min(data.first ?? 20, 50))
    const after = data.after ?? null

    const operationName = after
      ? 'TrendingAllPaginationQuery'
      : 'TrendingAllQuery'
    const hash = after ? PAGINATION_TRENDING_HASH : INITIAL_TRENDING_HASH

    const payload = {
      hash,
      operationName,
      variables: {
        listType: TRENDING_LIST_TYPE,
        first,
        after,
      },
    }

    const response = await fetch(ZORA_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Zora API error: ${response.status}`)
    }

    const json = (await response.json()) as GraphqlResponse
    const edges = json.data?.exploreList?.edges ?? []
    const baseEdges = edges.filter((edge) => edge.node.chainId === 8453)
    const items = baseEdges.map((edge) => mapNodeToToken(edge.node))
    const lastEdge = edges.at(-1)

    return {
      items,
      nextCursor: lastEdge?.cursor ?? null,
    }
  })

export async function fetchCreatorsPage(params?: {
  first?: number
  after?: string | null
}): Promise<CreatorsPage> {
  return fetchCreatorsPageServer({ data: params ?? {} })
}
