'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, CheckSquare, AlertCircle,
  Calendar, Users, BarChart, Building2, Settings, HelpCircle, LogOut, ClipboardCheck
} from "lucide-react"
import { useEffect, useState } from "react"
import ThemeToggle from "./ThemeToggle"
import UserDropdown from "./UserDropdown"
import NativePushHandler from "./NativePushHandler"
import OfflineIndicator from "./OfflineIndicator"
import NotificationPrimer from "./NotificationPrimer"
import Logo from "./Logo"

interface PortalShellProps {
  children: React.ReactNode
  email: string
  fullName: string
  formattedRole: string
  initial: string
  isAdmin: boolean
  isExecutive?: boolean
  role?: string
  notificationsEnabled: boolean | null
}

export default function PortalShell({
  children,
  email,
  fullName,
  formattedRole,
  initial,
  isAdmin,
  isExecutive = false,
  role,
  notificationsEnabled: initialNotificationsEnabled,
}: PortalShellProps) {
  const [mounted, setMounted] = useState(false)
  const [showPrimer, setShowPrimer] = useState(initialNotificationsEnabled === null)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  // Dynamic Navigation Configuration
  const mainNavItems = isExecutive
    ? [
        { name: "Overview", href: "/portal", icon: LayoutDashboard },
        { name: "Tasks", href: "/portal/tasks", icon: CheckSquare },
        { name: "Complaints", href: "/portal/complaints", icon: AlertCircle },
        { name: "Conference", href: "/portal/conference", icon: Calendar },
      ]
    : [
        { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
        { name: "Tasks", href: "/portal/tasks", icon: CheckSquare },
        { name: "Complaints", href: "/portal/complaints", icon: AlertCircle },
        { name: "Conference", href: "/portal/conference", icon: Calendar },
      ]

  const secondaryNavSection = isExecutive
    ? {
        title: "Reporting",
        items: [
          { name: "Staff Directory", href: "/portal/staff", icon: Users },
          { name: "Attendance", href: "/portal/attendance", icon: ClipboardCheck },
          { name: "Analytics", href: "/portal/analytics", icon: BarChart },
        ]
      }
    : isAdmin
    ? {
        title: "Management",
        items: [
          { name: "Manage Staff", href: "/portal/staff", icon: Users },
          { name: "Attendance", href: "/portal/attendance", icon: ClipboardCheck },
          { name: "Analytics", href: "/portal/analytics", icon: BarChart },
        ]
      }
    : null

  return (
    <div className="min-h-screen bg-background dark:bg-transparent text-foreground transition-colors duration-500 flex relative overflow-hidden font-sans">
      
      {/* ── Ambient Radial Blur Background ── */}
      <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vh] rounded-full bg-black/5 dark:hidden blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vh] rounded-full bg-black/5 dark:hidden blur-[120px] pointer-events-none z-0" />

      {/* ─────────────────────────────────────────
          DESKTOP SIDEBAR
      ───────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed top-5 left-5 bottom-5 w-56 bg-card border-[0.5px] border-border z-40 flex-shrink-0 justify-between rounded-[28px] shadow-surface py-5 px-3.5">

        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {/* Brand */}
          <Link href="/portal" className="flex items-center px-1 pb-5 border-b border-border flex-shrink-0 group">
            <Logo size="md" showSubtitle />
          </Link>

          {/* Nav */}
          <nav className="flex flex-col flex-1 gap-1.5 mt-4">

            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Main
            </p>

            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={
                    isActive
                      ? "flex items-center gap-3 px-4 py-3 bg-primary dark:bg-transparent dark:bg-[var(--nav-active-bg)] dark:border dark:border-[var(--nav-active-border)] text-primary-foreground rounded-full transition-all group shadow-sm"
                      : "flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent rounded-full transition-all group"
                  }
                >
                  <item.icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? "text-primary-foreground dark:text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span className={`text-sm font-medium ${isActive ? "text-primary-foreground dark:text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}

            {secondaryNavSection && (
              <>
                <p className="mb-1.5 mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {secondaryNavSection.title}
                </p>
                {secondaryNavSection.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={
                        isActive
                          ? "flex items-center gap-3 px-4 py-3 bg-primary dark:bg-transparent dark:bg-[var(--nav-active-bg)] dark:border dark:border-[var(--nav-active-border)] text-primary-foreground rounded-full transition-all group shadow-sm"
                          : "flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent rounded-full transition-all group"
                      }
                    >
                      <item.icon
                        size={18}
                        className={`flex-shrink-0 transition-colors ${
                          isActive ? "text-primary-foreground dark:text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span className={`text-sm font-medium ${isActive ? "text-primary-foreground dark:text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {item.name}
                      </span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        </div>

        {/* Premium User Profile Footer */}
        <div className="mt-auto pt-4 border-t border-border flex-shrink-0">
          <div className="bg-background border-none shadow-none rounded-full py-2 px-3 flex items-center justify-between hover:bg-muted transition-all cursor-pointer group">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary dark:bg-[image:var(--avatar-bg)] text-primary-foreground dark:text-foreground font-bold text-xs flex-shrink-0 shadow-sm">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{fullName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{formattedRole}</p>
              </div>
            </div>
            <LogOut size={15} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────
          MAIN CONTENT AREA
      ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:pl-[264px] w-full min-w-0">

        {/* HEADER BAR — floating pill */}
        <div className="sticky top-2.5 z-30 px-4 md:px-6 pointer-events-none">
          <header className="pointer-events-auto flex h-14 items-center justify-between bg-card/60 backdrop-blur-3xl border border-border rounded-full px-4 md:px-5 shadow-surface transition-all duration-300">
            <Link href="/portal" className="flex items-center md:hidden group">
              <Logo size="sm" />
            </Link>

            <div className="hidden md:block" />

            <div className="flex items-center gap-2.5">
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
        <main className="flex-1 pb-24 md:pb-10 pt-5 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ─────────────────────────────────────────
          MOBILE BOTTOM NAV
      ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
        <nav className="flex items-center justify-around p-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
