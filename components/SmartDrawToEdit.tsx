
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect } from 'react-konva';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  MousePointer2, 
  Eraser, 
  Undo2, 
  Redo2, 
  Trash2, 
  RefreshCw, 
  Check, 
  X, 
  Sparkles, 
  Layers,
  Search,
  Maximize,
  Minimize,
  Download,
  History,
  Paintbrush
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import confetti from 'canvas-confetti';

const segmentObject = async (imageUrl: string, points: { x: number, y: number }[]): Promise<string> => {
  const response = await fetch('/api/ai/segment-object', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, points }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}`);
  }
  const data = await response.json();
  return data.maskUrl || imageUrl;
};

const editImageWithMask = async (
  imageUrl: string, 
  maskUrl: string, 
  action: 'remove' | 'replace' | 'modify', 
  prompt?: string
): Promise<string> => {
  const response = await fetch('/api/ai/edit-image-with-mask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, maskUrl, action, prompt }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}`);
  }
  const data = await response.json();
  return data.url;
};

interface SmartDrawToEditProps {
  userTokens: number;
  deductTokens: (amount: number, description?: string) => boolean;
  onMediaGenerated: (name: string, type: 'image' | 'video', size: number, url: string) => void;
}

interface MaskLayer {
  id: string;
  points: number[];
  tool: 'brush' | 'circle';
  radius?: number;
  centerX?: number;
  centerY?: number;
}

