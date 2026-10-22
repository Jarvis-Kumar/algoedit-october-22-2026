





import React, { useState } from 'react';
import { Page, StudioTab, PreloadedAssetState, OnNavigateType } from '../types';
import { AI_TOKEN_COSTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
    BrainCircuit, Sparkles, Wand2, Lightbulb, 
    Palette, MessageSquare, ChevronRight, 
    Image as ImageIcon, Video as VideoIcon, 
    Layers, Info, AlertCircle
} from 'lucide-react';

interface IdeationAssistantProps {
    onNavigate: OnNavigateType;
    userTokens: number;
    hasTokens: (amount: number) => boolean;
    deductTokens: (amount: number) => boolean;
}

const IdeationAssistant: React.FC<IdeationAssistantProps> = ({ onNavigate, userTokens, hasTokens, deductTokens }) => {
    const [concept, setConcept] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<any | null>(null);
    const cost = AI_TOKEN_COSTS.IDEATION;

    const handleGenerateIdeas = async () => {
        if (!concept) return;
        if (!hasTokens(cost)) return;
        
        setIsLoading(true);
        setError(null);
        setIdeas(null);
        
        try {
            const response = await fetch('/api/ai/ideation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concept })
            });

            if (!response.ok) throw new Error("Ideation failed");
            const result = await response.json();
            
            deductTokens(cost);
            setIdeas(result);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to generate ideas.');
            setIdeas(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateImage = (prompt: string) => {
        onNavigate('studio', undefined, { prompt });
    };

    const handleGenerateVideo = (prompt: string) => {
        onNavigate('studio', undefined, { prompt });
    };

    const handleCreateStyle = (prompt: string) => {
        onNavigate('studio', undefined, { prompt });
    };

    return (
        <div className="p-0 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-3">
                    <div className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#10161B] text-[#8DB8CC] border border-[#26313A] tracking-[0.2em] uppercase">
                        Cognitive Ideation v2.1
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] animate-pulse shadow-[0_0_10px_rgba(141,184,204,0.5)]" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    IDEATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF]">ASSISTANT</span>
                </h2>
                <p className="text-slate-500 text-xs font-mono mt-2 tracking-wider uppercase">Neural concept expansion & creative direction synthesis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Input Section */}
                <div className="lg:col-span-12">
                    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group">
                        {/* AI Command Console Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1.5 mr-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                                <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                    CONCEPT_INPUT_BUFFER
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                    {concept.length} CH
                                </div>
                            </div>
                        </div>

                        <div className="relative bg-black/20">
                            {/* Scanning Line Animation */}
                            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8DB8CC]/50 to-transparent top-0 animate-scan pointer-events-none z-10" />
                            
                            <textarea
                                className="w-full h-40 bg-transparent p-8 text-lg leading-relaxed text-slate-200 resize-none focus:outline-none placeholder:text-slate-700 font-normal selection:bg-white/20"
                                placeholder="Initialize creative concept sequence..."
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                            />
                            
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/10 pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/10 pointer-events-none" />
                        </div>

                        <div className="px-8 py-6 bg-white/5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-[#10161B] text-[#8DB8CC] border border-[#26313A] shadow-[0_0_15px_rgba(141,184,204,0.15)]">
                                    <BrainCircuit className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Processing</div>
                                    <div className="text-xs font-mono text-[#8DB8CC]">LATENCY: OPTIMIZED</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden md:block">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compute Cost</div>
                                    <div className="text-xs font-mono text-[#AFC3CF]">{cost} TOKENS</div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(255,255,255,0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerateIdeas}
                                    disabled={!concept || isLoading || (userTokens > 0 && userTokens < cost)}
                                    className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.25em] transition-all cursor-pointer ${
                                        !concept || isLoading || (userTokens > 0 && userTokens < cost)
                                        ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                                        : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] border border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            <span>Synthesizing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5 text-[#050709]" />
                                            <span>Generate Ideas</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:col-span-12 py-20 flex flex-col items-center justify-center space-y-6"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 border-2 border-[#8DB8CC]/10 border-t-[#8DB8CC] rounded-full animate-spin shadow-[0_0_30px_rgba(141,184,204,0.2)]"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Lightbulb className="w-8 h-8 text-[#8DB8CC] animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Expanding_Creative_Dimensions</p>
                                <p className="text-[10px] text-slate-500 font-mono">Accessing neural ideation clusters...</p>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4"
                        >
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-bold">{error}</span>
                        </motion.div>
                    )}

                    {ideas && !isLoading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-10"
                        >
                            {/* Creative Prompts */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-[#8DB8CC] mb-2">
                                    <MessageSquare className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Neural_Prompts</h3>
                                </div>
                                <div className="space-y-4">
                                    {ideas.creativePrompts?.map((p: string, i: number) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass-panel rounded-2xl border border-white/10 p-6 hover:border-[#8DB8CC]/40 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#8DB8CC]" />
                                            <p className="text-slate-200 text-sm leading-relaxed mb-6 font-medium">{p}</p>
                                            <div className="flex flex-wrap gap-3">
                                                <button 
                                                    onClick={() => handleGenerateImage(p)}
                                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-sm cursor-pointer"
                                                >
                                                    <ImageIcon className="w-3.5 h-3.5" /> Image
                                                </button>
                                                <button 
                                                    onClick={() => handleGenerateVideo(p)}
                                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                                >
                                                    <VideoIcon className="w-3.5 h-3.5 text-[#8DB8CC]" /> Video
                                                </button>
                                                <button 
                                                    onClick={() => handleCreateStyle(p)}
                                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                                >
                                                    <Layers className="w-3.5 h-3.5 text-[#AFC3CF]" /> Style
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Color Palettes */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-[#AFC3CF] mb-2">
                                    <Palette className="w-5 h-5 text-[#8DB8CC]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Chromatic_Schemes</h3>
                                </div>
                                <div className="space-y-4">
                                    {ideas.colorPalettes?.map((p: any, i: number) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass-panel rounded-2xl border border-white/10 p-6 hover:border-[#8DB8CC]/40 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#8DB8CC]" />
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-black text-white uppercase tracking-widest">{p.name}</span>
                                                <div className="w-8 h-px bg-white/10" />
                                            </div>
                                            <div className="flex gap-2">
                                                {p.colors.map((c: string) => (
                                                    <motion.div 
                                                        key={c} 
                                                        whileHover={{ scale: 1.1, y: -4 }}
                                                        className="flex-grow h-12 rounded-lg shadow-lg cursor-pointer relative group/color" 
                                                        style={{ backgroundColor: c }}
                                                        title={c}
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity">
                                                            <span className="text-[8px] font-mono text-white bg-black/50 px-1 rounded">{c}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {!ideas && !isLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="lg:col-span-12 py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-20"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <Sparkles className="w-12 h-12 text-slate-400" />
                                </div>
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -top-4 -right-4 w-12 h-12 bg-[#8DB8CC]/10 border border-[#8DB8CC]/20 rounded-full flex items-center justify-center"
                                >
                                    <BrainCircuit className="w-6 h-6 text-[#8DB8CC]" />
                                </motion.div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-black text-white uppercase tracking-[0.3em]">Ideation_Engine_Idle</h4>
                                <p className="text-xs text-slate-500 max-w-[280px] font-mono leading-relaxed">Neural concept expansion and chromatic synthesis will manifest here after initialization.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default IdeationAssistant;