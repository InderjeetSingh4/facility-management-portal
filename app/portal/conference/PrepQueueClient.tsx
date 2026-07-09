'use client'

import { useState } from 'react'
import { markRoomPrepped } from '../actions'

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
    await markRoomPrepped(selectedTask.id)
    setIsPending(false)
    setSelectedTask(null)
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-neutral-500">No rooms require prep right now.</p>
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => {
          const start = task.start_time.slice(0, 5)
          const end = task.end_time.slice(0, 5)
          return (
            <div key={task.id} className="rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm transition hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/70">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {task.conference_rooms.name}
                  </p>
                  <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-white">{task.title}</p>
                </div>
                <span className="inline-flex rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  {start} - {end}
                </span>
              </div>
              
              <button
                onClick={() => setSelectedTask(task)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur-xl transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
              >
                Prep Room
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          {/* Modal Card */}
          <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl backdrop-blur-xl dark:border-neutral-700/60 dark:bg-neutral-900/70">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Room Prep Checklist
            </h3>
            <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {selectedTask.conference_rooms.name} • {selectedTask.title}
            </p>
            
            <div className="my-6 rounded-2xl bg-white/50 p-4 shadow-inner dark:bg-black/20">
              <ul className="space-y-3">
                {selectedTask.prep_items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm dark:bg-blue-500/20 dark:text-blue-400">
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
                className="w-full rounded-xl border border-neutral-300 bg-white/50 px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPrep}
                disabled={isPending}
                className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
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
