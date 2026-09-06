'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div 
        className="w-[52px] h-[28px] rounded-full shrink-0 bg-muted" 
      />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDark}
      className={`relative flex items-center px-[2px] w-[52px] h-[28px] rounded-full focus:outline-none shrink-0 outline-none transition-all duration-300 ${isDark ? 'bg-primary dark:bg-transparent dark:bg-[var(--toggle-active-bg)] border-transparent dark:border dark:border-[var(--toggle-border)]' : 'bg-muted border border-transparent'}`}
    >
      <div
        className={`flex items-center justify-center w-[22px] h-[22px] rounded-full shadow-sm bg-primary-foreground transition-transform duration-300 ${isDark ? 'translate-x-[24px]' : 'translate-x-0'}`}
      >
        {isDark ? (
          <Moon size={13} className="text-primary" strokeWidth={2.5} />
        ) : (
          <Sun size={13} className="text-muted-foreground" strokeWidth={2.5} />
        )}
      </div>
    </button>
  )
}
