// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminMetrics from '@/components/admin-metrics'
import ComplaintList from '@/components/complaint-list' // <-- Import the new component

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch the data on the server
  const { data: complaints, error } = await supabase
    .from('complaints')
    .select('id, title, description, image_url, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <Link 
        href="/portal" 
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Return to Portal
      </Link>

      <header className="mb-12">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Manager Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Admin Control Center</h1>
          </div>
          
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
            <Link href="/admin" className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background shadow-sm">
              Complaints
            </Link>
            <Link href="/admin/notices" className="rounded-lg px-5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted">
              Notices
            </Link>
          </div>
        </div>
      </header>

      <AdminMetrics />

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Manage Complaints</h2>
      </section>

      {error ? (
        <div role="alert" className="mb-6 rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
          Could not load complaints. Please refresh the page.
        </div>
      ) : (
        // Pass the fetched data directly into your new client component
        <ComplaintList initialComplaints={complaints || []} />
      )}
    </main>
  )
}