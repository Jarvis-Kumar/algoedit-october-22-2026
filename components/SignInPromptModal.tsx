




import React, { useState, useEffect } from 'react';
import { Page, OnNavigateType } from '../types';
import { GOOGLE_CLIENT_ID } from '../constants';

declare global {
    interface Window {
        google: any;
    }
}

import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { SIGNUP_BONUS_TOKENS } from '../constants';

interface SignInPromptModalProps {
  onClose: () => void;
  onNavigate: OnNavigateType;
}

const SignInPromptModal: React.FC<SignInPromptModalProps> = ({ onClose, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Polling logic removed, using signInWithPopup
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        const path = `users/${user.uid}`;
        try {
          await setDoc(userDocRef, {
            name: user.displayName || 'Neural Entity',
            email: user.email,
            photoURL: user.photoURL || '',
            tokens: SIGNUP_BONUS_TOKENS,
            creatorTier: 'Explorer',
            joinedAt: serverTimestamp(),
            stats: {
              totalGenerations: 0,
              totalProjects: 0
            },
            bonusesReceived: { signup: true }
          });

          // Add welcome notification
          const welcomeNotifRef = doc(collection(db, 'users', user.uid, 'notifications'));
          await setDoc(welcomeNotifRef, {
            title: 'System Initialized',
            desc: 'Welcome to Algoedit. Your neural workspace is ready.',
            icon: 'sparkles',
            read: false,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md ai-modal" onClick={(e) => e.stopPropagation()}>
        <header className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Sign In to Continue</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-8">
          <p className="text-slate-400 mb-8 text-center text-xs font-bold uppercase tracking-wide leading-relaxed">Please sign in to access this feature. This helps us save your work and manage your usage limits.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full ai-input" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full ai-input" placeholder="••••••••" />
            </div>
            {error && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-wider">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center ai-button disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : 'Sign In'}
            </button>
          </form>
           <div className="relative flex py-8 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-slate-600 text-[10px] font-black uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>
            <button 
              onClick={handleGoogleSignIn}
              className="flex justify-center w-full ai-button-outline gap-2"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              <span>Continue with Google</span>
            </button>
           <p className="text-center text-[10px] font-bold text-slate-500 pt-8 uppercase tracking-widest leading-loose">
                Don't have an account?
                <button onClick={() => { onClose(); onNavigate('signin'); }} className="font-bold text-[#8DB8CC] hover:text-white transition-colors ml-2 underline underline-offset-4 decoration-[#8DB8CC]/40">
                    Sign Up
                </button>
            </p>
        </main>
      </div>
    </div>
  );
};

export default SignInPromptModal;