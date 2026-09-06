'use client'

import { useActionState, useState } from 'react'
import { signUpUser } from '@/app/auth/actions'
import Link from 'next/link'
import { EyeOff, Loader2, Square } from 'lucide-react'
import AuthIllustration from '@/components/AuthIllustration'

const initialState = { error: '' }

type Plant = { id: string; name: string }

export default function SignUpForm({ plants }: { plants: Plant[] }) {
  const [state, formAction, isPending] = useActionState(signUpUser, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-4xl min-h-[600px] rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] grid grid-cols-1 md:grid-cols-2 bg-card">
      {/* ─────────────────────────────────────────
          LEFT COLUMN — The Form (White Background)
      ───────────────────────────────────────── */}
      <div className="relative flex flex-col justify-center p-12 sm:p-16 overflow-hidden shadow-[10px_0_40px_rgba(0,0,0,0.04)] border-r border-white/60 z-20 bg-[#F8FAFC]">
        
        {/* Ambient Gradient Mesh (Underneath) */}
        <div className="absolute top-[-15%] left-[-15%] w-[450px] h-[450px] bg-gradient-to-br from-blue-100/50 to-slate-200/40 rounded-full blur-[90px] z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-slate-300/30 to-blue-50/50 rounded-full blur-[110px] z-0 pointer-events-none"></div>
        <div className="absolute top-[35%] left-[25%] w-[350px] h-[350px] bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full blur-[70px] z-0 pointer-events-none"></div>
        
        {/* Frosted Glass Overlay */}
        <div className="absolute inset-0 z-0 bg-white/40 backdrop-blur-[50px] pointer-events-none"></div>

        {/* Delicate Inner Highlight */}
        <div className="absolute inset-0 z-0 border-[1.5px] border-white/70 pointer-events-none mix-blend-overlay"></div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col w-full h-full justify-center">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 48 48" className="drop-shadow-sm">
                <defs>
                  <radialGradient id="smallSphereGradSignup" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#888888" />
                    <stop offset="100%" stopColor="#111111" />
                  </radialGradient>
                </defs>
                <circle cx="24" cy="24" r="24" fill="url(#smallSphereGradSignup)" />
              </svg>
              <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase m-0">
                FACILITYOS
              </p>
            </div>
            <h1 className="text-4xl font-sans font-semibold text-foreground mb-2">
              Sign Up
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill in your details to start managing facility operations.
            </p>
          </div>

          {/* Form */}
          <form action={formAction} className="flex flex-col gap-4 w-full">
            
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                name="full_name"
                type="text"
                required
                disabled={isPending}
                placeholder="John Doe"
                className="w-full bg-white/60 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:bg-white focus:border-slate-300 focus:shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] transition-all disabled:opacity-50"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                disabled={isPending}
                placeholder="admin@facilityos.com"
                className="w-full bg-white/60 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:bg-white focus:border-slate-300 focus:shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isPending}
                  placeholder="••••••••••••"
                  className="w-full bg-white/60 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md rounded-xl pl-4 pr-12 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:bg-white focus:border-slate-300 focus:shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Square size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            {/* Account Role Field */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Account Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  required
                  disabled={isPending}
                  defaultValue=""
                  className="w-full bg-white/60 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md rounded-xl px-4 py-3 pr-10 text-foreground outline-none transition-all focus:bg-white focus:border-slate-300 focus:shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] disabled:opacity-50 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239aa3b8\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="" disabled className="text-muted-foreground">Select a role...</option>
                  <option value="housekeeper" className="text-foreground bg-white">Housekeeper / Facility Staff</option>
                  <option value="employee" className="text-foreground bg-white">Company Employee / Occupant</option>
                </select>
              </div>
            </div>

            {/* Error Message Alert */}
            {state?.error && (
              <div className="rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
                {state.error}
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl py-3 mt-1 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : 'SIGN UP'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-foreground hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          RIGHT COLUMN — The Visual (Dark Background)
      ───────────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-center relative bg-muted overflow-hidden">
        
        <AuthIllustration />
        
      </div>
    </div>
  )
}