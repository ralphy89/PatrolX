import React from 'react'

const Logo = ({ width = 40, height = 40, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#F8F9FA",stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#E5E7EB",stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#2563EB",stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1D4ED8",stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Cercle de fond */}
      <circle cx="256" cy="256" r="240" fill="url(#bgGradient)" stroke="#E5E7EB" strokeWidth="2"/>
      
      {/* Bouclier/Radar */}
      <path 
        d="M 256 120 L 180 140 L 180 220 C 180 280 220 320 256 360 C 292 320 332 280 332 220 L 332 140 Z" 
        fill="url(#shieldGradient)" 
        opacity="0.9"
        transform="translate(256, 256) rotate(-15) translate(-256, -256)"
      />
      
      {/* Ondes radar concentriques */}
      <circle cx="256" cy="240" r="80" fill="none" stroke="#2563EB" strokeWidth="3" opacity="0.3"/>
      <circle cx="256" cy="240" r="120" fill="none" stroke="#2563EB" strokeWidth="2" opacity="0.2"/>
      <circle cx="256" cy="240" r="160" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.15"/>
      
      {/* Ligne radar (sweep) */}
      <line 
        x1="256" 
        y1="240" 
        x2="256" 
        y2="100" 
        stroke="#2563EB" 
        strokeWidth="3" 
        strokeLinecap="round"
        opacity="0.4"
        transform="translate(256, 240) rotate(45) translate(-256, -240)"
      />
      
      {/* Lettre X stylisée */}
      <g transform="translate(256, 280)">
        <path 
          d="M -40 -40 L 40 40 M 40 -40 L -40 40" 
          stroke="white" 
          strokeWidth="16" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity="0.95"
        />
        <path 
          d="M -40 -40 L 40 40 M 40 -40 L -40 40" 
          stroke="#2563EB" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity="0.8"
        />
      </g>
      
      {/* Point central */}
      <circle cx="256" cy="240" r="8" fill="#2563EB" opacity="0.9"/>
      <circle cx="256" cy="240" r="4" fill="white"/>
    </svg>
  )
}

export default Logo

