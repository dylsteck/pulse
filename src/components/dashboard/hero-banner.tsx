import { useEffect, useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Liveline } from 'liveline'
import { useTheme } from '@/components/theme-provider'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'

const ACCENT_COLOR = '#0066ff'

interface Asset {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  data: { time: number; value: number }[]
  imageUrl?: string
}

export function HeroBanner() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { data: tokens } = useLiveTokens(10)

  const assets: Asset[] = useMemo(() => {
    if (!tokens) return []
    return tokens.map((t) => ({
      id: t.id,
      symbol: t.symbol,
      name: t.name,
      price: t.price,
      change: t.change24h,
      data: t.priceHistory,
      imageUrl: t.imageUrl,
    }))
  }, [tokens])

  const [currentIndex, setCurrentIndex] = useState(0)

  const readyCount = assets.filter((a) => a.data.length >= 2).length

  useEffect(() => {
    if (readyCount === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % readyCount)
    }, 5000)
    return () => clearInterval(interval)
  }, [readyCount])

  const readyAssets = assets.filter((a) => a.data.length >= 2)
  const currentAsset = readyAssets[currentIndex % readyAssets.length]

  if (!currentAsset) return null

  return (
    <div className="relative mb-4 w-full overflow-hidden">
      <div className="flex items-start gap-6 px-2 py-2 sm:px-0 sm:py-3">
        <div className="flex-1 pt-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Stay on the <span style={{ color: ACCENT_COLOR }}>pulse</span> of
            crypto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every market, every asset, every chain. One interface.
          </p>
        </div>

        <Link
          to="/asset/$type/$id"
          params={{ type: 'tokens', id: currentAsset.id }}
          className="hidden w-1/2 max-w-lg sm:block"
        >
          <AssetCard
            key={currentAsset.id}
            asset={currentAsset}
            isDark={isDark}
          />
        </Link>
      </div>
    </div>
  )
}

function AssetCard({ asset, isDark }: { asset: Asset; isDark: boolean }) {
  const isPositive = asset.change >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'

  const chartData = useMemo(() => {
    if (asset.data.length >= 2) return asset.data
    const now = Date.now() / 1000
    const val = asset.data[0]?.value ?? asset.price
    return [
      { time: now - 3600, value: val },
      { time: now, value: asset.price },
    ]
  }, [asset.data, asset.price])

  return (
    <div className="flex cursor-pointer flex-col gap-1 animate-in fade-in duration-500">
      <div className="flex items-baseline gap-2">
        {asset.imageUrl && (
          <FadeImage
            src={asset.imageUrl}
            alt=""
            wrapperClassName="size-6 shrink-0 rounded-full"
            className="size-6 rounded-full object-cover"
          />
        )}
        <span className="text-sm font-bold text-foreground">
          {asset.symbol}
        </span>
        <span
          className={cn(
            'text-xs tabular-nums',
            isPositive ? 'text-green-500' : 'text-red-500',
          )}
        >
          {isPositive ? '+' : ''}
          {asset.change.toFixed(2)}%
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          $
          {asset.price < 1
            ? asset.price.toFixed(4)
            : asset.price.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
        </span>
      </div>

      <div className="h-[60px] w-full">
        <Liveline
          data={chartData}
          value={asset.price}
          color={color}
          theme={isDark ? 'dark' : 'light'}
          badge={false}
          grid={false}
          scrub={false}
          pulse
          fill
          momentum
          padding={{ top: 4, right: 16, bottom: 0, left: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}
