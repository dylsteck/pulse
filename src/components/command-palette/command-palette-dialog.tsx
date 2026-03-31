'use client'

import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { GithubIcon } from 'lucide-react'
import { AssetIcon } from './asset-icon'
import { ChartPreview } from './chart-preview'
import type { CommandSearchItem } from '@/hooks/use-command-search'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useCommandSearch } from '@/hooks/use-command-search'
import { cn } from '@/lib/utils'
import { encodeAssetId } from '@/lib/caip19'

const GROUP_HEADINGS: Record<CommandSearchItem['type'], string> = {
  tokens: 'Tokens',
  markets: 'Markets',
  creators: 'Creators',
  music: 'Music',
  perps: 'Perps',
  memes: 'Memes',
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState<string>('')
  const navigate = useNavigate()
  const { items } = useCommandSearch()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    document.addEventListener('keydown', down)
    document.addEventListener('open-command-palette', onOpen)
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('open-command-palette', onOpen)
    }
  }, [])

  React.useEffect(() => {
    if (!open) setSelectedValue('')
  }, [open])

  const selectedItem = React.useMemo(
    () => items.find((i) => i.value === selectedValue),
    [items, selectedValue],
  )

  const itemsByType = React.useMemo(() => {
    const map = new Map<CommandSearchItem['type'], Array<CommandSearchItem>>()
    for (const item of items) {
      const list = map.get(item.type) ?? []
      list.push(item)
      map.set(item.type, list)
    }
    return map
  }, [items])

  const handleSelect = React.useCallback(
    (value: string) => {
      if (value === 'github') {
        window.open('https://github.com/dylsteck/pulse', '_blank')
        setOpen(false)
        return
      }
      const item = items.find((i) => i.value === value)
      if (item) {
        navigate({
          to: '/asset/$identifier',
          params: {
            identifier: encodeAssetId(
              item.type as CommandSearchItem['type'],
              item.id,
            ),
          },
        })
        setOpen(false)
      }
    },
    [items, navigate],
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search tokens, markets, creators, music, perps, and memes"
      showCloseButton={false}
      className="max-w-xl"
    >
      <Command
        value={selectedValue}
        onValueChange={setSelectedValue}
        className="rounded-lg border-0"
      >
        <div className="relative border-b border-border/50">
          <CommandInput
            placeholder="Search tokens, markets, creators..."
            className="pr-12 placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <CommandList
            className={cn(
              'max-h-[min(20rem,60vh)] flex-1 overflow-y-auto',
              selectedItem?.hasChart && 'pb-28',
            )}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            {(
              [
                'tokens',
                'markets',
                'creators',
                'music',
                'perps',
                'memes',
              ] as const
            ).map((type) => {
              const typeItems = itemsByType.get(type) ?? []
              if (typeItems.length === 0) return null
              return (
                <CommandGroup key={type} heading={GROUP_HEADINGS[type]}>
                  {typeItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      keywords={[item.label, item.subtitle].filter(Boolean)}
                      onSelect={() => handleSelect(item.value)}
                      className="gap-2.5"
                    >
                      <AssetIcon item={item} />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.label}
                      </span>
                      {item.subtitle && (
                        <span className="truncate text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
            <CommandSeparator />
            <CommandGroup heading="Quick actions">
              <CommandItem
                value="github"
                onSelect={() => handleSelect('github')}
              >
                <GithubIcon className="size-3.5 shrink-0" />
                <span>Open GitHub</span>
                <CommandShortcut>⌘G</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          {selectedItem?.hasChart && <ChartPreview item={selectedItem} />}
        </div>
      </Command>
    </CommandDialog>
  )
}
