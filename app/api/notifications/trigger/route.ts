import { NextResponse, type NextRequest } from 'next/server'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { createClient } from '@supabase/supabase-js'

// Initialize Firebase Admin SDK (singleton pattern)
function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]!
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin credentials not fully configured in environment variables.')
    return null
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plantId, targetRoles, title, notificationBody, data } = body

    if (!plantId || !targetRoles || !Array.isArray(targetRoles) || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required parameters: plantId, targetRoles (array), title, notificationBody' },
        { status: 400 }
      )
    }

    // Direct Supabase admin query using service role or standard anon client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch device tokens for specified roles within the facility
    const { data: users, error } = await supabase
      .from('users')
      .select('device_token, role')
      .eq('plant_id', plantId)
      .in('role', targetRoles)
      .not('device_token', 'is', null)

    if (error) {
      console.error('Failed to query device tokens from Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const tokens = users?.map((u) => u.device_token).filter(Boolean) as string[]

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ message: 'No registered device tokens found for targeted roles', sentCount: 0 })
    }

    const firebaseApp = getFirebaseAdmin()

    if (!firebaseApp) {
      console.warn(`[Push Mock] Would send push to ${tokens.length} tokens: "${title}" - "${notificationBody}"`)
      return NextResponse.json({
        message: 'Firebase Admin credentials not set; logged push notification payload.',
        sentCount: tokens.length,
        mock: true,
      })
    }

    // Send FCM Multicast Payload via Modular Messaging SDK
    const messaging = getMessaging(firebaseApp)
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title,
        body: notificationBody,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    })

    console.log(`[FCM Push] Sent ${response.successCount} notifications successfully (${response.failureCount} failed).`)

    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failedCount: response.failureCount,
    })
  } catch (error: any) {
    console.error('Error sending native push notification:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
