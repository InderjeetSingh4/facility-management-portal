import { createClient } from '@/lib/supabase/server'
import { getConferenceRooms, getTodayBookings } from '../actions'
import BookingForm from './BookingForm'
import PrepQueueClient from './PrepQueueClient'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'

async function ConferenceContent({ isCleaner }: { isCleaner: boolean }) {
  const [rooms, bookings] = await Promise.all([
    getConferenceRooms(),
    getTodayBookings()
  ])

  const prepTasks = bookings.filter((b: any) => b.prep_items && b.prep_items.length > 0 && !b.is_prepped)

  return (
    <>
      {/* LEFT: Role-Based Action Area */}
      <div className="lg:col-span-2">
        {isCleaner ? (
          <div className="sticky top-8 relative overflow-hidden rounded-3xl border border-border bg-surface p-6 xl:p-8 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50">
            <h2 className="mb-5 text-xl xl:text-2xl text-primary font-bold tracking-tight">Today's Room Prep</h2>
            
            {prepTasks.length === 0 ? (
              <p className="text-sm text-secondary">No rooms require prep right now.</p>
            ) : (
              <PrepQueueClient tasks={prepTasks} />
            )}
          </div>
        ) : (
          <div className="sticky top-8 relative overflow-hidden rounded-3xl border border-border bg-surface p-6 xl:p-8 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50">
            <h2 className="mb-5 text-xl xl:text-2xl text-primary font-bold tracking-tight">Book a Room</h2>
            {rooms.length === 0 ? (
              <p className="text-sm text-secondary">No rooms available.</p>
            ) : (
              <BookingForm rooms={rooms} />
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Today's Schedule */}
      <div className="lg:col-span-3">
        <h2 className="mb-4 text-xs xl:text-sm font-bold uppercase tracking-wider text-muted">
          Today's Schedule
        </h2>
        
        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface-solid/20 p-12 xl:p-16 text-center">
            <p className="text-sm xl:text-base text-secondary">
              No bookings for today
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const start = booking.start_time.slice(0, 5)
              const end = booking.end_time.slice(0, 5)
              
              return (
                <article 
                  key={booking.id}
                  className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 xl:p-8 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-primary font-bold tracking-tight">
                      {booking.title}
                    </h3>
                    <span className="inline-flex items-center rounded-md border border-border bg-surface-solid/50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-secondary shadow-sm">
                      {start} - {end}
                    </span>
                  </div>
                  
                  {booking.prep_items && booking.prep_items.length > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider shadow-sm border border-border bg-surface-solid/50 ${booking.is_prepped ? 'text-secondary' : 'text-secondary'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${booking.is_prepped ? 'bg-muted' : 'bg-primary'}`} />
                        {booking.is_prepped ? 'Ready' : 'Pending'}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-sm text-secondary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {booking.conference_rooms.name}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function ConferenceSkeleton() {
  return (
    <>
      <div className="lg:col-span-2">
        <div className="rounded-3xl bg-surface-solid/50 h-[400px] animate-pulse"></div>
      </div>
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-3xl bg-surface-solid/50 h-[100px] animate-pulse"></div>
        <div className="rounded-3xl bg-surface-solid/50 h-[100px] animate-pulse"></div>
        <div className="rounded-3xl bg-surface-solid/50 h-[100px] animate-pulse"></div>
      </div>
    </>
  )
}

export default async function ConferencePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const role = user?.user_metadata?.role || 'staff'
  const isCleaner = role === 'housekeeper' || role === 'cleaner'

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Conference Rooms"
        description={isCleaner ? "Today's room preparation queue." : "Book a meeting room or view today's schedule."}
        showBackButton={true}
      />

      <div className="mt-2 grid grid-cols-1 gap-8 xl:gap-10 lg:grid-cols-5">
        <Suspense fallback={<ConferenceSkeleton />}>
           <ConferenceContent isCleaner={isCleaner} />
        </Suspense>
      </div>
    </div>
  )
}
