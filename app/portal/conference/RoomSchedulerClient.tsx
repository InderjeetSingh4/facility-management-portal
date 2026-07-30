'use client'

import { useState } from 'react'
import { Calendar, Clock, Plus, Users, MapPin, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react'
import BookingForm from './BookingForm'

interface Booking {
  id: string
  title: string
  start_time: string
  end_time: string
  conference_rooms: {
    id: string
    name: string
  }
  is_prepped?: boolean
}

interface Room {
  id: string
  name: string
  capacity?: number
}

interface RoomSchedulerClientProps {
  rooms: Room[]
  bookings: Booking[]
  isCleaner: boolean
}

const HOURS = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'
]

export default function RoomSchedulerClient({ rooms, bookings, isCleaner }: RoomSchedulerClientProps) {
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  // Default rooms fallback if DB has none
  const displayRooms = rooms.length > 0 ? rooms : [
    { id: '1', name: 'Boardroom A', capacity: 12 },
    { id: '2', name: 'Innovation Lab', capacity: 8 },
    { id: '3', name: 'Main Hall', capacity: 30 },
  ]

  // Convert time string "HH:MM:SS" to position index (8 AM = index 0)
  const getHourIndex = (timeStr: string) => {
    const parts = timeStr.split(':')
    const hour = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1] || '0', 10)
    const decimal = hour + minutes / 60
    return Math.max(0, Math.min(10, decimal - 8))
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto">
      {/* ── Main Gantt Scheduler Panel ── */}
      <div className="bg-white/70 dark:bg-white/[0.02] backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 transition-all">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-xl md:text-2xl font-heading font-bold text-slate-900 dark:text-text-primary tracking-tight">Smart Room Scheduler</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-text-muted">Live visual timeline & room availability for today</p>
          </div>

          <button
            onClick={() => setShowBookModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={18} />
            Book Room
          </button>
        </div>

        {/* Timeline Gantt Grid Container */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[800px]">
            
            {/* Hours Header Row */}
            <div className="grid grid-cols-12 gap-2 mb-4 pb-3 border-b border-black/10 dark:border-white/10">
              <div className="col-span-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                Conference Room
              </div>
              <div className="col-span-9 grid grid-cols-11 gap-1">
                {HOURS.map((hour) => (
                  <div key={hour} className="text-xs font-mono font-semibold text-slate-400 dark:text-neutral-400 text-center">
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {/* Room Rows */}
            <div className="flex flex-col gap-4">
              {displayRooms.map((room) => {
                const roomBookings = bookings.filter(
                  b => b.conference_rooms?.id === room.id || b.conference_rooms?.name === room.name
                )

                return (
                  <div
                    key={room.id}
                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.015] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all"
                  >
                    {/* Room Info Left Label */}
                    <div className="col-span-3 pr-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-text-primary tracking-tight truncate">{room.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-text-muted">
                        <Users size={12} />
                        <span>Cap: {room.capacity || 10} people</span>
                      </div>
                    </div>

                    {/* Timeline Slots Right Container */}
                    <div className="col-span-9 relative grid grid-cols-11 gap-1 h-12">
                      {/* Empty Background Grid Slots */}
                      {HOURS.map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedRoom(room.id)
                            setShowBookModal(true)
                          }}
                          className="h-full rounded-xl border border-transparent hover:border-dashed hover:border-slate-400 dark:hover:border-neutral-600 transition-all cursor-pointer flex items-center justify-center group"
                        >
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                            +
                          </span>
                        </div>
                      ))}

                      {/* Overlaid Booked Slot Pills */}
                      {roomBookings.map((b) => {
                        const startIdx = getHourIndex(b.start_time)
                        const endIdx = getHourIndex(b.end_time)
                        const duration = Math.max(1, endIdx - startIdx)
                        const leftPercent = (startIdx / 11) * 100
                        const widthPercent = (duration / 11) * 100

                        return (
                          <div
                            key={b.id}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`
                            }}
                            className="absolute top-1 bottom-1 bg-slate-900/90 text-white dark:bg-white/10 dark:text-white border border-black/10 dark:border-white/20 backdrop-blur-md rounded-xl flex items-center px-3 shadow-md transition-all truncate group z-10 cursor-pointer"
                            title={`${b.title} (${b.start_time.slice(0, 5)} - ${b.end_time.slice(0, 5)})`}
                          >
                            <span className="text-xs font-semibold truncate flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                              {b.title}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Modal Overlay ── */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-bg-surface border border-black/10 dark:border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-black/5 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-text-primary">Reserve Conference Room</h3>
                <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">Select a room and set your start/end schedule</p>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            <BookingForm rooms={displayRooms} />
          </div>
        </div>
      )}
    </div>
  )
}
