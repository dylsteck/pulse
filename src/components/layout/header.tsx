import { Link } from '@tanstack/react-router'
import { MoonIcon, SearchIcon, SunIcon } from 'lucide-react'
import { openCommandPalette } from '@/components/command-palette'
import { useTheme } from '@/components/theme-provider'
import { WalletButton } from '@/components/wallet/wallet-button'
import { Button } from '@/components/ui/button'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
          Pulse
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={openCommandPalette}
            aria-label="Search"
          >
            <SearchIcon />
          </Button>
          <WalletButton />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>
    </header>
  )
}
