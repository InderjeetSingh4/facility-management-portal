export default function PortalLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-solid/50"></div>
          <div className="h-4 w-64 animate-pulse rounded-lg bg-surface-solid/50"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded-lg bg-surface-solid/50 mb-2"></div>
            <div className="h-10 w-16 animate-pulse rounded-lg bg-surface-solid/50 mb-1"></div>
            <div className="h-4 w-32 animate-pulse rounded-lg bg-surface-solid/50"></div>
          </div>
        ))}
      </div>
      
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-surface-solid/50 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-surface-solid/50"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