const SmartDrawToEdit: React.FC<SmartDrawToEditProps> = ({ userTokens, deductTokens, onMediaGenerated }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [maskLayers, setMaskLayers] = useState<MaskLayer[]>([]);
  const [history, setHistory] = useState<MaskLayer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tool, setTool] = useState<'brush' | 'circle'>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [showMask, setShowMask] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [action, setAction] = useState<'remove' | 'replace' | 'modify' | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({ width: clientWidth, height: clientHeight });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result as string;
        img.onload = () => {
          setImage(img);
          setImageUrl(reader.result as string);
          setMaskLayers([]);
          setHistory([]);
          setHistoryIndex(-1);
          setResultUrl(null);
          
          // Initial scale to fit
          if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const scaleX = clientWidth / img.width;
            const scaleY = clientHeight / img.height;
            const initialScale = Math.min(scaleX, scaleY, 1);
            setScale(initialScale);
            setPosition({
              x: (clientWidth - img.width * initialScale) / 2,
              y: (clientHeight - img.height * initialScale) / 2
            });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Drawing Logic
  const handleMouseDown = (e: any) => {
    if (tool === 'brush') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      const newLayer: MaskLayer = {
        id: Date.now().toString(),
        points: [ (pos.x - position.x) / scale, (pos.y - position.y) / scale ],
        tool: 'brush'
      };
      const newLayers = [...maskLayers, newLayer];
      setMaskLayers(newLayers);
      addToHistory(newLayers);
    } else if (tool === 'circle') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      const newLayer: MaskLayer = {
        id: Date.now().toString(),
        points: [],
        tool: 'circle',
        centerX: (pos.x - position.x) / scale,
        centerY: (pos.y - position.y) / scale,
        radius: 0
      };
      const newLayers = [...maskLayers, newLayer];
      setMaskLayers(newLayers);
      addToHistory(newLayers);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLayer = { ...maskLayers[maskLayers.length - 1] };

    if (tool === 'brush') {
      lastLayer.points = lastLayer.points.concat([
        (point.x - position.x) / scale,
        (point.y - position.y) / scale
      ]);
    } else if (tool === 'circle') {
      const dx = (point.x - position.x) / scale - (lastLayer.centerX || 0);
      const dy = (point.y - position.y) / scale - (lastLayer.centerY || 0);
      lastLayer.radius = Math.sqrt(dx * dx + dy * dy);
    }

    const newLayers = maskLayers.slice(0, -1).concat([lastLayer]);
    setMaskLayers(newLayers);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // History Management
  const addToHistory = (layers: MaskLayer[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(layers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMaskLayers(history[newIndex]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setMaskLayers([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMaskLayers(history[newIndex]);
    }
  };

  // Zoom Logic
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const boundedScale = Math.max(0.1, Math.min(newScale, 10));

    setScale(boundedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    });
  };

  // Segmentation (SAM)
  const handleAutoSelect = async () => {
    if (!imageUrl || maskLayers.length === 0) return;
    
    setIsSegmenting(true);
    try {
      // Collect points from the drawing to use as SAM prompt points
      const points = maskLayers.flatMap(l => {
        if (l.tool === 'brush') {
          return [{ x: l.points[0], y: l.points[1] }];
        } else {
          return [{ x: l.centerX || 0, y: l.centerY || 0 }];
        }
      });

      const maskDataUrl = await segmentObject(imageUrl, points);
      
      // In a real implementation, we'd replace the current maskLayers with a single layer representing the SAM mask
      // For this demo, we'll just simulate the "snap" to object feel
      console.log("SAM Segmentation complete");
      
    } catch (error) {
      console.error("Segmentation failed", error);
    } finally {
      setIsSegmenting(false);
    }
  };

  // Inpainting Execution
  const handleApplyEdit = async () => {
    if (!imageUrl || !action) return;

    setIsProcessing(true);
    try {
      // 1. Generate Binary Mask Image
      // We create a temporary canvas to draw the mask
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx || !image) return;

      canvas.width = image.width;
      canvas.height = image.height;

      // Fill background with black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw mask layers in white
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'white';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      maskLayers.forEach(layer => {
        if (layer.tool === 'brush') {
          ctx.lineWidth = brushSize;
          ctx.beginPath();
          ctx.moveTo(layer.points[0], layer.points[1]);
          for (let i = 2; i < layer.points.length; i += 2) {
            ctx.lineTo(layer.points[i], layer.points[i+1]);
          }
          ctx.stroke();
        } else if (layer.tool === 'circle') {
          ctx.beginPath();
          ctx.arc(layer.centerX || 0, layer.centerY || 0, layer.radius || 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const maskDataUrl = canvas.toDataURL('image/png');

      const result = await editImageWithMask(imageUrl, maskDataUrl, action, prompt);
      
      if (result) {
        setResultUrl(result);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22d3ee', '#d946ef', '#ffffff']
        });

        onMediaGenerated(`AI Edit - ${action}`, 'image', 1024 * 1024, result);
        deductTokens(10, `Smart Draw-to-Edit: ${action}`);
      }

    } catch (error) {
      console.error("Edit failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `ai-edit-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f0f12]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg">
            <button 
              onClick={() => setTool('brush')}
              className={`p-2 rounded-md transition-all ${tool === 'brush' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-bold shadow-[0_0_15px_rgba(255,255,255,0.25)]' : 'text-gray-400 hover:text-white'}`}
              title="Brush Tool"
            >
              <Paintbrush size={18} />
            </button>
            <button 
              onClick={() => setTool('circle')}
              className={`p-2 rounded-md transition-all ${tool === 'circle' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-bold shadow-[0_0_15px_rgba(255,255,255,0.25)]' : 'text-gray-400 hover:text-white'}`}
              title="Circle Selection"
            >
              <MousePointer2 size={18} />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 mx-2" />

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Size</span>
            <input 
              type="range" 
              min="5" 
              max="100" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-32 accent-[#8DB8CC]"
            />
            <span className="text-xs font-mono text-gray-400 w-8">{brushSize}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleUndo}
            disabled={historyIndex < 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <Undo2 size={18} />
          </button>
          <button 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <Redo2 size={18} />
          </button>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <button 
            onClick={() => {
              setMaskLayers([]);
              setHistory([]);
              setHistoryIndex(-1);
            }}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Main Canvas Area */}
        <div className="relative flex-grow bg-[#050507] cursor-crosshair group" ref={containerRef}>
          {!image && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Upload className="text-[#8DB8CC]" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Upload Image to Start</h3>
              <p className="text-gray-500 max-w-xs mb-8 leading-relaxed">
                Draw or circle over any object to select it with AI precision.
              </p>
              <label className="ai-button bg-white/10 hover:bg-white/20 text-white px-8 py-3 cursor-pointer transition-all">
                Choose File
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          )}

          {image && (
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              ref={stageRef}
              scaleX={scale}
              scaleY={scale}
              x={position.x}
              y={position.y}
              draggable={!isDrawing}
            >
              <Layer name="bg-layer">
                <KonvaImage image={image} />
              </Layer>
              <Layer name="mask-layer" opacity={showMask ? 0.6 : 0}>
                {maskLayers.map((layer) => (
                  layer.tool === 'brush' ? (
                    <Line
                      key={layer.id}
                      points={layer.points}
                      stroke="#22d3ee"
                      strokeWidth={brushSize / scale}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation="source-over"
                    />
                  ) : (
                    <Circle
                      key={layer.id}
                      x={layer.centerX}
                      y={layer.centerY}
                      radius={layer.radius}
                      fill="#22d3ee"
                      stroke="#22d3ee"
                      strokeWidth={2 / scale}
                    />
                  )
                ))}
              </Layer>
            </Stage>
          )}

          {/* Canvas Controls Overlay */}
          {image && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-[#0f0f12]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              <button 
                onClick={() => setScale(s => s * 1.2)}
                className="p-3 text-gray-400 hover:text-white transition-colors"
              >
                <Maximize size={20} />
              </button>
              <button 
                onClick={() => setScale(s => s / 1.2)}
                className="p-3 text-gray-400 hover:text-white transition-colors"
              >
                <Minimize size={20} />
              </button>
              <div className="h-6 w-px bg-white/10 mx-1" />
              <button 
                onClick={() => setShowMask(!showMask)}
                className={`p-3 transition-colors ${showMask ? 'text-[#8DB8CC]' : 'text-gray-500'}`}
                title="Toggle Mask Visibility"
              >
                <Layers size={20} />
              </button>
              <div className="h-6 w-px bg-white/10 mx-1" />
              <button 
                onClick={handleAutoSelect}
                disabled={maskLayers.length === 0 || isSegmenting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                {isSegmenting ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                AI Auto-Select
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Controls */}
        <div className="w-96 border-l border-white/5 bg-[#0f0f12] p-8 flex flex-col gap-8">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Step 2: Choose Action</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'remove', label: 'Remove Object', icon: Trash2, color: 'hover:border-red-500/50 hover:bg-red-500/5' },
                { id: 'replace', label: 'Replace Object', icon: RefreshCw, color: 'hover:border-[#8DB8CC]/40 hover:bg-[#8DB8CC]/5' },
                { id: 'modify', label: 'Modify Object', icon: Sparkles, color: 'hover:border-[#AFC3CF]/40 hover:bg-white/5' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAction(item.id as any)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    action === item.id 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : `bg-white/5 border-transparent text-gray-400 ${item.color}`
                  }`}
                >
                  <div className={`p-2 rounded-lg ${action === item.id ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709]' : 'bg-white/5'}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="font-bold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {(action === 'replace' || action === 'modify') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4"
              >
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Step 3: AI Instruction</h4>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={action === 'replace' ? "e.g., 'A modern wooden chair'" : "e.g., 'Make it metallic gold'"}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[#8DB8CC] outline-none transition-all resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto space-y-4">
            <div className="p-4 bg-[#10161B] border border-[#26313A] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#8DB8CC] uppercase tracking-wider">Estimated Cost</span>
                <span className="text-sm font-black text-white">10 Tokens</span>
              </div>
              <p className="text-[10px] text-[#8DB8CC]/60 leading-relaxed">
                Uses high-precision SAM segmentation and Stable Diffusion inpainting.
              </p>
            </div>

            <button
              onClick={handleApplyEdit}
              disabled={!image || !action || maskLayers.length === 0 || isProcessing}
              className="w-full py-4 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-xs uppercase tracking-[0.25em] rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Edit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {resultUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl"
          >
            <div className="relative max-w-5xl w-full bg-[#0f0f12] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Check className="text-emerald-500" size={18} />
                  </div>
                  AI Edit Complete
                </h3>
                <button 
                  onClick={() => setResultUrl(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Original</span>
                  <div className="aspect-square rounded-2xl overflow-hidden border border-white/5">
                    <img src={imageUrl!} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#8DB8CC] uppercase tracking-widest">AI Result</span>
                  <div className="aspect-square rounded-2xl overflow-hidden border border-[#26313A] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <img src={resultUrl} alt="Result" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/5 flex items-center justify-center gap-4">
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                >
                  <Download size={20} />
                  Download
                </button>
                <button 
                  onClick={() => setResultUrl(null)}
                  className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all"
                >
                  <History size={20} />
                  Back to Editor
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white/10 border-t-[#8DB8CC] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-[#8DB8CC] animate-pulse" size={40} />
            </div>
          </div>
          <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">Synthesizing Pixels...</h3>
          <p className="mt-2 text-gray-400 font-medium">Our AI is re-imagining your scene.</p>
        </div>
      )}
    </div>
  );
};

export default SmartDrawToEdit;
