import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getComplaints } from '../actions'
import ComplaintForm from './ComplaintForm'
import ResolveButton from './ResolveButton'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'

async function ComplaintsContent({ isAdmin }: { isAdmin: boolean }) {
  const complaints = await getComplaints()
  const openCount = complaints.filter((c) => !c.is_resolved).length

  return (
    <>
      {/* ── Left: Submit Form (Admins only) ──────────────────────────────── */}
      {isAdmin && (
        <div className="lg:col-span-2">
          <div className="sticky top-24 relative overflow-hidden rounded-3xl border border-border bg-surface p-6 xl:p-8 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50">
            <div className="mb-5 flex items-center gap-2">
              <h2 className="text-xl xl:text-2xl text-primary font-bold tracking-tight">Report an Issue</h2>
            </div>
            <ComplaintForm />
          </div>
        </div>
      )}

      {/* ── Right: Complaints Feed ────────────────────────────────────────── */}
      <div className={isAdmin ? 'lg:col-span-3' : ''}>
        {complaints.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 xl:p-8 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50 text-center">
            <p className="text-xl xl:text-2xl text-primary font-bold tracking-tight">
              No complaints reported
            </p>
            <p className="mt-1 text-sm text-secondary">
              {isAdmin
                ? 'Use the form to report a maintenance issue.'
                : 'All clear — nothing to resolve right now.'}
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 xl:gap-8 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {complaints.map((complaint) => (
              <article
                key={complaint.id}
                className={`group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50 ${
                  complaint.is_resolved ? 'opacity-60' : ''
                }`}
              >
                {/* Image */}
                {complaint.image_url && (
                  <div className="relative h-48 w-full bg-surface-solid/50">
                    <Image
                      src={complaint.image_url}
                      alt={complaint.title}
                      width={600}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                    {/* Status badge on image */}
                    {complaint.is_resolved ? (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md border border-border bg-surface-solid/80 px-2 py-1 text-xs font-bold uppercase tracking-wider text-secondary shadow-sm backdrop-blur-md">
                        ✓ Resolved
                      </span>
                    ) : (
                      <span className="absolute left-3 top-3 rounded-md border border-border bg-surface-solid/80 px-2 py-1 text-xs font-bold uppercase tracking-wider text-secondary shadow-sm backdrop-blur-md">
                        Open
                      </span>
                    )}
                  </div>
                )}

                <div className="p-6 xl:p-8">
                  {/* Status badge (if no image) */}
                  {!complaint.image_url && (
                    complaint.is_resolved ? (
                      <span className="mb-3 inline-flex items-center gap-1 rounded-md border border-border bg-surface-solid/50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-secondary shadow-sm">
                        ✓ Resolved
                      </span>
                    ) : (
                      <span className="mb-3 inline-flex rounded-md border border-border bg-surface-solid/50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-secondary shadow-sm">
                        Open
                      </span>
                    )
                  )}

                  <h3 className={`text-xl xl:text-2xl font-bold tracking-tight transition ${complaint.is_resolved ? 'line-through text-muted' : 'text-primary'}`}>
                    {complaint.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-sm xl:text-base text-secondary">
                    {complaint.description}
                  </p>

                  {/* Metadata row */}
                  <div className="mt-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
                    <p>
                      {complaint.reportedBy}
                    </p>
                    <p>
                      {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* ── Action row ────── */}
                  <div className="mt-4 border-t border-border pt-4">
                    {complaint.is_resolved ? (
                      <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-secondary">
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
    </>
  )
}

function ComplaintsSkeleton({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      {isAdmin && (
        <div className="lg:col-span-2">
          <div className="rounded-3xl bg-surface-solid/50 h-[400px] animate-pulse"></div>
        </div>
      )}
      <div className={isAdmin ? 'lg:col-span-3' : ''}>
        <div className={`grid grid-cols-1 gap-6 xl:gap-8 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
           <div className="rounded-3xl bg-surface-solid/50 h-[300px] animate-pulse"></div>
           <div className="rounded-3xl bg-surface-solid/50 h-[300px] animate-pulse"></div>
        </div>
      </div>
    </>
  )
}

export default async function ComplaintsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const role = user?.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  return (
    <div className="animate-in fade-in duration-500">
      
      <PageHeader 
        title="Complaints"
        description={isAdmin ? 'Report maintenance issues and track their resolution.' : 'View open issues and mark them as resolved.'}
        showBackButton={true}
      />

      {/* ── Layout ────────────────────────────────────────────────────────── */}
      <div className={`mt-2 grid grid-cols-1 gap-6 xl:gap-8 ${isAdmin ? 'lg:grid-cols-5' : ''}`}>
        <Suspense fallback={<ComplaintsSkeleton isAdmin={isAdmin} />}>
           <ComplaintsContent isAdmin={isAdmin} />
        </Suspense>
      </div>
    </div>
  )
}
