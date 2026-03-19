import React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Song } from '@/lib/tortoise'
import { useAudioDetail } from '@/hooks/use-tortoise-songs'
import { imageUrl } from '@/lib/tortoise'
import { FadeImage } from '@/components/ui/fade-image'

export function InlineSongDetail({ song }: { song: Song }) {
  const { data: audio, isLoading } = useAudioDetail(song.url_slug)
  const coverUrl = imageUrl(song.image_ipfs_cid)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex gap-4">
        <FadeImage
          src={coverUrl}
          alt=""
          wrapperClassName="size-24 shrink-0 rounded-lg"
          className="size-24 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">{song.title}</h3>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{song.collection_count} collections</span>
            {audio && <span>{audio.price} ETH</span>}
          </div>
          {isLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
          ) : audio?.url ? (
            <div className="mt-3">
              <audio controls src={audio.url} className="w-full max-w-md" />
            </div>
          ) : null}
          <a
            href={`https://tortoise.studio/song/${song.url_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
          >
            Collect on Tortoise
          </a>
          <Link
            to="/asset/$type/$id"
            params={{ type: 'music', id: song.id }}
            className="mt-2 ml-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View full page
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
