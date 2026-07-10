import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  super_admin: { label: 'Super Admin', cls: 'bg-accent/20 text-accent' },
  local_admin: { label: 'Admin',       cls: 'bg-primary/20 text-primary' },
  housekeeper: { label: 'Housekeeper', cls: 'bg-warning/20 text-warning' },
  cleaner:     { label: 'Cleaner',     cls: 'bg-warning/20 text-warning' },
  employee:    { label: 'Employee',    cls: 'bg-secondary/20 text-secondary' },
}

async function StaffContent({ plantId }: { plantId: string }) {
  const supabase = await createClient()

  // Fetch all staff in the same plant
  const { data: staff, error } = await supabase
    .from('users')
    .select('id, full_name, role, phone, designation, is_on_duty, avatar_url, created_at')
    .eq('plant_id', plantId)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Failed to fetch staff:', error)
  }

  const staffList = staff || []

  return (
    <div className="mt-2">
      <p className="mb-4 text-sm xl:text-base text-secondary">
        {staffList.length} team member{staffList.length !== 1 ? 's' : ''} in your facility.
      </p>
      
      {staffList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 xl:p-16 text-center backdrop-blur-xl">
          <p className="text-3xl xl:text-4xl">👥</p>
          <p className="mt-3 text-sm font-semibold text-secondary">
            No staff members found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {staffList.map((member: any) => {
            const badge = ROLE_BADGE[member.role] ?? { label: member.role || 'Staff', cls: 'bg-surface-solid/50 text-secondary' }
            const initials = (member.full_name || '?')
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 xl:p-6 shadow-sm backdrop-blur-xl transition hover:shadow-md"
              >
                {/* Avatar */}
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={member.full_name}
                    width={44}
                    height={44}
                    className="h-11 w-11 flex-shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-primary">
                      {member.full_name}
                    </p>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {[member.designation, member.phone].filter(Boolean).join(' · ') || 'No details'}
                  </p>
                </div>

                {/* Duty status */}
                <div className="flex-shrink-0">
                  {member.is_on_duty ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-[10px] font-semibold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      On Duty
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2.5 py-1 text-[10px] font-semibold text-secondary">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      Off Duty
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StaffSkeleton() {
  return (
    <div className="mt-8 space-y-3">
      <div className="rounded-2xl bg-surface-solid/50 h-[80px] xl:h-[100px] animate-pulse"></div>
      <div className="rounded-2xl bg-surface-solid/50 h-[80px] xl:h-[100px] animate-pulse"></div>
      <div className="rounded-2xl bg-surface-solid/50 h-[80px] xl:h-[100px] animate-pulse"></div>
    </div>
  )
}

export default async function ManageStaffPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) redirect('/')

  const role = user.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'
  let plantId = user.app_metadata?.plant_id
  if (!plantId && user.id) {
    const { data: profile } = await supabase.from('users').select('plant_id').eq('id', user.id).single()
    plantId = profile?.plant_id
  }

  if (!isAdmin) redirect('/portal')

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
      
      <PageHeader 
        title="Manage Staff"
        showBackButton={true}
      />

      {/* ── Staff List ──────────────────────────────────────────────────────── */}
      {plantId ? (
        <Suspense fallback={<StaffSkeleton />}>
          <StaffContent plantId={plantId} />
        </Suspense>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-12 text-center backdrop-blur-xl">
          <p className="text-sm text-secondary">No facility assigned to your account.</p>
        </div>
      )}
    </div>
  )
}
