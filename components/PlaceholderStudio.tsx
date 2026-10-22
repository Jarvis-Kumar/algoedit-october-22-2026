
import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Construction, ArrowRight, Zap, Layers, Cpu } from 'lucide-react';

interface PlaceholderStudioProps {
    title: string;
}

const PlaceholderStudio: React.FC<PlaceholderStudioProps> = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-8 text-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8DB8CC]/10 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10161B] border border-[#26313A] text-[#AFC3CF] text-[10px] font-black uppercase tracking-widest">
                    <Construction className="w-3.5 h-3.5 text-[#8DB8CC]" />
                    <span>Laboratory Interface</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic">
                        {title}
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-[#8DB8CC] via-white to-[#AFC3CF] mx-auto rounded-full shadow-[0_0_10px_rgba(141,184,204,0.5)]" />
                </div>

                <p className="text-slate-400 text-sm font-medium max-w-md mx-auto leading-relaxed">
                    The {title} is currently undergoing a neural upgrade. 
                    We are synthesizing advanced AI capabilities to provide you with the next generation of creative tools.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
                    {[
                        { icon: <Zap />, label: 'Quantum Speed', desc: 'Sub-second inference times' },
                        { icon: <Layers />, label: 'Multi-Model', desc: 'Ensemble synthesis' },
                        { icon: <Cpu />, label: 'Neural Link', desc: 'Direct context integration' }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-[24px] bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 transition-all space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-[#050709] border border-[#26313A] flex items-center justify-center text-[#8DB8CC] mx-auto shadow-inner">
                                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 } as any)}
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</h3>
                            <p className="text-[10px] text-slate-400">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-12 px-8 py-4 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 transition-all cursor-pointer"
                >
                    Get Early Access
                    <ArrowRight size={16} />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default PlaceholderStudio;
