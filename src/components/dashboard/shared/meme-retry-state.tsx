export function MemeRetryState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
      <span>Having trouble loading. Try again in a moment.</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80"
      >
        Retry
      </button>
    </div>
  )
}
