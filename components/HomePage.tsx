import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Settings, 
  Plus, 
  ArrowUp, 
  Zap, 
  Layers, 
  Cpu, 
  Maximize, 
  ChevronDown,
  Activity,
  Command,
  Rocket,
  ChevronRight,
  Flame,
  Music,
  Download,
  AlertCircle,
  HelpCircle,
  Users,
  Check,
  CheckCircle2,
  Tv,
  Star,
  ShieldCheck,
  Monitor,
  Smartphone,
  Laptop,
  Chrome
} from 'lucide-react';
import { Page, FeaturePageId, AspectRatio as BaseAspectRatio, User, OnNavigateType } from '../types';
import { featuresData } from '../data/features';
import { FeaturesShowcase } from './FeaturesShowcase';
import Hyperspeed from './Hyperspeed';
import CircularGallery from './CircularGallery';
import RotatingText from './RotatingText';
import AboutUsSection from './AboutUsSection';
import { AlgoEditLogo } from './AlgoEditLogo';

interface SmartVideoProps {
  src: string;
  poster?: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

const SmartVideo: React.FC<SmartVideoProps> = React.memo(({ src, poster, className, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) {
          if (v.paused) {
            v.play().catch(() => {});
          }
        } else {
          if (!v.paused) {
            v.pause();
          }
        }
      },
      { threshold: 0.05, rootMargin: '250px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className={className}
        onError={onError}
      />
    </div>
  );
});
SmartVideo.displayName = 'SmartVideo';

interface MagicSearchBoxProps {
    onNavigate: OnNavigateType;
    user: User | null;
}

