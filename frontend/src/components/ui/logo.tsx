import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
}

export function Logo({ className = "w-8 h-8", showText = false, textSize = "text-xl" }: LogoProps) {
  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Subtle hover glow */}
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-screen" />
        
        {/* Minimalist Tech Logo SVG */}
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative w-full h-full drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Outer ring / G shape */}
          <path 
            d="M 23 12 C 21.5 9.5 19 8 16 8 C 11.5817 8 8 11.5817 8 16 C 8 20.4183 11.5817 24 16 24 C 20.4183 24 24 20.4183 24 16 L 16 16" 
            stroke="#22d3ee" 
            strokeWidth="2.5" 
            strokeLinecap="square" 
            strokeLinejoin="miter" 
          />
          {/* Inner spark */}
          <rect x="15" y="15" width="2.5" height="2.5" fill="#fff" className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        </svg>
      </div>
      {showText && (
        <span className={`font-semibold text-white tracking-tight ${textSize}`}>
          Grant<span className="text-cyan-400">AI</span>
        </span>
      )}
    </div>
  );
}
