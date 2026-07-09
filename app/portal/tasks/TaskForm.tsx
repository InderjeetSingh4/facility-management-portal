'use client'

import { useState } from 'react'
import { createChecklistTask } from '../actions'

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

const inputCls =
  'w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-2.5 text-sm text-neutral-900 shadow-sm outline-none ring-emerald-500/40 transition placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-white dark:placeholder:text-neutral-500'

const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400'

export default function TaskForm() {
  const [frequency, setFrequency] = useState('daily')

  return (
    <form action={createChecklistTask} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      {/* Title */}
      <div className="flex-1">
        <label className={labelCls} htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          name="title"
          required
          autoComplete="off"
          placeholder="e.g. Wipe down lobby counters"
          className={inputCls}
        />
      </div>

      {/* Frequency */}
      <div className="sm:w-40">
        <label className={labelCls} htmlFor="task-frequency">Frequency</label>
        <select
          id="task-frequency"
          name="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className={inputCls}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="one-off">One-Off</option>
        </select>
      </div>

      {/* Day of Week (weekly only) */}
      {frequency === 'weekly' && (
        <div className="sm:w-40">
          <label className={labelCls} htmlFor="task-day">Day</label>
          <select
            id="task-day"
            name="day_of_week"
            required
            defaultValue=""
            className={inputCls}
          >
            <option value="" disabled>Select a day</option>
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Target Date (one-off only) */}
      {frequency === 'one-off' && (
        <div className="sm:w-44">
          <label className={labelCls} htmlFor="task-date">Date</label>
          <input
            id="task-date"
            type="date"
            name="target_date"
            required
            className={inputCls}
          />
        </div>
      )}

      <button
        type="submit"
        className="flex-shrink-0 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700 active:scale-95 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Add Task
      </button>
    </form>
  )
}