'use client'

import { useRef, useState } from 'react'
import { bookRoom } from '../actions'
import { toast } from 'sonner'
import { Calendar, Clock } from 'lucide-react'

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

  const inputClasses = "block w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:bg-muted cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
  const labelClasses = "mb-1.5 block text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-muted-foreground"

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-danger bg-danger-bg px-4 py-3 text-xs font-semibold text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="room_id" className={labelClasses}>
          Conference Room
        </label>
        <select
          id="room_id"
          name="room_id"
          required
          className={`${inputClasses} cursor-pointer`}
        >
          <option value="" className="text-muted-foreground">Select a room...</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id} className="text-foreground bg-card">
              {room.name} (Cap: {room.capacity || 10})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className={labelClasses}>
          Meeting Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Executive Sync"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="booking_date" className={labelClasses}>
          Reservation Date
        </label>
        <div className="relative flex items-center">
          <input
            id="booking_date"
            name="booking_date"
            type="date"
            required
            defaultValue={todayDate}
            className={`${inputClasses} pr-10`}
          />
          <Calendar size={18} className="absolute right-3.5 pointer-events-none text-foreground stroke-[2]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className={labelClasses}>
            Start Time
          </label>
          <div className="relative flex items-center">
            <input
              id="start_time"
              name="start_time"
              type="time"
              required
              className={`${inputClasses} pr-10`}
            />
            <Clock size={18} className="absolute right-3.5 pointer-events-none text-foreground stroke-[2]" />
          </div>
        </div>
        <div>
          <label htmlFor="end_time" className={labelClasses}>
            End Time
          </label>
          <div className="relative flex items-center">
            <input
              id="end_time"
              name="end_time"
              type="time"
              required
              className={`${inputClasses} pr-10`}
            />
            <Clock size={18} className="absolute right-3.5 pointer-events-none text-foreground stroke-[2]" />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClasses}>
          Prep Requirements (Optional)
        </label>
        <div className="flex flex-wrap gap-2.5">
          {['Water Bottles', 'Notepads & Pens', 'Snacks/Biscuits'].map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary active:scale-[0.98]"
            >
              <input
                type="checkbox"
                name="prep_items"
                value={item}
                className="h-4 w-4 rounded border-border text-primary accent-primary focus:ring-0 cursor-pointer"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 text-sm rounded-xl transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 tracking-wide"
        >
          {isSubmitting ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  )
}
