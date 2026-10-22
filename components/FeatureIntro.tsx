
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FeatureDefinition } from '../data/features';
import { ChevronDown, ChevronUp, Sparkles, Zap, Info, Lightbulb, Heart } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

interface FeatureIntroProps {
  feature: FeatureDefinition;
  overrideTokenCost?: number | null;
}

const FeatureIntro: React.FC<FeatureIntroProps> = ({ feature, overrideTokenCost }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!feature) return null;

  const displayTokenCost = overrideTokenCost !== undefined && overrideTokenCost !== null ? overrideTokenCost : feature.tokenCost;

  return (
    <div className="mb-6 border-b border-white/5 pb-6">
      <div className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-[#050810]/60 backdrop-blur-xl transition-all duration-500 ${isExpanded ? 'p-8' : 'p-4 md:p-6'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#10161B] border border-[#26313A] text-[#8DB8CC] shadow-lg shadow-black/40">
              {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 24 })}
            </div>
            <div>
              <h2 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1">
                {feature.name}
              </h2>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80 truncate max-w-[200px] md:max-w-md">
                {feature.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FavoriteButton itemId={feature.id} type="tool" showLabel />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10161B] border border-[#26313A] text-[9px] font-black text-[#AFC3CF] uppercase tracking-widest shadow-sm">
              <Zap size={10} className="fill-[#8DB8CC]/20 text-[#8DB8CC]" />
              {displayTokenCost} Tokens
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF]/40 transition-all text-[9px] font-black text-white uppercase tracking-widest group cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={12} />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <Info size={12} />
                  <span>How it works</span>
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 mt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-[#AFC3CF] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                       <Lightbulb size={12} className="text-[#8DB8CC]" /> The Innovation
                    </h4>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                      "{feature.longDescription}"
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-black text-[#AFC3CF] uppercase tracking-[0.2em] mb-3">Key Capabilities</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {feature.whyCool.slice(0, 3).map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#10161B] border border-[#26313A]">
                           <h5 className="text-[9px] font-black text-white uppercase tracking-wider mb-1">{item.title}</h5>
                           <p className="text-[9px] text-[#A8B0B7] font-bold uppercase tracking-tight">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-[#AFC3CF] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                       <Sparkles size={12} className="text-[#8DB8CC]" /> Pro Tip
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#10161B] border border-[#26313A] italic text-xs text-[#AFC3CF] font-medium leading-relaxed">
                      {feature.howItWorks}
                    </div>
                  </div>

                  <div>
                     <h4 className="text-[10px] font-black text-[#AFC3CF] uppercase tracking-[0.2em] mb-3">Usage Scenarios</h4>
                     <div className="flex flex-wrap gap-2">
                        {feature.useCases.map((uc, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-[#10161B] border border-[#26313A] text-[8px] font-black text-[#AFC3CF] uppercase tracking-widest hover:border-[#8DB8CC]/40 transition-colors">
                            {uc.title}
                          </span>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8DB8CC]/5 blur-3xl rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full -z-10" />
      </div>
    </div>
  );
};

export default FeatureIntro;
