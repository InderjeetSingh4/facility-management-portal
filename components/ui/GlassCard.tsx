import React from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export default function GlassCard({ children, className = '', interactive = false, ...props }: GlassCardProps) {
  const baseClasses = "bg-white/60 dark:bg-bg-surface border border-black/5 dark:border-white/10 rounded-[14px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
  const interactiveClasses = interactive ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/70 dark:hover:bg-bg-surface-raised cursor-pointer" : ""
  
  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
