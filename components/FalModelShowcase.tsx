
import React, { useState, useEffect } from 'react';
import { falService, FalModelId } from '../services/falService';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon, Video, Wand2, Shield, Activity, Settings, RefreshCw, Download, Share2 } from 'lucide-react';

interface FalModel {
  id: FalModelId;
  name: string;
  category: 'Image' | 'Video' | 'Edit' | 'Upscale' | 'Restoration' | 'Audio' | '3D' | 'Multimodal';
  description: string;
}

const FAL_MODELS: FalModel[] = [
  { id: 'fal-ai/flux/pro', name: 'Neural Photo Pro', category: 'Image', description: 'State-of-the-art realism.' },
  { id: 'fal-ai/recraft-v3', name: 'Graphic Design Hub', category: 'Image', description: 'Vector and graphic design powerhouse.' },
  { id: 'fal-ai/ideogram/v2', name: 'Typographic Master', category: 'Image', description: 'Superior typography and design.' },
  { id: 'fal-ai/flux/kontext', name: 'Contextual Fluidity', category: 'Image', description: 'Context-aware image synthesis.' },
  { id: 'fal-ai/flux/fill', name: 'AI Erase & Fill', category: 'Edit', description: 'Advanced in-painting.' },
  { id: 'fal-ai/hunyuan-video', name: 'Cinematic Motion AI', category: 'Video', description: 'High-fidelity cinematic motion.' },
  { id: 'fal-ai/kling-video/v3', name: 'High-Detail Motion', category: 'Video', description: 'Next-gen video synthesis.' },
  { id: 'fal-ai/minimax-video', name: 'Viral Social Engine', category: 'Video', description: 'High-speed viral reel engine.' },
  { id: 'fal-ai/luma-dream-machine', name: 'Fluid Space Reality', category: 'Video', description: 'High-fidelity motion.' },
  { id: 'fal-ai/wan-video', name: 'Creative Motion Synth', category: 'Video', description: 'Creative video synthesis.' },
  { id: 'fal-ai/veo/v3.1', name: 'Professional Studio AI', category: 'Video', description: 'DeepMind powered animation.' },
  { id: 'fal-ai/stable-video-diffusion', name: 'Classic Motion Diffusion', category: 'Video', description: 'Stable Video Diffusion.' },
  { id: 'fal-ai/musicgen', name: 'Melodic Composer', category: 'Audio', description: 'Neural music composition.' },
  { id: 'fal-ai/bark', name: 'Realistic Voice Synth', category: 'Audio', description: 'Realistic TTS and cloning.' },
  { id: 'fal-ai/triposr', name: 'Instant 3D Geometry', category: '3D', description: 'Instant Image-to-3D.' },
  { id: 'fal-ai/aura-sr', name: '4K Crystal Clarity', category: 'Upscale', description: 'Ultra-sharp 4K restoration.' },
  { id: 'fal-ai/face-restoration', name: 'Portrait Restoration', category: 'Restoration', description: 'Neural facial reconstruction.' },
  { id: 'fal-ai/lama', name: 'Object Deletion Lab', category: 'Edit', description: 'Seamless object removal.' },
  { id: 'fal-ai/qwen/image-edit', name: 'Intelligent Multi-Edit', category: 'Edit', description: 'AI image manipulation.' },
  { id: 'fal-ai/llava-v1.5-7b', name: 'Multimodal Insights', category: 'Multimodal', description: 'Multimodal vision-language model.' },
  { id: 'fal-ai/hyper-flux', name: 'Hyper-Fast Synthesis', category: 'Image', description: 'Real-time neural rendering.' },
  { id: 'fal-ai/creative-upscaler', name: 'Artistic Upscaler', category: 'Upscale', description: 'Adds creative detail during scaling.' },
  { id: 'fal-ai/video-style-transfer', name: 'Video Style Forge', category: 'Video', description: 'Applies styles to live video.' },
  { id: 'fal-ai/face-swap', name: 'Identity Switcher', category: 'Edit', description: 'Professional grade face replacement.' },
  { id: 'fal-ai/bg-remover', name: 'Alpha BG Lab', category: 'Edit', description: 'Precision background extraction.' },
  { id: 'fal-ai/text-to-logo', name: 'Vector Logo Hub', category: 'Image', description: 'Clean, brand-ready logo generation.' },
  { id: 'fal-ai/depth-to-image', name: 'Spatial Image Synth', category: 'Image', description: 'Generates images from depth maps.' },
  { id: 'fal-ai/sketch-to-image', name: 'Neural Sketchpad', category: 'Image', description: 'Photorealistic synthesis from sketches.' },
  { id: 'fal-ai/stable-diffusion-xl', name: 'SDXL High Definition', category: 'Image', description: 'Classic high-fidelity generation.' },
  { id: 'fal-ai/svd-xt', name: 'Temporal Extension v2', category: 'Video', description: 'Extended motion synthesis.' },
  { id: 'fal-ai/cogvideo', name: 'Dynamic Scene Engine', category: 'Video', description: 'Complex multi-stage video generation.' },
  { id: 'fal-ai/music-ldm', name: 'Atmospheric Sound Synth', category: 'Audio', description: 'Texture-based audio generation.' },
  { id: 'fal-ai/audio-upscale', name: 'Sonic Restorer pro', category: 'Audio', description: 'Neural audio cleanup and scaling.' },
  { id: 'fal-ai/3d-mesh-generator', name: 'Poly-Mesh Engine', category: '3D', description: 'High-quality 3D mesh output.' },
  { id: 'fal-ai/video-segmentation', name: 'Visual Layer Splitter', category: 'Video', description: 'Splits video subjects into layers.' }
];

