import React from 'react'
import type { CreatorToken } from '@/lib/zora/service'
import { CreatorGridCard } from '@/components/dashboard/cards'
import { LoadingPanel } from '@/components/dashboard/shared'

interface CreatorsGridProps {
  creators: Array<CreatorToken>
  isLoading: boolean
}

export function CreatorsGrid({ creators, isLoading }: CreatorsGridProps) {
  if (isLoading) {
    return <LoadingPanel label="Loading creators..." />
  }
  if (creators.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        No tokens found
      </div>
    )
  }

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {creators.map((creator) => (
        <CreatorGridCard key={creator.id} creator={creator} />
      ))}
    </div>
  )
}
