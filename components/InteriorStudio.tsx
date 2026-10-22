
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Home, Upload, Sparkles, ChevronRight, ChevronLeft, 
    Maximize2, MessageSquare, ShoppingCart, Send, 
    History, Info, Sliders, Layout, Palette, 
    Lightbulb, Trash2, Loader2, Check, ExternalLink,
    BrainCircuit
} from 'lucide-react';
import { User, Asset, Page, FeaturePageId, PreloadedAssetState, InteriorStyle, ShoppableItem, InteriorDesignState, OnNavigateType } from '../types';
import ActionButton from './ActionButton';

interface InteriorStudioProps {
    user: User | null;
    deductTokens: (amount: number, description?: string) => boolean;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    onNavigate: OnNavigateType;
    preloadedAssetState: PreloadedAssetState | null;
}

const INTERIOR_STYLES: InteriorStyle[] = [
    { id: 'mid-century', name: 'Mid-Century Modern', description: 'Clean lines, organic curves, and functional design.' },
    { id: 'scandinavian', name: 'Scandinavian', description: 'Minimalism, functionality, and natural elements.' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simplicity, neutral palettes, and essential furniture.' },
    { id: 'industrial', name: 'Industrial', description: 'Raw materials, exposed elements, and urban vibes.' },
    { id: 'luxury', name: 'Luxury Contemporary', description: 'High-end materials, bold accents, and sophisticated comfort.' },
];

const InteriorStudio: React.FC<InteriorStudioProps> = ({
    user,
    deductTokens,
    onMediaGenerated,
    onNavigate,
    preloadedAssetState
}) => {
    const [state, setState] = useState<InteriorDesignState>({
        originalImageUrl: '',
        redesignedImageUrl: undefined,
        selectedStyle: undefined,
        shoppableItems: [],
        history: []
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [compareValue, setCompareValue] = useState(50);
    const [isComparing, setIsComparing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setState(prev => ({
                    ...prev,
                    originalImageUrl: ev.target?.result as string,
                    redesignedImageUrl: undefined,
                    shoppableItems: []
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStyleSelect = async (styleId: string) => {
        if (!state.originalImageUrl) return;
        
        const cost = 10;
        if (!deductTokens(cost, `Interior Redesign: ${styleId}`)) return;

        setIsProcessing(true);
        setState(prev => ({ ...prev, selectedStyle: styleId }));
        
        try {
            const redesignResponse = await fetch('/api/ai/interior-redesign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: state.originalImageUrl, style: styleId })
            });
            if (!redesignResponse.ok) throw new Error("Redesign failed");
            const redesignedUrl = await redesignResponse.json();

            const detectResponse = await fetch('/api/ai/interior-detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: redesignedUrl })
            });
            if (!detectResponse.ok) throw new Error("Detection failed");
            const items = await detectResponse.json();
            
            setState(prev => ({
                ...prev,
                redesignedImageUrl: redesignedUrl,
                shoppableItems: items
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRefine = async () => {
        if (!chatInput.trim() || !state.redesignedImageUrl) return;

        const cost = 5;
        if (!deductTokens(cost, `Interior Refinement`)) return;

        const instruction = chatInput;
        setChatInput('');
        setIsProcessing(true);
        
        setState(prev => ({
            ...prev,
            history: [...prev.history, { role: 'user', text: instruction }]
        }));

        try {
            const refineResponse = await fetch('/api/ai/interior-refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: state.redesignedImageUrl, instruction, history: state.history })
            });
            if (!refineResponse.ok) throw new Error("Refinement failed");
            const refinedUrl = await refineResponse.json();

            const detectResponse = await fetch('/api/ai/interior-detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: refinedUrl })
            });
            if (!detectResponse.ok) throw new Error("Detection failed");
            const items = await detectResponse.json();
            
            setState(prev => ({
                ...prev,
                redesignedImageUrl: refinedUrl,
                shoppableItems: items,
                history: [...prev.history, { role: 'model', text: "I've updated the design based on your request." }]
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Home className="w-8 h-8 text-emerald-400" />
                        Interior Consultant
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">AI-Powered Room Redesign & Shopping</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleUpload} 
                        className="hidden" 
                        accept="image/*" 
                    />
                    <ActionButton 
                        onClick={() => fileInputRef.current?.click()}
                        text={state.originalImageUrl ? "Change Photo" : "Upload Room Photo"}
                        className="!py-3 !px-6"
                        icon={<Upload className="w-4 h-4 mr-2" />}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Visualization Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="ai-card p-1 bg-black/40 border-white/10 rounded-3xl overflow-hidden relative aspect-video group">
                        {!state.originalImageUrl ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-700">
                                <Layout className="w-16 h-16 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-widest">Upload a photo to begin redesign</p>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                {state.redesignedImageUrl ? (
                                    <div className="relative w-full h-full">
                                        {/* Redesigned Image */}
                                        <img 
                                            src={state.redesignedImageUrl} 
                                            className="w-full h-full object-cover"
                                            alt="Redesigned"
                                            referrerPolicy="no-referrer"
                                        />
                                        
                                        {/* Comparison Slider */}
                                        {isComparing && (
                                            <div className="absolute inset-0 z-10">
                                                <div 
                                                    className="absolute inset-0 overflow-hidden"
                                                    style={{ clipPath: `inset(0 ${100 - compareValue}% 0 0)` }}
                                                >
                                                    <img 
                                                        src={state.originalImageUrl} 
                                                        className="w-full h-full object-cover"
                                                        alt="Original"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                </div>
                                                <div 
                                                    className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize flex items-center justify-center"
                                                    style={{ left: `${compareValue}%` }}
                                                >
                                                    <div className="w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center -ml-0.5">
                                                        <Sliders className="w-4 h-4 text-black" />
                                                    </div>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="100" 
                                                    value={compareValue}
                                                    onChange={(e) => setCompareValue(parseInt(e.target.value))}
                                                    className="absolute inset-0 opacity-0 cursor-ew-resize z-20"
                                                />
                                            </div>
                                        )}

                                        {/* Overlay Controls */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-30">
                                            <button 
                                                onClick={() => setIsComparing(!isComparing)}
                                                className={`p-3 rounded-2xl backdrop-blur-md border transition-all ${isComparing ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-black/40 border-white/10 text-white hover:bg-black/60'}`}
                                            >
                                                <Sliders className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-black/60 transition-all">
                                                <Maximize2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <img 
                                        src={state.originalImageUrl} 
                                        className="w-full h-full object-cover"
                                        alt="Original"
                                        referrerPolicy="no-referrer"
                                    />
                                )}

                                {isProcessing && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-40">
                                        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                                        <div className="text-center">
                                            <p className="text-sm font-black text-white uppercase tracking-widest">AI Redesigning Room</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Preserving layout structure...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Style Carousel */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Transformation Style</h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {INTERIOR_STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => handleStyleSelect(style.id)}
                                    disabled={!state.originalImageUrl || isProcessing}
                                    className={`flex-shrink-0 w-48 p-4 rounded-3xl border transition-all text-left group ${state.selectedStyle === style.id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors ${state.selectedStyle === style.id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                                        <Palette className="w-5 h-5" />
                                    </div>
                                    <div className="text-xs font-black text-white uppercase mb-1">{style.name}</div>
                                    <div className="text-[9px] font-black text-emerald-400 mb-1">10 Tokens</div>
                                    <p className="text-[9px] text-slate-500 font-medium leading-tight line-clamp-2">{style.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shoppable Links */}
                    <AnimatePresence>
                        {state.shoppableItems.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="ai-card p-6 bg-white/5 border-white/10"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <ShoppingCart className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Detected Elements & Shop</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {state.shoppableItems.map(item => (
                                        <a 
                                            key={item.id} 
                                            href={item.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-3 bg-black/20 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group"
                                        >
                                            <div className="text-[8px] font-black text-amber-400 uppercase mb-1">{item.category}</div>
                                            <div className="text-[10px] font-bold text-white mb-2 line-clamp-1">{item.label}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-slate-500">{item.price || '$--'}</span>
                                                <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-white transition-colors" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Refinement Sidebar */}
                <div className="space-y-6">
                    <div className="ai-card p-6 bg-white/5 border-white/10 flex flex-col h-[600px]">
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Refinement Chat</h3>
                        </div>

                        <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                            {state.history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                                    <BrainCircuit className="w-12 h-12 text-slate-500" />
                                    <p className="text-[10px] font-bold text-slate-500 uppercase max-w-[160px]">
                                        Ask AI to refine specific elements of the design
                                    </p>
                                </div>
                            ) : (
                                state.history.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${msg.role === 'user' ? 'bg-[#10161B] border border-[#26313A] text-white shadow-md' : 'bg-white/5 text-slate-300 border border-white/5'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="relative">
                            <textarea 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="e.g. Make the lighting warmer and add minimalist furniture..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#8DB8CC]/50 resize-none h-24 placeholder:text-slate-600"
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRefine())}
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                <span className="text-[9px] font-bold text-[#AFC3CF] uppercase tracking-widest font-mono">5 Tokens</span>
                                <button 
                                    onClick={handleRefine}
                                    disabled={!chatInput.trim() || isProcessing || !state.redesignedImageUrl}
                                    className="p-2.5 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 disabled:opacity-20 rounded-xl text-[#050709] transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="ai-card p-6 bg-white/5 border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <Info className="w-4 h-4 text-[#8DB8CC]" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Design Intelligence</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC]" />
                                <span className="text-[10px] font-bold text-slate-400">Layout Preservation Lock</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#AFC3CF]" />
                                <span className="text-[10px] font-bold text-slate-400">Contextual Refinement Memory</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                                <span className="text-[10px] font-bold text-slate-400">Object-Aware Shopping Engine</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteriorStudio;
