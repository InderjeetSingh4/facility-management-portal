'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isSystemExecutive, isAdmin, canExecuteTasks, canManageOperations } from '@/lib/auth/rbac'

export interface AuthContext {
  user: any
  profile: {
    id: string
    role: string
    plant_id: string | null
    approval_status: string
    full_name: string
  }
  plantId: string
  role: string
}

export async function authorizeUser(allowedRoles?: string[]): Promise<AuthContext> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized: Authentication required.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, role, plant_id, approval_status, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Unauthorized: User profile not found.')
  }

  if (profile.approval_status !== 'approved') {
    throw new Error('Unauthorized: Account pending administrator approval.')
  }

  const role = profile.role || 'cleaner'
  const plantId = profile.plant_id || ''

  if (allowedRoles && allowedRoles.length > 0) {
    const isExec = isSystemExecutive(role)
    const allowedIncludesExec = allowedRoles.includes('system_executive') || allowedRoles.includes('executive')

    if (isExec && !allowedIncludesExec) {
      throw new Error('Forbidden: Insufficient permissions')
    }

    const isAllowed = allowedRoles.includes(role) || (isExec && allowedIncludesExec)
    if (!isAllowed) {
      throw new Error('Forbidden: Insufficient permissions')
    }
  }

  return { user, profile, plantId, role }
}

async function getPlantId(supabase: any, user: any) {
  let plantId = user?.app_metadata?.plant_id;
  if (!plantId && user?.id) {
    const { data } = await supabase.from('users').select('plant_id').eq('id', user.id).single();
    plantId = data?.plant_id;
  }
  return plantId;
}
import { redirect } from 'next/navigation'

// 🔔 Action to save notification preferences
export async function setNotificationPreference(enabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('users')
    .update({ notifications_enabled: enabled })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update notification preference:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/portal')
  return { success: true }
}

// 🗑️ Action to Delete a Notice
export async function deleteNotice(id: string) {
  await authorizeUser(['local_admin', 'super_admin'])
  const supabase = await createClient()
  
  const { error } = await supabase.from('notices').delete().eq('id', id)
  
  if (error) {
    console.error("Failed to delete notice:", error)
    return
  }

  revalidatePath('/portal')
}

// ✍️ Action to Create a New Notice (With Image Upload & Debugging)
export async function createNotice(prevState: any, formData: FormData) {
  const { user, plantId } = await authorizeUser(['local_admin', 'super_admin'])

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const image = formData.get('image') as File | null

  if (!title || !content) {
    return { error: 'Both title and content are required.' }
  }

  const supabase = await createClient()

  const authorName = user.email ? user.email.split('@')[0] : 'System Admin'
  let imageUrl = null

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('notice-images')
      .upload(fileName, image, {
        contentType: image.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: 'Failed to upload image.' }
    }

    const { data } = supabase.storage
      .from('notice-images')
      .getPublicUrl(fileName)
      
    imageUrl = data.publicUrl
  }

  console.log("Saving notice to database with image URL:", imageUrl)

  const { error } = await supabase.from('notices').insert({
    title: title,
    content: content,
    author_name: authorName,
    image_url: imageUrl
  })

  if (error) {
    console.error("Database insert error:", error)
    return { error: error.message }
  }

  revalidatePath('/portal')
  redirect('/portal')
}

// ============================================
// ASSIGNMENT-BASED TASKS (separate system — assigned to a specific person, untouched)
// ============================================

export async function createTask(formData: FormData) {
  try {
    const { user, plantId, role } = await authorizeUser(['local_admin', 'super_admin'])
    if (isSystemExecutive(role)) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const assignedTo = formData.get('assigned_to') as string

    if (!title || !assignedTo) {
      return { error: 'Title and assignee are required to create a task.' }
    }

    const supabase = await createClient()

    if (!plantId) {
      return { error: 'Failed to resolve plant_id for current user' }
    }

    const { error } = await supabase.from('tasks').insert({
      title,
      description: description || null,
      assigned_to: assignedTo,
      created_by: user.id,
      plant_id: plantId,
      task_type: 'general',
    })

    if (error) {
      console.error('Failed to create task:', error)
      return { error: error.message }
    }

    revalidatePath('/portal/tasks')
    revalidatePath('/portal')
    return { success: true }
  } catch (err: any) {
    return { error: 'Forbidden: Insufficient permissions' }
  }
}

export async function completeTask(taskId: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role, approval_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.approval_status !== 'approved') {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const role = profile.role || 'cleaner'
    if (isSystemExecutive(role) || (!canExecuteTasks(role) && !isAdmin(role))) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) {
      console.error('Failed to complete task:', error)
      return { error: error.message }
    }

    revalidatePath('/portal/tasks')
    revalidatePath('/portal')
    return { success: true }
  } catch (err: any) {
    return { error: 'Forbidden: Insufficient permissions' }
  }
}

