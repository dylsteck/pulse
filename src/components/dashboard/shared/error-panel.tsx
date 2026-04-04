import { AlertCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

function humanizeErrorMessage(raw: string): string {
  const t = raw.trim()
  if (t === 'Failed to fetch') {
    return 'We could not reach the server. Check your connection and try again.'
  }
  if (/networkerror|load failed|fetch/i.test(t) && t.length < 80) {
    return 'Something went wrong while loading. Please try again.'
  }
  return t
}

export function ErrorPanel({
  label,
  onRetry,
}: {
  label: string
  /** When set, shows a Retry control (pass query `refetch` from React Query). */
  onRetry?: () => void
}) {
  const message = humanizeErrorMessage(label)

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 border-y border-border bg-muted/15 px-4 py-16 sm:rounded-xl sm:border-x"
    >
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <AlertCircleIcon
          className="size-9 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
