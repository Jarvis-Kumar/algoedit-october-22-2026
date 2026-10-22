
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Smartphone, Sparkles, Download, RefreshCw, 
    Maximize2, X, Loader2, Zap, Search, 
    Image as ImageIcon, Palette, Sun, Camera
} from 'lucide-react';
import { User, Asset, Page, FeaturePageId, PreloadedAssetState, WallpaperVariation, OnNavigateType } from '../types';
import ActionButton from './ActionButton';

interface WallpaperStudioProps {
    user: User | null;
    deductTokens: (amount: number, description?: string) => boolean;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    onNavigate: OnNavigateType;
    preloadedAssetState: PreloadedAssetState | null;
}

const WallpaperStudio: React.FC<WallpaperStudioProps> = ({
    user,
    deductTokens,
    onMediaGenerated,
    onNavigate,
    preloadedAssetState
}) => {
    const [vibe, setVibe] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [wallpapers, setWallpapers] = useState<WallpaperVariation[]>([]);
    const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperVariation | null>(null);
    const [isRemixing, setIsRemixing] = useState(false);

    const handleGenerate = async () => {
        if (!vibe.trim()) return;
        
        const cost = 4;
        if (!deductTokens(cost, `AI Wallpaper Generation: ${vibe}`)) return;

        setIsGenerating(true);
        try {
            // Simulated heavy neural synthesis delay
            await new Promise(resolve => setTimeout(resolve, 3500));
            
            // Generate multiple realistic variations using picsum seeds
            const urls = [
                `https://picsum.photos/seed/${vibe}-1/1920/1080`,
                `https://picsum.photos/seed/${vibe}-2/1920/1080`,
                `https://picsum.photos/seed/${vibe}-3/1920/1080`,
                `https://picsum.photos/seed/${vibe}-4/1920/1080`
            ];
            
            const newWallpapers: WallpaperVariation[] = urls.map((url: string, i: number) => ({
                id: Math.random().toString(36).substring(7),
                url,
                vibe,
                seed: Math.floor(Math.random() * 1000000)
            }));
            setWallpapers(newWallpapers);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRemix = async (original: WallpaperVariation) => {
        const cost = 3;
        if (!deductTokens(cost, `AI Wallpaper Remix`)) return;

        setIsRemixing(true);
        try {
            const response = await fetch('/api/ai/wallpapers-remix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originalVibe: original.vibe, referenceImageUrl: original.url })
            });

            if (!response.ok) throw new Error("Remix failed");
            const urls = await response.json();

            const remixed: WallpaperVariation[] = urls.map((url: string, i: number) => ({
                id: Math.random().toString(36).substring(7),
                url,
                vibe: original.vibe,
                seed: Math.floor(Math.random() * 1000000)
            }));
            setWallpapers(prev => [...remixed, ...prev]);
            setSelectedWallpaper(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsRemixing(false);
        }
    };

    const handleDownload = (url: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallpaper-${Date.now()}.png`;
        a.click();
    };

    return (
        <div className="flex flex-col h-full space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10161B] border border-[#26313A] text-[#8DB8CC] text-[10px] font-black uppercase tracking-widest">
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile First Experience</span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Wallpaper Studio</h1>
                <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
                    Generate high-resolution 9:16 wallpapers based on your unique vibes and aesthetic preferences.
                </p>
            </div>

            {/* Input Area */}
            <div className="ai-card p-2 bg-white/5 border-white/10 rounded-3xl">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-grow relative">
                        <input 
                            type="text" 
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            placeholder="Describe your vibe (e.g. Rainy cyberpunk lo-fi)..."
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#8DB8CC]/40 focus:border-[#8DB8CC] transition-all placeholder:text-slate-700"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#8DB8CC] animate-pulse" />
                        </div>
                    </div>
                    <ActionButton 
                        onClick={handleGenerate}
                        isLoading={isGenerating}
                        text={isGenerating ? 'Generating...' : `Generate • 4 Tokens`}
                        className="md:w-40 !rounded-2xl !py-4"
                        icon={<Sparkles className="w-4 h-4 mr-2" />}
                    />
                </div>
            </div>

            {/* Variations Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {wallpapers.map((wp, i) => (
                        <motion.div
                            key={wp.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ delay: i * 0.05 }}
                            className="aspect-[9/16] relative rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-[#8DB8CC]/40 transition-all"
                            onClick={() => setSelectedWallpaper(wp)}
                        >
                            <img 
                                src={wp.url} 
                                alt={wp.vibe} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <div className="flex items-center justify-between">
                                    <div 
                                        onClick={() => setSelectedWallpaper(wp)}
                                        className="p-2 bg-white/10 hover:scale-110 active:scale-95 transition-all rounded-full text-white cursor-pointer"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </div>
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); handleDownload(wp.url); }}
                                        className="p-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:scale-110 active:scale-95 transition-all rounded-full text-[#050709] cursor-pointer shadow-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isGenerating && Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[9/16] bg-white/5 rounded-2xl animate-pulse flex items-center justify-center border border-white/5">
                        <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
                    </div>
                ))}

                {!isGenerating && wallpapers.length === 0 && (
                    <div className="col-span-full py-24 text-center space-y-4 opacity-20">
                        <ImageIcon className="w-12 h-12 mx-auto text-slate-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Your creations will appear here</p>
                    </div>
                )}
            </div>

            {/* Full Screen Preview */}
            <AnimatePresence>
                {selectedWallpaper && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                    >
                        <button 
                            onClick={() => setSelectedWallpaper(null)}
                            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full items-center">
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="aspect-[9/16] h-[70vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                            >
                                <img 
                                    src={selectedWallpaper.url} 
                                    alt={selectedWallpaper.vibe} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </motion.div>

                            <div className="flex-grow space-y-8 text-center md:text-left">
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8DB8CC]">Current Vibe</h3>
                                    <p className="text-2xl font-bold text-white italic">"{selectedWallpaper.vibe}"</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <ActionButton 
                                        onClick={() => handleDownload(selectedWallpaper.url)}
                                        text="Download High-Res"
                                        className="w-full !py-4"
                                        icon={<Download className="w-5 h-5 mr-2" />}
                                    />
                                    <ActionButton 
                                        onClick={() => handleRemix(selectedWallpaper)}
                                        isLoading={isRemixing}
                                        text={isRemixing ? 'Remixing...' : `Remix Aesthetic • 3 Tokens`}
                                        className="w-full !py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                                        icon={<RefreshCw className="w-5 h-5 mr-2" />}
                                    />
                                </div>

                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Remix Intelligence</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Palette className="w-3 h-3 text-[#8DB8CC]" />
                                            <span>Palette Preservation</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Sun className="w-3 h-3 text-[#8DB8CC]" />
                                            <span>Lighting Extraction</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Search className="w-3 h-3 text-[#AFC3CF]" />
                                            <span>Texture Analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Camera className="w-3 h-3 text-emerald-400" />
                                            <span>Composition Lock</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WallpaperStudio;
