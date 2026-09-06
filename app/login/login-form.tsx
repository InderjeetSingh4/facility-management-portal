'use client'

import { useActionState, useState } from 'react'
import { signInUser } from '@/app/auth/actions'
import { Loader2 } from 'lucide-react'

const initialState = { error: '' }

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInUser, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(false)

  return (
    <div className="login-glass-card">
      {/* Heading */}
      <div className="login-card-header">
        <h2 className="login-heading">
          {isLogin ? 'Log In' : 'Sign Up'}
        </h2>
        <p className="login-subheading">
          {isLogin ? 'Welcome back to FacilityOS.' : 'Create your account to get started'}
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="login-form">
        {/* Email */}
        <div className="login-field">
          <label className="login-label">Email</label>
          <div className="login-input-wrap">
            <input
              name="email"
              type="email"
              required
              disabled={isPending}
              placeholder="you@company.com"
              className="login-input"
            />
            <span className="login-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
            </span>
          </div>
        </div>

        {/* Username - Hidden in Login mode with smooth transition */}
        <div className={`login-field-collapsible ${isLogin ? 'login-field-collapsed' : ''}`}>
          <div className="login-field">
            <label className="login-label">Username</label>
            <div className="login-input-wrap">
              <input
                name="full_name"
                type="text"
                placeholder="Your full name"
                disabled={isPending || isLogin}
                className="login-input"
              />
              <span className="login-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 10-16 0" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="login-field">
          <label className="login-label">Password</label>
          <div className="login-input-wrap">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isPending}
              placeholder="••••••••••"
              className="login-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-icon login-icon--btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Terms */}
        <label className="login-terms">
          <input type="checkbox" name="terms" className="login-checkbox" />
          <span>I agree to the <strong>Terms</strong> and <strong>Conditions</strong></span>
        </label>

        {/* Error */}
        {state?.error && (
          <div className="login-error">{state.error}</div>
        )}

        {/* Actions */}
        <div className="login-actions">
          <button type="submit" disabled={isPending} className="login-btn">
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isLogin ? 'Log In' : 'Sign Up'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="login-btn-arrow">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="login-link"
          >
            {isLogin ? "Don't have an account? Sign up" : "Have an account?"}
          </button>
        </div>
      </form>
    </div>
  )
}