import React from 'react'
import type { Song } from '@/lib/tortoise'
import { imageUrl } from '@/lib/tortoise'
import { InlineSongDetail } from '@/components/dashboard/inline-charts'
import { LoadingPanel } from '@/components/dashboard/shared'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'

interface MusicTableProps {
  songs: Array<Song>
  isLoading: boolean
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  onRowClick: (index: number) => void
}

export function MusicTable({
  songs,
  isLoading,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: MusicTableProps) {
  const gridCols = 'grid-cols-[2fr_1.5fr_0.7fr_0.6fr_0.8fr]'
  if (isLoading) {
    return <LoadingPanel label="Loading music..." />
  }
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
        No songs found
      </div>
    )
  }
  return (
    <div className="w-full border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'sticky top-[4.5rem] z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
          gridCols,
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Title
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Artist
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Collections
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Type
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Created
        </span>
      </div>

      <div className="overflow-hidden">
        {songs.map((song, i) => {
          const selected = i === selectedIndex
          const expanded = expandedId === song.id
          return (
            <div key={song.id} className="border-b border-border last:border-0">
              <button
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                type="button"
                onClick={() => onRowClick(i)}
                className={cn(
                  'grid w-full items-center gap-4 border-l-2 px-3 py-2 text-left transition-colors sm:px-6',
                  gridCols,
                  selected
                    ? 'border-l-foreground bg-accent'
                    : 'border-l-transparent hover:bg-accent/40',
                )}
                aria-selected={selected}
                aria-expanded={expanded}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FadeImage
                    src={imageUrl(song.image_ipfs_cid)}
                    alt=""
                    wrapperClassName="size-7 shrink-0 rounded-sm"
                    className="size-7 rounded-sm object-cover"
                  />
                  <span className="truncate text-sm">{song.title}</span>
                </div>
                <span className="truncate text-sm text-muted-foreground">
                  {song.artist}
                </span>
                <span className="text-right text-sm tabular-nums">
                  {song.collection_count}
                </span>
                <span className="text-right text-xs text-muted-foreground capitalize">
                  {song.media_type}
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatDate(song.created_at)}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                  <InlineSongDetail song={song} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