// ============================================
// SMART DAILY CHECKLIST (shared, global — daily / weekly / one-off)
// ============================================

function getTodayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

function getDayOfWeek(dateStr: string): number {
  // 0 = Sunday, parsed as UTC midnight so the timezone of the *server* can't shift the day
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay()
}

// ➕ Admin: create a checklist task
export async function createChecklistTask(formData: FormData) {
  try {
    const { user, plantId, role } = await authorizeUser(['local_admin', 'super_admin'])
    if (isSystemExecutive(role)) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const title = formData.get('title') as string
    const frequency = formData.get('frequency') as string
    const dayOfWeekRaw = formData.get('day_of_week') as string
    const targetDate = formData.get('target_date') as string

    if (!title || !frequency) {
      return { error: 'Title and frequency are required.' }
    }

    if (!['daily', 'weekly', 'one-off'].includes(frequency)) {
      return { error: 'Invalid frequency.' }
    }

    if (frequency === 'weekly' && !dayOfWeekRaw) {
      return { error: 'Day of week is required for weekly tasks.' }
    }

    if (frequency === 'one-off' && !targetDate) {
      return { error: 'Target date is required for one-off tasks.' }
    }

    const supabase = await createClient()

    if (!plantId) {
      return { error: 'Failed to resolve plant_id' }
    }

    const { error } = await supabase.from('checklist_tasks').insert({
      title,
      frequency,
      day_of_week: frequency === 'weekly' ? parseInt(dayOfWeekRaw, 10) : null,
      target_date: frequency === 'one-off' ? targetDate : null,
      plant_id: plantId,
      created_by: user.id,
    })

    if (error) {
      console.error('Failed to create checklist task:', error)
      return { error: error.message }
    }

    revalidatePath('/portal/tasks')
    revalidatePath('/portal')
    return { success: true }
  } catch (err: any) {
    return { error: 'Forbidden: Insufficient permissions' }
  }
}

// 🗑️ Admin: permanently delete a checklist task
export async function deleteChecklistTask(taskId: string) {
  try {
    const { role } = await authorizeUser(['local_admin', 'super_admin'])
    if (isSystemExecutive(role)) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const supabase = await createClient()

    const { error } = await supabase.from('checklist_tasks').delete().eq('id', taskId)

    if (error) {
      console.error('Failed to delete checklist task:', error)
      return { error: error.message }
    }

    revalidatePath('/portal/tasks')
    revalidatePath('/portal')
    return { success: true }
  } catch (err: any) {
    return { error: 'Forbidden: Insufficient permissions' }
  }
}

// ✅ Staff/Admin: check or uncheck a task for today (Strictly Forbidden for System Executive)
export async function toggleTaskCompletion(taskId: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role, approval_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.approval_status !== 'approved') {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const role = profile.role || 'cleaner'

    // Explicit System Executive barrier:
    if (isSystemExecutive(role)) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    // Must be authorized to execute tasks (cleaner, housekeeper, local_admin, super_admin)
    if (!canExecuteTasks(role) && !isAdmin(role)) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const today = getTodayIST()

    const { data: existing, error: fetchError } = await supabase
      .from('checklist_completions')
      .select('id, completed_by')
      .eq('task_id', taskId)
      .eq('completed_date', today)
      .maybeSingle()

    if (fetchError) {
      console.error('Failed to check existing completion:', fetchError)
      return { error: fetchError.message }
    }

    if (existing) {
      // Uncheck — only own completion or admin
      if (existing.completed_by !== user.id && !isAdmin(role)) {
        return { error: 'Forbidden: Insufficient permissions' }
      }

      const { error: deleteError } = await supabase
        .from('checklist_completions')
        .delete()
        .eq('id', existing.id)

      if (deleteError) {
        console.error('Failed to uncheck task (likely not your own completion):', deleteError)
        return { error: deleteError.message }
      }
    } else {
      const { error: insertError } = await supabase.from('checklist_completions').insert({
        task_id: taskId,
        completed_by: user.id,
        completed_date: today,
      })

      if (insertError) {
        if (insertError.code === '23505') {
          console.log('Someone else just completed this task — refreshing.')
        } else {
          console.error('Failed to complete task:', insertError)
          return { error: insertError.message }
        }
      }
    }

    revalidatePath('/portal/tasks')
    revalidatePath('/portal')
    return { success: true }
  } catch (err: any) {
    console.error('toggleTaskCompletion error:', err)
    return { error: 'Forbidden: Insufficient permissions' }
  }
}

