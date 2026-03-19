import React from 'react'
import { LayoutGridIcon, Rows3Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewLayout = 'list' | 'grid'

interface LayoutToggleProps {
  layout: ViewLayout
  onLayoutChange: (layout: ViewLayout) => void
}

export function LayoutToggle({ layout, onLayoutChange }: LayoutToggleProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onLayoutChange('list')}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md transition-colors',
          layout === 'list'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="List view"
        title="List view"
      >
        <Rows3Icon className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onLayoutChange('grid')}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md transition-colors',
          layout === 'grid'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="Grid view"
        title="Grid view"
      >
        <LayoutGridIcon className="size-3.5" />
      </button>
    </div>
  )
}
