'use client'

import { Building2 } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  className?: string
}

export default function Logo({ size = 'md', showSubtitle = false, className = '' }: LogoProps) {
  // Dimensions and styling variations based on size
  const iconContainerStyles = {
    sm: 'h-9 w-9 rounded-xl shadow-sm',
    md: 'h-11 w-11 rounded-2xl shadow-sm',
    lg: 'h-12 w-12 rounded-2xl shadow-sm',
  }

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 24,
  }

  const titleStyles = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-lg font-bold',
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Solid Accent Icon Container */}
      <div
        className={`flex ${iconContainerStyles[size]} items-center justify-center bg-primary text-primary-foreground flex-shrink-0 border border-border transition-all duration-300 group-hover:scale-[1.03] shadow-sm`}
      >
        <Building2 size={iconSizes[size]} className="text-primary-foreground stroke-[2.2] flex-shrink-0" />
      </div>

      {/* Typography for 'FacilityOS' */}
      <div className="flex flex-col justify-center min-w-0">
        <p className={`${titleStyles[size]} font-heading tracking-tight text-foreground leading-tight`}>
          FacilityOS
        </p>
        {showSubtitle && (
          <p className="text-xs font-medium text-muted-foreground leading-tight mt-0.5">
            Management Suite
          </p>
        )}
      </div>
    </div>
  )
}
