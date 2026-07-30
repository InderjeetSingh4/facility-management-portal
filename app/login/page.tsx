import LoginForm from './login-form'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-[#eef1fa] dark:bg-background text-[#2a3350] dark:text-primary items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background Blobs (Fixed/Absolute) */}
      <svg className="absolute -top-[220px] -right-[260px] w-[900px] h-[900px] pointer-events-none" viewBox="0 0 900 900">
        <path d="M900 0 L900 500 C 760 560, 680 470, 640 380 C 590 270, 460 240, 400 150 C 350 70, 400 0, 480 0 Z" fill="#aebdf0"/>
        <path d="M900 60 L900 460 C 800 500, 730 430, 700 350 C 660 260, 560 230, 520 150 C 480 80, 520 40, 590 40 Z" fill="#8ea0ea"/>
      </svg>
      <svg className="absolute -bottom-[260px] -left-[280px] w-[800px] h-[800px] pointer-events-none" viewBox="0 0 800 800">
        <path d="M0 800 L0 300 C 130 250, 200 340, 240 430 C 290 540, 410 570, 470 660 C 520 740, 470 800, 390 800 Z" fill="#aebdf0"/>
        <path d="M0 800 L0 380 C 110 340, 170 420, 200 500 C 240 590, 340 610, 390 690 C 430 750, 390 800, 320 800 Z" fill="#8ea0ea"/>
      </svg>

      {/* THEME TOGGLE */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* CENTERED SPLIT-ILLUSTRATION CARD CONTAINER */}
      <div className="w-full flex items-center justify-center relative z-10">
        <LoginForm />
      </div>

    </main>
  )
}
