import { createServerFn } from '@tanstack/react-start'

const BASE_URL = 'https://tortoise.studio'

export interface Song {
  id: string
  title: string
  artist: string
  artist_fid: number
  artist_username: string | null
  url_slug: string
  contract_song_id: string
  collection_count: number
  audio_ipfs_cid: string
  image_ipfs_cid: string
  created_at: string
  media_type: 'song' | 'pod'
}

export interface AudioDetail {
  id: string
  url: string
  title: string
  artist: string
  imageUrl: string | null
  artistFid: number
  walletAddress: string
  txHash: string
  price: string
  urlSlug: string
  onchainData: {
    title: string
    artist: string
    price: string
    maxSupply: string
    currentSupply: string
    exists: boolean
    songId: string
    frameUrl: string | null
    urlSlug: string
  }
}

export interface TrendingResponse {
  songs: Song[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  timeframe?: string
}

export function imageUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`
}

export function audioUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`
}

const fetchTrendingSongsServer = createServerFn({ method: 'POST' })
  .inputValidator(
    (input: { timeframe: '30d'; page: number; limit: number }) => input,
  )
  .handler(async ({ data }): Promise<TrendingResponse> => {
    const params = new URLSearchParams({
      timeframe: data.timeframe,
      page: String(data.page),
      limit: String(data.limit),
    })
    const res = await fetch(`${BASE_URL}/api/songs/trending?${params}`)
    if (!res.ok) throw new Error(`Tortoise API error: ${res.status}`)
    return res.json()
  })

const fetchAudioDetailServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<AudioDetail> => {
    const res = await fetch(
      `${BASE_URL}/api/getAudio?slug=${encodeURIComponent(data.slug)}`,
    )
    if (!res.ok) throw new Error(`Tortoise API error: ${res.status}`)
    return res.json()
  })

export async function fetchTrendingSongs(
  timeframe: '30d' = '30d',
  page = 1,
  limit = 20,
): Promise<TrendingResponse> {
  return fetchTrendingSongsServer({ data: { timeframe, page, limit } })
}

export async function fetchAudioDetail(slug: string): Promise<AudioDetail> {
  return fetchAudioDetailServer({ data: { slug } })
}
