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
  isExecutive?: boolean
  canBook?: boolean
}

const HOURS = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'
]

export default function RoomSchedulerClient({
  rooms,
  bookings,
  isCleaner,
  isExecutive = false,
  canBook = true,
}: RoomSchedulerClientProps) {
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
      <div className="bg-card backdrop-blur-2xl border border-border shadow-surface rounded-3xl p-6 md:p-8 transition-all">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-lg md:text-xl font-heading font-bold text-foreground tracking-tight">
                {isExecutive ? 'Conference Room Utilization' : 'Smart Room Scheduler'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {isExecutive ? 'Live visual timeline & room occupancy schedule for today' : 'Live visual timeline & room availability for today'}
            </p>
          </div>

          {!isExecutive && canBook && (
            <button
              onClick={() => setShowBookModal(true)}
              className="bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 px-4 rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <Plus size={16} />
              Book Room
            </button>
          )}
        </div>

        {/* Timeline Gantt Grid Container */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[800px]">
            
            {/* Hours Header Row */}
            <div className="grid grid-cols-12 gap-2 mb-4 pb-3 border-b border-border">
              <div className="col-span-3 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Conference Room
              </div>
              <div className="col-span-9 grid grid-cols-11 gap-1">
                {HOURS.map((hour) => (
                  <div key={hour} className="text-xs font-mono font-semibold text-muted-foreground text-center">
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
                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-muted/50 border border-border hover:border-muted-foreground transition-all"
                  >
                    {/* Room Info Left Label */}
                    <div className="col-span-3 pr-4">
                      <h3 className="text-sm font-bold text-foreground tracking-tight truncate">{room.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
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
                          className="h-full rounded-xl border border-transparent hover:border-dashed hover:border-muted-foreground transition-all cursor-pointer flex items-center justify-center group"
                        >
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-muted-foreground">
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
                            className="absolute top-1 bottom-1 bg-primary text-primary-foreground border border-border backdrop-blur-md rounded-xl flex items-center px-3 shadow-sm transition-all truncate group z-10 cursor-pointer"
                            title={`${b.title} (${b.start_time.slice(0, 5)} - ${b.end_time.slice(0, 5)})`}
                          >
                            <span className="text-xs font-semibold truncate flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground flex-shrink-0" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-card backdrop-blur-xl border border-border shadow-surface rounded-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1">
                  FACILITYOS / RESERVATION
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Reserve Conference Room
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted font-mono text-sm"
                aria-label="Close modal"
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
