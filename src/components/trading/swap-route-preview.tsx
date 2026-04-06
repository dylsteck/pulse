import type { SwapRoutePreview } from '@/hooks/use-swap'

function formatRouteAmount(raw: string): string {
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) return raw
  if (n > 0 && n < 0.000001) return n.toExponential(2)
  return n.toFixed(6).replace(/\.?0+$/, '')
}

export function SwapRoutePreviewLine({
  preview,
  receiveSymbol,
}: {
  preview: SwapRoutePreview
  receiveSymbol: string
}) {
  return (
    <p className="text-xs text-muted-foreground tabular-nums">
      Route: {preview.provider} · ~{formatRouteAmount(preview.estimatedOut)}{' '}
      {receiveSymbol}
    </p>
  )
}
