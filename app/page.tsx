import SignUpForm from '@/app/signup-form'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

export default function HomeSignUpPage() {
  return (
    <main className="flex min-h-screen w-full bg-slate-50 text-slate-900 items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      
      {/* THEME TOGGLE (Optional Polish) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* CENTERED SPLIT-ILLUSTRATION CARD CONTAINER */}
      <div className="w-full flex items-center justify-center">
        <SignUpForm plants={[]} />
      </div>

    </main>
  )
}