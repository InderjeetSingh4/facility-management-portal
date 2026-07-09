// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { NOTICE_COLOR_THEMES } from '@/lib/notices/color-themes'
import type { NoticeColorTheme } from '@/types/database'

export interface ResolveComplaintState {
  error: string | null
}

export async function resolveComplaint(
  complaintId: string,
  _prevState: ResolveComplaintState,
  _formData: FormData
): Promise<ResolveComplaintState> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('complaints')
    .update({ status: 'resolved' })
    .eq('id', complaintId)
    .select('id')

  if (error) {
    return { error: 'Could not update this complaint. Please try again.' }
  }

  if (!data || data.length === 0) {
    return { error: 'You do not have permission to update this complaint.' }
  }

  revalidatePath('/admin')
  return { error: null }
}

export interface CreateNoticeState {
  error: string | null
  success: boolean
}

export async function createNotice(
  _prevState: CreateNoticeState,
  formData: FormData
): Promise<CreateNoticeState> {
  const title = (formData.get('title') as string | null)?.trim()
  const details = (formData.get('details') as string | null)?.trim()
  const dateString = (formData.get('date_string') as string | null)?.trim()
  const colorTheme = formData.get('color_theme') as string | null
  const image = formData.get('image') as File | null

  if (!title || !details || !dateString || !colorTheme) {
    return { error: 'Please fill in every required field.', success: false }
  }

  const isValidTheme = NOTICE_COLOR_THEMES.some((theme) => theme.value === colorTheme)
  if (!isValidTheme) {
    return { error: 'Please choose a valid theme.', success: false }
  }

  const supabase = await createClient()
  let imageUrl = null

  // Process the image if one was uploaded
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('notices')
      .upload(fileName, image)

    if (uploadError) {
      console.error("STORAGE ERROR:", uploadError)
      return { error: 'Failed to upload image.', success: false }
    }
    
    const { data: publicUrlData } = supabase.storage.from('notices').getPublicUrl(fileName)
    imageUrl = publicUrlData.publicUrl
  }

  // Insert the notice into the database
  const { error } = await supabase.from('notices').insert({
    title,
    details,
    date_string: dateString,
    color_theme: colorTheme as NoticeColorTheme,
    image_url: imageUrl,
  })

  if (error) {
    console.error("SUPABASE ERROR:", error) 
    return { error: 'Could not post the notice. Please try again.', success: false }
  }

  revalidatePath('/portal')
  revalidatePath('/admin/notices')
  return { error: null, success: true }
}
export async function deleteNotice(noticeId: string, imageUrl?: string | null) {
  const supabase = await createClient()

  // If there is an image attached, delete it from the storage bucket first
  if (imageUrl) {
    const fileName = imageUrl.split('/').pop()
    if (fileName) {
      await supabase.storage.from('notices').remove([fileName])
    }
  }

  // Delete the notice from the database
  const { error } = await supabase.from('notices').delete().eq('id', noticeId)

  if (error) {
    console.error("DELETE ERROR:", error)
    return { error: 'Failed to delete notice.' }
  }

  // Refresh both pages so the notice disappears instantly
  revalidatePath('/portal')
  revalidatePath('/admin/notices')
  return { error: null }
}