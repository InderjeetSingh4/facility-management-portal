'use client'

interface ComplaintPhotoProps {
  src: string
  alt: string
}

export default function ComplaintPhoto({ src, alt }: ComplaintPhotoProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border max-h-48 w-full bg-muted my-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-40 object-cover rounded-xl"
        onError={(e) => {
          console.error('Failed to load complaint photo:', src)
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}
