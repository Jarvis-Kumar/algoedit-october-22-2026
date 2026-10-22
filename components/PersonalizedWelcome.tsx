
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Crown, Zap, ArrowRight, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PersonalizedWelcomeProps {
  userName: string;
  onClose: () => void;
  isFoundingMember?: boolean;
}

const PersonalizedWelcome: React.FC<PersonalizedWelcomeProps> = ({ userName, onClose, isFoundingMember }) => {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22d3ee', '#d946ef', '#ffffff']
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-2xl w-full bg-[#0f0f12] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="relative p-12 text-center space-y-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white to-[#AFC3CF] p-1 mx-auto rotate-12">
            <div className="w-full h-full rounded-[22px] bg-[#0f0f12] flex items-center justify-center">
              <Sparkles className="text-white" size={40} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter">
              Welcome to the Future, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF]">
                {userName}
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
              You've just unlocked the most powerful AI synthesis engine on the planet. 
              {isFoundingMember && " As a Founding Member, you have priority access to all our latest models."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Founding Badge', icon: Crown, color: 'text-yellow-400' },
              { label: 'Bonus Tokens', icon: Zap, color: 'text-[#8DB8CC]' },
              { label: 'Early Access', icon: Star, color: 'text-[#AFC3CF]' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                <item.icon className={item.color} size={20} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Start Synthesizing
            <ArrowRight size={20} />
          </button>

          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
            Algo AI Studio &copy; 2026 • Early Access Phase
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalizedWelcome;
