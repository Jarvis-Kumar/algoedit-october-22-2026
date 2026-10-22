
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    User as UserIcon, 
    Settings, 
    Shield, 
    Bell, 
    Palette, 
    CreditCard, 
    Mail, 
    Lock, 
    Save, 
    Loader2, 
    ChevronRight,
    Camera,
    Plus,
    X,
    Eye,
    EyeOff,
    CheckCircle2,
    Monitor,
    Cloud,
    Smartphone
} from 'lucide-react';
import { User } from '../types';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';

interface AccountSettingsProps {
    user: User | null;
    onUpdateUser: (updates: Partial<User>) => Promise<void>;
    onNavigate: (page: any) => void;
}

type SettingsSection = 'profile' | 'security' | 'preferences' | 'notifications' | 'billing' | 'sessions';

const AccountSettingsPage: React.FC<AccountSettingsProps> = ({ user, onUpdateUser, onNavigate }) => {
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [formData, setFormData] = useState<Partial<User>>(user ? { ...user } : {});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showPassword, setShowPassword] = useState(false);

    // Secure consent & recurring simulation states
    const [isRenewalSimOpen, setIsRenewalSimOpen] = useState(false);
    const [simulatedModalOption, setSimulatedModalOption] = useState<'10day' | 'monthly'>('10day');
    const [renewalProcessState, setRenewalProcessState] = useState<'idle' | 'authorizing' | 'success_auth' | 'declined'>('idle');
    const [renewalLogMessage, setRenewalLogMessage] = useState('');
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    // Local card register simulation states for testing on profile
    const [newCardNumber, setNewCardNumber] = useState('');
    const [newCardExpiry, setNewCardExpiry] = useState('');
    const [newCardCvv, setNewCardCvv] = useState('');
    const [newCardName, setNewCardName] = useState(user?.name || 'AlgoAI AlgoAI');
    const [newCardCountry, setNewCardCountry] = useState('India');
    const [newCardZip, setNewCardZip] = useState('');
    const [savingCardState, setSavingCardState] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        }
    }, [user]);

    if (!user) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-slate-700 animate-pulse">
                    <Shield size={40} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Neural Authorization Required</h3>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Authentication is mandatory for configuration access</p>
                </div>
                <button 
                    onClick={() => onNavigate('signin')}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[10px] font-black text-[#050709] hover:brightness-110 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,255,255,0.25)] cursor-pointer"
                >
                    Initialize_Identity
                </button>
            </div>
        );
    }

    const handleInputChange = (field: keyof User | string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof User] as any),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus('idle');

        try {
            // If name or picture changed, update firebase auth profile too
            if (formData.name !== user.name || formData.picture !== user.picture) {
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, {
                        displayName: formData.name,
                        photoURL: formData.picture
                    });
                }
            }

            await onUpdateUser(formData);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const SECTIONS: { id: SettingsSection; name: string; icon: React.ReactNode; desc: string }[] = [
        { id: 'profile', name: 'Profile Information', icon: <UserIcon size={18} />, desc: 'Manage your public presence' },
        { id: 'security', name: 'Security & Access', icon: <Shield size={18} />, desc: 'Passwords and authentication' },
        { id: 'preferences', name: 'App Preferences', icon: <Palette size={18} />, desc: 'Customize your interface' },
        { id: 'notifications', name: 'Notifications', icon: <Bell size={18} />, desc: 'Configure your alerts' },
        { id: 'billing', name: 'Subscription & Credits', icon: <CreditCard size={18} />, desc: 'Manage your pro features' },
        { id: 'sessions', name: 'Sessions', icon: <Monitor size={18} />, desc: 'Active devices and logins' },
    ];

    return (
        <div className="min-h-full py-4 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Neural_Config</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">System User Parameters v4.0</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border cursor-pointer ${activeSection === s.id ? 'bg-[#8DB8CC]/15 border-[#8DB8CC]/40 text-white shadow-[0_0_12px_rgba(141,184,204,0.15)]' : 'bg-white/[0.02] border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeSection === s.id ? 'bg-[#10161B] border border-[#26313A] text-[#8DB8CC]' : 'bg-white/5 text-slate-600'}`}>
                                {s.icon}
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-black uppercase tracking-wider">{s.name}</div>
                                <div className="text-[9px] font-medium opacity-50">{s.desc}</div>
                            </div>
                            {activeSection === s.id && <ChevronRight size={14} className="ml-auto text-[#8DB8CC]" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    <form onSubmit={handleSave} className="ai-card border-white/5 bg-white/[0.01] p-8 lg:p-12 relative overflow-hidden min-h-[600px]">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8DB8CC]/5 blur-[120px] -z-10" />
                        
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                {/* PROFILE SECTION */}
                                {activeSection === 'profile' && (
                                    <div className="space-y-10">
                                        <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-white/5">
                                            <div className="relative group">
                                                <div className="w-32 h-32 rounded-[40px] border-2 border-dashed border-white/10 p-1 group-hover:border-[#8DB8CC]/50 transition-all">
                                                    <img 
                                                        src={formData.picture || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200&h=200'} 
                                                        className="w-full h-full object-cover rounded-[32px] opacity-80 group-hover:opacity-100 transition-opacity"
                                                        alt="Profile"
                                                    />
                                                </div>
                                                <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#10161B] border border-[#26313A] hover:border-[#AFC3CF]/40 rounded-2xl flex items-center justify-center text-[#8DB8CC] shadow-xl hover:scale-110 transition-transform cursor-pointer">
                                                    <Camera size={18} />
                                                </button>
                                            </div>
                                            <div className="space-y-3 text-center md:text-left">
                                                <h3 className="text-2xl font-black text-white italic tracking-tight">{user.name}</h3>
                                                <p className="text-xs text-slate-500 font-mono tracking-widest">{user.email}</p>
                                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                                    <span className="px-3 py-1 rounded-full bg-[#10161B] border border-[#26313A] text-[9px] font-black text-[#AFC3CF] uppercase tracking-widest">
                                                        {user.creatorTier || 'Explorer'} Tier
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        Level {user.creatorLevel || 1}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Identity Name</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.name || ''}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-[#8DB8CC]/50 focus:bg-white/[0.04] outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neural_Handle (Username)</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-mono">@</span>
                                                    <input 
                                                        type="text" 
                                                        value={formData.username || ''}
                                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-10 text-sm text-white focus:border-[#8DB8CC]/50 outline-none transition-all"
                                                        placeholder="username"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Creator Bio</label>
                                                <textarea 
                                                    value={formData.bio || ''}
                                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                                    rows={4}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-[#8DB8CC]/50 outline-none transition-all resize-none"
                                                    placeholder="Synthesizing digital realities..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SECURITY SECTION */}
                                {activeSection === 'security' && (
                                    <div className="space-y-10">
                                        <div className="p-8 rounded-3xl bg-studio-accent-purple/5 border border-studio-accent-purple/20 flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-studio-accent-purple/20 flex items-center justify-center text-studio-accent-purple">
                                                <Shield size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white italic tracking-tight">Security Hardening</h4>
                                                <p className="text-xs text-slate-500 mt-1">Manage your access tokens and authentication layers.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Authentication</h5>
                                                    {auth.currentUser?.emailVerified && <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase"><CheckCircle2 size={12} /> Verified</span>}
                                                </div>
                                                <div className="flex gap-4">
                                                    <input 
                                                        type="email" 
                                                        disabled
                                                        value={user.email}
                                                        className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-500 font-mono"
                                                    />
                                                    <button type="button" className="px-6 rounded-2xl border border-white/10 text-[10px] font-black uppercase text-white hover:bg-white/5">Change</button>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-white/5">
                                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password Protocol</h5>
                                                <div className="relative">
                                                    <input 
                                                        type={showPassword ? 'text' : 'password'}
                                                        defaultValue="********"
                                                        disabled
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-500"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-600 font-medium">To change your password, an encryption reset link will be sent to your primary email.</p>
                                                <button type="button" className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10">Request_Password_Reset</button>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-white/5">
                                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-Factor Neural Auth</h5>
                                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <Smartphone className="text-slate-500" size={20} />
                                                        <div>
                                                            <div className="text-xs font-bold text-white uppercase tracking-wider">SMS / Authenticator App</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">Secure your account with a secondary layer.</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-12 h-6 bg-slate-800 rounded-full relative p-1 cursor-pointer">
                                                        <div className="w-4 h-4 bg-slate-400 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PREFERENCES SECTION */}
                                {activeSection === 'preferences' && (
                                    <div className="space-y-10">
                                         <div>
                                            <h4 className="text-lg font-black text-white italic tracking-tight">Neural_Interface_Preferences</h4>
                                            <p className="text-xs text-slate-500 mt-1">Configure your personal synthesis environment.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual Architecture (Theme)</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {(['dark', 'light', 'amoled'] as const).map(t => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => handleInputChange('preferences.theme', t)}
                                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.preferences?.theme === t ? 'bg-studio-accent-blue/10 border-studio-accent-blue/30 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}
                                                        >
                                                            <div className={`w-full aspect-square rounded-lg ${t === 'dark' ? 'bg-[#03050C]' : t === 'amoled' ? 'bg-black' : 'bg-slate-200'} border border-white/10`} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{t}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Language</label>
                                                <select 
                                                    value={formData.preferences?.language || 'en'}
                                                    onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-studio-accent-blue outline-none"
                                                >
                                                    <option value="en" className="bg-slate-900">English (Global)</option>
                                                    <option value="hi" className="bg-slate-900">Hindi (Native)</option>
                                                    <option value="jp" className="bg-slate-900">Japanese (Neural)</option>
                                                    <option value="de" className="bg-slate-900">German (Logic)</option>
                                                </select>
                                            </div>

                                            <div className="space-y-4 md:col-span-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual Detail Level</label>
                                                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                        <span>Performant</span>
                                                        <span className="text-studio-accent-blue">Cinematic</span>
                                                    </div>
                                                    <input type="range" className="w-full accent-studio-accent-blue" />
                                                    <p className="text-[9px] text-slate-600 italic">Adjusting this will impact UI blur effects and animation complexity during generation.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* BILLING SECTION */}
                                {activeSection === 'billing' && (
                                    <div className="space-y-10">
                                         <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-[40px] bg-gradient-to-br from-[#10161B] via-[#0A0E12] to-[#050709] border border-[#26313A] relative overflow-hidden shadow-2xl">
                                             <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DB8CC]/10 blur-[80px] -z-0" />
                                             <div className="relative z-10 space-y-2">
                                                 <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">Active Plan</span>
                                                 <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{user ? (user.creatorTier || 'Explorer') : 'Explorer'}</h3>
                                                 <p className="text-slate-400 text-xs font-bold leading-relaxed">Billing Expiry Control: <span className="text-[#8DB8CC] font-black underline">Strict Consent Required</span> <br/> Synthesis Cycle Renewals: Manual authorization active.</p>
                                             </div>
                                             <div className="relative z-10 flex flex-col items-center">
                                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Tokens</span>
                                                 <div className="text-5xl font-black text-white italic tracking-tighter">{(user.tokens || 0).toLocaleString()}</div>
                                                 <button type="button" onClick={() => onNavigate('pricing')} className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] text-[#050709] text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform cursor-pointer">Get_More</button>
                                             </div>
                                         </div>

                                         {/* Card Wallet List */}
                                         <div className="space-y-6 text-left">
                                             <div>
                                                 <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Payment Infrastructure</h5>
                                                 <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wide font-semibold">Saved Accounts (Privacy Masked &amp; PCI DSS Compliant)</p>
                                             </div>
                                             
                                             {user?.savedCard ? (
                                                 <div className="flex items-center justify-between p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 transition-all hover:bg-emerald-500/10 group">
                                                     <div className="flex items-center gap-4">
                                                         <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                             <CreditCard size={24} />
                                                         </div>
                                                         <div>
                                                             <div className="text-sm font-black text-white tracking-widest font-mono">•••• •••• •••• {user.savedCard.lastFour}</div>
                                                             <div className="text-[10px] text-slate-400 mt-0.5">
                                                                 Exp: {user.savedCard.expDate} • {user.savedCard.cardBrand} • Holder: {user.savedCard.cardholderName} • Registered: {user.savedCard.country}
                                                             </div>
                                                             <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                                                                 <CheckCircle2 size={10} className="text-emerald-400 animate-pulse" /> Double-Salted Encryption Enabled
                                                             </div>
                                                         </div>
                                                     </div>
                                                     <button 
                                                         type="button" 
                                                         onClick={() => {
                                                             setNewCardNumber('');
                                                             setNewCardExpiry('');
                                                             setNewCardCvv('');
                                                             setIsCardModalOpen(true);
                                                         }} 
                                                         className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-wider text-slate-300 transition-colors"
                                                     >
                                                         Update
                                                     </button>
                                                 </div>
                                             ) : (
                                                 <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-800/10 border border-slate-700/20 transition-all group">
                                                     <div className="flex items-center gap-4">
                                                         <div className="w-12 h-12 rounded-2xl bg-slate-800/20 flex items-center justify-center text-slate-500">
                                                             <CreditCard size={24} />
                                                         </div>
                                                         <div>
                                                             <div className="text-sm font-semibold text-slate-400">•••• •••• •••• 4412 (Default Simulation Mode)</div>
                                                             <div className="text-[10px] text-slate-500 mt-0.5">Exp: 09/28 • Default Test Visa • Auto-Renewal Disabled • No charges will be drafted</div>
                                                         </div>
                                                     </div>
                                                     <span className="text-xs text-slate-500 italic font-bold">Pre-authorized</span>
                                                 </div>
                                             )}

                                             <button 
                                                 type="button" 
                                                 onClick={() => setIsCardModalOpen(true)}
                                                 className="w-full py-4 border border-dashed border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest text-[#f43f5e] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 font-bold"
                                             >
                                                 <Plus size={14} />
                                                 {user?.savedCard ? 'Register Alternate Payment Source' : 'Register Secure Card Profile'}
                                             </button>
                                         </div>

                                         {/* Guard Statement */}
                                         <div className="p-6 rounded-3xl bg-[#10161B] border border-[#26313A] space-y-2">
                                             <div className="flex items-center gap-2 text-[#8DB8CC]">
                                                 <Shield size={16} />
                                                 <span className="text-xs font-black uppercase tracking-wider">Zero-Forced Deductions Secure Promise</span>
                                             </div>
                                             <p className="text-[11px] text-slate-400 leading-normal text-left">
                                                 Under our custom <strong>Strict Consent Billing Policy</strong>, we strictly restrict raw financial leaks. We only store isolated masked profiles (the bank network brand and last 4 security digits). In complete contrast to typical automated draft services, <strong>we never automatically renew your card balance</strong> unless you actively authenticate and select &apos;Yes&apos; on our scheduled permission pop-ups.
                                             </p>
                                         </div>

                                         {/* Laboratory Module */}
                                         <div className="p-8 rounded-[36px] bg-amber-500/5 border border-amber-500/10 space-y-6 text-left">
                                             <div className="space-y-1">
                                                 <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[9px] font-black text-amber-400 uppercase tracking-widest">Interactive Laboratory Suite</span>
                                                 <h5 className="text-md font-extrabold text-white">🔑 Secure Renewal Consent Simulator</h5>
                                                 <p className="text-xs text-slate-400 leading-normal">
                                                     Simulate the exact notification alerts and authorization workflows triggered as subscription end dates approach. Verify their secure mechanics below:
                                                 </p>
                                             </div>

                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                 <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-col justify-between space-y-4">
                                                     <div>
                                                         <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black">Stage 1 Alert</span>
                                                         <h6 className="text-[12px] font-bold text-white mt-1">10-Day Expiry Permission Warning</h6>
                                                         <p className="text-[10px] text-slate-500 mt-1">
                                                             Simulate an interactive prompt sent 10 days before active cycle ends. Prohibit charges until you explicitly click &apos;Yes&apos;.
                                                         </p>
                                                     </div>
                                                     <button 
                                                         type="button" 
                                                         onClick={() => {
                                                             setSimulatedModalOption('10day');
                                                             setRenewalProcessState('idle');
                                                             setIsRenewalSimOpen(true);
                                                         }}
                                                         className="px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500/20 text-center transition-all hover:scale-[1.02]"
                                                     >
                                                         Trigger 10-Day Warning
                                                     </button>
                                                 </div>

                                                 <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-col justify-between space-y-4">
                                                     <div>
                                                         <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-black">Stage 2 Billing</span>
                                                         <h6 className="text-[12px] font-bold text-white mt-1">Monthly Cycle Renewal Prompt</h6>
                                                         <p className="text-[10px] text-slate-500 mt-1">
                                                             Test the monthly micro-permission sequence requesting immediate cycle draft authorisation to extend premium allocations.
                                                         </p>
                                                     </div>
                                                     <button 
                                                         type="button" 
                                                         onClick={() => {
                                                             setSimulatedModalOption('monthly');
                                                             setRenewalProcessState('idle');
                                                             setIsRenewalSimOpen(true);
                                                         }}
                                                         className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/20 text-center transition-all hover:scale-[1.02]"
                                                     >
                                                         Trigger Renewal Consent
                                                     </button>
                                                 </div>
                                             </div>
                                         </div>

                                         {/* Cancel premium subscriptions */}
                                         <div className="space-y-4 pt-6 border-t border-white/5 text-center">
                                             <button type="button" className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest hover:text-rose-500 transition-all" onClick={async () => {
                                                   if (user?.paypalSubscriptionId || user?.savedCard) {
                                                       if (confirm("Are you sure you want to cancel your premium subscription? This will immediately return your profile tier to Explorer.")) {
                                                           setIsSaving(true);
                                                           try {
                                                               await onUpdateUser({
                                                                   creatorTier: 'Explorer',
                                                                   paypalSubscriptionId: '',
                                                                   subscriptionStatus: 'cancelled'
                                                               });
                                                               alert("Your premium subscription renewal has been successfully cancelled and automated permissions have been deactivated.");
                                                           } catch (err) {
                                                               alert("Could not update subscription document in database.");
                                                           } finally {
                                                               setIsSaving(false);
                                                           }
                                                       }
                                                   } else {
                                                       alert("No active subscription card or PayPal sequence was detected for this account.");
                                                   }
                                               }}>{user?.paypalSubscriptionId ? 'Cancel Premium Subscription' : 'Cancel Subscription Cycle Authority'}</button>
                                         </div>
                                    </div>
                                )}

                                {/* SESSIONS SECTION */}
                                {activeSection === 'sessions' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h4 className="text-lg font-black text-white italic tracking-tight">Active_Neural_Links</h4>
                                            <p className="text-xs text-slate-500 mt-1">Review and manage authorized devices and active sessions.</p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { dev: 'MacBook Pro 16"', loc: 'Tokyo, JP', status: 'Current Protocol', icon: <Monitor /> },
                                                { dev: 'iPhone 15 Pro', loc: 'Osaka, JP', status: 'Active 2m ago', icon: <Smartphone /> },
                                                { dev: 'Neural Node Console', loc: 'Cloud Edge', status: 'Active 5h ago', icon: <Cloud /> },
                                            ].map((session, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-studio-accent-blue transition-colors">
                                                            {session.icon}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white uppercase tracking-tight">{session.dev}</div>
                                                            <div className="text-[10px] text-slate-600 mt-0.5">{session.loc} • <span className={session.status === 'Current Protocol' ? 'text-emerald-500' : ''}>{session.status}</span></div>
                                                        </div>
                                                    </div>
                                                    <button type="button" className="px-4 py-2 rounded-xl bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all">Disconnect</button>
                                                </div>
                                            ))}
                                        </div>

                                        <button type="button" className="w-full py-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all">Sign Out of All Other Neurons (Sessions)</button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Action Bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <AnimatePresence>
                                    {saveStatus === 'success' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <CheckCircle2 size={14} />
                                            Configuration Saved
                                        </motion.div>
                                    )}
                                    {saveStatus === 'error' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <X size={14} />
                                            Update Failed
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...user })}
                                    className="px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                                >
                                    Reset_Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-10 py-4 bg-studio-accent-blue hover:bg-studio-accent-blue/80 disabled:bg-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-studio-accent-blue/20 flex items-center gap-3 transition-all"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Commit_Neural_Update
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;
