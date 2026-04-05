import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: 'light', toggleTheme: () => {} })

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(theme: Theme) {
  // Disable all transitions/animations so the theme swap is instant
  const css = document.createElement('style')
  css.textContent =
    '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }'
  document.head.appendChild(css)

  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('pulse-theme', theme)

  // Keep the override through the next paint, then remove
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      css.remove()
    })
  })
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('pulse-theme') as Theme | null
    return stored === 'dark' || stored === 'light' ? stored : getSystemTheme()
  })

  // Apply on mount (SSR → client hydration)
  useEffect(() => {
    applyTheme(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle() {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      applyTheme(next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
