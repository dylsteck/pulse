import {
  MarketDetail,
  MemeDetail,
  PerpDetail,
  TokenDetail,
} from '@/components/asset-detail'

const ASSET_TYPES = ['tokens', 'markets', 'perps', 'memes'] as const

export function AssetDetailPage({ type, id }: { type: string; id: string }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-37px)] w-full max-w-7xl flex-col overflow-x-hidden px-3 py-4 sm:px-6">
      {type === 'tokens' && <TokenDetail key={id} id={id} />}
      {type === 'markets' && <MarketDetail key={id} id={id} />}
      {type === 'perps' && <PerpDetail key={id} id={id} />}
      {type === 'memes' && <MemeDetail key={id} id={id} />}
      {!ASSET_TYPES.includes(type as (typeof ASSET_TYPES)[number]) && (
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Unknown asset type
        </div>
      )}
    </div>
  )
}
