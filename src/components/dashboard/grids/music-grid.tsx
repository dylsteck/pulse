import React from 'react'
import type { Song } from '@/lib/tortoise'
import { MusicGridCard } from '@/components/dashboard/cards'
import { LoadingPanel } from '@/components/dashboard/shared'

interface MusicGridProps {
  songs: Array<Song>
  isLoading: boolean
}

export function MusicGrid({ songs, isLoading }: MusicGridProps) {
  if (isLoading) {
    return <LoadingPanel label="Loading music..." />
  }
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        No songs found
      </div>
    )
  }
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {songs.map((song) => (
        <MusicGridCard key={song.id} song={song} />
      ))}
    </div>
  )
}
