'use client'

import { useActionState, useState, useEffect } from 'react'
import { signUpUser } from '@/app/auth/actions'
import Link from 'next/link'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthIllustration from '@/components/AuthIllustration'
import AuthBackground from '@/components/AuthBackground'

const initialState = { error: '' }

type Plant = { id: string; name: string }

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0, 
    transition: { 
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

export default function SignUpForm({ plants }: { plants: Plant[] }) {
  const [state, formAction, isPending] = useActionState(signUpUser, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)

  // Trigger shake animation on form error
  useEffect(() => {
    if (state?.error) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 400)
      return () => clearTimeout(t)
    }
  }, [state?.error])

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-[1220px] rounded-[22px] border-[3px] border-[#2148c4] dark:border-transparent bg-[#f6f8fd] dark:bg-bg-surface overflow-hidden shadow-[0_40px_100px_rgba(33,72,196,0.18)] dark:shadow-none grid grid-cols-1 md:grid-cols-12 min-h-[760px]"
    >
      {/* ─────────────────────────────────────────
          LEFT COLUMN — Form (~34%)
      ───────────────────────────────────────── */}
      <motion.div 
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="md:col-span-4 p-[40px] lg:pt-[60px] lg:pr-[70px] lg:pb-[60px] lg:pl-[60px] flex flex-col relative overflow-hidden"
      >
        {/* Decorative Background Layer */}
        <AuthBackground />

        {/* Brand */}
        <div className="text-[15px] font-[800] tracking-[0.08em] text-[#1e2a5e] dark:text-accent mb-[60px] relative z-10">
          FACILITY PORTAL
        </div>

        {/* Abstract Disc Element overlapping form area */}
        <div className="absolute top-[46px] left-[260px] pointer-events-none hidden lg:block z-0">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <ellipse cx="45" cy="78" rx="26" ry="6" fill="#c7d2ee"/>
            <g transform="rotate(-18 45 40)">
              <ellipse cx="45" cy="40" rx="30" ry="30" fill="#5b7ce0"/>
              <path d="M45 40 L45 12 A28 28 0 0 1 66 52 Z" fill="#8ea4ea"/>
              <ellipse cx="45" cy="40" rx="30" ry="10" fill="#4a68d0" opacity="0.35"/>
            </g>
          </svg>
        </div>

        {/* Headline & Subcopy */}
        <div className="relative z-10">
          <h1 className="text-[40px] font-[800] text-[#1e2a5e] dark:text-text-primary mb-[10px] leading-tight">
            Sign Up
          </h1>
          <p className="text-[13px] text-[#9aa3b8] dark:text-text-muted leading-[1.5] max-w-[260px] mb-[36px]">
            Fill in your details to start managing facility operations.
          </p>

          {/* Form */}
          <form action={formAction} className="space-y-[20px]">
            
            {/* Full Name Field */}
            <div className="max-w-[260px] group relative">
              <label className="block text-[13px] text-[#6b7590] dark:text-text-muted mb-[6px] transition-colors group-focus-within:text-[#2148c4] dark:group-focus-within:text-accent">
                Full Name
              </label>
              <div className="relative border border-transparent bg-black/5 dark:bg-bg-surface-raised rounded-[10px] p-4 focus-within:border-[#2148c4] focus-within:border-dashed dark:focus-within:border-accent transition-colors">
                <input
                  name="full_name"
                  type="text"
                  required
                  disabled={isPending}
                  placeholder="John Doe"
                  className="w-full bg-transparent text-[14px] text-[#2a3350] dark:text-text-primary outline-none placeholder-[#b7bfd4] dark:placeholder:text-text-muted disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="max-w-[260px] group relative">
              <label className="block text-[13px] text-[#6b7590] dark:text-text-muted mb-[6px] transition-colors group-focus-within:text-[#2148c4] dark:group-focus-within:text-accent">
                Email
              </label>
              <div className="relative border border-transparent bg-black/5 dark:bg-bg-surface-raised rounded-[10px] p-4 focus-within:border-[#2148c4] focus-within:border-dashed dark:focus-within:border-accent transition-colors">
                <input
                  name="email"
                  type="email"
                  required
                  disabled={isPending}
                  placeholder="admin@facilityportal.com"
                  className="w-full bg-transparent text-[14px] text-[#2a3350] dark:text-text-primary outline-none placeholder-[#b7bfd4] dark:placeholder:text-text-muted disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field with Eye Icon */}
            <div className="max-w-[260px] group relative">
              <label className="block text-[13px] text-[#6b7590] dark:text-text-muted mb-[6px] transition-colors group-focus-within:text-[#2148c4] dark:group-focus-within:text-accent">
                Password
              </label>
              <div className="relative border border-transparent bg-black/5 dark:bg-bg-surface-raised rounded-[10px] p-4 focus-within:border-[#2148c4] focus-within:border-dashed dark:focus-within:border-accent transition-colors flex items-center">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isPending}
                  placeholder="Please enter your password"
                  className="w-full pr-[24px] bg-transparent text-[14px] text-[#2a3350] dark:text-text-primary outline-none placeholder-[#b7bfd4] dark:placeholder:text-text-muted disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#9aa3b8] dark:text-text-muted hover:text-[#6b7590] dark:hover:text-text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Account Role Field */}
            <div className="max-w-[260px] group relative">
              <label className="block text-[13px] text-[#6b7590] dark:text-text-muted mb-[6px] transition-colors group-focus-within:text-[#2148c4] dark:group-focus-within:text-accent">
                Account Role
              </label>
              <div className="relative border border-transparent bg-black/5 dark:bg-bg-surface-raised rounded-[10px] p-4 focus-within:border-dashed focus-within:border-[#2148c4] dark:focus-within:border-accent transition-colors flex items-center">
                <select
                  name="role"
                  required
                  disabled={isPending}
                  defaultValue=""
                  className="w-full border-none bg-transparent pr-[24px] text-[14px] text-[#2a3350] dark:text-text-primary outline-none cursor-pointer disabled:opacity-50 appearance-none transition-colors"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239aa3b8\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0 center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="" disabled className="text-[#9aa3b8] dark:bg-bg-surface">Select a role...</option>
                  <option value="cleaner" className="text-[#2a3350] dark:bg-bg-surface dark:text-text-primary">Housekeeper (Staff)</option>
                  <option value="local_admin" className="text-[#2a3350] dark:bg-bg-surface dark:text-text-primary">Facility Manager (Admin)</option>
                  <option value="super_admin" className="text-[#2a3350] dark:bg-bg-surface dark:text-text-primary">System Executive</option>
                </select>
              </div>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {state?.error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden max-w-[260px]"
                >
                  <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-700 mt-2">
                    {state.error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Action Button */}
            <div className="pt-[10px]">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 w-[150px] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white focus:ring-2 focus:ring-indigo-500/40 rounded-[10px] py-[13px] text-[12px] font-[700] tracking-[0.08em] active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                  </>
                ) : (
                  'SIGN UP'
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-[18px] text-[13px] text-[#9aa3b8] dark:text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-[700] text-[#2148c4] dark:text-accent hover:underline transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────
          RIGHT COLUMN — Illustration (~66%)
      ───────────────────────────────────────── */}
      <div className="hidden md:block md:col-span-8 relative bg-transparent">
        <AuthIllustration />
      </div>
    </motion.div>
  )
}