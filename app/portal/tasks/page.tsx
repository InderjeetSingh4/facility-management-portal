'use client'

import { Plus, CheckCircle2, Circle } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { createClient } from '@/lib/supabase/client'
import { getTodayTasks } from '../actions'
import { Suspense, useEffect, useState } from 'react'
import TaskListClient from './TaskListClient'
import SkeletonCard from '@/components/ui/SkeletonCard'
import { motion } from "framer-motion"

function TasksContent({ isAdmin, userId }: { isAdmin: boolean, userId: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getTodayTasks()
        setTasks(data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <TasksSkeleton />
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12">
      <TaskListClient tasks={tasks} isAdmin={isAdmin} currentUserId={userId} />
    </div>
  )
}

function TasksSkeleton() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12 space-y-4">
      <SkeletonCard lines={2} />
      <SkeletonCard lines={2} />
      <SkeletonCard lines={2} />
    </div>
  )
}

export default function TasksPage() {
  const [userState, setUserState] = useState<{ isAdmin: boolean; userId: string } | null>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      const role = user?.user_metadata?.role || 'staff'
      const isAdmin = role === 'local_admin' || role === 'super_admin'
      setUserState({ isAdmin, userId: user?.id || '' })
    }
    getUser()
  }, [])

  const isAdmin = userState?.isAdmin ?? false
  const userId = userState?.userId ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6"
    >
      <PageHeader
        title="Task Management"
        description="Track and manage daily cleaning and maintenance checklists."
        showBackButton={true}
        action={
          isAdmin ? (
            <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white focus:ring-2 focus:ring-indigo-500/40 px-5 py-2.5 text-sm font-bold active:scale-95 transition-all duration-200 shadow-md shadow-indigo-500/20">
              <Plus size={16} />
              New Task
            </button>
          ) : undefined
        }
      />

      <TasksContent isAdmin={isAdmin} userId={userId} />
    </motion.div>
  )
}