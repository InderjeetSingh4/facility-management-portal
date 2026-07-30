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
  let badgeCls = 'bg-slate-100 text-slate-600 border border-slate-200'
  if (roleLower === 'super admin') badgeCls = 'bg-indigo-50 text-indigo-700 border border-indigo-200'
  else if (roleLower === 'local admin') badgeCls = 'bg-blue-50 text-blue-700 border border-blue-200'
  else if (roleLower === 'housekeeper' || roleLower === 'cleaner') badgeCls = 'bg-amber-50 text-amber-700 border border-amber-200'

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
        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white pl-2 pr-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] text-white dark:bg-[#3b82f6] dark:text-white text-[11px] font-bold flex-shrink-0">
          {initial}
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">{fullName}</span>
        <ChevronDown size={14} className="text-muted flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-3xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50">

          {/* User Info */}
          <div className="p-5 border-b border-slate-100">
            <p className="truncate text-base font-semibold text-slate-900 tracking-tight">{fullName}</p>
            <p className="truncate text-xs text-muted mt-0.5">{email}</p>
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
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {notifsEnabled
                  ? <Bell size={18} className="text-indigo-600" />
                  : <BellOff size={18} className="text-muted" />
                }
                Push Notifications
              </div>
              <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${notifsEnabled ? 'bg-[#3b82f6]' : 'bg-slate-200'}`}>
                <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${notifsEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          <div className="h-px bg-slate-100 mx-2" />

          {/* Sign Out */}
          <div className="p-2">
            <form action={logOut} onSubmit={() => setIsOpen(false)}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 active:scale-[0.98]"
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
