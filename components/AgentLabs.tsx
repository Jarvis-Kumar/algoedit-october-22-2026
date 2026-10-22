
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Mic, Music, Globe, Users, MessageSquare, Laptop, Briefcase, Zap, Plus, Send, Play, Download, Settings, Ear, Mic2, Speaker } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
}

const AGENTS: Agent[] = [
  { id: 'writer', name: 'Lexis', role: 'Chief Strategist & Writer', icon: <Briefcase size={16} />, color: 'from-blue-500 to-indigo-500' },
  { id: 'designer', name: 'Aura', role: 'Visual Lead', icon: <Laptop size={16} />, color: 'from-purple-500 to-pink-500' },
  { id: 'audio', name: 'Sonic', role: 'Sound Synthesis', icon: <Mic2 size={16} />, color: 'from-orange-500 to-red-500' },
];

const LANGUAGES = [
  'Japanese (Native Sync)',
  'Spanish (Castilian)',
  'French (Parisian)',
  'German (Modern)',
];

const AgentLabs: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'workspace' | 'audio'>('workspace');
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Lexis', text: 'Identity strategy for "Nova" is complete. Aura, you can start on the visual language.', time: '08:42' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  
  // Audio Lab States
  const [speechPrompt, setSpeechPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clonedVoiceName, setClonedVoiceName] = useState<string | null>(null);
  const [bgMusic, setBgMusic] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  const handleSendMessage = () => {
    if (!chatInput) return;
    setMessages([...messages, { sender: 'Executive', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#10161B] border border-[#26313A] flex items-center justify-center shadow-[0_0_15px_rgba(141,184,204,0.2)] text-[#8DB8CC]">
            <Bot className="text-[#8DB8CC]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Agent Labs</h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Multi-Agent Intelligence & Synthesis</p>
          </div>
        </div>

        <div className="flex p-1.5 rounded-[20px] bg-[#0A0D18] border border-white/10 shadow-2xl backdrop-blur-3xl">
          <button 
            onClick={() => setActiveMode('workspace')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer ${activeMode === 'workspace' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            Multi-Agent HQ
          </button>
          <button 
            onClick={() => setActiveMode('audio')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer ${activeMode === 'audio' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            Sonic Lab
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {activeMode === 'workspace' ? (
          <>
            {/* Agent Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Intelligence Units</label>
                <div className="space-y-3">
                  {agents.map(agent => (
                    <div key={agent.id} className="glass-panel p-4 border-white/5 bg-white/[0.02] flex items-center gap-4 group hover:bg-white/5 transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg`}>
                        {agent.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-white uppercase tracking-wide">{agent.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono italic">{agent.role}</div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const names = ['Nova', 'Apex', 'Sol', 'Vector', 'Lyra'];
                      const roles = ['Autonomous Quality Lead', 'Creative Prompt Enhancer', 'Strategy Generator', 'Neural Animator', 'Sub-Bass Synthesizer'];
                      const colors = ['from-green-500 to-emerald-500', 'from-pink-500 to-rose-500', 'from-amber-400 to-orange-400', 'from-teal-400 to-cyan-500', 'from-violet-500 to-purple-500'];
                      const idx = Math.floor(Math.random() * names.length);
                      const newAgent = { 
                        id: `agent-${Date.now()}`, 
                        name: names[idx], 
                        role: roles[idx], 
                        icon: <Bot size={16} />, 
                        color: colors[idx]
                      };
                      setAgents(prev => [...prev, newAgent]);
                      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      setMessages(prev => [...prev, { sender: newAgent.name, text: `Hello, I've just been deployed into the Nova Genesis campaign space. Ready to assist!`, time: timeStr }]);
                    }}
                    className="w-full h-12 dashed-button flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    <Plus size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Deploy Agent</span>
                  </button>
                </div>
              </div>

              <div className="glass-panel p-6 border-white/5 bg-indigo-500/5 space-y-4">
                 <div className="flex items-center gap-2 text-indigo-400">
                    <Zap size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Auto-Task Pipeline</span>
                 </div>
                 <div className="space-y-2">
                    {['Writing Narration...', 'Designing Poster Assets...', 'Dubbing Audio...'].map((task, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] font-mono text-slate-500 py-1 border-b border-white/5">
                        <span>{task}</span>
                        <span className="text-indigo-400/60">pending</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Workplace Chat */}
            <div className="lg:col-span-8 flex flex-col glass-panel border-white/5 h-[700px]">
               <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Users size={16} className="text-slate-400" />
                     <span className="text-xs font-black text-white uppercase tracking-widest italic">Campaign: Nova Genesis</span>
                  </div>
                  <div className="flex -space-x-2">
                     {agents.map(a => (
                       <div key={a.id} className={`w-7 h-7 rounded-lg border-2 border-slate-900 bg-gradient-to-br ${a.color} flex items-center justify-center text-[10px] text-white`}>
                         {a.name[0]}
                       </div>
                     ))}
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i} 
                      className={`flex gap-4 ${msg.sender === 'Executive' ? 'flex-row-reverse' : ''}`}
                    >
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                         msg.sender === 'Executive' ? 'bg-white/10' : 'bg-[#10161B] border border-[#26313A] text-[#8DB8CC]'
                       }`}>
                         {msg.sender[0]}
                       </div>
                       <div className={`space-y-1 ${msg.sender === 'Executive' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                             {msg.sender}
                             <span className="font-normal lowercase text-[8px] opacity-40">{msg.time}</span>
                          </div>
                          <div className={`p-5 rounded-[2rem] text-sm max-w-[400px] leading-relaxed shadow-xl ${
                            msg.sender === 'Executive' ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-medium rounded-tr-none shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#0A0D18]/80 text-slate-300 rounded-tl-none border border-white/5 backdrop-blur-xl'
                          }`}>
                            {msg.text}
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>

               <div className="p-6 border-t border-white/10">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Issue command to agents..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-xs text-white focus:ring-1 focus:ring-[#8DB8CC]/50 focus:border-[#8DB8CC] transition-all font-mono outline-none"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] rounded-xl flex items-center justify-center hover:brightness-110 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all cursor-pointer"
                    >
                      <Send size={16} />
                    </button>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 space-y-10">
             {/* Audio Synthesis Lab */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="glass-panel p-8 space-y-8 border-white/5 bg-white/[0.01]">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Mic size={16} className="text-red-500" />
                        Voice Cloning HQ
                      </label>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setClonedVoiceName(file.name);
                            alert(`Cloned voice signature successfully parsed from "${file.name}"! Ready for synthesis.`);
                          }
                        }}
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-40 dashed-button flex flex-col items-center justify-center gap-4 text-slate-500 group cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all"
                      >
                         <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all">
                            <Plus size={24} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                           {clonedVoiceName ? `Voice: ${clonedVoiceName.substring(0, 15)}...` : 'Sample Voice Input'}
                         </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={16} className="text-blue-500" />
                        Global Translator
                      </label>
                      <CustomSelect 
                        options={LANGUAGES} 
                        value={selectedLanguage} 
                        onChange={setSelectedLanguage} 
                      />
                    </div>
                 </div>

                 <div className="lg:col-span-2 glass-panel p-8 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] -z-10" />
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                          <div className="space-y-1">
                             <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Neural Audio Engine</h3>
                             <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Text-to-Sonic-Synthesis</p>
                          </div>
                          <div className="flex gap-4">
                             <button 
                               onClick={() => {
                                 setBgMusic(!bgMusic);
                                 alert(bgMusic ? "Subtle ambient background music turned off." : "Subtle atmospheric background music loaded for synthesis.");
                               }}
                               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer ${bgMusic ? 'bg-[#10161B] border border-[#8DB8CC] text-[#8DB8CC] shadow-[0_0_12px_rgba(141,184,204,0.3)]' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                             >
                                <Music size={14} />
                                {bgMusic ? "Ambient Active" : "Background Music"}
                             </button>
                             <button 
                               onClick={async () => {
                                 if (!speechPrompt.trim()) {
                                   alert("Please enter a manuscript or speech prompt first.");
                                   return;
                                 }
                                 setIsSynthesizing(true);
                                 setAudioUrl(null);
                                 setIsPlaying(false);
                                 try {
                                   await new Promise(resolve => setTimeout(resolve, 3000));
                                   // A high-quality royalty-free soundhelix mp3 suitable for playback demo
                                   setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
                                   alert("Audio manuscript synthesis complete! Preview is ready below.");
                                 } catch (err) {
                                   alert("Could not process speech synthesis.");
                                 } finally {
                                   setIsSynthesizing(false);
                                 }
                                }}
                               disabled={isSynthesizing}
                               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 disabled:opacity-50"
                             >
                                <Play size={14} fill="white" />
                                {isSynthesizing ? 'Synthesizing...' : 'Synthesize'}
                             </button>
                          </div>
                       </div>

                       <textarea 
                         value={speechPrompt}
                         onChange={(e) => setSpeechPrompt(e.target.value)}
                         className="w-full h-48 bg-black/40 border border-white/5 rounded-[2rem] p-8 text-sm text-slate-300 font-mono leading-relaxed focus:border-red-500/50 outline-none transition-all placeholder:text-slate-700"
                         placeholder="Enter manuscript for neural voice synthesis or podcast generation..."
                       />

                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Synthesis Preview</label>
                          <div className="h-20 glass-panel border-white/5 bg-black/40 flex items-center px-8 gap-4">
                             {audioUrl && (
                               <audio 
                                 ref={audioPlayerRef} 
                                 src={audioUrl} 
                                 onEnded={() => setIsPlaying(false)}
                                 className="hidden"
                               />
                             )}
                             <button 
                               onClick={() => {
                                 if (!audioUrl) {
                                   alert("Please enter a prompt and click 'Synthesize' to generate audio first.");
                                   return;
                                 }
                                 if (audioPlayerRef.current) {
                                   if (isPlaying) {
                                     audioPlayerRef.current.pause();
                                     setIsPlaying(false);
                                   } else {
                                     audioPlayerRef.current.play().catch(() => {});
                                     setIsPlaying(true);
                                   }
                                 }
                               }}
                               className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                             >
                                {isPlaying ? (
                                  <div className="flex gap-1 items-center justify-center">
                                    <div className="w-1 h-3 bg-black rounded-full" />
                                    <div className="w-1 h-3 bg-black rounded-full" />
                                  </div>
                                ) : (
                                  <Play size={16} fill="black" className="ml-0.5" />
                                )}
                             </button>
                             <div className="flex-1 flex items-end gap-1 h-8">
                                {[0.2, 0.4, 0.7, 0.3, 0.8, 0.5, 0.9, 0.6, 0.4, 0.7, 0.3, 0.6, 0.8, 0.4, 0.5, 0.2, 0.7, 0.6, 0.8].map((h, i) => (
                                  <motion.div 
                                    key={i} 
                                    animate={isPlaying ? { height: [`${h * 20}%`, `${h * 100}%`, `${h * 20}%`] } : { height: `${h * 100}%` }}
                                    transition={isPlaying ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: i * 0.05 } : {}}
                                    className={`flex-1 rounded-full transition-colors ${isPlaying ? 'bg-red-500' : 'bg-red-500/30'}`}
                                  />
                                ))}
                             </div>
                             <span className="text-[10px] font-mono text-white">
                               {isPlaying ? "00:04:12" : audioUrl ? "00:12:42" : "00:00:00"}
                             </span>
                             <button 
                               onClick={() => {
                                 if (!audioUrl) return;
                                 const link = document.createElement('a');
                                 link.href = audioUrl;
                                 link.target = '_blank';
                                 link.download = `neural-voice-${Date.now()}.mp3`;
                                 document.body.appendChild(link);
                                 link.click();
                                 document.body.removeChild(link);
                               }}
                               disabled={!audioUrl}
                               className={`transition-colors ${audioUrl ? 'text-white hover:text-red-500 cursor-pointer' : 'text-slate-700'}`}
                             >
                                <Download size={18} />
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentLabs;
