'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 🗑️ Action to Delete a Notice
export async function deleteNotice(id: string) {
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
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const image = formData.get('image') as File | null

  if (!title || !content) {
    return { error: 'Both title and content are required.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to post a notice.' }
  }

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
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assignedTo = formData.get('assigned_to') as string

  if (!title || !assignedTo) {
    console.error('Title and assignee are required to create a task.')
    return
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('Not logged in.')
    return
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (profileError || !adminProfile?.plant_id) {
    console.error('Failed to resolve plant_id for current user:', profileError)
    return
  }

  const { error } = await supabase.from('tasks').insert({
    title,
    description: description || null,
    assigned_to: assignedTo,
    created_by: user.id,
    plant_id: adminProfile.plant_id,
    task_type: 'general',
  })

  if (error) {
    console.error('Failed to create task:', error)
    return
  }

  revalidatePath('/portal/tasks')
  revalidatePath('/portal')
}

export async function completeTask(taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) {
    console.error('Failed to complete task:', error)
    return
  }

  revalidatePath('/portal/tasks')
  revalidatePath('/portal')
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
  const title = formData.get('title') as string
  const frequency = formData.get('frequency') as string
  const dayOfWeekRaw = formData.get('day_of_week') as string
  const targetDate = formData.get('target_date') as string

  if (!title || !frequency) {
    console.error('Title and frequency are required.')
    return
  }

  if (!['daily', 'weekly', 'one-off'].includes(frequency)) {
    console.error('Invalid frequency.')
    return
  }

  if (frequency === 'weekly' && !dayOfWeekRaw) {
    console.error('Day of week is required for weekly tasks.')
    return
  }

  if (frequency === 'one-off' && !targetDate) {
    console.error('Target date is required for one-off tasks.')
    return
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Not logged in.')
    return
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.plant_id) {
    console.error('Failed to resolve plant_id:', profileError)
    return
  }

  const { error } = await supabase.from('checklist_tasks').insert({
    title,
    frequency,
    day_of_week: frequency === 'weekly' ? parseInt(dayOfWeekRaw, 10) : null,
    target_date: frequency === 'one-off' ? targetDate : null,
    plant_id: profile.plant_id,
    created_by: user.id,
  })

  if (error) {
    console.error('Failed to create checklist task:', error)
    return
  }

  revalidatePath('/portal/tasks')
  revalidatePath('/portal')
}

// 🗑️ Admin: permanently delete a checklist task
export async function deleteChecklistTask(taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('checklist_tasks').delete().eq('id', taskId)

  if (error) {
    console.error('Failed to delete checklist task:', error)
    return
  }

  revalidatePath('/portal/tasks')
  revalidatePath('/portal')
}

// ✅ Staff/Admin: check or uncheck a task for today
export async function toggleTaskCompletion(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Not logged in.')
    return
  }

  const today = getTodayIST()

  const { data: existing, error: fetchError } = await supabase
    .from('checklist_completions')
    .select('id')
    .eq('task_id', taskId)
    .eq('completed_date', today)
    .maybeSingle()

  if (fetchError) {
    console.error('Failed to check existing completion:', fetchError)
    return
  }

  if (existing) {
    // Uncheck — RLS only allows this if it's their own completion (or they're an admin)
    const { error: deleteError } = await supabase
      .from('checklist_completions')
      .delete()
      .eq('id', existing.id)

    if (deleteError) {
      console.error('Failed to uncheck task (likely not your own completion):', deleteError)
      return
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
      }
      return
    }
  }

  revalidatePath('/portal/tasks')
  revalidatePath('/portal')
}

// 📡 Fetcher: today's valid tasks (daily + matching weekday + matching one-off date), with completion status
export async function getTodayTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.plant_id) return []

  const today = getTodayIST()
  const todayDOW = getDayOfWeek(today)

  const { data: tasks, error } = await supabase
    .from('checklist_tasks')
    .select('*, checklist_completions(completed_by, completed_date)')
    .eq('checklist_completions.completed_date', today) // filters the nested array, keeps parent rows (left join)
    .eq('plant_id', profile.plant_id)
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

