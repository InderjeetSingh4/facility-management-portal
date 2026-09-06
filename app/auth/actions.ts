// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter both email and password.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  redirect('/portal')
}

export async function signUpUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rawRole = (formData.get('role') as string || 'cleaner').toLowerCase().trim()
  const fullName = formData.get('full_name') as string

  if (!email || !password || !fullName) {
    return { error: 'All fields are required.' }
  }

  // Security: Public signup cannot self-assign privileged roles (super_admin, system_executive, local_admin)
  // Privileged roles must be assigned by authorized administrators.
  const allowedPublicRoles = ['housekeeper', 'employee']
  const assignedRole = allowedPublicRoles.includes(rawRole) ? rawRole : 'housekeeper'

  const supabase = await createClient()

  const { data: defaultPlant, error: plantLookupError } = await supabase
    .from('plants_public')
    .select('id')
    .limit(1)
    .single()

  if (plantLookupError || !defaultPlant) {
    console.log("🚨 PLANT LOOKUP FAILED:", plantLookupError)
    return { error: 'No facility is configured yet — contact an administrator.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: assignedRole,
        plant_id: defaultPlant.id,
        full_name: fullName,
        approval_status: 'pending'
      }
    }
  })

  if (error) {
    console.log("🚨 RAW ERROR DETAILS:", error.name, error.status, error)

    if (error.name === 'AuthRetryableFetchError') {
       return { error: 'Network failure: Could not connect to the authentication server.' }
    }

    if (error.message === '{}' || !error.message) {
       return { error: `Server error (status ${error.status ?? 'unknown'}) — check Supabase Postgres/Auth logs.` }
    }

    return { error: error.message }
  }

  await supabase.auth.signOut()
  redirect('/login')
}