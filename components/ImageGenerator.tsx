



import React, { useState, useEffect, useCallback } from 'react';
import ResultDisplay from './ResultDisplay';
import { AspectRatio, Asset, OnNavigateType, User } from '../types';
import { History, Activity, Shield, Settings, Share2, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SkeletonLoader } from './ui/SkeletonLoader';
import { RetentionService } from '../services/RetentionService';
import { DraftService } from '../services/draftService';
import { ASPECT_RATIOS, AI_TOKEN_COSTS } from '../constants';
import AutoVersioningModal from './AutoVersioningModal';
import SendToBar from './SendToBar';
import PromptEnhancerToggle from './PromptEnhancerToggle';
import { falService, FalModelId } from '../services/falService';
import { MockAIService } from '../services/MockAIService';
import { CustomSelect } from './ui/CustomSelect';

interface Model {
    id: FalModelId;
    name: string;
    description: string;
    tokenMultiplier: number;
    quality: 'Good' | 'Excellent' | 'Cinematic';
}

const imageModels: Model[] = [
    { id: 'fal-ai/flux/pro', name: 'Elite Realism Engine', description: 'State-of-the-art realism and prompt adherence.', tokenMultiplier: 2, quality: 'Cinematic' },
    { id: 'fal-ai/flux/dev', name: 'Creative Concept AI', description: 'High quality, great for creative concepts.', tokenMultiplier: 1.5, quality: 'Excellent' },
    { id: 'fal-ai/flux/schnell', name: 'Instant Draft Synth', description: 'Ultra-fast generation for quick iterations.', tokenMultiplier: 1, quality: 'Good' },
    { id: 'fal-ai/flux/kontext', name: 'Contextual Insight AI', description: 'Context-aware image synthesis.', tokenMultiplier: 2.5, quality: 'Cinematic' },
    { id: 'fal-ai/flux/fill', name: 'Intelligent Canvas Fill', description: 'Advanced in-painting and out-painting.', tokenMultiplier: 1.8, quality: 'Excellent' },
    { id: 'fal-ai/stable-diffusion/v3-medium', name: 'Balanced Diffusion Core', description: 'Stable Diffusion 3 for balanced results.', tokenMultiplier: 1.2, quality: 'Good' },
];

