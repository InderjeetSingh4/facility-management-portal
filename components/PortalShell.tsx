'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, CheckSquare, AlertCircle,
  Calendar, Users, BarChart, Building2
} from "lucide-react"
import { useEffect, useState } from "react"
import ThemeToggle from "./ThemeToggle"
import UserDropdown from "./UserDropdown"
import NativePushHandler from "./NativePushHandler"
import OfflineIndicator from "./OfflineIndicator"
import NotificationPrimer from "./NotificationPrimer"

interface PortalShellProps {
  children: React.ReactNode
  email: string
  fullName: string
  formattedRole: string
  initial: string
  isAdmin: boolean
  notificationsEnabled: boolean | null
}

export default function PortalShell({
  children,
  email,
  fullName,
  formattedRole,
  initial,
  isAdmin,
  notificationsEnabled: initialNotificationsEnabled,
}: PortalShellProps) {
  const [mounted, setMounted] = useState(false)
  const [showPrimer, setShowPrimer] = useState(initialNotificationsEnabled === null)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  const navItems = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "Tasks", href: "/portal/tasks", icon: CheckSquare },
    { name: "Complaints", href: "/portal/complaints", icon: AlertCircle },
    { name: "Conference", href: "/portal/conference", icon: Calendar },
  ]

  const adminItems = [
    { name: "Manage Staff", href: "/portal/staff", icon: Users },
    { name: "Analytics", href: "/portal/analytics", icon: BarChart },
  ]

  return (
    <div className="min-h-screen bg-background text-primary transition-colors duration-500 flex relative overflow-hidden font-sans">
      
      {/* ── Ambient Radial Blur Background ── */}
      <div className="fixed -top-[20%] -left-[10%] w-[60vw] h-[60vh] rounded-full bg-accent/10 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[40%] -right-[10%] w-[50vw] h-[50vh] rounded-full bg-accent/5 blur-[140px] pointer-events-none z-0" />

      {/* ─────────────────────────────────────────
          DESKTOP SIDEBAR
      ───────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white dark:bg-bg-page border-r border-black/5 dark:border-border-hairline z-40 flex-shrink-0">

        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-black/5 dark:border-border-hairline">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3b82f6] text-white dark:bg-bg-surface-raised dark:text-accent dark:border dark:border-border-hairline flex-shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-lg font-heading font-bold !text-black dark:!text-text-primary leading-tight tracking-wide">Facility Portal</p>
            <p className="text-sm !text-black/60 dark:!text-text-muted leading-tight">Management Suite</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 gap-1 px-4 py-6 overflow-y-auto">

          <p className="mt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wider !text-black/50 dark:!text-neutral-400">
            Main
          </p>

          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-[10px] px-4 py-2.5 mx-2 text-base font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 dark:bg-white/15 !text-white dark:!text-white shadow-sm"
                    : "!text-black/70 dark:!text-text-muted hover:bg-black/5 dark:hover:bg-bg-surface-raised hover:!text-black dark:hover:!text-text-primary"
                }`}
              >
                <item.icon size={20} className={`flex-shrink-0 ${!isActive ? "!text-black/50 dark:!text-text-muted group-hover:!text-black dark:group-hover:!text-text-primary" : "!text-white dark:!text-white"}`} />
                {item.name}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider !text-black/50 dark:!text-neutral-400">
                Management
              </p>
              {adminItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-[10px] px-4 py-2.5 mx-2 text-base font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-slate-900 dark:bg-white/15 !text-white dark:!text-white shadow-sm"
                        : "!text-black/70 dark:!text-text-muted hover:bg-black/5 dark:hover:bg-bg-surface-raised hover:!text-black dark:hover:!text-text-primary"
                    }`}
                  >
                    <item.icon size={20} className={`flex-shrink-0 ${!isActive ? "!text-black/50 dark:!text-text-muted group-hover:!text-black dark:group-hover:!text-text-primary" : "!text-white dark:!text-white"}`} />
                    {item.name}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        <div className="p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/50 dark:bg-bg-surface-raised px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6] dark:bg-bg-surface dark:text-accent text-sm font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <p className="truncate text-base font-bold !text-black dark:!text-text-primary">{fullName}</p>
              <p className="truncate text-xs !text-black/60 dark:!text-text-muted">{formattedRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────
          MAIN CONTENT AREA
      ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:pl-[260px] w-full min-w-0">

        {/* HEADER BAR — floating pill */}
        <div className="sticky top-3 z-30 px-4 md:px-8 pointer-events-none">
          <header className="pointer-events-auto flex h-16 items-center justify-between bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-full px-4 md:px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all duration-300">
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3b82f6] text-white dark:bg-[#3b82f6] dark:text-white">
                <Building2 size={16} />
              </div>
              <span className="text-sm font-semibold text-primary">Facility Portal</span>
            </div>

            <div className="hidden md:block" />

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserDropdown
                email={email}
                fullName={fullName}
                formattedRole={formattedRole}
                initial={initial}
                notificationsEnabled={initialNotificationsEnabled === true}
              />
            </div>
          </header>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 pb-28 md:pb-12 pt-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[1440px] mx-auto px-5 md:px-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ─────────────────────────────────────────
          MOBILE BOTTOM NAV
      ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-bg-surface border-t border-black/5 dark:border-border-hairline pb-[env(safe-area-inset-bottom)]">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-all duration-200 ${
                  isActive ? "text-[#3b82f6] dark:text-accent" : "text-black/50 dark:text-text-muted dark:hover:text-text-primary"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <item.icon size={20} />
                  <span className="text-[10px] font-semibold tracking-wide">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      <NativePushHandler />
      <OfflineIndicator />

      {mounted && showPrimer && (
        <NotificationPrimer onDismiss={() => setShowPrimer(false)} />
      )}
    </div>
  )
}
