import React from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export default function GlassCard({ children, className = '', interactive = false, ...props }: GlassCardProps) {
  const baseClasses = "bg-card/60 backdrop-blur-xl border border-border rounded-2xl shadow-surface"
  const interactiveClasses = interactive ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:bg-card hover:border-muted-foreground cursor-pointer" : ""
  
  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
