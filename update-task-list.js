const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/portal/tasks/TaskListClient.tsx');
const newContent = `'use client'

import { Clock, Trash2, CheckCircle2, Circle } from "lucide-react"
import { useTransition, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toggleTaskCompletion, deleteChecklistTask } from "../actions"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { setCache, getCache, enqueueAction } from "@/lib/offline/syncEngine"
import { toast } from "sonner"
import { containerStaggerVariants, itemSpringVariants } from "@/lib/glass"
import GlassCard from "@/components/ui/GlassCard"

interface TaskListClientProps {
  tasks: any[]
  isAdmin: boolean
  currentUserId: string
}

type FilterType = 'All' | 'Pending' | 'Completed'

export default function TaskListClient({ tasks: initialTasks, isAdmin, currentUserId }: TaskListClientProps) {
  const { isOffline } = useNetworkStatus()
  const [tasks, setTasks] = useState<any[]>(initialTasks)
  const [filter, setFilter] = useState<FilterType>('All')

  useEffect(() => {
    async function handleCaching() {
      if (!isOffline && initialTasks && initialTasks.length > 0) {
        setTasks(initialTasks)
        await setCache('cached_tasks_all', initialTasks)
      } else if (isOffline) {
        const cached = await getCache<any[]>('cached_tasks_all', [])
        if (cached && cached.length > 0) {
          setTasks(cached)
        }
      }
    }
    handleCaching()
  }, [initialTasks, isOffline])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Pending') return !task.isCompleted
    if (filter === 'Completed') return task.isCompleted
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Segmented Control */}
      <div className="flex bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-full p-1 shadow-[0_4px_14px_rgb(0,0,0,0.03)] dark:shadow-none mx-auto">
        {(['All', 'Pending', 'Completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={\`relative px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 \${
              filter === f ? 'text-primary' : 'text-muted hover:text-primary'
            }\`}
          >
            {filter === f && (
              <motion.div
                layoutId="active-segment"
                className="absolute inset-0 bg-white/80 dark:bg-white/10 rounded-full shadow-sm"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f}</span>
          </button>
        ))}
      </div>

      <motion.div
        variants={containerStaggerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center p-12"
            >
              <p className="text-slate-500 font-medium">No tasks found in this category.</p>
            </motion.div>
          ) : (
            filteredTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                isOffline={isOffline}
                onLocalToggle={(taskId) => {
                  setTasks((prev) => 
                    prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
                  )
                }}
                onLocalDelete={(taskId) => {
                  setTasks((prev) => prev.filter((t) => t.id !== taskId))
                }}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function TaskCard({
  task,
  isAdmin,
  currentUserId,
  isOffline,
  onLocalToggle,
  onLocalDelete,
}: {
  task: any
  isAdmin: boolean
  currentUserId: string
  isOffline: boolean
  onLocalToggle: (taskId: string) => void
  onLocalDelete: (taskId: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const isCompleted = task.isCompleted

  const handleToggle = () => {
    if (isOffline) {
      enqueueAction('TOGGLE_TASK', { taskId: task.id })
      onLocalToggle(task.id)
      toast.info('Task updated offline. Changes will sync when online.')
    } else {
      onLocalToggle(task.id) // Optimistic update
      startTransition(() => {
        toggleTaskCompletion(task.id)
      })
    }
  }

  const handleDelete = () => {
    if (showConfirm) {
      setIsDeleting(true)
      onLocalDelete(task.id) // Optimistic delete
      startTransition(() => {
        deleteChecklistTask(task.id)
      })
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  return (
    <motion.div
      layout
      variants={itemSpringVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
    >
      <GlassCard 
        interactive={true} 
        className={\`p-5 flex items-center gap-4 \${isCompleted ? 'opacity-60 grayscale-[0.2]' : ''}\`}
      >
        {/* Animated Circular Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isPending || isDeleting}
          className={\`relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out active:scale-90 \${
            isCompleted 
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
              : 'border-slate-300 dark:border-slate-600 bg-transparent text-transparent hover:border-blue-400 hover:bg-blue-500/10'
          }\`}
        >
          <CheckCircle2 size={16} className={\`\${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all duration-300\`} strokeWidth={3} />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={\`font-semibold text-base leading-snug truncate transition-all duration-300 \${isCompleted ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}\`}>
            {task.title}
          </h3>
          {task.target_date && !isCompleted && (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock size={13} />
              <span>Due {new Date(task.target_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isDeleting || isPending || isOffline}
            className={\`flex-shrink-0 rounded-full p-2 transition-all duration-200 \${
              showConfirm
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:bg-red-500/10 hover:text-red-500 active:scale-95'
            }\`}
            title={showConfirm ? 'Click to confirm deletion' : 'Delete Task'}
          >
            <Trash2 size={16} />
          </button>
        )}
      </GlassCard>
    </motion.div>
  )
}
`

fs.writeFileSync(filePath, newContent, 'utf8')
console.log('Successfully updated TaskListClient.tsx')