// 📡 Fetcher: today's valid tasks (daily + matching weekday + matching one-off date), with completion status
export async function getTodayTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const plantId = await getPlantId(supabase, user);
  if (!plantId) return []

  const today = getTodayIST()
  const todayDOW = getDayOfWeek(today)

  const { data: tasks, error } = await supabase
    .from('checklist_tasks')
    .select('*, checklist_completions(completed_by, completed_date)')
    .eq('checklist_completions.completed_date', today) // filters the nested array, keeps parent rows (left join)
    .eq('plant_id', plantId)
    .or(`frequency.eq.daily,and(frequency.eq.weekly,day_of_week.eq.${todayDOW}),and(frequency.eq.one-off,target_date.eq.${today})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Failed to fetch today's tasks:", error)
    return []
  }

  if (!tasks || tasks.length === 0) return []

  const completedByIds = [
    ...new Set(
      tasks.flatMap((t: any) => t.checklist_completions).map((c: any) => c.completed_by).filter(Boolean)
    ),
  ]

  let nameMap: Record<string, string> = {}
  if (completedByIds.length > 0) {
    const { data: completers } = await supabase.from('users').select('id, full_name').in('id', completedByIds)
    nameMap = Object.fromEntries((completers || []).map((u) => [u.id, u.full_name]))
  }

  return tasks.map((task: any) => {
    const completion = task.checklist_completions?.[0] || null
    return {
      id: task.id as string,
      title: task.title as string,
      frequency: task.frequency as string,
      day_of_week: task.day_of_week as number | null,
      target_date: task.target_date as string | null,
      isCompleted: !!completion,
      completedByName: completion ? nameMap[completion.completed_by] || 'Unknown' : null,
    }
  })
}

// ============================================
// COMPLAINTS SYSTEM
// ============================================

// 📝 Submit a new complaint (Admins and Staff only, forbidden for System Executive)
export async function submitComplaint(formData: FormData) {
  try {
    const { user, plantId } = await authorizeUser(['local_admin', 'super_admin', 'cleaner', 'housekeeper', 'employee'])

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('image_url') as string | null

    if (!title?.trim() || !description?.trim()) {
      return { error: 'Title and description are required.' }
    }

    const supabase = await createClient()

    if (!plantId) {
      return { error: 'Could not determine your facility. Contact your administrator.' }
    }

    const { data: insertedData, error } = await supabase.from('complaints').insert({
      user_id: user.id,
      plant_id: plantId,
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl || '',
      status: 'pending',
    }).select().single()

    if (error) {
      console.error('Failed to submit complaint to database:', error)
      return { error: error.message }
    }

    console.log('Successfully inserted complaint row:', insertedData)

    // Trigger Role-Based Native Push Notification to Admins & Housekeepers/Cleaners
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      fetch(`${baseUrl}/api/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId,
          targetRoles: ['local_admin', 'super_admin', 'cleaner', 'housekeeper'],
          title: `🚨 New Maintenance Complaint: ${title.trim()}`,
          notificationBody: description.trim().slice(0, 100),
          data: { url: '/portal/complaints' },
        }),
      }).catch((err) => console.error('Error triggering push notification:', err))
    } catch (pushErr) {
      console.error('Push notification trigger error:', pushErr)
    }

    revalidatePath('/portal/complaints')
    revalidatePath('/portal')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error in submitComplaint server action:', err)
    return { error: err?.message || 'Server error occurred while submitting complaint.' }
  }
}

