import { AlgoEditLogo } from "./AlgoEditLogo";

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Page, FeaturePageId, User, OnNavigateType } from '../types';
import { 
  Sparkles, 
  Zap, 
  Monitor,
  Users, 
  Info, 
  Search,
  Bell,
  Sun,
  LogOut,
  User as UserIcon,
  Settings,
  CreditCard,
  History,
  Shield,
  HelpCircle,
  Activity,
  ImageIcon,
  VideoIcon,
  ChevronDown,
  Palette,
  Mic2,
  Scissors,
  Layout,
  Workflow,
  Cpu,
  GraduationCap,
  Box,
  BarChart3,
  Layers,
  ChevronRight,
  MousePointer2,
  ShoppingCart,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Music,
  Volume2,
  Gamepad2,
  FileText,
  Globe,
  CloudLightning,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { featuresData } from '../data/features';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, updateDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';

const WORKSPACE_MODULES = [
  { id: 'team-management', name: 'Team Collaboration', icon: '👥' },
  { id: 'home-main', name: 'Dashboard', icon: '🏠' },
  { id: 'neural-editing', name: 'Neural Engine', icon: '🧠' },
  { id: 'all-ai-models', name: 'Neural Hub', icon: '🚀' },
  { id: 'movie-studio', name: 'Movie Forge', icon: '🎬' },
  { id: 'agent-labs', name: 'Agent Labs', icon: '🤖' },
  { id: 'innovation-hub', name: 'Innovator', icon: '💡' },
  { id: 'image-studio', name: 'Synthesize', icon: '✨' },
  { id: 'writing-assistant', name: 'Compose', icon: '✍️' },
  { id: 'image-editor', name: 'Refine', icon: '🪄' },
  { id: 'style-transfer', name: 'Style', icon: '🎨' },
  { id: 'batch-edit', name: 'Automate', icon: '⚙️' },
  { id: 'automation-studio', name: 'Pro Studio', icon: '🚀' },
  { id: 'wallpaper-generator', name: 'Wallpaper', icon: '📱' },
  { id: 'poster-automation', name: 'Poster Forge', icon: '🖼️' },
  { id: 'smart-draw-to-edit', name: 'Smart Edit', icon: '🎯' },
  { id: 'interior-redesign', name: 'Interior', icon: '🏠' },
  { id: 'ideation', name: 'Nexus AI', icon: '🧠' },
];

interface HeaderProps {
  currentPage: Page | FeaturePageId;
  activeStudioPage?: FeaturePageId;
  onNavigate: OnNavigateType;
  user: User | null;
  onSignOut: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

const Header: React.FC<HeaderProps> = memo(({ currentPage, activeStudioPage, onNavigate, user, onSignOut, onUpdateUser, isSidebarOpen = true, onToggleSidebar, onBack, canGoBack }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredItem(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150);
  };

  const megaMenuData: Record<string, { title: string; sections: { label: string; items: { label: string; id: string; icon: React.ReactNode }[] }[] }> = {
    'ai-creation': {
      title: 'AI Creation Suite',
      sections: [
        {
          label: 'Visual Engine',
          items: [
            { label: 'Pro Imaging AI', id: 'image-studio', icon: <ImageIcon size={14} /> },
            { label: 'High-Res Studio', id: 'image-studio', icon: <Monitor size={14} /> },
            { label: 'Design Typo Engine', id: 'image-studio', icon: <Sparkles size={14} /> },
            { label: 'Vector Genesis', id: 'image-studio', icon: <Palette size={14} /> },
            { label: 'Brand Identity', id: 'brand-identity', icon: <Palette size={14} /> },
          ]
        },
        {
          label: 'Cinematic Video',
          items: [
            { label: 'Cinematic Motion', id: 'video-studio', icon: <VideoIcon size={14} /> },
            { label: 'Studio Motion Gen', id: 'video-studio', icon: <Monitor size={14} /> },
            { label: 'Ultra Motion Flow', id: 'video-studio', icon: <Zap size={14} /> },
            { label: 'Story-to-Video', id: 'movie-studio', icon: <History size={14} /> },
            { label: 'AI Movie Studio', id: 'movie-studio', icon: <VideoIcon size={14} /> },
          ]
        },
        {
          label: 'Audio & Voice',
          items: [
            { label: 'Neural Voice Pro', id: 'writing-assistant', icon: <Mic2 size={14} /> },
            { label: 'Voice Cloning', id: 'writing-assistant', icon: <Mic2 size={14} /> },
            { label: 'AI Music Gen', id: 'writing-assistant', icon: <Music size={14} /> },
            { label: 'Dubbing AI', id: 'writing-assistant', icon: <Volume2 size={14} /> },
          ]
        }
      ]
    },
    'ai-editing': {
      title: 'AI Editing & Design',
      sections: [
        {
          label: 'Smart Editing',
          items: [
            { label: 'BG Removal', id: 'image-editor', icon: <Scissors size={14} /> },
            { label: 'AI Inpainting', id: 'image-editor', icon: <ImageIcon size={14} /> },
            { label: 'Object Erase', id: 'image-editor', icon: <Scissors size={14} /> },
            { label: 'Face Enhance', id: 'image-editor', icon: <UserIcon size={14} /> },
            { label: 'AI Neural Engine', id: 'neural-editing', icon: <Cpu size={14} /> },
          ]
        },
        {
          label: 'Design Hub',
          items: [
            { label: 'AI Poster Forge', id: 'poster-automation', icon: <Palette size={14} /> },
            { label: 'UI Generator', id: 'studio-dashboard', icon: <Layout size={14} /> },
            { label: 'Template Market', id: 'marketplace', icon: <Layers size={14} /> },
            { label: 'Animation Pack', id: 'assets-panel', icon: <Zap size={14} /> },
            { label: 'Branding Studio', id: 'brand-identity', icon: <Palette size={14} /> },
          ]
        },
        {
          label: 'Next-Gen 3D',
          items: [
            { label: 'Text-to-3D', id: 'placeholder-studio', icon: <Box size={14} /> },
            { label: 'Image-to-3D', id: 'placeholder-studio', icon: <Box size={14} /> },
            { label: 'Game Assets', id: 'placeholder-studio', icon: <Gamepad2 size={14} /> },
            { label: '3D Environments', id: 'placeholder-studio', icon: <Monitor size={14} /> },
          ]
        }
      ]
    },
    'ai-productivity': {
      title: 'Business & Productivity',
      sections: [
        {
          label: 'Writing & Logic',
          items: [
            { label: 'Research AI', id: 'writing-assistant', icon: <Search size={14} /> },
            { label: 'Content Factory', id: 'writing-assistant', icon: <FileText size={14} /> },
            { label: 'Code assistant', id: 'writing-assistant', icon: <Cpu size={14} /> },
            { label: 'Summarizer', id: 'writing-assistant', icon: <FileText size={14} /> },
          ]
        },
        {
          label: 'Workflow',
          items: [
            { label: 'Automation', id: 'automation-studio', icon: <Workflow size={14} /> },
            { label: 'Multi-Agent', id: 'agent-labs', icon: <Users size={14} /> },
            { label: 'OS Workspace', id: 'studio-dashboard', icon: <LayoutDashboard size={14} /> },
            { label: 'Lead Gen AI', id: 'growth-dashboard', icon: <BarChart3 size={14} /> },
          ]
        },
        {
          label: 'Education',
          items: [
            { label: 'AI Tutor', id: 'why-choose-us', icon: <GraduationCap size={14} /> },
            { label: 'Homework Help', id: 'why-choose-us', icon: <BookOpen size={14} /> },
            { label: 'Visual Learning', id: 'why-choose-us', icon: <Monitor size={14} /> },
            { label: 'Quiz Maker', id: 'why-choose-us', icon: <FileText size={14} /> },
          ]
        }
      ]
    },
    'system-hub': {
      title: 'System & Discovery',
      sections: [
        {
          label: 'Discovery',
          items: [
            { label: 'Public Hub', id: 'public-showcase', icon: <Globe size={14} /> },
            { label: 'Global Ranking', id: 'creator-leaderboard', icon: <Activity size={14} /> },
            { label: 'Marketplace', id: 'marketplace', icon: <ShoppingCart size={14} /> },
          ]
        },
        {
          label: 'Management',
          items: [
            { label: 'Token Center', id: 'token-system', icon: <Zap size={14} /> },
            { label: 'Creative Exp', id: 'creator-profile', icon: <Sparkles size={14} /> },
            { label: 'Team Portal', id: 'team-management', icon: <Users size={14} /> },
            { label: 'Analytics', id: 'growth-dashboard', icon: <BarChart3 size={14} /> },
          ]
        },
        {
          label: 'Models',
          items: [
            { label: 'Neural Pure', id: 'image-studio', icon: <CloudLightning size={14} /> },
            { label: 'Motion High-Def', id: 'video-studio', icon: <Zap size={14} /> },
            { label: 'Intelligence Core', id: 'writing-assistant', icon: <Cpu size={14} /> },
            { label: 'Smart Segmentation', id: 'image-editor', icon: <Scissors size={14} /> },
          ]
        }
      ]
    }
  };

  // Use useCallback for toggle functions for stability
  const toggleProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(prev => !prev);
    setShowNotifications(false);
  }, []);

  const toggleNotifications = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    setShowProfileMenu(false);
    
    // Mark as read when opened
    if (nextState && user?.uid && user?.notifications) {
      const unread = user.notifications.filter(n => !n.read);
      if (unread.length > 0) {
        const path = `users/${user.uid}/notifications`;
        try {
          const batch = writeBatch(db);
          unread.forEach(n => {
            const ref = doc(db, 'users', user.uid, 'notifications', n.id);
            batch.update(ref, { read: true });
          });
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }
  }, [showNotifications, user?.notifications, user?.uid]);

  const clearNotifications = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid || !user?.notifications) return;
    
    const path = `users/${user.uid}/notifications`;
    try {
      const batch = writeBatch(db);
      user.notifications.forEach(n => {
        const ref = doc(db, 'users', user.uid, 'notifications', n.id);
        batch.delete(ref);
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }, [user?.uid, user?.notifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(target)) {
        setShowWorkspaceMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  const searchResults = React.useMemo(() => 
    searchQuery.length > 1 
      ? (Object.values(featuresData) as any[]).filter(f => 
          f && (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          f.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 5)
      : [],
    [searchQuery]);

  return (
    <header className="w-full bg-[#050709]/85 border-b border-[#26313A] h-20 flex-shrink-0 z-[60] relative pointer-events-auto backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="w-full h-full px-8 flex items-center justify-between gap-12">
        
        {/* Left Section: Nav Tools */}
        <div className="flex items-center gap-6 h-full font-sans">
          <button 
             onClick={() => onNavigate('home')}
             className="flex items-center gap-2 cursor-pointer relative z-10 p-1.5 rounded-2xl hover:opacity-90 transition-opacity"
             title="ALGOEDIT AI STUDIO Home"
          >
             <AlgoEditLogo size="md" showText={true} />
          </button>

          {canGoBack && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-4 h-11 rounded-2xl bg-gradient-to-b from-[#10161B] to-[#0A0E12] hover:from-[#1A2229] hover:to-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 text-[#E8F0F4] hover:text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] active:scale-98 z-10 cursor-pointer group"
              title="Return to previous screen"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back</span>
            </button>
          )}

          {onToggleSidebar && (
            <button 
               onClick={onToggleSidebar}
               className="p-3 rounded-2xl transition-all cursor-pointer border border-[#26313A] bg-[#0A0E12] hover:border-[#AFC3CF]/40 hover:bg-[#10161B] relative z-10 flex items-center justify-center text-[#AFC3CF] hover:text-white h-11 w-11 shadow-[0_0_12px_rgba(0,0,0,0.3)]"
               title={isSidebarOpen ? "Hide Workspace Sidebar" : "Show Workspace Sidebar"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose size={18} className="text-[#A8B0B7] hover:text-white transition-colors" />
              ) : (
                <PanelLeftOpen size={18} className="text-[#AFC3CF] hover:text-white animate-pulse" />
              )}
            </button>
          )}

          {/* Workspace Dropdown Button */}
          <div className="relative h-full flex items-center" ref={workspaceMenuRef}>
            <button
              onClick={() => setShowWorkspaceMenu(prev => !prev)}
              className={`px-4 h-11 rounded-xl bg-gradient-to-b from-[#10161B] to-[#0A0E12] border border-[#26313A] hover:border-[#AFC3CF]/40 hover:from-[#1A2229] hover:to-[#10161B] text-white font-black text-[11px] sm:text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] active:scale-98 relative z-10 cursor-pointer ${
                showWorkspaceMenu ? 'ring-2 ring-white/20 border-[#AFC3CF]' : ''
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] animate-pulse" />
              <span>Workspace</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${showWorkspaceMenu ? 'rotate-180 text-white' : ''}`} />
            </button>

            <AnimatePresence>
              {showWorkspaceMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute left-0 top-[85%] mt-2.5 z-[150] w-[620px] bg-[#0A0E12]/98 border border-[#26313A] rounded-2xl p-4 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-3xl grid grid-cols-2 gap-2 max-h-[75vh] overflow-y-auto custom-scrollbar"
                >
                  <div className="col-span-2 px-3 py-1.5 border-b border-white/5 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.25em]">Neural Core Workspaces</span>
                    <span className="text-[9px] font-mono text-[#AFC3CF] uppercase tracking-widest">17 Active Modules</span>
                  </div>
                  
                  {WORKSPACE_MODULES.map((mod) => {
                    const isSelected = currentPage === 'studio' && activeStudioPage === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          onNavigate(mod.id as any);
                          setShowWorkspaceMenu(false);
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-between border cursor-pointer ${
                          isSelected 
                            ? 'bg-white/15 text-white border-white/30 shadow-[0_4px_25px_rgba(255,255,255,0.1)] font-black scale-[1.02]' 
                            : 'text-slate-300 border-white/5 bg-white/[0.02] hover:bg-white/10 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">{mod.icon}</span>
                          <span className="font-mono uppercase tracking-wider text-[11px]">{mod.name}</span>
                        </div>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] shadow-[0_0_10px_#8DB8CC]" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-8 pl-4 h-full">
             {[
               { icon: <Zap size={22} />, id: 'ai-creation', label: 'Creation' },
               { icon: <Monitor size={22} />, id: 'ai-editing', label: 'Editing' },
               { icon: <Workflow size={22} />, id: 'ai-productivity', label: 'Productivity' },
               { icon: <LayoutDashboard size={22} />, id: 'system-hub', label: 'System' }
             ].map((item, i) => (
               <div 
                 key={i} 
                 className="relative h-full flex items-center"
                 onMouseEnter={() => handleMouseEnter(item.id)}
                 onMouseLeave={handleMouseLeave}
               >
                 <button 
                   onClick={() => {
                     // Find first sub-item to navigate to if categorical icon clicked
                     const firstItemId = megaMenuData[item.id]?.sections[0]?.items[0]?.id;
                     if (firstItemId) onNavigate(firstItemId as any);
                     setHoveredItem(null);
                   }}
                   className={`text-slate-500 hover:text-white transition-all transform hover:scale-110 relative group cursor-pointer z-10 ${hoveredItem === item.id ? 'text-white' : ''}`}
                 >
                   {item.icon}
                   <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                     {item.label}
                   </span>
                 </button>

                 <AnimatePresence>
                   {hoveredItem === item.id && (
                     <motion.div
                       initial={{ opacity: 0, y: 15, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 15, scale: 0.95 }}
                       className="absolute top-[85%] left-0 translate-x-[-10%] mt-2 w-[580px] bg-[#0A0E12]/98 border border-[#26313A] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] z-[120] backdrop-blur-xl p-6 grid grid-cols-3 gap-6 transform-gpu will-change-transform"
                     >
                       {megaMenuData[item.id]?.sections.map((section, idx) => (
                         <div key={idx} className="space-y-3">
                            <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/5">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC]" />
                               <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{section.label}</span>
                            </div>
                            <div className="space-y-1">
                               {section.items.map((subItem) => (
                                 <button
                                   key={subItem.id + subItem.label}
                                   onClick={() => {
                                     onNavigate(subItem.id as any);
                                     setHoveredItem(null);
                                   }}
                                   className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl text-left transition-all group/subitem cursor-pointer"
                                 >
                                   <div className="flex items-center gap-3">
                                      <div className="text-slate-500 group-hover/subitem:text-[#8DB8CC] transition-colors">
                                        {subItem.icon}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 group-hover/subitem:text-white uppercase tracking-wider italic transition-colors">
                                        {subItem.label}
                                      </span>
                                   </div>
                                   <ChevronRight size={10} className="text-slate-700 group-hover/subitem:text-[#8DB8CC] group-hover/subitem:translate-x-0.5 transition-all" />
                                 </button>
                               ))}
                            </div>
                         </div>
                       ))}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             ))}
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-grow max-w-2xl relative z-10">
           <div className={`relative flex items-center transition-all duration-500 ${searchFocused ? 'scale-[1.01]' : ''}`}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, features, models..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="w-full bg-[#0A0E12] border border-[#26313A] rounded-xl py-3 pl-6 pr-14 text-xs font-medium text-[#F5F7F8] placeholder-[#6F7982] focus:outline-none focus:border-[#AFC3CF] transition-all shadow-inner relative z-10"
              />
              <div className={`absolute right-4 p-2 transition-colors z-20 ${searchFocused ? 'text-white' : 'text-[#6F7982]'}`}>
                <Search size={18} />
              </div>
           </div>

           {/* Search Results Dropdown */}
           <AnimatePresence>
             {searchFocused && searchResults.length > 0 && (
               <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#10161B] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100] backdrop-blur-xl will-change-transform"
               >
                 {searchResults.map((result) => (
                   <button
                    key={result.id}
                    onClick={() => {
                      onNavigate(result.id);
                      setSearchQuery('');
                      setSearchFocused(false);
                    }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left border-b border-white/5 last:border-0 group cursor-pointer"
                   >
                     <div className="p-2 rounded-lg bg-white/10 text-white group-hover:bg-white group-hover:text-[#050709] transition-all">
                       {result.icon ? React.cloneElement(result.icon as React.ReactElement, { size: 18 } as any) : <Sparkles size={18} />}
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[11px] font-black text-white italic uppercase tracking-tighter">{result.name}</span>
                       <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">{result.category}</span>
                     </div>
                   </button>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Right Section: System Actions */}
        <div className="flex items-center gap-8 relative z-10 h-full">
           <div className="flex items-center gap-4 h-full">
              <button 
                onClick={() => onNavigate('team-management' as any)}
                className={`p-2.5 transition-all rounded-lg group cursor-pointer relative ${currentPage === 'team-management' ? 'text-white bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Team Collaboration & Enterprise Management"
              >
                 <Users size={20} />
                 <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                   Team Portal
                 </span>
              </button>
              <button 
                onClick={() => onNavigate('pricing' as any)}
                className="p-2.5 text-slate-400 hover:text-white transition-all hover:bg-white/5 rounded-lg group cursor-pointer relative"
                title="Pricing & Tokens"
              >
                 <CreditCard size={20} />
                 <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                   Billing
                 </span>
              </button>
              <div 
                className="relative h-full flex items-center" 
                ref={notificationMenuRef}
                onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}
              >
                <button 
                  onClick={toggleNotifications}
                  className={`p-2.5 transition-all hover:bg-white/5 rounded-lg relative cursor-pointer ${showNotifications ? 'text-[#8DB8CC] bg-white/5' : 'text-slate-500 hover:text-white'}`}
                >
                   <Bell size={20} />
                   {user?.notifications && user.notifications.some(n => !n.read) && (
                     <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#8DB8CC] rounded-full border-2 border-[#050709] shadow-[0_0_8px_rgba(141,184,204,0.8)]" />
                   )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                     <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full right-0 mt-4 w-80 bg-[#10161B] border border-white/10 rounded-2xl shadow-2xl p-4 backdrop-blur-xl z-[110] overflow-hidden will-change-transform"
                    >
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Notifications</span>
                        <button 
                          onClick={clearNotifications}
                          className="text-[9px] font-bold text-[#AFC3CF] uppercase cursor-pointer hover:underline"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                        {user?.notifications && user.notifications.length > 0 ? (
                          user.notifications.map((notif) => (
                            <div key={notif.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors cursor-pointer group">
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#AFC3CF]">
                                  {notif.icon === 'zap' && <Zap size={14} />}
                                  {notif.icon === 'sparkles' && <Sparkles size={14} />}
                                  {notif.icon === 'user' && <UserIcon size={14} />}
                                  {notif.icon === 'bell' && <Bell size={14} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">{notif.title}</span>
                                  <p className="text-[9px] text-slate-400 mt-1">{notif.desc}</p>
                                  <span className="text-[8px] text-slate-600 mt-1 uppercase font-bold">{notif.time}</span>
                                </div>
                                {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-[#8DB8CC] mt-1" />}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No new updates</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div 
              onClick={() => onNavigate('pricing')}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 shadow-sm text-xs font-bold text-slate-200 transition-all cursor-pointer group select-none mr-2"
            >
              <Sparkles size={14} className="text-[#8DB8CC] animate-pulse group-hover:scale-110 transition-transform" />
              <span>{(user ? user.tokens : 30).toLocaleString()} <span className="text-slate-400 font-medium">Credits</span></span>
            </div>

            {user ? (
              <div 
                className="relative h-full flex items-center" 
                ref={profileMenuRef}
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button 
                   onClick={toggleProfile}
                   className={`flex items-center gap-3 cursor-pointer group bg-[#10161B] border rounded-full py-1.5 pl-2 pr-6 transition-all duration-300 shadow-xl outline-none ${showProfileMenu ? 'border-[#8DB8CC] ring-2 ring-[#8DB8CC]/20' : 'border-[#26313A] hover:border-[#8DB8CC]'}`}
                >
                  <div className="relative">
                     {user.picture ? (
                       <img 
                          src={user.picture} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-[#8DB8CC]/50"
                       />
                     ) : (
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10161B] to-[#26313A] flex items-center justify-center text-white text-[10px] font-black border border-white/10 italic">
                         {user.name.charAt(0).toUpperCase()}
                       </div>
                     )}
                     <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#8DB8CC] rounded-full border-2 border-[#0A0D18]" />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                     <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-white italic uppercase tracking-tighter max-w-[100px] truncate">{user.name}</span>
                        <ChevronDown size={14} className={`text-slate-500 group-hover:text-white transition-all duration-300 ${showProfileMenu ? 'rotate-180 text-white' : ''}`} />
                     </div>
                     <span className="text-[9px] font-black text-[#AFC3CF] uppercase tracking-widest leading-none mt-0.5">{user.creatorTier || 'Explorer'}</span>
                  </div>
               </button>

               <AnimatePresence>
                 {showProfileMenu && (
                   <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full right-0 mt-4 w-64 bg-[#10161B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-[110] will-change-transform"
                   >
                      <div className="p-4 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Account Status</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-black text-white uppercase italic">Active_Session</span>
                          <div className="px-2 py-0.5 bg-[#8DB8CC]/20 rounded-full border border-[#8DB8CC]/30">
                            <span className="text-[8px] font-black text-[#8DB8CC] uppercase tracking-widest">Online</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        {[
                          { label: 'Profile', icon: <UserIcon size={14} />, id: 'creator-profile' },
                          { label: 'Dashboard', icon: <Activity size={14} />, id: 'growth-dashboard' },
                          { label: 'Billing', icon: <CreditCard size={14} />, id: 'pricing' },
                          { label: 'History', icon: <History size={14} />, id: 'public-showcase' },
                          { label: 'Settings', icon: <Settings size={14} />, id: 'team-management' },
                          { label: 'Support', icon: <HelpCircle size={14} />, id: 'why-choose-us' },
                        ].map((item) => (
                          <button 
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.id as any);
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group cursor-pointer"
                          >
                            <div className="text-slate-500 group-hover:text-white">{item.icon}</div>
                            <span className="text-[11px] font-bold uppercase tracking-widest italic">{item.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-white/5">
                        <button 
                          onClick={() => {
                            onSignOut();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest italic">Terminate_Session</span>
                        </button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           ) : (
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => onNavigate('signin' as any)}
                 className="px-6 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer"
               >
                 Sign In
               </button>
               <button 
                 onClick={() => onNavigate('signin' as any)}
                 className="px-7 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#050709] bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] cursor-pointer border border-white/50"
               >
                 Join Studio
               </button>
             </div>
           )}
        </div>

      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;

