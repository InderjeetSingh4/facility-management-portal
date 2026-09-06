export default function AuthIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFFFFF] to-[#EBEBEA]">
      
      {/* Decorative Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40" 
        style={{ 
          backgroundImage: 'radial-gradient(#C8C8C8 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }}
      />

      {/* Layered Blurred Blobs for Depth */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#E8E8E6] rounded-full blur-[90px] z-0 opacity-80" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#DFDFDC] rounded-full blur-[120px] z-0 opacity-70" />
      <div className="absolute top-[30%] right-[15%] w-[350px] h-[350px] bg-[#F2F2F0] rounded-full blur-[70px] z-0 opacity-90" />
      
      {/* Faint Geometric Outlines */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full border border-[#D8D8D8] z-0 opacity-30" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full border border-[#D8D8D8] z-0 opacity-20" />

      {/* Floating Sphere Logo */}
      <div className="absolute top-8 right-8 md:top-12 md:right-12 lg:top-16 lg:right-16 z-10 hidden sm:block animate-pulse" style={{ animationDuration: '4s' }}>
        <svg width="48" height="48" viewBox="0 0 60 60" className="drop-shadow-lg">
          <defs>
            <radialGradient id="floatingSphereGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#888888" />
              <stop offset="100%" stopColor="#111111" />
            </radialGradient>
          </defs>
          <circle cx="30" cy="30" r="28" fill="url(#floatingSphereGrad)" />
        </svg>
      </div>

      {/* Main Illustration Group */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-14 lg:p-20">
        <svg viewBox="30 160 560 480" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-[600px] max-h-[500px] drop-shadow-[0_24px_48px_rgba(0,0,0,0.06)]">
           <defs>
              <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="12" stdDeviation="16" floodOpacity="0.08" floodColor="#000000" />
              </filter>
           </defs>
           
           {/* ground line */}
           <line x1="80" y1="522" x2="610" y2="522" stroke="#D0D0D0" strokeWidth="2" strokeDasharray="4 4" opacity="0.6"/>

           {/* 3D bar icon on ground */}
           <g transform="translate(510,470)">
             <rect x="0" y="30" width="18" height="22" fill="#111111"/>
             <rect x="22" y="14" width="18" height="38" fill="#444444"/>
             <rect x="44" y="0" width="18" height="52" fill="#888888"/>
           </g>

           {/* monitor mockup */}
           <g transform="translate(200,190)">
             <rect x="0" y="0" width="330" height="270" rx="16" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" filter="url(#cardShadow)"/>
             {/* side dots */}
             <circle cx="20" cy="30" r="5" fill="#E0E0E0"/>
             <circle cx="20" cy="50" r="5" fill="#E0E0E0"/>
             <circle cx="20" cy="70" r="5" fill="#E0E0E0"/>
             <circle cx="20" cy="90" r="5" fill="#E0E0E0"/>

             {/* top bar lines */}
             <rect x="46" y="26" width="120" height="8" rx="4" fill="#666666"/>
             <rect x="46" y="42" width="90" height="6" rx="3" fill="#E5E5E5"/>
             <rect x="46" y="54" width="100" height="6" rx="3" fill="#E5E5E5"/>

             {/* three small squares */}
             <rect x="46" y="76" width="16" height="16" rx="4" fill="#666666"/>
             <rect x="68" y="76" width="16" height="16" rx="4" fill="#E5E5E5"/>
             <rect x="90" y="76" width="16" height="16" rx="4" fill="#E5E5E5"/>

             {/* lower bar lines */}
             <rect x="46" y="104" width="110" height="7" rx="3.5" fill="#E5E5E5"/>
             <rect x="46" y="118" width="70" height="7" rx="3.5" fill="#666666"/>
             <rect x="46" y="132" width="90" height="7" rx="3.5" fill="#E5E5E5"/>

             {/* pie chart */}
             <g transform="translate(210,90)">
               <circle cx="0" cy="0" r="46" fill="#F0F0F0"/>
               <path d="M0 0 L0 -46 A46 46 0 0 1 40 20 Z" fill="#111111"/>
               <circle cx="0" cy="0" r="26" fill="#FFFFFF"/>
             </g>

             {/* icon list right */}
             <g transform="translate(268,20)">
               <circle cx="0" cy="4" r="3" fill="#666666"/>
               <rect x="10" y="0" width="34" height="6" rx="3" fill="#E5E5E5"/>
               <circle cx="0" cy="20" r="3" fill="#666666"/>
               <rect x="10" y="16" width="34" height="6" rx="3" fill="#E5E5E5"/>
               <circle cx="0" cy="36" r="3" fill="#666666"/>
               <rect x="10" y="32" width="34" height="6" rx="3" fill="#E5E5E5"/>
             </g>

             {/* bottom row items */}
             <line x1="20" y1="200" x2="310" y2="200" stroke="#F0F0F0" strokeWidth="1.5"/>
             <g transform="translate(30,214)">
               <path d="M0 14 A14 14 0 1 1 14 0" fill="none" stroke="#888888" strokeWidth="4"/>
               <rect x="26" y="8" width="50" height="6" rx="3" fill="#E5E5E5"/>
             </g>
             <g transform="translate(120,214)">
               <path d="M0 14 A14 14 0 1 1 14 0" fill="none" stroke="#E5E5E5" strokeWidth="4"/>
               <rect x="26" y="8" width="50" height="6" rx="3" fill="#E5E5E5"/>
             </g>
             <g transform="translate(210,214)">
               <path d="M0 14 A14 14 0 1 1 14 0" fill="none" stroke="#E5E5E5" strokeWidth="4"/>
               <rect x="26" y="8" width="50" height="6" rx="3" fill="#E5E5E5"/>
             </g>
           </g>

           {/* left figure holding small chart card */}
           <g transform="translate(110,260)">
             <rect x="-40" y="230" width="110" height="90" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" filter="url(#cardShadow)"/>
             <rect x="-30" y="270" width="8" height="30" rx="2" fill="#888888"/>
             <rect x="-16" y="255" width="8" height="45" rx="2" fill="#111111"/>
             <rect x="-2" y="278" width="8" height="22" rx="2" fill="#666666"/>
             <circle cx="30" cy="252" r="3" fill="#888888"/>
             <circle cx="30" cy="264" r="3" fill="#888888"/>
             <circle cx="30" cy="276" r="3" fill="#888888"/>

             <ellipse cx="30" cy="332" rx="16" ry="4" fill="#CCCCCC" opacity="0.6"/>
             <path d="M8 330 Q10 220 30 200 Q50 220 52 330 Z" fill="#222222"/>
             <path d="M6 205 Q30 180 54 205 L54 235 Q30 250 6 235 Z" fill="#444444"/>
             <circle cx="30" cy="178" r="22" fill="#D4D4D4"/>
             <path d="M8 172 Q30 150 52 172 Q54 190 46 196 Q30 178 14 196 Q6 190 8 172 Z" fill="#111111"/>
             <rect x="12" y="325" width="14" height="26" rx="4" fill="#111111"/>
             <rect x="34" y="325" width="14" height="26" rx="4" fill="#111111"/>
             <ellipse cx="19" cy="353" rx="10" ry="5" fill="#000000"/>
             <ellipse cx="41" cy="353" rx="10" ry="5" fill="#000000"/>
           </g>

           {/* right figure holding rectangular card */}
           <g transform="translate(440,240)">
             <rect x="20" y="255" width="90" height="55" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" filter="url(#cardShadow)"/>
             <rect x="32" y="266" width="55" height="5" rx="2.5" fill="#666666"/>
             <rect x="32" y="278" width="40" height="5" rx="2.5" fill="#E5E5E5"/>
             <rect x="32" y="290" width="48" height="5" rx="2.5" fill="#E5E5E5"/>

             <ellipse cx="30" cy="352" rx="17" ry="4" fill="#CCCCCC" opacity="0.6"/>
             <path d="M8 350 Q10 235 30 214 Q50 235 52 350 Z" fill="#111111"/>
             <path d="M6 220 Q30 196 54 220 L54 250 Q30 264 6 250 Z" fill="#444444"/>
             <circle cx="30" cy="192" r="22" fill="#D4D4D4"/>
             <path d="M8 186 Q14 162 30 162 Q46 162 52 186 Q52 196 46 200 L46 188 Q30 180 14 188 L14 200 Q8 196 8 186 Z" fill="#111111"/>
             <rect x="12" y="345" width="14" height="26" rx="4" fill="#111111"/>
             <rect x="34" y="345" width="14" height="26" rx="4" fill="#111111"/>
             <ellipse cx="19" cy="373" rx="10" ry="5" fill="#000000"/>
             <ellipse cx="41" cy="373" rx="10" ry="5" fill="#000000"/>
           </g>
        </svg>
      </div>
    </div>
  )
}

