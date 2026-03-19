import type { Song } from '@/lib/tortoise'
import { useAudioDetail, useTortoiseSongs } from '@/hooks/use-tortoise-songs'
import { FadeImage } from '@/components/ui/fade-image'
import { imageUrl } from '@/lib/tortoise'

export function MusicDetail({ id }: { id: string }) {
  const { data: songsData, isLoading, isError } = useTortoiseSongs()
  const song = songsData?.songs.find((s) => s.id === id)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex gap-4">
          <div className="size-24 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load song
      </div>
    )
  }

  if (!song) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Song not found
      </div>
    )
  }
  return <MusicDetailContent song={song} />
}

function MusicDetailContent({ song }: { song: Song }) {
  const { data: audio, isLoading } = useAudioDetail(song.url_slug)
  const coverUrl = song.image_ipfs_cid ? imageUrl(song.image_ipfs_cid) : null
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex gap-4">
        {coverUrl ? (
          <FadeImage
            src={coverUrl}
            alt=""
            wrapperClassName="size-24 shrink-0 rounded-lg"
            className="size-24 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium">{song.title}</h1>
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
        </div>
      </div>
    </div>
  )
}
