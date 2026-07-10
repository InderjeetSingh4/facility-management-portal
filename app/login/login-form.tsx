'use client'

import { useActionState } from 'react'
import { signInUser } from '@/app/auth/actions'
import Link from 'next/link'

const initialState = { error: '' }

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInUser, initialState)

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/70 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/70 z-10 relative">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Sign in to your account to continue.</p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Email</label>
            <input
              name="email"
              type="email"
              required
              disabled={isPending}
              className="w-full rounded-xl border border-neutral-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">Password</label>
            <input
              name="password"
              type="password"
              required
              disabled={isPending}
              className="w-full rounded-xl border border-neutral-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          {state?.error && typeof state.error === 'string' && state.error !== '' && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don't have an account? <Link href="/signup" className="font-medium text-neutral-900 underline underline-offset-4 dark:text-white">Sign up</Link>
        </p>
      </div>
  )
}