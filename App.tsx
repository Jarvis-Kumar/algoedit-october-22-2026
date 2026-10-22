import { AlgoEditLogo } from './components/AlgoEditLogo';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, ChevronRight, Shield, FileText, Cookie, Mail, Info, Send, CheckCircle, Sparkles, Target, Award, Users, ShieldAlert, X, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/ui/Toast';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import PersonalizedWelcome from './components/PersonalizedWelcome';
import AICompliment from './components/AICompliment';

// Lazy load heavy components and sub-routes to optimize initial bundle size, memory, and load speed.
const PricingPage = React.lazy(() => import('./components/PricingPage'));
const SignInPage = React.lazy(() => import('./components/SignInPage'));
const StudioPage = React.lazy(() => import('./components/StudioPage'));
const FeaturesOverviewPage = React.lazy(() => import('./components/FeaturesOverviewPage'));
const WhyChooseUsPage = React.lazy(() => import('./components/WhyChooseUsPage'));
const TokenSystemPage = React.lazy(() => import('./components/TokenSystemPage'));
const GrowthDashboard = React.lazy(() => import('./components/GrowthDashboard'));
const CreatorProfile = React.lazy(() => import('./components/CreatorProfile'));
const CreatorLeaderboard = React.lazy(() => import('./components/CreatorLeaderboard'));
const TeamManagement = React.lazy(() => import('./components/TeamManagement'));
const PublicShowcase = React.lazy(() => import('./components/PublicShowcase'));
const AIModelsPage = React.lazy(() => import('./components/AIModelsPage'));
const PossibilitiesPage = React.lazy(() => import('./components/PossibilitiesPage'));
const UltraFastProcessingPage = React.lazy(() => import('./components/UltraFastProcessingPage'));
const R2StorageManager = React.lazy(() => import('./components/R2StorageManager'));
const RazorpayBillingPortal = React.lazy(() => import('./components/RazorpayBillingPortal'));
const EmailTestingPage = React.lazy(() => import('./components/EmailTestingPage'));
const DataRequestPage = React.lazy(() => import('./components/DataRequestPage').then(module => ({ default: module.DataRequestPage })));
const LegalCenterPage = React.lazy(() => import('./components/LegalCenterPage').then(module => ({ default: module.LegalCenterPage })));

import { TeamCollaborationService, SubscriptionPlan } from './services/teamService';

// Sleek neural-themed page loader for route-splitting transitions
const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] w-full py-12">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-0 rounded-full border-t border-white animate-spin" />
    </div>
    <span className="mt-4 text-[10px] font-mono text-[#AFC3CF] uppercase tracking-[0.25em] animate-pulse">
      INITIALIZING_SYNTHESIS...
    </span>
  </div>
);
import { RetentionService } from './services/RetentionService';
import { HardeningControlCenter } from './components/HardeningControlCenter';

// FIX: Moved PreloadedAssetState to types.ts and imported it here.
import { Page, StudioTab, User, Asset, Currency, FeaturePageId, PreloadedAssetState, Achievement, UserPlan, CreatorTier, Notification } from './types';
import { SIGNUP_BONUS_TOKENS } from './constants';
import SignInPromptModal from './components/SignInPromptModal';
import { featuresData } from './data/features';
import { auth, db } from './services/firebase';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  addDoc,
  query, 
  orderBy, 
  limit, 
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './services/firebase';


interface StoredUser extends Omit<User, 'tokens' | 'bonusesReceived' | 'walletBalanceUSD'> {
    password_hash: string;
    tokens?: number;
    walletBalanceUSD?: number;
    bonusesReceived?: User['bonusesReceived'];
    achievements?: Achievement[];
    referralCode?: string;
    referralCount?: number;
    shareCount?: number;
    streakCount?: number;
    lastActiveDate?: string;
    personalityInsights?: string;
    userTier?: UserPlan;
    creatorTier?: CreatorTier;
    creatorLevel?: number;
    creatorExp?: number;
    followers?: string[];
    following?: string[];
    stats?: User['stats'];
    joinedAt?: number;
    bio?: string;
    socialLinks?: User['socialLinks'];
}

