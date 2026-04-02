import React from 'react'
import type { MemeToken } from '@/lib/geckoterminal'
import { MemeGridCard } from '@/components/dashboard/cards'
import { CardGrid, LoadingPanel } from '@/components/dashboard/shared'

interface MemeGridProps {
  memes: Array<MemeToken>
  isLoading: boolean
}

export function MemeGrid({ memes, isLoading }: MemeGridProps) {
  if (isLoading) {
    return <LoadingPanel label="Loading memes..." />
  }
  if (memes.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        No meme tokens found
      </div>
    )
  }
  return (
    <CardGrid>
      {memes.map((meme) => (
        <MemeGridCard key={meme.id} meme={meme} />
      ))}
    </CardGrid>
  )
}
