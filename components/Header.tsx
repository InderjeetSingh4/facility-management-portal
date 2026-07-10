'use client'

import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:px-8 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      <div className="flex items-center">
        {/* Placeholder for optional breadcrumbs or logo */}
        <span className="md:hidden text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Portal</span>
      </div>
      <ThemeToggle />
    </header>
  )
}