// 1. Worker/Staff: Submit complaint for approval
export async function submitForApproval(complaintId: string) {
  const { user } = await authorizeUser(['cleaner', 'housekeeper', 'employee'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('complaints')
    .update({
      status: 'reviewed',
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', complaintId)

  if (error) {
    console.error('Failed to submit complaint for approval:', error)
    return
  }

  revalidatePath('/portal/complaints')
  revalidatePath('/portal')
}

// 2. Admin/Manager: Approve complaint (Forbidden for System Executive)
export async function approveComplaint(complaintId: string) {
  const { user } = await authorizeUser(['local_admin', 'super_admin'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('complaints')
    .update({
      status: 'resolved',
      is_resolved: true,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', complaintId)

  if (error) {
    console.error('Failed to approve complaint:', error)
    return
  }

  revalidatePath('/portal/complaints')
  revalidatePath('/portal')
}

// 3. Admin/Manager: Reject complaint (Forbidden for System Executive)
export async function rejectComplaint(complaintId: string, rejectionNote?: string) {
  const { user } = await authorizeUser(['local_admin', 'super_admin'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('complaints')
    .update({
      status: 'dismissed',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      rejection_note: rejectionNote || null,
    })
    .eq('id', complaintId)

  if (error) {
    console.error('Failed to reject complaint:', error)
    return
  }

  revalidatePath('/portal/complaints')
  revalidatePath('/portal')
}

// 📡 Fetch all complaints with complete audit trail data
export async function getComplaints() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const plantId = await getPlantId(supabase, user);
  if (!plantId) return []

  const { data: complaints, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch complaints:', error)
    return []
  }

  if (!complaints || complaints.length === 0) return []

  // Collect all user IDs (reporters, resolvers, approvers) to batch-fetch names
  const allUserIds = [
    ...new Set(
      complaints
        .flatMap((c: any) => [c.user_id, c.resolved_by, c.approved_by])
        .filter(Boolean)
    ),
  ]

  let nameMap: Record<string, string> = {}
  if (allUserIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', allUserIds)

    nameMap = Object.fromEntries((users || []).map((u) => [u.id, u.full_name]))
  }

  return complaints.map((c: any) => ({
    id: c.id as string,
    title: c.title as string,
    description: c.description as string,
    image_url: c.image_url as string,
    status: (c.status || (c.is_resolved ? 'resolved' : 'pending')) as string,
    is_resolved: (c.is_resolved ?? false) as boolean,
    created_at: c.created_at as string,
    resolved_at: c.resolved_at as string | null,
    approved_at: c.approved_at as string | null,
    rejection_note: c.rejection_note as string | null,
    reportedBy: nameMap[c.user_id] || 'Unknown',
    resolvedByName: c.resolved_by ? nameMap[c.resolved_by] || 'Unknown' : null,
    approvedByName: c.approved_by ? nameMap[c.approved_by] || 'Unknown' : null,
  }))
}

// ============================================
// ANALYTICS SYSTEM
// ============================================

export async function getWeeklyAnalytics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const plantId = await getPlantId(supabase, user);
  if (!plantId) return null

  // 1. Complaints Stats
  const { data: complaints } = await supabase
    .from('complaints')
    .select('is_resolved')
    .eq('plant_id', plantId)
  
  const openComplaints = complaints?.filter(c => !c.is_resolved).length || 0
  const resolvedComplaints = complaints?.filter(c => c.is_resolved).length || 0

  // 2. Tasks Completed (last 7 days)
  // Generate the last 7 days (YYYY-MM-DD)
  const last7Days: string[] = []
  const chartData: { date: string, name: string, completions: number }[] = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    // use en-CA for YYYY-MM-DD format based on local time
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d)
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' })
    last7Days.push(dateStr)
    chartData.push({ date: dateStr, name: dayName, completions: 0 })
  }

  // Fetch all tasks for this plant to filter completions
  const { data: plantTasks } = await supabase
    .from('checklist_tasks')
    .select('id')
    .eq('plant_id', plantId)

  const taskIds = plantTasks?.map(t => t.id) || []

  if (taskIds.length > 0) {
    const { data: completions } = await supabase
      .from('checklist_completions')
      .select('completed_date')
      .in('task_id', taskIds)
      .in('completed_date', last7Days)

    if (completions) {
      completions.forEach((c: any) => {
        const match = chartData.find(d => d.date === c.completed_date)
        if (match) {
          match.completions++
        }
      })
    }
  }
  
  const totalCompletedTasks = chartData.reduce((sum, d) => sum + d.completions, 0)

  return {
    chartData,
    totalCompletedTasks,
    openComplaints,
    resolvedComplaints
  }
}

// ============================================
// CONFERENCE ROOMS SYSTEM
// ============================================

// 📡 Fetch all rooms for the user's facility
export async function getConferenceRooms() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const plantId = await getPlantId(supabase, user);
  if (!plantId) return []

  const { data: rooms, error } = await supabase
    .from('conference_rooms')
    .select('*')
    .eq('plant_id', plantId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch conference rooms:', error)
    return []
  }

  return rooms || []
}

// 📡 Fetch today's bookings for the user's facility
export async function getTodayBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const plantId = await getPlantId(supabase, user);
  if (!plantId) return []

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  const { data: bookings, error } = await supabase
    .from('room_bookings')
    .select(`
      *,
      conference_rooms!inner(plant_id, name)
    `)
    .eq('conference_rooms.plant_id', plantId)
    .eq('booking_date', today)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Failed to fetch bookings:', error)
    return []
  }

  return bookings || []
}

// 📝 Book a room (Forbidden for System Executive)
export async function bookRoom(formData: FormData) {
  const { user } = await authorizeUser(['employee', 'local_admin', 'super_admin'])

  const roomId = formData.get('room_id') as string
  const bookingDate = formData.get('booking_date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const title = formData.get('title') as string
  const prepItems = formData.getAll('prep_items') as string[]

  if (!roomId || !bookingDate || !startTime || !endTime || !title?.trim()) {
    return { error: 'All fields are required.' }
  }

  if (startTime >= endTime) {
    return { error: 'Start time must be before end time.' }
  }

  const supabase = await createClient()

  // Bonus: Collision Detection
  // Check if there are any bookings for this room on this date that overlap with the requested times.
  const { data: overlapping, error: checkError } = await supabase
    .from('room_bookings')
    .select('id')
    .eq('room_id', roomId)
    .eq('booking_date', bookingDate)
    .lt('start_time', endTime)
    .gt('end_time', startTime)

  if (checkError) {
    return { error: 'Failed to check room availability.' }
  }

  if (overlapping && overlapping.length > 0) {
    return { error: 'This room is already booked during the requested time.' }
  }

  const { error } = await supabase.from('room_bookings').insert({
    room_id: roomId,
    booked_by: user.id,
    booking_date: bookingDate,
    start_time: startTime,
    end_time: endTime,
    title: title.trim(),
    prep_items: prepItems,
  })

  if (error) {
    console.error('Failed to book room:', error)
    return { error: error.message }
  }

  revalidatePath('/portal/conference')
  return { success: true }
}

// ✅ Mark a room as prepped (Cleaners/Admins, Forbidden for System Executive)
export async function markRoomPrepped(bookingId: string) {
  const { user } = await authorizeUser(['cleaner', 'housekeeper', 'local_admin', 'super_admin'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('room_bookings')
    .update({
      is_prepped: true,
      prepped_by: user.id,
    })
    .eq('id', bookingId)

  if (error) {
    console.error('Failed to mark room as prepped:', error)
    return { error: error.message }
  }

  revalidatePath('/portal/conference')
  return { success: true }
}

// ============================================
// WEB PUSH NOTIFICATIONS
// ============================================

export async function saveSubscription(subscription: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not logged in' }

  // Check if subscription already exists to avoid duplicates
  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .contains('subscription', { endpoint: subscription.endpoint })
    .single()

  if (existing) {
    return { success: true } // Already subscribed
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .insert({
      user_id: user.id,
      subscription: subscription
    })

  if (error) {
    console.error('Failed to save subscription:', error)
    return { error: error.message }
  }

  return { success: true }
}

// ── Admin Approvals (Forbidden for System Executive) ─────────────────────────
export async function approveUser(userId: string) {
  await authorizeUser(['local_admin', 'super_admin'])
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ approval_status: 'approved' })
    .eq('id', userId)

  if (error) {
    console.error('Failed to approve user:', error)
    throw new Error('Failed to approve user')
  }

  revalidatePath('/portal/staff')
}

export async function rejectUser(userId: string) {
  await authorizeUser(['local_admin', 'super_admin'])
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ approval_status: 'rejected' })
    .eq('id', userId)

  if (error) {
    console.error('Failed to reject user:', error)
    throw new Error('Failed to reject user')
  }

  revalidatePath('/portal/staff')
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const { role } = await authorizeUser(['local_admin', 'super_admin'])
    if (isSystemExecutive(role)) {
      return { error: 'Forbidden: Insufficient permissions' }
    }

    const normalizedRole = newRole.toLowerCase().trim()
    const validRoles = ['super_admin', 'system_executive', 'local_admin', 'cleaner', 'housekeeper', 'employee', 'staff']
    if (!validRoles.includes(normalizedRole)) {
      return { error: 'Invalid role specification' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('users')
      .update({ role: normalizedRole })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update user role:', error)
      return { error: error.message }
    }

    revalidatePath('/portal/staff')
    revalidatePath('/portal/tasks')
    revalidatePath('/portal')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Forbidden: Insufficient permissions' }
  }
}

// ── Attendance (Forbidden for System Executive) ──────────────────────────────

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function markAttendance(lat: number, lng: number) {
  const { user, plantId } = await authorizeUser(['cleaner', 'housekeeper', 'employee'])
  const supabase = await createClient()

  if (!plantId) {
    return { success: false, message: 'No facility assigned to your account' }
  }

  // Check if attendance already marked today (in Asia/Kolkata timezone)
  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('id, status')
    .eq('user_id', user.id)
    .gte('created_at', `${todayDate}T00:00:00+05:30`)
    .lt('created_at', `${todayDate}T23:59:59+05:30`)
    .limit(1)

  if (existingAttendance && existingAttendance.length > 0) {
    if (existingAttendance[0].status === 'present') {
      return { success: false, message: 'Attendance already marked for today' }
    }
    // Delete previous rejected attempt so user can retry
    await supabase
      .from('attendance')
      .delete()
      .eq('id', existingAttendance[0].id)
  }

  // Fetch plant location
  const { data: plant, error: plantError } = await supabase
    .from('plants')
    .select('latitude, longitude, geofence_radius_meters')
    .eq('id', plantId)
    .single()

  if (plantError || !plant || plant.latitude === null || plant.longitude === null) {
    return { success: false, message: 'Facility location data is missing. Contact an administrator.' }
  }

  const distance = calculateDistanceInMeters(lat, lng, plant.latitude, plant.longitude)
  const isWithinRange = distance <= plant.geofence_radius_meters
  const status = isWithinRange ? 'present' : 'rejected_out_of_range'
  
  const { error: insertError } = await supabase
    .from('attendance')
    .insert({
      user_id: user.id,
      plant_id: plantId,
      check_in_latitude: lat,
      check_in_longitude: lng,
      distance_from_plant_meters: Math.round(distance),
      status: status
    })

  if (insertError) {
    console.error('Failed to mark attendance:', insertError)
    return { success: false, message: `Failed to record attendance: ${insertError.message}` }
  }

  revalidatePath('/portal')
  
  if (!isWithinRange) {
    return { 
      success: false, 
      message: `You appear to be ${Math.round(distance)}m away. You must be at the facility (within ${plant.geofence_radius_meters}m) to mark attendance.`
    }
  }

  return { success: true, message: 'Attendance marked successfully' }
}

export async function markCheckOut() {
  const { user } = await authorizeUser(['cleaner', 'housekeeper', 'employee'])
  const supabase = await createClient()

  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  // Find today's successful attendance record that hasn't been checked out yet
  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'present')
    .is('check_out_time', null)
    .gte('created_at', `${todayDate}T00:00:00+05:30`)
    .lt('created_at', `${todayDate}T23:59:59+05:30`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!existingAttendance) {
    return { success: false, message: 'No active check-in found for today' }
  }

  const { error } = await supabase
    .from('attendance')
    .update({ check_out_time: new Date().toISOString() })
    .eq('id', existingAttendance.id)

  if (error) {
    console.error('Failed to mark checkout:', error)
    return { success: false, message: 'Failed to record checkout' }
  }

  revalidatePath('/portal')
  return { success: true, message: 'Checked out successfully' }
}

// 📲 Save Native FCM Device Token to User Profile
export async function saveDeviceToken(token: string) {
  if (!token?.trim()) return { success: false, error: 'Token is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ device_token: token.trim() })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update device token:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// 📄 Fetch 7-Day Weekly Report Data for Corporate PDF Generation
export async function getWeeklyReportData() {
  const { plantId } = await authorizeUser()
  const supabase = await createClient()

  if (!plantId) return { success: false, error: 'No plant assigned' }

  // 1. Fetch Facility Details
  const { data: plant } = await supabase
    .from('plants')
    .select('name, code')
    .eq('id', plantId)
    .single()

  const plantName = plant?.name || 'Facility Unit'
  const plantCode = plant?.code || 'FAC-01'

  // Calculate 7-day threshold
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoISO = sevenDaysAgo.toISOString()
  const sevenDaysAgoDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(sevenDaysAgo)

  // 2. Fetch Complaints resolved/approved in the last 7 days
  const { data: complaints } = await supabase
    .from('complaints')
    .select('*')
    .eq('plant_id', plantId)
    .gte('created_at', sevenDaysAgoISO)

  const approvedComplaints = (complaints || []).filter(
    (c: any) => c.status === 'approved' || c.status === 'resolved' || c.is_resolved === true
  )

  // 3. Fetch Tasks completed in the last 7 days
  const { data: plantTasks } = await supabase
    .from('checklist_tasks')
    .select('id, title')
    .eq('plant_id', plantId)

  const taskMap = Object.fromEntries((plantTasks || []).map((t: any) => [t.id, t.title]))
  const taskIds = (plantTasks || []).map((t: any) => t.id)

  let completedTasks: any[] = []
  if (taskIds.length > 0) {
    const { data: completions } = await supabase
      .from('checklist_completions')
      .select('id, task_id, completed_by, completed_date')
      .in('task_id', taskIds)
      .gte('completed_date', sevenDaysAgoDateStr)

    completedTasks = completions || []
  }

  // 4. Collect User IDs to batch fetch names
  const userIds = [
    ...new Set([
      ...approvedComplaints.flatMap((c: any) => [c.user_id, c.resolved_by, c.approved_by]),
      ...completedTasks.map((ct: any) => ct.completed_by),
    ].filter(Boolean)),
  ]

  let nameMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: users } = await supabase.from('users').select('id, full_name').in('id', userIds)
    nameMap = Object.fromEntries((users || []).map((u: any) => [u.id, u.full_name]))
  }

  // 5. Build unified report item records
  const reportItems: {
    id: string
    title: string
    type: 'Complaint' | 'Task Checklist'
    location: string
    resolvedBy: string
    timestamp: string
  }[] = []

  // Add approved complaints
  approvedComplaints.forEach((c: any) => {
    const resolverName = c.resolved_by
      ? nameMap[c.resolved_by]
      : c.approved_by
      ? nameMap[c.approved_by]
      : nameMap[c.user_id] || 'Staff Member'

    reportItems.push({
      id: c.id,
      title: c.title,
      type: 'Complaint',
      location: `${plantName} (${plantCode})`,
      resolvedBy: resolverName,
      timestamp: new Date(c.approved_at || c.resolved_at || c.created_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  })

  // Add completed checklist tasks
  completedTasks.forEach((ct: any) => {
    reportItems.push({
      id: ct.id,
      title: taskMap[ct.task_id] || 'Daily Checklist Item',
      type: 'Task Checklist',
      location: `${plantName} (${plantCode})`,
      resolvedBy: nameMap[ct.completed_by] || 'Staff Member',
      timestamp: `${ct.completed_date}`,
    })
  })

  return {
    success: true,
    plantName,
    plantCode,
    generatedAt: new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    period: 'Last 7 Days',
    totalResolved: reportItems.length,
    items: reportItems,
  }
}

// 📊 Fetch High-Level Metrics for System Executive Dashboard & Reports
export async function getExecutiveMetrics() {
  const { plantId } = await authorizeUser()
  const supabase = await createClient()

  const todayDate = getTodayIST()
  const todayDOW = getDayOfWeek(todayDate)

  // 1. Tasks Stats
  const { data: plantTasks } = await supabase
    .from('checklist_tasks')
    .select('id, title, frequency, day_of_week, target_date')
    .eq('plant_id', plantId)

  const allPlantTasks = plantTasks || []
  const todayValidTasks = allPlantTasks.filter((t: any) => {
    if (t.frequency === 'daily') return true
    if (t.frequency === 'weekly' && t.day_of_week === todayDOW) return true
    if (t.frequency === 'one-off' && t.target_date === todayDate) return true
    return false
  })

  const taskIds = todayValidTasks.map((t: any) => t.id)
  let completedTaskCount = 0

  if (taskIds.length > 0) {
    const { data: completions } = await supabase
      .from('checklist_completions')
      .select('id, task_id')
      .in('task_id', taskIds)
      .eq('completed_date', todayDate)

    completedTaskCount = completions ? new Set(completions.map((c: any) => c.task_id)).size : 0
  }

  const totalTasksToday = todayValidTasks.length
  const pendingTasksToday = Math.max(0, totalTasksToday - completedTaskCount)
  const pastOneOffs = allPlantTasks.filter((t: any) => t.frequency === 'one-off' && t.target_date && t.target_date < todayDate)
  const overdueTasksCount = pastOneOffs.length
  const taskCompletionRate = totalTasksToday > 0 ? Math.round((completedTaskCount / totalTasksToday) * 100) : 0

  // 2. Complaints Stats
  const { data: complaints } = await supabase
    .from('complaints')
    .select('id, status, is_resolved, created_at, resolved_at, approved_at')
    .eq('plant_id', plantId)

  const allComplaints = complaints || []
  const openComplaintsCount = allComplaints.filter((c: any) => c.status === 'pending' || c.status === 'open' || !c.status).length
  const inProgressComplaintsCount = allComplaints.filter((c: any) => c.status === 'reviewed' || c.status === 'pending_approval').length
  const resolvedComplaintsCount = allComplaints.filter((c: any) => c.status === 'resolved' || c.status === 'approved' || c.is_resolved === true).length
  const totalComplaintsCount = allComplaints.length
  const complaintResolutionRate = totalComplaintsCount > 0 ? Math.round((resolvedComplaintsCount / totalComplaintsCount) * 100) : 0

  let totalResolutionMinutes = 0
  let resolvedWithTimestampsCount = 0
  allComplaints.forEach((c: any) => {
    const end = c.approved_at || c.resolved_at
    if (end && c.created_at) {
      const diffMs = new Date(end).getTime() - new Date(c.created_at).getTime()
      if (diffMs > 0) {
        totalResolutionMinutes += Math.round(diffMs / (1000 * 60))
        resolvedWithTimestampsCount++
      }
    }
  })
  const avgResolutionTimeMinutes = resolvedWithTimestampsCount > 0 
    ? Math.round(totalResolutionMinutes / resolvedWithTimestampsCount)
    : 0

  // 3. Staff Stats
  const [
    { data: staffUsers },
    { data: activeAttendances },
    { data: pendingUsers }
  ] = await Promise.all([
    supabase.from('users').select('id, full_name, role, approval_status').eq('plant_id', plantId).eq('approval_status', 'approved'),
    supabase.from('attendance').select('user_id').eq('plant_id', plantId).eq('status', 'present').is('check_out_time', null).gte('created_at', `${todayDate}T00:00:00+05:30`).lt('created_at', `${todayDate}T23:59:59+05:30`),
    supabase.from('users').select('id').eq('plant_id', plantId).eq('approval_status', 'pending')
  ])

  const totalStaffCount = staffUsers?.length || 0
  const onDutyCount = activeAttendances ? new Set(activeAttendances.map(a => a.user_id)).size : 0
  const offDutyCount = Math.max(0, totalStaffCount - onDutyCount)
  const pendingApprovalsCount = pendingUsers?.length || 0
  const housekeepingCount = (staffUsers || []).filter((u: any) => u.role === 'cleaner' || u.role === 'housekeeper' || u.role === 'employee').length
  const managementCount = (staffUsers || []).filter((u: any) => u.role === 'local_admin' || u.role === 'super_admin' || u.role === 'system_executive').length

  // 4. Attendance Stats
  const { data: todayAttendanceLogs } = await supabase
    .from('attendance')
    .select('id, user_id, status, created_at, check_out_time, distance_from_plant_meters, users(full_name, role)')
    .eq('plant_id', plantId)
    .gte('created_at', `${todayDate}T00:00:00+05:30`)
    .lt('created_at', `${todayDate}T23:59:59+05:30`)
    .order('created_at', { ascending: false })

  const presentCount = (todayAttendanceLogs || []).filter((a: any) => a.status === 'present').length
  const outOfRangeCount = (todayAttendanceLogs || []).filter((a: any) => a.status === 'rejected_out_of_range').length
  const absentCount = Math.max(0, totalStaffCount - presentCount)
  const attendanceRate = totalStaffCount > 0 ? Math.round((presentCount / totalStaffCount) * 100) : 0

  // 5. Conference Room Stats
  const [{ data: rooms }, { data: todayBookings }] = await Promise.all([
    supabase.from('conference_rooms').select('id, name, capacity').eq('plant_id', plantId),
    supabase.from('room_bookings').select('id, room_id, start_time, end_time, title, is_prepped, conference_rooms!inner(plant_id)').eq('conference_rooms.plant_id', plantId).eq('booking_date', todayDate)
  ])

  const totalRoomsCount = rooms?.length || 0
  const bookingsToday = todayBookings || []
  
  const nowIST = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  const occupiedRoomIds = new Set(
    bookingsToday
      .filter((b: any) => b.start_time <= nowIST && b.end_time > nowIST)
      .map((b: any) => b.room_id)
  )
  const occupiedRoomsCount = occupiedRoomIds.size
  const availableRoomsCount = Math.max(0, totalRoomsCount - occupiedRoomsCount)
  const roomUtilizationRate = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0

  // 6. Operational 7-day Trends
  const last7Days: { date: string; name: string; completions: number; complaints: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d)
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' })
    last7Days.push({ date: dateStr, name: dayName, completions: 0, complaints: 0 })
  }

  const allPlantTaskIds = allPlantTasks.map((t: any) => t.id)
  if (allPlantTaskIds.length > 0) {
    const { data: trendCompletions } = await supabase
      .from('checklist_completions')
      .select('completed_date')
      .in('task_id', allPlantTaskIds)
      .in('completed_date', last7Days.map(d => d.date))

    if (trendCompletions) {
      trendCompletions.forEach((c: any) => {
        const item = last7Days.find(d => d.date === c.completed_date)
        if (item) item.completions++
      })
    }
  }

  const sevenDaysAgoISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const recentComplaints = allComplaints.filter((c: any) => c.created_at >= sevenDaysAgoISO)
  recentComplaints.forEach((c: any) => {
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(c.created_at))
    const item = last7Days.find(d => d.date === dateStr)
    if (item) item.complaints++
  })

  return {
    tasks: {
      total: totalTasksToday,
      completed: completedTaskCount,
      pending: pendingTasksToday,
      overdue: overdueTasksCount,
      completionRate: taskCompletionRate,
    },
    complaints: {
      total: totalComplaintsCount,
      open: openComplaintsCount,
      inProgress: inProgressComplaintsCount,
      resolved: resolvedComplaintsCount,
      resolutionRate: complaintResolutionRate,
      avgResolutionMinutes: avgResolutionTimeMinutes,
    },
    staff: {
      total: totalStaffCount,
      onDuty: onDutyCount,
      offDuty: offDutyCount,
      housekeeping: housekeepingCount,
      management: managementCount,
      pendingApprovals: pendingApprovalsCount,
    },
    attendance: {
      totalStaff: totalStaffCount,
      present: presentCount,
      absent: absentCount,
      outOfRange: outOfRangeCount,
      attendanceRate: attendanceRate,
      todayLogs: (todayAttendanceLogs || []).slice(0, 10).map((l: any) => ({
        id: l.id,
        userName: l.users?.full_name || 'Staff Member',
        userRole: l.users?.role || 'Staff',
        status: l.status,
        checkIn: new Date(l.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        checkOut: l.check_out_time ? new Date(l.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null,
        distance: l.distance_from_plant_meters,
      })),
    },
    conference: {
      totalRooms: totalRoomsCount,
      availableRooms: availableRoomsCount,
      occupiedRooms: occupiedRoomsCount,
      todayBookingsCount: bookingsToday.length,
      utilizationRate: roomUtilizationRate,
    },
    trends: {
      dailyStats: last7Days,
    }
  }
}


