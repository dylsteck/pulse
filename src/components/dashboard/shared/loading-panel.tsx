export function LoadingPanel(_props?: { label?: string }) {
  return (
    <div
      className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3"
      style={{ gridAutoRows: '200px' }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card p-3 sm:p-4"
        >
          {/* header: icon + name + badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-7 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
          </div>
          {/* price */}
          <div className="mt-3 h-6 w-28 animate-pulse rounded bg-muted" />
          {/* volume */}
          <div className="mt-auto pt-3">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
