'use client'

import { useState } from 'react'
import ComplaintBox from './ComplaintBox'

export default function BottomNav() {
  const [isComplaintOpen, setIsComplaintOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-4 py-3 bg-card/70 backdrop-blur-xl rounded-full shadow-2xl border border-border">
          
          <button className="flex flex-col items-center justify-center w-16 h-12 rounded-full hover:bg-muted transition">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-medium mt-1 text-muted-foreground">Home</span>
          </button>

          <button 
            onClick={() => setIsComplaintOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-12 rounded-full hover:bg-muted transition"
          >
            <span className="text-xl">📸</span>
            <span className="text-[10px] font-medium mt-1 text-muted-foreground">Report</span>
          </button>

          <button className="flex flex-col items-center justify-center w-16 h-12 rounded-full hover:bg-muted transition">
            <span className="text-xl">📋</span>
            <span className="text-[10px] font-medium mt-1 text-muted-foreground">Tasks</span>
          </button>

        </div>
      </div>

      {/* The Controlled Modal */}
      {isComplaintOpen && (
        <ComplaintBox isOpen={isComplaintOpen} onClose={() => setIsComplaintOpen(false)} />
      )}
    </>
  )
}