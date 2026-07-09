'use client'

import { useEffect, useState } from 'react'

export default function IOSInstallPrompt() {
  const [isIOSBrowser, setIsIOSBrowser] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Detect if device is iOS (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)

    // Detect if app is running in standalone mode (installed PWA)
    // iOS Safari uses window.navigator.standalone, modern browsers use matchMedia
    const isStandalone = 
      // @ts-ignore (Apple specific non-standard property)
      window.navigator.standalone ||
      window.matchMedia('(display-mode: standalone)').matches

    if (isIOS && !isStandalone) {
      setIsIOSBrowser(true)
      setIsVisible(true)
    }
  }, [])

  if (!isVisible || !isIOSBrowser) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] mx-4 mb-6 rounded-2xl border border-white/40 bg-white/60 p-4 shadow-xl backdrop-blur-xl dark:border-neutral-700/60 dark:bg-neutral-900/60">
      <div className="flex items-start justify-between">
        <div className="pr-4 text-sm font-medium text-neutral-800 dark:text-neutral-200">
          <p className="font-bold text-neutral-900 dark:text-white">Enable Live Notifications</p>
          <p className="mt-1">
            For live push notifications, tap the <span className="font-bold">Share</span> icon at the bottom of your browser and select <span className="font-bold">"Add to Home Screen"</span>.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-500 transition hover:bg-black/10 dark:bg-white/10 dark:text-neutral-400 dark:hover:bg-white/20"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
