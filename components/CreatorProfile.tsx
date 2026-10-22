import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Settings, 
  Share2, 
  Trophy, 
  Users, 
  Eye, 
  Heart, 
  Grid, 
  List, 
  Twitter, 
  Linkedin, 
  Instagram, 
  ExternalLink,
  Zap,
  Crown,
  CheckCircle2,
  Camera,
  Loader2,
  Folder,
  Plus,
  CreditCard,
  Lock,
  Sparkles,
  Play,
  X,
  Clock,
  Globe,
  MapPin,
  MessageSquare,
  Send,
  Check,
  ArrowLeft,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { User, Project, CreatorTier } from '../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ContentService } from '../services/contentService';

interface CreatorProfileProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onNavigate: (page: any, data?: any) => void;
  isOwnProfile?: boolean;
}

const TIER_COLORS: Record<CreatorTier, string> = {
  Explorer: 'from-blue-500 to-cyan-500',
  Creator: 'from-emerald-500 to-teal-500',
  Pro: 'from-indigo-500 to-purple-500',
  Visionary: 'from-fuchsia-500 to-rose-500'
};

const GLOBAL_CREATORS_MOCK = [
  { id: '1', name: 'NeoVisual', email: 'neo@algoedit.com', country: 'United States', countryCode: 'US', tier: 'Visionary' as CreatorTier, level: 42, followers: 12400, likes: 54000, views: 240000, isFoundingMember: true },
  { id: '2', name: 'NatureAI', email: 'nature@algoedit.com', country: 'Japan', countryCode: 'JP', tier: 'Pro' as CreatorTier, level: 38, followers: 8900, likes: 32000, views: 150000, isFoundingMember: true },
  { id: '3', name: 'DreamWeaver', email: 'dream@algoedit.com', country: 'United Kingdom', countryCode: 'GB', tier: 'Pro' as CreatorTier, level: 35, followers: 7200, likes: 28000, views: 120000, isFoundingMember: false },
  { id: '4', name: 'SteamPunk', email: 'steam@algoedit.com', country: 'Germany', countryCode: 'DE', tier: 'Creator' as CreatorTier, level: 28, followers: 4500, likes: 18000, views: 85000, isFoundingMember: true },
  { id: '5', name: 'CyberArtist', email: 'cyber@algoedit.com', country: 'Brazil', countryCode: 'BR', tier: 'Creator' as CreatorTier, level: 24, followers: 3200, likes: 12000, views: 60000, isFoundingMember: false },
  { id: '6', name: 'AI_Master', email: 'master@algoedit.com', country: 'France', countryCode: 'FR', tier: 'Explorer' as CreatorTier, level: 18, followers: 1500, likes: 5000, views: 25000, isFoundingMember: true },
];

