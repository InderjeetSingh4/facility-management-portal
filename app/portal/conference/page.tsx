import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getConferenceRooms, getTodayBookings } from '../actions'
import BookingForm from './BookingForm'
import PrepQueueClient from './PrepQueueClient'

export default async function ConferencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const rooms = await getConferenceRooms()
  const bookings = await getTodayBookings()

  const role = user.user_metadata?.role || 'staff'
  const isCleaner = role === 'housekeeper' || role === 'cleaner'

  const prepTasks = bookings.filter((b: any) => b.prep_items && b.prep_items.length > 0 && !b.is_prepped)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ── Page-Level Return Home Button ──────────────────────────────────── */}
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
        ← Return Home
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Conference Rooms
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {isCleaner ? "Today's room preparation queue." : "Book a meeting room or view today's schedule."}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        
        {/* LEFT: Role-Based Action Area */}
        <div className="lg:col-span-2">
          {isCleaner ? (
            <div className="sticky top-8 rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <h2 className="mb-5 text-lg font-bold text-neutral-900 dark:text-white">Today's Room Prep</h2>
              
              {prepTasks.length === 0 ? (
                <p className="text-sm text-neutral-500">No rooms require prep right now.</p>
              ) : (
                <PrepQueueClient tasks={prepTasks} />
              )}
            </div>
          ) : (
            <div className="sticky top-8 rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <h2 className="mb-5 text-lg font-bold text-neutral-900 dark:text-white">Book a Room</h2>
              {rooms.length === 0 ? (
                <p className="text-sm text-neutral-500">No rooms available.</p>
              ) : (
                <BookingForm rooms={rooms} />
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Today's Schedule */}
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Today's Schedule
          </h2>
          
          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/30 p-12 text-center backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/30">
              <p className="text-3xl">📅</p>
              <p className="mt-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                No bookings for today
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => {
                // Formatting time for display
                const start = booking.start_time.slice(0, 5)
                const end = booking.end_time.slice(0, 5)
                
                return (
                  <article 
                    key={booking.id}
                    className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/70 dark:bg-neutral-900/60"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {booking.title}
                      </h3>
                      <span className="inline-flex rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        {start} - {end}
                      </span>
                    </div>
                    
                    {booking.prep_items && booking.prep_items.length > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${booking.is_prepped ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${booking.is_prepped ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {booking.is_prepped ? 'Ready' : 'Pending Prep'}
                        </span>
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      </div>
    </div>
  )
}
