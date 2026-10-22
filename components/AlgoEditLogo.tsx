import React from 'react';

interface AlgoEditLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  showFlare?: boolean;
  className?: string;
}

export const AlgoEditLogo: React.FC<AlgoEditLogoProps> = ({
  size = 'md',
  showText = true,
  showFlare = true,
  className = ''
}) => {
  // Preset dimension configurations
  const dimMap = {
    xs: { emblemSize: 24, fontSize: 'text-[11px]', letterSpacing: 'tracking-[0.25em]', gap: 'gap-2' },
    sm: { emblemSize: 32, fontSize: 'text-xs', letterSpacing: 'tracking-[0.28em]', gap: 'gap-2.5' },
    md: { emblemSize: 42, fontSize: 'text-sm', letterSpacing: 'tracking-[0.3em]', gap: 'gap-3' },
    lg: { emblemSize: 56, fontSize: 'text-base', letterSpacing: 'tracking-[0.32em]', gap: 'gap-3.5' },
    xl: { emblemSize: 76, fontSize: 'text-xl', letterSpacing: 'tracking-[0.35em]', gap: 'gap-4' },
    hero: { emblemSize: 120, fontSize: 'text-3xl', letterSpacing: 'tracking-[0.4em]', gap: 'gap-5' }
  };

  const { emblemSize, fontSize, letterSpacing, gap } = dimMap[size] || dimMap.md;

  // Standalone Hero view for Landing Page (matches Image 3 exactly)
  if (size === 'hero') {
    return (
      <div className={`flex flex-col items-center justify-center select-none text-center relative ${className}`}>
        {/* Subtle radial background glow behind the logo */}
        <div className="absolute inset-0 bg-[#8DB8CC]/10 blur-[60px] rounded-full pointer-events-none -z-10" />

        {/* Official Geometric Emblem SVG with Anamorphic Optical Flare */}
        <div className="relative flex items-center justify-center">
          <svg 
            width={emblemSize} 
            height={emblemSize * 0.9} 
            viewBox="0 0 240 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-transform duration-500 hover:scale-105"
          >
            <defs>
              {/* Anamorphic Cyan & Cool-Blue Optical Lens Flare */}
              <linearGradient id="heroFlareGrad" x1="0" y1="95" x2="240" y2="95" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8DB8CC" stopOpacity="0" />
                <stop offset="25%" stopColor="#8DB8CC" stopOpacity="0.3" />
                <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="52%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#8DB8CC" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8DB8CC" stopOpacity="0" />
              </linearGradient>

              <radialGradient id="heroFlareCenter" cx="120" cy="95" r="45" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="20%" stopColor="#8DB8CC" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#8DB8CC" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8DB8CC" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Optical Lens Flare horizontal beam */}
            {showFlare && (
              <g>
                <ellipse cx="120" cy="95" rx="115" ry="1.8" fill="url(#heroFlareGrad)" />
                <circle cx="120" cy="95" r="32" fill="url(#heroFlareCenter)" />
              </g>
            )}

            {/* --- OFFICIAL ALGOEDIT GEOMETRIC EMBLEM (Exact Vectorization from Image 3) --- */}
            {/* Outer Inverted Triangle Frame */}
            <polygon 
              points="45,55 195,55 120,150" 
              fill="rgba(141,184,204,0.06)"
              stroke="#FFFFFF" 
              strokeWidth="6" 
              strokeLinejoin="miter" 
            />

            {/* Left Tower / Symmetrical Wing */}
            <polygon 
              points="115,22 115,142 55,80" 
              fill="rgba(255,255,255,0.12)"
              stroke="#FFFFFF" 
              strokeWidth="6" 
              strokeLinejoin="miter" 
            />
            {/* Inner Left Triangular Facet */}
            <polygon 
              points="115,58 115,102 82,85" 
              fill="rgba(141,184,204,0.2)"
              stroke="#FFFFFF" 
              strokeWidth="5" 
              strokeLinejoin="miter" 
            />

            {/* Right Tower / Symmetrical Wing with Angular Interlock */}
            <polygon 
              points="125,22 125,142 195,80" 
              fill="rgba(255,255,255,0.12)"
              stroke="#FFFFFF" 
              strokeWidth="6" 
              strokeLinejoin="miter" 
            />
            {/* Right Angular Inner G/S Segment */}
            <polyline 
              points="125,68 165,68 175,90 135,90 135,112 168,112" 
              stroke="#FFFFFF" 
              strokeWidth="5" 
              strokeLinejoin="miter" 
            />

            {/* Bottom Lower Chevrons / Fins */}
            <polyline 
              points="115,110 50,122 105,145" 
              stroke="#FFFFFF" 
              strokeWidth="6" 
              strokeLinejoin="miter" 
              strokeLinecap="square" 
            />
            <polyline 
              points="125,110 190,122 135,145" 
              stroke="#FFFFFF" 
              strokeWidth="6" 
              strokeLinejoin="miter" 
              strokeLinecap="square" 
            />

            {/* Center Vertical Separation Gap Line */}
            <line 
              x1="120" 
              y1="18" 
              x2="120" 
              y2="152" 
              stroke="#050709" 
              strokeWidth="5" 
            />
          </svg>
        </div>

        {/* ALGOEDIT Wordmark directly below the emblem */}
        {showText && (
          <h2 className={`${fontSize} ${letterSpacing} font-black text-white uppercase mt-4 tracking-[0.35em] whitespace-nowrap drop-shadow-[0_2px_18px_rgba(255,255,255,0.4)]`}>
            ALGOEDIT
          </h2>
        )}
      </div>
    );
  }

  // Header / Sidebar / Standard Horizontal Brand Presentation
  return (
    <div className={`inline-flex items-center ${gap} select-none group cursor-pointer ${className}`}>
      {/* Official Geometric Emblem Icon */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {showFlare && (
          <div className="absolute inset-0 bg-[#8DB8CC]/25 blur-[10px] rounded-full pointer-events-none group-hover:bg-[#8DB8CC]/45 transition-all duration-300" />
        )}

        <svg 
          width={emblemSize} 
          height={emblemSize * 0.9} 
          viewBox="0 0 240 180" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
        >
          <defs>
            <linearGradient id="flareNavGrad" x1="0" y1="90" x2="240" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8DB8CC" stopOpacity="0" />
              <stop offset="35%" stopColor="#8DB8CC" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="65%" stopColor="#8DB8CC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8DB8CC" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Optical Flare Beam */}
          {showFlare && (
            <ellipse cx="120" cy="90" rx="100" ry="2" fill="url(#flareNavGrad)" />
          )}

          {/* Outer Inverted Triangle Frame */}
          <polygon points="45,55 195,55 120,150" fill="rgba(141,184,204,0.08)" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="miter" />

          {/* Left Wing */}
          <polygon points="115,22 115,142 55,80" fill="rgba(255,255,255,0.15)" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="miter" />
          <polygon points="115,58 115,102 82,85" fill="rgba(141,184,204,0.25)" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="miter" />

          {/* Right Wing with Angular Hook */}
          <polygon points="125,22 125,142 195,80" fill="rgba(255,255,255,0.15)" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="miter" />
          <polyline points="125,68 165,68 175,90 135,90 135,112 168,112" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="miter" />

          {/* Bottom Lower Chevrons */}
          <polyline points="115,110 50,122 105,145" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="miter" />
          <polyline points="125,110 190,122 135,145" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="miter" />

          {/* Center Separation */}
          <line x1="120" y1="18" x2="120" y2="152" stroke="#050709" strokeWidth="6" />
        </svg>
      </div>

      {/* Brand Title & Subtitle */}
      {showText && (
        <div className="flex flex-col text-left leading-none whitespace-nowrap">
          <span className={`${fontSize} ${letterSpacing} font-black text-white uppercase whitespace-nowrap group-hover:text-white transition-colors drop-shadow-[0_2px_12px_rgba(255,255,255,0.3)]`}>
            ALGOEDIT
          </span>
          <span className="text-[8px] font-mono font-bold tracking-[0.3em] text-[#AFC3CF] uppercase mt-1 whitespace-nowrap">
            AI STUDIO
          </span>
        </div>
      )}
    </div>
  );
};

export default AlgoEditLogo;
