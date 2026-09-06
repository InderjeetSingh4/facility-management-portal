'use client'

import { Clock, Trash2, CheckCircle2, AlertTriangle, CheckSquare } from "lucide-react"
import { useTransition, useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { toggleTaskCompletion, deleteChecklistTask } from "../actions"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { setCache, getCache, enqueueAction } from "@/lib/offline/syncEngine"
import { toast } from "sonner"
import GlassCard from "@/components/ui/GlassCard"

interface TaskListClientProps {
  tasks: any[]
  isAdmin: boolean
  currentUserId: string
}

// ── Animation Variants ──
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

export default function TaskListClient({ tasks: initialTasks, isAdmin, currentUserId }: TaskListClientProps) {
  const { isOffline } = useNetworkStatus()
  const [tasks, setTasks] = useState<any[]>(initialTasks)

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

  // ── Task Grouping Logic ──
  const { todayTasks, upcomingTasks } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayList: any[] = []
    const upcomingList: any[] = []

    tasks.forEach(task => {
      if (!task.target_date) {
        todayList.push(task) // Default to today if no date
      } else {
        const target = new Date(task.target_date)
        if (target >= tomorrow) {
          upcomingList.push(task)
        } else {
          todayList.push(task)
        }
      }
    })

    return { todayTasks: todayList, upcomingTasks: upcomingList }
  }, [tasks])

  // ── Progress Calculation ──
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
      {/* ── Left Column (Main Tasks Area) ── */}
      <motion.div 
        className="flex flex-col gap-8 lg:col-span-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Hero Progress Widget */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-foreground/5 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">Here is your agenda for today</h2>
                <p className="text-lg text-muted-foreground mt-3">You have {totalTasks - completedTasks} tasks left to complete.</p>
              </div>
              <div className="flex flex-col items-end gap-3 w-full sm:w-80">
                <span className="font-mono text-sm font-bold text-foreground uppercase tracking-wider">{progressPercent}% Complete</span>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Task List */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <p className="text-muted-foreground font-medium">No tasks found.</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-0 overflow-hidden">
                {/* Today Section */}
                {todayTasks.length > 0 && (
                  <div>
                    <div className="dark:bg-[rgba(168,132,155,0.08)] bg-muted px-6 py-3.5 border-b dark:border-[rgba(168,132,155,0.12)] border-border">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Today</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {todayTasks.map((task: any) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          isAdmin={isAdmin}
                          currentUserId={currentUserId}
                          isOffline={isOffline}
                          setTasks={setTasks}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Section */}
                {upcomingTasks.length > 0 && (
                  <div>
                    <div className="dark:bg-[rgba(168,132,155,0.08)] bg-muted px-6 py-3.5 border-b dark:border-[rgba(168,132,155,0.12)] border-border border-t">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Upcoming</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {upcomingTasks.map((task: any) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          isAdmin={isAdmin}
                          currentUserId={currentUserId}
                          isOffline={isOffline}
                          setTasks={setTasks}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Right Column (Widgets Area) ── */}
      <motion.div 
        className="flex flex-col gap-6 lg:col-span-1"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <QuickStatsWidget tasks={tasks} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <RecentActivityWidget />
        </motion.div>
      </motion.div>
    </div>
  )
}

function TaskRow({
  task,
  isAdmin,
  currentUserId,
  isOffline,
  setTasks,
}: {
  task: any
  isAdmin: boolean
  currentUserId: string
  isOffline: boolean
  setTasks: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const isCompleted = task.isCompleted

  const handleToggle = () => {
    if (isOffline) {
      enqueueAction('TOGGLE_TASK', { taskId: task.id })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t))
      toast.info('Task updated offline. Changes will sync when online.')
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t))
      startTransition(async () => {
        const res = await toggleTaskCompletion(task.id)
        if (res && (res as any).error) {
          // Revert optimistic update
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t))
          toast.error((res as any).error)
        }
      })
    }
  }

  const handleDelete = () => {
    if (showConfirm) {
      setIsDeleting(true)
      setTasks(prev => prev.filter(t => t.id !== task.id))
      startTransition(async () => {
        const res = await deleteChecklistTask(task.id)
        if (res && (res as any).error) {
          // Revert deletion
          setTasks(prev => [...prev, task])
          toast.error((res as any).error)
        }
      })
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  const isHighPriority = task.title.toLowerCase().includes('urgent') || task.title.toLowerCase().includes('repair')
  const priorityLabel = isHighPriority ? 'High' : 'Routine'
  const priorityStyles = isHighPriority 
    ? 'bg-foreground text-background border-border dark:bg-[rgba(192,110,110,0.16)] dark:border-[rgba(192,110,110,0.28)] dark:text-[#E3B7B7]' 
    : 'bg-background text-muted-foreground border-border'

  const formattedDate = useMemo(() => {
    if (!task.target_date) return 'Today, 5:00 PM'
    try {
      const d = new Date(task.target_date)
      if (isNaN(d.getTime())) return 'Today, 5:00 PM'
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'Today, 5:00 PM'
    }
  }, [task.target_date])

  return (
    <div
      className={`group relative bg-transparent p-6 flex items-center justify-between transition-colors duration-200 hover:bg-muted ${isCompleted ? 'opacity-60' : ''}`}
    >
      {/* High Priority Glowing Edge */}
      {isHighPriority && !isCompleted && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground dark:bg-[rgba(192,110,110,0.65)] shadow-sm" />
      )}

      <div className="flex items-center justify-between flex-1 min-w-0 z-10 gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={handleToggle}
            disabled={isPending || isDeleting}
            className={`relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-300 ease-out active:scale-90 ${
              isCompleted 
                ? 'border-primary bg-primary text-primary-foreground shadow-sm' 
                : 'border-border bg-transparent text-transparent hover:border-primary hover:bg-muted'
            }`}
          >
            <CheckCircle2 size={16} className={`${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all duration-300`} strokeWidth={1.5} />
          </button>
          
          <h3 className={`font-sans font-medium text-lg leading-snug truncate transition-all duration-300 ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest border ${priorityStyles}`}>
            {priorityLabel}
          </span>
          <div className="flex items-center gap-2 text-sm font-medium font-mono text-muted-foreground whitespace-nowrap justify-end min-w-[130px]">
            <Clock size={15} className="flex-shrink-0" strokeWidth={1.5} />
            <span className="whitespace-nowrap">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Reveal-on-Hover Quick Actions Pane */}
      <div className="flex items-center gap-2 flex-shrink-0 z-10 transition-all duration-300 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border shadow-sm">
          JD
        </div>
        
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isDeleting || isPending || isOffline}
            className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ${
              showConfirm
                ? 'bg-danger-bg text-danger shadow-sm'
                : 'bg-muted hover:bg-danger-bg text-muted-foreground hover:text-danger shadow-sm backdrop-blur-md'
            }`}
            title={showConfirm ? 'Click to confirm' : 'Delete'}
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── New Right Column Widgets ──

function QuickStatsWidget({ tasks }: { tasks: any[] }) {
  const highPriority = tasks.filter(t => !t.isCompleted && (t.title.toLowerCase().includes('urgent') || t.title.toLowerCase().includes('repair'))).length
  const completed = tasks.filter(t => t.isCompleted).length
  // Mocking overdue as any pending tasks that don't have a future target date.
  const overdue = tasks.filter(t => !t.isCompleted && (!t.target_date || new Date(t.target_date) < new Date())).length

  return (
    <GlassCard className="p-8">
      <h3 className="text-xl font-semibold text-foreground mb-8">Quick Stats</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-foreground group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} strokeWidth={1.5} />
            </div>
            <span className="text-lg font-medium text-muted-foreground">High Priority</span>
          </div>
          <span className="text-3xl lg:text-4xl font-bold font-mono text-foreground">{highPriority}</span>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-foreground group-hover:scale-110 transition-transform">
              <Clock size={20} strokeWidth={1.5} />
            </div>
            <span className="text-lg font-medium text-muted-foreground">Overdue</span>
          </div>
          <span className="text-3xl lg:text-4xl font-bold font-mono text-foreground">{overdue}</span>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-foreground group-hover:scale-110 transition-transform">
              <CheckSquare size={20} strokeWidth={1.5} />
            </div>
            <span className="text-lg font-medium text-muted-foreground">Completed</span>
          </div>
          <span className="text-3xl lg:text-4xl font-bold font-mono text-foreground">{completed}</span>
        </div>
      </div>
    </GlassCard>
  )
}

function RecentActivityWidget() {
  const activities = [
    { id: 1, text: "East door cleaning marked as complete", time: "10 mins ago", type: "complete" },
    { id: 2, text: "New high-priority task added: AC Repair", time: "1 hr ago", type: "add" },
    { id: 3, text: "West wing inspection completed", time: "2 hrs ago", type: "complete" },
    { id: 4, text: "Staff assigned to Main Lobby", time: "5 hrs ago", type: "assign" },
  ]

  return (
    <GlassCard className="p-8">
      <h3 className="text-xl font-semibold text-foreground mb-8">Recent Activity</h3>
      
      <div className="relative pl-[18px] space-y-8 before:absolute before:inset-y-0 before:left-2 before:w-[1px] before:bg-border">
        {activities.map((act) => {
          let dotColor = "bg-muted shadow-sm"
          if (act.type === "complete") dotColor = "bg-success-bg border-success-border"
          if (act.type === "add") dotColor = "bg-primary text-primary-foreground"

          return (
            <div key={act.id} className="relative">
              <span className={`absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full ${dotColor} border-[2px] border-border z-10`} />
              <p className="text-base font-medium text-foreground leading-snug">{act.text}</p>
              <span className="text-sm font-mono text-muted-foreground mt-1 block">{act.time}</span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
