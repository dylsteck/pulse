'use client'

import { PreviewCard } from '@base-ui/react/preview-card'

import { cn } from '@/lib/utils'

function HoverCard({ ...props }: PreviewCard.Root.Props) {
  return <PreviewCard.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ className, ...props }: PreviewCard.Trigger.Props) {
  return (
    <PreviewCard.Trigger
      data-slot="hover-card-trigger"
      className={cn(className)}
      {...props}
    />
  )
}

function HoverCardPortal({ ...props }: PreviewCard.Portal.Props) {
  return <PreviewCard.Portal data-slot="hover-card-portal" {...props} />
}

function HoverCardPositioner({
  className,
  ...props
}: PreviewCard.Positioner.Props) {
  return (
    <PreviewCard.Positioner
      data-slot="hover-card-positioner"
      positionMethod="fixed"
      className={cn(
        // Entire floating layer must sit above sticky header (z-30); z on Popup alone does not escape the positioner’s stacking context.
        'z-50',
        className,
      )}
      {...props}
    />
  )
}

function HoverCardContent({ className, ...props }: PreviewCard.Popup.Props) {
  return (
    <PreviewCard.Popup
      data-slot="hover-card-content"
      className={cn(
        'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 origin-(--transform-origin) outline-none',
        className,
      )}
      {...props}
    />
  )
}

export {
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardPositioner,
  HoverCardTrigger,
}
