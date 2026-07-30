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

  const inputCls = 'w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all'
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-secondary'

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
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-44 w-full object-cover" />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="rounded-full bg-primary/70 px-4 py-2 text-xs font-semibold text-surface hover:bg-primary/90 transition disabled:opacity-40"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={removePhoto}
                disabled={isSubmitting}
                className="rounded-full bg-danger/80 px-4 py-2 text-xs font-semibold text-danger-foreground hover:bg-danger transition disabled:opacity-40"
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
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-muted text-secondary hover:border-accent/40 hover:bg-accent/10 hover:text-accent transition-all disabled:opacity-40"
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
        <div className="rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary text-primary-foreground px-5 py-3.5 text-sm font-semibold shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Complaint'}
      </button>
    </form>
  )
}
