import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logOut } from '@/app/auth/actions'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double check if they are already approved
  const { data: profile } = await supabase
    .from('users')
    .select('approval_status')
    .eq('id', user.id)
    .single()

  const approvalStatus = profile?.approval_status || user.app_metadata?.approval_status || 'pending'

  if (approvalStatus === 'approved') {
    redirect('/portal')
  }

  const isRejected = approvalStatus === 'rejected'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#eef2fa] via-white to-[#f3e8ff] dark:!bg-[image:var(--bg-base-glow)] dark:bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl text-center animate-in fade-in zoom-in duration-500">
        
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ${isRejected ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'}`}>
          {isRejected ? (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          {isRejected ? 'Account Rejected' : 'Approval Pending'}
        </h1>
        
        <p className="mb-8 text-sm text-muted-foreground">
          {isRejected 
            ? 'Your request for access has been declined by an administrator. If you believe this is a mistake, please contact your facility manager.'
            : 'Your account has been created successfully, but it requires administrator approval before you can access FacilityOS. Please check back later.'}
        </p>

        <form action={logOut}>
          <button 
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 dark:bg-[image:var(--accent-gradient)] dark:shadow-[0_0_12px_var(--accent-glow)] shadow-sm"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  )
}
