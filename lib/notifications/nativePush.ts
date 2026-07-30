import { Capacitor } from '@capacitor/core'
import { PushNotifications, type PermissionStatus, type PushNotificationSchema, type Token } from '@capacitor/push-notifications'
import { saveDeviceToken } from '@/app/portal/actions'
import { toast } from 'sonner'

export async function initNativePushNotifications() {
  // Only execute on native iOS or Android apps
  if (!Capacitor.isNativePlatform()) {
    console.log('[NativePush] Skipping native push setup: Not running on iOS or Android.')
    return
  }

  try {
    // 1. Check existing permission status
    let permStatus: PermissionStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[NativePush] Notification permission was denied by user.')
      return
    }

    // 2. Register with FCM / APNS
    await PushNotifications.register()

    // 3. Remove previous listeners to avoid duplicates
    await PushNotifications.removeAllListeners()

    // 4. Token Registration Listener
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('[NativePush] Obtained native device token:', token.value)
      const res = await saveDeviceToken(token.value)
      if (res.success) {
        console.log('[NativePush] Device token successfully registered in Supabase profile.')
      } else {
        console.error('[NativePush] Failed to register device token in Supabase:', res.error)
      }
    })

    // 5. Registration Error Listener
    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('[NativePush] Push registration error:', error)
    })

    // 6. Foreground Notification Listener (Glassmorphic Toast UI)
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('[NativePush] Received foreground notification:', notification)

        toast(notification.title || 'New Notification', {
          description: notification.body || '',
          duration: 5000,
          className:
            '!rounded-2xl !border !border-white/20 !bg-surface-solid/80 !backdrop-blur-xl !shadow-xl !text-primary font-medium',
        })
      }
    )

    // 7. Notification Clicked / Action Listener
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[NativePush] Notification action performed:', action)
      const data = action.notification.data
      if (data?.url) {
        window.location.href = data.url
      }
    })
  } catch (error) {
    console.error('[NativePush] Initialization error:', error)
  }
}
