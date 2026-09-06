import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from "@/components/PageHeader"
import { getTodayTasks } from '../actions'
import TaskListClient from './TaskListClient'
import ExecutiveTaskPerformanceView from '@/components/ExecutiveTaskPerformanceView'
import { isSystemExecutive, isAdmin as checkIsAdmin } from '@/lib/auth/rbac'
import { Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, full_name, plant_id, approval_status')
    .eq('id', user.id)
    .single()

  const rawRole = profile?.role || user.user_metadata?.role || 'staff'
  const isExecutive = isSystemExecutive(rawRole)
  const isAdmin = checkIsAdmin(rawRole)

  console.log('==================================================')
  console.log('🔍 [PORTAL/TASKS SERVER ROLE CHECK]')
  console.log('User ID:', user.id)
  console.log('User Email:', user.email)
  console.log('DB public.users profile:', profile)
  console.log('DB Query Error (if any):', profileError?.message || 'None')
  console.log('User metadata role:', user.user_metadata?.role)
  console.log('Resolved Raw Role:', rawRole)
  console.log('isSystemExecutive(rawRole):', isExecutive)
  console.log('isAdmin(rawRole):', isAdmin)
  console.log('Selected Render View:', isExecutive ? 'ExecutiveTaskPerformanceView (READ-ONLY)' : 'TaskListClient (OPERATIONAL)')
  console.log('==================================================')

  const tasks = await getTodayTasks()

  // 👑 Dedicated Server-Rendered Read-Only View for System Executive
  if (isExecutive) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          title="Task Performance & Oversight"
          description="Live completion metrics, frequency breakdowns, and audit logs."
          showBackButton={true}
        />
        <ExecutiveTaskPerformanceView tasks={tasks || []} />
      </div>
    )
  }

  // 🛠️ Operational View (Facility Manager & Housekeeper / Staff)
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Task Management"
        description="Track and manage daily cleaning and maintenance checklists."
        showBackButton={true}
        action={
          isAdmin ? (
            <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground focus:ring-2 focus:ring-ring px-5 py-2.5 text-sm font-bold active:scale-95 transition-all duration-200 shadow-sm">
              <Plus size={16} strokeWidth={1.5} />
              New Task
            </button>
          ) : undefined
        }
      />

      <div className="w-full">
        <TaskListClient tasks={tasks || []} isAdmin={isAdmin} currentUserId={user.id} />
      </div>
    </div>
  )
}