import { User } from '../types';

const getModelTokenCost = (category: string): number => {
  switch (category) {
    case 'Video': return 25;
    case 'Audio': return 10;
    case 'Edit': return 15;
    case 'Upscale': return 15;
    case 'Restoration': return 15;
    case '3D': return 25;
    case 'Multimodal': return 20;
    default: return 15;
  }
};

interface FalModelShowcaseProps {
  mediaType?: 'image' | 'video' | 'text';
  user?: User | null;
  userTokens?: number;
  hasTokens?: (amount: number) => boolean;
  deductTokens?: (amount: number, description?: string) => boolean;
  requireSignIn?: () => boolean;
}

const FalModelShowcase: React.FC<FalModelShowcaseProps> = ({ 
  mediaType,
  user,
  userTokens,
  hasTokens,
  deductTokens,
  requireSignIn
}) => {
  const [selectedModel, setSelectedModel] = useState<FalModel>(FAL_MODELS[0]);
  const [customModelId, setCustomModelId] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    if (mediaType) {
      const targetFilter = mediaType === 'video' ? 'Video' : 'Image';
      setFilter(targetFilter);
      const firstModelOfCategory = FAL_MODELS.find(m => m.category === targetFilter);
      if (firstModelOfCategory) {
        setSelectedModel(firstModelOfCategory);
      }
    }
  }, [mediaType]);

  const categories = ['All', ...Array.from(new Set(FAL_MODELS.map(m => m.category)))];
  const filteredModels = filter === 'All' ? FAL_MODELS : FAL_MODELS.filter(m => m.category === filter);

  const cost = getModelTokenCost(useCustomModel ? 'Image' : selectedModel.category);

  const handleGenerate = async () => {
    if (requireSignIn && requireSignIn()) {
      return;
    }

    if (!prompt && !imageUrl) {
      setError('Please provide a prompt or an image URL.');
      return;
    }

    if (hasTokens && !hasTokens(cost)) {
      setError(`Insufficient token balance. Initializing ${selectedModel.name} requires ${cost} tokens.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const modelToUse = useCustomModel ? customModelId : selectedModel.id;

    try {
      const isVideo = selectedModel.category === 'Video' || (useCustomModel && modelToUse.includes('video'));
      const isAudio = selectedModel.category === 'Audio' || (useCustomModel && (modelToUse.includes('music') || modelToUse.includes('bark')));
      let output;

      if (isVideo) {
        output = await falService.generateVideo(prompt, modelToUse as any, {
          image_url: imageUrl || undefined,
        });
      } else if (isAudio) {
        const res = await falService.generate(modelToUse as any, { prompt });
        output = res.audio?.url || res.audio_url || res.url;
      } else {
        output = await falService.generateImage(prompt, modelToUse as any, {
          image_url: imageUrl || undefined,
        });
      }

      if (deductTokens) {
        deductTokens(cost, `Synthesized core media using model ${modelToUse}`);
      }

      setResult(output);
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please verify the Model ID.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-2 px-4 md:px-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10161B] border border-[#26313A] flex items-center justify-center shadow-lg text-[#8DB8CC]">
              <Sparkles size={14} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Neural Hub</h1>
            <div className="h-px w-32 bg-gradient-to-r from-white/10 to-transparent ml-4 hidden md:block" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10161B] border border-[#26313A] font-mono shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Available Balance:</span>
            <span className="text-[11px] font-black text-[#AFC3CF] font-mono">⚡ {userTokens !== undefined ? userTokens : 0} TOKENS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch lg:h-[520px]">
        {/* Sidebar: Model Selection */}
        <div className="lg:col-span-3 flex flex-col h-full space-y-3 min-h-[400px] lg:min-h-0">
          <div className="space-y-2 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex-none">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-black text-slate-500 tracking-wider uppercase">Model Index</label>
              <span className="text-[9px] font-mono text-[#8DB8CC]/80">{filteredModels.length} Units</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-[8px] font-black px-2 py-1 rounded transition-all border cursor-pointer ${
                    filter === cat 
                    ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] border-white text-[#050709] shadow-sm' 
                    : 'bg-[#10161B] border-[#26313A] text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
            
          <div className="glass-panel border-white/5 flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
            {filteredModels.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full text-left p-3 rounded-lg transition-all group relative overflow-hidden border cursor-pointer ${
                  selectedModel.id === model.id 
                  ? 'bg-[#8DB8CC]/15 border-[#8DB8CC]/40' 
                  : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5 font-sans">
                  <h4 className={`font-bold text-[11px] tracking-wide ${selectedModel.id === model.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {model.name}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[7.3px] font-black uppercase px-1 py-0.5 rounded bg-[#10161B] border border-[#26313A] text-[#AFC3CF] font-mono">
                      ⚡ {getModelTokenCost(model.category)}
                    </span>
                    <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-mono">
                      {model.category}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-550 leading-relaxed truncate">{model.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Central Editing controls column */}
        <div className="lg:col-span-4 h-full min-h-[400px] lg:min-h-0">
          <div className="glass-panel p-5 border-white/5 h-full flex flex-col justify-between">
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1.5 mb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Settings size={12} className="text-slate-400" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Model Override</label>
                  </div>
                  <button 
                    onClick={() => setUseCustomModel(!useCustomModel)}
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer ${useCustomModel ? 'bg-gradient-to-r from-white to-[#AFC3CF] text-[#050709]' : 'bg-white/5 text-slate-500'}`}
                  >
                    {useCustomModel ? 'ACTIVE' : 'CUSTOM ID'}
                  </button>
                </div>
                {useCustomModel && (
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-[#26313A] rounded-xl p-2.5 text-xs text-white placeholder:text-slate-700 outline-none font-mono focus:border-[#8DB8CC]/40"
                    placeholder="e.g., fal-ai/pixverse-video"
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Wand2 size={12} className="text-[#8DB8CC]" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Synthesis Command</label>
                </div>
                <textarea
                  className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all min-h-[90px] font-mono resize-none leading-relaxed"
                  placeholder={`Enter prompt for ${selectedModel.name}...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-[#AFC3CF]" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Source Asset (Optional)</label>
                </div>
                <input
                  type="text"
                  className="w-full bg-black/20 border border-white/5 rounded-xl p-2.5 text-xs text-slate-300 placeholder:text-slate-700 focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all font-mono"
                  placeholder="https://example.com/asset.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 mb-3 pt-2.5 border-t border-white/5">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase">
                <span className="text-slate-500">Transaction Value</span>
                <span className="text-[#AFC3CF] font-black">⚡ {cost} Credits</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono uppercase">
                <span className="text-slate-500">Post-Generation Balance</span>
                <span className="text-[#E8F0F4] font-black">✨ {userTokens !== undefined ? Math.max(0, userTokens - cost) : 0} Credits</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all flex-none cursor-pointer ${
                isLoading 
                ? 'bg-white/5 text-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>SYNTHESIZING...</span>
                </>
              ) : (
                <>
                  <Activity size={14} />
                  <span>INITIALIZE {selectedModel.name.split(' ')[0]}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Right Preview/Result container column */}
        <div className="lg:col-span-5 h-full min-h-[300px] lg:min-h-0">
          <div className="w-full h-full bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-lg">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-3"
                >
                  <div className="w-12 h-12 border-3 border-[#8DB8CC]/20 border-t-[#8DB8CC] rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(141,184,204,0.3)]" />
                  <p className="text-[9px] font-mono text-[#8DB8CC] animate-pulse uppercase tracking-[0.25em]">Neural_Link_Active</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-6 space-y-3"
                >
                  <Shield className="text-red-500 mx-auto" size={36} />
                  <p className="text-red-400 font-mono text-[10px] max-w-xs mx-auto leading-relaxed">{error}</p>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex items-center justify-center bg-black/20"
                >
                  {selectedModel.category === 'Video' ? (
                    <video 
                      src={result} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src={result} 
                      alt="Generated Output" 
                      className="w-full h-full object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = result;
                        link.target = '_blank';
                        link.download = `algoedit-hub-${selectedModel.id.replace(/\//g, '_')}-${Date.now()}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-2.5 bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF]/40 rounded-xl text-white transition-all shadow-lg hover:scale-105 cursor-pointer"
                      title="Download Asset"
                    >
                      <Download size={14} className="text-[#8DB8CC]" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(result);
                        alert("Link copied to clipboard!");
                      }}
                      className="p-2.5 bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF]/40 rounded-xl text-white transition-all shadow-lg hover:scale-105 cursor-pointer"
                      title="Share Link"
                    >
                      <Share2 size={14} className="text-[#8DB8CC]" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center space-y-3 opacity-20">
                  {selectedModel.category === 'Video' ? <Video size={48} className="mx-auto" /> : <ImageIcon size={48} className="mx-auto" />}
                  <p className="text-[9px] font-black uppercase tracking-[0.4em]">System_Idle</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FalModelShowcase;
