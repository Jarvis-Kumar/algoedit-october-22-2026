import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Layers, Sparkles, BrainCircuit, Maximize, Cpu, Scan, 
  Settings, Save, Play, Film, Image as ImageIcon, Copy, Check, Download, 
  Trash2, RefreshCw, ZoomIn, Eye, EyeOff, Sliders, Palette, Zap, Type, 
  Clock, ArrowRight, Share2, Info, ChevronRight, Gauge
} from 'lucide-react';
import { User, Asset } from '../types';
import { NeuralEditingService, NeuralMetadata, NeuralLayer } from '../services/neuralEditingService';
import ActionButton from './ActionButton';

interface NeuralEditingEngineProps {
  user: User | null;
  deductTokens: (amount: number, description?: string) => boolean;
  onMediaGenerated: (name: string, type: Asset['type'], size: number, url: string) => void;
}

// Sample preloaded assets for immediate user exploration
const SAMPLE_MEDIA = [
  {
    name: 'Cyberpunk Workspace',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
    description: 'An immersive gaming desk setup with glowing cyan/neon tubes and warm backlight accenting.'
  },
  {
    name: 'Metropolitan Neon Drive',
    type: 'video' as const,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-under-neon-signboards-at-night-42289-large.mp4',
    description: 'Cinematic night drive looking down towering skyscrapers flashing pink and yellow holographic billboards.'
  },
  {
    name: 'Futuristic Tech Model',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
    description: 'A close-up human model wear futuristic smart-monocular sunglasses on gold studio backing.'
  }
];

const STAGE_CONFIGS = [
  { id: 'scene', label: 'Scene Understanding', desc: 'Running Florence-2, BLIP-2 & LLaVA' },
  { id: 'object', label: 'Object Mapping', desc: 'YOLOv8 & Detectron2 scanners' },
  { id: 'segment', label: 'Layer Detection', desc: 'Segment Anything 2 (SAM2) active' },
  { id: 'depth', label: 'Depth Estimation', desc: 'Depth Anything v2 neural maps' },
  { id: 'motion', label: 'Motion Vector tracking', desc: 'Optical Flow & Frame transition' },
  { id: 'style', label: 'Style Embeddings & CLIP', desc: 'SigLIP / CLIP classification' },
  { id: 'ocr', label: 'OCR & Typo Spotting', desc: 'PaddleOCR geometric readout' },
  { id: 'audit', label: 'Lens & Dispersion Sweep', desc: 'Color fringe and lighting curves' },
  { id: 'preset', label: 'Preset Compilation', desc: 'Aesthetic lut generation' },
  { id: 'compile', label: 'Neural Structure compile', desc: 'Packaging JSON schema output' }
];

