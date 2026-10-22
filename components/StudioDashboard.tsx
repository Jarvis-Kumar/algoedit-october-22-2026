import React, { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Zap, 
  Cpu, 
  Box, 
  Brain, 
  Monitor, 
  PenTool, 
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Mic,
  Smartphone,
  Workflow,
  GraduationCap,
  Flame,
  Wand2,
  ArrowRight,
  ChevronDown,
  Layers,
  Activity,
  Check,
  CheckCircle2,
  Tv,
  Star,
  Scissors,
  ArrowUp,
  Plus,
  Palette,
  Award,
  LayoutGrid
} from 'lucide-react';
import { featuresData } from '../data/features';
import { AlgoEditLogo } from './AlgoEditLogo';

interface StudioDashboardProps {
  onLaunch: (toolId: string) => void;
  onNavigate: (page: any) => void;
}

const StudioDashboard: React.FC<StudioDashboardProps> = ({ onLaunch, onNavigate }) => {
  const [promptInput, setPromptInput] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'voice'>('video');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Launch a standard tool mapping
  const handleLaunchTool = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Make sure we resolve correct keys in featuresData
    onLaunch(id);
  };

  const handleModelClick = () => {
    onNavigate('ai-models');
  };

  // 1. Top Feature Banners Section (Screenshot 1 top, AlgoEdit 3.0 etc)
  const topBanners = [
    {
      title: 'AlgoEdit 3.0',
      desc: 'Cinematic High-speed Video outputs',
      tag: 'HOT',
      bgImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
      id: 'ai-video-generator'
    },
    {
      title: 'AlgoEdit Agent',
      desc: 'Realistic Face Clones & Voice Syncs',
      tag: 'BETA',
      bgImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      id: 'neural-editing'
    },
    {
      title: 'Video Effects',
      desc: '300+ Premium Visual Overlays',
      tag: 'NEW',
      bgImg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop',
      id: 'ai-editing-suite'
    },
    {
      title: 'AI Transition',
      desc: 'Smart and fluid frame morphing',
      tag: 'NEW',
      bgImg: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop',
      id: 'ai-template-hub'
    },
    {
      title: 'Camera Control',
      desc: 'Precision camera tracking and scale',
      tag: 'STABLE',
      bgImg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop',
      id: 'ai-design-studio'
    }
  ];

  // 2. Popular Tools Section (Screenshot 2 style with circular items)
  const popularTools = [
    { name: 'Image Creator', icon: <ImageIcon size={20} className="text-[#8DB8CC]" />, id: 'ai-image-generator' },
    { name: 'Video Creator', icon: <Video size={20} className="text-[#AFC3CF]" />, id: 'ai-video-generator' },
    { name: 'Image Editor', icon: <PenTool size={20} className="text-[#E8F0F4]" />, id: 'ai-editing-suite' },
    { name: 'Effects Studio', icon: <Sparkles size={20} className="text-[#8DB8CC]" />, id: 'effects-studio' },
    { name: 'Avatar Studio', icon: <Smartphone size={20} className="text-white" />, id: 'avatar-studio' },
    { name: 'LoRA Studio', icon: <Cpu size={20} className="text-[#AFC3CF]" />, id: 'lora-studio' },
    { name: 'Face Swap', icon: <Cpu size={20} className="text-[#8DB8CC]" />, id: 'face-swap' },
    { name: 'Background Remover', icon: <Layers size={20} className="text-[#E8F0F4]" />, id: 'background-remover' },
    { name: 'Green Screen', icon: <Layers size={20} className="text-[#AFC3CF]" />, id: 'green-screen' },
    { name: 'Sketch to Image', icon: <PenTool size={20} className="text-[#8DB8CC]" />, id: 'sketch-to-image' },
    { name: 'Image Upscaler', icon: <Monitor size={20} className="text-[#AFC3CF]" />, id: 'image-upscaler' },
    { name: 'Photo Restoration', icon: <Wand2 size={20} className="text-[#E8F0F4]" />, id: 'photo-restoration' },
    { name: 'Photo Colorizer', icon: <Palette size={20} className="text-[#AFC3CF]" />, id: 'photo-colorizer' },
    { name: 'Magic Eraser', icon: <Scissors size={20} className="text-[#E8F0F4]" />, id: 'magic-eraser' },
    { name: 'Image Expand', icon: <Box size={20} className="text-[#8DB8CC]" />, id: 'image-expand' },
    { name: 'Object Replace', icon: <Wand2 size={20} className="text-white" />, id: 'object-replace' },
    { name: 'Canvas Expand', icon: <Box size={20} className="text-[#AFC3CF]" />, id: 'canvas-expand' },
    { name: 'Prompt Builder', icon: <Brain size={20} className="text-[#8DB8CC]" />, id: 'prompt-builder' },
    { name: 'Product Studio', icon: <LayoutGrid size={20} className="text-[#E8F0F4]" />, id: 'product-studio' },
    { name: 'Logo Creator', icon: <Award size={20} className="text-[#8DB8CC]" />, id: 'logo-creator' }
  ];

  // 3. Models Matrix Section (Screenshot 3 Models layout)
  const aiModelsList = [
    {
      name: 'Seedance 2.0',
      badge: 'New',
      badge2: '50% OFF',
      desc: 'Fluid, cohesive multi-shot video outputs',
      id: 'ai-video-generator',
      icon: <Video size={18} className="text-[#8DB8CC]" />
    },
    {
      name: 'Sora 2',
      badge: 'Audio',
      desc: 'Realistic visuals & audio (supports face uploads)',
      id: 'ai-video-generator',
      icon: <Sparkles size={18} className="text-[#AFC3CF]" />
    },
    {
      name: 'Veo 3',
      badge: 'PRO',
      desc: 'Realistic outputs with natural audio synthesis',
      id: 'ai-video-generator',
      icon: <Cpu size={18} className="text-white" />
    },
    {
      name: 'Veo 3.1',
      badge: 'Audio',
      desc: 'Frame-to-frame control & multi-image references',
      id: 'ai-video-generator',
      icon: <Activity size={18} className="text-white" />
    },
    {
      name: 'HappyHorse 1.0',
      badge: 'New',
      badge2: '80% OFF',
      desc: 'Cinematic realism with native audio-visual syncs',
      id: 'ai-video-generator',
      icon: <Flame size={18} className="text-[#AFC3CF]" />
    },
    {
      name: 'Nano Banana 2',
      badge: 'New',
      badge2: 'Unlimited Free',
      desc: 'Faster high-fidelity next-gen image generation',
      id: 'ai-image-generator',
      icon: <ImageIcon size={18} className="text-[#E8F0F4]" />
    },
    {
      name: 'GPT Image 2.0',
      badge: 'New',
      badge2: 'Unlimited Free',
      desc: 'Near-perfect text generation and extreme detail precision',
      id: 'ai-image-generator',
      icon: <Wand2 size={18} className="text-[#8DB8CC]" />
    },
    {
      name: 'Seedream 5.0 Lite',
      badge: 'New',
      badge2: 'Unlimited Free',
      desc: 'Real-time web retrieval & precise style editing controls',
      id: 'ai-image-generator',
      icon: <Activity size={18} className="text-[#8DB8CC]" />
    }
  ];

  // 4. Explore More AI Features (Tag elements with Image Backgrounds, Screenshot 4 style grid)
  const exploreFeatures = [
    { name: 'Interior Designer', id: 'interior-designer', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=200&auto=format&fit=crop' },
    { name: 'Character Creator', id: 'character-creator', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop' },
    { name: 'Anime Creator', id: 'anime-creator', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=200&auto=format&fit=crop' },
    { name: 'Pixel Studio', id: 'pixel-studio', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop' },
    { name: 'Cinematic FX', id: 'cinematic-fx', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop' },
    { name: 'Light Studio', id: 'light-studio', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop' },
    { name: 'World Builder', id: 'world-builder', img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop' },
    { name: 'Scene Creator', id: 'scene-creator', img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=200&auto=format&fit=crop' },
    { name: 'Landscape Studio', id: 'landscape-studio', img: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=200&auto=format&fit=crop' },
    { name: 'Motion FX', id: 'motion-fx', img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop' },
    { name: 'Video Enhancer', id: 'video-enhancer', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop' },
    { name: 'Video Upscaler', id: 'video-upscaler', img: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?q=80&w=200&auto=format&fit=crop' },
    { name: 'Lip Sync Studio', id: 'lip-sync-studio', img: 'https://images.unsplash.com/photo-1484807352052-23338990c6c6?q=80&w=200&auto=format&fit=crop' },
    { name: 'Voice Clone', id: 'voice-clone', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=200&auto=format&fit=crop' },
    { name: 'Voice Generator', id: 'voice-generator', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=200&auto=format&fit=crop' },
    { name: 'Speech Transcriber', id: 'speech-transcriber', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&auto=format&fit=crop' },
    { name: 'Thumbnail Creator', id: 'thumbnail-creator', img: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=200&auto=format&fit=crop' },
    { name: 'Poster Creator', id: 'poster-creator', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=200&auto=format&fit=crop' },
    { name: 'Social Studio', id: 'social-studio', img: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=200&auto=format&fit=crop' },
    { name: 'Background Creator', id: 'background-creator', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=200&auto=format&fit=crop' },
    { name: 'Depth Creator', id: 'depth-creator', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=200&auto=format&fit=crop' },
    { name: '3D Creator', id: '3d-creator', img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=200&auto=format&fit=crop' },
    { name: 'Animation Studio', id: 'animation-studio', img: 'https://images.unsplash.com/photo-1559893088-c0787ebfc084?q=80&w=200&auto=format&fit=crop' },
    { name: 'Smart Reframe', id: 'smart-reframe', img: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=200&auto=format&fit=crop' }
  ];

  const handleGenerateInputButton = () => {
    if (!promptInput.trim()) return;
    if (activeTab === 'video') {
      onNavigate('ai-video-generator');
    } else {
      onNavigate('ai-image-generator');
    }
  };

  return (
    <div className="space-y-14 text-white">
      
      {/* 1. Welcome Header (Custom premium responsive) */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#10161B] to-[#0A0E12] border border-[#26313A] p-8 sm:p-10 shadow-2xl">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,#0c1633,transparent_60%)] opacity-30 pointer-events-none" />
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DB8CC]/5 blur-[100px] pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
               <AlgoEditLogo size="lg" showText={false} showFlare={true} />
               <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-[0.4em] text-[#AFC3CF] uppercase font-black">AI Creative Workspace</span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase italic leading-[1] text-glow-blue text-white">
                    ALGOEDIT <span className="text-[#8DB8CC]">STUDIO</span>
                  </h1>
               <p className="text-slate-400 text-xs font-mono tracking-tight max-w-xl">
                 Unleash high-fidelity generative visual pipelines. Create, enhance, morph, and scale audiovisual workloads on the ultimate neural workstation.
               </p>
               </div>
            </div>
            
            <div className="flex gap-3 max-w-sm w-full md:w-auto">
               <button 
                  onClick={() => onNavigate('pricing')}
                  className="flex-1 md:flex-none btn-primary !px-5 !py-3 font-mono text-[9px] tracking-widest uppercase flex items-center justify-center gap-2"
               >
                  <Zap size={10} className="fill-white" /> Get Unlimited Access
               </button>
               <button 
                  onClick={() => onNavigate('features-overview')}
                  className="flex-1 md:flex-none btn-secondary !px-5 !py-3 font-mono text-[9px] tracking-widest uppercase flex items-center justify-center gap-2"
               >
                  Browse Tools
               </button>
            </div>
         </div>
      </div>

      {/* 2. Top Feature Banner Grid / Slider (Screenshot 1 top cards) */}
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <span className="text-xs font-mono tracking-[0.35em] text-[#00E5FF] uppercase font-black flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF] animate-pulse" />
               Flagship Audiovisual Ensembles
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">PRO PIPELINES</span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {topBanners.map((banner, index) => (
               <motion.div
                  key={index}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => onLaunch(banner.id)}
                  className="group relative rounded-2xl overflow-hidden border border-white/8 bg-black/60 aspect-[4/3] cursor-pointer shadow-lg overflow-hidden flex flex-col justify-end p-5"
               >
                  {/* Background Image with Hover Zoom on parent hover */}
                  <div className="absolute inset-0 z-0">
                     <img 
                        src={banner.bgImg} 
                        alt={banner.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-90" 
                        referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#02050e] via-[#02050e]/30 to-transparent" />
                  </div>

                  {/* Top Badge */}
                  <span className={`absolute top-4 left-4 text-[7px] font-black tracking-widest px-2 py-0.5 rounded-md z-10 ${
                     banner.tag === 'HOT' ? 'bg-[#8DB8CC] text-[#050709]' : banner.tag === 'BETA' ? 'bg-white/20 text-white border border-white/20' : 'bg-[#10161B] text-[#AFC3CF] border border-[#26313A]'
                  }`}>
                     {banner.tag}
                  </span>

                  {/* Text Overlay */}
                  <div className="relative z-10 space-y-1">
                     <div className="flex items-center gap-1">
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight leading-none">{banner.title}</h3>
                        <ChevronRight size={14} className="text-[#8DB8CC] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                     </div>
                     <p className="text-[10px] text-slate-300 font-medium tracking-tight line-clamp-1">{banner.desc}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      {/* 3. Popular Tools Section (Screenshot 2 list with clean rounded circle item style and precise slider controls) */}
      <div className="space-y-6 relative group/popular">
         <div className="flex justify-between items-center">
            <span className="text-xs font-mono tracking-[0.35em] text-[#8DB8CC] uppercase font-black flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#8DB8CC] rounded-full shadow-[0_0_10px_#8DB8CC]" />
               Popular Post-Processing Tools
            </span>
            <div className="flex items-center gap-3">
               <div className="hidden sm:flex items-center gap-1.5">
                  <button 
                     onClick={() => scrollByAmount(-280)}
                     className="p-1.5 border border-white/10 hover:border-[#8DB8CC]/40 bg-[#10161B] text-slate-400 hover:text-white rounded-full transition-all active:scale-95 cursor-pointer"
                     title="Scroll Left"
                  >
                     <ChevronLeft size={14} />
                  </button>
                  <button 
                     onClick={() => scrollByAmount(280)}
                     className="p-1.5 border border-white/10 hover:border-[#8DB8CC]/40 bg-[#10161B] text-slate-400 hover:text-white rounded-full transition-all active:scale-95 cursor-pointer"
                     title="Scroll Right"
                  >
                     <ChevronRight size={14} />
                  </button>
               </div>
               <button onClick={() => onNavigate('features-overview')} className="text-[10px] text-[#AFC3CF] hover:text-white font-mono tracking-widest uppercase transition-colors flex items-center gap-1">
                  View more <ChevronRight size={10} />
               </button>
            </div>
         </div>

         {/* Circular scroll list with smooth scroll bar & ref */}
         <div className="relative">
            <div 
               ref={scrollRef}
               className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x"
            >
               {popularTools.map((tool, idx) => (
                  <div
                     key={idx}
                     onClick={() => onLaunch(tool.id)}
                     className="flex-shrink-0 flex flex-col items-center text-center gap-3 cursor-pointer group select-none w-28 snap-start"
                  >
                     {/* Circle Icon Container */}
                     <div className="relative w-16 h-16 rounded-full bg-[#10161B] border border-[#26313A] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-[#8DB8CC]/50 group-shadow transition-all duration-300 transform group-hover:scale-105">
                        <div className="absolute inset-0 rounded-full bg-[#8DB8CC]/5 opacity-0 group-hover:opacity-100 blur-[8px] transition-opacity" />
                        {tool.icon}
                     </div>
                     <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest leading-normal text-center max-w-[90px] line-clamp-2 select-none">
                        {tool.name}
                     </span>
                  </div>
               ))}
            </div>
            
            {/* Absolute navigation indicators (fades in on hover) */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-0 group-hover/popular:opacity-100 transition-opacity hidden md:block">
               <button 
                  onClick={() => scrollByAmount(-280)}
                  className="p-2 border border-white/10 hover:border-[#8DB8CC]/40 bg-black/80 hover:bg-black text-slate-400 hover:text-white rounded-full transition-all active:scale-90 pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
               >
                  <ChevronLeft size={16} />
               </button>
            </div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-0 group-hover/popular:opacity-100 transition-opacity hidden md:block">
               <button 
                  onClick={() => scrollByAmount(280)}
                  className="p-2 border border-white/10 hover:border-[#8DB8CC]/40 bg-black/80 hover:bg-black text-slate-400 hover:text-white rounded-full transition-all active:scale-90 pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
               >
                  <ChevronRight size={16} />
               </button>
            </div>
         </div>
      </div>

      {/* 4. Models Matrix (Screenshot 3 style with status tags and custom badges and descriptions) */}
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <span className="text-xs font-mono tracking-[0.35em] text-[#8DB8CC] uppercase font-black flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#8DB8CC] rounded-full shadow-[0_0_10px_#8DB8CC]" />
               Next-Generation Foundation Models
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">ONLINE REGISTRY</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiModelsList.map((model, idx) => (
               <div
                  key={idx}
                  onClick={() => onLaunch(model.id)}
                  className="group bg-[#060914]/90 border border-white/8 hover:border-[#8DB8CC]/30 p-6 rounded-2xl transition-all h-full shadow-lg cursor-pointer flex flex-col justify-between"
               >
                  <div className="space-y-4">
                     <div className="flex items-start justify-between">
                        <div className="p-3 bg-[#10161B] border border-[#26313A] text-slate-400 rounded-xl group-hover:text-[#8DB8CC] transition-colors">
                           {model.icon}
                        </div>
                        
                        {/* Dynamic Custom Badges matching Screenshot 3 */}
                        <div className="flex flex-col items-end gap-1">
                           <span className="px-2 py-0.5 rounded bg-white/5 text-[#AFC3CF] text-[8px] font-mono uppercase tracking-widest border border-white/10">
                              {model.badge}
                           </span>
                           {model.badge2 && (
                              <span className="px-2 py-0.5 rounded bg-white/5 text-[#E8F0F4] text-[8px] font-mono uppercase tracking-widest border border-white/10">
                                 {model.badge2}
                              </span>
                           )}
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <h3 className="text-base font-black uppercase tracking-tight text-white italic group-hover:text-[#8DB8CC] transition-colors">{model.name}</h3>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight leading-normal uppercase">{model.desc}</p>
                     </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">Launch pipeline</span>
                     <ChevronRight size={14} className="text-slate-500 group-hover:text-[#8DB8CC] group-hover:translate-x-1 transition-all" />
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 5. Explore More AI Features Tag Grid with Background Images (Screenshot 4) */}
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <span className="text-xs font-mono tracking-[0.35em] text-[#8DB8CC] uppercase font-black flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#8DB8CC] rounded-full shadow-[0_0_10px_#8DB8CC]" />
               Explore More Generative Dimensions
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">24 MODULAR HUBS DISPATCHED</span>
         </div>

         {/* Tag Grid with background image and text overlay */}
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {exploreFeatures.map((feat, index) => (
               <div
                  key={index}
                  onClick={() => onLaunch(feat.id)}
                  className="group relative h-12 rounded-xl overflow-hidden border border-white/5 bg-slate-900 group cursor-pointer shadow-md transition-all duration-300 hover:border-[#8DB8CC]/40"
               >
                  {/* Background Image cover with low contrast */}
                  <div className="absolute inset-0 z-0">
                     <img 
                        src={feat.img} 
                        alt={feat.name} 
                        className="w-full h-full object-cover opacity-35 group-hover:opacity-55 scale-100 group-hover:scale-105 transition-all duration-500" 
                        referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-[#02050f]/60" />
                  </div>

                  {/* Interactive Button content */}
                  <div className="absolute inset-0 z-10 flex items-center justify-between px-3">
                     <span className="text-[10px] font-black uppercase text-white tracking-wider truncate mr-1 select-none">
                        {feat.name}
                     </span>
                     <ChevronRight size={12} className="text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0 group-hover:text-[#8DB8CC]" />
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 6. High Contrast Interactive Text Option Bar (Screenshot 4 / Bottom input bar) */}
      <div className="relative max-w-4xl mx-auto rounded-2xl bg-[#10161B] border border-[#26313A] p-1 flex flex-col sm:flex-row shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden">
         {/* Live Scanning Line Accent */}
         <div className="absolute bottom-0 left-0 w-full h-[1.5px] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#8DB8CC]/70 to-transparent animate-shimmer"></div>
         </div>

         {/* Input Box */}
         <div className="flex-grow flex items-center px-4 py-3 min-h-[50px] gap-2">
            <Plus size={16} className="text-slate-600 shrink-0" />
            <input 
               type="text" 
               value={promptInput}
               onChange={(e) => setPromptInput(e.target.value)}
               placeholder="Describe or paste your creative idea to trigger immediate synthesis..."
               className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-200 placeholder-slate-600 text-xs sm:text-sm font-sans"
            />
         </div>

         {/* Dynamic switcher & Generate controls */}
         <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border-t sm:border-t-0 sm:border-l border-white/5 rounded-b-2xl sm:rounded-b-none justify-between sm:justify-start">
            <div className="flex gap-2">
               <button 
                  onClick={() => setActiveTab('video')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase transition-all ${
                     activeTab === 'video' ? 'bg-white/10 text-white border border-white/20 font-black' : 'text-slate-500 hover:text-slate-300'
                  }`}
               >
                  Video
               </button>
               <button 
                  onClick={() => setActiveTab('image')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase transition-all ${
                     activeTab === 'image' ? 'bg-white/10 text-white border border-white/20 font-black' : 'text-slate-500 hover:text-slate-300'
                  }`}
               >
                  Image
               </button>
            </div>

            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleGenerateInputButton}
               className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 shadow text-[9px] font-black uppercase tracking-widest text-[#050709] transition-all flex items-center gap-1.5 cursor-pointer"
            >
               <span>Generate</span> <ArrowUp size={12} className="stroke-[2.5]" />
            </motion.button>
         </div>
      </div>

      {/* 7. Beautiful Complementary Branding Footer Info Section */}
      <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 mt-16 max-w-7xl mx-auto px-4 select-none">
         <div className="flex flex-col gap-1.5">
            <span className="text-xs font-black tracking-widest uppercase text-white font-mono flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#8DB8CC] rounded-full" />
               ALGOEDIT NEURAL COOPERATING NODE
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">THE NEXT FRONTIER OF NEURAL EDITING TERMINALS</span>
         </div>
         <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Creative Tools</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Video Models</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">API Keys</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#AFC3CF] hover:text-white transition-all">© 2026 ALGOEDIT AI STUDIO. All rights reserved.</a>
         </div>
      </div>

    </div>
  );
};

export default StudioDashboard;
