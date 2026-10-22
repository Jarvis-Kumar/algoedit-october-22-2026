
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Zap, Star } from 'lucide-react';

const COMPLIMENTS = [
    "Your creative vision is truly unique. That last synthesis was a masterpiece!",
    "I'm seeing a 15% increase in your prompt precision today. Keep it up!",
    "Your style is evolving. I'm detecting a shift towards more cinematic aesthetics.",
    "You've unlocked a new creative layer. Your recent outputs are in the top 5% of quality.",
    "The way you use lighting in your prompts is exceptional. You have a natural eye for detail.",
    "Your writing is becoming more authoritative. Your 'Visionary' score just went up!",
];

const AICompliment: React.FC = () => {
    const [compliment, setCompliment] = useState<string | null>(null);

    useEffect(() => {
        // Show a compliment every 5-10 minutes or after a generation
        const timer = setTimeout(() => {
            setCompliment(COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]);
        }, 5000); // Show first one after 5s for demo

        return () => clearTimeout(timer);
    }, []);

    if (!compliment) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-8 right-8 z-50 max-w-xs"
            >
                <div className="ai-card p-6 bg-[#10161B]/95 backdrop-blur-xl border border-[#26313A] shadow-2xl relative overflow-hidden group">
                    {/* Animated Background Sparkles */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 blur-2xl rounded-full"
                        />
                    </div>

                    <button 
                        onClick={() => setCompliment(null)}
                        className="absolute top-2 right-2 p-1 text-white/40 hover:text-white transition-colors"
                    >
                        <Zap size={12} />
                    </button>

                    <div className="flex gap-4 items-start relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1">
                                <Star size={10} className="text-yellow-400" />
                                AI Insight
                            </div>
                            <p className="text-sm font-bold text-white leading-relaxed">
                                "{compliment}"
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AICompliment;
