'use client'

import { useEffect } from 'react'
import { initNativePushNotifications } from '@/lib/notifications/nativePush'

export default function NativePushHandler() {
  useEffect(() => {
    initNativePushNotifications()
  }, [])

  return null
}