const NeuralEditingEngine: React.FC<NeuralEditingEngineProps> = ({
  user,
  deductTokens,
  onMediaGenerated
}) => {
  // Input Media states
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>(SAMPLE_MEDIA[0].url);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaName, setMediaName] = useState<string>(SAMPLE_MEDIA[0].name);

  // Orchestrator states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  // Loaded metadata output
  const [metadata, setMetadata] = useState<NeuralMetadata | null>(null);
  
  // Interactive UI configurations
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
  const [toggleLayerBoxes, setToggleLayerBoxes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedPresets, setSavedPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('neural_style_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reconstructed Image generation state
  const [reconstructedImage, setReconstructedImage] = useState<string | null>(null);
  const [isReconstructing, setIsReconstructing] = useState(false);

  // File drag-over states
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default preview load
  useEffect(() => {
    triggerPreviewPreset(SAMPLE_MEDIA[0]);
  }, []);

  const triggerPreviewPreset = (preset: typeof SAMPLE_MEDIA[0]) => {
    setMediaType(preset.type);
    setMediaUrl(preset.url);
    setMediaName(preset.name);
    setMediaFile(null);
    setMetadata(null);
    setReconstructedImage(null);
    setSelectedLayerId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Unsupported file type. Please upload a valid image or video (MP4, PNG, JPG, WEBP).');
      return;
    }

    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaName(file.name);
    setSelectedLayerId(null);
    setMetadata(null);
    setReconstructedImage(null);

    const objectUrl = URL.createObjectURL(file);
    setMediaUrl(objectUrl);
  };

  const startAnalysis = async () => {
    if (!deductTokens(15, 'Neural Style Analysis & Auto-Extraction')) {
      return;
    }

    setIsProcessing(true);
    setProcessingLogs([]);
    setCurrentStageIndex(0);
    setProgressPercent(5);
    setMetadata(null);
    setReconstructedImage(null);

    try {
      const result = await NeuralEditingService.analyzeMedia(
        mediaUrl,
        mediaType,
        mediaName,
        (stage, percent, log) => {
          setProgressPercent(percent);
          setProcessingStatus(`${stage}...`);
          setProcessingLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
          
          // Move Stage Configuration Index
          const stageIdx = STAGE_CONFIGS.findIndex(c => stage.toLowerCase().includes(c.id) || c.label.toLowerCase().includes(stage.toLowerCase()));
          if (stageIdx !== -1) {
            setCurrentStageIndex(stageIdx);
          }
        }
      );

      setMetadata(result);
      setProcessingStatus('Completed Successfully!');
      setProcessingLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Success: Neural structure assembled.`]);
    } catch (e: any) {
      setProcessingLogs(prev => [...prev, `[ERROR] Analysis failed: ${e.message}`]);
      setProcessingStatus('Extraction Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const runCinematicReconstruction = async () => {
    if (!metadata) return;
    if (!deductTokens(10, 'Neural Model Rendering with Flux Pro')) return;

    setIsReconstructing(true);
    try {
      const resultImageUrl = await NeuralEditingService.reconstructStyle(
        metadata.reconstructedPrompt,
        mediaType === 'image' ? '1:1' : '16:9'
      );
      setReconstructedImage(resultImageUrl);
      onMediaGenerated(
        `Reconstructed ${mediaName}`,
        'image',
        1024,
        resultImageUrl
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsReconstructing(false);
    }
  };

  // Preset style storing
  const savePresetToCollection = () => {
    if (!metadata) return;
    const newPreset = {
      id: Math.random().toString(36).substring(7),
      name: `Preset: ${metadata.styleFingerprint.cinematicVibe}`,
      palette: metadata.styleFingerprint.colorPalette,
      lighting: metadata.styleFingerprint.lightingMood,
      vintageGrain: metadata.styleFingerprint.grainIntensity,
      created: new Date().toLocaleDateString()
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    localStorage.setItem('neural_style_presets', JSON.stringify(updated));
    alert('Style fingerprint successfully saved as a reusable design preset!');
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('neural_style_presets', JSON.stringify(updated));
  };

  const copyMetadata = () => {
    if (!metadata) return;
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMetadataJson = () => {
    if (!metadata) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metadata, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `neural-metadata-${metadata.fileName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-500">
      
      {/* Intro Header Section with Feature Concept Explanation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-br from-[#0A0E12] to-[#10161B] p-6 lg:p-8 rounded-3xl border border-[#26313A] shadow-2xl relative overflow-hidden">
        {/* Glow backdrop particles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8DB8CC]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/[0.02] blur-3xl pointer-events-none rounded-full" />

        <div className="space-y-3 z-10 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-[#10161B] border border-[#26313A] text-[#AFC3CF] text-[10px] font-black uppercase tracking-wider rounded-full">
              Intelligence Co-Processor
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DB8CC] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8DB8CC]"></span>
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
            AI Neural Editing Engine <span className="text-gradient bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] font-extrabold font-mono text-sm align-super">V2.6</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Next-generation <strong>Media Understanding Platform</strong>. Transform unstructured videos and images into intelligent, structured layer arrays. Automatically reverse-engineer camera angles, lighting temperature, focal subjects, OCR text, and stylistic lookbooks to recreate studio aesthetics in seconds.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10 w-full lg:w-auto">
          {SAMPLE_MEDIA.map((item, idx) => (
            <button
              key={idx}
              onClick={() => triggerPreviewPreset(item)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${mediaName === item.name ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
            >
              {item.type === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}
              <span>Demo: {item.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SOURCE ASSENT PANEL (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* File Upload Zone / Core Interactive Canvas */}
          <div className="ai-card p-5 bg-[#0e0c15] border-white/5 rounded-3xl shadow-xl flex flex-col relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Scan className="w-5 h-5 text-[#8DB8CC] animate-pulse" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Active Media Studio</h3>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">{mediaName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setToggleLayerBoxes(!toggleLayerBoxes)}
                  className={`p-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${toggleLayerBoxes ? 'bg-[#10161B] text-[#8DB8CC] border-[#8DB8CC]/40 shadow-sm' : 'bg-white/5 text-slate-500 border-white/5 hover:text-white'}`}
                  title="Toggle AI bounding segment overlays"
                >
                  <Layers size={13} />
                  <span>Segment Outlines</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-slate-400 hover:text-white transition-all duration-200"
                  title="Upload image or video"
                >
                  <Upload size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Container for file drop and interactive canvas rendering */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative aspect-video rounded-2xl overflow-hidden bg-black/50 border flex items-center justify-center transition-all duration-300 ${isDragOver ? 'border-dashed border-violet-500 bg-violet-600/10' : 'border-white/5'}`}
            >
              {/* Actual Video or Image File Preview */}
              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt={mediaName}
                  className="w-full h-full object-contain select-none pointer-events-none"
                />
              ) : (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  controls
                  playsInline
                  className="w-full h-full object-contain select-none"
                />
              )}

              {/* Dynamic SAM/YOLO Bounding Box layer overlays */}
              {toggleLayerBoxes && metadata && (
                <div className="absolute inset-0 pointer-events-none select-none z-10">
                  {metadata.layers.map((layer) => {
                    const isSelected = selectedLayerId === layer.id;
                    const isHovered = hoveredLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        className={`absolute border transition-all duration-300 ${isSelected ? 'border-[#8DB8CC] bg-[#8DB8CC]/10 shadow-[0_0_15px_rgba(141,184,204,0.3)] z-30' : isHovered ? 'border-[#AFC3CF] bg-white/5 shadow z-20' : 'border-white/20'}`}
                        style={{
                          left: `${layer.boundingBox.x}%`,
                          top: `${layer.boundingBox.y}%`,
                          width: `${layer.boundingBox.width}%`,
                          height: `${layer.boundingBox.height}%`
                        }}
                      >
                        {/* Interactive floating chip labels with confidence */}
                        <div className={`absolute top-0 left-0 -translate-y-full transform px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow ${isSelected ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] opacity-100 font-black' : isHovered ? 'bg-[#10161B] text-white border border-[#26313A] opacity-100' : 'bg-slate-900 border border-white/10 text-slate-300 opacity-50'}`}>
                          <Scan size={8} />
                          <span>{layer.name}</span>
                          <span>{Math.round(layer.confidence * 100)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Seamless Drag Drop instructions overlay when no metadata compiled */}
              {!metadata && !isProcessing && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#8DB8CC] flex items-center gap-1.5">
                      <Cpu size={11} /> Ready to Process
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                      Drag / drop your personal asset file here, or click the upload icon above. Press "Analyze Media Strategy" below to trigger the 10-stage AI model pipeline.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress HUD overlay during model loading */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="relative w-24 h-24 mb-6">
                      {/* Radiating visual neural network ring animations */}
                      <div className="absolute inset-0 rounded-full border border-dashed border-[#8DB8CC]/20 animate-spin" style={{ animationDuration: '40s' }} />
                      <div className="absolute -inset-2 rounded-full border border-[#8DB8CC]/30 animate-spin" style={{ animationDuration: '12s' }} />
                      <div className="absolute inset-4 rounded-full bg-[#10161B] border border-[#26313A] flex items-center justify-center shadow-[0_0_20px_rgba(141,184,204,0.25)]">
                        <BrainCircuit className="w-8 h-8 text-[#8DB8CC] animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <div className="text-[10px] font-black uppercase text-[#8DB8CC] tracking-widest">{processingStatus}</div>
                      <div className="text-[9px] font-bold font-mono text-slate-500 uppercase">{progressPercent}% Completed</div>
                      
                      {/* Loading block bar */}
                      <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-white via-[#8DB8CC] to-[#AFC3CF]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions Row to Start Process */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Info size={13} className="text-slate-600" />
                <span>Token calculation cost: 15 neural tokens per pass</span>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={startAnalysis}
                  isLoading={isProcessing}
                  text="Analyze Media Strategy"
                  icon={<BrainCircuit className="w-4 h-4 mr-2" />}
                  className="!px-7 !py-3.5 text-xs tracking-wider font-extrabold uppercase"
                />
              </div>
            </div>
          </div>

          {/* AI-Generated Layer Segments List & Timeline Inspector */}
          {metadata && (
            <div className="space-y-6">
              
              {/* Intelligent Segment Layer Panel */}
              <div className="ai-card p-5 bg-[#10161B] border-[#26313A] rounded-3xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#8DB8CC]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Segmented Layers (SAM / YOLO)</h3>
                  </div>
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-[#8DB8CC]/10 text-[#AFC3CF] rounded border border-[#8DB8CC]/20 tracking-widest">
                    {metadata.layers.length} isolated tracks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {metadata.layers.map((layer) => {
                    const isSelected = selectedLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        onMouseEnter={() => setHoveredLayerId(layer.id)}
                        onMouseLeave={() => setHoveredLayerId(null)}
                        onClick={() => setSelectedLayerId(isSelected ? null : layer.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-3.5 relative overflow-hidden group ${isSelected ? 'bg-[#10161B] border-[#8DB8CC] shadow-[0_0_15px_rgba(141,184,204,0.2)]' : 'bg-[#0A0E12] border-[#26313A] hover:border-[#AFC3CF]/40'}`}
                      >
                        {/* Colored border strip depicting dominant color parsed */}
                        <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: layer.dominantColor }} />

                        <div className={`p-2.5 rounded-xl border flex items-center justify-center ${isSelected ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] border-transparent text-[#050709]' : 'bg-black/40 border-[#26313A] text-slate-500 group-hover:text-white'}`}>
                          {layer.type === 'human' ? <Cpu size={14} /> : layer.type === 'text' ? <Type size={14} /> : <Scan size={14} />}
                        </div>

                        <div className="space-y-1 text-left flex-grow">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-tight line-clamp-1">{layer.name}</span>
                            <span className="text-[8px] font-mono font-bold text-slate-400">c: {Math.round(layer.confidence * 100)}%</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] font-black text-slate-400 tracking-widest uppercase">Depth: {layer.depth}</span>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.dominantColor }} />
                              <span className="font-mono text-[7px] font-bold text-slate-500 uppercase">{layer.dominantColor}</span>
                            </div>
                          </div>

                          <p className="text-[8px] text-slate-400 leading-relaxed pt-1.5 border-t border-white/5 font-semibold">
                            💡 {layer.suggestedAction}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Timeline Section for Videos / Frame-by-Frame Inspector */}
              {metadata.timelineAnalysis && (
                <div className="ai-card p-5 bg-[#10161B] border-[#26313A] rounded-3xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                    <Clock className="w-4 h-4 text-[#8DB8CC]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Neural Timeline breakdown</h3>
                  </div>

                  <div className="space-y-3">
                    {metadata.timelineAnalysis.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-stretch group">
                        {/* Time label and dot indicator */}
                        <div className="w-16 flex-shrink-0 text-right">
                          <div className="font-mono text-[9px] font-bold text-[#8DB8CC]">{item.timeCode}</div>
                          <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Offset</div>
                        </div>

                        {/* Tracker line node */}
                        <div className="flex flex-col items-center h-full relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#8DB8CC]/20 border border-[#8DB8CC] flex items-center justify-center group-hover:scale-125 transition-transform">
                            <div className="w-1 h-1 rounded-full bg-[#8DB8CC]" />
                          </div>
                          {idx !== metadata.timelineAnalysis!.length - 1 && (
                            <div className="w-0.5 flex-grow bg-gradient-to-b from-[#8DB8CC]/40 to-transparent my-1 self-center" />
                          )}
                        </div>

                        {/* Breakdown info panel */}
                        <div className="flex-grow p-3 bg-white/5 border border-white/5 rounded-2xl text-left space-y-1.5 group-hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-white uppercase">{item.sceneName}</h4>
                            <span className="text-[8px] font-mono text-slate-400">Motion index: {Math.round(item.motionScore * 100)}%</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[8px] text-slate-400 font-semibold">Lighting: {item.lightingStyle}</span>
                            <span className="text-slate-700 font-mono text-[8px] font-bold">•</span>
                            <span className="text-[8px] text-slate-400 font-semibold">Palette Dominant:</span>
                            <span className="w-2 h-2 rounded-full self-center" style={{ backgroundColor: item.dominantColor }} />
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {item.detectedObjects.map((obj, oIdx) => (
                              <span key={oIdx} className="px-1.5 py-0.5 bg-black/40 rounded text-[7px] font-bold text-slate-500 uppercase">{obj}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STYLE INTERPRETER & LIBRARIES (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time Logger Terminal for the 10 stages of AI pipeline */}
          <div className="ai-card p-5 bg-[#0a0810] border-white/5 rounded-3xl flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono">Neural Pipeline Logs</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex-grow bg-black/60 rounded-2xl p-3 font-mono text-[8.5px] leading-relaxed text-slate-400 overflow-y-auto custom-scrollbar flex flex-col-reverse text-left">
              <div className="space-y-1">
                {processingLogs.length > 0 ? (
                  processingLogs.map((log, idx) => (
                    <div key={idx} className={`${log.includes('[ERROR]') ? 'text-red-400' : log.includes('Success') ? 'text-emerald-400' : log.includes('Stage') ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 italic">
                    Pipeline idle. Awaiting media analysis trigger...
                  </div>
                )}
              </div>
            </div>

            {/* Stage Progress indicators map out visually */}
            <div className="grid grid-cols-10 gap-1.5 mt-3 pt-2 border-t border-white/5">
              {STAGE_CONFIGS.map((stage, idx) => {
                const isActive = currentStageIndex === idx;
                const isPassed = currentStageIndex > idx;
                return (
                  <div
                    key={stage.id}
                    className={`h-1.5 rounded-full relative group transition-all duration-300 ${isActive ? 'bg-[#8DB8CC] animate-pulse shadow-[0_0_8px_rgba(141,184,204,0.6)]' : isPassed ? 'bg-gradient-to-r from-white to-[#8DB8CC]' : 'bg-white/5'}`}
                    title={`${stage.label}: ${stage.desc}`}
                  >
                    {/* Tooltip tooltip helper */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#050709] border border-[#26313A] p-2 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[7px] uppercase whitespace-nowrap leading-tight text-white shadow-2xl">
                      <div className="font-extrabold text-[#8DB8CC]">{stage.label}</div>
                      <div className="text-slate-400 italic">{stage.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neural Metadata Viewer / File details summary */}
          {metadata && (
            <div className="ai-card p-5 bg-[#10161B] border-[#26313A] rounded-3xl text-left space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-[#8DB8CC]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Media Intelligence Dashboard</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyMetadata}
                    className="p-1.5 bg-[#0A0E12] hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-[#26313A] transition-colors"
                    title="Copy full JSON metadata structure"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                  <button
                    onClick={downloadMetadataJson}
                    className="p-1.5 bg-[#0A0E12] hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-[#26313A] transition-colors"
                    title="Download JSON schema file"
                  >
                    <Download size={12} />
                  </button>
                </div>
              </div>

              {/* Key value characteristics extracted */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 bg-[#0A0E12] border border-[#26313A] rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Source Format</span>
                  <div className="text-[10px] font-black text-white uppercase">{metadata.mediaType} • {metadata.fileSize}</div>
                </div>
                <div className="p-3 bg-[#0A0E12] border border-[#26313A] rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Dynamic Resolution</span>
                  <div className="text-[10px] font-black text-white uppercase">{metadata.resolution}</div>
                </div>
              </div>

              {/* Florence Description */}
              <div className="space-y-2 p-3 bg-[#0A0E12] border border-[#26313A] rounded-2xl">
                <span className="block text-[8px] font-black text-[#8DB8CC] uppercase tracking-widest">LLaVA Scene Interpretation</span>
                <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                  "{metadata.sceneDescription}"
                </p>
              </div>

              {/* SigLIP Aesthetic fingerprint details */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Palette size={12} className="text-[#8DB8CC]" />
                    SigLIP Style Fingerprint
                  </span>
                  <button
                    onClick={savePresetToCollection}
                    className="text-[8px] font-black text-violet-400 uppercase hover:underline flex items-center gap-1"
                  >
                    <Save size={10} />
                    <span>Save Look Preset</span>
                  </button>
                </div>

                <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Aesthetic Harmony</span>
                    <span className="text-[10px] font-black text-slate-200 uppercase">{metadata.styleFingerprint.cinematicVibe}</span>
                  </div>

                  {/* Palette Render */}
                  <div className="space-y-1">
                    <span className="block text-[8px] font-black text-slate-500 uppercase">Color Temperature Swatch</span>
                    <div className="flex items-center gap-1.5">
                      {metadata.styleFingerprint.colorPalette.map((color, cIdx) => (
                        <div
                          key={cIdx}
                          className="h-7 flex-grow rounded-md relative group/color cursor-pointer shadow-md transition-transform hover:scale-105"
                          style={{ backgroundColor: color }}
                          title={color}
                          onClick={() => {
                            navigator.clipboard.writeText(color);
                            alert(`Copied ${color} to clipboard!`);
                          }}
                        >
                          <div className="absolute inset-0 bg-black/60 rounded-md opacity-0 group-hover/color:opacity-100 flex items-center justify-center transition-all">
                            <span className="text-[6px] font-mono font-black text-white">{color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ambient Details */}
                  <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="block text-[8px] font-black text-slate-500 uppercase">Recommended Font Pairings</span>
                    <div className="flex gap-2">
                      {metadata.styleFingerprint.recommendedFontPairings.map((font) => (
                        <span key={font} className="px-2 py-0.5 bg-black/40 rounded text-[9px] font-black uppercase text-slate-300 font-mono tracking-tighter">
                          {font}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* OCR Typography elements detected */}
              <div className="space-y-2 pt-2 text-left">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Type size={12} /> OCR Text Spotted
                </span>
                <div className="flex flex-wrap gap-2">
                  {metadata.ocrText.map((text, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                      "{text}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Stage Flow Rebuilder using Flux */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <span className="block text-[9px] font-black text-[#8DB8CC] uppercase tracking-widest">
                    Flux Pro Style Reconstruction
                  </span>
                  <p className="text-[8.5px] text-slate-500 leading-relaxed font-semibold">
                    Automatically convert this image's neural footprint coordinates into a cinematic generative model parameters and prompt.
                  </p>
                </div>

                {!reconstructedImage && !isReconstructing ? (
                  <ActionButton
                    onClick={runCinematicReconstruction}
                    isLoading={isReconstructing}
                    text="Run Style Reconstruction"
                    icon={<Sparkles className="w-4 h-4 mr-2" />}
                    className="w-full !py-3 uppercase text-[10px] tracking-wider font-extrabold"
                  />
                ) : isReconstructing ? (
                  <div className="py-8 bg-black/40 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-6 h-6 text-[#8DB8CC] animate-spin mb-2" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Synthesizing reconstructed vision...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="aspect-video relative rounded-2xl overflow-hidden border border-white/10 group">
                      <img src={reconstructedImage!} alt="Reconstructed output" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm p-2 text-center text-[7px] text-slate-400 font-extrabold uppercase tracking-widest">
                        Variation output generated successfully via Flux Pro
                      </div>
                    </div>
                    <ActionButton
                      onClick={() => setReconstructedImage(null)}
                      text="Generate another style variation"
                      icon={<RefreshCw className="w-3.5 h-3.5 mr-2" />}
                      className="w-full !py-2.5 uppercase text-[9px]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User's saved style preset dictionary */}
          <div className="ai-card p-5 bg-[#10161B] border-[#26313A] rounded-3xl text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
              <span>Saved Look Presets</span>
              <span className="text-[8px] text-slate-500 tracking-widest uppercase">{savedPresets.length} stored</span>
            </h3>

            {savedPresets.length > 0 ? (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {savedPresets.map((preset) => (
                  <div key={preset.id} className="p-3 bg-[#0A0E12] border border-[#26313A] rounded-2xl hover:border-[#8DB8CC]/40 transition-all duration-300 flex items-center justify-between group">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-white uppercase">{preset.name}</h4>
                      <div className="flex gap-1">
                        {preset.palette.map((color: string, cIdx: number) => (
                          <div key={cIdx} className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => deletePreset(preset.id, e)}
                        className="p-1 px-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Delete Preset"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-black/20 border border-dashed border-white/5 rounded-2xl">
                <Palette className="w-7 h-7 text-slate-800 mx-auto mb-2" />
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">No custom style palettes saved yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralEditingEngine;