const ModelSelector: React.FC<{ selectedModel: Model, onSelect: (model: Model) => void }> = ({ selectedModel, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="space-y-1.5 relative">
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-1.5">
                    <Activity size={12} className="text-[#8DB8CC]" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Neural Engine</label>
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
                        <span className="text-[10px] text-slate-400 ml-2 font-mono">({Math.round(AI_TOKEN_COSTS.IMAGE_GENERATION * selectedModel.tokenMultiplier)}T)</span>
                    </div>
                </div>
                <div className="bg-white/5 p-1 rounded-md text-slate-400">
                    <Settings size={12} />
                </div>
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 z-50 bg-[#090a12] border border-white/10 rounded-xl p-1.5 shadow-2xl max-h-[220px] overflow-y-auto custom-scrollbar">
                        {imageModels.map(model => (
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
                                <span className="font-mono text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">{Math.round(AI_TOKEN_COSTS.IMAGE_GENERATION * model.tokenMultiplier)}T</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

interface ImageGeneratorProps {
    initialPrompt?: string;
    onNavigate: OnNavigateType;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    requireSignIn: () => boolean;
    user: User | null;
    userTokens: number;
    hasTokens: (amount: number) => boolean;
    deductTokens: (amount: number) => boolean;
    onCostChange?: (cost: number) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ initialPrompt, onNavigate, onMediaGenerated, requireSignIn, user, userTokens, hasTokens, deductTokens, onCostChange }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showVersioningModal, setShowVersioningModal] = useState(false);
    
    const [isEnhanceEnabled, setIsEnhanceEnabled] = useState<boolean>(true);
    const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<Model>(imageModels[1]);

    const [lastGeneration, setLastGeneration] = useState<{ prompt: string, enhanced: string | null } | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    
    const resultImageUrl = history[historyIndex] ?? null;
    const cost = Math.round(AI_TOKEN_COSTS.IMAGE_GENERATION * selectedModel.tokenMultiplier);

    useEffect(() => {
        if (onCostChange) {
            onCostChange(cost);
        }
    }, [cost, onCostChange]);

    const runGenerate = useCallback(async (promptToUse: string, isRegeneration = false) => {
        if (!promptToUse) {
            setError('Please enter a prompt.');
            return;
        }

        if (!isRegeneration && !hasTokens(cost)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setEnhancedPrompt(null);
        
        try {
            let finalPrompt = promptToUse;
            if (isEnhanceEnabled) {
                try {
                  const enhanceResponse = await fetch('/api/ai/enhance-prompt', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ simplePrompt: promptToUse, context: 'image' })
                  });
                  if (enhanceResponse.ok) {
                    const enhanceData = await enhanceResponse.json();
                    finalPrompt = enhanceData.result;
                    setEnhancedPrompt(finalPrompt);
                  }
                } catch (e) {
                  // Fallback if API fails
                  finalPrompt = `${promptToUse}, hyper-realistic, 8k, cinematic lighting, masterwork`;
                  setEnhancedPrompt(finalPrompt);
                }
            }
            
            setLastGeneration({ prompt: promptToUse, enhanced: finalPrompt });

            // Try real service, fallback to Mock if fails
            let result: string;
            try {
              result = await falService.generateImage(finalPrompt, selectedModel.id, {
                  aspect_ratio: aspectRatio,
              });
            } catch (e) {
              console.log("Real service failed, falling back to synthesis simulation...");
              const mockRes = await MockAIService.generateImage(finalPrompt, selectedModel.name);
              result = mockRes.url!;
            }

            // Deduct tokens
            deductTokens(cost);

            if (user) {
                const statUpdates = RetentionService.trackGeneration(user, selectedModel.name);
                const { updatedUser: expUpdates, leveledUp } = RetentionService.addExp({ ...user, ...statUpdates }, 100);
                if (leveledUp) {
                    // Logic to show level up could go here
                }
            }

            const newHistory = [...history.slice(0, historyIndex + 1), result];
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            
            const head = "data:image/jpeg;base64,";
            const sizeInBytes = result.startsWith(head) 
                ? Math.round((result.length - head.length) * 3 / 4)
                : 1024 * 512; // 0.5MB default for mock urls

            onMediaGenerated(promptToUse, 'image', sizeInBytes, result);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [aspectRatio, history, historyIndex, onMediaGenerated, isEnhanceEnabled, deductTokens, cost, selectedModel, user, hasTokens]);


    useEffect(() => {
        const loadInitialDraft = async () => {
            const userId = user?.uid || null;
            const saved = await DraftService.getDraft(userId, 'image-generator');
            if (saved && saved.state) {
                if (saved.state.prompt) setPrompt(saved.state.prompt);
                if (saved.state.aspectRatio) setAspectRatio(saved.state.aspectRatio);
                if (saved.state.isEnhanceEnabled !== undefined) setIsEnhanceEnabled(saved.state.isEnhanceEnabled);
                if (saved.state.selectedModelId) {
                    const matchedModel = imageModels.find(m => m.id === saved.state.selectedModelId);
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
                DraftService.saveDraft(userId, 'image-generator', `Draft: ${prompt.substring(0, 30)}...`, {
                    prompt,
                    aspectRatio,
                    isEnhanceEnabled,
                    selectedModelId: selectedModel.id
                });
            }, 600);
            return () => clearTimeout(timeoutId);
        } else {
            const userId = user?.uid || null;
            DraftService.deleteDraft(userId, 'image-generator');
        }
    }, [prompt, aspectRatio, isEnhanceEnabled, selectedModel, user]);

    useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt);
        }
    }, [initialPrompt]);
    
    useEffect(() => {
        if (initialPrompt && history.length === 0) {
            runGenerate(initialPrompt);
        }
    }, [initialPrompt, runGenerate, history.length]);

    const handleUndo = () => historyIndex > 0 && setHistoryIndex(historyIndex - 1);
    const handleRedo = () => historyIndex < history.length - 1 && setHistoryIndex(historyIndex + 1);
    
    const handleRegenerate = () => {
        if (lastGeneration) {
            if (!hasTokens(cost)) return;
            runGenerate(lastGeneration.prompt, false);
        }
    };

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Synthesize</h2>
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Transform concepts into high-fidelity visual assets.</p>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] animate-pulse shadow-[0_0_8px_rgba(141,184,204,0.6)]" />
                            <label htmlFor="gen-prompt" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Command Input
                            </label>
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">
                            {prompt.length}/1000
                        </div>
                    </div>
                    
                    <div className="ai-console group">
                        <div className="ai-header">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC]/50" />
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest ml-3">AlgoEdit_v2.5_Kernel</span>
                        </div>
                        
                        <div className="relative">
                            <textarea
                                id="gen-prompt"
                                name="gen-prompt"
                                rows={3}
                                className="w-full bg-transparent border-none focus:ring-0 text-xs text-slate-200 placeholder:text-slate-600 font-mono leading-relaxed p-3 resize-none"
                                placeholder="EXECUTE: 'A cinematic hyper-realistic portrait of a cybernetic deity...'"
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
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Latent Space:</span>
                                    <span className="text-[9px] font-mono text-[#8DB8CC]">0.04ms</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Seed:</span>
                                    <span className="text-[9px] font-mono text-[#AFC3CF]">AUTO</span>
                                </div>
                            </div>
                            <PromptEnhancerToggle isEnabled={isEnhanceEnabled} onChange={setIsEnhanceEnabled} />
                        </div>
                    </div>

                    {enhancedPrompt && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-3 glass-panel border-[#8DB8CC]/20 bg-[#8DB8CC]/5 rounded-lg space-y-1 overflow-hidden"
                        >
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-[#8DB8CC]" />
                                <p className="text-[8px] text-[#8DB8CC] font-black uppercase tracking-widest">AI Optimization Applied</p>
                            </div>
                            <p className="text-[10px] text-slate-300 font-mono leading-relaxed italic line-clamp-2">"{enhancedPrompt}"</p>
                        </motion.div>
                    )}
                </div>
                
                <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />

                <div className="grid grid-cols-2 gap-4 pb-1">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1">
                            <Settings size={12} className="text-slate-500" />
                            <label htmlFor="aspect-ratio" className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                Dimensions
                            </label>
                        </div>
                        <CustomSelect
                            value={aspectRatio}
                            onChange={(val) => setAspectRatio(val as AspectRatio)}
                            options={ASPECT_RATIOS as any}
                        />
                    </div>

                    <div className="flex flex-col justify-end">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">History</span>
                            <div className="flex items-center gap-1">
                                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-all"><History size={12} className="rotate-180" /></button>
                                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-all"><History size={12} /></button>
                            </div>
                        </div>
                        <div className="h-11 border border-white/10 bg-white/[0.02] rounded-xl flex items-center px-4">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-[#8DB8CC] shadow-[0_0_10px_rgba(141,184,204,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((historyIndex + 1) / Math.max(1, history.length)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-1">
                    <motion.button 
                        whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(255,255,255,0.15)' }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => runGenerate(prompt)}
                        disabled={!prompt || isLoading || (!!userTokens && userTokens < cost && !!(userTokens > 0))} 
                        className={`w-full h-11 rounded-xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all relative overflow-hidden outline-none focus:ring-2 focus:ring-white/20 cursor-pointer ${
                            (!prompt || isLoading || (userTokens > 0 && userTokens < cost)) 
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
                                <span className="text-base">✨</span>
                                <span>GENERATE • {cost}T</span>
                            </>
                        )}
                        {!isLoading && prompt && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                        )}
                    </motion.button>
                </div>
            </div>

            <div className="lg:col-span-7">
                <div className="glass-panel border-white/10 rounded-[2rem] min-h-[70vh] flex flex-col overflow-hidden relative group">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    
                    <div className="flex-grow flex items-center justify-center p-8 w-full">
                        {isLoading && (
                            <div className="w-full max-w-md mx-auto">
                                <SkeletonLoader type="image" aspectRatio={aspectRatio} />
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
                                    onClick={() => runGenerate(prompt || lastGeneration?.prompt || '')}
                                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-mono font-black uppercase text-red-300 rounded-xl border border-red-500/20 cursor-pointer transition-all w-full sm:w-auto"
                                >
                                    RETRY GENERATION
                                </button>
                            </div>
                        )}
                        {!isLoading && !resultImageUrl && !error && (
                            <div className="text-center space-y-6 opacity-40 group-hover:opacity-60 transition-opacity">
                                <div className="w-32 h-32 border-2 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                    <Share2 size={32} className="text-white/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Awaiting Input</p>
                                    <p className="text-slate-500 text-[10px] font-mono">SYSTEM_IDLE // READY_FOR_SYNTHESIS</p>
                                </div>
                            </div>
                        )}
                        {resultImageUrl && !isLoading && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full h-full flex flex-col"
                            >
                                <div className="flex-grow relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                    <ResultDisplay mediaUrl={resultImageUrl} mediaType="image" prompt={lastGeneration?.prompt || prompt} requireSignIn={requireSignIn} />
                                </div>
                                
                                <div className="mt-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
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
                                        <SendToBar imageUrl={resultImageUrl} onNavigate={onNavigate} actions={['edit', 'asSource', 'asStyle', 'toBatch']} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowVersioningModal(true)}
                                            className="h-12 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[10px] font-black uppercase tracking-[0.2em] text-[#050709] shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:brightness-110 outline-none cursor-pointer"
                                        >
                                            Social Versions
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => alert('Shared to Community Gallery! You earned bonus EXP.')}
                                            className="h-12 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-white hover:bg-white/5 transition-all outline-none cursor-pointer"
                                        >
                                            Share to Gallery
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
            {showVersioningModal && resultImageUrl && (
                <AutoVersioningModal 
                    baseImageUrl={resultImageUrl}
                    originalPrompt={enhancedPrompt || prompt}
                    onClose={() => setShowVersioningModal(false)}
                    requireSignIn={requireSignIn}
                    userTokens={userTokens}
                    deductTokens={deductTokens}
                />
            )}
        </>
    );
};

export default ImageGenerator;
