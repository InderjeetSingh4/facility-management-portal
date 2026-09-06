'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Bell, BellOff, ChevronDown } from 'lucide-react'
import { logOut } from '@/app/auth/actions'
import { setNotificationPreference } from '@/app/portal/actions'

interface UserDropdownProps {
  email: string
  fullName: string
  formattedRole: string
  initial: string
  notificationsEnabled: boolean
}

export default function UserDropdown({ email, fullName, formattedRole, initial, notificationsEnabled: initialNotifs }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifsEnabled, setNotifsEnabled] = useState(initialNotifs)
  const [isUpdating, setIsUpdating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const roleLower = formattedRole.toLowerCase()
  let badgeCls = 'bg-muted text-muted-foreground border border-border dark:bg-badge-bg dark:text-badge-text dark:border-badge-border'
  if (roleLower === 'super admin') badgeCls = 'bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border'
  else if (roleLower === 'local admin') badgeCls = 'bg-primary/5 text-primary border border-primary/10 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border'
  else if (roleLower === 'housekeeper' || roleLower === 'cleaner') badgeCls = 'bg-muted text-foreground border border-border dark:bg-badge-bg dark:text-badge-text dark:border-badge-border'

  const toggleNotifications = async () => {
    setIsUpdating(true)
    try {
      if (!notifsEnabled) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          await setNotificationPreference(true)
          setNotifsEnabled(true)
        } else {
          alert('Permission for notifications was denied by your browser.')
          await setNotificationPreference(false)
          setNotifsEnabled(false)
        }
      } else {
        await setNotificationPreference(false)
        setNotifsEnabled(false)
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border bg-card pl-2 pr-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all active:scale-[0.98]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary dark:bg-transparent dark:bg-[image:var(--avatar-bg)] text-primary-foreground dark:text-foreground text-[11px] font-bold flex-shrink-0">
          {initial}
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">{fullName}</span>
        <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-3xl border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50">

          {/* User Info */}
          <div className="p-5 border-b border-border">
            <p className="truncate text-base font-semibold text-foreground tracking-tight">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground mt-0.5">{email}</p>
            <div className="mt-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${badgeCls}`}>
                {formattedRole}
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className="p-2">
            <button
              onClick={toggleNotifications}
              disabled={isUpdating}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {notifsEnabled
                  ? <Bell size={18} className="text-primary" />
                  : <BellOff size={18} className="text-muted-foreground" />
                }
                Push Notifications
              </div>
              <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${notifsEnabled ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-card shadow ring-0 transition duration-200 ${notifsEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          <div className="h-px bg-border mx-2" />

          {/* Sign Out */}
          <div className="p-2">
            <form action={logOut} onSubmit={() => setIsOpen(false)}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-danger transition-all hover:bg-danger-bg hover:text-danger active:scale-[0.98]"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
