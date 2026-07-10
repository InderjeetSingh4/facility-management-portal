'use client'

import { useState, useEffect } from 'react'
import { saveSubscription } from '@/app/portal/actions'

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function EnableNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true)
        })
      })
    }
  }, [])

  const subscribeButtonOnClick = async () => {
    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
        
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicVapidKey) {
          console.warn('VAPID public key not configured in .env.local')
          alert('Push notifications are not configured on the server.')
          setIsLoading(false)
          return
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        })

        const res = await saveSubscription(JSON.parse(JSON.stringify(subscription)))
        if (res.error) throw new Error(res.error)

        setIsSubscribed(true)
      } else {
        alert('Permission for notifications was denied.')
      }
    } catch (error) {
      console.error('Error enabling push notifications', error)
      alert('Failed to enable push notifications.')
    }
    setIsLoading(false)
  }

  if (!isSupported) return null

  return (
    <button
      onClick={subscribeButtonOnClick}
      disabled={isSubscribed || isLoading}
      className={`inline-flex h-fit items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
        isSubscribed 
          ? 'bg-white/40 border border-white/60 text-neutral-500 backdrop-blur-md' 
          : 'bg-neutral-900 text-white hover:bg-neutral-800'
      }`}
    >
      <span>🔔</span>
      {isLoading ? 'Enabling...' : isSubscribed ? 'Alerts Enabled' : 'Enable Alerts'}
    </button>
  )
}
