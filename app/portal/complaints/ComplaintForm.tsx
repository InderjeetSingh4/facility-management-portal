'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitComplaint } from '../actions'
import { toast } from 'sonner'

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

      // Upload photo to Supabase Storage if one was selected
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

      // Append the image URL to the FormData so the server action receives it
      formData.set('image_url', imageUrl)

      const result = await submitComplaint(formData)
      if (result?.error) {
        setError(result.error)
        toast.error('Failed to submit. Please try again.')
        setIsSubmitting(false)
      } else {
        toast.success('Complaint submitted successfully!')
      }
      // On success, the action redirects — no need to handle here
    } catch {
      // redirect() throws a NEXT_REDIRECT error, which is expected
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="complaint-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
          Title
        </label>
        <input
          id="complaint-title"
          type="text"
          name="title"
          required
          placeholder="e.g. Leaking pipe in restroom"
          className="w-full rounded-2xl border border-border bg-surface p-4 text-primary shadow-inner backdrop-blur-xl outline-none transition-all placeholder:text-muted focus:border-accent focus:bg-surface-solid/80 focus:ring-4 focus:ring-accent/20"
        />
      </div>

      {/* Photo */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
          Photo (optional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-44 w-full object-cover" />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-40"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={removePhoto}
                disabled={isSubmitting}
                className="rounded-full bg-red-600/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-40"
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
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-solid/30 text-muted transition hover:border-accent hover:text-secondary hover:bg-surface-solid/50 disabled:opacity-40 shadow-inner backdrop-blur-xl"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-xs font-medium">Tap to add a photo</span>
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="complaint-description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
          Description
        </label>
        <textarea
          id="complaint-description"
          name="description"
          required
          placeholder="Describe the issue in detail..."
          rows={3}
          className="w-full rounded-2xl border border-border bg-surface p-4 text-primary shadow-inner backdrop-blur-xl outline-none transition-all placeholder:text-muted focus:border-accent focus:bg-surface-solid/80 focus:ring-4 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent text-accent-foreground rounded-2xl px-4 py-2 text-sm font-medium shadow-md transition-all hover:scale-105 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Complaint'}
      </button>
    </form>
  )
}
