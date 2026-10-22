
import React, { useState, useEffect, useCallback } from 'react';
import { Users, History, Share2, MoreHorizontal, Shield, Settings, Activity, Zap, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import ResultDisplay from './ResultDisplay';
import ImageUpload from './ImageUpload';
import { fileToBase64 } from '../utils/fileUtils';
import PromptEnhancerToggle from './PromptEnhancerToggle';
import { AI_TOKEN_COSTS } from '../constants';
import VideoSendToBar from './VideoSendToBar';
import { Asset, User, OnNavigateType, AspectRatio } from '../types';
import { falService, FalModelId } from '../services/falService';
import { MockAIService } from '../services/MockAIService';
import { DraftService } from '../services/draftService';
import { CustomSelect } from './ui/CustomSelect';
import { SkeletonLoader } from './ui/SkeletonLoader';

interface Model {
    id: FalModelId;
    name: string;
    description: string;
    tokenMultiplier: number;
    quality: 'Standard' | 'Enhanced' | 'Cinematic';
}

const videoModels: Model[] = [
    { id: 'fal-ai/luma-dream-machine', name: 'Luma Dream Machine', description: 'High-fidelity cinematic motion.', tokenMultiplier: 2, quality: 'Cinematic' },
    { id: 'fal-ai/kling-video', name: 'Kling Video', description: 'Advanced video synthesis engine.', tokenMultiplier: 1.5, quality: 'Enhanced' },
    { id: 'fal-ai/wan-video', name: 'Wan Video', description: 'Fast and creative video generation.', tokenMultiplier: 1, quality: 'Standard' },
    { id: 'fal-ai/kling-video/v3', name: 'Kling 3.0 Pro', description: 'Next-gen video synthesis with extreme detail.', tokenMultiplier: 2.5, quality: 'Cinematic' },
    { id: 'fal-ai/veo/v3.1', name: 'Veo 3.1', description: 'Google DeepMind powered video generation.', tokenMultiplier: 2, quality: 'Cinematic' },
];

const ModelSelector: React.FC<{ selectedModel: Model, onSelect: (model: Model) => void }> = ({ selectedModel, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="space-y-1.5 relative">
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-1.5">
                    <Activity size={12} className="text-[#8DB8CC]" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Temporal Engine</label>
                </div>
                <span className="text-[9px] font-mono text-slate-500">Quality: {selectedModel.quality}</span>
            </div>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 h-11 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl flex items-center justify-between text-left transition-all"
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8DB8CC] animate-pulse" />
                    <div>
                        <span className="text-xs font-bold text-white leading-none">{selectedModel.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2 font-mono">({Math.round(AI_TOKEN_COSTS.VIDEO_GENERATION * selectedModel.tokenMultiplier)}T)</span>
                    </div>
                </div>
                <div className="bg-white/5 p-1 rounded-md text-slate-400">
                    <Settings size={12} />
                </div>
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 z-50 bg-[#090a12] border border-white/10 rounded-xl p-1.5 shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
                        {videoModels.map(model => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onSelect(model);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                    selectedModel.id === model.id 
                                    ? 'bg-white/15 text-white font-black border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                                    : 'text-slate-300 border border-transparent hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div>
                                    <p className="font-bold">{model.name}</p>
                                    <p className="text-[9px] text-slate-400 font-normal truncate mt-0.5 max-w-[200px]">{model.description}</p>
                                </div>
                                <span className="font-mono text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">{Math.round(AI_TOKEN_COSTS.VIDEO_GENERATION * model.tokenMultiplier)}T</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

interface VideoGeneratorProps {
    initialPrompt?: string;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    requireSignIn: () => boolean;
    user: User | null;
    userTokens: number;
    hasTokens: (amount: number) => boolean;
    deductTokens: (amount: number) => boolean;
    onNavigate: OnNavigateType;
    onCostChange?: (cost: number) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ initialPrompt, onMediaGenerated, requireSignIn, user, userTokens, hasTokens, deductTokens, onNavigate, onCostChange }) => {
    const [prompt, setPrompt] = useState('');
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
    
    const [isEnhanceEnabled, setIsEnhanceEnabled] = useState<boolean>(true);
    const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<Model>(videoModels[0]);
    const [lastGeneration, setLastGeneration] = useState<{ prompt: string, enhanced: string | null, imageFile: File | null }|null>(null);

    const cost = Math.round(AI_TOKEN_COSTS.VIDEO_GENERATION * selectedModel.tokenMultiplier);

    useEffect(() => {
        if (onCostChange) {
            onCostChange(cost);
        }
    }, [cost, onCostChange]);

    const handleGenerate = useCallback(async (isRegeneration = false) => {
        const promptToUse = isRegeneration ? lastGeneration?.prompt || '' : prompt;
        const imageToUse = isRegeneration ? lastGeneration?.imageFile : sourceImageFile;

        if (!promptToUse && !imageToUse) {
            setError("Please enter a prompt or provide an image.");
            return;
        }
        
        if (!isRegeneration && !hasTokens(cost)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultVideoUrl(null);
        setEnhancedPrompt(null);

        try {
            let finalPrompt = promptToUse;
            if (isEnhanceEnabled && promptToUse) {
                setLoadingMessage("Enhancing your prompt...");
                try {
                  const enhanceResponse = await fetch('/api/ai/enhance-prompt', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ simplePrompt: promptToUse, context: 'video' })
                  });
                  if (enhanceResponse.ok) {
                    const enhanceData = await enhanceResponse.json();
                    finalPrompt = enhanceData.result;
                    setEnhancedPrompt(finalPrompt);
                  }
                } catch (e) {
                  finalPrompt = `${promptToUse}, cinematic motion, highly detailed, 4k`;
                  setEnhancedPrompt(finalPrompt);
                }
            }
            
            setLastGeneration({ prompt: promptToUse, enhanced: finalPrompt, imageFile: imageToUse });

            let videoUrl: string;
            try {
              let imageBytes;
              if (imageToUse) {
                  setLoadingMessage("Processing source image...");
                  imageBytes = await fileToBase64(imageToUse);
              }

              videoUrl = await falService.generateVideo(finalPrompt, selectedModel.id, {
                  aspect_ratio: aspectRatio,
                  image_url: imageBytes, 
              });
            } catch (e) {
              console.log("Real video service failed, using synthesis fallback...");
              setLoadingMessage("Simulating neural synthesis...");
              const mockRes = await MockAIService.generateVideo(finalPrompt, selectedModel.name);
              videoUrl = mockRes.url!;
            }
            
            deductTokens(cost);
            setResultVideoUrl(videoUrl);
            
            // For mock urls, use a default size if fetch fails
            let size = 1024 * 1024 * 2; // 2MB default
            try {
              const headResponse = await fetch(videoUrl, { method: 'HEAD' });
              const contentLength = headResponse.headers.get('content-length');
              if (contentLength) size = parseInt(contentLength);
            } catch (e) {}

            onMediaGenerated(promptToUse, 'video', size, videoUrl);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An error occurred during generation.';
            setError(`Video Generation Failed: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, sourceImageFile, lastGeneration, isEnhanceEnabled, cost, hasTokens, selectedModel, aspectRatio, deductTokens, onMediaGenerated]);

    useEffect(() => {
        const loadInitialDraft = async () => {
            const userId = user?.uid || null;
            const saved = await DraftService.getDraft(userId, 'video-generator');
            if (saved && saved.state) {
                if (saved.state.prompt) setPrompt(saved.state.prompt);
                if (saved.state.aspectRatio) setAspectRatio(saved.state.aspectRatio);
                if (saved.state.isEnhanceEnabled !== undefined) setIsEnhanceEnabled(saved.state.isEnhanceEnabled);
                if (saved.state.selectedModelId) {
                    const matchedModel = videoModels.find(m => m.id === saved.state.selectedModelId);
                    if (matchedModel) setSelectedModel(matchedModel);
                }
            }
        };
        if (!initialPrompt && !prompt) {
            loadInitialDraft();
        }
    }, [user, initialPrompt]);

    useEffect(() => {
        if (prompt) {
            const timeoutId = setTimeout(() => {
                const userId = user?.uid || null;
                DraftService.saveDraft(userId, 'video-generator', `Draft: ${prompt.substring(0, 30)}...`, {
                    prompt,
                    aspectRatio,
                    isEnhanceEnabled,
                    selectedModelId: selectedModel.id
                });
            }, 600);
            return () => clearTimeout(timeoutId);
        } else {
            const userId = user?.uid || null;
            DraftService.deleteDraft(userId, 'video-generator');
        }
    }, [prompt, aspectRatio, isEnhanceEnabled, selectedModel, user]);

    useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt);
        }
    }, [initialPrompt]);

    const handleRegenerate = () => {
        if (lastGeneration) {
            if (!hasTokens(cost)) return;
            handleGenerate(true);
        }
    };

    const handleClear = () => {
        setPrompt('');
        setSourceImageFile(null);
        setResultVideoUrl(null);
        setError(null);
        setEnhancedPrompt(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Motion Engine</h2>
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Synthesize cinematic motion from text or image.</p>
                </div>

                <div className="glass-panel p-3 rounded-xl border-white/5 bg-white/[0.01]">
                    <ImageUpload
                        onFileSelect={setSourceImageFile}
                        title="Reference Frame (Optional)"
                        file={sourceImageFile}
                        compact={true}
                    />
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] animate-pulse shadow-[0_0_8px_rgba(141,184,204,0.8)]" />
                            <label htmlFor="video-prompt" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Motion Command
                            </label>
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">
                            {prompt.length}/1000
                        </div>
                    </div>
                    
                    <div className="ai-console group">
                        <div className="ai-header">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest ml-3">AlgoEdit_Veo_v3.1_Motion</span>
                        </div>
                        
                        <div className="relative">
                            <textarea
                                id="video-prompt"
                                rows={3}
                                className="w-full bg-transparent border-none focus:ring-0 text-xs text-slate-200 placeholder:text-slate-600 font-mono leading-relaxed p-3 resize-none"
                                placeholder="EXECUTE: 'A cinematic drone shot of a cyberpunk city at night...'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-focus-within:opacity-100 transition-opacity">
                                <div className="w-full h-[1px] bg-[#8DB8CC]/40 absolute top-0 animate-scan shadow-[0_0_10px_rgba(141,184,204,0.5)]" />
                            </div>
                        </div>

                        <div className="p-2 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">FPS:</span>
                                    <span className="text-[9px] font-mono text-[#AFC3CF]">24</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Motion:</span>
                                    <span className="text-[9px] font-mono text-[#8DB8CC]">DYNAMIC</span>
                                </div>
                            </div>
                            <PromptEnhancerToggle isEnabled={isEnhanceEnabled} onChange={setIsEnhanceEnabled} />
                        </div>
                    </div>

                    {enhancedPrompt && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-3 glass-panel border-[#26313A] bg-[#10161B]/80 rounded-lg space-y-1 overflow-hidden"
                        >
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-[#8DB8CC]" />
                                <p className="text-[8px] text-[#AFC3CF] font-black uppercase tracking-widest">Temporal Optimization Applied</p>
                            </div>
                            <p className="text-[10px] text-slate-300 font-mono leading-relaxed italic line-clamp-2">"{enhancedPrompt}"</p>
                        </motion.div>
                    )}
                </div>
                
                <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />

                <div className="grid grid-cols-2 gap-4 pb-1">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aspect Ratio</label>
                        <CustomSelect 
                            value={aspectRatio}
                            onChange={(val) => setAspectRatio(val as AspectRatio)}
                            options={[
                                { label: '16:9 (Landscape)', value: '16:9' },
                                { label: '9:16 (Portrait)', value: '9:16' }
                            ]}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-sans">Resolution</label>
                        <CustomSelect 
                            value="1080p (HD)"
                            onChange={() => {}}
                            options={['1080p (HD)', '720p (Standard)']}
                        />
                    </div>
                </div>
                
                <div className="pt-1">
                    <motion.button
                        whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(255,255,255,0.15)' }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleGenerate()}
                        disabled={(!prompt && !sourceImageFile) || isLoading || (!!userTokens && userTokens < cost && !!(userTokens > 0))}
                        className={`w-full h-11 rounded-xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all relative overflow-hidden outline-none focus:ring-2 focus:ring-white/20 cursor-pointer ${
                            ((!prompt && !sourceImageFile) || isLoading || (userTokens > 0 && userTokens < cost))
                            ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                            : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] border border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>PROCESSING...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-base">🎬</span>
                                <span>GENERATE • {cost}T</span>
                            </>
                        )}
                        {!isLoading && (prompt || sourceImageFile) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                        )}
                    </motion.button>
                    
                    <div className="flex items-center justify-between mt-2.5 px-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {userTokens > 0 ? `Available: ${userTokens} Tokens` : 'Authentication Required'}
                        </span>
                        <button onClick={handleClear} disabled={isLoading} className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest outline-none">
                            <History size={10} className="rotate-180" />
                            Reset Engine
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-7">
                <div className="glass-panel border-white/10 rounded-[2rem] min-h-[70vh] flex flex-col overflow-hidden relative group">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    
                    <div className="flex-grow flex items-center justify-center p-8 w-full">
                        {isLoading && (
                            <div className="w-full max-w-md mx-auto">
                                <SkeletonLoader type="video" aspectRatio={aspectRatio} />
                            </div>
                        )}
                        {error && !isLoading && (
                            <div className="text-center space-y-5 p-6 bg-red-950/10 rounded-3xl border border-red-500/15 max-w-md mx-auto">
                                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                    <Shield className="text-red-400" size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">Synthesis Interrupted</h4>
                                    <p className="text-red-400/90 font-mono text-[10px] leading-relaxed break-words">{error}</p>
                                </div>
                                <button 
                                    onClick={() => handleGenerate(true)}
                                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-mono font-black uppercase text-red-300 rounded-xl border border-red-500/20 cursor-pointer transition-all w-full sm:w-auto"
                                >
                                    RETRY GENERATION
                                </button>
                            </div>
                        )}
                        {!isLoading && !resultVideoUrl && !error && (
                            <div className="text-center space-y-6 opacity-40 group-hover:opacity-60 transition-opacity">
                                <div className="w-32 h-32 border-2 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                    <Activity size={32} className="text-white/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Awaiting Command</p>
                                    <p className="text-slate-500 text-[10px] font-mono">TEMPORAL_IDLE // READY_FOR_MOTION_SYNTH</p>
                                </div>
                            </div>
                        )}
                        {resultVideoUrl && !isLoading && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full h-full flex flex-col"
                            >
                                <div className="flex-grow relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                                    <ResultDisplay
                                        mediaUrl={resultVideoUrl}
                                        mediaType="video"
                                        prompt={enhancedPrompt || prompt}
                                        requireSignIn={requireSignIn}
                                    />
                                </div>
                                
                                <div className="mt-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRegenerate}
                                            disabled={isLoading || userTokens < cost}
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-xs font-black uppercase tracking-widest text-[#AFC3CF] hover:text-white transition-all disabled:opacity-20 outline-none cursor-pointer"
                                        >
                                            <History size={16} className="text-[#8DB8CC]" />
                                            Regenerate
                                        </motion.button>
                                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#10161B] border border-[#26313A]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] animate-pulse shadow-[0_0_8px_rgba(141,184,204,0.8)]" />
                                            <span className="text-[10px] font-black text-[#AFC3CF] uppercase tracking-widest">
                                                Tokens Consumed: {cost}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="glass-panel p-4 rounded-2xl border-white/5">
                                        <VideoSendToBar videoUrl={resultVideoUrl} onNavigate={onNavigate} actions={['edit', 'asSource', 'asStyle']} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoGenerator;

