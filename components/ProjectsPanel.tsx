import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Folder, 
    Clock, 
    MoreVertical, 
    Share2, 
    ExternalLink, 
    Box, 
    Grid, 
    Search, 
    Filter, 
    Plus, 
    Trash2, 
    Edit, 
    Copy, 
    Download, 
    Loader2,
    Layout,
    AlertCircle,
    ChevronRight,
    Play
} from 'lucide-react';
import { Project, User, Template } from '../types';
import { ContentService } from '../services/contentService';
import { DraftService } from '../services/draftService';
import { useToast } from './ui/Toast';

interface ProjectsPanelProps {
  user: User | null;
  onNavigate: (page: any, assets?: any) => void;
  mode?: 'projects' | 'templates';
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ user, onNavigate, mode = 'projects' }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (user?.uid) {
      // Auto-prune old drafts (>30 days expiration) on panel entrance
      DraftService.pruneExpiredDrafts(user.uid).catch(console.error);
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [user?.uid, mode]);

  const fetchItems = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      let data: any[] = mode === 'projects' 
        ? await ContentService.getProjects(user.uid) 
        : await ContentService.getTemplates(user.uid);

      if (mode === 'projects') {
        const automatedDrafts = await DraftService.getUserDrafts(user.uid);
        const mappedDrafts = automatedDrafts.map(d => ({
          id: d.toolId,
          name: d.title || 'Automated Draft',
          status: 'draft',
          createdAt: d.updatedAt,
          updatedAt: d.updatedAt,
          isAutomatedDraft: true,
          toolId: d.toolId === 'image-generator' ? 'generate-image' : d.toolId === 'video-generator' ? 'generate-video' : 'writing-assistant',
          assets: []
        }));
        data = [...data, ...mappedDrafts];
      }
      
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || filterStatus === 'recent' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    if (filterStatus === 'recent') {
        result = [...result].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)).slice(0, 5);
    }

    return result;
  }, [items, searchQuery, filterStatus]);

  const handleLaunch = (item: any) => {
    if (item.isAutomatedDraft) {
        onNavigate(item.toolId);
    } else if (mode === 'templates') {
        // Templates launch a specific tool with config
        onNavigate(item.toolId, { templateConfig: item.config });
    } else {
        // Projects open the dashboard or specific last used tool
        onNavigate('home-main', { projectId: item.id });
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    try {
      const id = mode === 'projects' 
        ? await ContentService.createProject({ name: `Untitled Project`, status: 'draft' })
        : await ContentService.createTemplate({ name: 'New Custom Template', toolId: 'ai-image-generator', config: {} });
      
      showToast(`${mode.slice(0, -1)} established successfully.`, 'success');

      // Log custom user activity
      try {
        const itemLabel = mode === 'projects' ? 'project' : 'template';
        const itemDesc = mode === 'projects' ? 'Created a new Untitled canvas project' : 'Created a new custom workspace preset template';
        (window as any).logUserActivity?.(user.uid, 'project_action', itemDesc);
      } catch (e) {
        console.error(e);
      }

      fetchItems();
    } catch (err) {
      showToast('Neural allocation failed.', 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently deconstruct this ${mode.slice(0, -1)}?`)) return;
    try {
      const itemToDelete = items.find(i => i.id === id);
      const itemName = itemToDelete?.name || 'Untitled';

      if (itemToDelete?.isAutomatedDraft) {
        await DraftService.deleteDraft(user?.uid || null, id);
      } else {
        if (mode === 'projects') await ContentService.deleteProject(id);
        else await ContentService.deleteTemplate(id);
      }
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('Neural deconstruction complete.', 'success');

      // Log custom user activity
      try {
        const itemLabel = mode === 'projects' ? 'project' : 'template';
        (window as any).logUserActivity?.(user.uid, 'project_action', `Deconstructed ${itemLabel}: "${itemName}"`);
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      showToast('Operation aborted.', 'error');
    }
  };

    const handleDuplicate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const item = items.find(i => i.id === id);
        if (item?.isAutomatedDraft) {
            showToast('Draft templates are system-managed. Forking is automatic on progress.', 'info');
            return;
        }
        try {
            if (mode === 'projects') await ContentService.duplicateProject(id);
            else await ContentService.duplicateTemplate(id);
            showToast('Neural fork completed.', 'success');
            fetchItems();
        } catch (err) {
            showToast('Duplication failed.', 'error');
        }
    };

    const handleRename = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const item = items.find(i => i.id === id);
        if (item) {
            setRenamingId(id);
            setNewName(item.name);
        }
    };

    const submitRename = async (id: string) => {
        if (!newName.trim()) return;
        try {
            const item = items.find(i => i.id === id);
            if (item?.isAutomatedDraft) {
                const userId = user?.uid || null;
                const saved = await DraftService.getDraft(userId, id);
                await DraftService.saveDraft(userId, id, newName, saved?.state || {});
            } else {
                if (mode === 'projects') await ContentService.updateProject(id, { name: newName });
                else await ContentService.updateTemplate(id, { name: newName });
            }
            setRenamingId(null);
            fetchItems();
            showToast('Identity updated.', 'success');
        } catch (err) {
            showToast('Rename failed.', 'error');
        }
    };

    const handleDownload = (item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", `${item.name}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast('Exporting neural schematic...', 'success');
    };

  const formatDate = (ts: any) => {
      if (!ts) return 'Unknown';
      const date = typeof ts === 'number' ? new Date(ts) : ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
      return (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#8DB8CC] animate-spin" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Neural Repository...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {mode === 'projects' ? 'Active_Canvases' : 'Neural_Workflows'}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {mode === 'projects' ? 'Manage and collaborate on your creative neural nodes' : 'Stored automation patterns for consistent synthesis'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-[#8DB8CC] transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Search identity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-[#8DB8CC] focus:bg-white/[0.08] outline-none transition-all w-full sm:w-64"
                />
            </div>
            
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/5 gap-1">
                {(['all', 'recent', 'active', 'draft'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilterStatus(f)}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filterStatus === f ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="flex p-1 rounded-xl bg-white/5 border border-white/5 gap-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-xl shadow-black/50' : 'text-slate-600 hover:text-slate-400'}`}
                >
                    <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-xl shadow-black/50' : 'text-slate-600 hover:text-slate-400'}`}
                >
                    <Filter size={16} />
                </button>
            </div>

            <button 
                onClick={handleCreate}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
                <Plus size={16} />
                Initialize_{mode.slice(0, -1)}
            </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center p-12 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01]">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-slate-700 animate-pulse">
                {mode === 'projects' ? <Folder size={40} /> : <Layout size={40} />}
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Repository Empty</h3>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-2 mb-8">No results found for current query status</p>
            <button 
                onClick={handleCreate}
                className="px-8 py-3 rounded-xl border border-white/10 text-[10px] font-black text-white hover:bg-white/5 uppercase tracking-widest transition-all cursor-pointer"
            >
                Begin_Initial_Synthesis
            </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
            <AnimatePresence mode="popLayout">
                {filteredItems.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className={`group relative bg-[#050810]/60 border border-white/5 hover:border-[#AFC3CF]/40 rounded-[32px] overflow-hidden transition-all duration-500 backdrop-blur-xl ${viewMode === 'list' ? 'flex items-center p-4' : 'p-8'}`}
                    >
                        {/* Status Glow */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${item.status === 'active' ? 'via-emerald-500/50' : 'via-[#8DB8CC]/50'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                        {viewMode === 'grid' && (
                            <div className="relative aspect-video mb-8 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group/thumb">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-1000" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-800">
                                        <Box size={40} className="group-hover/thumb:scale-110 transition-transform duration-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleLaunch(item)}
                                        className="w-12 h-12 rounded-2xl bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer"
                                    >
                                        <Play size={20} className="fill-white" />
                                    </button>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md border ${item.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#8DB8CC]/20 text-[#8DB8CC] border-[#8DB8CC]/30'}`}>
                                        {item.status || 'Draft'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className={viewMode === 'list' ? "flex-grow flex items-center gap-6" : "space-y-4"}>
                            {viewMode === 'list' && (
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8DB8CC] group-hover:bg-[#8DB8CC]/10 transition-all">
                                    {mode === 'projects' ? <Folder size={20} /> : <Layout size={20} />}
                                </div>
                            )}

                            <div className="flex-grow min-w-0">
                                {renamingId === item.id ? (
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <input 
                                            autoFocus
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && submitRename(item.id)}
                                            onBlur={() => submitRename(item.id)}
                                            className="bg-white/10 border border-[#8DB8CC]/40 focus:border-[#8DB8CC] rounded-lg px-3 py-1 text-sm text-white outline-none w-full"
                                        />
                                    </div>
                                ) : (
                                    <h3 className="text-lg font-black text-white tracking-tight truncate group-hover:text-[#8DB8CC] transition-colors">
                                        {item.name}
                                    </h3>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} />
                                        <span>{formatDate(item.updatedAt || item.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[8px] border border-white/5">
                                        <Box size={10} />
                                        <span>{mode === 'projects' ? `${(item.assets?.length || 0)} Assets` : item.toolId.split('-')[1].toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex gap-3 ${viewMode === 'list' ? 'ml-auto' : 'mt-8 pt-8 border-t border-white/5 justify-between'}`}>
                                {viewMode === 'grid' && (
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-[8px] font-black text-slate-500 group-hover:border-[#8DB8CC]/40 transition-all">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => handleRename(item.id, e)}
                                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                                        title="Rename"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDuplicate(item.id, e)}
                                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                                        title="Duplicate"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDownload(item, e)}
                                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                                        title="Export"
                                    >
                                        <Download size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/10 cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleLaunch(item)}
                                        className="p-3 rounded-2xl bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#AFC3CF]/40 text-[#8DB8CC] hover:text-white shadow-xl active:scale-95 transition-all cursor-pointer"
                                        title="Launch"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ambient Background Glow */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#8DB8CC]/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full pointer-events-none" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      )}
      
      {/* Help Banner */}
      <div className="mt-12 p-10 rounded-[40px] bg-gradient-to-br from-[#10161B] to-[#0A0E12] border border-[#26313A] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-3xl bg-[#050709] border border-[#26313A] flex items-center justify-center text-[#8DB8CC] shadow-2xl">
                  <AlertCircle size={32} />
              </div>
              <div className="flex-grow text-center md:text-left">
                  <h4 className="text-lg font-black text-white italic tracking-tight">Need to synchronize identity across nodes?</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed font-medium">Connect your Creative Cloud, Dropbox, or Decentralized Storage (IPFS) to seamlessly bridge your assets between toolsets.</p>
              </div>
              <button className="px-8 py-3 rounded-2xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:brightness-110 transition-all cursor-pointer">
                  Configure_External_Storage
              </button>
          </div>
      </div>
    </div>
  );
};

export default ProjectsPanel;
