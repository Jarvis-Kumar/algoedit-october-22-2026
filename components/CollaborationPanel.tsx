
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Activity, 
  Users, 
  ChevronRight, 
  RotateCcw, 
  User as UserIcon, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  MoreVertical,
  Shield,
  Settings,
  Plus,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import { Project, ProjectVersion, ActivityLog, User, ProjectRole } from '../types';
import { CollaborationService } from '../services/CollaborationService';

interface CollaborationPanelProps {
  project: Project;
  user: User;
  onRestore: (versionId: string) => void;
  onClose: () => void;
  onUpdateProject: (project: Project) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ project, user, onRestore, onClose, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'activity' | 'team'>('history');
  const [search, setSearch] = useState('');

  const filteredHistory = project.versionHistory.filter(v => 
    v.authorName.toLowerCase().includes(search.toLowerCase()) || 
    v.changeSummary.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  const filteredActivity = project.activityLogs.filter(log => 
    log.userName.toLowerCase().includes(search.toLowerCase()) || 
    log.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderHistory = () => (
    <div className="space-y-4">
      {filteredHistory.map((version, idx) => (
        <motion.div 
          key={version.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-cyan-500 uppercase tracking-widest">V{version.versionNumber}</span>
                <span className="text-[10px] text-gray-500">•</span>
                <span className="text-[10px] text-gray-500 font-medium">{new Date(version.timestamp).toLocaleString()}</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{version.changeSummary}</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <UserIcon size={10} className="text-indigo-400" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Edited by {version.authorName}</span>
              </div>
            </div>
            <button 
              onClick={() => onRestore(version.id)}
              className="p-2 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg text-gray-500 transition-all opacity-0 group-hover:opacity-100"
              title="Restore this version"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
      {filteredActivity.map((log, idx) => (
        <motion.div 
          key={log.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="relative pl-10"
        >
          <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-[#0a0a0c] border-2 border-white/10 flex items-center justify-center z-10">
            <div className={`w-1.5 h-1.5 rounded-full ${
              log.type === 'edit' ? 'bg-cyan-500' : 
              log.type === 'generate' ? 'bg-purple-500' : 
              log.type === 'restore' ? 'bg-orange-500' : 'bg-gray-500'
            }`} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{log.userName}</span>
              <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{log.description}</p>
            {log.type === 'edit' && (
              <div className="mt-1 px-2 py-1 rounded bg-white/5 border border-white/5 inline-flex items-center gap-1.5 w-fit">
                <Activity size={10} className="text-cyan-500" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Property Change</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Team Members</h4>
        <button className="flex items-center gap-1.5 text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-all">
          <Plus size={12} />
          Invite
        </button>
      </div>
      {project.members.map((member, idx) => (
        <motion.div 
          key={member.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border border-white/5 text-white font-bold text-xs">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{member.name}</div>
              <div className="text-[10px] text-gray-500">{member.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">
              {member.role}
            </div>
            <button className="p-1.5 text-gray-600 hover:text-white transition-all">
              <MoreVertical size={14} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div 
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="fixed right-0 top-0 bottom-0 w-96 bg-[#0e0e11] border-l border-white/5 z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <History size={20} className="text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Collaboration</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Project: {project.name}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-white/[0.02] border-b border-white/5">
        {[
          { id: 'history', label: 'History', icon: History },
          { id: 'activity', label: 'Activity', icon: Activity },
          { id: 'team', label: 'Team', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white/5 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:border-cyan-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'activity' && renderActivity()}
        {activeTab === 'team' && renderTeam()}
      </div>

      {/* Footer / Status */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400">Live Sync Active</span>
          </div>
          <span className="text-[10px] font-bold text-gray-600">3 Collaborators</span>
        </div>
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((m, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0e0e11] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
              {m.name.charAt(0)}
            </div>
          ))}
          {project.members.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-[#0e0e11] bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CollaborationPanel;
