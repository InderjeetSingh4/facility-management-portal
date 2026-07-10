'use client'

import { useState } from 'react'
import { BellRing, X } from 'lucide-react'
import { setNotificationPreference } from '@/app/portal/actions'

interface NotificationPrimerProps {
  onDismiss: () => void
}

export default function NotificationPrimer({ onDismiss }: NotificationPrimerProps) {
  const [isRequesting, setIsRequesting] = useState(false)

  const handleEnable = async () => {
    setIsRequesting(true)
    try {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      await setNotificationPreference(granted)
      if (!granted) {
        alert('Permission for notifications was denied.')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    } finally {
      setIsRequesting(false)
      onDismiss()
    }
  }

  const handleNotNow = async () => {
    await setNotificationPreference(false)
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={handleNotNow}
          className="absolute right-4 top-4 rounded-full p-2 text-secondary hover:bg-surface-solid/50 hover:text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent mx-auto">
          <BellRing size={32} />
        </div>

        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold tracking-tight text-primary">Never miss an update</h2>
          <p className="mb-8 text-sm text-secondary">
            Get notified instantly about new tasks, complaints, and important facility notices.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleEnable}
            disabled={isRequesting}
            className="w-full rounded-2xl bg-accent px-4 py-3.5 text-sm font-bold text-accent-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isRequesting ? 'Enabling...' : 'Enable Notifications'}
          </button>
          
          <button
            onClick={handleNotNow}
            disabled={isRequesting}
            className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm font-bold text-secondary transition-all hover:bg-surface-solid/50 active:scale-[0.98] disabled:opacity-50"
          >
            Not Now
          </button>
        </div>

      </div>
    </div>
  )
}
