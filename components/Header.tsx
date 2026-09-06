'use client'

import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:px-8 bg-card/70 backdrop-blur-xl border-b border-border transition-colors duration-300">
      <div className="flex items-center">
        {/* Placeholder for optional breadcrumbs or logo */}
        <span className="md:hidden text-sm font-semibold tracking-tight text-foreground">FacilityOS</span>
      </div>
      <ThemeToggle />
    </header>
  )
}
