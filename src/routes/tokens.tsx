import { useCallback } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { ArrowLeftIcon } from 'lucide-react'
import { TokenListPage } from '@/components/trading/token-list'
import { LivelineChart } from '@/components/trading/liveline-chart'
import { TradeForm } from '@/components/trading/trade-form'
import { useTokenPrice } from '@/hooks/use-token-price'
import { TOKENS, DEFAULT_TOKEN } from '@/lib/mock/tokens'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/tokens')({
  validateSearch: searchSchema,
  component: TokensPage,
})

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.001) return price.toFixed(6)
  return price.toFixed(8)
}

function TokensPage() {
  const search = useSearch({ from: '/tokens' })
  const navigate = useNavigate()

  const handleOpen = useCallback(
    (id: string) => navigate({ to: '/tokens', search: { token: id } }),
    [navigate],
  )

  if (search.token) {
    const token = TOKENS.find((t) => t.id === search.token) ?? DEFAULT_TOKEN
    return (
      <TokenDetailView
        tokenId={token.id}
        onBack={() => navigate({ to: '/tokens' })}
      />
    )
  }

  return <TokenListPage onOpen={handleOpen} />
}

function TokenDetailView({ tokenId, onBack }: { tokenId: string; onBack: () => void }) {
  const token = TOKENS.find((t) => t.id === tokenId) ?? DEFAULT_TOKEN
  const { price, history } = useTokenPrice(token)
  const changeSign = token.change24h >= 0 ? '+' : ''

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        All tokens
      </button>

      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <span className="text-xl font-semibold">{token.name}</span>
          <span className="ml-2 font-mono text-sm text-muted-foreground">{token.symbol}</span>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-semibold tabular-nums">
            ${formatPrice(price)}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {changeSign}{token.change24h.toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      <div className="mb-6">
        <LivelineChart data={history} value={price} />
      </div>

      <TradeForm token={token} currentPrice={price} />
    </main>
  )
}
