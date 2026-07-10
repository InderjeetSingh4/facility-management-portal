'use client'

import { useState } from 'react'
import { markRoomPrepped } from '../actions'
import { toast } from 'sonner'

type Task = {
  id: string
  title: string
  start_time: string
  end_time: string
  prep_items: string[]
  conference_rooms: { name: string }
}

export default function PrepQueueClient({ tasks }: { tasks: Task[] }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleConfirmPrep() {
    if (!selectedTask) return
    setIsPending(true)
    const result = await markRoomPrepped(selectedTask.id)
    setIsPending(false)
    if (result?.error) {
      toast.error('Failed to mark room. Please try again.')
    } else {
      toast.success('Room marked as ready.')
      setSelectedTask(null)
    }
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-secondary">No rooms require prep right now.</p>
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => {
          const start = task.start_time.slice(0, 5)
          const end = task.end_time.slice(0, 5)
          return (
            <div key={task.id} className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {task.conference_rooms.name}
                  </p>
                  <p className="mt-1 text-primary font-bold tracking-tight">{task.title}</p>
                </div>
                <span className="inline-flex items-center rounded-md border border-border bg-surface-solid/50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-secondary shadow-sm">
                  {start} - {end}
                </span>
              </div>
              
              <button
                onClick={() => setSelectedTask(task)}
                className="mt-4 w-full border border-border bg-surface-solid/50 text-secondary rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-surface-solid active:scale-95"
              >
                Prep Room
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity">
          {/* Modal Card */}
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-sm backdrop-blur-xl">
            <h3 className="text-primary font-bold tracking-tight">
              Room Prep Checklist
            </h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-secondary">
              {selectedTask.conference_rooms.name} · {selectedTask.title}
            </p>
            
            <div className="my-6 rounded-2xl border border-border bg-surface-solid/50 p-4 shadow-inner backdrop-blur-xl">
              <ul className="space-y-3">
                {selectedTask.prep_items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-secondary">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface-solid/50 text-[10px] text-muted shadow-sm">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                disabled={isPending}
                className="w-full border border-border bg-surface-solid/50 text-secondary rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-surface-solid active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPrep}
                disabled={isPending}
                className="w-full bg-accent text-accent-foreground rounded-2xl px-4 py-2 text-sm font-medium shadow-md transition-all hover:scale-105 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Confirm & Mark Prepped'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
