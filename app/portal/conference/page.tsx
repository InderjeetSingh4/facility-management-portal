import { createClient } from '@/lib/supabase/server'
import { getConferenceRooms, getTodayBookings } from '../actions'
import PrepQueueClient from './PrepQueueClient'
import RoomSchedulerClient from './RoomSchedulerClient'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import { isSystemExecutive, isCleaner as checkIsCleaner, canBookConferenceRooms } from '@/lib/auth/rbac'

async function ConferenceContent({
  isCleaner,
  isExecutive,
  canBook,
}: {
  isCleaner: boolean
  isExecutive: boolean
  canBook: boolean
}) {
  const [rooms, bookings] = await Promise.all([
    getConferenceRooms(),
    getTodayBookings()
  ])

  const prepTasks = bookings.filter((b: any) => b.prep_items && b.prep_items.length > 0 && !b.is_prepped)

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Housekeeper prep queue if cleaner role */}
      {isCleaner && prepTasks.length > 0 && (
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-bg-surface p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-xl text-primary font-bold tracking-tight">Today's Room Prep Queue</h2>
          <PrepQueueClient tasks={prepTasks} />
        </div>
      )}

      {/* Smart Room Scheduler Timeline */}
      <RoomSchedulerClient
        rooms={rooms}
        bookings={bookings}
        isCleaner={isCleaner}
        isExecutive={isExecutive}
        canBook={canBook}
      />
    </div>
  )
}

function ConferenceSkeleton() {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <div className="rounded-3xl bg-black/5 dark:bg-white/5 h-[450px] animate-pulse" />
    </div>
  )
}

export default async function ConferencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'staff'
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    role = profile?.role || user.user_metadata?.role || 'staff'
  }

  const isExec = isSystemExecutive(role)
  const isCleaner = checkIsCleaner(role)
  const canBook = canBookConferenceRooms(role)

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isExec ? "Conference Room Utilization" : "Conference Rooms"}
        description={
          isExec
            ? "Live visual timeline, room capacity, and daily meeting schedules."
            : isCleaner
            ? "Today's room preparation queue and schedules."
            : "Smart room scheduler and interactive Gantt timeline."
        }
        showBackButton={true}
      />

      <Suspense fallback={<ConferenceSkeleton />}>
        <ConferenceContent isCleaner={isCleaner} isExecutive={isExec} canBook={canBook} />
      </Suspense>
    </div>
  )
}
