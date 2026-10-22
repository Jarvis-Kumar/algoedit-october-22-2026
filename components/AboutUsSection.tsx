import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, ShieldCheck, Sparkles, Cpu, Award } from 'lucide-react';

export const AboutUsSection: React.FC = () => {
  return (
    <section id="about-us-section" className="py-24 px-6 bg-[#03050c] relative overflow-hidden border-t border-white/5">
      {/* Background ambient light effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[300px] bg-fuchsia-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[250px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1250px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8DB8CC]/10 border border-[#8DB8CC]/20 shadow-[0_0_15px_rgba(141,184,204,0.15)] mb-4"
          >
            <Sparkles size={12} className="text-[#8DB8CC] animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8DB8CC] font-bold">
              Our Mission & Vision
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-white uppercase italic tracking-tight text-glow-blue"
          >
            Crafting the Future of Synthetic Artistry
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm text-gray-400 mt-4 font-sans font-light leading-relaxed"
          >
            AlgoEdit AI Studio is built on the belief that raw human imagination should never be constrained by technical barriers, heavy local hardware rendering overhead, or fragmented creative tools.
          </motion.p>
        </div>

        {/* Centered Mission Details */}
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Mission Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -2 }}
            className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#8DB8CC]/10 border border-[#8DB8CC]/25 text-[#8DB8CC] shrink-0">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1 font-mono">
                  Our Core Mission
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 font-sans font-light leading-relaxed">
                  To design a frictionless, high-contrast digital cockpit where creators can orchestrate video generation, image upscaling, and skeletal visual effects without running expensive server cards.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-400 shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1 font-mono">
                  Global Vision
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 font-sans font-light leading-relaxed">
                  Democratize cinematic rendering. We supply studios and independent designers alike with high-fidelity outputs, private cloud security, and fully commercialized publishing rights.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Team Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2 }}
            className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#AFC3CF]/10 border border-[#AFC3CF]/25 text-[#AFC3CF] shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1 font-mono">
                  The Creative Syndicate
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 font-sans font-light leading-relaxed">
                  We are a unified syndicate of machine learning researchers, high-performance graphics pipeline engineers, and avant-garde interface curators dedicated to fine-tuning the ultimate workspace.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
