import { createFileRoute, redirect } from '@tanstack/react-router'
import { decodeAssetId } from '@/lib/caip19'
import { AssetDetailPage } from '@/components/asset-detail-page'

export const Route = createFileRoute('/asset/$identifier')({
  component: AssetDetailRoute,
  beforeLoad: ({ params }) => {
    // Decode the URL-encoded identifier
    const raw = decodeURIComponent(params.identifier)
    const parsed = decodeAssetId(raw)

    if (!parsed) {
      throw redirect({ to: '/' })
    }
  },
})

function AssetDetailRoute() {
  const { identifier } = Route.useParams()
  const raw = decodeURIComponent(identifier)
  const parsed = decodeAssetId(raw)

  if (!parsed) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-37px)] w-full max-w-7xl flex-col items-center justify-center px-3 py-4 sm:px-6">
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Invalid asset identifier
        </div>
      </div>
    )
  }

  return <AssetDetailPage type={parsed.type} id={parsed.identifier.reference} />
}
