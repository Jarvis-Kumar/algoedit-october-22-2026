
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Film, Play, Wand2, Monitor, Layers, Camera, Zap, Music, Plus, Download, Trash2, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { falService } from '../services/falService';
import { CustomSelect } from './ui/CustomSelect';

interface VideoScene {
  id: string;
  prompt: string;
  url?: string;
  status: 'idle' | 'processing' | 'done' | 'error';
}

const MovieStudio: React.FC = () => {
  const [scenes, setScenes] = useState<VideoScene[]>([
    { id: '1', prompt: 'Atmospheric opening shot of a futuristic neon city in the rain.', status: 'idle' },
  ]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('fal-ai/luma-dream-machine');

  const addScene = () => {
    setScenes([...scenes, { id: Math.random().toString(), prompt: '', status: 'idle' }]);
  };

  const updateScenePrompt = (id: string, prompt: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, prompt } : s));
  };

  const deleteScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
  };

  const handleSynthesizeAll = async () => {
    setIsSynthesizing(true);
    
    // Simulate/Parallel call to Fal for each scene
    const updatedScenes = [...scenes];
    
    try {
      for (let i = 0; i < updatedScenes.length; i++) {
        const scene = updatedScenes[i];
        if (!scene.prompt) continue;
        
        updatedScenes[i] = { ...scene, status: 'processing' };
        setScenes([...updatedScenes]);
        
        try {
          const url = await falService.generateVideo(scene.prompt, selectedModel as any);
          updatedScenes[i] = { ...updatedScenes[i], url, status: 'done' };
        } catch (e) {
          updatedScenes[i] = { ...updatedScenes[i], status: 'error' };
        }
        setScenes([...updatedScenes]);
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#10161B] border border-[#26313A] flex items-center justify-center shadow-lg shadow-black/40 text-[#8DB8CC]">
            <Film className="text-[#8DB8CC]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Neural Movie Studio</h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Multi-Scene Cinematic Synthesis</p>
          </div>
        </div>

        <div className="flex gap-4">
           <CustomSelect 
             value={selectedModel}
             onChange={(val) => setSelectedModel(val)}
             options={[
               { label: 'Luma Dream Machine', value: 'fal-ai/luma-dream-machine' },
               { label: 'Kling 3.0 Pro', value: 'fal-ai/kling-video/v3' },
               { label: 'Google Veo 3.1', value: 'fal-ai/veo/v3.1' },
               { label: 'Wan Video', value: 'fal-ai/wan-video' }
             ]}
           />
           
           <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSynthesizeAll}
            disabled={isSynthesizing}
            className="px-6 h-12 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-xs uppercase tracking-[0.2em] rounded-xl flex items-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer"
           >
             <Play size={16} fill="currentColor" />
             Synthesize Storyboard
           </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Storyboard Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storyboard Blocks</label>
            <button onClick={addScene} className="text-[#8DB8CC] hover:text-white transition-colors cursor-pointer">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar p-1">
            {scenes.map((scene, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={scene.id}
                className={`glass-panel p-4 border transition-all ${scene.status === 'processing' ? 'border-[#8DB8CC]/50 bg-[#8DB8CC]/5' : 'border-white/5 bg-white/[0.02]'}`}
              >
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400">
                       {index + 1}
                     </div>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scene Segment</span>
                   </div>
                   <button onClick={() => deleteScene(scene.id)} className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer">
                     <Trash2 size={14} />
                   </button>
                </div>
                <textarea 
                  value={scene.prompt}
                  onChange={(e) => updateScenePrompt(scene.id, e.target.value)}
                  placeholder="Describe the cinematic motion..."
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-[11px] text-white font-mono min-h-[80px] focus:border-[#8DB8CC]/50 outline-none transition-all"
                />
                
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    {scene.status === 'processing' && (
                       <motion.div 
                         initial={{ x: '-100%' }}
                         animate={{ x: '100%' }}
                         transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                         className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#8DB8CC] to-transparent"
                       />
                    )}
                    {scene.status === 'done' && <div className="h-full w-full bg-[#8DB8CC]/70" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-2 space-y-6">
           <div className="aspect-video bg-black/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl">
              <AnimatePresence mode="wait">
                 {scenes.some(s => s.status === 'processing') ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                    >
                      <div className="w-16 h-16 border-4 border-[#8DB8CC]/20 border-t-[#8DB8CC] rounded-full animate-spin" />
                      <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Rendering Storyboard</p>
                        <p className="text-[9px] font-mono text-[#8DB8CC]/80 uppercase tracking-widest italic">Temporal Synthesis Active</p>
                      </div>
                    </motion.div>
                 ) : scenes.some(s => s.url) ? (
                    <motion.div 
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 gap-4 p-6 h-full overflow-y-auto lg:custom-scrollbar"
                    >
                       {scenes.filter(s => s.url).map(scene => (
                          <div key={scene.id} className="relative group rounded-3xl overflow-hidden border border-white/10 aspect-video bg-black">
                            <video src={scene.url} controls className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-2 bg-black/60 rounded-xl border border-white/10 text-white hover:bg-[#8DB8CC] hover:text-black transition-colors cursor-pointer">
                                 <Download size={14} />
                               </button>
                            </div>
                          </div>
                       ))}
                    </motion.div>
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-6 opacity-20">
                       <Film size={64} className="text-white" />
                       <div className="text-center space-y-2">
                         <p className="text-[11px] font-black uppercase tracking-[0.8em]">Cinematic_Output_Awaiting</p>
                         <p className="text-[9px] font-mono lowercase opacity-50 tracking-widest">ready to render your narrative</p>
                       </div>
                    </div>
                 )}
              </AnimatePresence>
           </div>

           {/* Director Tools */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Camera size={18} />, label: 'Dynamic Track', color: 'text-[#8DB8CC]' },
                { icon: <Layers size={18} />, label: 'Spatial Layers', color: 'text-[#AFC3CF]' },
                { icon: <Wand2 size={18} />, label: 'Relighting AI', color: 'text-[#8DB8CC]' },
                { icon: <Music size={18} />, label: 'Sonic Sync', color: 'text-[#AFC3CF]' },
              ].map((tool, i) => (
                <button key={i} className="glass-panel p-4 border-white/5 hover:border-[#8DB8CC]/40 hover:bg-[#10161B] transition-all text-left space-y-3 group cursor-pointer rounded-2xl">
                   <div className={tool.color}>{tool.icon}</div>
                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                      {tool.label}
                   </div>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MovieStudio;
