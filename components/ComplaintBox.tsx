// @ts-nocheck
'use client'

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type SubmitState = 'idle' | 'uploading' | 'success' | 'error'

interface ComplaintBoxProps {
  isOpen: boolean
  onClose: () => void
}

export default function ComplaintBox({ isOpen, onClose }: ComplaintBoxProps) {
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBusy = submitState === 'uploading'

  function resetForm() {
    setTitle('')
    setDescription('')
    setPhotoFile(null)
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
    setSubmitState('idle')
    setErrorMessage(null)
  }

  function closeSheet() {
    if (isBusy) return
    resetForm()
    onClose()
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
    setPhotoFile(file)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    if (!title.trim()) {
      setErrorMessage('Please give the complaint a short title.')
      return
    }
    if (!photoFile) {
      setErrorMessage('Please attach a photo.')
      return
    }
    if (!description.trim()) {
      setErrorMessage('Please describe the issue.')
      return
    }

    setSubmitState('uploading')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage('Your session has expired. Please sign in again.')
      setSubmitState('error')
      return
    }

    // plant_id is read from the `users` table, not session/user metadata:
    // metadata is client-editable, and the RLS policies on both the storage
    // bucket and the complaints table require this value to be correct
    // anyway — so the client-side source has to be trustworthy too.
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('plant_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.plant_id) {
      setErrorMessage('Could not determine your facility. Contact your administrator.')
      setSubmitState('error')
      return
    }

    const fileExt = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${profile.plant_id}/${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('complaint_photos')
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: photoFile.type || 'image/jpeg',
      })

    if (uploadError) {
      setErrorMessage('Could not upload the photo. Please try again.')
      setSubmitState('error')
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('complaint_photos').getPublicUrl(filePath)

    const { error: insertError } = await supabase.from('complaints').insert({
      user_id: user.id,
      plant_id: profile.plant_id,
      title: title.trim(),
      description: description.trim(),
      image_url: publicUrl,
    })

    if (insertError) {
      setErrorMessage('Photo uploaded, but the complaint could not be saved. Please try again.')
      setSubmitState('error')
      return
    }

    setSubmitState('success')
    setTimeout(closeSheet, 1200)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report an issue"
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeSheet} />

      <div className="relative w-full max-w-md rounded-t-3xl border border-white/60 bg-white/80 p-6 pb-8 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-neutral-300" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            Report an issue
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            disabled={isBusy}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitState === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-900">Complaint submitted</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="complaint-title"
                className="mb-1.5 block text-xs font-medium text-neutral-600"
              >
                Title
              </label>
              <input
                id="complaint-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isBusy}
                placeholder="e.g. Leaking pipe in restroom"
                className="w-full rounded-xl border border-neutral-200 bg-white/80 px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected complaint"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-40"
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition hover:border-neutral-400 hover:text-neutral-500 disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-sm font-medium">Take a photo</span>
              </button>
            )}

            <div>
              <label
                htmlFor="complaint-description"
                className="mb-1.5 block text-xs font-medium text-neutral-600"
              >
                Description
              </label>
              <textarea
                id="complaint-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isBusy}
                placeholder="What's the issue?"
                rows={3}
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? 'Submitting…' : 'Submit complaint'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}