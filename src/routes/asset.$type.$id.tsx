import { createFileRoute } from '@tanstack/react-router'
import { AssetDetailPage } from '@/components/asset-detail-page'

export const Route = createFileRoute('/asset/$type/$id')({
  component: AssetDetailRoute,
})

function AssetDetailRoute() {
  const { type, id } = Route.useParams()
  return <AssetDetailPage type={type} id={id} />
}
