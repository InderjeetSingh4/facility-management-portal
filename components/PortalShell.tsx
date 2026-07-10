'use client'

import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon, LayoutDashboard, CheckSquare, AlertCircle, Calendar, LogOut, Users, BarChart } from "lucide-react"
import { useEffect, useState } from "react"
import UserDropdown from "./UserDropdown"

interface PortalShellProps {
  children: React.ReactNode
  email: string
  fullName: string
  formattedRole: string
  initial: string
  isAdmin: boolean
}

export default function PortalShell({ children, email, fullName, formattedRole, initial, isAdmin }: PortalShellProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
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

  const isCleaner = formattedRole.toLowerCase() === 'housekeeper' || formattedRole.toLowerCase() === 'cleaner'

  return (
    <div className="min-h-screen bg-background text-primary transition-colors duration-300 flex">
      
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden flex-col justify-between md:flex fixed m-4 h-[calc(100vh-2rem)] w-64 xl:w-72 rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/20 z-40">
        <nav className="flex flex-col gap-2 p-4 mt-4">
          <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted">Main</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "text-secondary hover:bg-border/50"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-accent" : ""} />
                {item.name}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="mb-2 mt-6 px-2 text-xs font-medium uppercase tracking-wider text-muted">Management</div>
              {adminItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-accent/15 text-accent"
                        : "text-secondary hover:bg-border/50"
                    }`}
                  >
                    <item.icon size={18} className={isActive ? "text-accent" : ""} />
                    {item.name}
                  </Link>
                )
              })}
            </>
          )}
        </nav>
        
        <div className="p-4 mb-2">
          {/* Sign Out moved to UserDropdown in Topbar */}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:pl-72 xl:pl-80 w-full min-w-0">
        
        {/* TOP HEADER */}
        <header className="sticky top-4 z-50 flex h-16 items-center justify-between mx-4 md:mr-4 md:ml-0 rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/20 px-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold tracking-tight text-primary">Facility Portal</span>
          </div>
          
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full p-2 transition-all text-secondary hover:bg-border/50"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <UserDropdown 
              email={email}
              fullName={fullName}
              formattedRole={formattedRole}
              initial={initial}
            />
          </div>
        </header>

        <main className="flex-1 pb-24 md:pb-8 mt-4">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 xl:px-14 2xl:px-16">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV (Hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-surface-solid pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-around px-2 pb-4 pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                  isActive
                    ? "text-accent"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <item.icon size={24} className={isActive ? "text-accent" : ""} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

    </div>
  )
}
