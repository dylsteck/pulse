import { makeRequest } from '@/lib/request'

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
  songs: Array<Song>
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

export async function fetchTrendingSongs(
  timeframe: '30d' = '30d',
  page = 1,
  limit = 20,
): Promise<TrendingResponse> {
  const params = new URLSearchParams({
    timeframe,
    page: String(page),
    limit: String(limit),
  })
  return makeRequest<TrendingResponse>(`/api/tortoise/songs/trending?${params}`)
}

export async function fetchAudioDetail(slug: string): Promise<AudioDetail> {
  return makeRequest<AudioDetail>(
    `/api/tortoise/getAudio?slug=${encodeURIComponent(slug)}`,
  )
}
