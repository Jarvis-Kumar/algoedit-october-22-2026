import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Stage, Layer, Image as KonvaImage, Text as KonvaText, 
    Rect, Group, Transformer 
} from 'react-konva';
import { 
    Plus, Upload, Trash2, Download, Layers, 
    Type, Palette, Layout, Sparkles, BrainCircuit, 
    Maximize, Monitor, Smartphone, Share2, 
    ChevronRight, Save, History, Sliders, 
    Zap, Image as ImageIcon, Wand2, Search,
    RefreshCw, Check, AlertCircle, Info, Move,
    Briefcase
} from 'lucide-react';
import { User, Asset, AspectRatio, OnNavigateType, PreloadedAssetState, BrandStyle } from '../types';
import { PosterAutomationService, PosterLayout, PosterLayer as LayerData } from '../services/PosterAutomationService';
import { AutomationService } from '../services/AutomationService';
import ActionButton from './ActionButton';

interface PosterAutomationStudioProps {
    user: User | null;
    deductTokens: (amount: number, description?: string) => boolean;
    onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
    onNavigate: OnNavigateType;
    preloadedAssetState: PreloadedAssetState | null;
}

const ASPECT_RATIOS: { label: string, value: AspectRatio, icon: any }[] = [
    { label: 'IG Square', value: '1:1', icon: <Smartphone size={12} /> },
    { label: 'YT Thumb', value: '16:9', icon: <Monitor size={12} /> },
    { label: 'IG Story', value: '9:16', icon: <Smartphone size={12} /> },
    { label: 'Standard', value: '4:3', icon: <Monitor size={12} /> }
];

