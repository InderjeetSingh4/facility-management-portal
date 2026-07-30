import localforage from 'localforage'
import { Network } from '@capacitor/network'
import { toggleTaskCompletion, submitForApproval } from '@/app/portal/actions'
import { toast } from 'sonner'

// Configure localforage instance for facility portal
localforage.config({
  name: 'FacilityPortalDB',
  storeName: 'offline_store',
  description: 'IndexedDB cache and sync queue for offline field operations',
})

export interface QueuedAction {
  id: string
  actionType: 'TOGGLE_TASK' | 'SUBMIT_COMPLAINT_FOR_APPROVAL'
  payload: any
  timestamp: string
}

const QUEUE_KEY = 'offline_sync_queue'

// 1. Cache Helpers
export async function setCache(key: string, value: any): Promise<void> {
  try {
    await localforage.setItem(key, value)
  } catch (error) {
    console.error(`[SyncEngine] Failed to cache key "${key}":`, error)
  }
}

export async function getCache<T>(key: string, fallbackValue: T): Promise<T> {
  try {
    const data = await localforage.getItem<T>(key)
    return data !== null ? data : fallbackValue
  } catch (error) {
    console.error(`[SyncEngine] Failed to read cached key "${key}":`, error)
    return fallbackValue
  }
}

// 2. Offline Action Queue Management
export async function enqueueAction(actionType: QueuedAction['actionType'], payload: any): Promise<void> {
  try {
    const queue = (await localforage.getItem<QueuedAction[]>(QUEUE_KEY)) || []
    const newAction: QueuedAction = {
      id: crypto.randomUUID(),
      actionType,
      payload,
      timestamp: new Date().toISOString(),
    }
    queue.push(newAction)
    await localforage.setItem(QUEUE_KEY, queue)
    console.log(`[SyncEngine] Queued offline action "${actionType}":`, payload)
  } catch (error) {
    console.error('[SyncEngine] Failed to enqueue action:', error)
  }
}

// 3. Process Sync Queue when Connection Restored
export async function processSyncQueue(): Promise<void> {
  try {
    const queue = (await localforage.getItem<QueuedAction[]>(QUEUE_KEY)) || []
    if (queue.length === 0) return

    console.log(`[SyncEngine] Connection active. Flushing ${queue.length} pending offline actions...`)
    toast.info(`Syncing ${queue.length} offline changes...`)

    const remainingQueue: QueuedAction[] = []

    for (const item of queue) {
      try {
        if (item.actionType === 'TOGGLE_TASK') {
          await toggleTaskCompletion(item.payload.taskId)
        } else if (item.actionType === 'SUBMIT_COMPLAINT_FOR_APPROVAL') {
          await submitForApproval(item.payload.complaintId)
        }
      } catch (itemError) {
        console.error(`[SyncEngine] Failed to sync item ${item.id}:`, itemError)
        remainingQueue.push(item)
      }
    }

    await localforage.setItem(QUEUE_KEY, remainingQueue)

    if (remainingQueue.length === 0) {
      toast.success('All offline changes synced successfully!')
    } else {
      toast.warning(`${remainingQueue.length} changes remaining in sync queue.`)
    }
  } catch (error) {
    console.error('[SyncEngine] Error processing sync queue:', error)
  }
}

// 4. Register Auto-Sync Network Listener
if (typeof window !== 'undefined') {
  Network.addListener('networkStatusChange', (status) => {
    if (status.connected) {
      processSyncQueue()
    }
  })
}
