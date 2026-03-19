import React from 'react'
import type { MemeToken } from '@/lib/geckoterminal'
import { MemeGridCard } from '@/components/dashboard/cards'
import { LoadingPanel } from '@/components/dashboard/shared'

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
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {memes.map((meme) => (
        <MemeGridCard key={meme.id} meme={meme} />
      ))}
    </div>
  )
}
