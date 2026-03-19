'use client'

import React from 'react'
import {
  ArrowUpDownIcon,
  CoinsIcon,
  FlameIcon,
  MusicIcon,
  SparklesIcon,
  TrendingUpIcon,
} from 'lucide-react'
import type { Market, Token } from '@/lib/types'
import type { CreatorToken } from '@/lib/zora/service'
import type { MemeToken } from '@/lib/geckoterminal'
import type { Song } from '@/lib/tortoise'
import type { CommandSearchItem } from '@/hooks/use-command-search'
import { FadeImage } from '@/components/ui/fade-image'
import { imageUrl } from '@/lib/tortoise'

export const ASSET_ICONS: Record<
  CommandSearchItem['type'],
  React.ComponentType<{ className?: string }>
> = {
  tokens: CoinsIcon,
  markets: TrendingUpIcon,
  creators: SparklesIcon,
  music: MusicIcon,
  perps: ArrowUpDownIcon,
  memes: FlameIcon,
}

export function AssetIcon({ item }: { item: CommandSearchItem }) {
  const raw = item.raw
  const rounded =
    item.type === 'tokens' || item.type === 'memes'
      ? 'rounded-full'
      : 'rounded-sm'
  if (item.type === 'tokens') {
    const token = raw as Token
    if (token.imageUrl) {
      return (
        <FadeImage
          src={token.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  if (item.type === 'markets') {
    const market = raw as Market
    if (market.imageUrl) {
      return (
        <FadeImage
          src={market.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  if (item.type === 'creators') {
    const creator = raw as CreatorToken
    if (creator.imageUrl) {
      return (
        <FadeImage
          src={creator.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  if (item.type === 'music') {
    const song = raw as Song
    return (
      <FadeImage
        src={imageUrl(song.image_ipfs_cid)}
        alt=""
        wrapperClassName={`size-6 shrink-0 ${rounded}`}
        className="size-full object-cover"
      />
    )
  }
  if (item.type === 'memes') {
    const meme = raw as MemeToken
    if (meme.imageUrl) {
      return (
        <FadeImage
          src={meme.imageUrl}
          alt=""
          wrapperClassName={`size-6 shrink-0 ${rounded}`}
          className="size-full object-cover"
        />
      )
    }
  }
  const Icon = ASSET_ICONS[item.type]
  return <Icon className="size-5 shrink-0 text-muted-foreground" />
}
