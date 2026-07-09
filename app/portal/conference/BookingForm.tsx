'use client'

import { useRef, useState } from 'react'
import { bookRoom } from '../actions'

export default function BookingForm({ rooms }: { rooms: any[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)
    
    const result = await bookRoom(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      formRef.current?.reset()
      setTimeout(() => setSuccess(false), 3000)
    }
    setIsSubmitting(false)
  }

  // Generate today's date in local YYYY-MM-DD format for default value
  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}
      
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/10 dark:text-emerald-400">
          Room booked successfully!
        </div>
      )}

      <div>
        <label htmlFor="room_id" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Select Room
        </label>
        <select
          id="room_id"
          name="room_id"
          required
          className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-2.5 text-sm text-neutral-900 shadow-sm outline-none ring-blue-500/40 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-white"
        >
          <option value="">-- Choose a room --</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name} (Capacity: {room.capacity})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Meeting Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Q3 Marketing Sync"
          className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-2.5 text-sm text-neutral-900 shadow-sm outline-none ring-blue-500/40 transition placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-white dark:placeholder:text-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="booking_date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Date
        </label>
        <input
          id="booking_date"
          name="booking_date"
          type="date"
          required
          defaultValue={todayDate}
          className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-2.5 text-sm text-neutral-900 shadow-sm outline-none ring-blue-500/40 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Start Time
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-2.5 text-sm text-neutral-900 shadow-sm outline-none ring-blue-500/40 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            End Time
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            required
            className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-2.5 text-sm text-neutral-900 shadow-sm outline-none ring-blue-500/40 transition focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isSubmitting ? 'Booking…' : 'Book Room'}
      </button>
    </form>
  )
}
