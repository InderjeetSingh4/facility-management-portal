'use client'

export default function AuthBackground() {
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* ── Blob 1: Top-Left Ambient Accent Glow ── */}
      <div 
        className="absolute -top-16 -left-16 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-accent/15 dark:bg-accent/10 blur-3xl opacity-70 transition-colors duration-500 motion-safe:animate-pulse"
        style={{ animationDuration: '10s' }}
      />

      {/* ── Blob 2: Bottom-Right Secondary Accent Glow ── */}
      <div 
        className="absolute -bottom-20 -right-16 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-accent/10 dark:bg-accent/8 blur-3xl opacity-60 transition-colors duration-500 motion-safe:animate-pulse"
        style={{ animationDuration: '14s', animationDelay: '3s' }}
      />

      {/* ── Organic Vector Contour Paths (Echoes illustration blobs) ── */}
      <svg
        className="absolute inset-0 w-full h-full text-accent/10 dark:text-accent/6 transition-colors duration-500"
        viewBox="0 0 400 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M -40 180 C 60 100, 180 140, 200 240 C 220 340, 90 410, -10 440 C -110 470, -140 320, -40 180 Z"
          fill="currentColor"
        />
        <path
          d="M 140 400 C 240 340, 360 410, 370 500 C 380 590, 260 660, 150 630 C 40 600, 40 460, 140 400 Z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}