const MagicSearchBox: React.FC<MagicSearchBoxProps> = ({ onNavigate, user }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Mode State: 'video' or 'image'
  const [creativeType, setCreativeType] = useState<'video' | 'image'>('video');
  
  // Settings State
  const [videoLength, setVideoLength] = useState<'5s' | '10s'>('5s');
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('480p');
  const [aspectRatio, setAspectRatio] = useState<BaseAspectRatio | '3:4'>('16:9');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setIsSettingsOpen(false);
      }
      if (modeRef.current && !modeRef.current.contains(target)) {
        setIsModeSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = () => {
    if (!inputValue.trim()) {
      alert("Please enter a prompt to begin synthesis.");
      return;
    }
    
    if (creativeType === 'video') {
        onNavigate('video-generator', { 
          prompt: inputValue,
          videoLength,
          resolution,
          aspectRatio,
        });
    } else {
        onNavigate('image-generator', {
            prompt: inputValue,
            aspectRatio: aspectRatio === '3:4' ? '3:4' : aspectRatio as BaseAspectRatio,
        });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 relative">
      
      {/* Mode Selection */}
      <div className="flex justify-center mb-8 relative" ref={modeRef}>
          <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModeSelectorOpen(!isModeSelectorOpen)}
              className={`group flex items-center gap-3 px-6 py-3 bg-black/50 backdrop-blur-xl rounded-full border transition-all duration-500 cursor-pointer ${
                  isModeSelectorOpen 
                  ? 'border-white/40 text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                  : creativeType === 'video' 
                    ? 'border-[#8DB8CC]/45 text-[#8DB8CC] shadow-[0_0_20px_rgba(141,184,204,0.15)]' 
                    : 'border-[#AFC3CF]/45 text-[#AFC3CF] shadow-[0_0_20px_rgba(175,195,207,0.15)]'
              }`}
          >
              <div className={`w-2 h-2 rounded-full animate-pulse ${creativeType === 'video' ? 'bg-[#8DB8CC] shadow-[0_0_10px_rgba(141,184,204,0.8)]' : 'bg-[#E8F0F4] shadow-[0_0_10px_rgba(232,240,244,0.8)]'}`}></div>
              <span className="font-mono text-xs uppercase tracking-widest text-white/90">{creativeType === 'video' ? 'AI Video Engine' : 'AI Image Engine'}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isModeSelectorOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {isModeSelectorOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-4 w-66 bg-[#080a14]/95 border border-white/15 rounded-3xl z-[100] py-3 shadow-[0_25px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden"
                >
                    <p className="px-5 py-2 font-mono text-[9px] tracking-widest text-slate-500 uppercase">Change Engine</p>
                    <button 
                        onClick={() => { setCreativeType('video'); setIsModeSelectorOpen(false); }}
                        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all cursor-pointer ${creativeType === 'video' ? 'bg-[#8DB8CC]/10 text-[#8DB8CC]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                    >
                        <Video className="w-5 h-5 text-[#8DB8CC]" />
                        <span className="font-black text-xs uppercase tracking-widest">AI Video Catalyst</span>
                    </button>
                    <button 
                        onClick={() => { setCreativeType('image'); setIsModeSelectorOpen(false); }}
                        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all cursor-pointer ${creativeType === 'image' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                    >
                        <ImageIcon className="w-5 h-5 text-white" />
                        <span className="font-black text-xs uppercase tracking-widest">AI Image Catalyst</span>
                    </button>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

      {/* Main Console Container */}
      <div className={`shadow-2xl rounded-[28px] overflow-hidden bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/12 transition-all p-1 duration-500 ${isFocused ? 'ring-2 ring-[#8DB8CC]/30 border-white/20' : ''}`}>
        
        {/* Scanning Line Animation */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#8DB8CC]/30 to-transparent absolute animate-scan"></div>
          </div>
        )}

        <div className="relative z-10 flex p-6 gap-6 items-start min-h-[140px] bg-black/40 rounded-[26px]">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-14 h-16 bg-white/5 border border-white/10 border-dashed rounded-2xl flex items-center justify-center text-gray-500 hover:text-[#8DB8CC] hover:border-[#8DB8CC]/50 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <Plus className="w-6 h-6" />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" />
          </motion.button>
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={creativeType === 'video' ? "Describe the cinematic sequence you want to generate..." : "Describe the high-fidelity image you want to generate..."}
            className="flex-grow bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-200 placeholder-gray-600 text-lg md:text-xl resize-none h-full pt-2 font-sans font-light leading-relaxed"
          />
        </div>

        {/* Console Footer */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 mt-1 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <Command className="w-3 h-3 text-gray-500" />
              <span className="font-mono text-[9px] text-slate-400 tracking-wider">Prompt_Cmd</span>
            </div>

            <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-[11px] font-bold rounded-xl border transition-all duration-300 whitespace-nowrap cursor-pointer ${isSettingsOpen ? 'border-[#AFC3CF] text-white' : 'border-[#26313A] text-[#A8B0B7]'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="font-mono tracking-widest text-[10px]">
                {creativeType === 'video' && `${videoLength} | `}
                {resolution} | {aspectRatio}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <Activity className="w-3.5 h-3.5 text-[#8DB8CC] animate-pulse" />
               <span className="font-mono text-[10px] tracking-widest text-slate-400 font-bold">
                 {user ? `${user.tokens.toLocaleString()} TOKENS` : '30 TOKENS'}
               </span>
             </div>
             
             <motion.button 
                whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAction}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  'bg-gradient-to-tr from-white to-[#AFC3CF] text-[#050709]'
                }`}
             >
               <ArrowUp className="w-6 h-6 stroke-[3]" />
             </motion.button>
          </div>
        </div>

        {/* Shimmer Effect on Bottom Border */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Settings Dropdown */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            ref={settingsRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-4 w-full max-w-[380px] bg-[#0A0E12]/98 border border-[#26313A] rounded-[24px] z-[70] p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="space-y-8">
              {creativeType === 'video' && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-slate-500 mb-3">Video Duration</p>
                  <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1 border border-white/5">
                    {(['5s', '10s'] as const).map(len => (
                      <button key={len} onClick={() => setVideoLength(len)} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${videoLength === len ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
                        {len}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="font-mono text-[9px] tracking-widest uppercase text-slate-500 mb-3">Output Resolution</p>
                <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1 border border-white/5">
                  {(['480p', '720p', '1080p'] as const).map(res => (
                    <button key={res} onClick={() => setResolution(res)} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${resolution === res ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
                      {res}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-widest uppercase text-slate-500 mb-3">Aspect Ratio</p>
                <div className="grid grid-cols-5 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  {[{ label: '16:9', icon: <Maximize className="w-4 h-4 rotate-90" /> }, { label: '9:16', icon: <Maximize className="w-4 h-4" /> }, { label: '4:3', icon: <Maximize className="w-4 h-4 scale-x-125" /> }, { label: '3:4', icon: <Maximize className="w-4 h-4 scale-y-125" /> }, { label: '1:1', icon: <Maximize className="w-4 h-4" /> }].map(item => (
                    <button key={item.label} onClick={() => setAspectRatio(item.label as any)} className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all cursor-pointer ${aspectRatio === item.label ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
                      <div className="mb-2 opacity-60">{item.icon}</div>
                      <span className="font-mono text-[9px] font-black">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- QUICK-FEATURE CHIPS SLIDER (Screenshot 2 style) ---
const QuickCategorySlider: React.FC<{ onNavigate: OnNavigateType }> = ({ onNavigate }) => {
  const categories = [
    { label: 'Text/Image/Chat to Image', id: 'image-generator', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <ImageIcon size={18} className="text-[#E8F0F4]" /> },
    { label: '100+ AI Image & Video Tools', id: 'features-overview', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Sparkles size={18} className="text-white" /> },
    { label: '300+ Pro & Fun AI Effects', id: 'auto-shorts-maker', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Flame size={18} className="text-[#AFC3CF]" /> },
    { label: 'Talking Photo', id: 'talking-avatar', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Cpu size={18} className="text-[#8DB8CC]" /> },
    { label: 'AI Shorts', id: 'auto-shorts-maker', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Zap size={18} className="text-[#E8F0F4]" /> },
    { label: 'Text/Image/Video to Video', id: 'video-generator', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Video size={18} className="text-[#AFC3CF]" /> },
    { label: 'Consistent Character', id: 'talking-avatar', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Users size={18} className="text-[#8DB8CC]" /> },
    { label: 'AI Animation', id: 'video-generator', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Music size={18} className="text-[#E8F0F4]" /> },
    { label: 'AI Avatar', id: 'talking-avatar', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50', icon: <Sparkles size={18} className="text-[#AFC3CF]" /> },
  ];

  const algorithms = [
    { name: 'SwinIR 4x Upscaler', desc: 'Deep restoration of low-res media frames', metric: '4K SuperRes', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Maximize size={18} className="text-white" /> },
    { name: 'GFPGAN v1.4 Face Restore', desc: 'Blind face enhancement & details repair', metric: 'Face Mesh', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Cpu size={18} className="text-[#AFC3CF]" /> },
    { name: 'SAM (Segment Anything)', desc: 'Zero-shot high-contrast vector masking', metric: 'Mask AI', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Sparkles size={18} className="text-[#8DB8CC]" /> },
    { name: 'ControlNet Tile', desc: 'Structural spatial guidance & textures', metric: 'Structure', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Layers size={18} className="text-[#E8F0F4]" /> },
    { name: 'FLUX.1 Inpainting Engine', desc: 'Context-aware background erase & fill', metric: 'Inpaint Core', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Flame size={18} className="text-[#AFC3CF]" /> },
    { name: 'Stable Video Diffusion', desc: 'Consistent image-to-video scene flows', metric: 'SVD Catalyst', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Video size={18} className="text-white" /> },
    { name: 'Real-ESRGAN v3', desc: 'Rapid anti-aliasing & photo denoise', metric: 'Clean Render', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Zap size={18} className="text-[#8DB8CC]" /> },
    { name: 'SadTalker Lip-Sync AI', desc: 'Audio-driven face landmarks driving', metric: 'Lip-Sync', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Users size={18} className="text-[#AFC3CF]" /> },
    { name: 'YOLOv8 Instance Segmenter', desc: 'Precise real-time rotoscoping limits', metric: 'Mask Track', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Activity size={18} className="text-[#E8F0F4]" /> },
    { name: 'AnimateDiff Motion Core', desc: 'Stable latent frame interpolation pathways', metric: 'Latent-X', color: 'from-[#10161B] to-[#0A0E12] hover:border-[#AFC3CF]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]', icon: <Music size={18} className="text-[#8DB8CC]" /> }
  ];

  return (
    <div className="w-full overflow-hidden py-14 border-y border-white/5 bg-[#050709] border-y border-[#26313A] relative">
      
      {/* Title & Separator */}
      <div className="max-w-[1550px] mx-auto px-6 mb-6 flex justify-between items-center">
        <span className="font-mono text-[9px] tracking-[0.3em] text-[#AFC3CF] uppercase font-black">Interactive Neural Pipelines</span>
        <span className="h-[1px] flex-grow mx-8 bg-gradient-to-r from-[#26313A] to-transparent" />
      </div>

      {/* Row 1: Leftward moving categories */}
      <div className="w-full overflow-hidden relative marquee-row group border-b border-white/[0.03] pb-6 mb-6">
        <div className="flex w-max animate-marquee-left whitespace-nowrap">
          {/* List Copy 1 */}
          <div className="flex gap-4 pr-4 shrink-0">
            {categories.map((cat, idx) => (
              <motion.div
                key={`row1-a-${idx}`}
                whileHover={{ y: -3, scale: 1.02 }}
                onClick={() => onNavigate(cat.id as FeaturePageId)}
                className={`flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br ${cat.color} border border-white/10 transition-all duration-300 cursor-pointer shadow-lg`}
              >
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-sm font-black tracking-wide text-white pr-2">
                  {cat.label}
                </span>
              </motion.div>
            ))}
          </div>
          {/* List Copy 2 (Duplicate for seamless loop) */}
          <div className="flex gap-4 pr-4 shrink-0">
            {categories.map((cat, idx) => (
              <motion.div
                key={`row1-b-${idx}`}
                whileHover={{ y: -3, scale: 1.02 }}
                onClick={() => onNavigate(cat.id as FeaturePageId)}
                className={`flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br ${cat.color} border border-white/10 transition-all duration-300 cursor-pointer shadow-lg`}
              >
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-sm font-black tracking-wide text-white pr-2">
                  {cat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Rightward moving algorithms */}
      <div className="w-full overflow-hidden relative marquee-row group">
        <div className="flex w-max animate-marquee-right whitespace-nowrap">
          {/* List Copy 1 */}
          <div className="flex gap-4 pr-4 shrink-0">
            {algorithms.map((algo, idx) => (
              <motion.div
                key={`row2-a-${idx}`}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => onNavigate('features-overview')}
                className={`flex-shrink-0 flex items-center gap-4 px-6 py-4.5 rounded-2xl bg-gradient-to-br ${algo.color} border border-white/10 transition-all duration-300 cursor-pointer shadow-lg`}
              >
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  {algo.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-black tracking-wide text-white">
                    {algo.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[240px] truncate">
                    {algo.desc}
                  </span>
                </div>
                <div className="ml-2 px-2.5 py-1 rounded bg-[#03050c]/80 border border-white/5 shadow-inner">
                  <span className="font-mono text-[9px] text-[#AFC3CF] font-extrabold tracking-wider">{algo.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>
          {/* List Copy 2 (Duplicate for seamless loop) */}
          <div className="flex gap-4 pr-4 shrink-0">
            {algorithms.map((algo, idx) => (
              <motion.div
                key={`row2-b-${idx}`}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => onNavigate('features-overview')}
                className={`flex-shrink-0 flex items-center gap-4 px-6 py-4.5 rounded-2xl bg-gradient-to-br ${algo.color} border border-white/10 transition-all duration-300 cursor-pointer shadow-lg`}
              >
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  {algo.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-black tracking-wide text-white">
                    {algo.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[240px] truncate">
                    {algo.desc}
                  </span>
                </div>
                <div className="ml-2 px-2.5 py-1 rounded bg-[#03050c]/80 border border-white/5 shadow-inner">
                  <span className="font-mono text-[9px] text-[#AFC3CF] font-extrabold tracking-wider">{algo.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

// --- MODEL MATRIX CLUSTER (Screenshot 3 & 5 style) ---
const TopFeaturesGrid: React.FC<{onNavigate: OnNavigateType}> = ({ onNavigate }) => {
  const videoModels = [
    { name: "AlgoEdit 2.5", isPro: false }, { name: "Seedance 2.0", isPro: false }, { name: "Veo 3", isPro: true }, 
    { name: "Sora 2", isPro: true }, { name: "Kling AI", isPro: false }, { name: "Hailuo AI", isPro: false }, 
    { name: "PixVerse AI", isPro: false }, { name: "Runway", isPro: true }, { name: "Vidu AI", isPro: false }, 
    { name: "Luma AI", isPro: false }, { name: "Pika AI", isPro: false }, { name: "Wan AI", isPro: false },
    { name: "Hunyuan", isPro: false }
  ];

  const imageModels = [
    { name: "GPT Image 2", isPro: true }, { name: "Nano Banana 2", isPro: true }, { name: "Recraft", isPro: false }, 
    { name: "Ideogram", isPro: false }, { name: "Stable Diffusion", isPro: false }, { name: "Flux AI", isPro: true }, 
    { name: "Seedream", isPro: false }, { name: "Dall-E", isPro: false }, { name: "Imagen", isPro: true }, 
    { name: "GPT-4o", isPro: false }, { name: "Flux Kontext", isPro: false }, { name: "Qwen Image", isPro: false },
    { name: "Wan AI", isPro: false }
  ];

  return (
    <section className="py-24 px-6 relative w-full bg-gradient-to-b from-[#050709] to-[#0A0E12]">
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-[1450px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white italic tracking-tight leading-tight uppercase">
            Deploy High-Fidelity Neural Generation<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] inline-block pr-3">
              Suites Right Now
            </span>
          </h2>
          <p className="text-slate-400 text-xs max-w-xl mx-auto mt-4 font-mono uppercase tracking-wider">The industry's most advanced audiovisual generation engines, unified in a single canvas.</p>
        </div>

        {/* Dynamic Image card previews side-by-side (Screenshot 3 style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { tag: "80% OFF", tagColor: "bg-[#26313A] border border-white/20 text-white", title: "AURA FLASH V2", desc: "Accelerated generation cycles preserving character attributes", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" },
            { tag: "NEW", tagColor: "bg-[#26313A] border border-white/20 text-white", title: "ECHO FLOW OMNI", desc: "Gain detailed structural control with coherent depth and framing", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop" },
            { tag: "50% OFF", tagColor: "bg-[#26313A] border border-white/20 text-white", title: "CHRONOS PREVIEW", desc: "Synthesize multi-modal audio and video sequences in a single cycle", img: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=600&auto=format&fit=crop" }
          ].map((card, cIndex) => (
            <motion.div
              key={cIndex}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative rounded-3xl overflow-hidden border border-[#26313A] bg-[#10161B] shadow-[0_15px_30px_rgba(0,0,0,0.6)] group"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className={`absolute top-4 left-4 text-[9px] font-black text-white px-2.5 py-1.5 rounded-lg ${card.tagColor} shadow-lg tracking-widest`}>
                  {card.tag}
                </span>
                
                {/* Visual Label */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight">{card.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Model lists with buttons (Screenshot 5 style) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          {/* Video cluster */}
          <div className="bg-[#10161B] rounded-3xl border border-[#26313A] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0A0E12] border border-[#26313A] flex items-center justify-center text-[#E8F0F4]">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase text-white leading-none">AI Video Generators</h3>
                <p className="text-xs text-slate-500 mt-1">Deploy flagship 3.0 video pipelines directly</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Access the industry's frontrunning video engines. Direct camera tracking, depth maps, resolution scaling, and keyframing from a unified interface.
            </p>

            <button 
              onClick={() => onNavigate('video-generator')}
              className="btn-primary !px-6 !py-3 font-mono text-[10px] tracking-widest mb-10 w-full"
            >
              LAUNCH VIDEO WORKSTATION
            </button>

            {/* Models listed */}
            <div className="flex flex-wrap gap-2.5">
              {videoModels.map((model, mIdx) => (
                <div 
                  key={mIdx}
                  onClick={() => onNavigate('video-generator')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/8 text-[11px] font-mono font-bold text-slate-300 hover:border-[#AFC3CF] hover:text-white transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{model.name}</span>
                  {model.isPro && (
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse shadow-[0_0_5px_#fff]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image cluster */}
          <div className="bg-[#10161B] rounded-3xl border border-[#26313A] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0A0E12] border border-[#26313A] flex items-center justify-center text-[#E8F0F4]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase text-white leading-none">AI Image Generators</h3>
                <p className="text-xs text-slate-500 mt-1">Forge photorealistic layouts at high resolutions</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Experience next-generation conceptual density. Our image pipelines excel at complex shadow tracing, textural consistency, and textual rendering accuracy.
            </p>

            <button 
              onClick={() => onNavigate('image-generator')}
              className="btn-secondary !px-6 !py-3 font-mono text-[10px] tracking-widest mb-10 w-full"
            >
              LAUNCH IMAGING WORKSTATION
            </button>

            {/* Models listed */}
            <div className="flex flex-wrap gap-2.5">
              {imageModels.map((model, mIdx) => (
                <div 
                  key={mIdx}
                  onClick={() => onNavigate('image-generator')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/8 text-[11px] font-mono font-bold text-slate-300 hover:border-[#AFC3CF] hover:text-white transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{model.name}</span>
                  {model.isPro && (
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse shadow-[0_0_5px_#fff]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// --- VIRAL VIDEOS & PHOTO EFFECTS GRAPHIC (Screenshot 6 style) ---
const ViralEffectsSection: React.FC<{onNavigate: OnNavigateType}> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'photo'>('video');

  const videoEffects = [
    { title: "AI Meteor Strike", count: "185.3K", label: "Epic", img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=450&auto=format&fit=crop", video: "/videos/AI-Meteor-strike-Earth.mp4" },
    { title: "AI Blackhole", count: "142.1K", label: "Cosmic", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=450&auto=format&fit=crop", video: "/videos/AI-BLACKHOLE.mp4" },
    { title: "AI Tornado", count: "98.5K", label: "Force", img: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?q=80&w=450&auto=format&fit=crop", video: "/videos/AI-TORNADO.mp4" },
    { title: "AI Lightning Strike", count: "76.4K", label: "Electro", img: "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?q=80&w=450&auto=format&fit=crop", video: "/videos/AI-LIGHTNING-STRIKE.mp4" },
    { title: "AI Tsunami", count: "115.9K", label: "Oceanic", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=450&auto=format&fit=crop", video: "/videos/AI-TSUNAMI-VIDEO.mp4" },
    { title: "AI Snow Volcano Eruption", count: "63.2K", label: "Eruption", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=450&auto=format&fit=crop", video: "/videos/AI-SNOWVALCANO-ERUPTION.mp4" }
  ];

  const photoEffects = [
    { title: "AI Vintage Photo", count: "98.1K", label: "Retro", img: "/videos/AI-VINTAGEPHOTO.png" },
    { title: "AI Gothic Oil Photo", count: "82.4K", label: "Gothic", img: "/videos/AI-GOTHICOILPHOTO.png" },
    { title: "AI Pencil Drawing", count: "33.2K", label: "Artistic", img: "/videos/AI-PENCILCARTOON.jpg" },
    { title: "AI Medieval Kingdom", count: "45.8K", label: "Classic", img: "/videos/AI-Medieval-Kingdom.jpg" },
    { title: "AI Forest Crystal Forest", count: "62.1K", label: "Nature", img: "/videos/AI-Forest-Crystal-Forest.jpg" },
    { title: "AI Floating Castles", count: "87.3K", label: "Fantasy", img: "/videos/AI-FLOATINGCASTLES.jpg" }
  ];

  const activeData = activeTab === 'video' ? videoEffects : photoEffects;

  return (
    <section className="py-24 px-6 bg-[#050709]">
      <div className="max-w-[1450px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-3xl sm:text-4xl font-black italic tracking-tight leading-none text-white uppercase select-none">
            300+
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight uppercase mt-2">
            Infinite Stylized Generative Presets
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mt-4 text-xs font-light leading-relaxed">
            Map stylized graphics, skeletal movement lattices, or classic hand-drawn art filters directly onto your static captures. Deploy high-fidelity textures custom-tailored to boost reach and digital interaction.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-[#0A0E12] border border-[#26313A] p-1.5 rounded-full">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'video' ? 'bg-[#E8F0F4] text-[#050709] shadow-lg' : 'text-[#A8B0B7] hover:text-white'
              }`}
            >
              Video Effects
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'photo' ? 'bg-[#E8F0F4] text-[#050709] shadow-lg' : 'text-[#A8B0B7] hover:text-white'
              }`}
            >
              Photo Effects
            </button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeData.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => onNavigate('auto-shorts-maker')}
              className="group bg-[#10161B] rounded-2xl overflow-hidden border border-[#26313A] shadow-md aspect-[4/5] w-full cursor-pointer relative"
            >
              {'video' in item && (item as any).video ? (
                <SmartVideo
                  src={(item as any).video}
                  poster={item.img}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              
              {/* Overlay details */}
              <div className="absolute top-4 left-4 bg-[#26313A] border border-white/10 rounded px-2.5 py-1 text-[10px] font-black text-[#F5F7F8] uppercase tracking-widest shadow z-10">
                {item.label}
              </div>
              
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded px-2.5 py-1 text-[10px] font-mono text-[#AFC3CF] shrink-0 z-10">
                🔥 {item.count}
              </div>

              {/* Text overlay on top of the media */}
              <div className="absolute bottom-5 left-5 right-5 z-10">
                <h4 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide truncate drop-shadow">{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

// --- CUTTING EDGE ENHANCEMENT TOOLS (Screenshot 7 style) ---
const CuttingEdgeTools: React.FC<{onNavigate: OnNavigateType}> = ({ onNavigate }) => {
  const [currentTab, setCurrentTab] = useState<'video' | 'image'>('video');

  const tools = {
    video: [
      { name: "AI Background Remover", page: "video-background-removal", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-BACKGROUNDREMOVER-NEW.mp4" },
      { name: "AI Old Picture Restoration", page: "image-restore", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-RESTORE-OLDIMAGE.mp4" },
      { name: "AI Black & White Restoration", page: "image-restore", img: "https://images.unsplash.com/photo-1452421820245-172c91a37530?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-Black-White-Restoration.mp4" },
      { name: "AI Neon Effects", page: "neon-filter", img: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-NEONEFFECT.mp4" },
      { name: "AI VHS Effect", page: "retro-vhs", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-VHS-EFFECT.mp4" },
      { name: "AI Cyberpunk Color", page: "video-color-grade", img: "https://images.unsplash.com/photo-1515260268569-9271009adfdb?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-Cyberpunk-Color.mp4" },
      { name: "AI Face Swap", page: "talking-avatar", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-FACESWAPING.mp4" },
      { name: "AI Green Screen Generator", page: "video-background-removal", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop", video: "/videos/AI-GREENSCREEN-GENERATOR.mp4" }
    ],
    image: [
      { name: "AI Low Poly 3D", page: "style-transfer", img: "/videos/AI-LOW-POLY3D.jpg" },
      { name: "AI Floating Images", page: "style-transfer", img: "/videos/AI-FLOATING-STONE.jpg" },
      { name: "AI Melting Sky", page: "style-transfer", img: "/videos/AI-MELTINGSKY.jpg" },
      { name: "AI Crimson Eclipse", page: "style-transfer", img: "/videos/AI-CRIMPSON-ECLIPSE.jpg" },
      { name: "AI Frozen Blue", page: "style-transfer", img: "/videos/AI-FROZENBLUE.jpg" },
      { name: "AI Sketch to Painting", page: "style-transfer", img: "/videos/AI-PENCILTOSKETCH2.png" },
      { name: "AI Volume God Rays", page: "style-transfer", img: "/videos/AI-Volumetric-god-rays.jpg" },
      { name: "AI Underworld Kingdom", page: "style-transfer", img: "/videos/AI-UNDERWATERKINGDOM.png" },
      { name: "AI Crystal Skyscrapers", page: "style-transfer", img: "/videos/AI-CRYSTALSKYSCRAPER.png" },
      { name: "AI Post Apocalyptic Earth", page: "style-transfer", img: "/videos/AI-POST-APOCALYPTIC-EARTH.jpg" },
      { name: "AI Gravity Reversed", page: "style-transfer", img: "/videos/AI-Gravity-reversed.png" },
      { name: "AI Blossom Rain", page: "style-transfer", img: "/videos/AI-BLOSSOMRAIN.jpg" }
    ]
  };

  const activeTools = currentTab === 'video' ? tools.video : tools.image;

  return (
    <section className="py-24 px-6 bg-[#0A0E12]">
      <div className="max-w-[1450px] mx-auto text-center">
         <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black italic text-white uppercase tracking-tight leading-tight">
           Robust Production Utilities to Elevate Your<br/>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] inline-block pr-3">
             Generative Media Outputs
           </span>
         </h2>
         <p className="text-slate-400 max-w-xl mx-auto mt-4 text-xs leading-relaxed font-light">
           Harness elite post-processing utilities. Meticulously upscale, extend viewport boundaries, isolate high-fidelity textures, or convert styles cleanly to streamline your professional asset pipelines.
         </p>

         {/* Selector */}
         <div className="flex justify-center mt-10 mb-14">
           <div className="flex bg-[#0b0c16] border border-white/8 rounded-full p-1.5">
             <button
               onClick={() => setCurrentTab('video')}
               className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                 currentTab === 'video' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
               }`}
             >
               <Video size={14} /> Video Tools
             </button>
             <button
               onClick={() => setCurrentTab('image')}
               className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                 currentTab === 'image' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
               }`}
             >
               <ImageIcon size={14} /> Image Tools
             </button>
           </div>
         </div>

         {/* Tool elements layout */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {activeTools.map((tool, index) => (
             <motion.div
               key={index}
               whileHover={{ y: -6, borderColor: 'rgba(6, 182, 212, 0.4)' }}
               onClick={() => onNavigate(tool.page as any)}
               className="group bg-[#10161B] border border-[#26313A] rounded-2xl overflow-hidden h-[300px] cursor-pointer relative shadow-lg"
             >
               {/* Media element covering the entire card */}
               <div className="absolute inset-0 w-full h-full overflow-hidden">
                 {'video' in tool && (tool as any).video ? (
                   <SmartVideo
                     src={(tool as any).video}
                     poster={tool.img}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                   />
                 ) : (
                   <img 
                     src={tool.img} 
                     alt={tool.name} 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                   />
                 )}
               </div>

               {/* Dark gradient and solid overlay on hover */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent opacity-95 transition-opacity z-10" />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors z-10" />

               {/* Badge Overlay indicating type of tool */}
               <div className="absolute top-4 left-4 z-20">
                 <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-[#AFC3CF] uppercase tracking-widest">
                   {'video' in tool && (tool as any).video ? "Video Tool" : "Image Tool"}
                 </span>
               </div>

               {/* Use This Tool Button overlay */}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                 <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] font-bold text-[#050709] text-[9px] tracking-widest text-white shadow-xl uppercase animate-pulse">
                   Use This Tool
                 </span>
               </div>

               {/* Overlaid Bottom Content */}
               <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                 <div className="pr-2 text-left">
                   <span className="font-mono text-[8px] tracking-widest text-[#AFC3CF] uppercase">AI Processor</span>
                   <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wider mt-0.5 leading-tight">{tool.name}</p>
                 </div>
                 <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#8DB8CC]/20 group-hover:border-[#8DB8CC]/30 transition-all">
                   <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#8DB8CC] group-hover:translate-x-0.5 transition-all" />
                 </div>
               </div>
             </motion.div>
           ))}
         </div>

         <div className="mt-14">
           <button 
            onClick={() => onNavigate('features-overview')}
            className="text-[#AFC3CF] hover:text-white flex items-center gap-2 mx-auto text-xs font-mono tracking-widest uppercase transition-colors"
           >
             View More Video Tools <ChevronRight size={14} />
           </button>
         </div>

      </div>
    </section>
  );
};

// --- USER CREATIONS GRID (Screenshot 8 & 9 style) ---
const UserCreationsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Videos');

  const filters = ["Videos", "AI Effects", "Avatars", "Images", "LoRAs"];

  const items = [
    // Videos Category (Contains only the user's uploaded videos)
    {
      img: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-TIMELAPSE.mp4",
      desc: "AI Timelapse Creation",
      badge: "Timelapse Gen",
      categories: ["Videos"]
    },
    {
      img: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-SLOWMO.mp4",
      desc: "AI Slow Motion Effect",
      badge: "SlowMo Gen",
      categories: ["Videos"]
    },
    {
      img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-ANIME.mp4",
      desc: "AI Anime Generation",
      badge: "Anime Gen",
      categories: ["Videos"]
    },
    {
      img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-UPSCALING.mp4",
      desc: "AI Cinematic Upscaling",
      badge: "Polo Ultra",
      categories: ["Videos"]
    },
    {
      img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&auto=format&fit=crop",
      video: "/videos/MOTIONGRAPHICS.mp4",
      desc: "AI Motion Graphics",
      badge: "Motion FX",
      categories: ["Videos"]
    },
    {
      img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-CINEMATIC.mp4",
      desc: "AI Cinematic Masterpiece",
      badge: "Cinematic Gen",
      categories: ["Videos"]
    },
    // AI Effects Category (Using the user's uploaded local video)
    {
      img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-Day-to-Night Oasis.mp4",
      desc: "AI Day-to-Night Oasis",
      badge: "Oasis Gen",
      categories: ["AI Effects"]
    },
    {
      img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-Drone-Fantasy-Landscape.mp4",
      desc: "AI Drone Fantasy Landscape",
      badge: "Drone Gen",
      categories: ["AI Effects"]
    },
    {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-Cinematic-Sunset.mp4",
      desc: "AI Cinematic Sunset",
      badge: "Sunset Gen",
      categories: ["AI Effects"]
    },
    {
      img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop",
      video: "/videos/Next-Gen VFX.mp4",
      desc: "Next-Gen VFX",
      badge: "VFX Gen",
      categories: ["AI Effects"]
    },
    {
      img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-text-to-image.mp4",
      desc: "AI Text to Image Generation",
      badge: "Text to Image",
      categories: ["AI Effects"]
    },
    {
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI Animation.mp4",
      desc: "AI Animation",
      badge: "AI Effects",
      categories: ["AI Effects"]
    },
    {
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI.mp4",
      desc: "Neural Motion Synthesis",
      badge: "AI Effects",
      categories: ["AI Effects"]
    },
    {
      img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-CARTOON.mp4",
      desc: "AI Cartoon Generation",
      badge: "AI Effects",
      categories: ["AI Effects"]
    },

    // Avatars Category
    {
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-AVATAR4.mp4",
      desc: "Cheering Yellow Dino Monster",
      badge: "Dino Gen",
      categories: ["Avatars"]
    },
    {
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-AVATAR5.mp4",
      desc: "Streetwear Puppy Hoodie",
      badge: "Urban Pet",
      categories: ["Avatars"]
    },
    {
      img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-AVATAR6.mp4",
      desc: "Cozy Hamster in Nest",
      badge: "Cute Pet",
      categories: ["Avatars"]
    },
    {
      img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-AVATAR7.mp4",
      desc: "3D Master Chef Character",
      badge: "Chef Avatar",
      categories: ["Avatars"]
    },
    {
      img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI_AVATAR8.mp4",
      desc: "Roaring Husky Cub & Milk",
      badge: "Wild Mascot",
      categories: ["Avatars"]
    },
    {
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-AVATAR3.mp4",
      desc: "Young Adventurer Boy",
      badge: "3D Character",
      categories: ["Avatars"]
    },
    {
      img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AVATAR1.mp4",
      desc: "Jovial Santa Claus",
      badge: "Holiday Avatar",
      categories: ["Avatars"]
    },
    {
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      video: "/videos/AI-AVATAR2.mp4",
      desc: "Forest Wizard Gnome",
      badge: "Fantasy Avatar",
      categories: ["Avatars"]
    },

    // Images Category
    {
      img: "/videos/AI-FUTURISTICGREENTOWN.png",
      desc: "AI Futuristic Green Town",
      badge: "Eco-City Gen",
      categories: ["Images"]
    },
    {
      img: "/videos/AI-FUTURISTICCARINMARS.jpg",
      desc: "AI Futuristic Car in Mars",
      badge: "Mars Rover Gen",
      categories: ["Images"]
    },
    {
      img: "/videos/AI-Celestial-Nature-Artwork.jpg",
      desc: "AI Celestial Nature Artwork",
      badge: "Cosmic Art",
      categories: ["Images"]
    },
    {
      img: "/videos/AI-IMAGE.jpg",
      desc: "AI Cinematic Fantasy Portrait",
      badge: "AI Art",
      categories: ["Images"]
    },
    {
      img: "/videos/AI-IMAGE.png",
      desc: "AI Cinematic Portrait",
      badge: "AI Masterpiece",
      categories: ["Images"]
    },
    {
      img: "/videos/AI-VOLCANO.jpg",
      desc: "AI Volcano Eruption",
      badge: "AI Image",
      categories: ["Images"]
    },
    // LoRAs Category
    {
      img: "/videos/Anime-Character-Generator.jpg",
      desc: "Anime Character Generator",
      badge: "Anime Lora",
      categories: ["LoRAs"]
    },
    {
      img: "/videos/Pixar-Inspired-Portrait.jpg",
      desc: "Pixar-Inspired Portrait",
      badge: "3D Portrait Lora",
      categories: ["LoRAs"]
    },
    {
      img: "/videos/Claymation-Effect.jpg",
      desc: "Claymation Effect",
      badge: "Claymation Lora",
      categories: ["LoRAs"]
    },
    {
      img: "/videos/AI-Ghibli-Transformation.jpg",
      desc: "AI Ghibli Transformation",
      badge: "Ghibli Lora",
      categories: ["LoRAs"]
    },
    {
      img: "/videos/AI-Marvel-Style.jpg",
      desc: "AI Marvel Style",
      badge: "Comic Lora",
      categories: ["LoRAs"]
    },
    {
      img: "/videos/AI-Samurai-Style.jpg",
      desc: "AI Samurai Style",
      badge: "Samurai Lora",
      categories: ["LoRAs"]
    },
    {
      img: "/videos/AI-Space-Explorer.png",
      desc: "AI Space Explorer",
      badge: "Sci-Fi Lora",
      categories: ["LoRAs"]
    },
    {
      img: "/videos/AI-Oil-Painting.jpg",
      desc: "AI Oil Painting",
      badge: "Oil Art Lora",
      categories: ["LoRAs"]
    }
  ];

  const filteredItems = items
    .filter(it => it.categories.includes(activeFilter))
    .sort((a, b) => {
      const aHasVideo = !!a.video;
      const bHasVideo = !!b.video;
      if (aHasVideo && !bHasVideo) return -1;
      if (!aHasVideo && bHasVideo) return 1;
      return 0;
    });

  return (
    <section className="py-24 px-6 bg-[#050709]">
      <div className="max-w-[1450px] mx-auto text-center">
         <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black italic text-white uppercase tracking-tight mb-4">
           Explore User Creations
         </h2>

         {/* Filters level 1 */}
         <div className="flex flex-wrap justify-center gap-3 mb-12">
           <div className="flex bg-[#0b0c16] rounded-full p-1 border border-white/5">
             {filters.map((f) => (
               <button
                 key={f}
                 onClick={() => setActiveFilter(f)}
                 className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                   activeFilter === f ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
                 }`}
               >
                 {f}
               </button>
             ))}
           </div>
         </div>

  {/* Dynamic Layout & Aspect Ratios based on category type */}
         {filteredItems.length > 0 ? (
           <div className={activeFilter === 'AI Effects' || activeFilter === 'Avatars' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto'}>
             {filteredItems.map((it, idx) => (
               <motion.div
                 key={idx}
                 whileHover={{ scale: 1.02, y: -4 }}
                 className={activeFilter === 'AI Effects' || activeFilter === 'Avatars' ? 'relative rounded-2xl overflow-hidden border border-white/10 group aspect-[9/16] w-full bg-[#10161B] shadow-lg' : 'relative rounded-2xl overflow-hidden border border-white/10 group aspect-[16/9] w-full bg-[#10161B] shadow-lg'}
               >
                 {it.video ? (
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                      <SmartVideo 
                        src={it.video} 
                        poster={it.img}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-10"
                        onError={(e) => {
                          const videoEl = e.currentTarget as HTMLVideoElement;
                          const currentSrc = videoEl.getAttribute('src') || '';
                          
                          if (currentSrc.includes('pixabay.com')) {
                            videoEl.src = "/videos/skyline.mp4";
                          } else if (videoEl.src !== "https://www.w3schools.com/html/movie.mp4") {
                            videoEl.src = "https://www.w3schools.com/html/movie.mp4";
                          } else {
                            videoEl.style.display = "none";
                          }
                        }}
                      />
                    </div>
                  ) : (
                   <img 
                     src={it.img} 
                     alt={it.desc} 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                     referrerPolicy="no-referrer"
                     onError={(e) => {
                       const imgEl = e.currentTarget as HTMLImageElement;
                       const currentSrc = imgEl.getAttribute('src') || '';
                       const decodedSrc = decodeURIComponent(currentSrc).toLowerCase();
                       if (decodedSrc.includes("ai volcano") || decodedSrc.includes("volcano")) {
                         const paths = [
                           "/AI VOLCANO.png",
                           "/AI VOLCANO.jpg",
                           "/AI VOLCANO.jpeg",
                           "/AI_VOLCANO.png",
                           "/AI_VOLCANO.jpg",
                           "/AI_VOLCANO.jpeg",
                           "/AI-VOLCANO.png",
                           "/AI-VOLCANO.jpg",
                           "/AI-VOLCANO.jpeg",
                           "/public/AI VOLCANO.png",
                           "/public/AI VOLCANO.jpg",
                           "/public/AI VOLCANO.jpeg",
                           "https://images.unsplash.com/photo-1541944743827-e04aa6427c33?q=80&w=800&auto=format&fit=crop"
                         ];
                         const normalizedCurrent = decodedSrc.replace(/^\/public/, "");
                         const currentIndex = paths.findIndex(p => {
                           const normalizedPath = decodeURIComponent(p).toLowerCase();
                           return normalizedPath === decodedSrc || normalizedPath.replace(/^\/public/, "") === normalizedCurrent;
                         });
                         if (currentIndex !== -1 && currentIndex < paths.length - 1) {
                           imgEl.src = paths[currentIndex + 1];
                         } else {
                           imgEl.src = "https://images.unsplash.com/photo-1541944743827-e04aa6427c33?q=80&w=800&auto=format&fit=crop";
                         }
                         return;
                       }
                       if (currentSrc === "/AI VOLCANO.png") {
                         imgEl.src = "/AI VOLCANO.jpg";
                       } else if (currentSrc === "/AI VOLCANO.jpg") {
                         imgEl.src = "/AI VOLCANO.jpeg";
                       } else if (currentSrc === "/AI VOLCANO.jpeg") {
                         imgEl.src = "/public/AI VOLCANO.png";
                       } else if (currentSrc === "/public/AI VOLCANO.png") {
                         imgEl.src = "/public/AI VOLCANO.jpg";
                       } else if (currentSrc === "/public/AI VOLCANO.jpg") {
                         imgEl.src = "/public/AI VOLCANO.jpeg";
                       } else if (currentSrc.includes("AI VOLCANO") || currentSrc.includes("volcano")) {
                         // Fallback to high-quality Unsplash image of a majestic active volcano
                         imgEl.src = "https://images.unsplash.com/photo-1541944743827-e04aa6427c33?q=80&w=800&auto=format&fit=crop";
                       }
                     }}
                   />
                 )}
                 {it.video && (
                   <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-[#8DB8CC] uppercase tracking-wider flex items-center gap-1 z-10">
                     <Video className="w-3 h-3 text-[#8DB8CC] animate-pulse" />
                     Live
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                 <div className="absolute bottom-4 left-4 right-4 text-left z-20">
                   <span className="font-mono text-[9px] tracking-widest text-[#AFC3CF] uppercase">{it.badge}</span>
                   <p className="text-sm font-bold text-white uppercase mt-0.5">{it.desc}</p>
                 </div>
               </motion.div>
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-white/5 bg-[#080a13] p-8 text-center max-w-4xl mx-auto">
             <span className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-2">No creations found</span>
             <p className="text-xs text-slate-500 max-w-sm">Try selecting another category to see our full showcase.</p>
           </div>
         )}

      </div>
    </section>
  );
};


// Payment brand representation components styled to match ALGOEDIT monochrome & silver aesthetic
const VisaLogo: React.FC = () => (
  <span className="flex items-center gap-1.5 font-sans italic font-extrabold tracking-tight text-white select-none">
    <div className="flex items-center bg-[#10161B] border border-[#26313A] py-[3px] px-2 rounded-md select-none leading-none shadow-sm">
      <span className="text-[#F5F7F8] text-[8px] uppercase font-black tracking-tighter italic font-sans">VISA</span>
    </div>
  </span>
);

const MastercardLogo: React.FC = () => (
  <div className="flex items-center gap-1.5 bg-[#10161B] border border-[#26313A] py-[3px] px-2 rounded-md shadow-sm">
    <div className="relative w-4 h-3 flex items-center select-none">
      <div className="w-2.5 h-2.5 rounded-full bg-white/90 absolute left-0" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#AFC3CF]/80 absolute right-0" />
    </div>
    <span className="text-[7px] font-bold text-[#A8B0B7] tracking-tight lowercase hidden sm:inline">mastercard</span>
  </div>
);

const RuPayLogo: React.FC = () => (
  <div className="flex items-center gap-1 bg-[#10161B] border border-[#26313A] py-[3px] px-2 rounded-md select-none shadow-sm">
    <span className="text-[8px] font-black italic tracking-tighter text-white">
      RuPay
    </span>
    <span className="text-[#8DB8CC] text-[6px] not-italic font-extrabold">▶</span>
  </div>
);

const AmexLogo: React.FC = () => (
  <div className="bg-[#10161B] text-[#F5F7F8] px-2 py-[3px] rounded-md font-extrabold text-[7px] tracking-tight uppercase leading-none select-none border border-[#26313A] shadow-sm">
    AMEX
  </div>
);

const PayPalLogo: React.FC = () => (
  <div className="flex items-center gap-0.5 bg-[#10161B] border border-[#26313A] py-[3px] px-2 rounded-md text-white italic font-extrabold text-[8px] tracking-tighter select-none shadow-sm">
    <span className="text-white font-bold">P</span>
    <span className="text-[#AFC3CF] font-bold">P</span>
    <span className="ml-[1px] text-[#A8B0B7] lowercase hidden sm:inline">paypal</span>
  </div>
);

const GooglePayLogo: React.FC = () => (
  <div className="flex items-center gap-1 bg-[#10161B] border border-[#26313A] py-[3px] px-2 rounded-md select-none shadow-sm">
    <span className="text-white font-extrabold text-[8px] tracking-tighter">G</span>
    <span className="text-[#AFC3CF] text-[8px] font-medium tracking-tight">Pay</span>
  </div>
);

const PhonePeLogo: React.FC = () => (
  <div className="bg-[#10161B] text-white px-2 py-[3px] rounded-md font-black text-[7px] tracking-wider uppercase select-none border border-[#26313A] shadow-sm flex items-center gap-1">
    <span className="text-[#8DB8CC] font-bold">पे</span>
    <span>PhonePe</span>
  </div>
);

const PaytmLogo: React.FC = () => (
  <div className="flex items-center bg-[#10161B] border border-[#26313A] py-[3px] px-2 rounded-md select-none shadow-sm">
    <span className="text-white font-black italic text-[8px]">pay</span>
    <span className="text-[#AFC3CF] font-black italic text-[8px]">tm</span>
  </div>
);

const UPILogo: React.FC = () => (
  <div className="flex items-center gap-1 bg-[#10161B] border border-[#26313A] py-[3px] px-2 rounded-md select-none font-bold italic tracking-tighter text-white text-[8px] shadow-sm">
    UPI
    <div className="flex flex-col gap-[1px]">
      <div className="w-1 h-1 bg-[#8DB8CC] rounded-full" />
    </div>
  </div>
);

// --- PREMIUM VALUE CTA BASE PLATE (Pollo AI Screenshot 4 style layout) ---
const UnlockUltimateValue: React.FC<{onNavigate: OnNavigateType}> = ({ onNavigate }) => {
  return (
    <section className="py-24 px-6 bg-[#050709]">
      <div className="max-w-[1100px] mx-auto space-y-10 selection:bg-blue-500/30 animate-fade-in">
        
        {/* Top Cobalt Premium Card Layout */}
        <div className="relative rounded-[28px] p-8 sm:p-14 bg-gradient-to-b from-[#10161B] via-[#0A0E12] to-[#050709] border border-[#26313A] shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden text-center space-y-8">
          {/* Ambient white/silver background flare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-white/[0.04] blur-[80px] pointer-events-none rounded-full" />
          
          {/* 1. Pill Header Badges Row */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0E12] border border-[#26313A] shadow-sm text-[#A8B0B7]">
              <CheckCircle2 size={13} className="text-[#AFC3CF] fill-[#AFC3CF]/10" />
              <span>No-Watermark</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0E12] border border-[#26313A] shadow-sm text-[#A8B0B7]">
              <CheckCircle2 size={13} className="text-[#AFC3CF] fill-[#AFC3CF]/10" />
              <span>Commercial Use</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0E12] border border-[#26313A] shadow-sm text-[#A8B0B7]">
              <CheckCircle2 size={13} className="text-[#AFC3CF] fill-[#AFC3CF]/10" />
              <span>Private Video Visibility</span>
            </div>
          </div>

          {/* 2. Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase italic tracking-tight leading-none">
            Unlock the Full Potential of ALGOEDIT
          </h2>

          {/* 3. Action Buttons with Elegant Silver Treatment */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative z-10">
            <button
              onClick={() => onNavigate('signin')}
              className="w-full sm:w-auto px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#050709] bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all transform hover:scale-105 active:scale-95 duration-200 cursor-pointer"
            >
              Start For Free
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#F5F7F8] bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF] hover:brightness-110 transition-all transform hover:scale-105 active:scale-95 duration-200 cursor-pointer"
            >
              See Pricing
            </button>
          </div>

          {/* 4. Pay Safely Subtitle & Shield Indicator */}
          <div className="pt-4 flex flex-col items-center gap-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
              <ShieldCheck size={14} className="text-emerald-400 fill-emerald-400/5" />
              <span>Pay safely and securely with</span>
            </div>

            {/* 5. Precise Grid of Acceptable Payment Options with NO "More" button */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl px-4 py-3.5 bg-black/35 rounded-2xl border border-white/5 shadow-inner">
              <VisaLogo />
              <MastercardLogo />
              <RuPayLogo />
              <AmexLogo />
              <PayPalLogo />
              <GooglePayLogo />
              <PhonePeLogo />
              <PaytmLogo />
              <UPILogo />
            </div>
          </div>

        </div>

        {/* 6. Under Banner Platform Specifications / Compatibility */}
        <div className="text-center space-y-6 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest">
            <span>Compatible with:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="p-1.5 px-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center" title="Windows Compatible">
                <Laptop size={12} className="inline mr-1 text-sky-400" /> Windows
              </span>
              <span className="p-1.5 px-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center" title="macOS Compatible">
                <Monitor size={12} className="inline mr-1 text-slate-300" /> macOS
              </span>
              <span className="p-1.5 px-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center" title="iOS App">
                <Smartphone size={12} className="inline mr-1 text-slate-200" /> iOS
              </span>
              <span className="p-1.5 px-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center" title="Android Companion">
                <Smartphone size={12} className="inline mr-1 text-[#AFC3CF]" /> Android
              </span>
              <span className="p-1.5 px-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center" title="Chrome Plugin Optimized">
                <Chrome size={12} className="inline mr-1 text-[#E8F0F4]" /> Chrome
              </span>
            </div>
          </div>

          {/* 7. Ratings Row (Trustpilot, Google Play, App Store) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 max-w-3xl mx-auto border-t border-white/5">
            {/* Trustpilot */}
            <div className="flex items-center justify-center gap-2.5 bg-slate-950/45 p-3 rounded-xl border border-white/5">
              <span className="text-[#8DB8CC] font-extrabold text-[11px] tracking-widest uppercase font-mono">★ Trustpilot</span>
              <div className="flex items-center gap-0.5" title="4.3 Out Of 5 Stars">
                {[1, 2, 3, 4].map(n => <Star key={n} size={11} className="fill-[#8DB8CC] text-[#8DB8CC]" />)}
                <Star size={11} className="text-slate-600 fill-slate-600/20" />
              </div>
              <span className="text-white font-mono text-[10px] font-black">4.3</span>
            </div>

            {/* Google Play */}
            <div className="flex items-center justify-center gap-2.5 bg-slate-950/45 p-3 rounded-xl border border-white/5">
              <span className="text-sky-400 font-extrabold text-[11px] tracking-widest uppercase font-mono">Google Play</span>
              <div className="flex items-center gap-0.5" title="4.2 Out Of 5 Stars">
                {[1, 2, 3, 4].map(n => <Star key={n} size={11} className="fill-[#8DB8CC] text-[#8DB8CC]" />)}
                <Star size={11} className="text-slate-600 fill-slate-600/20" />
              </div>
              <span className="text-white font-mono text-[10px] font-black">4.2</span>
            </div>

            {/* App Store */}
            <div className="flex items-center justify-center gap-2.5 bg-slate-950/45 p-3 rounded-xl border border-white/5">
              <span className="text-[#ea3c87] font-extrabold text-[11px] tracking-widest uppercase font-mono">App Store</span>
              <div className="flex items-center gap-0.5" title="4.7 Out Of 5 Stars">
                {[1, 2, 3, 4, 5].map(n => <Star key={n} size={11} className="fill-[#8DB8CC] text-[#8DB8CC]" />)}
              </div>
              <span className="text-white font-mono text-[10px] font-black">4.7</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// --- FAQ CONSOLE ACCORDION GRID (Screenshot 14 style) ---
const QA_DATA = [
  { q: "What makes AlgoEdit AI unique?", a: "AlgoEdit AI is an advanced, high-performance creative node terminal for audiovisual rendering. We bring together more than 70 industry-leading models into a unified canvas so studios, directors, and independent artists can accelerate their media pipelines." },
  { q: "How performant is the rendering cycle?", a: "Generative drafts are typically ready in under 15 seconds, powered by our high-speed cloud cluster. Advanced upscaled 4K pipelines with deep keyframing take roughly one minute to complete without taxing user hardware." },
  { q: "Are watermarks applied to my finished visual assets?", a: "Standard trial generations include a subtle platform identifier. Registered subscribers on our premium and enterprise tiers have exclusive access to zero-watermark outputs and private cloud repositories." },
  { q: "Do premium accounts license elements for commercial use?", a: "Yes. All subscription levels authorize full commercial redistribution, streaming, and publishing rights without ongoing royalty fees." },
  { q: "How does resource tracking function?", a: "Our platform uses transparent cloud computational points. Complex generations scale according to the parameters and depth you specify. Points refresh automatically every billing cycle, and additional batch packs can be added to your account instantly." },
  { q: "How can I reach out to customer assistance?", a: "Our technical operations center is staffed continuously. You can reach out instantly at contact@algoedit.ai or leverage the real-time help panel directly inside your console." }
];

const FAAccordions: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-[#050709]">
      <div className="max-w-[1250px] mx-auto text-left">
         <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white uppercase mb-12 border-b border-white/5 pb-6">
           Questions and Answers
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {QA_DATA.map((item, idx) => {
             const isOpen = openIdx === idx;
             return (
               <div 
                 key={idx} 
                 className="bg-[#10161B] border border-[#26313A] rounded-2xl p-6 hover:border-[#AFC3CF]/40 transition-all w-full flex flex-col justify-between"
               >
                 <button
                   onClick={() => setOpenIdx(isOpen ? null : idx)}
                   className="w-full text-left flex justify-between items-center bg-transparent focus:outline-none cursor-pointer"
                 >
                   <span className="text-sm font-black text-white uppercase tracking-wider pr-4">{item.q}</span>
                   <span className="text-[#AFC3CF] font-extrabold text-base select-none">{isOpen ? '−' : '＋'}</span>
                 </button>

                 <AnimatePresence>
                   {isOpen && (
                     <motion.div
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       exit={{ opacity: 0, height: 0 }}
                       className="overflow-hidden"
                     >
                       <p className="text-slate-400 text-xs sm:text-sm mt-4 leading-relaxed font-light font-sans pt-2 border-t border-white/5">
                         {item.a}
                       </p>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             );
           })}
         </div>

      </div>
    </section>
  );
};

// --- DYNAMIC COLLATORS CTA BOARD (Screenshot 15 style) ---
const CustomCollatorCTA: React.FC<{onNavigate: OnNavigateType}> = ({ onNavigate }) => {
  const floatingAvatars = [
    { x: "12%", y: "20%", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150" },
    { x: "22%", y: "70%", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150" },
    { x: "32%", y: "40%", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150" },
    { x: "65%", y: "30%", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150" },
    { x: "75%", y: "75%", url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150" },
    { x: "85%", y: "50%", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150" }
  ];

  return (
    <section className="py-32 px-6 bg-[#020406] relative overflow-hidden text-center min-h-[500px] flex flex-col justify-center items-center border-y border-white/5">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(141,184,204,0.06),transparent_60%)] opacity-40 pointer-events-none" />
       
       {/* 10M+ Background absolute vector */}
       <div className="absolute text-[8vw] sm:text-[14vw] font-black italic uppercase text-white/[0.015] leading-none tracking-tighter select-none pointer-events-none">
         10,000,000+
       </div>

       {/* Floating round nodes with line tracks */}
       <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
         <svg className="absolute w-full h-full inset-0 opacity-20">
            <line x1="12%" y1="20%" x2="32%" y2="40%" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
            <line x1="32%" y1="40%" x2="50%" y2="50%" stroke="#8DB8CC" strokeWidth="1" />
            <line x1="65%" y1="30%" x2="50%" y2="50%" stroke="#8DB8CC" strokeWidth="1" />
            <line x1="85%" y1="50%" x2="65%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
         </svg>

         {floatingAvatars.map((av, idx) => (
           <motion.div
             key={idx}
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
             style={{ left: av.x, top: av.y }}
             className="absolute w-12 h-12 rounded-full overflow-hidden border border-white/15 p-0.5 shadow-xl bg-black"
           >
             <img src={av.url} className="w-full h-full object-cover rounded-full" />
           </motion.div>
         ))}
       </div>

       <div className="relative z-10 space-y-6 max-w-2xl px-4">
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white leading-tight">
            Join Global Creators Shaping the Future of Generative Design
          </h2>
          
          <div className="pt-6">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(0,198,255,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('signin')}
              className="px-10 py-5 rounded-full bg-transparent border-2 border-[#E8F0F4] font-extrabold text-[11px] tracking-widest text-[#E8F0F4] hover:bg-white hover:text-[#050709] transition-all cursor-pointer uppercase shadow-lg shadow-white/10"
            >
              Get Started Now
            </motion.button>
          </div>
       </div>
    </section>
  );
};


const HeroSection: React.FC<{ onNavigate: OnNavigateType, user: User | null }> = ({ onNavigate, user }) => {
    return (
        <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center p-6 pb-20 overflow-hidden bg-gradient-to-b from-[#050709] via-[#0A0E12] to-[#050709]">
            {/* Background Ambient Gradients */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#8DB8CC]/5 blur-[140px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/3 w-[800px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none"></div>

            {/* Hyperspeed WebGL background visual enhancement */}
            <div className="absolute inset-0 opacity-70 pointer-events-none z-0 overflow-hidden">
              <Hyperspeed />
            </div>

            <div className="relative z-10 w-full max-w-6xl px-4 mt-12 md:mt-6">
                {/* Official ALGOEDIT Brand Logo Showcase (Image 3) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex justify-center mb-6"
                >
                  <AlgoEditLogo size="hero" showText={true} showFlare={true} />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#10161B] border border-[#26313A] mb-8"
                >
                    <div className="w-2 h-2 rounded-full bg-[#8DB8CC] animate-pulse-dot"></div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#AFC3CF]">THE ULTIMATE GENERATIVE MEDIA WORKSTATION</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase italic mb-6"
                >
                  Reimagine Cinematic Video & Image<br/>
                  <span className="inline-flex items-center justify-center mt-2.5">
                    <RotatingText
                      texts={['Prototyping Streams', 'Production Pipelines', 'Dynamic Storyboards', 'Neural Masterpieces', 'Immersive Realms']}
                      splitBy="words"
                      mainClassName="px-4 py-1.5 bg-[#10161B] border border-[#26313A] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.06)] text-[#F5F7F8] text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-black not-italic uppercase tracking-tight"
                      staggerFrom="last"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-120%", opacity: 0 }}
                      staggerDuration={0.02}
                      splitLevelClassName="overflow-hidden pb-1"
                      transition={{ type: "spring", damping: 30, stiffness: 450 }}
                      rotationInterval={2400}
                    />
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl mx-auto text-xs sm:text-sm text-gray-400 mb-10 font-sans font-light leading-relaxed"
                >
                  Empower your creative process with state-of-the-art neural intelligence. Synthesize cinematic camera movements, generate photorealistic art assets, and scale high-resolution video streams in a unified workflow with zero lag.
                </motion.p>

                {/* Main buttons (Screenshot 1 style) */}
                <div className="flex justify-center gap-4 mb-20">
                  <button 
                    onClick={() => onNavigate('signin')}
                    className="px-10 py-4 rounded-full bg-gradient-to-r from-[#FFFFFF] via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 shadow-lg text-xs font-black uppercase tracking-widest text-[#050709] cursor-pointer hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] select-none"
                  >
                    Start For Free
                  </button>
                  <button 
                    onClick={() => onNavigate('pricing')}
                    className="px-10 py-4 rounded-full bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF] shadow-lg text-xs font-black uppercase tracking-widest text-[#F5F7F8] cursor-pointer select-none"
                  >
                    See Pricing
                  </button>
                </div>

                <MagicSearchBox onNavigate={onNavigate} user={user} />

                {/* Overlapping Previews Floating Row (Image 1 style layout) */}
                <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
                  {/* Left Floating Box (Mona-Lisa face swap) */}
                  <div className="lg:col-span-3 hidden lg:flex flex-col gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
                    >
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300" className="w-full aspect-[4/3] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-3 text-left">
                        <span className="text-[8px] font-mono font-bold text-[#AFC3CF] uppercase tracking-widest block">Identity Locked</span>
                        <span className="text-[10px] font-bold text-white uppercase mt-0.5 block">Mona Lisa Sync</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
                    >
                      <img src="https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=300" className="w-full aspect-[4/3] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-3 text-left">
                        <span className="text-[8px] font-mono font-bold text-[#AFC3CF] uppercase tracking-widest block">Viral Effect</span>
                        <span className="text-[10px] font-bold text-white uppercase mt-0.5 block">Cool Lion Selfie</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Main Presentation Video Element */}
                  <div className="lg:col-span-6 w-full">
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="relative rounded-3xl overflow-hidden border border-white/12 shadow-[0_40px_100px_rgba(0,0,0,0.85)] bg-slate-900 group"
                    >
                      {/* Premium YouTube Mock wrapper playing beautiful sample compilation */}
                      <div className="aspect-video w-full h-full relative">
                        <iframe 
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1&loop=1&controls=0" 
                          title="AlgoEdit AI Video Showcase"
                          className="w-full h-full border-none opacity-85 group-hover:opacity-100 transition-opacity"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <div className="absolute bottom-4 left-4 flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3.5 py-2 border border-white/10 rounded-xl z-20 pointer-events-none">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8DB8CC] animate-pulse" />
                          <span className="font-mono text-[9px] text-white font-black tracking-widest uppercase">POL_CORE_WORKLOAD</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Floating Box: Music beat generator preview */}
                  <div className="lg:col-span-3 hidden lg:flex flex-col gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
                    >
                      <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=300" className="w-full aspect-[4/5] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      
                      {/* Dynamic Sound waves */}
                      <div className="absolute bottom-12 inset-x-4 flex justify-between h-8 items-end opacity-75">
                        {[1,2,3,4,5,4,3,2,3,4,5,4,3,2,1].map((h, hIdx) => (
                          <motion.div 
                            key={hIdx}
                            animate={{ height: [`${h * 20}%`, `${100 - h * 15}%`, `${h * 20}%`] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: hIdx * 0.08 }}
                            className="bg-white w-[2px] rounded-full" 
                          />
                        ))}
                      </div>

                      <div className="absolute bottom-3 left-3 text-left">
                        <span className="text-[8px] font-mono font-bold text-[#8DB8CC] uppercase tracking-widest block">Beat-Sync Catalyst</span>
                        <span className="text-[10px] font-bold text-white uppercase mt-0.5 block">Dynamic Dance Sync</span>
                      </div>
                    </motion.div>
                  </div>
                </div>

            </div>
          {/* Dynamic glowing line on base */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
    );
};


// --- CREATIVE CIRCULAR GALLERY SECTION ---
const CreativeCircularGallerySection: React.FC = () => {
  const galleryItems = [
    { image: "/videos/AI-COSMICGLOW.jpg", text: "AI Cosmic Glow" },
    { image: "/videos/PLANETINSIDEDROP-2.png", text: "Planet Inside Drop" },
    { image: "/videos/AI-CARNIVALGLOW.png", text: "AI Carnival Glow" },
    { image: "/videos/Floating-City-Above-Clouds-2.jpg", text: "Floating City Above Clouds" },
    { image: "/videos/AI-GOLDEN-MOONRISE.jpg", text: "AI Golden Moonrise" },
    { image: "/videos/PUZZLE-REALITY-2.png", text: "Puzzle Reality" },
    { image: "/videos/AI-ANCIENTDRAGON2.jpg", text: "Ancient Dragon", alignY: "top" },
    { image: "/videos/Planet-Rings-Around-a-City-2.jpg", text: "Planet Rings Around a City" }
  ];

  return (
    <section className="py-24 px-6 bg-[#050709] relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(141,184,204,0.04),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(232,240,244,0.03),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#AFC3CF] px-3 py-1 bg-[#10161B] border border-[#26313A] rounded-full">
          Futuristic Media Carousel
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight uppercase italic">
          Immersive Creative Showcase
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-400 mt-2 font-mono font-light">
          Drag horizontally, scroll, or press ← → arrows to explore high-fidelity generated masterpieces.
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto h-[480px] sm:h-[550px] md:h-[600px] relative rounded-3xl overflow-hidden border border-[#26313A] bg-[#0A0E12]/80 backdrop-blur-md shadow-2xl">
        <CircularGallery 
          items={galleryItems} 
          bend={3} 
          textColor="#ffffff"
          borderRadius={0.05}
          scrollSpeed={2}
          scrollEase={0.04}
          fontUrl="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap"
          font="bold 24px Orbitron"
        />
      </div>
    </section>
  );
};


// --- MAIN HOMEPAGE COMPONENT COMPILER ---
interface HomePageProps {
  onNavigate: OnNavigateType;
  user: User | null;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, user }) => {
  return (
    <div className="text-gray-100 antialiased overflow-x-hidden">
      {/* 1. Primary Hero Console Showcase */}
      <HeroSection onNavigate={onNavigate} user={user} />

      {/* 2. Interactive Scrolling Category Capsules */}
      <QuickCategorySlider onNavigate={onNavigate} />

      {/* 3. Model Engine Matrix Cluster */}
      <TopFeaturesGrid onNavigate={onNavigate} />

      {/* 4. Viral Custom Effects Portfolio */}
      <ViralEffectsSection onNavigate={onNavigate} />

      {/* 5. Cutting Edge Tabs Grid */}
      <CuttingEdgeTools onNavigate={onNavigate} />

      {/* 6. CORE SPEC: Vertical-scroll Horizontal Pinned Page Turn Showcase */}
      <FeaturesShowcase onNavigate={onNavigate} />

      {/* 7. Explore User Creations Grid */}
      <UserCreationsSection />

      {/* 7.5. Immersive Circular Gallery */}
      <CreativeCircularGallerySection />

      {/* About Us & Our Mission Section */}
      <AboutUsSection />

      {/* 8. Unlock SaaS CTA Base Plate */}
      <UnlockUltimateValue onNavigate={onNavigate} />

      {/* 9. FAQ Accordions Grid */}
      <FAAccordions />

      {/* 10. Custom 10M+ Users Floating CTAs */}
      <CustomCollatorCTA onNavigate={onNavigate} />
    </div>
  );
};

export default React.memo(HomePage);
