
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Share2, 
  Zap, 
  Star, 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Twitter, 
  Linkedin,
  Gift,
  TrendingUp,
  Flame
} from 'lucide-react';
import { User, Achievement, GrowthMetric } from '../types';
import confetti from 'canvas-confetti';

interface GrowthDashboardProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onNavigate: (page: any) => void;
}

const GrowthDashboard: React.FC<GrowthDashboardProps> = ({ user, onUpdateUser, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const referralLink = `${window.location.origin}?ref=${user.referralCode || 'FOUNDER'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'twitter' | 'linkedin') => {
    const text = `I'm using Algo AI Studio to synthesize amazing content! Join as a Founding Member and get bonus tokens. ${referralLink}`;
    const url = platform === 'twitter' 
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    
    window.open(url, '_blank');
    
    // Track share
    const newShareCount = (user.shareCount || 0) + 1;
    onUpdateUser({ shareCount: newShareCount });

    // Reward logic: Share-to-unlock (max 2 times)
    if (newShareCount <= 2) {
      const reward = 500;
      onUpdateUser({ tokens: user.tokens + reward });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      alert(`Shared! You've unlocked ${reward} bonus tokens.`);
    }
  };

  const metrics: GrowthMetric[] = [
    { label: 'Writing Quality', value: '88/100', change: 12, trend: 'up' },
    { label: 'Creative Output', value: user.tokens < 1000 ? 'Rising Star' : 'Power User', change: 23, trend: 'up' },
    { label: 'Network Impact', value: user.referralCount || 0, change: user.referralCount ? 100 : 0, trend: 'up' },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-10 bg-[#0a0a0c] min-h-screen">
      {/* Hero: Founding Member Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-1"
      >
        <div className="relative bg-[#0a0a0c]/90 backdrop-blur-xl rounded-[22px] p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                <Crown size={14} className="text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Founding Member Status</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
                Welcome to the <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                  Inner Circle, {user.name.split(' ')[0]}
                </span>
              </h1>
              <p className="text-gray-400 max-w-xl text-lg">
                As one of our first 1,000 users, you have permanent "Founding Member" status. 
                Enjoy exclusive beta access, discounted pricing, and priority rendering.
              </p>
            </div>
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 p-1 animate-pulse">
                <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center">
                  <Crown size={80} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white text-black px-4 py-2 rounded-xl font-black text-xs shadow-2xl rotate-12">
                EARLY ACCESS
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral & Viral Loop */}
        <div className="lg:col-span-2 space-y-8">
          <div className="ai-card p-8 border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                <Users className="text-cyan-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Grow the Community</h3>
                <p className="text-sm text-gray-500">Invite friends and unlock premium AI limits.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Your Referral Link</span>
                  <div className="flex items-center gap-2">
                    <input 
                      readOnly 
                      value={referralLink}
                      className="bg-transparent text-sm text-white outline-none flex-grow truncate"
                    />
                    <button 
                      onClick={handleCopy}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cyan-500"
                    >
                      {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-xl font-bold transition-all border border-[#1DA1F2]/20"
                  >
                    <Twitter size={18} />
                    Twitter
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] rounded-xl font-bold transition-all border border-[#0077B5]/20"
                  >
                    <Linkedin size={18} />
                    LinkedIn
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift size={18} className="text-fuchsia-500" />
                    <span className="text-sm font-bold text-white">Reward Progress</span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">{user.shareCount || 0}/2 Shares</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-1000"
                    style={{ width: `${Math.min(((user.shareCount || 0) / 2) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {user.shareCount && user.shareCount >= 2 
                    ? "You've unlocked all share rewards! Upgrade to Pro for unlimited credits."
                    : "Share twice to unlock 1,000 bonus tokens. After that, premium logic applies."}
                </p>
              </div>
            </div>
          </div>

          {/* Emotional Engagement: Metrics & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="ai-card p-6 border-white/5 bg-white/[0.02] flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{metric.label}</span>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${metric.trend === 'up' ? 'text-emerald-500' : 'text-gray-500'}`}>
                    <TrendingUp size={12} />
                    +{metric.change}%
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{metric.value}</div>
                <div className="text-[10px] text-gray-600 italic">"You've improved by {metric.change}% this week!"</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievement System */}
        <div className="space-y-8">
          <div className="ai-card p-8 border-white/5 bg-white/[0.02] h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-500" size={20} />
                <h3 className="text-lg font-bold text-white">Achievements</h3>
              </div>
              <span className="text-xs font-mono text-gray-500">{(user.achievements?.length || 0)} Unlocked</span>
            </div>

            <div className="space-y-4">
              {[
                { id: 'first-edit', name: 'First Synthesis', desc: 'Completed your first AI generation.', icon: '✨', unlocked: true },
                { id: 'streak-3', name: 'Consistent Creator', desc: '3-day usage streak.', icon: '🔥', unlocked: user.streakCount && user.streakCount >= 3 },
                { id: 'referral-1', name: 'Evangelist', desc: 'Invited your first friend.', icon: '🤝', unlocked: user.referralCount && user.referralCount >= 1 },
                { id: 'power-user', name: 'Mastermind', desc: 'Used 50+ AI tools.', icon: '🧠', unlocked: false },
              ].map((ach, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${ach.unlocked ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-40 grayscale'}`}
                >
                  <div className="text-2xl">{ach.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{ach.name}</div>
                    <div className="text-[10px] text-gray-500">{ach.desc}</div>
                  </div>
                  {ach.unlocked && <CheckCircle2 size={14} className="ml-auto text-emerald-500" />}
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigate('pricing')}
              className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              View All Badges
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Personality Insights (Emotional Layer) */}
      <div className="ai-card p-10 border-white/5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Zap size={40} className="text-indigo-500" />
          </div>
          <div className="space-y-4 flex-grow text-center lg:text-left">
            <h3 className="text-2xl font-bold text-white tracking-tight">AI Personality Insights</h3>
            <p className="text-gray-400 leading-relaxed italic">
              "Based on your recent syntheses, your creative style is <strong>Visionary & Precise</strong>. 
              You tend to favor cinematic aesthetics with high-contrast lighting. Your writing style is 
              <strong>Authoritative yet Approachable</strong>, perfect for thought leadership."
            </p>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {['Visionary', 'Precise', 'Authoritative', 'Cinematic'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-[#8DB8CC]/10 border border-[#8DB8CC]/30 text-[10px] font-bold text-[#8DB8CC] uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <button className="px-8 py-3 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] rounded-xl font-black uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 cursor-pointer">
              Full Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthDashboard;
