import { Plus, CheckCircle2, Circle, Clock } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { createClient } from '@/lib/supabase/server'
import { getTodayTasks } from '../actions'
import { Suspense } from 'react'
import TaskListClient from './TaskListClient'

async function TasksContent({ isAdmin, userId }: { isAdmin: boolean, userId: string }) {
  const tasks = await getTodayTasks()

  const toDos = tasks.filter((t: any) => !t.isCompleted)
  const completeds = tasks.filter((t: any) => t.isCompleted)

  return (
    <div className="grid gap-6 xl:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Column: To Do */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2">
          <Circle size={16} className="text-muted" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">To Do ({toDos.length})</h2>
        </div>
        
        {toDos.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-surface-solid/30 p-8 text-center backdrop-blur-xl">
            <p className="text-sm text-secondary">All tasks complete!</p>
          </div>
        )}

        <TaskListClient tasks={toDos} isAdmin={isAdmin} currentUserId={userId} isCompleted={false} />
      </div>

      {/* Column: Completed */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2">
          <CheckCircle2 size={16} className="text-success" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">Completed ({completeds.length})</h2>
        </div>
        
        {completeds.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-surface-solid/30 p-8 text-center backdrop-blur-xl opacity-75">
            <p className="text-sm text-secondary">No tasks completed yet.</p>
          </div>
        )}

        <TaskListClient tasks={completeds} isAdmin={isAdmin} currentUserId={userId} isCompleted={true} />
      </div>
    </div>
  )
}

function TasksSkeleton() {
  return (
    <div className="grid gap-6 xl:gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl bg-surface-solid/50 h-[200px] animate-pulse"></div>
        <div className="rounded-3xl bg-surface-solid/50 h-[200px] animate-pulse"></div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl bg-surface-solid/50 h-[150px] animate-pulse"></div>
      </div>
    </div>
  )
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const role = user?.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  return (
    <div className="animate-in fade-in duration-500">
      
      <PageHeader 
        title="Task Management"
        description="Track and manage daily cleaning and maintenance checklists."
        showBackButton={true}
        action={
          <button className="flex w-fit items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-md transition-all hover:opacity-90 active:scale-95">
            <Plus size={18} />
            New Task
          </button>
        }
      />

      <div className="mt-2">
        <Suspense fallback={<TasksSkeleton />}>
          <TasksContent isAdmin={isAdmin} userId={user?.id || ''} />
        </Suspense>
      </div>

    </div>
  )
}