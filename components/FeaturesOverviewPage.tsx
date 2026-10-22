import React from 'react';
import { Page, StudioTab, FeaturePageId, OnNavigateType } from '../types';
import { featuresData, FeatureDefinition } from '../data/features';
import { motion } from 'motion/react';
import { AlgoEditLogo } from './AlgoEditLogo';
import { 
  ChevronRight, 
  Sparkles, 
  Zap, 
  Layers, 
  Cpu, 
  Video as VideoIcon, 
  Image as ImageIcon,
  Mic2,
  Activity,
  Shield,
  Palette
} from 'lucide-react';

interface FeaturesOverviewPageProps {
  onNavigate: OnNavigateType;
}

const featureSections: { title: string; ids: FeaturePageId[]; icon: React.ReactNode; color: string }[] = [
    {
        title: 'NEURAL IMAGING',
        icon: <ImageIcon size={20} />,
        color: 'cyan',
        ids: [
            'image-generator', 'background-remover-image', 'object-remover-image', 'image-enhancer', 'upscale-2k', 'upscale-4k', 'style-transfer', 'replace-background', 'replace-object', 'face-restore-image', 'color-correction', 'lighting-fix', 'anime-convert', 'sketch-to-photo', 'pencil-sketch-convert', 'pixel-studio', 'anime-creator', 'sketch-to-image', 'image-expand', 'object-replace', 'canvas-expand', 'background-remover', 'image-upscaler', 'photo-restoration', 'photo-colorizer', 'magic-eraser', 'light-studio', 'background-creator'
        ]
    },
    {
        title: 'CINEMATIC MOTION',
        icon: <VideoIcon size={20} />,
        color: 'blue',
        ids: [
            'video-generator', 'video-editor', 'video-background-removal', 'video-upscale', 'slow-motion', 'speed-ramp', 'lip-sync-fix', 'motion-retarget', 'video-color-grade', 'video-cleanup', 'animation-studio', 'smart-reframe', 'green-screen', 'cinematic-fx', 'motion-fx', 'video-enhancer', 'video-upscaler', 'lip-sync-studio'
        ]
    },
    {
        title: 'DIGITAL IDENTITY',
        icon: <Cpu size={20} />,
        color: 'purple',
        ids: [
            'talking-avatar', 'lip-sync-avatar', '3d-avatar-maker', 'cartoon-avatar', 'corporate-avatar', 'voice-clone', 'voice-generator', 'speech-transcriber', 'character-creator'
        ]
    },
    {
        title: 'SHORT-FORM GENESIS',
        icon: <Zap size={20} />,
        color: 'orange',
        ids: [
            'auto-shorts-maker', 'auto-caption-generator', 'tiktok-style-edits', 'reels-enhancer', 'shorts-cut-detection', 'social-studio', 'thumbnail-creator'
        ]
    },
    {
        title: 'NEURAL EFFECTS',
        icon: <Sparkles size={20} />,
        color: 'emerald',
        ids: [
            'ai-gta-filter', 'ai-jojo-filter', 'comic-filter', 'neon-filter', 'pixel-filter', 'manga-shadows', 'glitch-fx', 'bollywood-style', 'hollywood-cinematic', 'vaporwave', 'retro-vhs', 'effects-studio'
        ]
    },
    {
        title: 'REMASTERING CORE',
        icon: <Layers size={20} />,
        color: 'amber',
        ids: [
            'image-restore', 'video-restore', 'noise-removal', 'denoiser-remaster', 'super-resolution', 'depth-creator'
        ]
    },
    {
        title: 'INDUSTRIAL GRADE',
        icon: <Shield size={20} />,
        color: 'rose',
        ids: [
            'multi-model-render', '4k-video-generator', 'ultra-enhance', 'raw-image-processor', 'lora-studio', 'product-studio', '3d-creator'
        ]
    },
    {
        title: 'CREATIVE LABS',
        icon: <Activity size={20} />,
        color: 'indigo',
        ids: [
            'cartoonify', 'old-age-filter', 'baby-filter', 'zombie-filter', 'cartoon-video', 'ai-dance-generator', 'anime-video-enhancer', 'music-beat-sync', 'face-swap', 'prompt-builder'
        ]
    },
    {
        title: 'VISUAL GENESIS',
        icon: <Palette size={20} />,
        color: 'teal',
        ids: [
            'prompt-to-image', 'concept-art', 'logo-generator', 'poster-creator', 'prompt-to-video', 'scene-generator', 'character-animation', 'talking-portrait', 'anime-character', 'game-character', 'mascot-character', '3d-character', 'image-to-animation-gen', 'video-to-animation-gen', 'motion-animation', 'digital-dance', 'logo-creator', 'interior-designer', 'world-builder', 'scene-creator', 'landscape-studio'
        ]
    }
];

const PlaceholderIcon = <Sparkles size={24} />;

