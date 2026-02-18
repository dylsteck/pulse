import { SunIcon, MoonIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { WalletButton } from '@/components/wallet/wallet-button'
import { useWallet } from '@/hooks/use-wallet'
import { useTheme } from '@/components/theme-provider'

export function Header() {
  const wallet = useWallet()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-6xl items-center px-4 sm:px-6">
        <span className="text-sm font-semibold text-foreground">pulse</span>

        <nav className="ml-8 flex items-center gap-0">
          <NavTab to="/tokens">Tokens</NavTab>
          <NavTab to="/markets">Markets</NavTab>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === 'dark' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>
          <WalletButton wallet={wallet} />
        </div>
      </div>
    </header>
  )
}

function NavTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      activeProps={{
        className:
          'relative px-4 py-3 text-sm font-medium text-foreground after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-foreground after:rounded-full',
      }}
    >
      {children}
    </Link>
  )
}
