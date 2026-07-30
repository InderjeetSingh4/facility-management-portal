'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  const { isOffline } = useNetworkStatus()

  if (!isOffline) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center gap-2 rounded-full border border-border bg-zinc-800/80 px-4 py-1.5 text-xs font-medium text-secondary shadow-xl backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
        <WifiOff size={13} className="text-muted" />
        <span>Offline – Changes will sync automatically.</span>
      </div>
    </div>
  )
}
