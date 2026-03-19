import type { Market } from '@/lib/types'

export const HERO_CHART_PADDING = {
  top: 8,
  right: 24,
  bottom: 0,
  left: 0,
} as const

export type CarouselTokenItem = {
  kind: 'token'
  id: string
  symbol: string
  name: string
  price: number
  change: number
  data: Array<{ time: number; value: number }>
  imageUrl?: string
}

export type CarouselMemeItem = {
  kind: 'meme'
  id: string
  symbol: string
  name: string
  price: number
  change: number
  data: Array<{ time: number; value: number }>
  imageUrl?: string
  liquidity: number
}

export type CarouselMarketItem = {
  kind: 'market'
  market: Market
}

export type CarouselItem =
  | CarouselTokenItem
  | CarouselMemeItem
  | CarouselMarketItem

export type SidebarItem =
  | {
      kind: 'token'
      id: string
      type: 'tokens'
      label: string
      sublabel?: string
      change: number
      volume: number
      price?: number
      imageUrl?: string
    }
  | {
      kind: 'meme'
      id: string
      type: 'memes'
      label: string
      sublabel?: string
      change: number
      volume: number
      price?: number
      imageUrl?: string
    }
  | {
      kind: 'market'
      id: string
      type: 'markets'
      label: string
      change: number
      volume: number
      imageUrl?: string
    }