// 📝 Submit a new complaint (Admins only)
export async function submitComplaint(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('image_url') as string | null

  if (!title?.trim() || !description?.trim()) {
    return { error: 'Title and description are required.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to submit a complaint.' }
  }

  // Server-side role check: only admins can submit
  const role = user.user_metadata?.role || 'staff'
  if (role !== 'local_admin' && role !== 'super_admin') {
    return { error: 'Only admins can submit complaints.' }
  }

  // Get the user's plant_id from the users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.plant_id) {
    return { error: 'Could not determine your facility. Contact your administrator.' }
  }

  const { error } = await supabase.from('complaints').insert({
    user_id: user.id,
    plant_id: profile.plant_id,
    title: title.trim(),
    description: description.trim(),
    image_url: imageUrl || '',
  })

  if (error) {
    console.error('Failed to submit complaint:', error)
    return { error: error.message }
  }

  revalidatePath('/portal/complaints')
  revalidatePath('/portal')
  redirect('/portal/complaints')
}

// ✅ Resolve a complaint (Staff/Admins)
export async function resolveComplaint(complaintId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('Not logged in.')
    return
  }

  const { error } = await supabase
    .from('complaints')
    .update({
      is_resolved: true,
      resolved_by: user.id,
      status: 'resolved',
    })
    .eq('id', complaintId)

  if (error) {
    console.error('Failed to resolve complaint:', error)
    return
  }

  revalidatePath('/portal/complaints')
  revalidatePath('/portal')
}

// 📡 Fetch all complaints (active first, then resolved), with reporter + resolver names
export async function getComplaints() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get user's plant_id for scoping
  const { data: profile } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.plant_id) return []

  const { data: complaints, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('plant_id', profile.plant_id)
    .order('is_resolved', { ascending: true })    // active (false) first
    .order('created_at', { ascending: false })     // newest first within each group

  if (error) {
    console.error('Failed to fetch complaints:', error)
    return []
  }

  if (!complaints || complaints.length === 0) return []

  // Collect all user IDs (reporters + resolvers) to batch-fetch names
  const allUserIds = [
    ...new Set(
      complaints
        .flatMap((c: any) => [c.user_id, c.resolved_by])
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
    status: c.status as string,
    is_resolved: (c.is_resolved ?? false) as boolean,
    created_at: c.created_at as string,
    reportedBy: nameMap[c.user_id] || 'Unknown',
    resolvedByName: c.resolved_by ? nameMap[c.resolved_by] || 'Unknown' : null,
  }))
}

// ============================================
// ANALYTICS SYSTEM
// ============================================

export async function getWeeklyAnalytics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get user's plant_id
  const { data: profile } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.plant_id) return null
  const plantId = profile.plant_id

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
  const chartData = []
  
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

  const { data: profile } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.plant_id) return []

  const { data: rooms, error } = await supabase
    .from('conference_rooms')
    .select('*')
    .eq('plant_id', profile.plant_id)
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

  const { data: profile } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.plant_id) return []

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  const { data: bookings, error } = await supabase
    .from('room_bookings')
    .select(`
      *,
      conference_rooms!inner(plant_id, name)
    `)
    .eq('conference_rooms.plant_id', profile.plant_id)
    .eq('booking_date', today)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Failed to fetch bookings:', error)
    return []
  }

  return bookings || []
}

// 📝 Book a room
export async function bookRoom(formData: FormData) {
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to book a room.' }
  }

  // Bonus: Collision Detection
  // Check if there are any bookings for this room on this date that overlap with the requested times.
  // Overlap condition: (new_start < existing_end) AND (new_end > existing_start)
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

// ✅ Mark a room as prepped (Cleaners/Admins)
export async function markRoomPrepped(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not logged in.' }

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