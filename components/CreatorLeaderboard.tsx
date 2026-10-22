
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Eye, 
  Heart, 
  TrendingUp, 
  Search, 
  Filter, 
  Crown, 
  Zap, 
  ArrowRight,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { User, CreatorTier } from '../types';

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  country: string;
  countryCode: string;
  picture?: string;
  tier: CreatorTier;
  level: number;
  followers: number;
  likes: number;
  views: number;
  isFoundingMember: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'NeoVisual', email: 'neo@algoedit.com', country: 'United States', countryCode: 'US', tier: 'Visionary', level: 42, followers: 12400, likes: 54000, views: 240000, isFoundingMember: true },
  { id: '2', name: 'NatureAI', email: 'nature@algoedit.com', country: 'Japan', countryCode: 'JP', tier: 'Pro', level: 38, followers: 8900, likes: 32000, views: 150000, isFoundingMember: true },
  { id: '3', name: 'DreamWeaver', email: 'dream@algoedit.com', country: 'United Kingdom', countryCode: 'GB', tier: 'Pro', level: 35, followers: 7200, likes: 28000, views: 120000, isFoundingMember: false },
  { id: '4', name: 'SteamPunk', email: 'steam@algoedit.com', country: 'Germany', countryCode: 'DE', tier: 'Creator', level: 28, followers: 4500, likes: 18000, views: 85000, isFoundingMember: true },
  { id: '5', name: 'CyberArtist', email: 'cyber@algoedit.com', country: 'Brazil', countryCode: 'BR', tier: 'Creator', level: 24, followers: 3200, likes: 12000, views: 60000, isFoundingMember: false },
  { id: '6', name: 'AI_Master', email: 'master@algoedit.com', country: 'France', countryCode: 'FR', tier: 'Explorer', level: 18, followers: 1500, likes: 5000, views: 25000, isFoundingMember: true },
];

const TIER_COLORS: Record<CreatorTier, string> = {
  Explorer: 'from-blue-500 to-cyan-500',
  Creator: 'from-emerald-500 to-teal-500',
  Pro: 'from-indigo-500 to-purple-500',
  Visionary: 'from-fuchsia-500 to-rose-500'
};

const CreatorLeaderboard: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'founding'>('all');

  const filtered = MOCK_LEADERBOARD.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || entry.isFoundingMember;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-[#0a0a0c] min-h-screen p-6 lg:p-12">
      <div className="max-w-screen-xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Trophy size={14} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Global Rankings</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
              Top <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Creators
              </span>
            </h1>
            <p className="text-gray-500 max-w-xl text-lg">
              Meet the visionaries pushing the boundaries of AI synthesis. 
              Follow them to see their latest masterpieces in your feed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search creators..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-cyan-500 outline-none transition-all"
              />
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('founding')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'founding' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Founding
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.slice(0, 3).map((entry, idx) => (
            <motion.div 
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`ai-card p-8 border-white/5 bg-gradient-to-br ${idx === 0 ? 'from-yellow-500/10' : idx === 1 ? 'from-gray-400/10' : 'from-orange-500/10'} relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer`}
              onClick={() => {
                localStorage.setItem('viewing_creator_email', entry.email);
                onNavigate('creator-profile');
              }}
            >
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-all" />
              
              <div className="flex flex-col items-center text-center gap-6 relative z-10">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${TIER_COLORS[entry.tier]} p-1`}>
                      <div className={`w-full h-full rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl`}>
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-white text-black font-black flex items-center justify-center text-sm shadow-xl">
                    {idx + 1}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    {entry.name}
                    {entry.isFoundingMember && <Crown size={16} className="text-yellow-500" />}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${TIER_COLORS[entry.tier]} text-[8px] font-black uppercase tracking-widest text-white`}>
                      {entry.tier}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">Level {entry.level}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 w-full gap-4 pt-6 border-t border-white/5">
                  <div className="text-center">
                    <div className="text-sm font-black text-white">{Math.round(entry.followers / 100) / 10}k</div>
                    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-white">{Math.round(entry.likes / 100) / 10}k</div>
                    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-white">{Math.round(entry.views / 1000)}k</div>
                    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Views</div>
                  </div>
                </div>

                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2">
                  View Profile
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* List View */}
        <div className="ai-card overflow-hidden border-white/5 bg-[#0f0f12]/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Creator</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Tier</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Followers</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Engagement</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-600 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(3).map((entry, idx) => (
                  <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-gray-600">{idx + 4}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TIER_COLORS[entry.tier]} p-0.5`}>
                          <div className={`w-full h-full rounded-[9px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs`}>
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {entry.name}
                            {entry.isFoundingMember && <Crown size={12} className="text-yellow-500" />}
                          </div>
                          <div className="text-[10px] text-gray-500">Level {entry.level}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${TIER_COLORS[entry.tier]} text-[8px] font-black uppercase tracking-widest text-white`}>
                        {entry.tier}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Users size={14} className="text-gray-600" />
                        {entry.followers.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                          <Heart size={14} className="text-rose-500/50" />
                          {entry.likes.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                          <Eye size={14} className="text-cyan-500/50" />
                          {entry.views.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => {
                          localStorage.setItem('viewing_creator_email', entry.email);
                          onNavigate('creator-profile');
                        }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Growth CTA */}
        <div className="ai-card p-12 text-center bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={32} className="text-cyan-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Climb the Leaderboard</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            The more you synthesize, share, and engage, the higher you climb. 
            Top creators get featured in our weekly spotlight and earn <strong>unlimited AI credits</strong>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => onNavigate('studio')}
              className="bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] px-10 py-4 font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 transition-all cursor-pointer"
            >
              Start Creating
            </button>
            <button 
              onClick={() => onNavigate('growth-dashboard')}
              className="ai-button bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-4 font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              My Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLeaderboard;