interface FooterProps {
    onNavigate?: (page: Page | FeaturePageId) => void;
    currentPage?: Page;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, currentPage }) => {
    const { showToast } = useToast();
    const [activeDoc, setActiveDoc] = useState<'privacy' | 'terms' | 'cookie' | 'contact' | 'about' | null>(null);

    const getFooterLinkClass = (pageId: Page) => {
        const isActive = currentPage === pageId;
        return `relative pb-1 font-mono uppercase transition-all duration-300 ease-out cursor-pointer bg-transparent border-none p-0 inline rounded focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#050709] focus-visible:outline-none ${
            isActive 
                ? 'text-white font-black [text-shadow:0_0_10px_rgba(255,255,255,0.6)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white' 
                : 'text-[#A8B0B7] hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.4)] hover:-translate-y-[1px] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1.5px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full'
        }`;
    };

    // Contact form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            showToast?.('Please fill out all required fields.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'contact_messages'), {
                name,
                email,
                subject: 'General Inquiry via Footer Form',
                message,
                createdAt: new Date().toISOString(),
                status: 'new'
            });

            setSubmitted(true);
            showToast?.('Message securely transmitted to AlgoEdit Support!', 'success');
            setName('');
            setEmail('');
            setMessage('');
        } catch (err) {
            console.error('Error submitting contact form:', err);
            showToast?.('Submission failed. Please email support@ai-media.studio.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <footer className="bg-transparent text-gray-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-md relative overflow-hidden">
            {/* Visual ambient glowing accent inside the footer */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-[#8DB8CC]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-screen-xl mx-auto relative z-10 space-y-12">
                {/* Brand & Heading Header */}
                <div className="flex flex-col items-center justify-center text-center">
                    <AlgoEditLogo size="lg" showText={true} />
                    <p className="text-[10px] font-mono text-[#6F7982] mt-3 uppercase tracking-widest">
                        Legal, Compliance & Security Trust Protocols
                    </p>
                </div>

                {/* Permanent 4-Column Legal Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                    
                    {/* 1. PRIVACY POLICY */}
                    <div className="bg-slate-950/60 border border-white/5 p-5 rounded-xl space-y-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[#8DB8CC] border-b border-white/5 pb-2 mb-1">
                            <Shield size={15} />
                            <span className="font-mono text-[11px] uppercase tracking-wider text-white font-bold">Privacy Policy</span>
                        </div>
                        <p className="font-mono text-[9px] text-[#AFC3CF] uppercase tracking-widest bg-white/5 px-1.5 py-0.5 border border-white/10 rounded inline-block">
                            Ver. 2026.1
                        </p>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                            Confidentiality of your creative prompts, custom assets, and editing weights is our paramount objective.
                        </p>
                        <div className="space-y-2 pt-1">
                            <div>
                                <h5 className="font-mono text-[10px] text-white uppercase font-bold">Telemetry Logs</h5>
                                <p className="text-[10.5px] text-gray-500 font-light leading-relaxed">
                                    We collect visual file inputs, text prompt metadata, and credential structures exclusively to run real-time hardware acceleration.
                                </p>
                            </div>
                            <div>
                                <h5 className="font-mono text-[10px] text-white uppercase font-bold">Cloud Encryption</h5>
                                <p className="text-[10.5px] text-gray-500 font-light leading-relaxed">
                                    Your render streams and active session caches are fully locked using advanced Firestore rules and database encryption.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. TERMS & CONDITIONS */}
                    <div className="bg-slate-950/60 border border-white/5 p-5 rounded-xl space-y-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[#8DB8CC] border-b border-white/5 pb-2 mb-1">
                            <FileText size={15} />
                            <span className="font-mono text-[11px] uppercase tracking-wider text-white font-bold">Terms & Conditions</span>
                        </div>
                        <p className="font-mono text-[9px] text-[#AFC3CF] uppercase tracking-widest bg-white/5 px-1.5 py-0.5 border border-white/10 rounded inline-block">
                            Commercial Use
                        </p>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                            By subscribing or purchasing generation token packages, you agree to comply with our runtime guidelines.
                        </p>
                        <div className="space-y-2 pt-1">
                            <div>
                                <h5 className="font-mono text-[10px] text-white uppercase font-bold">Design Rights</h5>
                                <p className="text-[10.5px] text-gray-500 font-light leading-relaxed">
                                    All synthesized artworks, high-resolution upscaled outputs, and frames created remain your absolute property with unlimited commercial rights.
                                </p>
                            </div>
                            <div>
                                <h5 className="font-mono text-[10px] text-white uppercase font-bold">Fair Usage</h5>
                                <p className="text-[10.5px] text-gray-500 font-light leading-relaxed">
                                    Scraping models, hacking terminal limits, or spawning high-concurrency requests to freeze GPU nodes triggers automatic ban.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. COOKIES & ABOUT */}
                    <div className="bg-slate-950/60 border border-white/5 p-5 rounded-xl space-y-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[#8DB8CC] border-b border-white/5 pb-2 mb-1">
                            <Cookie size={15} />
                            <span className="font-mono text-[11px] uppercase tracking-wider text-white font-bold">Cookie Policy & About</span>
                        </div>
                        <p className="font-mono text-[9px] text-[#AFC3CF] uppercase tracking-widest bg-white/5 px-1.5 py-0.5 border border-white/10 rounded inline-block">
                            Local Cockpit
                        </p>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                            We use cookies and secure local key tokens to keep your workspace persistent and speed up transitions.
                        </p>
                        <div className="space-y-2 pt-1">
                            <div>
                                <h5 className="font-mono text-[10px] text-white uppercase font-bold">Active Sessions</h5>
                                <p className="text-[10.5px] text-gray-500 font-light leading-relaxed">
                                    Required to maintain Firebase Authentication states, workspace presets, and local canvas settings.
                                </p>
                            </div>
                            <div>
                                <h5 className="font-mono text-[10px] text-white uppercase font-bold">Aesthetic Machine</h5>
                                <p className="text-[10.5px] text-gray-500 font-light leading-relaxed">
                                    We build high-performance visual pipelines routing models over low-latency clusters.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. CONTACT support terminal */}
                    <div className="bg-slate-950/60 border border-white/5 p-5 rounded-xl space-y-3 shadow-xl backdrop-blur-sm relative">
                        <div className="flex items-center gap-2 text-[#8DB8CC] border-b border-white/5 pb-2 mb-1">
                            <Mail size={15} />
                            <span className="font-mono text-[11px] uppercase tracking-wider text-white font-bold">Support Terminal</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                            Have questions or custom model requests? Ping our secure support database instantly.
                        </p>

                        {submitted ? (
                            <div className="flex flex-col items-center justify-center text-center py-4 space-y-2 bg-[#10161B] border border-[#26313A] rounded-lg p-3">
                                <CheckCircle size={18} className="text-[#8DB8CC] animate-pulse" />
                                <h6 className="font-mono text-[9px] text-white uppercase font-bold">Message Received</h6>
                                <p className="text-[10px] text-gray-400 leading-tight">
                                    Saved to database. We will respond shortly.
                                </p>
                                <button 
                                    onClick={() => setSubmitted(false)}
                                    className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[9px] font-mono uppercase text-white rounded border border-white/10 cursor-pointer transition-colors"
                                >
                                    New Ticket
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-2 text-[11px]">
                                <div className="space-y-1.5">
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-[#8DB8CC]/40 focus:outline-none placeholder:text-gray-600 font-mono" 
                                        required 
                                    />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-[#8DB8CC]/40 focus:outline-none placeholder:text-gray-600 font-mono" 
                                        required 
                                    />
                                    <textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={2}
                                        placeholder="Inquiry message..."
                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-[#8DB8CC]/40 focus:outline-none placeholder:text-gray-600" 
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full bg-[#E8F0F4] hover:bg-white disabled:opacity-50 text-[#050709] font-mono text-[9px] font-bold uppercase tracking-wider py-1.5 rounded transition-all cursor-pointer"
                                >
                                    {submitting ? 'TRANSMITTING...' : 'TRANSMIT TICKET'}
                                </button>
                            </form>
                        )}
                    </div>

                </div>

                {/* Bottom copyright line with Direct Visible Legal Links Row requested by user */}
                <div className="border-t border-white/5 pt-8 text-center space-y-8">
                    <div className="space-y-4">
                        <span className="text-[11px] font-mono text-[#AFC3CF] uppercase tracking-widest block font-black">
                            ALGOEDIT SECURE LEGAL NODE
                        </span>
                        
                        <nav aria-label="AlgoEdit Legal Navigation Hub" className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 text-xs sm:text-[13px] font-mono tracking-wider max-w-5xl mx-auto px-4">
                            <button 
                                onClick={() => onNavigate?.('legal')} 
                                className={`px-4 py-1.5 rounded-lg border font-black tracking-widest transition-all duration-300 cursor-pointer uppercase focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none ${
                                    currentPage === 'legal' || currentPage === 'legal-center'
                                        ? 'bg-white/15 border-white text-white [text-shadow:0_0_10px_rgba(255,255,255,0.5)] shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-white/30 hover:text-white hover:bg-white/5 hover:[text-shadow:0_0_8px_rgba(255,255,255,0.4)]'
                                }`}
                                aria-label="Open central Legal Center Hub"
                            >
                                [ Legal Center Hub ]
                            </button>
                            
                            <span className="text-slate-800 hidden md:inline">|</span>
                            
                            <button 
                                onClick={() => onNavigate?.('terms-and-conditions')} 
                                className={getFooterLinkClass('terms-and-conditions')}
                                aria-label="View Terms & Conditions"
                                aria-current={currentPage === 'terms-and-conditions' ? 'page' : undefined}
                            >
                                Terms & Conditions
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('privacy-policy')} 
                                className={getFooterLinkClass('privacy-policy')}
                                aria-label="View Privacy Policy"
                                aria-current={currentPage === 'privacy-policy' ? 'page' : undefined}
                            >
                                Privacy Policy
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('cookie-policy')} 
                                className={getFooterLinkClass('cookie-policy')}
                                aria-label="View Cookie Policy"
                                aria-current={currentPage === 'cookie-policy' ? 'page' : undefined}
                            >
                                Cookie Policy
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('security-policy')} 
                                className={getFooterLinkClass('security-policy')}
                                aria-label="View Security Policy"
                                aria-current={currentPage === 'security-policy' ? 'page' : undefined}
                            >
                                Security Policy
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('copyright-policy')} 
                                className={getFooterLinkClass('copyright-policy')}
                                aria-label="View Copyright Policy"
                                aria-current={currentPage === 'copyright-policy' ? 'page' : undefined}
                            >
                                Copyright / DMCA
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('refund-policy')} 
                                className={getFooterLinkClass('refund-policy')}
                                aria-label="View Refund Policy"
                                aria-current={currentPage === 'refund-policy' ? 'page' : undefined}
                            >
                                Refund Policy
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('digital-license')} 
                                className={getFooterLinkClass('digital-license')}
                                aria-label="View Digital License"
                                aria-current={currentPage === 'digital-license' ? 'page' : undefined}
                            >
                                Digital License
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('acceptable-use')} 
                                className={getFooterLinkClass('acceptable-use')}
                                aria-label="View Acceptable Use Policy"
                                aria-current={currentPage === 'acceptable-use' ? 'page' : undefined}
                            >
                                Acceptable Use
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('community-guidelines')} 
                                className={getFooterLinkClass('community-guidelines')}
                                aria-label="View Community Guidelines"
                                aria-current={currentPage === 'community-guidelines' ? 'page' : undefined}
                            >
                                Community Guidelines
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('ai-usage-policy')} 
                                className={getFooterLinkClass('ai-usage-policy')}
                                aria-label="View AI Usage Policy"
                                aria-current={currentPage === 'ai-usage-policy' ? 'page' : undefined}
                            >
                                AI Usage Policy
                            </button>
                            <span className="text-slate-800 hidden sm:inline">•</span>
                            <button 
                                onClick={() => onNavigate?.('creator-guidelines')} 
                                className={getFooterLinkClass('creator-guidelines')}
                                aria-label="View Creator Guidelines"
                                aria-current={currentPage === 'creator-guidelines' ? 'page' : undefined}
                            >
                                Creator Guidelines
                            </button>
                        </nav>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-xs sm:text-[13px] font-mono tracking-wider pt-2">
                        <button 
                            onClick={() => onNavigate?.('data-request')} 
                            className={getFooterLinkClass('data-request')}
                            aria-label="Submit automated data request"
                            aria-current={currentPage === 'data-request' ? 'page' : undefined}
                        >
                            Data Request Desk
                        </button>
                        <span className="text-slate-800 hidden sm:inline">•</span>
                        <button 
                            onClick={() => setActiveDoc('contact')} 
                            className="text-slate-300 hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.4)] transition-colors uppercase cursor-pointer font-bold bg-transparent border-none p-0 inline focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none rounded px-1"
                            aria-label="Open contact form"
                        >
                            Contact Us
                        </button>
                        <span className="text-slate-800 hidden sm:inline">•</span>
                        <button 
                            onClick={() => setActiveDoc('about')} 
                            className="text-slate-300 hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.4)] transition-colors uppercase cursor-pointer font-bold bg-transparent border-none p-0 inline focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none rounded px-1"
                            aria-label="About AlgoEdit"
                        >
                            About Us
                        </button>
                    </div>

                    <p className="text-[11px] font-mono text-gray-500 pt-4">&copy; {new Date().getFullYear()} ALGOEDIT AI STUDIO. All rights reserved.</p>
                </div>
            </div>

            {/* Document Interactive Modal Overlays */}
            <AnimatePresence>
                {activeDoc && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#0A0E12] border border-[#26313A] rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto"
                        >
                            <button 
                                onClick={() => setActiveDoc(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>

                            {activeDoc === 'privacy' && (
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-[#8DB8CC] border-b border-white/5 pb-4">
                                        <Shield className="w-6 h-6" />
                                        <h3 className="text-xl font-bold uppercase tracking-wider text-white font-mono">Privacy Policy</h3>
                                    </div>
                                    <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-sans">
                                        <p className="font-mono text-[10px] text-[#AFC3CF] tracking-wider">EFFECTIVE DATE: JULY 12, 2026</p>
                                        <p>At ALGOEDIT AI STUDIO, user privacy and data security represent our highest engineering priorities. This Privacy Policy details the exact protocols for collecting, storing, and processing information across our network.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">1. Information We Collect</h4>
                                        <p>We collect visual media files, text prompts, customization metadata, and authentication parameters. These parameters are handled safely and are processed in real-time on our sandboxed Cloud Run server nodes.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">2. Zero-Exposure API Engineering</h4>
                                        <p>ALGOEDIT operates on a strict server-to-server design pattern. All API transactions (including Gemini and external neural weights) are executed entirely on our protected backend. No private keys, passwords, or direct credential models are ever exposed to the client browser.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">3. Data Retention and Deletion</h4>
                                        <p>Active render caches and session states are securely discarded after completion. Your permanent dashboard records are stored with full end-to-end encryption in Google Cloud Spanner & Firebase Firestore database instances, compliant with SOC 2 policies.</p>
                                    </div>
                                </div>
                            )}

                            {activeDoc === 'terms' && (
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-[#8DB8CC] border-b border-white/5 pb-4">
                                        <FileText className="w-6 h-6" />
                                        <h3 className="text-xl font-bold uppercase tracking-wider text-white font-mono">Terms & Conditions</h3>
                                    </div>
                                    <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-sans">
                                        <p className="font-mono text-[10px] text-[#AFC3CF] tracking-wider">LAST MODIFIED: JULY 12, 2026</p>
                                        <p>Welcome to ALGOEDIT AI STUDIO. By launching our studio dashboard, accessing our creative tools, or purchasing credit token packages, you agree to comply with our Terms & Conditions.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">1. IP & Creative Rights</h4>
                                        <p>All creative assets, including high-resolution images, upscale frames, and motion sequences synthesized on our platform remain your absolute, unconditional intellectual property with unlimited commercial rights.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">2. Operational Fair Use</h4>
                                        <p>You agree not to bypass, script, or automate queries designed to overwhelm GPU rendering threads. Any attempt to scrape deep model nodes, initiate denial-of-service, or spoof tokens will result in automated account termination.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">3. Credit System & Purchases</h4>
                                        <p>Purchases of credit packages are instant and non-refundable. Credits represent operational compute time allotted to neural execution nodes.</p>
                                    </div>
                                </div>
                            )}

                            {activeDoc === 'cookie' && (
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-[#8DB8CC] border-b border-white/5 pb-4">
                                        <Cookie className="w-6 h-6" />
                                        <h3 className="text-xl font-bold uppercase tracking-wider text-white font-mono">Cookie Policy</h3>
                                    </div>
                                    <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-sans">
                                        <p className="font-mono text-[10px] text-[#AFC3CF] tracking-wider">VERSION 2.0 (2026)</p>
                                        <p>Our platform uses essential local storage mechanisms and session tracking parameters to optimize your creative experience and accelerate layout transitions.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">1. Workspace & State Persistence</h4>
                                        <p>Cookies and client-side Key-Value maps are used to remember your active theme, recent prompt selections, and workspace panel states across reloads.</p>
                                        <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mt-4">2. Authentication Security</h4>
                                        <p>Essential security cookies keep your Firebase Authentication and secure login sessions active. These contain no personal profiling variables and cannot be disabled without compromising studio security.</p>
                                    </div>
                                </div>
                            )}

                            {activeDoc === 'about' && (
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-[#8DB8CC] border-b border-white/5 pb-4">
                                        <Info className="w-6 h-6" />
                                        <h3 className="text-xl font-bold uppercase tracking-wider text-white font-mono">About Us</h3>
                                    </div>
                                    <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-sans">
                                        <p className="font-mono text-[10px] text-[#AFC3CF] tracking-wider">ALGOEDIT CREATIVE LABS</p>
                                        <p>ALGOEDIT AI STUDIO represents a pioneering leap forward in full-stack generative art technology. Founded with the mission to consolidate high-end generative nodes into an intuitive, accessible dashboard, we provide an expansive studio housing 40+ professional tools.</p>
                                        <p>Our infrastructure couples state-of-the-art server integrations with responsive UI/UX. From cinematic effects to real-time face cloning, speech transcribers, and object replacement, we offer digital builders an absolute creative haven.</p>
                                        <p className="italic text-gray-400">Crafted with precision, powered by cloud-native GPU clusters.</p>
                                    </div>
                                </div>
                            )}

                            {activeDoc === 'contact' && (
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-[#8DB8CC] border-b border-white/5 pb-4">
                                        <Mail className="w-6 h-6" />
                                        <h3 className="text-xl font-bold uppercase tracking-wider text-white font-mono">Contact Us</h3>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                                        Our engineering response desk is active 24/7. Use our direct ticket transmitter below to reach AlgoEdit Support instantly.
                                    </p>
                                    {submitted ? (
                                        <div className="flex flex-col items-center justify-center text-center py-6 space-y-2 bg-[#10161B] border border-[#26313A] rounded-2xl p-4">
                                            <CheckCircle className="w-8 h-8 text-[#8DB8CC] animate-pulse" />
                                            <h4 className="font-mono text-xs text-white uppercase font-bold">Secure Ticket Received</h4>
                                            <p className="text-[11px] text-gray-400 max-w-sm">
                                                Your support request was logged successfully. An operator will contact you via your provided email shortly.
                                            </p>
                                            <button 
                                                onClick={() => setSubmitted(false)}
                                                className="mt-3 px-3 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-mono uppercase text-white rounded border border-white/10 cursor-pointer transition-colors"
                                            >
                                                Create Another Ticket
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleContactSubmit} className="space-y-3 text-left">
                                            <div>
                                                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Your Full Name</label>
                                                <input 
                                                    type="text" 
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#8DB8CC]/40 focus:outline-none font-sans" 
                                                    placeholder="e.g. Alex Rivera"
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                                                <input 
                                                    type="email" 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#8DB8CC]/40 focus:outline-none font-mono" 
                                                    placeholder="e.g. support@alexrivera.com"
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Inquiry / Message</label>
                                                <textarea 
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    rows={4}
                                                    className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#8DB8CC]/40 focus:outline-none" 
                                                    placeholder="Please specify your request or technical issue..."
                                                    required
                                                />
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={submitting}
                                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer shadow-lg"
                                            >
                                                {submitting ? 'TRANSMITTING REQUEST...' : 'TRANSMIT TICKET'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </footer>
    );
};


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
};

const SANDBOX_TESTER_USER: User = {
  uid: 'simulate-tester-user',
  name: 'Sandbox Tester',
  email: 'sandbox@example.com',
  username: 'sandboxtester',
  picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop&crop=faces',
  tokens: 30,
  walletBalanceUSD: 500,
  userTier: 'Free' as any,
  creatorTier: 'Explorer',
  joinedAt: Date.now(),
  notifications: [],
  stats: {
    totalGenerations: 42,
    totalProjects: 15,
    stylesUsed: ['cyberpunk', 'warm-editorial'],
    totalLikes: 88,
    totalViews: 312
  }
};

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const isOnline = useOnlineStatus();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Track offline status shifts to show beautiful micro-toasts
  useEffect(() => {
    if (!isOnline) {
      showToast("Network connection lost. Offline fallback mode active.", "error");
    } else {
      const wasPreviouslyOffline = localStorage.getItem('was_offline') === 'true';
      if (wasPreviouslyOffline) {
        showToast("Network restored. System fully online and synchronized.", "success");
        localStorage.removeItem('was_offline');
      }
    }
    if (!isOnline) {
      localStorage.setItem('was_offline', 'true');
    }
  }, [isOnline, showToast]);
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const cleanPath = path.replace('/', '') as Page;
      const legalPages = [
        'legal-center', 'terms-and-conditions', 'privacy-policy', 'cookie-policy', 'security-policy', 'copyright-policy', 'refund-policy', 'digital-license', 'acceptable-use', 'community-guidelines', 'ai-usage-policy', 'creator-guidelines'
      ];
      if (cleanPath === 'data-request') {
        return 'data-request';
      }
      if (legalPages.includes(cleanPath)) {
        return cleanPath;
      }
    }
    return 'home';
  });
  const [activeStudioPage, setActiveStudioPage] = useState<FeaturePageId>('home-main');
  const [studioViewMode, setStudioViewMode] = useState<'info' | 'tool'>('tool');
  const [preloadedStudioAssets, setPreloadedStudioAssets] = useState<PreloadedAssetState | null>(null);
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState(false);
  const [isOutOfTokensModalOpen, setIsOutOfTokensModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<{ page: Page; activeStudioPage?: FeaturePageId }[]>([]);

  // Optimized sidebar visibility check with memo
  const showSidebar = React.useMemo(() => 
    currentPage === 'studio' || currentPage === 'features-overview' || currentPage === 'growth-dashboard' || currentPage === 'creator-profile' || currentPage === 'creator-leaderboard' || currentPage === 'team-management' || currentPage === 'public-showcase' || currentPage === 'home' || currentPage === 'ai-models' || currentPage === 'possibilities' || currentPage === 'ultra-fast-processing' || currentPage === 'r2-storage' || currentPage === 'razorpay-billing',
  [currentPage]);

  // URL Popstate Router
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const cleanPath = path.replace('/', '') as Page;
      const legalPages = [
        'legal-center', 'terms-and-conditions', 'privacy-policy', 'cookie-policy', 'security-policy', 'copyright-policy', 'refund-policy', 'digital-license', 'acceptable-use', 'community-guidelines', 'ai-usage-policy', 'creator-guidelines'
      ];
      if (cleanPath === 'data-request') {
        setCurrentPage('data-request');
      } else if (legalPages.includes(cleanPath)) {
        setCurrentPage(cleanPath);
      } else if (path === '/' || path === '') {
        setCurrentPage('home');
      } else {
        const validPages: Page[] = [
          'home', 'pricing', 'signin', 'studio', 'features-overview', 'why-choose-us', 'token-system', 'growth-dashboard', 'public-showcase', 'creator-profile', 'creator-leaderboard', 'team-management', 'ai-models', 'possibilities', 'ultra-fast-processing', 'r2-storage', 'razorpay-billing'
        ];
        if (validPages.includes(cleanPath)) {
          setCurrentPage(cleanPath);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Firebase Auth sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Authenticated
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for profile changes
        const unsubsProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUser(prev => {
              const updated: User = {
                ...(prev || {}),
                ...data,
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: data.name || firebaseUser.displayName || 'Neural Entity',
                picture: data.photoURL || firebaseUser.photoURL || '',
              } as User;
              return updated;
            });
          } else {
            // First time user login via Google/Auth might not have doc yet handled in signin logic
            // but we can initialize here if needed
          }
        });

        // Listen for notifications
        const notifQuery = query(
          collection(db, 'users', firebaseUser.uid, 'notifications'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const unsubsNotifs = onSnapshot(notifQuery, (snapshot) => {
          const notifications = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            time: d.data().createdAt ? d.data().createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
          })) as Notification[];
          
          setUser(prev => prev ? { ...prev, notifications } : null);
        });

        return () => {
          unsubsProfile();
          unsubsNotifs();
        };
      } else {
        // Logged out - guest mode restored
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetAppState = useCallback(() => {
    firebaseSignOut(auth);
    setUser(null);
    setCurrentPage('home');
    setAssets([]);
  }, []);

  const handleSignUp = useCallback(async (name: string, email: string, password_hash: string) => {
    // This is now handled in SignInPage using Firebase Auth createUserWithEmailAndPassword
  }, []);

  const handleSignIn = useCallback(async (email: string, password_hash: string) => {
    // This is now handled in SignInPage using Firebase Auth signInWithEmailAndPassword
  }, []);

  const handleGoogleSignIn = useCallback((credential: string) => {
    // This is now handled via Firebase Auth signInWithPopup
  }, []);

  const handleSignOut = useCallback(() => {
    resetAppState();
  }, [resetAppState]);
  
  useEffect(() => {
    if (user && user.uid) {
        // Sync tokens to backend if needed (optional with direct firestore)
    }
  }, [user?.tokens, user?.email]);


  const requireSignIn = useCallback(() => {
      if (!user) {
          setUser(SANDBOX_TESTER_USER);
          showToast("Demo Sandbox Session Activated", "info");
      }
      return true;
  }, [user, showToast]);
  
  const hasTokens = useCallback((amount: number): boolean => {
      if (!user) {
          return true;
      }
      if (user.tokens < amount) {
          setIsOutOfTokensModalOpen(true);
          return false;
      }
      return true;
  }, [user]);

  const deductTokens = useCallback((amount: number, description: string = "AI Tool Usage"): boolean => {
      if (!user) {
          return true;
      }
      if (user.tokens < amount) {
          setIsOutOfTokensModalOpen(true);
          return false;
      }
      const newBalance = user.tokens - amount;
      setUser(prev => prev ? { ...prev, tokens: newBalance } : null);
      return true;
  }, [user]);

  const handlePurchaseTokens = useCallback((amount: number, newTier?: string) => {
    if (!requireSignIn() || !user) return;
    const newBalance = user.tokens + amount;
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, tokens: newBalance };
      if (newTier) {
        updated.creatorTier = newTier as CreatorTier;
      }
      return updated;
    });
    showToast(`${amount.toLocaleString()} tokens synthesized successfully${newTier ? ' and tier upgraded to ' + newTier : ''}!`, 'success');
    setCurrentPage('studio');
    setStudioViewMode('tool');
  }, [requireSignIn, user, showToast]);
  
  const handleAddAsset = (name: string, type: Asset['type'], size: number, url: string): boolean => {
      if (!user) {
        console.log("Asset generated for guest. Sign in to save to your cloud assets.");
        return true;
      }

      const newAsset: Asset = {
          id: Date.now(),
          name: name.substring(0, 50),
          type,
          size,
          url,
          createdAt: Date.now(),
      };
      setAssets(prev => [newAsset, ...prev]);

      // Log custom user activity
      if (user.uid) {
        try {
          (window as any).logUserActivity?.(user.uid, 'asset_generated', `Generated new ${type}: "${name.substring(0, 45)}"`);
        } catch (e) {
          console.error('Error logging activity:', e);
        }
      }

      return true;
  };

  const handleNavigate = useCallback((page: Page | FeaturePageId, assets?: PreloadedAssetState, view: 'info' | 'tool' = 'tool') => {
    if (page !== 'creator-profile') {
      localStorage.removeItem('viewing_creator_email');
    }
    setPreloadedStudioAssets(assets || null);

    const isStudioTool = (p: Page | FeaturePageId): p is FeaturePageId => ![
        'home', 'pricing', 'signin', 'studio', 'features-overview', 'why-choose-us', 'token-system', 'growth-dashboard', 'public-showcase', 'creator-profile', 'creator-leaderboard', 'team-management', 'ai-models', 'possibilities', 'ultra-fast-processing', 'r2-storage', 'razorpay-billing', 'email-testing', 'data-request', 'terms-and-conditions', 'legal-center', 'legal', 'privacy-policy', 'cookie-policy', 'security-policy', 'copyright-policy', 'refund-policy', 'digital-license', 'acceptable-use', 'community-guidelines', 'ai-usage-policy', 'creator-guidelines'
    ].includes(p as any);

    const targetPage = isStudioTool(page) ? 'studio' : (page as Page);
    const targetStudioPage = isStudioTool(page) ? page : undefined;

    if (targetPage !== currentPage || (targetPage === 'studio' && targetStudioPage !== activeStudioPage)) {
      setNavigationHistory(prev => {
        const nextList = [...prev, { page: currentPage, activeStudioPage: currentPage === 'studio' ? activeStudioPage : undefined }];
        // Limit history size to 25 items
        return nextList.slice(-25);
      });
    }

    if (isStudioTool(page)) {
        if (user || page === 'image-generator' || page === 'video-generator') { // Allow guests for main generators
            setCurrentPage('studio');
            setActiveStudioPage(page);
            setStudioViewMode(view);
        } else {
            setCurrentPage('studio'); // go to studio
            setActiveStudioPage(page); // set the page
            setStudioViewMode(view); // set the view
            requireSignIn(); // trigger sign-in prompt
        }
    } else {
        if (user && page === 'signin') {
            setCurrentPage('studio');
            setStudioViewMode('tool');
        } else if (!user && ((page as string) === 'creator-profile' || (page as string) === 'growth-dashboard')) {
            setCurrentPage('signin');
        } else {
            setCurrentPage(page as Page);
        }
    }
    
    if (typeof window !== 'undefined') {
      const pathSuffix = targetPage === 'home' ? '' : targetPage;
      window.history.pushState(null, '', `/${pathSuffix}`);
    }
    
    window.scrollTo(0, 0);
  }, [user, requireSignIn, currentPage, activeStudioPage]);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(history => history.slice(0, -1));

      setCurrentPage(prev.page);
      if (prev.activeStudioPage) {
        setActiveStudioPage(prev.activeStudioPage);
        setStudioViewMode('tool');
      }
      
      if (typeof window !== 'undefined') {
        const pathSuffix = prev.page === 'home' ? '' : prev.page;
        window.history.pushState(null, '', `/${pathSuffix}`);
      }
    } else {
      setCurrentPage('home');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo(0, 0);
  }, [navigationHistory]);

  const handleLaunchTool = useCallback((page: FeaturePageId, assets?: PreloadedAssetState) => {
      handleNavigate(page, assets, 'tool');
  }, [handleNavigate]);

  const handleUpdateUser = useCallback(async (updates: Partial<User>) => {
    if (!user?.uid) return;
    const path = `users/${user.uid}`;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, updates);
      const newPlan = (updates.subscriptionPlan || (updates as any).plan) as SubscriptionPlan;
      if (newPlan && user.email) {
        await TeamCollaborationService.updateUserPlanAndSyncTeam(user.email, newPlan);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }, [user?.uid, user?.email]);

  const renderCurrentPage = useCallback(() => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} user={user} />;
      case 'pricing':
        return <PricingPage onPurchase={handlePurchaseTokens} currency={currency} setCurrency={setCurrency} user={user} requireSignIn={requireSignIn} />;
      case 'signin':
        return <SignInPage onNavigate={handleNavigate} />;
      case 'features-overview':
        return <FeaturesOverviewPage onNavigate={handleNavigate} />;
      case 'why-choose-us':
        return <WhyChooseUsPage onNavigate={handleNavigate} />;
      case 'token-system':
        return <TokenSystemPage onNavigate={handleNavigate} />;
      case 'growth-dashboard':
        return user ? <GrowthDashboard user={user} onUpdateUser={handleUpdateUser} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} user={user} />;
      case 'public-showcase':
        return <PublicShowcase onNavigate={handleNavigate} />;
      case 'ai-models':
        return <AIModelsPage onNavigate={handleNavigate} />;
      case 'possibilities':
        return <PossibilitiesPage onNavigate={handleNavigate} />;
      case 'ultra-fast-processing':
        return <UltraFastProcessingPage onNavigate={handleNavigate} />;
      case 'r2-storage':
        return <R2StorageManager user={user} onNavigate={handleNavigate} requireSignIn={requireSignIn} />;
      case 'razorpay-billing':
        return <RazorpayBillingPortal user={user} onNavigate={handleNavigate} onUpdateUser={handleUpdateUser} requireSignIn={requireSignIn} />;
      case 'email-testing':
        return <EmailTestingPage user={user} />;
      case 'data-request':
        return <DataRequestPage onNavigate={handleNavigate} />;
      case 'legal':
      case 'legal-center':
      case 'terms-and-conditions':
      case 'privacy-policy':
      case 'cookie-policy':
      case 'security-policy':
      case 'copyright-policy':
      case 'refund-policy':
      case 'digital-license':
      case 'acceptable-use':
      case 'community-guidelines':
      case 'ai-usage-policy':
      case 'creator-guidelines':
        return <LegalCenterPage activePage={currentPage} onNavigate={handleNavigate} />;
      case 'creator-profile':
        return user ? <CreatorProfile user={user} onUpdateUser={handleUpdateUser} onNavigate={handleNavigate} isOwnProfile={true} /> : <HomePage onNavigate={handleNavigate} user={user} />;
      case 'creator-leaderboard':
        return <CreatorLeaderboard onNavigate={handleNavigate} />;
      case 'team-management':
        return <TeamManagement user={user || SANDBOX_TESTER_USER} onNavigate={handleNavigate} onUpdateUser={handleUpdateUser} />;
      case 'studio':
        return <StudioPage 
            user={user}
            onUpdateUser={handleUpdateUser}
            onNavigate={handleNavigate}
            requireSignIn={requireSignIn}
            userTokens={user?.tokens ?? 0}
            hasTokens={hasTokens}
            deductTokens={deductTokens}
            onMediaGenerated={handleAddAsset}
            activePage={activeStudioPage}
            viewMode={studioViewMode}
            onLaunchTool={handleLaunchTool}
            preloadedAssetState={preloadedStudioAssets}
        />;
      default:
        return <HomePage onNavigate={handleNavigate} user={user} />;
    }
  }, [currentPage, user, handleNavigate, handlePurchaseTokens, currency, setCurrency, handleSignIn, handleSignUp, handleGoogleSignIn, handleUpdateUser, requireSignIn, hasTokens, deductTokens, handleAddAsset, activeStudioPage, studioViewMode, handleLaunchTool, preloadedStudioAssets]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050709] text-gray-100 font-sans antialiased selection:bg-white/20">
        {showSidebar && (
            <Sidebar 
                activePage={currentPage === 'studio' ? activeStudioPage : currentPage} 
                onNavigate={handleNavigate} 
                onPageNavigate={handleNavigate} 
                isOpen={isSidebarOpen} 
                onToggle={() => setIsSidebarOpen(prev => !prev)}
            />
        )}

        <AnimatePresence>
            {showSidebar && !isSidebarOpen && (
                <motion.button 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed left-0 top-[28%] -translate-y-1/2 z-[45] bg-[#0A0E12]/95 hover:bg-white/10 border-r border-t border-b border-[#26313A] hover:border-white/20 p-1.5 py-5 rounded-r-2xl text-slate-400 hover:text-white transition-all shadow-[0_0_30px_rgba(0,0,0,0.8)] cursor-pointer flex items-center justify-center flex-col gap-1.5"
                    title="Expand Features Sidebar"
                >
                    <div className="flex flex-col items-center gap-2 justify-center">
                        <span className="text-[7.5px] font-black uppercase tracking-[0.22em] [writing-mode:vertical-lr] text-slate-500 group-hover:text-white">FEATURES</span>
                        <ChevronRight size={14} className="text-[#8DB8CC] animate-pulse" />
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
 
        <div className="flex-grow flex flex-col h-full overflow-hidden relative z-[30]">
            <Header 
              currentPage={currentPage} 
              activeStudioPage={activeStudioPage} 
              onNavigate={handleNavigate} 
              user={user} 
              onSignOut={handleSignOut} 
              onUpdateUser={handleUpdateUser}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
              onBack={handleGoBack}
              canGoBack={navigationHistory.length > 0 || currentPage !== 'home'}
            />
            
            <main className="flex-grow overflow-y-auto overflow-x-hidden cyber-grid custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] scroll-smooth">
                <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 min-h-full">
                    <AnimatePresence>
                        {!isOnline && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.1)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                                            <WifiOff size={18} className="animate-pulse" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">Offline Fallback Mode Active</h4>
                                            <p className="text-[11px] text-red-300 font-sans mt-0.5">Your internet connection is currently offline. AI synthesis requests will operate with simulation presets.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (navigator.onLine) {
                                                showToast("System back online. Fully operational.", "success");
                                                window.location.reload();
                                            } else {
                                                showToast("Still offline. Please check your network cables or Wi-Fi configuration.", "info");
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-mono font-black uppercase text-red-300 rounded-xl border border-red-500/20 cursor-pointer transition-all shrink-0"
                                    >
                                        RE-VERIFY CONNECTION
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <React.Suspense fallback={<PageLoader />}>
                        {renderCurrentPage()}
                    </React.Suspense>
                </div>
                { ['home', 'features-overview', 'why-choose-us', 'token-system', 'growth-dashboard', 'data-request', 'terms-and-conditions', 'legal-center', 'legal', 'privacy-policy', 'cookie-policy', 'security-policy', 'copyright-policy', 'refund-policy', 'digital-license', 'acceptable-use', 'community-guidelines', 'ai-usage-policy', 'creator-guidelines'].includes(currentPage) && <Footer onNavigate={handleNavigate} currentPage={currentPage} /> }
            </main>
        </div>

        {showWelcome && user && (
            <PersonalizedWelcome 
                userName={user.name} 
                onClose={() => setShowWelcome(false)} 
                isFoundingMember={user.bonusesReceived?.foundingMember}
            />
        )}
        {user && currentPage === 'studio' && <AICompliment />}
        {isSignInPromptOpen && (
            <SignInPromptModal 
                onClose={() => setIsSignInPromptOpen(false)}
                onNavigate={handleNavigate}
            />
        )}
        {isOutOfTokensModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                <div className="ai-console p-10 max-w-md w-full text-center relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8DB8CC] to-transparent animate-shimmer" />
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                        <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Credits_Depleted</h2>
                    <p className="text-slate-400 mb-10 font-medium leading-relaxed">Your neural processing credits have reached zero. Initialize a recharge to continue synthesis.</p>
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={() => {
                                setIsOutOfTokensModalOpen(false);
                                handleNavigate('pricing');
                            }}
                            className="btn-primary w-full"
                        >
                            Recharge_Credits
                        </button>
                        <button 
                            onClick={() => setIsOutOfTokensModalOpen(false)}
                            className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            Decline_Recharge
                        </button>
                    </div>
                </div>
            </div>
        )}
        <HardeningControlCenter />
    </div>
  );
};

export default App;
