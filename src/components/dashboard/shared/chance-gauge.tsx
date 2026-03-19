export function ChanceGauge({
  percent,
  size = 56,
}: {
  percent: number
  size?: number
}) {
  const stroke = 5
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2

  const startAngle = 220
  const endAngle = 500
  const totalArc = endAngle - startAngle
  const fillAngle = startAngle + (totalArc * Math.min(percent, 100)) / 100

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180
  const arcPoint = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  })

  const bgStart = arcPoint(startAngle)
  const bgEnd = arcPoint(endAngle)
  const bgLargeArc = totalArc > 180 ? 1 : 0
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${bgLargeArc} 1 ${bgEnd.x} ${bgEnd.y}`

  const fillEnd = arcPoint(fillAngle)
  const fillSweep = fillAngle - startAngle
  const fillLargeArc = fillSweep > 180 ? 1 : 0
  const fillPath =
    fillSweep > 0.5
      ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${fillLargeArc} 1 ${fillEnd.x} ${fillEnd.y}`
      : ''

  const color = percent >= 50 ? '#22c55e' : '#ef4444'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-muted-foreground/25"
        />
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold leading-none text-foreground">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  )
}
