import { makeRequest } from '@/lib/request'

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
  sparklineData?: Array<GraphqlSparkPoint> | null
}

interface GraphqlEdge {
  cursor: string
  node: GraphqlExploreNode
}

interface GraphqlResponse {
  data?: {
    exploreList?: {
      edges?: Array<GraphqlEdge>
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
  items: Array<CreatorToken>
  nextCursor: string | null
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeSparkline(
  points: Array<GraphqlSparkPoint> | null | undefined,
): Array<{ time: number; value: number }> {
  if (!points || points.length === 0) return []
  return points
    .map((point) => {
      const timeMs = Date.parse(point.timestamp)
      const value = Number(point.closePrice)
      if (!Number.isFinite(timeMs) || !Number.isFinite(value)) return null
      return { time: Math.floor(timeMs / 1000), value }
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

export function transformCreatorsPage(json: GraphqlResponse): CreatorsPage {
  const edges = json.data?.exploreList?.edges ?? []
  const baseEdges = edges.filter((edge) => edge.node.chainId === 8453)
  const items = baseEdges.map((edge) => mapNodeToToken(edge.node))
  const lastEdge = edges.at(-1)

  return {
    items,
    nextCursor: lastEdge?.cursor ?? null,
  }
}

export async function fetchCreatorsPage(params?: {
  first?: number
  after?: string | null
}): Promise<CreatorsPage> {
  const first = Math.max(1, Math.min(params?.first ?? 20, 50))
  const after = params?.after ?? null

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

  return transformCreatorsPage(
    await makeRequest<GraphqlResponse>('/api/zora', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
}
