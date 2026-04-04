export interface MarketTradeOrderSummaryProps {
  avgPricePct: string
  estimatedShares: string
  potentialPayout: string
}

export function MarketTradeOrderSummary({
  avgPricePct,
  estimatedShares,
  potentialPayout,
}: MarketTradeOrderSummaryProps) {
  return (
    <div className="space-y-1.5 rounded-lg bg-muted p-3">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Avg price</span>
        <span>{avgPricePct}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Est. shares</span>
        <span>{estimatedShares}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Potential payout</span>
        <span className="font-medium text-[#22c55e]">${potentialPayout}</span>
      </div>
    </div>
  )
}
