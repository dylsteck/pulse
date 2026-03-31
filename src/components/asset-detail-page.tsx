import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import {
  MarketDetail,
  MemeDetail,
  PerpDetail,
  TokenDetail,
} from '@/components/asset-detail'

const ASSET_TYPES = ['tokens', 'markets', 'perps', 'memes'] as const

export function AssetDetailPage({ type, id }: { type: string; id: string }) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-[calc(100vh-37px)] w-full max-w-7xl flex-col px-3 py-4 sm:px-6">
      <button
        type="button"
        onClick={() =>
          navigate({
            to: '/',
            search: type === 'tokens' ? {} : { type },
          })
        }
        className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Back"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {type === 'tokens' && <TokenDetail id={id} />}
      {type === 'markets' && <MarketDetail id={id} />}
      {type === 'perps' && <PerpDetail id={id} />}
      {type === 'memes' && <MemeDetail id={id} />}
      {!ASSET_TYPES.includes(type as (typeof ASSET_TYPES)[number]) && (
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Unknown asset type
        </div>
      )}
    </div>
  )
}
