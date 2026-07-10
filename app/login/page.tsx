import QRCode from 'qrcode'
import LoginForm from './login-form'
import Image from 'next/image'

export default async function LoginPage() {
  // Generate the QR code data URL on the server
  // This encodes the production URL so users can quickly open it on their phones
  const siteUrl = 'https://facility-management-portal-theta.vercel.app'
  
  let qrDataUrl = ''
  try {
    qrDataUrl = await QRCode.toDataURL(siteUrl, {
      width: 150,
      margin: 2,
      color: {
        dark: '#11131A', // text-primary
        light: '#FFFFFF00' // transparent background
      }
    })
  } catch (err) {
    console.error('Failed to generate QR code', err)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6 dark:bg-neutral-950 relative overflow-hidden">
      
      {/* Container for Form and QR Code side-by-side or stacked */}
      <div className="flex flex-col xl:flex-row items-center gap-8 xl:gap-16 z-10">
        
        {/* The Client-Side Form */}
        <LoginForm />
        
        {/* The Server-Rendered QR Code Widget */}
        {qrDataUrl && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/70 animate-in fade-in zoom-in duration-500 delay-150">
            <h3 className="mb-4 text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              Scan to open on your phone
            </h3>
            <div className="rounded-xl overflow-hidden bg-white/50 p-2 border border-white/40 dark:bg-white/90">
              <Image 
                src={qrDataUrl} 
                alt="QR Code to Facility Portal" 
                width={150} 
                height={150} 
                unoptimized // Since it's a data URL, we don't need Next.js image optimization
                className="mix-blend-multiply"
              />
            </div>
            <p className="mt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Install the app directly <br/> from your mobile browser
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
