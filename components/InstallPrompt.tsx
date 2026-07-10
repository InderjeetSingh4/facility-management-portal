'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if app is already installed/standalone
    const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true
    setIsStandalone(isAppStandalone)

    if (isAppStandalone) return

    // Check for iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
    
    if (isIosDevice && isSafari) {
      setIsIOS(true)
      const hasDismissed = localStorage.getItem('ios-install-dismissed')
      if (!hasDismissed) {
        setShowPrompt(true)
      }
    }

    // Listen for standard PWA install prompt (Chrome/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (isIOS) {
      localStorage.setItem('ios-install-dismissed', 'true')
    }
  }

  if (!showPrompt) return null

  // iOS Safari specific prompt
  if (isIOS) {
    return (
      <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="relative rounded-2xl border border-white/60 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/20 dark:bg-black/50">
          <button 
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-full p-1 text-secondary transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Download size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-primary">Install App</h3>
              <p className="mt-1 text-xs text-secondary flex items-center gap-1 flex-wrap">
                Tap <Share size={14} className="inline" /> then &quot;Add to Home Screen&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard PWA prompt (Chrome/Android)
  return (
    <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/50 py-2 pl-4 pr-2 shadow-xl backdrop-blur-xl dark:border-white/20 dark:bg-black/50">
        <span className="text-sm font-semibold text-primary">Install Facility Portal</span>
        <button 
          onClick={handleInstallClick}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-foreground transition-transform hover:scale-105 active:scale-95"
        >
          <Download size={14} />
          Install
        </button>
        <button 
          onClick={handleDismiss}
          className="rounded-full p-1.5 text-secondary hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
