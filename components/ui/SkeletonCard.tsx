interface SkeletonCardProps {
  className?: string
  hasImage?: boolean
  lines?: number
}

export default function SkeletonCard({ className = '', hasImage = false, lines = 2 }: SkeletonCardProps) {
  return (
    <div className={`overflow-hidden bg-surface backdrop-blur-2xl border border-border rounded-2xl shadow-xl p-6 animate-pulse ${className}`}>
      {hasImage && (
        <div className="mb-4 h-44 w-full rounded-xl bg-surface-muted" />
      )}

      {/* Title placeholder */}
      <div className="h-5 w-3/4 rounded-lg bg-surface-muted mb-3" />

      {/* Description lines */}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-3.5 rounded-md bg-surface ${i === lines - 1 ? 'w-1/2' : 'w-full'}`}
          />
        ))}
      </div>

      {/* Footer / Button placeholder */}
      <div className="mt-6 flex items-center justify-between pt-2">
        <div className="h-3.5 w-24 rounded-md bg-surface-muted" />
        <div className="h-9 w-28 rounded-full bg-surface-muted" />
      </div>
    </div>
  )
}
