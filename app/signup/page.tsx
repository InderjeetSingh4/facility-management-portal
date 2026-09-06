import SignUpForm from '@/app/signup-form'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#eef2fa] via-white to-[#f3e8ff] dark:!bg-[image:var(--bg-base-glow)] dark:bg-background text-foreground p-4 sm:p-6 lg:p-10 overflow-hidden font-sans">
      
      {/* ─────────────────────────────────────────
          AMBIENT BACKGROUND GLOWS (Mesh Gradient)
      ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] z-0 h-[500px] w-[500px] rounded-full bg-accent-dim/10 mix-blend-multiply blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] z-0 h-[600px] w-[600px] rounded-full bg-accent/5 mix-blend-multiply blur-[120px]" />
      <div className="pointer-events-none absolute right-[20%] top-[-5%] z-0 h-[400px] w-[400px] rounded-full bg-accent/5 mix-blend-multiply blur-[120px]" />

      {/* THEME TOGGLE */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* CENTERED SPLIT-ILLUSTRATION CARD CONTAINER */}
      <div className="relative z-10 flex w-full items-center justify-center">
        <SignUpForm plants={[]} />
      </div>

    </main>
  )
}