export default function AuthIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full">
        {/* soft blob cluster */}
        <path d="M120 520 C 40 430, 60 300, 180 250 C 260 210, 300 120, 420 110 C 560 100, 640 190, 650 300 C 660 400, 600 470, 500 500 C 380 540, 240 560, 120 520 Z" fill="#c3d0f2"/>
        <path d="M200 520 C 140 440, 170 330, 270 280 C 350 240, 380 160, 470 160 C 580 160, 640 240, 640 330 C 640 420, 570 480, 480 505 C 380 530, 270 540, 200 520 Z" fill="#a9baec" opacity="0.9"/>
        <circle cx="700" cy="150" r="16" fill="#33418f"/>

        {/* ground line */}
        <line x1="60" y1="522" x2="760" y2="522" stroke="#c7cfe6" strokeWidth="1.5"/>

        {/* 3D bar icon on ground */}
        <g transform="translate(560,470)">
          <rect x="0" y="30" width="18" height="22" fill="#33418f"/>
          <rect x="22" y="14" width="18" height="38" fill="#4a5ba8"/>
          <rect x="44" y="0" width="18" height="52" fill="#7889d6"/>
        </g>

        {/* monitor mockup */}
        <g transform="translate(300,190)">
          <rect x="0" y="0" width="330" height="270" rx="14" fill="#eef1fb" stroke="#7889d6" strokeWidth="2"/>
          {/* side dots */}
          <circle cx="20" cy="30" r="5" fill="#c3ccec"/>
          <circle cx="20" cy="50" r="5" fill="#c3ccec"/>
          <circle cx="20" cy="70" r="5" fill="#c3ccec"/>
          <circle cx="20" cy="90" r="5" fill="#c3ccec"/>

          {/* top bar lines */}
          <rect x="46" y="26" width="120" height="8" rx="4" fill="#9fadde"/>
          <rect x="46" y="42" width="90" height="6" rx="3" fill="#c3ccec"/>
          <rect x="46" y="54" width="100" height="6" rx="3" fill="#c3ccec"/>

          {/* three small squares */}
          <rect x="46" y="76" width="16" height="16" rx="3" fill="#7889d6"/>
          <rect x="68" y="76" width="16" height="16" rx="3" fill="#c3ccec"/>
          <rect x="90" y="76" width="16" height="16" rx="3" fill="#c3ccec"/>

          {/* lower bar lines */}
          <rect x="46" y="104" width="110" height="7" rx="3.5" fill="#c3ccec"/>
          <rect x="46" y="118" width="70" height="7" rx="3.5" fill="#9fadde"/>
          <rect x="46" y="132" width="90" height="7" rx="3.5" fill="#c3ccec"/>

          {/* pie chart */}
          <g transform="translate(210,90)">
            <circle cx="0" cy="0" r="46" fill="#c3ccec"/>
            <path d="M0 0 L0 -46 A46 46 0 0 1 40 20 Z" fill="#33418f"/>
          </g>

          {/* icon list right */}
          <g transform="translate(268,20)">
            <circle cx="0" cy="4" r="3" fill="#7889d6"/>
            <rect x="10" y="0" width="34" height="6" rx="3" fill="#c3ccec"/>
            <circle cx="0" cy="20" r="3" fill="#7889d6"/>
            <rect x="10" y="16" width="34" height="6" rx="3" fill="#c3ccec"/>
            <circle cx="0" cy="36" r="3" fill="#7889d6"/>
            <rect x="10" y="32" width="34" height="6" rx="3" fill="#c3ccec"/>
          </g>

          {/* bottom row items */}
          <line x1="20" y1="200" x2="310" y2="200" stroke="#dbe1f5" strokeWidth="1.5"/>
          <g transform="translate(30,214)">
            <path d="M0 14 A14 14 0 1 1 14 0" fill="none" stroke="#9fadde" strokeWidth="4"/>
            <rect x="26" y="8" width="50" height="6" rx="3" fill="#c3ccec"/>
          </g>
          <g transform="translate(120,214)">
            <path d="M0 14 A14 14 0 1 1 14 0" fill="none" stroke="#9fadde" strokeWidth="4"/>
            <rect x="26" y="8" width="50" height="6" rx="3" fill="#c3ccec"/>
          </g>
          <g transform="translate(210,214)">
            <path d="M0 14 A14 14 0 1 1 14 0" fill="none" stroke="#9fadde" strokeWidth="4"/>
            <rect x="26" y="8" width="50" height="6" rx="3" fill="#c3ccec"/>
          </g>
        </g>

        {/* left figure holding small chart card */}
        <g transform="translate(150,260)">
          <rect x="-40" y="230" width="110" height="90" rx="6" fill="#f7f9ff" stroke="#c3ccec" strokeWidth="1.5"/>
          <rect x="-30" y="270" width="8" height="30" fill="#7889d6"/>
          <rect x="-16" y="255" width="8" height="45" fill="#33418f"/>
          <rect x="-2" y="278" width="8" height="22" fill="#9fadde"/>
          <circle cx="30" cy="252" r="3" fill="#7889d6"/>
          <circle cx="30" cy="264" r="3" fill="#7889d6"/>
          <circle cx="30" cy="276" r="3" fill="#7889d6"/>

          <ellipse cx="30" cy="332" rx="16" ry="4" fill="#c3ccec" opacity="0.6"/>
          <path d="M8 330 Q10 220 30 200 Q50 220 52 330 Z" fill="#4a5ba8"/>
          <path d="M6 205 Q30 180 54 205 L54 235 Q30 250 6 235 Z" fill="#5b6bc0"/>
          <circle cx="30" cy="178" r="22" fill="#f0c9a4"/>
          <path d="M8 172 Q30 150 52 172 Q54 190 46 196 Q30 178 14 196 Q6 190 8 172 Z" fill="#2c2f4a"/>
          <rect x="12" y="325" width="14" height="26" rx="4" fill="#33418f"/>
          <rect x="34" y="325" width="14" height="26" rx="4" fill="#33418f"/>
          <ellipse cx="19" cy="353" rx="10" ry="5" fill="#242a4d"/>
          <ellipse cx="41" cy="353" rx="10" ry="5" fill="#242a4d"/>
        </g>

        {/* right figure holding rectangular card */}
        <g transform="translate(560,240)">
          <rect x="20" y="255" width="90" height="55" rx="6" fill="#f7f9ff" stroke="#c3ccec" strokeWidth="1.5"/>
          <rect x="32" y="266" width="55" height="5" rx="2.5" fill="#9fadde"/>
          <rect x="32" y="278" width="40" height="5" rx="2.5" fill="#c3ccec"/>
          <rect x="32" y="290" width="48" height="5" rx="2.5" fill="#c3ccec"/>

          <ellipse cx="30" cy="352" rx="17" ry="4" fill="#c3ccec" opacity="0.6"/>
          <path d="M8 350 Q10 235 30 214 Q50 235 52 350 Z" fill="#33418f"/>
          <path d="M6 220 Q30 196 54 220 L54 250 Q30 264 6 250 Z" fill="#4a5ba8"/>
          <circle cx="30" cy="192" r="22" fill="#f0c9a4"/>
          <path d="M8 186 Q14 162 30 162 Q46 162 52 186 Q52 196 46 200 L46 188 Q30 180 14 188 L14 200 Q8 196 8 186 Z" fill="#1e2340"/>
          <rect x="12" y="345" width="14" height="26" rx="4" fill="#242a4d"/>
          <rect x="34" y="345" width="14" height="26" rx="4" fill="#242a4d"/>
          <ellipse cx="19" cy="373" rx="10" ry="5" fill="#33418f"/>
          <ellipse cx="41" cy="373" rx="10" ry="5" fill="#33418f"/>
        </g>

      </svg>
    </div>
  )
}
