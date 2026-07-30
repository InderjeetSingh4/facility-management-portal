'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-full border border-neutral-200/60 bg-white/40" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative p-2 rounded-full border border-neutral-200/60 bg-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/80"
    >
      <Sun
        className={`h-4 w-4 text-neutral-600 transition-all duration-300 ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
        style={{ position: isDark ? 'absolute' : 'relative' }}
      />
      <Moon
        className={`h-4 w-4 text-neutral-400 transition-all duration-300 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
        style={{ position: isDark ? 'relative' : 'absolute' }}
      />
    </button>
  )
}
