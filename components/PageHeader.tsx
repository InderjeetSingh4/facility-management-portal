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
  let breadcrumbText = 'FacilityOS'
  if (pathSegments.length > 1) {
    const lastSegment = pathSegments[pathSegments.length - 1]
    const formattedSegment = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
    breadcrumbText = `FacilityOS / ${formattedSegment}`
  } else {
    breadcrumbText = `FacilityOS / Dashboard`
  }

  return (
    <div className="pb-4 pt-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
      
      {/* LEFT: Title & Back Button */}
      <div className="flex flex-col items-start gap-2 md:w-1/2">
        {showBackButton && (
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-medium text-foreground tracking-tight leading-snug">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-light">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-end md:w-1/3">
        {action}
      </div>
    </div>
  )
}
