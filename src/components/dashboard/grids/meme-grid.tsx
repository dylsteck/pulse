import React from 'react'
import type { MemeToken } from '@/lib/geckoterminal'
import type { GridFilters } from '@/lib/grid-filter-types'
import { MemeGridCard } from '@/components/dashboard/cards'
import { CardGrid, LoadingPanel } from '@/components/dashboard/shared'
import { sortMemesForGrid } from '@/lib/grid-sorts'

interface MemeGridProps {
  memes: Array<MemeToken>
  isLoading: boolean
  filters: GridFilters
}

export function MemeGrid({ memes, isLoading, filters }: MemeGridProps) {
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
  const prepared = sortMemesForGrid(memes, filters.sort)
  return (
    <CardGrid>
      {prepared.map((meme) => (
        <MemeGridCard key={meme.id} meme={meme} />
      ))}
    </CardGrid>
  )
}
