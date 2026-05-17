import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
}

export function Logo({ className = "w-8 h-8", showText = false, textSize = "text-xl" }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 group select-none">
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Glow behind the logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-violet-500 rounded-xl blur-[10px] opacity-30 mix-blend-screen transition-opacity group-hover:opacity-60" />
        
        {/* Actual Logo SVG */}
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative w-full h-full drop-shadow-xl transition-transform group-hover:scale-105">
          {/* Base shape */}
          <rect width="40" height="40" rx="12" fill="#020617" />
          <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="rgba(255,255,255,0.15)" />
          
          {/* G path - top curve */}
          <path 
            d="M 24 13 C 21 10.5 16 11.5 14 14.5 C 12 17.5 13 22.5 16 24.5 C 18.5 26 22.5 26 25 24.5" 
            stroke="url(#logo_gradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* G crossbar and drop */}
          <path 
            d="M 28 19 L 21 19 L 21 26" 
            stroke="url(#logo_gradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Center spark/node */}
          <circle cx="21" cy="19" r="2.5" fill="#22d3ee" className="drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]" />

          <defs>
            <linearGradient id="logo_gradient" x1="12" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" /> {/* cyan-400 */}
              <stop offset="1" stopColor="#8b5cf6" /> {/* violet-500 */}
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`font-black text-white tracking-tight ${textSize}`}>
          Grant<span className="text-cyan-400">AI</span>
        </span>
      )}
    </div>
  );
}
