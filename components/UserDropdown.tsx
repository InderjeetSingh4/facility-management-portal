'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Bell, BellOff } from 'lucide-react'
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
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
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

  // Map the formattedRole to badge styling
  let badgeCls = 'bg-surface-solid/50 text-secondary'
  const roleLower = formattedRole.toLowerCase()
  if (roleLower === 'super admin') badgeCls = 'bg-accent/20 text-accent'
  else if (roleLower === 'local admin') badgeCls = 'bg-primary/20 text-primary'
  else if (roleLower === 'housekeeper' || roleLower === 'cleaner') badgeCls = 'bg-warning/20 text-warning'
  else if (roleLower === 'employee') badgeCls = 'bg-secondary/20 text-secondary'

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
        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold transition-transform active:scale-95 shadow-sm hover:shadow-md ring-2 ring-transparent focus:outline-none focus:ring-accent/50"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-3xl border border-border bg-surface p-2 shadow-lg shadow-black/10 backdrop-blur-xl dark:shadow-2xl dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-200">
          
          {/* User Info Block */}
          <div className="p-4 flex flex-col gap-1">
            <p className="truncate text-base font-bold text-primary">{fullName}</p>
            <p className="truncate text-sm text-secondary">{email}</p>
            <div className="mt-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${badgeCls}`}>
                {formattedRole}
              </span>
            </div>
          </div>

          <div className="my-1 h-px bg-border w-full" />

          {/* Settings List */}
          <div className="p-1">
            <button
              onClick={toggleNotifications}
              disabled={isUpdating}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-secondary transition-all hover:bg-surface-solid/50 hover:text-primary active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {notifsEnabled ? <Bell size={18} className="text-accent" /> : <BellOff size={18} />}
                Push Notifications
              </div>
              <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${notifsEnabled ? 'bg-accent' : 'bg-surface-solid border border-border'}`}>
                <span className="sr-only">Toggle notifications</span>
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${notifsEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </div>
            </button>
          </div>

          <div className="my-1 h-px bg-border w-full" />

          {/* Action List */}
          <div className="p-1">
            <form action={logOut} onSubmit={() => setIsOpen(false)}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-danger transition-all hover:bg-danger/10 hover:text-danger active:scale-[0.98]"
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
