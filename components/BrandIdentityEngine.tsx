
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Type, Layout, Image as ImageIcon, Sparkles, Download, Share2, Rocket, Briefcase, Zap, Eye, Check } from 'lucide-react';
import { falService } from '../services/falService';

interface BrandAsset {
  type: string;
  url: string;
  label: string;
}

const BrandIdentityEngine: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [niche, setNiche] = useState('');
  const [style, setStyle] = useState('Modern & Minimal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [palette, setPalette] = useState<string[]>([]);
  const [typography, setTypography] = useState<{ primary: string; secondary: string }>({ primary: 'Inter', secondary: 'Montserrat' });

  const handleGenerateIdentity = async () => {
    if (!brandName || !niche) return;
    setIsGenerating(true);
    setAssets([]);

    try {
      // Mocking palette and typography for demo purposes, but in real app we could use LLM to decide these
      setPalette(['#0A0A0A', '#FFFFFF', '#3B82F6', '#6366F1', '#EC4899']);
      setTypography({ primary: 'Space Grotesk', secondary: 'Inter' });

      // Parallel Generation of Assets
      const assetPromises = [
        // Logo
        falService.generateImage(`Professional premium logo for ${brandName}, a ${niche} brand. Style: ${style}. Minimalist vector, high contrast, white background.`, 'fal-ai/flux/pro'),
        // Hero Image
        falService.generateImage(`Cinematic high-end hero shot for ${brandName}, ${niche} company. ${style} aesthetic, futuristic lighting, 8k resolution.`, 'fal-ai/flux/pro', { aspect_ratio: '16:9' }),
        // Social Banner
        falService.generateImage(`${brandName} brand social media banner for ${niche}. Abstract ${style} background, professional typography layout, clean.`, 'fal-ai/flux/pro', { aspect_ratio: '16:9' }),
        // Product Mockup
        falService.generateImage(`Premium product packaging with ${brandName} branding for a ${niche} product. Realistic shadow, studio lighting, ${style}.`, 'fal-ai/flux/pro'),
      ];

      const [logo, hero, banner, mockup] = await Promise.all(assetPromises);

      setAssets([
        { type: 'Logo', url: logo, label: 'Primary Brand Logo' },
        { type: 'Hero', url: hero, label: 'Main Website Hero' },
        { type: 'Social', url: banner, label: 'LinkedIn/Twitter Banner' },
        { type: 'Mockup', url: mockup, label: 'Product Packaging Mockup' }
      ]);

    } catch (error) {
      console.error('Identity Generation Failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#10161B] border border-[#26313A] flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Palette className="text-[#8DB8CC]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Brand Identity Bureau</h1>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Neural Corporate Identity Synthesis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Configuration Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 space-y-6 border-white/5">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase size={14} className="text-[#8DB8CC]" />
                Entity Specification
              </label>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Company/Brand Name"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:ring-2 focus:ring-[#8DB8CC]/40 focus:border-[#8DB8CC] transition-all font-mono"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Niche (e.g., Tech, Fashion, Food)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:ring-2 focus:ring-[#8DB8CC]/40 focus:border-[#8DB8CC] transition-all font-mono"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layout size={14} className="text-[#AFC3CF]" />
                Aesthetic Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Modern & Minimal', 'Bold & Vibrant', 'Futuristic', 'Eco-Organic', 'Luxury', 'Retro-Future'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`p-3 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      style === s 
                      ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] border-transparent font-black shadow-sm' 
                      : 'bg-[#10161B] text-slate-400 border-[#26313A] hover:border-[#AFC3CF]/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateIdentity}
              disabled={isGenerating || !brandName || !niche}
              className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all ${
                isGenerating 
                ? 'bg-white/5 text-slate-600 grayscale pointer-events-none' 
                : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <Zap className="animate-pulse" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles />
                  <span>Forge Brand Identity</span>
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {palette.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 space-y-4 border-white/5"
              >
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] inline-block">Neural Palette</label>
                <div className="flex gap-2">
                  {palette.map((color, i) => (
                    <div key={i} className="flex-grow aspect-square rounded-lg group relative cursor-pointer" style={{ backgroundColor: color }}>
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 rounded-lg text-[8px] text-white font-mono transition-opacity uppercase">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Output Canvas */}
        <div className="lg:col-span-8">
          <div className="glass-panel min-h-[600px] border-white/5 p-8 relative">
            {!isGenerating && assets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 opacity-10">
                <Rocket size={80} />
                <p className="text-xs font-black uppercase tracking-[0.8em]">Identity_Forge_Idle</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8">
              {assets.map((asset, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{asset.type}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = asset.url;
                          link.target = '_blank';
                          link.download = `${brandName.replace(/\s/g, '_')}_${asset.type.toLowerCase()}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-1.5 hover:text-[#8DB8CC] transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(asset.url);
                          alert(`${asset.type} URL copied to clipboard!`);
                        }}
                        className="p-1.5 hover:text-[#AFC3CF] transition-colors"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="aspect-square bg-black/40 rounded-2xl overflow-hidden border border-white/10 ring-1 ring-white/5 hover:ring-[#8DB8CC]/50 transition-all duration-500 flex items-center justify-center">
                    <img 
                      src={asset.url} 
                      alt={asset.label} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium italic">{asset.label}</p>
                </motion.div>
              ))}
            </div>

            {isGenerating && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-[#8DB8CC] animate-spin mx-auto" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8DB8CC] animate-pulse" size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Neural Synthesis in Progress</p>
                    <div className="flex justify-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#8DB8CC] animate-bounce" />
                      <div className="w-1 h-1 rounded-full bg-[#8DB8CC] animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 rounded-full bg-[#8DB8CC] animate-bounce [animation-delay:-0.3s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandIdentityEngine;
