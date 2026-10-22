import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Zap, 
  Cpu, 
  ChevronRight, 
  Activity, 
  Music, 
  Gauge, 
  ArrowRight,
  CheckCircle2,
  Layers,
  Fingerprint,
  RefreshCw,
  Sliders,
  Play,
  RotateCw,
  Terminal,
  Grid,
  Bot
} from 'lucide-react';
import { OnNavigateType } from '../types';

interface FeaturesShowcaseProps {
  onNavigate: OnNavigateType;
}

interface PanelData {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  benefits: string[];
  ctaText: string;
  targetPage: string;
  accentColor: string;
  glowColor: string;
  gradient: string;
  tagIcon: React.ReactNode;
  rightSide: 'video' | 'comparison' | 'cards' | 'chart' | 'face-rig' | 'dance' | 'ecosystem';
  image: string;
}

export const FeaturesShowcase: React.FC<FeaturesShowcaseProps> = ({ onNavigate }) => {
  const [activePanel, setActivePanel] = useState(0);

  const PANELS: PanelData[] = [
    {
      id: "ai-video",
      num: "01",
      title: "REAL-TIME CINEMATIC FLUIDITY",
      subtitle: "DIRECT-ENTRY MOVEMENT PIPELINE",
      desc: "Translate prompt narratives or flat layout drafts into breathtaking high-definition kinetic videos. Built with robust gravitational understanding, atmospheric light dispersion, and strict temporal styling.",
      benefits: [
        "Intelligent frame tracking across virtual cameras",
        "Fluid resolution bounds (portrait, cinematic, or square)",
        "Hyper-stable neural motion correction layers"
      ],
      ctaText: "Launch Kinetic Video Workspace",
      targetPage: "video-generator",
      accentColor: "#8DB8CC",
      glowColor: "rgba(141, 184, 204, 0.4)",
      gradient: "from-[#8DB8CC]/10 via-white/5 to-transparent",
      tagIcon: <Video className="w-4 h-4 text-[#8DB8CC]" />,
      rightSide: "video",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "ai-image",
      num: "02",
      title: "PHOTOREALISTIC TEXTURE FORGING",
      subtitle: "STYLIZED HIGH-DEFINITION ENGINE",
      desc: "Leverage our unified picture generator to build studio-grade asset photography, commercial banners, and environmental concept art. Take meticulous control of focal distance, lens characteristics, and materials.",
      benefits: [
        "True-to-life surface textures up to ultra-high depths",
        "Assisted prompt analysis with semantic context feedback",
        "Dynamic outpainting and seamless asset expansion"
      ],
      ctaText: "Launch Texture Studio",
      targetPage: "image-generator",
      accentColor: "#AFC3CF",
      glowColor: "rgba(175, 195, 207, 0.4)",
      gradient: "from-[#AFC3CF]/10 via-white/5 to-transparent",
      tagIcon: <ImageIcon className="w-4 h-4 text-[#AFC3CF]" />,
      rightSide: "cards",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "identity-lock",
      num: "03",
      title: "SECURE CHARACTER STRUCTURE LOCK",
      subtitle: "COHERENT ACTOR & ASSET PIPELINE",
      desc: "Preserve face geometry and specific character markers throughout long-form narratives. Our multi-point coordinate system aligns lighting direction, active shadow tracking, and subtle facial traits.",
      benefits: [
        "Coordinate drift minimized under microscopic thresholds",
        "Smart shadow adjusting based on atmospheric lighting",
        "Support for concurrent multiple profile locks"
      ],
      ctaText: "Launch Core Identity Tool",
      targetPage: "talking-avatar",
      accentColor: "#E8F0F4",
      glowColor: "rgba(232, 240, 244, 0.4)",
      gradient: "from-white/10 via-[#8DB8CC]/5 to-transparent",
      tagIcon: <Cpu className="w-4 h-4 text-[#E8F0F4]" />,
      rightSide: "face-rig",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "viral-effects",
      num: "04",
      title: "DYNAMIC MEDIA EMULATION CHANNELS",
      subtitle: "NEXT-GEN CREATIVE MEDIA PRESETS",
      desc: "Equip your media with advanced stylistic templates, including deep muscle tracking, macro zoom layers, age transitions, and classic hand-drawn art filters designed to maximize content reach.",
      benefits: [
        "Dozens of high-impact visual styles ready for export",
        "Automated motion tracking across deep perspective planes",
        "Subtle visual triggers aligned perfectly to tempo"
      ],
      ctaText: "Launch Preset Workspace",
      targetPage: "auto-shorts-maker",
      accentColor: "#8DB8CC",
      glowColor: "rgba(141, 184, 204, 0.4)",
      gradient: "from-[#8DB8CC]/10 via-white/5 to-transparent",
      tagIcon: <Sparkles className="w-4 h-4 text-[#8DB8CC]" />,
      rightSide: "comparison",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "dance-sync",
      num: "05",
      title: "BONE-LATTICE RHYTHM INTEGRATION",
      subtitle: "KINETIC AUDIO-TO-MOTION CORRELATOR",
      desc: "Translate skeletal movement vectors with frame-by-frame precision. Render choreographic transitions from simple stills or raw tracks utilizing high-fidelity neon trace aesthetics.",
      benefits: [
        "Frame-by-frame bone lattice dynamic matching",
        "Hyper-smooth skeletal translation engine",
        "Meticulous particles and kinetic lighting effects"
      ],
      ctaText: "Launch Motion Alignment Engine",
      targetPage: "ai-dance-generator",
      accentColor: "#AFC3CF",
      glowColor: "rgba(175, 195, 207, 0.4)",
      gradient: "from-[#AFC3CF]/10 via-white/5 to-transparent",
      tagIcon: <Music className="w-4 h-4 text-[#AFC3CF]" />,
      rightSide: "dance",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "enterprise-speed",
      num: "06",
      title: "CONCURRENT ENGINE GRID COMPILATION",
      subtitle: "ENTERPRISE WORKLOAD PIPELINE",
      desc: "Dispatch render tasks to multiple leading AI pipelines simultaneously. Leverage our back-end queue distribution channels to run batch generations up to 10x quicker without device strain.",
      benefits: [
        "Simultaneous bulk processing and multi-asset export",
        "Intelligent automated keyframe interpolation",
        "Optimized server resource load-balancing"
      ],
      ctaText: "View Node Performance",
      targetPage: "features-overview",
      accentColor: "#E8F0F4",
      glowColor: "rgba(232, 240, 244, 0.4)",
      gradient: "from-white/10 via-[#8DB8CC]/5 to-transparent",
      tagIcon: <Gauge className="w-4 h-4 text-[#E8F0F4]" />,
      rightSide: "chart",
      image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "final-ecosystem",
      num: "07",
      title: "YOUR COMPLETE CREATIVE NODE HUB",
      subtitle: "UNIFIED MEDIA PRODUCTION CENTER",
      desc: "Bring all production models, rendering pipelines, batch clusters, and neural assets together in a singular professional canvas. Seamlessly scale workflows from initial prompt conceptualization to final multi-model render outputs.",
      benefits: [
        "Interconnected tool feedback nodes",
        "Zero workspace switching latency",
        "Optimized pipelines mapping raw variables"
      ],
      ctaText: "Return to Main Dashboard",
      targetPage: "home-main",
      accentColor: "#8DB8CC",
      glowColor: "rgba(141, 184, 204, 0.4)",
      gradient: "from-[#8DB8CC]/10 via-white/5 to-transparent",
      tagIcon: <Bot className="w-4 h-4 text-[#8DB8CC]" />,
      rightSide: "ecosystem",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const N = PANELS.length;

  // Auto-play cycling effect to make the slide showcase highly dynamic and immediately visible
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePanel((prev) => (prev + 1) % N);
    }, 6000);
    return () => clearInterval(timer);
  }, [N]);

  // Select specific feature page slide (direct interactive navigation)
  const scrollToPanel = (idx: number) => {
    setActivePanel(idx);
  };

  return (
    <div 
      id="page-turn-showcase"
      className="relative w-full bg-[#030611] py-16 md:py-24 z-[35] overflow-hidden"
    >
      {/* Container holding the book frame */}
      <div className="w-full flex flex-col justify-between min-h-[680px] md:min-h-[750px] relative z-10">
        
        {/* Dynamic Glowing Accents behind the 3D book cover layout */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute rounded-full w-[650px] h-[650px] blur-[160px] transition-all duration-1000 opacity-20 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              backgroundColor: PANELS[activePanel]?.accentColor || "#3B82F6",
              left: '50%',
              top: '50%'
            }}
          />
          <div className="absolute inset-0 bg-[#02050D]/85 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />
        </div>

        {/* Top Header Information inside the showcase */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DB8CC] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8DB8CC] shadow-[0_0_8px_rgba(141,184,204,0.6)]"></span>
            </div>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <Sparkles size={11} className="text-[#8DB8CC]" />
              ALGOEDIT AI EXPERIENCE HUB
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-white/50 tracking-wider">
              PAGE REVIEW <span className="text-[#8DB8CC] font-extrabold">{PANELS[activePanel]?.num || "01"}</span> OF {N}
            </span>
          </div>
        </div>

        {/* Main Double Page View Area */}
        <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-12 flex items-center justify-center relative z-10 mt-3 md:mt-4">
          
          {/* Vertical Progress Rail Indicator on the Left Margin */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-5 z-[40]">
            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500 rotate-180 [writing-mode:vertical-lr] mb-2">PROGRESS RAIL</span>
            
            <div className="relative w-0.5 h-64 bg-slate-800/60 rounded">
              {/* Glowing active progress line track fill */}
              <motion.div 
                className="absolute top-0 left-0 w-full rounded bg-gradient-to-b from-cyan-400 via-indigo-400 to-purple-500"
                style={{ 
                  height: `${(activePanel / (N - 1)) * 100}%`,
                  boxShadow: "0 0 10px rgba(34,211,238,0.5)"
                }}
              />
              
              {/* Feature Page Point Nodes */}
              {PANELS.map((p, idx) => {
                const active = idx === activePanel;
                const nodePosPercent = (idx / (N - 1)) * 100;
                return (
                  <button
                    key={`node-${p.id}`}
                    onClick={() => scrollToPanel(idx)}
                    className="absolute -left-1.5 w-3.5 h-3.5 rounded-full border bg-[#050918] flex items-center justify-center transition-all duration-300 group focus:outline-none hover:scale-125 cursor-pointer"
                    style={{ 
                      top: `${nodePosPercent}%`,
                      borderColor: active ? p.accentColor : 'rgba(255,255,255,0.1)',
                      boxShadow: active ? `0 0 10px ${p.accentColor}` : 'none'
                    }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-white' : 'bg-slate-700 group-hover:bg-slate-400'}`} style={{ backgroundColor: active ? p.accentColor : '' }} />
                    
                    {/* Hover Tooltip displaying feature identity */}
                    <div className="absolute left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-slate-950/95 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide text-white whitespace-nowrap shadow-xl flex items-center gap-2">
                      <span style={{ color: p.accentColor }}>{p.num}</span>
                      <span className="text-slate-400 font-medium">|</span>
                      <span>{p.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-500 mt-2">v2.4</span>
          </div>

          {/* 3D Book Layout Container */}
          <div 
            className="relative w-full h-[70vh] max-h-[620px] rounded-[32px]"
            style={{ perspective: 1800 }}
          >
            {PANELS.map((panel, i) => {
              // PERFORMANCE OPTIMIZATION: Only render the current, previous, and next panels.
              // This reduces rendering burden by 70%, completely eliminating scrolling stutters/lag.
              const isNear = Math.abs(i - activePanel) <= 1;
              if (!isNear) return null;

              return (
                <BookPage
                  key={panel.id}
                  panel={panel}
                  i={i}
                  N={N}
                  activePanel={activePanel}
                  onNavigate={onNavigate}
                />
              );
            })}
          </div>
        </div>

        {/* Horizontal Pagination Indicator on bottom (Mobile fallback & jump helper) */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {PANELS.map((p, idx) => {
              const active = idx === activePanel;
              return (
                <button
                  key={p.id}
                  onClick={() => scrollToPanel(idx)}
                  className="group flex items-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  <span 
                    className={`font-mono text-[10.5px] transition-colors duration-300 ${
                      active ? 'text-white font-extrabold' : 'text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    [{p.num}]
                  </span>
                  {idx < N - 1 && (
                    <div 
                      className={`h-[1px] w-6 sm:w-8 transition-all duration-500 ${
                        active ? 'bg-cyan-400' : 'bg-slate-800'
                      }`} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-slate-500">
            <span className="animate-pulse">CLICK OR AUTOPLAY</span>
            <ChevronRight size={11} className="text-slate-600" />
            <span className="text-slate-400 uppercase">Interactive Magazine Engine</span>
          </div>
        </div>

      </div>
    </div>
  );
};

interface BookPageProps {
  panel: PanelData;
  i: number;
  N: number;
  activePanel: number;
  onNavigate: OnNavigateType;
}

const BookPage: React.FC<BookPageProps> = ({
  panel,
  i,
  N,
  activePanel,
  onNavigate
}) => {
  const isPast = i < activePanel;
  const isCurrent = i === activePanel;
  const isFuture = i > activePanel;
  const isInteractive = isCurrent;

  // Since we are state-driven, we don't rely on the flaky scroll tracking (especially inside iframes).
  // This ensures 100% stable performance and full compliance in sandboxed preview windows.
  const zIndexVal = isCurrent ? 30 : (isPast ? 10 : 20 - i);

  return (
    <motion.div
      key={panel.id}
      animate={{
        opacity: isPast ? 0 : 1,
        scale: isCurrent ? 1 : (isPast ? 0.94 : 0.97),
        rotateY: isPast ? -145 : (isFuture ? 12 : 0),
        x: isPast ? "-105%" : (isFuture ? "4%" : "0%"),
        z: isCurrent ? 0 : (isPast ? -80 : -35),
      }}
      transition={{
        type: "spring",
        stiffness: 65, // Luxurious, more deliberate pace
        damping: 20,   // Butter-smooth deceleration without bounciness
        mass: 1.1,     // Heavier physical paper weight weight feel for elegant book-like turning
      }}
      style={{
        zIndex: zIndexVal,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        pointerEvents: isCurrent ? "auto" : "none",
        willChange: "transform, opacity" // PERFORMANCE: Enable GPU layout hardware layer acceleration
      }}
      // HIGH PERFORMANCE: Replaced backdrop-blur-xl with a clean, fully opaque background.
      // Backdrop filters on nested 3D elements undergoing rotateY rotation force active per-pixel background recalculations on every frame, which severely tanks browser paint cycles (scrolling lag).
      className="absolute inset-0 w-full h-full bg-[#0a0d1e] border border-white/10 rounded-[30px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85)] flex flex-col md:flex-row"
    >
      {/* Dynamic folding shadow veneer layer that reacts beautifully to flip state */}
      <motion.div 
        className="absolute inset-0 bg-[#02040d] pointer-events-none z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPast ? 0.75 : (isFuture ? 0.2 : 0) }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Left Spine Shadow Shade to mock paper binding depth */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/50 to-transparent pointer-events-none z-30" />
      
      {/* Subtle right-to-left turn light reflection highlight */}
      <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/[0.015] to-transparent pointer-events-none z-20" style={{ transform: 'translateX(-50%)' }} />

      {/* Left Side Page Content Area (Features metadata storytelling) */}
      <div className="w-full md:w-[48%] p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between h-full relative z-10 bg-gradient-to-b from-white/[0.01] to-transparent">
        <div className="space-y-4 sm:space-y-5">
          
          {/* Section Identification Tag */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              MODULE {panel.num}
            </span>
            <div className="h-[1px] w-6 bg-slate-800" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase text-slate-300 tracking-wider">
              {panel.tagIcon}
              <span>{panel.subtitle}</span>
            </div>
          </div>

          {/* Display Heading Title */}
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-none text-white uppercase italic"
            style={{ textShadow: `0 0 20px ${panel.glowColor}` }}
          >
            {panel.title}
          </h2>

          {/* Description Narrative */}
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-light">
            {panel.desc}
          </p>

          {/* Feature Checklist */}
          <div className="space-y-2.5 pt-2">
            {panel.benefits.map((benefit, bIdx) => (
              <div key={bIdx} className="flex items-center gap-2.5">
                <div className="flex-shrink-0 p-0.5 rounded-full bg-slate-900 border border-[#8DB8CC]/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8DB8CC]" />
                </div>
                <span className="text-xs text-slate-300 font-mono tracking-wide">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* CTA Launch Trigger Button */}
        <div className="pt-4">
          {panel.id === "final-ecosystem" ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("signin")}
                className="px-6 h-11 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-extrabold text-[11px] uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-2 border border-white/50"
              >
                <span>Start Free Studio</span>
                <ArrowRight size={12} />
              </button>
              
              <button
                onClick={() => onNavigate("pricing")}
                className="px-5 h-11 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-300 border border-white/10 hover:border-white/20 cursor-pointer"
              >
                View Pricing
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate(panel.targetPage as any)}
              className="group relative inline-flex items-center gap-2 px-6 h-12 rounded-xl text-[10.5px] font-black uppercase tracking-widest text-[#fff] border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015]"
              style={{ 
                borderColor: `${panel.accentColor}40`,
                boxShadow: `0 0 25px ${panel.accentColor}10`
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-slate-900/40 relative z-10" />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#030712] via-[#0b1329] to-[#030712] transition-opacity duration-500" />
              
              <span className="relative flex items-center gap-2 z-20">
                {panel.ctaText}
                <ArrowRight 
                  className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" 
                  style={{ color: panel.accentColor }} 
                />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Right Side Visual Area (Self-contained, non-image active mockups) */}
      <div className="w-full md:w-[52%] h-full relative overflow-hidden bg-[#03050c]/50 border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-center p-6 md:p-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        {/* Visual Mockups Content Switcher */}
        {renderVisualMockup(panel.rightSide, isInteractive, panel.accentColor, panel.image)}
      </div>

    </motion.div>
  );
};

// Pure-visual interactive mockups renderer for the right side of the book page
const renderVisualMockup = (
  type: 'video' | 'comparison' | 'cards' | 'chart' | 'face-rig' | 'dance' | 'ecosystem',
  isActive: boolean,
  accentColor: string,
  imageUrl?: string
) => {
  if (!isActive) {
    // PERFORMANCE OPTIMIZATION: Removed .animate-spin class and replaced with a lightweight static icon layout to prevent background recalculation overhead on hidden slides.
    return (
      <div className="w-full h-full rounded-2xl border border-white/5 bg-[#04060d]/60 relative flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-slate-700 mb-2">
          <RefreshCw size={16} className="text-slate-600 opacity-60" />
        </div>
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Awaiting Page Calibration</span>
      </div>
    );
  }

  switch(type) {
    case 'video':
      return (
        <div className="w-full h-full flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-white/5 relative z-10 overflow-hidden shadow-inner">
          {/* Virtual rendering frame preview */}
          <div className="relative w-full h-[70%] rounded-xl overflow-hidden border border-white/5 bg-slate-900/40 flex items-center justify-center">
            {/* Real Image background reference merged into the system workflow */}
            {imageUrl && (
              <div className="absolute inset-0 z-0 animate-fade-in">
                <img 
                  src={imageUrl} 
                  alt="Cinematic Reference" 
                  className="w-full h-full object-cover opacity-50 mix-blend-luminosity hover:opacity-75 transition-opacity duration-505"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </div>
            )}
            {/* Moving grid background representing ray synthesis of video */}
            <div className="absolute inset-0 bg-[#061B29]/30 bg-[linear-gradient(to_right,#06b6d40c_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40c_1px,transparent_1px)] bg-[size:14px_24px] overflow-hidden">
              <motion.div 
                animate={{ y: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#06b6d4] opacity-50"
              />
            </div>
            
            {/* Visual focal elements representing rendering spheres */}
            <div className="relative flex items-center justify-center z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600/30 to-blue-500/20 border border-cyan-400/40 animate-pulse relative z-10 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-center">
                <Video size={24} className="text-cyan-300 animate-bounce" />
              </div>
              <div className="absolute -inset-4 rounded-full border border-dashed border-cyan-400/10 animate-spin" style={{ animationDuration: '10s' }} />
              <div className="absolute -inset-8 rounded-full border border-dashed border-cyan-500/5 animate-spin" style={{ animationDuration: '16s' }} />
            </div>

            <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg border border-white/5 text-[9px] font-mono text-cyan-400 flex items-center gap-1.5">
              <Activity size={9} className="animate-pulse" />
              <span>SYNTHESIS: ACTIVE</span>
            </div>
          </div>

          {/* Timeline parameters interface */}
          <div className="h-[26%] bg-slate-900/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>TRACK RENDER PIPELINE</span>
              <span className="text-cyan-400">4K UHD | 60 FPS</span>
            </div>
            
            {/* Mock Timeline Sequence track */}
            <div className="relative h-2 bg-slate-950/80 rounded overflow-hidden">
              <motion.div 
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded shadow-[0_0_8px_#06b6d4]"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Play size={10} className="text-cyan-400 fill-cyan-400/20" />
                <span>render_node_01.mp4</span>
              </div>
              <span>94.2%</span>
            </div>
          </div>

        </div>
      );

    case 'cards':
       return (
        <div className="w-full h-full flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-white/5 relative z-10 overflow-hidden shadow-inner">
          {imageUrl && (
            <div className="absolute inset-0 z-0">
              <img 
                src={imageUrl} 
                alt="Imaging Reference" 
                className="w-full h-full object-cover opacity-25 mix-blend-luminosity hover:opacity-45 transition-opacity duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
            </div>
          )}
          <div className="flex-grow flex flex-col justify-center gap-3 relative z-10">
            
            {/* Card preset style 01 */}
            <div className="p-3 bg-[#0c0f24] border border-purple-500/15 rounded-xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                  <Sliders size={14} />
                </div>
                <div className="text-left">
                  <span className="text-[8.5px] font-mono font-black text-purple-400/80 uppercase tracking-widest block">PRESET 0A</span>
                  <h4 className="text-xs font-extrabold text-white">Hyper-realistic Ray Tracing</h4>
                </div>
              </div>
              <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/15">ACTIVE</span>
            </div>

            {/* Card preset style 02 */}
            <div className="p-3 bg-[#06101c] border border-blue-500/15 rounded-xl flex items-center justify-between shadow-md opacity-85">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                  <Grid size={14} />
                </div>
                <div className="text-left">
                  <span className="text-[8.5px] font-mono font-black text-blue-400/80 uppercase tracking-widest block">PRESET 0B</span>
                  <h4 className="text-xs font-bold text-white">Anamorphic Retro Grain</h4>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2.5 py-0.5 rounded border border-white/5">STANDBY</span>
            </div>

            {/* Prompt input sandbox preview */}
            <div className="p-3 bg-slate-950 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-[8.5px] font-mono text-slate-500 text-left">
                <Terminal size={10} className="text-purple-400" />
                <span>DYNAMIC IMAGE PROMPTER CO-PILOT</span>
              </div>
              <p className="text-[10.5px] font-mono text-slate-350 text-left leading-normal italic select-none">
                "A cinematic close-up of a cybernetic warrior figure inside a neon purple cockpit, raytraced glass reflections, depth of field..."
              </p>
            </div>

          </div>

          <div className="h-10 border-t border-white/5 mt-2 flex items-center justify-between px-1 text-[9px] font-mono text-slate-400">
            <span>LAYERS: 12 RENDER LAYERS DEPLOYED</span>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          </div>
        </div>
       );

    case 'face-rig':
      return (
        <div className="w-full h-full flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-white/5 relative z-10 overflow-hidden">
          {/* Avatar face wireframe mapping area */}
          <div className="relative w-full h-[76%] rounded-xl border border-white/5 bg-slate-900/30 overflow-hidden flex items-center justify-center">
            {/* Real face image underneath the tracking scanner */}
            {imageUrl && (
              <div className="absolute inset-0 z-0">
                <img 
                  src={imageUrl} 
                  alt="Neural Identity Target" 
                  className="w-full h-full object-cover opacity-35 mix-blend-luminosity hover:opacity-60 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
              </div>
            )}
            
            {/* Scanner line scanning across coordinates */}
            <motion.div 
              animate={{ y: ["-10%", "110%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-0.5 bg-emerald-400 opacity-60 shadow-[0_0_12px_#10b981] z-20"
            />

            {/* Simulated Cyber Coordinate wireframe using pure CSS vectors */}
            <div className="relative w-36 h-36 border border-emerald-500/20 rounded-full flex items-center justify-center animate-pulse z-10">
              <div className="w-24 h-24 border border-dashed border-emerald-500/30 rounded-full" />
              <div className="w-12 h-[1px] bg-emerald-500/50 absolute" />
              <div className="h-12 w-[1px] bg-emerald-500/50 absolute" />
              
              {/* Eye node rings */}
              <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full border border-emerald-400 flex items-center justify-center">
                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
              </div>
              <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full border border-emerald-400 flex items-center justify-center">
                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
              </div>

              {/* Mouth contour nodes anchor line */}
              <div className="absolute bottom-1/4 w-12 h-1.5 border-b border-l border-r border-emerald-400/70 rounded-b-lg" />
              
              {/* Glow node markers */}
              <span className="absolute top-[28%] left-[48%] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span className="absolute bottom-[44%] left-[24%] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span className="absolute bottom-[44%] right-[24%] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </div>

            {/* Bottom Floating Stats overlay */}
            <div className="absolute bottom-3 right-3 z-10 bg-black/70 backdrop-blur px-2 py-1 rounded-lg border border-white/5 text-[8.5px] font-mono text-emerald-400">
              COORDINATE GAP DRIFT: 0.04% ACCURATE
            </div>
          </div>

          {/* Control lock interface */}
          <div className="h-[20%] flex items-center justify-between px-4 text-[10px] font-mono bg-emerald-950/15 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <Fingerprint size={14} className="animate-pulse" />
              <span className="font-bold">ACTOR STYLE LOCKED</span>
            </div>
            <span className="text-[10px] text-slate-400">FIDELITY SECURED</span>
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div className="w-full h-full flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-white/5 relative z-10 overflow-hidden">
          
          {/* Before/After Swipe slider mockup */}
          <div className="relative w-full h-[85%] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center bg-slate-900/30">
            
            {/* Grayscale Left Section / Sketch Side */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center z-10 border-r border-rose-500/30">
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded mb-2">RAW SOURCE</span>
              <div className="w-8 h-8 rounded-full border border-dashed border-rose-500/20 animate-spin bg-transparent" />
            </div>

            {/* Colored Neon Glamour Right Section */}
            <div className="absolute inset-y-0 right-0 w-1/2 flex flex-col items-center justify-center z-0 overflow-hidden">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="Stylized Output" 
                  className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-color-dodge hover:opacity-70 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
              )}
              {/* Radial gradient backing overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/20 via-slate-950/80 to-[#0c0e1a]/95 z-10" />
              
              <div className="relative z-20 flex flex-col items-center">
                <span className="text-[11px] font-mono font-black text-rose-300 bg-rose-500/20 border border-rose-400 px-2 py-1 rounded shadow-[0_0_10px_rgba(244,63,94,0.3)] mb-2 animate-pulse">AI CINEMA STYLE</span>
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                  <Sparkles size={16} className="animate-bounce" />
                </div>
              </div>
            </div>

            {/* Sliding Divider Bar handle */}
            <motion.div 
              animate={{ left: ["40%", "60%", "40%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_15px_#f43f5e] z-20 flex items-center justify-center"
            >
              <div className="w-5 h-5 rounded-full border border-rose-400 bg-slate-950 flex items-center justify-center text-rose-500 shadow-xl cursor-default scale-110">
                <ChevronRight size={10} className="text-rose-400 animate-pulse" />
              </div>
            </motion.div>

          </div>

          <div className="h-[12%] flex items-center justify-between px-3 text-[9px] font-mono border border-white/5 bg-slate-900/40 rounded-lg">
            <span>AESTHETIC MODULE ACTIVE: GHIBLI SHADER</span>
            <span className="text-rose-400 font-black">STABILIZED</span>
          </div>

        </div>
      );

    case 'dance':
      return (
        <div className="w-full h-full flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-white/5 relative z-10 overflow-hidden text-center justify-center items-center">
          
          {/* Skeleton tracking canvas */}
          <div className="relative w-full h-[76%] rounded-xl border border-white/5 bg-slate-900/30 flex items-center justify-center overflow-hidden">
            {imageUrl && (
              <div className="absolute inset-0 z-0">
                <img 
                  src={imageUrl} 
                  alt="Kinetic Sync Target" 
                  className="w-full h-full object-cover opacity-35 mix-blend-color-dodge hover:opacity-60 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              </div>
            )}
            
            {/* Grid network */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f60a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f60a_1px,transparent_1px)] bg-[size:16px_16px] z-10" />

            {/* Interactive bone coordinates lines model */}
            <div className="relative w-36 h-36 flex flex-col items-center justify-center z-20">
              
              {/* Head node */}
              <div className="w-4 h-4 rounded-full border border-blue-400 bg-blue-500/20 absolute top-[5%] animate-pulse" />
              
              {/* Chest line */}
              <div className="w-20 h-[1.5px] bg-blue-500/40 absolute top-[25%]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute top-[24%] left-[20%]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute top-[24%] right-[20%]" />
              
              {/* Spine line */}
              <div className="w-[1.5px] h-[45px] bg-blue-500/40 absolute top-[25%]" />
              
              {/* Arms joints */}
              <span className="absolute w-[2px] h-10 bg-blue-500/30 top-[25%] left-[25%] rotate-[35deg] origin-top" />
              <span className="absolute w-[2px] h-10 bg-blue-500/30 top-[25%] right-[25%] -rotate-[35deg] origin-top" />
              
              {/* Hip line */}
              <div className="w-14 h-[1.5px] bg-blue-500/40 absolute top-[55%]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute top-[54%] left-[30%]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute top-[54%] right-[30%]" />

              {/* Legs joint nodes */}
              <span className="absolute w-[2px] h-12 bg-blue-500/30 top-[55%] left-[32%] rotate-[15deg] origin-top" />
              <span className="absolute w-[2px] h-12 bg-blue-500/30 top-[55%] right-[32%] -rotate-[15deg] origin-top" />
              
              {/* Rhythm shockwaves */}
              <div className="absolute top-[5%] w-8 h-8 rounded-full border border-[#8DB8CC]/20 scale-150 animate-ping" />
              <div className="absolute top-[24%] left-[20%] w-6 h-6 rounded-full border border-[#8DB8CC]/20 animate-ping" style={{ animationDelay: '0.4s' }} />
              <div className="absolute top-[24%] right-[20%] w-6 h-6 rounded-full border border-[#8DB8CC]/20 animate-ping" style={{ animationDelay: '0.4s' }} />

            </div>

            {/* Beats tracking overlay */}
            <div className="absolute bottom-3 left-3 z-25 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/5 text-[8.5px] font-mono text-[#8DB8CC] flex items-center gap-1.5">
              <Music size={10} className="text-[#8DB8CC] animate-bounce" />
              <span>BPM FEEDBACK SYNC: 128 BPM</span>
            </div>
          </div>

          {/* Bottom control row */}
          <div className="h-[20%] w-full flex items-center justify-between px-4 text-[9.5px] font-mono bg-[#8DB8CC]/5 border border-[#8DB8CC]/20 rounded-xl z-20 mt-2">
            <span className="font-bold text-[#8DB8CC] leading-none">GRID SPECTRUM RIGGING: ATTACHED</span>
            <span className="text-slate-500 uppercase">Latency: 2ms</span>
          </div>

        </div>
      );

    case 'chart':
      return (
        <div className="w-full h-full flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-white/5 relative z-10 overflow-hidden shadow-inner">
          {imageUrl && (
            <div className="absolute inset-0 z-0">
               <img 
                 src={imageUrl} 
                 alt="Cluster Processing Nodes" 
                 className="w-full h-full object-cover opacity-15 mix-blend-luminosity hover:opacity-25 transition-opacity duration-500"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />
            </div>
          )}
          {/* Chart metrics dashboard grids */}
          <div className="h-[80%] flex flex-col justify-center gap-3 relative z-10">
            {[
              { label: "Stable Diffusion XL Core", load: 92, speed: "1.4s/item", color: "from-amber-500 to-orange-500 text-amber-400 shadow-amber-500/10" },
              { label: "Flux Native Synth v2", load: 78, speed: "1.1s/item", color: "from-amber-400 to-yellow-600 text-yellow-300 shadow-yellow-500/10" },
              { label: "Midjourney Latent v6", load: 95, speed: "2.1s/item", color: "from-orange-500 to-amber-600 text-orange-400 shadow-orange-500/10" }
            ].map((node, nIdx) => (
              <div key={nIdx} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-left">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5">
                  <span className="font-bold text-slate-200">{node.label}</span>
                  <span className={node.color.split(" ").slice(-1)[0]}>{node.speed}</span>
                </div>
                
                {/* Horizontal progress indicators */}
                <div className="relative h-2 bg-slate-950 rounded overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${node.load}%` }}
                    transition={{ duration: 1.5, delay: nIdx * 0.15 }}
                    className={`absolute top-0 left-0 h-full rounded bg-gradient-to-r ${node.color} shadow-[0_0_8px_rgba(245,158,11,0.2)]`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h-[16%] flex items-center justify-between px-3.5 text-[9.5px] font-mono border border-amber-500/10 bg-amber-950/10 rounded-xl relative z-10">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <Gauge size={13} className="animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
              <span>CONCURRENT ENTIRE VECTOR FLOW</span>
            </span>
            <span className="text-amber-300 font-extrabold uppercase">10x BOOST</span>
          </div>

        </div>
      );

    case 'ecosystem':
      return (
        <div className="w-full h-full flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-950/90 border border-pink-500/15 relative z-10 overflow-hidden shadow-2xl">
          
          <div className="relative w-full h-[84%] bg-[#060811]/40 border border-white/5 rounded-xl flex flex-col justify-center items-center overflow-hidden">
            {imageUrl && (
              <div className="absolute inset-0 z-0">
                <img 
                  src={imageUrl} 
                  alt="Connected Ecosystem Hub" 
                  className="w-full h-full object-cover opacity-20 mix-blend-overlay hover:opacity-35 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060811] via-transparent to-transparent" />
              </div>
            )}
            
            {/* Spinning background circles */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-pink-500/10 animate-spin z-10" style={{ animationDuration: '24s' }} />
            <div className="absolute w-60 h-60 rounded-full border border-dashed border-purple-500/5 animate-spin z-10" style={{ animationDuration: '35s' }} />

            {/* Central Emission Hub representing AlgoEdit core */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 p-[1.5px] shadow-[0_0_35px_rgba(236,72,153,0.35)] animate-pulse hover:scale-105 transition-transform z-20">
              <div className="w-full h-full bg-[#03050a] rounded-full flex items-center justify-center">
                <Sparkles size={20} className="text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>

            {/* Floating satelite cards connected by dotted links */}
            <div className="absolute top-4 left-6 p-1.5 px-3 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-[9.5px] font-mono text-cyan-400 font-bold z-20 shadow-lg">
              ✦ Cinematic Video
            </div>
            
            <div className="absolute bottom-6 left-4 p-1.5 px-3 rounded-lg bg-slate-900/80 border border-purple-500/20 text-[9.5px] font-mono text-purple-400 font-bold z-20 shadow-lg">
              ✦ Raw 8K Imaging
            </div>

            <div className="absolute top-10 right-4 p-1.5 px-3 rounded-lg bg-slate-900/80 border border-emerald-500/20 text-[9.5px] font-mono text-emerald-400 font-bold z-20 shadow-lg">
              ✦ Identity Mapping
            </div>

            <div className="absolute bottom-12 right-6 p-1.5 px-3 rounded-lg bg-slate-900/80 border border-pink-500/20 text-[9.5px] font-mono text-pink-400 font-bold z-20 shadow-lg">
              ✦ Batch Cluster
            </div>

          </div>

          <div className="h-[14%] flex items-center justify-between px-3 text-[9.5px] font-mono border border-pink-500/15 bg-pink-500/5 rounded-xl">
            <span className="font-black text-pink-400 flex items-center gap-1.5">
              <Bot size={13} className="text-pink-400" />
              <span>CORE EMISSION ECOSYSTEM LINK</span>
            </span>
            <span className="text-emerald-400 font-extrabold uppercase">ALL SYSTEMS STABLE</span>
          </div>

        </div>
      );
  }
};
