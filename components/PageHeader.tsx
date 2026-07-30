"use client"

import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  showBackButton?: boolean
}

export default function PageHeader({ title, description, action, showBackButton }: PageHeaderProps) {
  const pathname = usePathname()
  
  // Format the path nicely for the breadcrumb
  const pathSegments = pathname?.split('/').filter(Boolean) || []
  let breadcrumbText = 'Facility Portal'
  if (pathSegments.length > 1) {
    const lastSegment = pathSegments[pathSegments.length - 1]
    const formattedSegment = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
    breadcrumbText = `Facility Portal / ${formattedSegment}`
  } else {
    breadcrumbText = `Facility Portal / Dashboard`
  }

  return (
    <div className="pb-6 pt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      
      {/* LEFT: Title & Back Button */}
      <div className="flex flex-col items-start gap-3 md:w-1/3">
        {showBackButton && (
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/40 dark:bg-white/5 dark:border-white/10 backdrop-blur-2xl px-4 py-2 text-xs font-medium text-muted shadow-sm hover:bg-white/60 dark:hover:bg-white/10 hover:text-primary transition-all duration-200 ease-out active:scale-[0.97]"
          >
            <ArrowLeft size={14} />
            Return to Portal
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary dark:text-text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[13px] font-medium text-muted dark:text-text-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* CENTER: Dynamic Breadcrumb */}
      <div className="hidden md:flex md:flex-1 justify-center md:w-1/3">
        <div className="inline-flex items-center gap-3 rounded-[10px] border border-white/60 bg-white/40 dark:bg-bg-surface-raised dark:border-transparent px-5 py-2.5 text-[13px] font-medium text-muted dark:text-text-muted shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all hover:bg-white/60 cursor-default">
          <Search size={14} className="opacity-50" />
          <span className="opacity-80 tracking-wide">{breadcrumbText}</span>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex-shrink-0 flex justify-end md:w-1/3">
        {action}
      </div>
    </div>
  )
}
