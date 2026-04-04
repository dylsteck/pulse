import { createFileRoute, Navigate } from '@tanstack/react-router'
import { PortfolioPage } from '@/components/portfolio/portfolio-page'
import { useAuth } from '@/components/providers/auth-provider'
import { cdpProjectId } from '@/lib/wagmi'

export const Route = createFileRoute('/portfolio')({
  component: PortfolioRoute,
})

function PortfolioRoute() {
  if (!cdpProjectId) {
    return <Navigate to="/" replace />
  }
  return <PortfolioAuthGate />
}

function PortfolioAuthGate() {
  const { isSignedIn } = useAuth()
  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }
  return <PortfolioPage />
}
