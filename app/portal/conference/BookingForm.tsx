'use client'

import { useRef, useState } from 'react'
import { bookRoom } from '../actions'
import { toast } from 'sonner'

export default function BookingForm({ rooms }: { rooms: any[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const result = await bookRoom(formData)
      
      if (result?.error) {
        setError(result.error)
        toast.error('Booking failed. Please try again.')
      } else {
        toast.success('Room booked successfully.')
        formRef.current?.reset()
      }
    } catch {
      toast.error('Something went wrong.')
    }
    setIsSubmitting(false)
  }

  // Generate today's date in local YYYY-MM-DD format for default value
  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  const inputClasses = "w-full rounded-2xl border border-border bg-surface p-4 text-primary shadow-inner backdrop-blur-xl outline-none transition-all placeholder:text-muted focus:border-accent focus:bg-surface-solid/80 focus:ring-4 focus:ring-accent/20"

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-neutral-300/50 bg-neutral-100/60 px-4 py-2.5 text-sm text-neutral-600 dark:border-neutral-700/50 dark:bg-neutral-800/40 dark:text-neutral-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="room_id" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
          Select Room
        </label>
        <select
          id="room_id"
          name="room_id"
          required
          className={inputClasses}
        >
          <option value="">-- Choose a room --</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name} (Capacity: {room.capacity})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
          Meeting Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Q3 Marketing Sync"
          className={`${inputClasses} placeholder:text-neutral-400 dark:placeholder:text-neutral-500`}
        />
      </div>

      <div>
        <label htmlFor="booking_date" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
          Date
        </label>
        <input
          id="booking_date"
          name="booking_date"
          type="date"
          required
          defaultValue={todayDate}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
            Start Time
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="end_time" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
            End Time
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            required
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-secondary">
          Prep Requirements (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {['Water Bottles', 'Notepads & Pens', 'Snacks/Biscuits'].map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 border border-border bg-surface-solid/50 text-secondary rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-surface-solid">
              <input type="checkbox" name="prep_items" value={item} className="h-4 w-4 rounded border-border text-accent focus:ring-accent outline-none" />
              {item}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full bg-accent text-accent-foreground rounded-2xl px-4 py-4 text-sm font-medium shadow-md transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Booking…' : 'Book Room'}
      </button>
    </form>
  )
}
