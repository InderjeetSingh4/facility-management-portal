'use client'

import { motion } from 'framer-motion'
import { Building2, ClipboardList, CheckSquare, Calendar, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AnimatedCanvas() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Define static positions to avoid hydration mismatches, but spread them across the whole viewport.
  // Using % for top/left ensures it scatters well on any screen size.
  // We use `isDarkZone` to determine the color of the icon based on its vertical position.
  const icons = [
    { Icon: Building2, top: 15, left: 10, delay: 0, duration: 6, size: 48 },
    { Icon: ClipboardList, top: 25, left: 80, delay: 1, duration: 5, size: 56 },
    { Icon: CheckSquare, top: 75, left: 15, delay: 2, duration: 7, size: 40 },
    { Icon: Calendar, top: 80, left: 75, delay: 1.5, duration: 5.5, size: 52 },
    { Icon: Bell, top: 45, left: 90, delay: 0.5, duration: 6.5, size: 36 },
    { Icon: Building2, top: 60, left: 5, delay: 2.5, duration: 4.5, size: 44 },
    { Icon: CheckSquare, top: 10, left: 60, delay: 1.2, duration: 5.2, size: 38 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* ── Soft Depth Blobs ── */}
      <div className="absolute top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 dark:bg-accent/5 blur-[120px]" />
      <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent-dim/5 dark:bg-accent/5 blur-[120px]" />
      
      {/* ── Dashed Connecting Line ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
        <motion.path
          d="M 10vw 15vh C 40vw 15vh, 60vw 80vh, 75vw 80vh"
          fill="none"
          stroke="currentColor"
          className="text-foreground dark:text-primary"
          strokeWidth="2"
          strokeDasharray="8 8"
          initial={{ strokeDashoffset: 1000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* ── Ambient Icons ── */}
      {icons.map((item, i) => {
        return (
          <motion.div
            key={i}
            className="absolute text-muted-foreground/20"
            style={{ top: `${item.top}%`, left: `${item.left}%` }}
            animate={{ 
              y: [0, -20, 0], 
              rotate: [-2, 2, -2] 
            }}
            transition={{ 
              duration: item.duration, 
              ease: "easeInOut", 
              repeat: Infinity, 
              delay: item.delay 
            }}
          >
            <item.Icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        )
      })}

    </div>
  )
}
