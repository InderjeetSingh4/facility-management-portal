'use client'

import { Clock, Trash2, CheckCircle2 } from "lucide-react"
import { useTransition, useState } from "react"
import { toggleTaskCompletion, deleteChecklistTask } from "../actions"

interface TaskListClientProps {
  tasks: any[]
  isAdmin: boolean
  currentUserId: string
  isCompleted: boolean
}

export default function TaskListClient({ tasks, isAdmin, currentUserId, isCompleted }: TaskListClientProps) {
  return (
    <>
      {tasks.map((task: any) => (
        <TaskCard key={task.id} task={task} isAdmin={isAdmin} currentUserId={currentUserId} isCompleted={isCompleted} />
      ))}
    </>
  )
}

function TaskCard({ task, isAdmin, currentUserId, isCompleted }: { task: any, isAdmin: boolean, currentUserId: string, isCompleted: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleToggle = () => {
    startTransition(() => {
      toggleTaskCompletion(task.id)
    })
  }

  const handleDelete = () => {
    if (showConfirm) {
      setIsDeleting(true)
      startTransition(() => {
        deleteChecklistTask(task.id)
      })
    } else {
      setShowConfirm(true)
      // Hide confirm after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-border bg-surface p-5 xl:p-8 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50 hover:shadow-md ${isCompleted ? 'opacity-75 bg-surface-solid/30' : ''}`}>
      <div className="flex items-start justify-between">
        <h3 className={`font-bold text-primary pr-8 ${isCompleted ? 'line-through' : ''}`}>{task.title}</h3>
        {isAdmin && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting || isPending}
            className={`absolute top-4 right-4 rounded-lg p-2 transition-all duration-300 ${
              showConfirm ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'text-muted hover:bg-surface-solid hover:text-danger'
            }`}
            title={showConfirm ? "Click to confirm deletion" : "Delete Task"}
          >
            <Trash2 size={16} />
            {showConfirm && <span className="ml-2 text-xs font-bold uppercase tracking-wider">Confirm</span>}
          </button>
        )}
      </div>
      
      {task.target_date && !isCompleted && (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
          <Clock size={14} />
          <span>Due {new Date(task.target_date).toLocaleDateString()}</span>
        </div>
      )}

      {isCompleted && task.completions && task.completions.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-success">
          <CheckCircle2 size={14} />
          <span>Completed</span>
        </div>
      )}

      <button 
        onClick={handleToggle}
        disabled={isPending || isDeleting}
        className={`mt-4 w-full rounded-xl border py-2 text-sm font-medium shadow-sm transition-all ${
          isCompleted 
            ? 'border-border bg-surface-solid/50 text-secondary hover:bg-surface hover:text-primary' 
            : 'border-border bg-surface-solid/50 text-secondary hover:bg-accent hover:text-accent-foreground hover:border-accent'
        }`}
      >
        {isPending ? 'Updating...' : isCompleted ? 'Undo Completion' : 'Mark Complete'}
      </button>
    </div>
  )
}
