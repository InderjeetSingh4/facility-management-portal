/**
 * Glassmorphic Design Tokens & Interaction Constants
 */

// ── Glassmorphic Surfaces ──────────────────────────────────────────────────

/** Premium glass card component style */
export const GLASS_CARD = 'bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl p-6'

/** Heavy glass navigation / header chrome */
export const GLASS_HEAVY = 'bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl'

/** Light glass panel surface */
export const GLASS_LIGHT = 'bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl p-6'

/** Modal glass panel surface */
export const GLASS_MODAL = 'bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl p-6'

/** Active nav item background */
export const GLASS_NAV_ACTIVE = 'bg-indigo-600/90 text-slate-100 shadow-md backdrop-blur-md'

// ── Tactile Interaction Physics ─────────────────────────────────────────────

/** Tactile press physics for interactive cards */
export const TAPPABLE_CARD =
  'active:scale-95 transition-all duration-200 cursor-pointer'

/** Tactile press physics for buttons */
export const TAPPABLE_BUTTON =
  'active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

// ── Framer Motion Animation Variants ───────────────────────────────────────

export const containerStaggerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
} as const

export const itemSpringVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
} as const
