'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logOut } from '@/app/auth/actions'

interface SidebarProps {
  email: string
  formattedRole: string
  initial: string
  isAdmin: boolean
}

export default function Sidebar({ email, formattedRole, initial, isAdmin }: SidebarProps) {
  const pathname = usePathname()

  const mainLinks = [
    { name: 'Dashboard', href: '/portal', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /> },
    { name: 'My Tasks', href: '/portal/tasks', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
    { name: 'Complaints', href: '/portal/complaints', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> },
    { name: 'Conference', href: '/portal/conference', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  ]

  const adminLinks = [
    { name: 'Manage Staff', href: '/portal/staff', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { name: 'Analytics', href: '/portal/analytics', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
  ]

  const NavLink = ({ name, href, icon }: { name: string; href: string; icon: React.ReactNode }) => {
    const isActive = pathname === href
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
          isActive 
            ? 'bg-surface-solid/50 text-primary' 
            : 'text-secondary hover:bg-surface-solid/30 hover:text-primary'
        }`}
      >
        <svg className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          {icon}
        </svg>
        {name}
      </Link>
    )
  }

  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-4 left-4 z-40 bg-surface backdrop-blur-2xl border border-border shadow-sm rounded-3xl transition-colors duration-300">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
        <div>
          {/* User Profile Card */}
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-border bg-surface-solid/20 p-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-lg font-semibold text-accent-foreground">
              {initial}
            </div>
            <div className="overflow-hidden">
              <h2 className="truncate text-sm font-semibold tracking-tight text-primary">{email.split('@')[0]}</h2>
              <p className="truncate text-xs font-medium text-secondary">{formattedRole}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">Main</div>
            {mainLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}

            {isAdmin && (
              <>
                <div className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-widest text-muted">Management</div>
                {adminLinks.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </>
            )}
          </nav>
        </div>

        {/* Bottom: Sign Out */}
        <div className="mt-8 space-y-3">
          <form action={logOut}>
            <button type="submit" className="w-full rounded-xl border border-border bg-surface-solid/20 px-4 py-2.5 text-sm font-medium text-secondary transition-all duration-300 hover:bg-surface-solid/40 hover:text-primary">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
