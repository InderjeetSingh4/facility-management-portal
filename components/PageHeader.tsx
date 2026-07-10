import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  showBackButton?: boolean
}

export default function PageHeader({ title, description, action, showBackButton }: PageHeaderProps) {
  return (
    <div className="pb-8 pt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-transparent">
      <div className="flex flex-col items-start gap-4">
        {showBackButton && (
          <Link 
            href="/portal" 
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-md transition-all hover:bg-surface-solid/50"
          >
            <ArrowLeft size={16} />
            Return to Portal
          </Link>
        )}
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm xl:text-base text-secondary">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
