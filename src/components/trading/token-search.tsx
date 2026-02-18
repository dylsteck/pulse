import { useState } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'
import { TOKENS, type Token } from '@/lib/mock/tokens'

interface TokenSearchProps {
  selectedToken: Token
  onSelect: (token: Token) => void
}

export function TokenSearch({ selectedToken, onSelect }: TokenSearchProps) {
  const [inputValue, setInputValue] = useState('')

  const filtered = TOKENS.filter((t) => {
    const q = inputValue.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      t.symbol.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q)
    )
  })

  return (
    <Combobox
      value={selectedToken.id}
      onValueChange={(val) => {
        const t = TOKENS.find((t) => t.id === val)
        if (t) onSelect(t)
      }}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <ComboboxInput
        className="w-full"
        placeholder="Search token by name or contract address..."
        showClear
      />
      <ComboboxContent>
        <ComboboxList>
          {filtered.map((token) => (
            <ComboboxItem key={token.id} value={token.id}>
              <span className="font-medium">{token.symbol}</span>
              <span className="text-muted-foreground ml-1">{token.name}</span>
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No tokens found</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