const getFeatureData = (id: FeaturePageId): FeatureDefinition => {
    const existingFeature = featuresData[id];
    if (existingFeature) {
        return existingFeature;
    }

    const name = id.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    return {
        id,
        name,
        icon: PlaceholderIcon as any,
        description: `Advanced ${name.toLowerCase()} technology powered by neural networks.`,
        tokenCost: 6, 
        toolComponent: 'CreativeStudio',
        longDescription: '', isTopFeature: false, whyCool: [], howItWorks: '', galleryImages: [], useCases: [], faqs: [],
    };
};

const FeaturesOverviewPage: React.FC<FeaturesOverviewPageProps> = ({ onNavigate }) => {

  const getColorClasses = (color: string) => {
    // Elegant monochrome, obsidian, metallic silver, and cool-blue accents matching the ALGOEDIT logo
    switch (color) {
      case 'cyan': return 'text-[#8DB8CC] bg-[#8DB8CC]/10 border-[#8DB8CC]/25';
      case 'blue': return 'text-[#AFC3CF] bg-white/5 border-white/10';
      case 'purple': return 'text-[#E8F0F4] bg-[#10161B] border-[#26313A]';
      case 'orange': return 'text-[#8DB8CC] bg-[#8DB8CC]/10 border-[#8DB8CC]/20';
      case 'emerald': return 'text-[#AFC3CF] bg-white/5 border-white/10';
      case 'amber': return 'text-[#E8F0F4] bg-[#10161B] border-[#26313A]';
      case 'rose': return 'text-[#8DB8CC] bg-[#8DB8CC]/10 border-[#8DB8CC]/25';
      case 'indigo': return 'text-[#AFC3CF] bg-white/5 border-white/10';
      case 'teal': return 'text-[#8DB8CC] bg-[#8DB8CC]/10 border-[#8DB8CC]/20';
      default: return 'text-[#8DB8CC] bg-[#8DB8CC]/10 border-[#8DB8CC]/20';
    }
  };

  const getAccentBg = (color: string) => {
    switch (color) {
      case 'cyan': return 'bg-[#8DB8CC]';
      case 'rose': return 'bg-[#8DB8CC]';
      case 'teal': return 'bg-[#8DB8CC]';
      default: return 'bg-[#AFC3CF]';
    }
  };

  return (
    <div className="min-h-screen bg-[#050709] text-white overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(141,184,204,0.06),transparent)] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-screen-2xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-20">
          {/* Official ALGOEDIT Logo prominently displayed */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <button 
              onClick={() => onNavigate('home')} 
              className="group cursor-pointer p-1 rounded-2xl hover:opacity-90 transition-opacity"
              title="Return to Home"
            >
              <AlgoEditLogo size="lg" showText={true} showFlare={true} />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-[2px] w-20 bg-gradient-to-r from-[#8DB8CC] to-transparent" />
            <span className="text-[10px] font-black tracking-[0.4em] text-[#8DB8CC] uppercase">System Exploration</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[1.05] text-white"
          >
            All <span className="text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.3)]">Protocols</span><br/>
            <span className="text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.35)] pl-0.5 inline-block">Deployed</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-slate-400 max-w-lg text-sm leading-relaxed font-light"
          >
            Navigate through our comprehensive neural network suite. Optimized for high-throughput performance and cinematic delivery.
          </motion.p>
        </header>

        <div className="space-y-24">
          {featureSections.map((section, sIdx) => {
            const sectionFeatures = section.ids.map(getFeatureData);
            if (sectionFeatures.length === 0) return null;

            return (
              <motion.section 
                key={section.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                className="relative"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border ${getColorClasses(section.color)}`}>
                      {React.cloneElement(section.icon as React.ReactElement, { size: 18 } as any)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic uppercase tracking-tight leading-none mb-1.5">{section.title}</h2>
                      <div className="flex items-center gap-2">
                        <div className={`h-1 w-1 rounded-full ${getAccentBg(section.color)} animate-pulse`} />
                        <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">{section.ids.length} Active Modules</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {sectionFeatures.map((feature, fIdx) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fIdx * 0.05 }}
                      onClick={() => onNavigate(feature.id)}
                      className="group bg-[#0A0D18]/40 border border-white/5 p-4 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden backdrop-blur-md"
                    >
                      {/* Hover Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg bg-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 ${getColorClasses(section.color).split(' ')[0]}`}>
                            {React.isValidElement(feature.icon) 
                              ? React.cloneElement(feature.icon as any, { size: 16 })
                              : <Zap size={16} />
                            }
                          </div>
                          <div className="p-0.5 px-1.5 rounded bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 group-hover:text-white transition-colors">
                            {feature.tokenCost}u
                          </div>
                        </div>
                        
                        <h3 className="text-xs font-bold uppercase tracking-wide mb-1.5 group-hover:text-white transition-colors truncate">{feature.name}</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{feature.description}</p>
                        
                        <div className="mt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#8DB8CC] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                          Launch <ChevronRight size={8} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        <footer className="mt-40 pt-20 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold tracking-[0.5em] text-slate-600 uppercase">End of Directory • All Systems Operational</p>
        </footer>
      </div>
    </div>
  );
};

export default FeaturesOverviewPage;
