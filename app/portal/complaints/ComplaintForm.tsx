'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitComplaint } from '../actions'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'

export default function ComplaintForm() {
  const supabase = createClient()
  const router = useRouter()
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
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          const errMsg = userError?.message || 'Session expired. Please sign in again.'
          console.error('Auth check error during complaint submission:', userError)
          setError(errMsg)
          toast.error(errMsg)
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('plant_id')
          .eq('id', user.id)
          .single() as { data: any; error: any }

        if (profileError) {
          console.error('Error fetching plant_id for user during photo upload:', profileError)
        }

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
          console.error('Complaint photo upload error:', uploadError)
          const errMsg = uploadError.message || 'Could not upload the photo. Please try again.'
          setError(errMsg)
          toast.error(errMsg)
          return
        }

        const { data } = supabase.storage.from('complaint_photos').getPublicUrl(filePath)
        imageUrl = data.publicUrl
      }

      formData.set('image_url', imageUrl)

      const result = await submitComplaint(formData)
      if (result?.error) {
        console.error('Complaint submission error from server action:', result.error)
        setError(result.error)
        toast.error(result.error)
      } else {
        console.log('Complaint submitted successfully:', result)
        toast.success('Complaint submitted successfully!')
        removePhoto()
        formRef.current?.reset()
        setError(null)
        router.refresh()
      }
    } catch (err: any) {
      console.error('Unexpected error submitting complaint:', err)
      const errMsg = err?.message || 'An unexpected error occurred. Please try again.'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-transparent bg-muted px-4 md:px-5 py-3.5 md:py-4 text-base md:text-lg text-foreground outline-none placeholder:text-muted-foreground focus:border-dashed focus:border-primary transition-all'
  const labelCls = 'mb-2 block text-sm md:text-base font-bold uppercase tracking-wider text-muted-foreground'

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6 md:space-y-7 w-full max-w-3xl mx-auto">
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
          <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-56 sm:h-64 md:h-72 w-full object-cover" />
            <div className="absolute bottom-4 right-4 flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="rounded-xl bg-primary/90 px-5 py-2.5 text-sm md:text-base font-bold text-primary-foreground hover:opacity-100 transition disabled:opacity-40 backdrop-blur-sm shadow-sm"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={removePhoto}
                disabled={isSubmitting}
                className="rounded-xl bg-danger/90 px-5 py-2.5 text-sm md:text-base font-bold text-white hover:bg-danger transition disabled:opacity-40 backdrop-blur-sm shadow-sm"
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
            className="flex h-40 sm:h-48 md:h-56 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-40 p-6"
          >
            <Camera className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" />
            <span className="text-sm md:text-base font-bold">Tap to add a photo</span>
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
          rows={5}
          className={`${inputCls} min-h-[140px] md:min-h-[160px] resize-none`}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-danger-border bg-danger-bg px-5 py-4 text-base text-danger font-medium">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:opacity-90 border border-border text-primary-foreground transition-all rounded-xl py-3 px-6 font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50 tracking-wide"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Complaint'}
      </button>
    </form>
  )
}

