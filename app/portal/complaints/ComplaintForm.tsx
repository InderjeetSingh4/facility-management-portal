'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitComplaint } from '../actions'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'

export default function ComplaintForm() {
  const supabase = createClient()
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
    setPhotoFile(file)
  }

  function removePhoto() {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
    setPhotoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsSubmitting(true)

    try {
      let imageUrl = ''

      if (photoFile) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Session expired. Please sign in again.')
          setIsSubmitting(false)
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('plant_id')
          .eq('id', user.id)
          .single() as { data: any }

        const plantId = profile?.plant_id || 'unknown'
        const fileExt = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filePath = `${plantId}/${user.id}/${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('complaint_photos')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: photoFile.type || 'image/jpeg',
          })

        if (uploadError) {
          setError('Could not upload the photo. Please try again.')
          setIsSubmitting(false)
          return
        }

        const { data } = supabase.storage.from('complaint_photos').getPublicUrl(filePath)
        imageUrl = data.publicUrl
      }

      formData.set('image_url', imageUrl)

      const result = await submitComplaint(formData)
      if (result?.error) {
        setError(result.error)
        toast.error('Failed to submit. Please try again.')
        setIsSubmitting(false)
      } else {
        toast.success('Complaint submitted successfully!')
      }
    } catch {
      // redirect() throws NEXT_REDIRECT — expected
    }
  }

  const inputCls = 'w-full rounded-[10px] border border-transparent bg-black/5 dark:bg-bg-surface-raised px-4 py-3 text-sm text-slate-900 dark:text-text-primary outline-none placeholder:text-slate-400 dark:placeholder:text-text-muted focus:border-dashed focus:border-blue-500 dark:focus:border-accent transition-all'
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-text-muted'

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="complaint-title" className={labelCls}>Title</label>
        <input
          id="complaint-title"
          type="text"
          name="title"
          required
          placeholder="e.g. Leaking pipe in restroom"
          className={inputCls}
        />
      </div>

      {/* Photo */}
      <div>
        <label className={labelCls}>Photo (optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative overflow-hidden rounded-[10px] border border-slate-200 dark:border-white/10 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-44 w-full object-cover" />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="rounded-[10px] bg-slate-900/80 dark:bg-white/80 px-4 py-2 text-xs font-semibold text-white dark:text-black hover:opacity-90 transition disabled:opacity-40"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={removePhoto}
                disabled={isSubmitting}
                className="rounded-[10px] bg-red-500/80 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-black/10 dark:border-white/15 bg-black/5 dark:bg-bg-surface-raised text-slate-500 dark:text-text-muted hover:border-blue-500 dark:hover:border-accent hover:text-blue-500 dark:hover:text-accent transition-all disabled:opacity-40"
          >
            <Camera size={24} />
            <span className="text-xs font-semibold">Tap to add a photo</span>
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="complaint-description" className={labelCls}>Description</label>
        <textarea
          id="complaint-description"
          name="description"
          required
          placeholder="Describe the issue in detail..."
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Complaint'}
      </button>
    </form>
  )
}
