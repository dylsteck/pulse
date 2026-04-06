import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Shared styles with the Liveline timeframe segmented control (pill track + segment look). */
export const pulsePillButtonClassName = cn(
  'h-auto gap-1.5 rounded-full border-none shadow-none',
  'bg-black/[0.02] px-2.5 py-[3px] text-[11px] font-semibold leading-4',
  'text-[rgba(0,0,0,0.55)] hover:bg-black/[0.04] dark:bg-white/[0.04] dark:text-foreground dark:hover:bg-white/[0.07]',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

/** Small pill action — same visual language as 15m / 1h / 6h / 1d on asset charts. */
export function PulsePillButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      className={cn(pulsePillButtonClassName, className)}
      {...props}
    />
  )
}
