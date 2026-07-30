// @ts-nocheck
import AdminNoticeForm from '@/components/admin-notice-form'
import DeleteNoticeButton from '@/components/delete-notice-button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminNoticesPage() {
  const supabase = await createClient()
  
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 px-6 py-10">
      {/* NEW ESCAPE HATCH BUTTON */}
      <Link 
        href="/portal" 
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Return to Portal
      </Link>

      <header className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Manager Dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mt-1">Admin Control Center</h1>
          </div>
          
          <div className="flex gap-1 bg-white dark:bg-neutral-900 p-1 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
            <Link href="/admin" className="px-5 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition">
              Complaints
            </Link>
            <Link href="/admin/notices" className="px-5 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium shadow-sm">
              Notices
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <section>
          <AdminNoticeForm />
        </section>
        
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white mb-5">
            Active Notices
          </h2>
          <div className="flex flex-col gap-4">
            {notices?.length === 0 && (
              <div className="rounded-3xl border border-white/60 bg-white/70 p-10 text-center text-sm text-neutral-500 backdrop-blur-xl">
                No active notices to display.
              </div>
            )}
            
            {notices?.map((notice) => (
              <div key={notice.id} className="p-5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-neutral-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex justify-between items-start gap-4 transition hover:shadow-md">
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{notice.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{notice.details}</p>
                </div>
                <DeleteNoticeButton noticeId={notice.id} imageUrl={notice.image_url} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}