const CreatorProfile: React.FC<CreatorProfileProps> = ({ user, onUpdateUser, onNavigate }) => {
  const [viewedCreator, setViewedCreator] = useState<any | null>(() => {
    const email = localStorage.getItem('viewing_creator_email');
    if (!email || email.toLowerCase() === user.email.toLowerCase()) return null;
    
    const found = GLOBAL_CREATORS_MOCK.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (found) {
      return {
        uid: `user_${found.id}`,
        name: found.name,
        email: found.email,
        username: found.name.toLowerCase(),
        picture: '',
        userTier: found.tier === 'Visionary' ? 'enterprise' : found.tier === 'Pro' ? 'pro' : 'creator',
        creatorTier: found.tier,
        creatorLevel: found.level,
        bio: `Professional ${found.tier} from ${found.country}. Passionate about AI graphics, style-transfers, and visual media synthesis.`,
        country: found.country,
        countryCode: found.countryCode,
        followersCount: found.followers,
        likesCount: found.likes,
        viewsCount: found.views,
        isFoundingMember: found.isFoundingMember,
        socialLinks: {
          twitter: `https://twitter.com/${found.name.toLowerCase()}`,
          linkedin: `https://linkedin.com/in/${found.name.toLowerCase()}`,
          instagram: `https://instagram.com/${found.name.toLowerCase()}`
        }
      };
    }
    return null;
  });

  const isOwnProfile = !viewedCreator;
  const currentProfileUser = viewedCreator || user;

  const [loggedInFollowing, setLoggedInFollowing] = useState<string[]>(() => {
    const saved = localStorage.getItem(`algoedit_following_${user.email}`);
    if (saved) return JSON.parse(saved);
    return user.following || [];
  });

  const isFollowed = loggedInFollowing.map(e => e.toLowerCase()).includes(currentProfileUser.email.toLowerCase());

  const [viewedFollowersCount, setViewedFollowersCount] = useState<number>(() => {
    if (isOwnProfile) {
      const defaultF = user.followers?.length || 1420;
      return defaultF;
    }
    const base = currentProfileUser.followersCount || 1200;
    const isCurrentlyFollowed = JSON.parse(localStorage.getItem(`algoedit_following_${user.email}`) || '[]')
      .map((e: string) => e.toLowerCase()).includes(currentProfileUser.email.toLowerCase());
    return isCurrentlyFollowed ? base + 1 : base;
  });

  const viewedFollowingCount = isOwnProfile ? loggedInFollowing.length : Math.floor((currentProfileUser.creatorLevel || 5) * 12.4);

  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, time: string}[]>(() => {
    if (isOwnProfile) return [];
    const saved = localStorage.getItem(`algoedit_chat_${user.email}_${currentProfileUser.email}`);
    if (saved) return JSON.parse(saved);
    return [
      { sender: currentProfileUser.name, text: `Hey there! Thanks for following me. I'm ${currentProfileUser.name} from ${currentProfileUser.country || 'abroad'}. I saw your profile and love your art direction! Let's share some cool ideas or collaborate on our projects!`, time: 'Just now' }
    ];
  });
  const [typedMessage, setTypedMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'showcase' | 'stats' | 'achievements'>('showcase');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic States
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  // Edit fields profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editTwitter, setEditTwitter] = useState(user.socialLinks?.twitter || '');
  const [editLinkedin, setEditLinkedin] = useState(user.socialLinks?.linkedin || '');
  const [editInstagram, setEditInstagram] = useState(user.socialLinks?.instagram || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- ACTIONS HANDLERS ---
  const handleToggleFollow = () => {
    if (isOwnProfile) return;
    
    let updatedFollowing: string[];
    if (isFollowed) {
      updatedFollowing = loggedInFollowing.filter(e => e.toLowerCase() !== currentProfileUser.email.toLowerCase());
      setViewedFollowersCount(prev => prev - 1);
    } else {
      updatedFollowing = [...loggedInFollowing, currentProfileUser.email];
      setViewedFollowersCount(prev => prev + 1);
    }
    
    setLoggedInFollowing(updatedFollowing);
    localStorage.setItem(`algoedit_following_${user.email}`, JSON.stringify(updatedFollowing));
    onUpdateUser({ following: updatedFollowing });
    
    // Log activity
    logLocalUserActivity('social', isFollowed ? `Unfollowed creator ${currentProfileUser.name}` : `Followed creator ${currentProfileUser.name} (${currentProfileUser.country})`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg = {
      sender: user.name,
      text: typedMessage.trim(),
      time: 'Just now'
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setTypedMessage('');
    localStorage.setItem(`algoedit_chat_${user.email}_${currentProfileUser.email}`, JSON.stringify(updated));

    // Simulate creator reply
    setTimeout(() => {
      const responses = [
        `That sounds like a fantastic idea! We should definitely collaborate on this. Have you checked out our shared workspace yet?`,
        `I really appreciate you reaching out! I've been working on a new set of custom prompts and would love to get your feedback on them.`,
        `That's awesome! Let's team up. If you invite me to your team workspace, I can jump right in and help build out these design layouts!`,
        `Haha love that! Let's coordinate our design sprints. Feel free to invite me as a team member so we have a unified board!`
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const replyMsg = {
        sender: currentProfileUser.name,
        text: randomResponse,
        time: 'Just now'
      };
      const finalMsgs = [...updated, replyMsg];
      setChatMessages(finalMsgs);
      localStorage.setItem(`algoedit_chat_${user.email}_${currentProfileUser.email}`, JSON.stringify(finalMsgs));
    }, 1200);
  };

  const handleInviteToTeam = () => {
    try {
      const saved = localStorage.getItem(`algoedit_workspaces_${user.email}`);
      let currentWorkspaces: any[] = [];
      if (saved) {
        currentWorkspaces = JSON.parse(saved);
      } else {
        // default workspaces
        currentWorkspaces = [
          {
            id: 'ws-1',
            orgId: 'org-1',
            name: 'Marketing Team',
            projects: ['p-1', 'p-2'],
            members: [
              { userId: user.email, role: 'Owner' },
              { userId: 'sarah@example.com', role: 'Admin' },
              { userId: 'marcus@example.com', role: 'Editor' }
            ]
          }
        ];
      }
      
      const activeWs = currentWorkspaces[0];
      if (!activeWs) {
        alert('Please set up or select a workspace first in the Team Management page.');
        return;
      }
      
      const isAlreadyMember = activeWs.members.some((m: any) => m.userId.toLowerCase() === currentProfileUser.email.toLowerCase());
      if (isAlreadyMember) {
        alert(`${currentProfileUser.name} is already a member of your workspace!`);
        return;
      }
      
      activeWs.members.push({
        userId: currentProfileUser.email.toLowerCase(),
        role: 'Team Member'
      });
      
      localStorage.setItem(`algoedit_workspaces_${user.email}`, JSON.stringify(currentWorkspaces));
      alert(`Successfully invited ${currentProfileUser.name}! They are now a team member in your "${activeWs.name}" workspace.`);
    } catch (err) {
      console.error('Error inviting teammate:', err);
      alert('Failed to invite to team.');
    }
  };

  // Sync state if parent user object changes
  useEffect(() => {
    setEditName(user.name);
    setEditUsername(user.username || '');
    setEditBio(user.bio || '');
    setEditTwitter(user.socialLinks?.twitter || '');
    setEditLinkedin(user.socialLinks?.linkedin || '');
    setEditInstagram(user.socialLinks?.instagram || '');
  }, [user]);

  // Local activity logger function
  const logLocalUserActivity = (type: string, description: string) => {
    if (!user.uid) return;
    try {
      const key = `user_activities_${user.uid}`;
      const stored = localStorage.getItem(key);
      const list = stored ? JSON.parse(stored) : [];
      const newActivity = {
        id: Math.random().toString(36).slice(2, 9),
        type,
        description,
        timestamp: Date.now()
      };
      const updatedList = [newActivity, ...list].slice(0, 100);
      localStorage.setItem(key, JSON.stringify(updatedList));
      setActivities(prev => [newActivity, ...prev].slice(0, 100));
    } catch (err) {
      console.error('Failed to log user activity:', err);
    }
  };

  // Register global activity logger so any action logs instantly to the profile feed
  useEffect(() => {
    if (user?.uid) {
      (window as any).logUserActivity = (uid: string, type: string, description: string) => {
        try {
          const key = `user_activities_${uid}`;
          const stored = localStorage.getItem(key);
          const list = stored ? JSON.parse(stored) : [];
          const newActivity = {
            id: Math.random().toString(36).slice(2, 9),
            type,
            description,
            timestamp: Date.now()
          };
          localStorage.setItem(key, JSON.stringify([newActivity, ...list].slice(0, 100)));
          
          if (uid === user.uid) {
            setActivities(prev => {
              // Avoid duplicate logs if already present by checking ID or timestamp closeness
              const filtered = prev.filter(p => p.description !== description || Math.abs(p.timestamp - newActivity.timestamp) > 2000);
              return [newActivity, ...filtered].slice(0, 100);
            });
          }
        } catch (err) {
          console.error('Failed to log user activity globally:', err);
        }
      };
    }
    return () => {
      delete (window as any).logUserActivity;
    };
  }, [user?.uid]);

  // Load Real projects and compile complete user activities ledger
  useEffect(() => {
    if (!user?.uid) return;

    setLoadingProjects(true);
    ContentService.getProjects(user.uid)
      .then(fetchedProjects => {
        setProjects(fetchedProjects);

        // 1. Recover local logged activities
        let localActions: any[] = [];
        try {
          const key = `user_activities_${user.uid}`;
          const stored = localStorage.getItem(key);
          if (stored) {
            localActions = JSON.parse(stored);
          } else {
            // Initiate a clear establishment action log for new sessions from scratch
            const initialLog = {
              id: 'initial_ledger',
              type: 'identity',
              description: 'Identity established: Sandbox Profile session initialized in browser.',
              timestamp: user.joinedAt || Date.now()
            };
            localActions = [initialLog];
            localStorage.setItem(key, JSON.stringify(localActions));
          }
        } catch (lErr) {
          console.error('Error recovering local ledger:', lErr);
        }

        // 2. Map structural project history activity logs
        const projectActions: any[] = [];
        fetchedProjects.forEach((proj: any) => {
          if (Array.isArray(proj.activityLogs)) {
            proj.activityLogs.forEach((log: any) => {
              projectActions.push({
                id: log.id || Math.random().toString(),
                type: 'project_action',
                description: `${log.description} (Project: ${proj.name || 'Untitled'})`,
                timestamp: log.timestamp || Date.now()
              });
            });
          }
        });

        // 3. Filter duplicates & Sort chronologically from scratch
        const combined = [...localActions, ...projectActions].sort((a, b) => b.timestamp - a.timestamp);
        
        // Ensure no dual entry for initial setup
        const seenDescriptions = new Set();
        const dedupedCombined = combined.filter(act => {
          const key = `${act.description}_${Math.floor(act.timestamp / 3000)}`;
          if (seenDescriptions.has(key)) return false;
          seenDescriptions.add(key);
          return true;
        });

        setActivities(dedupedCombined);
      })
      .catch(err => {
        console.error('Failed to load actual projects:', err);
      })
      .finally(() => {
        setLoadingProjects(false);
      });
  }, [user?.uid]);

  // Handle upload profile image
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.uid) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    setUploading(true);
    const path = `users/${user.uid}`;
    try {
      const storageRef = ref(storage, `users/${user.uid}/profile_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });
      
      onUpdateUser({ picture: downloadURL });
      logLocalUserActivity('profile_update', 'Uploaded a new visual profile photo');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setUploading(false);
    }
  };

  // Profile save details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.uid) return;

    setIsSavingProfile(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updates = {
        name: editName,
        username: editUsername,
        bio: editBio,
        socialLinks: {
          twitter: editTwitter,
          linkedin: editLinkedin,
          instagram: editInstagram
        }
      };

      await updateDoc(userDocRef, updates);
      onUpdateUser(updates);

      logLocalUserActivity('profile_update', `Updated public profile metadata and bio (Name: ${editName})`);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile characteristics:', err);
      alert('Error updating profile information.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Computed Real user statistics
  const stats = {
    totalGenerations: user.stats?.totalGenerations || 0,
    totalProjects: projects.length,
    stylesUsed: user.stats?.stylesUsed || [],
    totalLikes: user.stats?.totalLikes || 0,
    totalViews: user.stats?.totalViews || 0
  };

  const expToNextLevel = (user.creatorLevel || 1) * 1000;
  const expProgress = ((user.creatorExp || 0) / expToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Cover Image / Header Background */}
      <div className="h-64 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* COLUMN 1: Sidebar: Identity details & Live parameters */}
          <div className="w-full lg:w-80 space-y-8">
            <div className="ai-card p-8 border-white/5 bg-[#0f0f12]/85 backdrop-blur-xl text-center relative overflow-hidden">
              <div className="relative inline-block mb-6 group/avatar">
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${TIER_COLORS[currentProfileUser.creatorTier || 'Explorer']} p-1 relative overflow-hidden`}>
                  {currentProfileUser.picture ? (
                    <img src={currentProfileUser.picture} alt={currentProfileUser.name} className="w-full h-full rounded-[22px] object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-4xl">
                      {currentProfileUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {isOwnProfile && (
                     <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer z-10"
                      disabled={uploading}
                     >
                        {uploading ? (
                          <Loader2 size={24} className="animate-spin text-white" />
                        ) : (
                          <>
                            <Camera size={24} className="text-white mb-2" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white">Update Photo</span>
                          </>
                        )}
                     </button>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
                {currentProfileUser.isFoundingMember && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-lg shadow-xl" title="Founding Member">
                    <Crown size={16} />
                  </div>
                )}
              </div>

              {/* Public/Edit Mode layout switcher */}
              {!isEditing ? (
                <>
                  {currentProfileUser.country && (
                    <div className="flex items-center justify-center gap-1.5 mb-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto text-[10px] font-bold text-gray-400">
                      <Globe size={10} className="text-cyan-500" />
                      <span>{currentProfileUser.country}</span>
                    </div>
                  )}

                  <h1 className="text-2xl font-black tracking-tight mb-2">{currentProfileUser.name}</h1>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${TIER_COLORS[currentProfileUser.creatorTier || 'Explorer']} text-[10px] font-black uppercase tracking-widest text-white`}>
                      {currentProfileUser.creatorTier || 'Explorer'}
                    </span>
                    <span className="text-xs font-bold text-gray-500">Level {currentProfileUser.creatorLevel || 1}</span>
                  </div>

                  {/* Followers & Following stats */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 my-4">
                    <div className="text-center">
                      <div className="text-lg font-black text-white">{viewedFollowersCount.toLocaleString()}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Followers</div>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <div className="text-lg font-black text-white">{viewedFollowingCount.toLocaleString()}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Following</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    {currentProfileUser.bio || "No bio yet. This creator is busy synthesizing the future."}
                  </p>

                  <div className="flex justify-center gap-4 mb-8">
                    {currentProfileUser.socialLinks?.twitter && <a target="_blank" rel="noreferrer" href={currentProfileUser.socialLinks.twitter} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Twitter size={18} /></a>}
                    {currentProfileUser.socialLinks?.linkedin && <a target="_blank" rel="noreferrer" href={currentProfileUser.socialLinks.linkedin} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Linkedin size={18} /></a>}
                    {currentProfileUser.socialLinks?.instagram && <a target="_blank" rel="noreferrer" href={currentProfileUser.socialLinks.instagram} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Instagram size={18} /></a>}
                  </div>

                  {!isOwnProfile ? (
                    <div className="space-y-3">
                      <button 
                        onClick={handleToggleFollow}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                          isFollowed 
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 text-white shadow-lg shadow-cyan-500/15'
                        }`}
                      >
                        {isFollowed ? <UserCheck size={16} /> : <UserPlus size={16} />}
                        {isFollowed ? 'Following' : 'Follow Creator'}
                      </button>

                      <button 
                        onClick={() => {
                          localStorage.removeItem('viewing_creator_email');
                          onNavigate('creator-leaderboard');
                        }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={16} />
                        Back to Rankings
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Settings size={16} />
                      Edit Profile Info
                    </button>
                  )}
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="text-left space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-cyan-500 uppercase tracking-wider">Configure Profile</span>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Display Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 focus:border-cyan-550 rounded-xl p-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Username</label>
                    <input 
                      type="text" 
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 focus:border-cyan-550 rounded-xl p-2.5 text-sm text-white focus:outline-none transition-colors"
                      placeholder="e.g. creative_genius"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Bio / Manifesto</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 focus:border-cyan-550 rounded-xl p-2.5 text-xs text-white focus:outline-none transition-colors h-20 resize-none"
                      placeholder="Share your architectural direction..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Social Media Handles</label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550" size={13} />
                      <input 
                        type="text" 
                        value={editTwitter}
                        onChange={(e) => setEditTwitter(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none text-slate-300 focus:border-cyan-500"
                        placeholder="Twitter profile URL"
                      />
                    </div>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550" size={13} />
                      <input 
                        type="text" 
                        value={editLinkedin}
                        onChange={(e) => setEditLinkedin(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none text-slate-300 focus:border-cyan-500"
                        placeholder="LinkedIn profile URL"
                      />
                    </div>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550" size={13} />
                      <input 
                        type="text" 
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none text-slate-300 focus:border-cyan-500"
                        placeholder="Instagram profile URL"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit" 
                      disabled={isSavingProfile}
                      className="flex-grow py-2.5 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
                    >
                      {isSavingProfile ? <Loader2 size={13} className="animate-spin text-[#050709]" /> : <CheckCircle2 size={13} />}
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="px-3 bg-white/5 border border-white/10 text-xs rounded-xl text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Level Progression Progress */}
            <div className="ai-card p-6 border-white/5 bg-[#0f0f12]/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Level Progress</span>
                <span className="text-xs font-bold text-cyan-500">{Math.round(expProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  className={`h-full bg-gradient-to-r ${TIER_COLORS[user.creatorTier || 'Explorer']}`}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-[10px] text-gray-600 text-center">
                {user.creatorExp || 0} / {expToNextLevel} EXP to Level {(user.creatorLevel || 1) + 1}
              </div>
            </div>

            {/* Structured Real-world Parameters metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="ai-card p-3 border-white/5 bg-[#0f0f12]/50 text-center">
                <div className="text-base font-black text-white">{stats.totalGenerations.toLocaleString()}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Generations</div>
              </div>
              <div className="ai-card p-3 border-white/5 bg-[#0f0f12]/50 text-center">
                <div className="text-base font-black text-white">{stats.totalProjects}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Projects</div>
              </div>
              <div className="ai-card p-3 border-white/5 bg-[#0f0f12]/50 text-center">
                <div className="text-base font-black text-white">{(user.followers?.length || 0)}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Followers</div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Main Content: Tabs & Interactive Feed */}
          <div className="flex-grow space-y-8">
            
            {/* COLLABORATION & CHAT PORTAL FOR VIEWED CREATORS */}
            {!isOwnProfile && (
              <div className="ai-card p-6 border-white/5 bg-gradient-to-br from-indigo-950/20 to-fuchsia-950/20 backdrop-blur-xl relative overflow-hidden rounded-3xl space-y-6">
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                    Secure Channel
                  </span>
                </div>

                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TIER_COLORS[currentProfileUser.creatorTier || 'Explorer']} p-0.5`}>
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                      {currentProfileUser.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      Collaborate with {currentProfileUser.name}
                      {currentProfileUser.isFoundingMember && <Crown size={14} className="text-yellow-500" />}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Co-designing, prompt exchange, and active team workspace recruiting
                    </p>
                  </div>
                </div>

                {isFollowed ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chat Box */}
                    <div className="bg-[#0c0c0e]/90 border border-white/5 rounded-2xl p-4 flex flex-col h-[280px]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1 text-left">
                        <MessageSquare size={10} className="text-cyan-500" />
                        <span>Direct Conversation</span>
                      </div>

                      {/* Message History */}
                      <div className="flex-grow overflow-y-auto space-y-3 mb-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent text-left">
                        {chatMessages.map((msg, i) => (
                          <div 
                            key={i} 
                            className={`flex flex-col max-w-[85%] ${msg.sender === user.name ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <span className="text-[9px] font-bold text-gray-600 mb-1">{msg.sender}</span>
                            <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                              msg.sender === user.name 
                                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-tr-none' 
                                : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Input Box */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/5 pt-3">
                        <input 
                          type="text" 
                          placeholder="Type your design idea..." 
                          value={typedMessage}
                          onChange={(e) => setTypedMessage(e.target.value)}
                          className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button 
                          type="submit"
                          className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-all cursor-pointer"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </div>

                    {/* Collaboration & Recruiting Actions */}
                    <div className="flex flex-col justify-between space-y-4 text-left">
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                            <Sparkles size={12} />
                            <span>Quick Collaboration Ideas</span>
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Ask {currentProfileUser.name} to synthesize custom high-fidelity style models, or draft shared prompts for continuous media generation loops.
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-fuchsia-400 flex items-center gap-1">
                            <Users size={12} />
                            <span>Recruit for Workspace</span>
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Bring {currentProfileUser.name} directly into your team as a permanent member! They can assist in prompt authoring and design editing.
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={handleInviteToTeam}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 rounded-xl text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
                      >
                        <UserPlus size={16} />
                        Invite {currentProfileUser.name} as Teammate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-4 bg-slate-950/40 rounded-2xl border border-white/5 p-6">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400">
                      <Lock size={20} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-white">Collaboration Portal Locked</h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        To protect creator channels, you must follow {currentProfileUser.name} first to start a conversation, unlock co-design spaces, and recruit them.
                      </p>
                    </div>
                    <button 
                      onClick={handleToggleFollow}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 rounded-xl text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      Follow to Unlock Chat
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Navigational Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 pb-4">
              {[
                { id: 'showcase', label: 'Showcase Canvas', icon: Grid },
                { id: 'stats', label: 'Activity & Audit Log', icon: Zap },
                { id: 'achievements', label: 'Earned Badges', icon: Trophy },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 text-sm font-bold transition-all pb-4 -mb-4 border-b-2 ${activeTab === tab.id ? 'text-white border-cyan-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB PANELS: Showcase, Performance Timeline, Achievements */}
            <div className="min-h-[400px]">
              
              {/* TAB 1: SHOWCASE CANVAS */}
              {activeTab === 'showcase' && (
                <div>
                  {loadingProjects ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
                      <Loader2 size={32} className="animate-spin text-cyan-500" />
                      <p className="text-xs font-mono tracking-widest uppercase">Fetching Showcase Parameters...</p>
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map((proj, idx) => (
                        <motion.div 
                          key={proj.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group relative bg-[#111215] border border-white/5 hover:border-cyan-500/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div className="aspect-video relative overflow-hidden bg-white/5 flex items-center justify-center border-b border-white/5">
                            {proj.thumbnail ? (
                              <img src={proj.thumbnail} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="text-center p-8 flex flex-col items-center justify-center text-gray-600 gap-2">
                                <Folder size={32} className="text-cyan-500/20 group-hover:scale-110 transition-transform duration-500" />
                                <span className="text-[9px] font-black uppercase tracking-wider font-mono">Inactive Thumb</span>
                              </div>
                            )}

                            {/* Watermark sign */}
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[7px] font-mono tracking-wider uppercase text-white/50">
                              Id: #{proj.id.substring(0, 5)}
                            </div>

                            {/* Action Hover Screen */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button 
                                onClick={() => onNavigate('home-main', { projectId: proj.id })}
                                className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform border border-cyan-400"
                                title="Open Canvas Workspace"
                              >
                                <Play size={16} className="fill-white" />
                              </button>
                            </div>
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between gap-3 bg-gradient-to-b from-transparent to-[#0d0e10]/40">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate max-w-[150px]">
                                  {proj.name || 'Untitled Project'}
                                </h3>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider ${proj.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                  {proj.status || 'draft'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 font-medium">
                                Last synthed: {proj.lastUpdate ? new Date(proj.lastUpdate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-gray-500 font-mono">
                              <span>Asset index: {proj.assets?.length || 0}</span>
                              <span onClick={() => onNavigate('home-main', { projectId: proj.id })} className="text-cyan-500 hover:underline cursor-pointer flex items-center gap-0.5">
                                Workspace <ExternalLink size={10} />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                        <Grid className="text-gray-600" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white">No active canvas creations yet</h3>
                      <p className="text-gray-500 max-w-xs mx-auto text-sm">
                        Create high-fidelity projects and templates in the workspace and let your portfolio thrive from scratch.
                      </p>
                      <button 
                        onClick={() => onNavigate('studio')}
                        className="px-6 py-2.5 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all cursor-pointer"
                      >
                        Start Creating Work
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AUDIT LEDGER & ACTIVITY LOG */}
              {activeTab === 'stats' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-base font-bold text-white capitalize">Audit Trail Ledger</h3>
                      <p className="text-xs text-gray-505 font-mono">Immutable local events chronicle for user id: #{user.uid?.substring(0, 6)}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full text-cyan-400 font-black">
                      {activities.length} Recorded Actions
                    </span>
                  </div>

                  {activities.length > 0 ? (
                    <div className="relative border-l border-white/5 ml-4 pl-6 space-y-6">
                      {activities.map((act) => {
                        // Dynamic styling based on activity type
                        let badgeColor = 'bg-gray-500/20 text-gray-300';
                        let Icon = Clock;

                        if (act.type === 'profile_update') {
                          badgeColor = 'bg-cyan-500/10 text-cyan-400 border border-cyan-550/20';
                          Icon = UserIcon;
                        } else if (act.type === 'project_action' || act.type === 'project') {
                          badgeColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-550/20';
                          Icon = Folder;
                        } else if (act.type === 'asset_generated' || act.type === 'generation') {
                          badgeColor = 'bg-yellow-500/10 text-yellow-400 border border-yellow-550/20';
                          Icon = Sparkles;
                        } else if (act.type === 'recharge' || act.type === 'credits') {
                          badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-550/20';
                          Icon = CreditCard;
                        } else if (act.type === 'identity') {
                          badgeColor = 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-550/20';
                          Icon = Lock;
                        }

                        return (
                          <div key={act.id} className="relative group">
                            {/* Dot link Indicator */}
                            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border border-white/10 group-hover:border-cyan-500/50 transition-colors">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-500 group-hover:bg-cyan-400" />
                            </span>

                            <div className="p-4 bg-[#111215]/50 border border-white/5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group-hover:bg-[#111215]/80 group-hover:border-white/10 transition-all">
                              <div className="flex items-center gap-3.5">
                                <div className={`p-2 rounded-xl ${badgeColor}`}>
                                  <Icon size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-100">{act.description}</p>
                                  <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider">{act.type} event index</span>
                                </div>
                              </div>

                              <span className="text-[10px] font-mono text-slate-400 font-bold whitespace-nowrap">
                                {new Date(act.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                        <Clock className="text-gray-600" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white">No real actions in ledger</h3>
                      <p className="text-gray-500 max-w-sm mx-auto text-xs">
                        Audit logger is initial and online. Once you trigger changes, establish templates, update profile settings, or process media, live history logs will compile securely.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EARNED BADGES (ACHIEVEMENTS) */}
              {activeTab === 'achievements' && (
                <div>
                  {user.achievements && user.achievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {user.achievements.map((ach, idx) => (
                        <motion.div 
                          key={ach.id || idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.08 }}
                          className="ai-card p-6 border-white/10 bg-white/5 flex flex-col items-center text-center gap-4 group hover:bg-white/[0.08] transition-all"
                        >
                          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{ach.icon}</div>
                          <div>
                            <h5 className="text-sm font-bold text-white mb-1">{ach.name}</h5>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{ach.description}</p>
                          </div>
                          <div className="mt-auto pt-4 w-full border-t border-white/5 flex items-center justify-between">
                            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest font-mono">Unlocked</span>
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                        <Trophy className="text-gray-600" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white">No custom badges claimed yet</h3>
                      <p className="text-gray-500 max-w-xs mx-auto text-sm">
                        Keep synthesizing the future. Unlocked rewards, level completions and platform bonuses get archived here automatically.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
