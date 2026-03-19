import React from 'react'
import { Link } from '@tanstack/react-router'
import type { Song } from '@/lib/tortoise'
import { imageUrl } from '@/lib/tortoise'
import { FadeImage } from '@/components/ui/fade-image'

export const MusicGridCard = React.memo(function MusicGridCard({
  song,
}: {
  song: Song
}) {
  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'music', id: song.id }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start gap-3">
        <FadeImage
          src={imageUrl(song.image_ipfs_cid)}
          alt=""
          wrapperClassName="size-12 shrink-0 rounded-lg"
          className="size-12 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="truncate text-sm font-medium leading-snug">
            {song.title}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {song.artist}
          </div>
        </div>
      </div>
      <div className="mt-auto pt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Collections</span>
        <span className="text-right tabular-nums">{song.collection_count}</span>
        <span className="text-muted-foreground">Type</span>
        <span className="text-right capitalize">{song.media_type}</span>
      </div>
    </Link>
  )
})
