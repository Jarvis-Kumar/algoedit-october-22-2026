
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Gamepad2, GraduationCap, Cpu, Globe, Rocket, Plus, Zap, Image as ImageIcon, Send, Download, Sparkles, Binary, PenTool, BookOpen, Microscope } from 'lucide-react';
import { falService } from '../services/falService';

const InnovationHub: React.FC = () => {
  const [mode, setMode] = useState<'3d' | 'edu'>('3d');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ type: string; url: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      if (mode === '3d') {
        const url = await falService.generateImage(`3D stylized ${prompt} asset, game ready, isolated, white background, masterpiece.`, 'fal-ai/flux/pro');
        setResults([...results, { type: '3D Asset', url }]);
      } else {
        const url = await falService.generateImage(`Educational diagram for ${prompt}, professional scientific illustration, clean background, accurate.`, 'fal-ai/flux/pro');
        setResults([...results, { type: 'Scientific Visual', url }]);
      }
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#10161B] border border-[#26313A] flex items-center justify-center shadow-lg shadow-black/40">
               <Cpu className="text-[#8DB8CC]" />
            </div>
            <div>
               <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Innovation Hub</h1>
               <p className="text-[#AFC3CF] text-xs font-mono uppercase tracking-widest">3D Dynamics & Academic Synthesis</p>
            </div>
         </div>

         <div className="flex p-1 rounded-xl bg-[#10161B] border border-[#26313A]">
            <button 
              onClick={() => setMode('3d')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${mode === '3d' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Dimension Labs
            </button>
            <button 
              onClick={() => setMode('edu')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${mode === 'edu' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Knowledge Forge
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Interaction Panel */}
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-8 space-y-8 border-white/5 bg-white/[0.01]">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    {mode === '3d' ? <Gamepad2 size={16} className="text-[#8DB8CC]" /> : <GraduationCap size={16} className="text-[#8DB8CC]" />}
                    {mode === '3d' ? 'Asset Specification' : 'Concept Description'}
                  </label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === '3d' ? "Describe a character, environment, or asset (e.g., Cyberpunk Samurai, Mech Hangar)..." : "Explain a scientific concept or request a diagram (e.g., Photosynthesis process, Quantum entanglement)..."}
                    className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-xs text-white focus:border-[#8DB8CC]/50 outline-none transition-all font-mono resize-none selection:bg-white/20"
                  />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synthesis Parameters</label>
                  <div className="space-y-2">
                     {mode === '3d' ? (
                        <>
                           {['Game Ready Mesh', 'High Poly Sculpt', 'PBR Textures', 'Rigged Skeleton'].map(opt => (
                              <div key={opt} className="flex items-center justify-between p-3 rounded-xl bg-[#10161B] border border-[#26313A]">
                                 <span className="text-[10px] font-bold text-slate-300">{opt}</span>
                                 <div className="w-8 h-4 bg-[#0A0E12] border border-[#26313A] rounded-full flex items-center px-1">
                                    <div className="w-2 h-2 rounded-full bg-[#8DB8CC]" />
                                 </div>
                              </div>
                           ))}
                        </>
                     ) : (
                        <>
                           {['Infographic Style', 'Academic Paper Ready', 'Interactive Model', 'Cross-Section View'].map(opt => (
                              <div key={opt} className="flex items-center justify-between p-3 rounded-xl bg-[#10161B] border border-[#26313A]">
                                 <span className="text-[10px] font-bold text-slate-300">{opt}</span>
                                 <div className="w-8 h-4 bg-[#0A0E12] border border-[#26313A] rounded-full flex items-center px-1">
                                    <div className="w-2 h-2 rounded-full bg-[#8DB8CC]" />
                                 </div>
                              </div>
                           ))}
                        </>
                     )}
                  </div>
               </div>

               <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="w-full h-14 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40"
               >
                 {isGenerating ? <Zap className="animate-pulse" /> : <Sparkles />}
                 {isGenerating ? 'Synthesizing...' : mode === '3d' ? 'Generate 3D Entity' : 'Forging Knowledge'}
               </motion.button>
            </div>
         </div>

         {/* Workspace Panel */}
         <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel min-h-[650px] border-white/5 relative overflow-hidden flex flex-col">
               <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex gap-4">
                     <button className="text-[10px] font-black text-white px-3 py-1 border-b-2 border-[#8DB8CC] uppercase tracking-widest">Active Results</button>
                     <button className="text-[10px] font-black text-slate-500 px-3 py-1 uppercase tracking-widest hover:text-slate-300 transition-colors">History</button>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#8DB8CC] animate-pulse" />
                     <span className="text-[9px] font-mono text-[#8DB8CC] uppercase tracking-widest">Hub Online</span>
                  </div>
               </div>

               <div className="flex-1 p-8">
                  {results.length === 0 && !isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6">
                       <Box size={80} className="opacity-20" />
                       <div className="text-center space-y-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.8em] opacity-40 italic">Waiting_for_Instruction</p>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-8">
                       {results.map((res, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4 group"
                          >
                             <div className="aspect-square rounded-3xl bg-black/40 border border-white/10 overflow-hidden relative">
                                <img src={res.url} alt="Result" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[8px] font-black text-white uppercase tracking-widest">
                                   {res.type}
                                </div>
                                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                   <button onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = res.url;
                                          link.target = '_blank';
                                          link.download = `innovation-hub-${i + 1}.png`;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                       }}
                                       className="p-2.5 bg-black/80 rounded-xl border border-white/10 text-white hover:border-[#8DB8CC]/40 hover:bg-[#10161B] transition-colors">
                                      <Download size={14} />
                                   </button>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                {mode === '3d' ? <Gamepad2 size={14} className="text-[#8DB8CC]" /> : <GraduationCap size={14} className="text-[#8DB8CC]" />}
                                <span className="text-[10px] font-bold text-slate-400">Generated Unit #{i+1}</span>
                             </div>
                          </motion.div>
                       ))}
                       {isGenerating && (
                          <div className="aspect-square rounded-3xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                             <div className="w-12 h-12 border-2 border-white/10 border-t-[#8DB8CC] rounded-full animate-spin" />
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Fabricating...</span>
                          </div>
                       )}
                    </div>
                  )}
               </div>

               {/* Ambient Decorations */}
               <div className="p-8 border-t border-white/10 bg-white/[0.01] grid grid-cols-3 gap-6">
                  {[
                    { icon: <Microscope size={16} />, label: 'Deep Simulation', desc: 'Atomic accuracy enabled' },
                    { icon: <Globe size={16} />, label: 'World Builder', desc: 'Seamless environment mesh' },
                    { icon: <Binary size={16} />, label: 'Game Logic AI', desc: 'Behavioral pattern mapping' }
                  ].map((feat, i) => (
                    <div key={i} className="space-y-1">
                       <div className="flex items-center gap-2 text-[#8DB8CC]/50">
                          {feat.icon}
                          <span className="text-[9px] font-black uppercase tracking-widest">{feat.label}</span>
                       </div>
                       <p className="text-[8px] font-mono text-slate-600 lowercase">{feat.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InnovationHub;
