import type { ReactNode } from 'react'

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3"
      style={{ gridAutoRows: '200px' }}
    >
      {children}
    </div>
  )
}
