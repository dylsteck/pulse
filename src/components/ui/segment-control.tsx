import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  badge?: number
}

interface SegmentControlProps<T extends string> {
  options: Array<SegmentOption<T>>
  value: T
  onValueChange: (value: T) => void
  className?: string
}

export function SegmentControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
}: SegmentControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className={cn(
        'inline-flex rounded-md border border-border bg-muted/50 p-0.5',
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${opt.value}`}
            id={`tab-${opt.value}`}
            type="button"
            onClick={() => onValueChange(opt.value)}
            className={cn(
              'relative flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
            {opt.badge != null && (
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground',
                )}
              >
                {opt.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
