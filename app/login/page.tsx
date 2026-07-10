import LoginForm from './login-form'

export default async function LoginPage() {

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6 dark:bg-neutral-950 relative overflow-hidden">
      
      {/* Container for Form */}
      <div className="flex flex-col xl:flex-row items-center gap-8 xl:gap-16 z-10">
        
        {/* The Client-Side Form */}
        <LoginForm />
        


      </div>
    </main>
  )
}
