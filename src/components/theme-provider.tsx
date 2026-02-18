import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // Read persisted preference on mount
  useEffect(() => {
    const stored = localStorage.getItem('pulse-theme') as Theme | null
    if (stored === 'dark' || stored === 'light') setTheme(stored)
  }, [])

  // Apply class to <html> and persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('pulse-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
