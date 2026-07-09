import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getComplaints } from '../actions'
import ComplaintForm from './ComplaintForm'
import ResolveButton from './ResolveButton'

export default async function ComplaintsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  const complaints = await getComplaints()
  const openCount = complaints.filter((c) => !c.is_resolved).length

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
        ← Return Home
      </Link>
      
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Complaints
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {isAdmin
            ? 'Report maintenance issues and track their resolution.'
            : 'View open issues and mark them as resolved.'}
          {openCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              {openCount} open
            </span>
          )}
        </p>
      </header>

      {/* ── Layout: Admin gets form + feed, Staff gets full-width feed ────── */}
      <div className={`grid grid-cols-1 gap-8 ${isAdmin ? 'lg:grid-cols-5' : ''}`}>

        {/* ── Left: Submit Form (Admins only) ──────────────────────────────── */}
        {isAdmin && (
          <div className="lg:col-span-2">
            <div className="sticky top-8 rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white">
                  <svg className="h-4 w-4 text-white dark:text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">Report an Issue</h2>
              </div>
              <ComplaintForm />
            </div>
          </div>
        )}

        {/* ── Right: Complaints Feed ────────────────────────────────────────── */}
        <div className={isAdmin ? 'lg:col-span-3' : ''}>
          {complaints.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/30 p-12 text-center backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/30">
              <p className="text-3xl">🎉</p>
              <p className="mt-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                No complaints reported
              </p>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                {isAdmin
                  ? 'Use the form to report a maintenance issue.'
                  : 'All clear — nothing to resolve right now.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <article
                  key={complaint.id}
                  className={`group overflow-hidden rounded-2xl border border-neutral-100 bg-white/70 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/70 dark:bg-neutral-900/60 ${
                    complaint.is_resolved ? 'opacity-60' : ''
                  }`}
                >
                  {/* Image */}
                  {complaint.image_url && (
                    <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={complaint.image_url}
                        alt={complaint.title}
                        className="h-full w-full object-cover"
                      />
                      {/* Status badge on image */}
                      {complaint.is_resolved ? (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 backdrop-blur-sm dark:bg-emerald-500/30 dark:text-emerald-300">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                          Resolved
                        </span>
                      ) : (
                        <span className="absolute left-3 top-3 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 backdrop-blur-sm dark:bg-amber-500/30 dark:text-amber-300">
                          Open
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    {/* Status badge (if no image) */}
                    {!complaint.image_url && (
                      complaint.is_resolved ? (
                        <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                          Resolved
                        </span>
                      ) : (
                        <span className="mb-3 inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                          Open
                        </span>
                      )
                    )}

                    <h3 className={`text-sm font-bold text-neutral-900 dark:text-white ${complaint.is_resolved ? 'line-through' : ''}`}>
                      {complaint.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {complaint.description}
                    </p>

                    {/* Metadata row */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                      <p className="font-semibold uppercase tracking-wide">
                        Reported by {complaint.reportedBy}
                      </p>
                      <p>
                        {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* ── Action row: Resolve button or Resolved badge ────── */}
                    <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      {complaint.is_resolved ? (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                          Resolved by {complaint.resolvedByName}
                        </p>
                      ) : (
                        <ResolveButton complaintId={complaint.id} />
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
