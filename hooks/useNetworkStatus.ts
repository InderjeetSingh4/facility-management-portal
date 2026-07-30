'use client'

import { useEffect, useState } from 'react'
import { Network, type ConnectionStatus } from '@capacitor/network'
import { Capacitor } from '@capacitor/core'

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    let handler: any = null

    async function initNetworkListener() {
      try {
        if (Capacitor.isNativePlatform()) {
          const status: ConnectionStatus = await Network.getStatus()
          setIsOffline(!status.connected)
          setConnectionType(status.connectionType)

          handler = await Network.addListener('networkStatusChange', (status) => {
            setIsOffline(!status.connected)
            setConnectionType(status.connectionType)
          })
        } else {
          // Web fallback
          setIsOffline(!navigator.onLine)
          setConnectionType(navigator.onLine ? 'wifi' : 'none')

          const handleOnline = () => {
            setIsOffline(false)
            setConnectionType('wifi')
          }
          const handleOffline = () => {
            setIsOffline(true)
            setConnectionType('none')
          }

          window.addEventListener('online', handleOnline)
          window.addEventListener('offline', handleOffline)

          return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
          }
        }
      } catch (error) {
        console.error('Error setting up network listener:', error)
      }
    }

    initNetworkListener()

    return () => {
      if (handler && typeof handler.remove === 'function') {
        handler.remove()
      }
    }
  }, [])

  return { isOffline, connectionType }
}
