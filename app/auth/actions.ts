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
  const role = formData.get('role') as string
  const fullName = formData.get('full_name') as string

  if (!email || !password || !role || !fullName) {
    return { error: 'All fields are required.' }
  }

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
        role: role,
        plant_id: defaultPlant.id,
        full_name: fullName
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