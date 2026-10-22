
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, BookOpen, Brain, 
  Lightbulb, Target, Sparkles, 
  ChevronRight, BrainCircuit, Timer,
  Trophy, Book, Microscope, Calculator,
  Palette, Globe, Code
} from 'lucide-react';

interface TutorScenario {
  id: string;
  name: string;
  icon: React.ReactNode;
  subject: string;
  description: string;
}

const SCENARIOS: TutorScenario[] = [
  { id: 'math', name: 'Neural Calculus', icon: <Calculator />, subject: 'Mathematics', description: 'Step-by-step problem solving with AI visualization.' },
  { id: 'code', name: 'Silicon Logic', icon: <Code />, subject: 'Computer Science', description: 'Pair programming and architectural review.' },
  { id: 'science', name: 'Quantum Lab', icon: <Microscope />, subject: 'Natural Sciences', description: 'Explore biology, physics, and chemistry concepts.' },
  { id: 'history', name: 'Nexus Archive', icon: <Globe />, subject: 'History & Humanities', description: 'Interactive journey through historical timelines.' },
  { id: 'writing', name: 'Linguistic Forge', icon: <Palette />, subject: 'Writing & Rhetoric', description: 'Advanced essay structuring and creative writing.' },
];

const AITutorStudio: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<TutorScenario>(SCENARIOS[0]);
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [goal, setGoal] = useState<'Homework' | 'Concept' | 'Exam'>('Concept');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSynthesize = () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    // Simulate AI response
    setTimeout(() => {
      setResult(`Based on your ${selectedScenario.subject} request at ${level} level: \n\nLearning Path: \n1. Atomic Foundations of ${input}\n2. Practical Application Synthesis\n3. Recursive Optimization\n\nExplanation: Let's explore the fundamental principles. First, we must understand why ${input} behaves this way in the context of ${selectedScenario.name}...`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-3xl bg-[#10161B] border border-[#26313A] flex items-center justify-center shadow-2xl text-[#8DB8CC]">
                <GraduationCap className="text-[#8DB8CC] w-7 h-7" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Neural Tutor</h1>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em]">Advanced_Learning_Interface_v4.2</p>
            </div>
        </div>

        <div className="flex gap-2 p-1.5 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
          {(['Homework', 'Concept', 'Exam'] as const).map(g => (
            <button 
              key={g} 
              onClick={() => setGoal(g)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer ${goal === g ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Scenarios & Config */}
        <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Knowledge Domains</label>
                    <span className="text-[9px] font-mono text-[#8DB8CC]">{SCENARIOS.length} ACTIVE</span>
                </div>
                <div className="space-y-3">
                    {SCENARIOS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedScenario(s)}
                            className={`w-full flex items-center gap-4 p-5 rounded-[24px] transition-all border cursor-pointer ${selectedScenario.id === s.id ? 'bg-[#10161B] border-[#8DB8CC] ring-1 ring-[#8DB8CC]/30 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedScenario.id === s.id ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-sm' : 'bg-white/5 text-[#8DB8CC]'}`}>
                                {React.cloneElement(s.icon as React.ReactElement<any>, { size: 18 } as any)}
                            </div>
                            <div className="text-left flex-1">
                                <div className={`text-xs font-black uppercase tracking-wide ${selectedScenario.id === s.id ? 'text-white' : 'text-slate-400'}`}>{s.name}</div>
                                <div className="text-[9px] text-[#AFC3CF] font-mono italic">{s.subject}</div>
                            </div>
                            {selectedScenario.id === s.id && <ChevronRight className="text-[#8DB8CC]" size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 border-white/10 bg-[#10161B]/40 space-y-6 rounded-3xl">
                <div className="flex items-center gap-3 text-[#8DB8CC]">
                    <BrainCircuit size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Proficiency Level</span>
                </div>
                <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1 border border-white/5">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map(l => (
                      <button key={l} onClick={() => setLevel(l)} className={`flex-1 py-3 rounded-xl font-mono font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${level === l ? 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                        {l}
                      </button>
                    ))}
                </div>
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <Timer size={12} className="text-[#8DB8CC]" />
                        Next Milestone: Exam Readiness
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            className="h-full bg-[#8DB8CC] shadow-[0_0_10px_rgba(141,184,204,0.5)]"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Interaction */}
        <div className="lg:col-span-8 flex flex-col space-y-8">
            <div className="glass-panel border-white/10 p-8 space-y-8 relative overflow-hidden group rounded-3xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DB8CC]/5 blur-[100px] -z-10 transition-all duration-700 pointer-events-none" />
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[#8DB8CC]">
                            <Sparkles size={18} />
                            <label className="text-xs font-black text-white uppercase tracking-[0.2em]">Learning Command</label>
                        </div>
                        <div className="px-3 py-1 rounded bg-[#10161B] border border-[#26313A] text-[9px] font-mono text-[#8DB8CC] uppercase font-bold">AWAITING_INPUT</div>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-[32px] p-8 text-sm text-slate-200 placeholder:text-slate-700 focus:border-[#8DB8CC]/50 transition-all font-mono outline-none shadow-inner"
                        placeholder={`Explain ${selectedScenario.subject.toLowerCase()} concept, solve a problem, or ask for a study guide...`}
                    />
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSynthesize}
                    disabled={isGenerating || !input.trim()}
                    className={`w-full h-16 rounded-[24px] font-mono font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all cursor-pointer ${isGenerating ? 'bg-white/5 text-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110'}`}
                >
                    {isGenerating ? (
                        <>
                            <Brain className="animate-pulse" size={18} />
                            <span>Synthesizing Knowledge...</span>
                        </>
                    ) : (
                        <>
                            <Target size={18} />
                            <span>Execute Neural Lab</span>
                        </>
                    )}
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {result ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-panel border-white/10 p-10 space-y-8 bg-[#10161B]/60 relative overflow-hidden rounded-3xl"
                    >
                         <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <div className="flex items-center gap-3">
                                <Trophy size={18} className="text-[#8DB8CC]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Synthesis Output</span>
                            </div>
                            <div className="flex gap-4 font-mono text-[9px] text-[#AFC3CF] uppercase tracking-widest">
                                <span>Entropy: 0.12</span>
                                <span>Confidence: 99.4%</span>
                            </div>
                         </div>
                         <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-sans selection:bg-[#8DB8CC]/20">
                            {result}
                         </div>
                         <div className="flex gap-4 pt-6">
                            <button className="flex-1 h-12 rounded-xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 flex items-center justify-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-white transition-all cursor-pointer">
                                <Book size={14} className="text-[#8DB8CC]" />
                                Store in Archive
                            </button>
                            <button className="px-6 h-12 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] hover:brightness-110 flex items-center justify-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm">
                                Next Step
                                <ChevronRight size={14} />
                            </button>
                         </div>
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full border border-dashed border-white flex items-center justify-center">
                            <Lightbulb size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black uppercase tracking-widest">Awaiting Neural Link</h3>
                            <p className="text-[10px] font-mono tracking-[0.2em]">Select a subject and provide learning context to begin.</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AITutorStudio;