const PosterAutomationStudio: React.FC<PosterAutomationStudioProps> = ({
    user,
    deductTokens,
    onMediaGenerated,
    onNavigate,
    preloadedAssetState
}) => {
    // State
    const [layout, setLayout] = useState<PosterLayout>({
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        layers: []
    });
    const [assets, setAssets] = useState<{ id: string; url: string; type: 'product' | 'logo' | 'human' | 'reference' }[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [prompt, setPrompt] = useState(preloadedAssetState?.prompt || '');
    const [refinementPrompt, setRefinementPrompt] = useState('');
    const [leftTab, setLeftTab] = useState<'product' | 'logo' | 'human' | 'reference' | 'layers'>('product');
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [brandStyles, setBrandStyles] = useState<BrandStyle[]>([]);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setBrandStyles(AutomationService.getBrandStyles());
    }, []);

    const applyBrandStyle = (style: BrandStyle) => {
        // Apply colors and typography to existing layers
        setLayout(prev => ({
            ...prev,
            layers: prev.layers.map(l => {
                if (l.type === 'text') {
                    return {
                        ...l,
                        style: {
                            ...l.style,
                            fill: style.colors[0],
                            fontFamily: style.typography
                        }
                    };
                }
                return l;
            })
        }));
    };

    // Image Cache
    const [imageCache, setImageCache] = useState<Record<string, HTMLImageElement>>({});

    const loadImage = useCallback((url: string) => {
        if (imageCache[url]) return;
        const img = new window.Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            setImageCache(prev => ({ ...prev, [url]: img }));
        };
    }, [imageCache]);

    useEffect(() => {
        layout.layers.forEach(layer => {
            if (layer.type !== 'text') {
                loadImage(layer.content);
            }
        });
    }, [layout.layers, loadImage]);

    // Handle Resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setCanvasSize({ 
                    width: clientWidth || 400, 
                    height: clientHeight || 400 
                });
            }
        };
        
        // Trigger immediately and with a small buffer for tab renders
        updateSize();
        const t1 = setTimeout(updateSize, 100);
        const t2 = setTimeout(updateSize, 400);

        window.addEventListener('resize', updateSize);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    // Handlers
    const handleAddAsset = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo' | 'human' | 'reference') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAssets(prev => [...prev, { id: Math.random().toString(36).substring(7), url, type }]);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) {
            alert("Enter a design concept prompt first.");
            return;
        }
        if (assets.length === 0) {
            alert("Upload at least one asset (product or logo).");
            return;
        }

        if (!deductTokens(20, "AI Poster Generation")) return;

        setIsProcessing(true);
        try {
            const newLayout = await PosterAutomationService.generatePoster(prompt, assets, layout.aspectRatio);
            setLayout(newLayout);
            setSelectedId(null);
        } catch (error) {
            console.error("Selection failed", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRefine = async () => {
        if (!refinementPrompt || !layout.layers.length) return;
        
        setIsProcessing(true);
        try {
            const refined = await PosterAutomationService.refineLayout(layout, refinementPrompt);
            setLayout(refined);
            setRefinementPrompt('');
        } catch (error) {
            console.error("Refine layout failed", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLayerChange = (id: string, updates: Partial<LayerData>) => {
        setLayout(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
        }));
    };

    const handleExport = async () => {
        onMediaGenerated("AI Poster", "image", 1024, "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000");
        alert("Poster exported to your cloud assets!");
    };

    const transformerRef = useRef<any>(null);

    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const stage = transformerRef.current.getStage();
            const selectedNode = stage.findOne('#' + selectedId);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId]);

    // Calculate scale to fit container while maintaining aspect ratio
    const [ratioW, ratioH] = layout.aspectRatio.split(':').map(Number);
    const targetRatio = ratioW / ratioH;
    
    // Fallbacks to prevent division by zero or negative bounds
    const containerW = canvasSize.width || 400;
    const containerH = canvasSize.height || 400;

    let stageWidth = containerW - 32; // small padding inside workspace container
    let stageHeight = stageWidth / targetRatio;
    
    if (stageHeight > (containerH - 32)) {
        stageHeight = containerH - 32;
        stageWidth = stageHeight * targetRatio;
    }

    const scaleX = stageWidth / 100;
    const scaleY = stageHeight / 100;

    return (
        <div className="fixed top-16 left-0 right-0 bottom-0 z-20 bg-[#06060c] flex flex-col overflow-hidden animate-in fade-in duration-300">
            
            {/* Top Compact Menu Bar (Aspect ratios, latency status) */}
            <div className="h-11 border-b border-white/5 bg-black/40 flex items-center justify-between px-5 flex-shrink-0">
                <div className="flex items-center gap-1">
                    {ASPECT_RATIOS.map(ratio => (
                        <button 
                            key={ratio.value}
                            onClick={() => setLayout(prev => ({ ...prev, aspectRatio: ratio.value }))}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                                layout.aspectRatio === ratio.value 
                                ? 'bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.15)] scale-102' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {ratio.icon}
                            <span>{ratio.label}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 font-mono uppercase tracking-widest">
                        <Zap size={11} className="text-yellow-400" />
                        <span>12ms processing cycle</span>
                    </div>
                </div>
            </div>

            {/* Core Panels Grid: Left, Center, Right Workspace */}
            <div className="flex-1 w-full flex overflow-hidden min-h-0 bg-[#030307]/20 relative">
                
                {/* Left Panel: Integrated Assets & Layers Tab Layout */}
                <div className="w-72 border-r border-white/5 bg-black/30 flex flex-col h-full overflow-hidden flex-shrink-0">
                    <div className="p-3 border-b border-white/5 bg-white/[0.01]">
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {(['product', 'logo', 'human', 'reference', 'layers'] as const).map(tab => {
                                const isActive = leftTab === tab;
                                let icon = <Plus size={11} />;
                                let label = tab === 'product' ? 'Product' : tab === 'logo' ? 'Logo' : tab === 'human' ? 'Human' : tab === 'reference' ? 'Refs' : 'Layers';
                                if (tab === 'product') icon = <Briefcase size={11} />;
                                if (tab === 'logo') icon = <Palette size={11} />;
                                if (tab === 'human') icon = <Sparkles size={11} />;
                                if (tab === 'reference') icon = <ImageIcon size={11} />;
                                if (tab === 'layers') icon = <Layers size={11} />;
                                return (
                                    <button 
                                        key={tab}
                                        onClick={() => setLeftTab(tab)}
                                        className={`flex items-center gap-1 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-all border ${
                                            isActive 
                                            ? 'bg-[#8DB8CC]/15 text-white border-[#8DB8CC]/40 shadow-[0_0_12px_rgba(141,184,204,0.2)]' 
                                            : 'text-slate-500 border-transparent hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {icon}
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                        {leftTab !== 'layers' ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Upload {leftTab}s</span>
                                        <span className="text-[7px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">Supports PNG, JPG</span>
                                    </div>
                                    <label className="cursor-pointer">
                                        <input type="file" className="hidden" onChange={(e) => handleAddAsset(e, leftTab)} />
                                        <div className="flex items-center gap-1 p-2 bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF]/40 rounded-lg text-[#8DB8CC] transition-colors text-[9px] font-black uppercase tracking-wider">
                                            <Plus size={11} /> ADD
                                        </div>
                                    </label>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {assets.filter(a => a.type === leftTab).map(asset => (
                                        <div key={asset.id} className="relative aspect-square rounded-xl border border-white/10 overflow-hidden group">
                                            <img src={asset.url} alt={leftTab} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                                                className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {assets.filter(a => a.type === leftTab).length === 0 && (
                                        <div className="col-span-full py-8 border border-dashed border-white/5 bg-black/10 rounded-xl text-center opacity-40">
                                            <Upload size={16} className="mx-auto mb-1.5 text-slate-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">No {leftTab}s Up</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {layout.layers.map(layer => (
                                    <div 
                                        key={layer.id}
                                        onClick={() => setSelectedId(layer.id)}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                            selectedId === layer.id 
                                            ? 'bg-[#8DB8CC]/15 border-[#8DB8CC]/40 shadow-[0_0_12px_rgba(141,184,204,0.2)]' 
                                            : 'bg-white/5 border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden">
                                                {layer.type === 'text' ? <Type size={11} className="text-cyan-400" /> : <img src={layer.content} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-extrabold text-white uppercase tracking-wider">{layer.type}</div>
                                                <div className="text-[7.5px] text-slate-500 font-mono">Z: {layer.zIndex} | O: {layer.opacity}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLayout(prev => ({ ...prev, layers: prev.layers.filter(l => l.id !== layer.id) }));
                                                if (selectedId === layer.id) setSelectedId(null);
                                            }}
                                            className="p-1 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded transition-colors"
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                ))}
                                {layout.layers.length === 0 && (
                                    <div className="py-12 bg-black/10 rounded-xl border border-dashed border-white/5 text-center opacity-30">
                                        <Layers size={20} className="mx-auto mb-2 text-slate-500" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">No layers present</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Panel: Focused Interactive Preview Area */}
                <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-[#020205]">
                    <div 
                        ref={containerRef}
                        className="flex-1 w-full relative overflow-hidden flex items-center justify-center pattern-bg p-4"
                    >
                        <div 
                            className="bg-[#0b0b12] relative rounded-2xl overflow-hidden transition-all duration-300"
                            style={{ 
                                width: stageWidth, 
                                height: stageHeight,
                                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
                                backgroundSize: '16px 16px',
                                border: '1px solid rgba(0, 198, 255, 0.25)',
                                boxShadow: '0 0 40px rgba(0, 198, 255, 0.12)'
                            }}
                        >
                            <Stage 
                                width={stageWidth} 
                                height={stageHeight}
                                onMouseDown={(e) => {
                                    const clickedOnEmpty = e.target === e.target.getStage();
                                    if (clickedOnEmpty) {
                                        setSelectedId(null);
                                    }
                                }}
                            >
                                <Layer>
                                    {layout.layers.sort((a, b) => a.zIndex - b.zIndex).map((layer) => (
                                        <React.Fragment key={layer.id}>
                                            {layer.type === 'image' || layer.type === 'logo' || layer.type === 'background' ? (
                                                <KonvaImage
                                                    id={layer.id}
                                                    image={imageCache[layer.content]}
                                                    x={(layer.x / 100) * stageWidth}
                                                    y={(layer.y / 100) * stageHeight}
                                                    width={(layer.width / 100) * stageWidth}
                                                    height={(layer.height / 100) * stageHeight}
                                                    rotation={layer.rotation}
                                                    opacity={layer.opacity}
                                                    draggable
                                                    onClick={() => setSelectedId(layer.id)}
                                                    onDragEnd={(e) => {
                                                        const newX = (e.target.x() / stageWidth) * 100;
                                                        const newY = (e.target.y() / stageHeight) * 100;
                                                        handleLayerChange(layer.id, { x: newX, y: newY });
                                                    }}
                                                    onTransformEnd={(e) => {
                                                        const node = e.target;
                                                        const newWidth = (node.width() * node.scaleX() / stageWidth) * 100;
                                                        const newHeight = (node.height() * node.scaleY() / stageHeight) * 100;
                                                        node.scaleX(1);
                                                        node.scaleY(1);
                                                        handleLayerChange(layer.id, { 
                                                            width: newWidth, 
                                                            height: newHeight,
                                                            rotation: node.rotation()
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <KonvaText
                                                    id={layer.id}
                                                    text={layer.content}
                                                    x={(layer.x / 100) * stageWidth}
                                                    y={(layer.y / 100) * stageHeight}
                                                    fontSize={layer.style?.fontSize ? (layer.style.fontSize / 100) * stageHeight : 40}
                                                    fontFamily={layer.style?.fontFamily || 'Inter'}
                                                    fontStyle={layer.style?.fontWeight === '900' ? '900' : 'bold'}
                                                    fill={layer.style?.fill || '#ffffff'}
                                                    align={layer.style?.textAlign || 'left'}
                                                    width={(layer.width / 100) * stageWidth}
                                                    draggable
                                                    onClick={() => setSelectedId(layer.id)}
                                                    onDragEnd={(e) => {
                                                        const newX = (e.target.x() / stageWidth) * 100;
                                                        const newY = (e.target.y() / stageHeight) * 100;
                                                        handleLayerChange(layer.id, { x: newX, y: newY });
                                                    }}
                                                />
                                            )}
                                            {selectedId === layer.id && (
                                                <Transformer 
                                                    ref={transformerRef}
                                                    anchorSize={6}
                                                    borderStroke="#06b6d4"
                                                    anchorStroke="#06b6d4"
                                                    anchorCornerRadius={2}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Layer>
                            </Stage>
                        </div>

                        {/* Floating Stage Controls */}
                        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
                            <button className="w-8.5 h-8.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                                <Plus size={15} />
                            </button>
                            <button className="w-8.5 h-8.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                                <Search size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Scrollable Design Refinement & Suggestions Area */}
                <div className="w-72 border-l border-white/5 bg-black/30 flex flex-col h-full overflow-hidden flex-shrink-0">
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-3.5 space-y-4">
                        
                        {/* Design Intelligence Area */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
                                <BrainCircuit className="w-4 h-4 text-[#8DB8CC]" />
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-white">Design Intelligence</h3>
                            </div>
                            
                            {/* Brand Style Syncer */}
                            <div className="space-y-1.5">
                                 <div className="flex items-center justify-between">
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Briefcase size={11} className="text-[#8DB8CC]" />
                                        Brand Sync
                                    </label>
                                 </div>
                                 <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                                    {brandStyles.map(style => (
                                        <button 
                                            key={style.id}
                                            onClick={() => applyBrandStyle(style)}
                                            className="flex-shrink-0 px-2.5 py-1.5 bg-[#10161B] border border-[#26313A] rounded-lg hover:border-[#8DB8CC]/40 transition-all text-left cursor-pointer"
                                        >
                                            <div className="text-[8px] font-bold text-white mb-0.5 uppercase tracking-tighter">{style.name}</div>
                                            <div className="flex gap-0.5">
                                                {style.colors.map(c => <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />)}
                                            </div>
                                        </button>
                                    ))}
                                 </div>
                            </div>
                        </div>

                        {/* Selected Layer Parameters */}
                        {selectedId ? (
                             <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-2.5 bg-white/[0.02] border border-white/10 rounded-xl space-y-2.5">
                                    <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Selector</h4>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[7.5px] font-black text-slate-500 uppercase">
                                            <span>Opacity</span>
                                            <span>{Math.round((layout.layers.find(l => l.id === selectedId)?.opacity || 1) * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.1"
                                            value={layout.layers.find(l => l.id === selectedId)?.opacity || 1}
                                            onChange={(e) => handleLayerChange(selectedId, { opacity: parseFloat(e.target.value) })}
                                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button 
                                            onClick={() => {
                                                const layer = layout.layers.find(l => l.id === selectedId);
                                                if (layer) handleLayerChange(selectedId, { zIndex: layer.zIndex + 1 });
                                            }}
                                            className="p-2 bg-black/40 rounded-lg border border-white/5 text-[8px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1"
                                        >
                                            <Layers size={10} /> UP
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const layer = layout.layers.find(l => l.id === selectedId);
                                                if (layer) handleLayerChange(selectedId, { zIndex: Math.max(0, layer.zIndex - 1) });
                                            }}
                                            className="p-2 bg-black/40 rounded-lg border border-white/5 text-[8px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1"
                                        >
                                            <Layers size={10} /> DOWN
                                        </button>
                                    </div>
                                </div>
                             </div>
                        ) : (
                            <div className="py-6 text-center bg-black/20 rounded-xl border border-dashed border-white/5">
                                <Move className="w-6 h-6 mx-auto text-slate-700 mb-1.5" />
                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Select layer for direct controls</p>
                            </div>
                        )}

                        {/* Recursive Refinement Textarea */}
                        <div className="space-y-2.5 pt-3 border-t border-white/5">
                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recursive Refinement</h4>
                            <div className="space-y-1.5">
                                <textarea 
                                    value={refinementPrompt}
                                    onChange={(e) => setRefinementPrompt(e.target.value)}
                                    placeholder="e.g. 'Align product slightly left and adjust temperature'..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-[9px] font-medium text-white outline-none focus:ring-1 focus:ring-[#8DB8CC]/50 h-16 resize-none placeholder:text-slate-600"
                                />
                                <button 
                                    onClick={handleRefine}
                                    disabled={!refinementPrompt || isProcessing}
                                    className="w-full py-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] rounded-xl text-[8px] font-black uppercase tracking-wider transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                                >
                                    Adjust Synthesis
                                </button>
                            </div>
                        </div>

                        {/* Intelligent Suggestions block */}
                        <div className="space-y-2">
                             <div className="flex items-center gap-1.5 text-[8px] font-black text-[#8DB8CC] uppercase tracking-widest">
                                <ImageIcon size={10} className="text-[#8DB8CC]" />
                                Neural Suggestions
                             </div>
                             <div className="p-2.5 bg-[#10161B] border border-[#26313A] rounded-xl">
                                <p className="text-[8px] text-[#AFC3CF] leading-relaxed font-semibold">
                                    "Background colors clash slightly with product layer. Apply auto contrast overlay?"
                                </p>
                             </div>
                        </div>

                        {/* High Res Export options */}
                        <div className="space-y-2.5 pt-3 border-t border-white/5">
                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Export Formats</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                                {['High Res PNG', 'Vector PDF'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={handleExport}
                                        className="p-2 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between group hover:border-[#AFC3CF]/40 transition-all text-left cursor-pointer"
                                    >
                                        <span className="text-[9px] font-extrabold text-slate-400 group-hover:text-white uppercase tracking-wider">{opt}</span>
                                        <Download size={11} className="text-[#8DB8CC]" />
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Persistent Fixed Bottom Dock (Prompts + Primary generation buttons) */}
            <div className="border-t border-white/5 bg-black/50 p-4.5 flex flex-col md:flex-row items-center gap-4.5 flex-shrink-0 relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8DB8CC]/40 to-transparent" />
                
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 font-mono tracking-widest mr-2 select-none">
                    <Sparkles size={13} className="text-[#8DB8CC] animate-pulse" />
                    <span>POSTER FORGE CORE</span>
                </div>
                
                <div className="flex-1 w-full relative">
                    <input 
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Neural Design Instructions... e.g., 'Modern abstract retro running shoe ad with energetic shapes'"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-xs font-black text-white outline-none focus:ring-1 focus:ring-[#8DB8CC]/50 uppercase tracking-widest placeholder:text-slate-700"
                    />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <ActionButton 
                        onClick={handleGenerate}
                        isLoading={isProcessing}
                        text="Initialize Sequence"
                        className="flex-1 md:flex-initial !py-3.5 px-6 text-[10px] uppercase font-black"
                        icon={<Zap className="w-3.5 h-3.5 mr-2" />}
                    />
                    <ActionButton 
                        onClick={handleExport}
                        text="Finalize Synthesis"
                        className="flex-1 md:flex-initial !py-3.5 px-6 text-[10px] uppercase font-black !bg-gradient-to-r !from-white !via-[#E8F0F4] !to-[#AFC3CF] !text-[#050709] !shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        icon={<Save className="w-3.5 h-3.5 mr-2 !text-[#050709]" />}
                    />
                </div>
            </div>

        </div>
    );
};

export default PosterAutomationStudio;
