import { Link } from '@tanstack/react-router'
import { MoonIcon, SunIcon } from 'lucide-react'
import { WalletButton } from '@/components/wallet/wallet-button'
import { useWallet } from '@/hooks/use-wallet'
import { useTheme } from '@/components/theme-provider'

export function Header() {
  const wallet = useWallet()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-background pt-1.5">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-sm font-semibold text-foreground">
          Pulse
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === 'dark' ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
          </button>
          <WalletButton wallet={wallet} />
        </div>
      </div>
    </header>
  )
}
