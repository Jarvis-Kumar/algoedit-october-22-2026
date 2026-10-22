





import React, { useState, useEffect } from 'react';
// FIX: Updated import for PreloadedAssetState to use the shared types file.
import { Page, StudioTab, PreloadedAssetState, OnNavigateType } from '../types';
import { GOOGLE_CLIENT_ID } from '../constants';

declare global {
    interface Window {
        google: any;
    }
}

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { SIGNUP_BONUS_TOKENS } from '../constants';

interface SignInPageProps {
  onNavigate: OnNavigateType;
}

const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // We don't need manual GSI script anymore, we use signInWithPopup with Firebase
  }, []);

  const handleAuthSuccess = async (user: any, isNew: boolean, displayName?: string) => {
    if (isNew) {
      const path = `users/${user.uid}`;
      try {
        // Create user doc in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          name: displayName || user.displayName || 'Neural Entity',
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
    onNavigate('studio');
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      await handleAuthSuccess(user, !userDoc.exists());
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
        if (isLoginView) {
            await signInWithEmailAndPassword(auth, email, password);
            onNavigate('studio');
        } else {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });
            await handleAuthSuccess(result.user, true, name);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  };


  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 bg-[#03050C]">
        <div className="w-full max-w-sm">
          <div className="ai-modal p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF]">
                  {isLoginView ? 'Welcome Back' : 'Create Account'}
                </span>
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                {isLoginView ? 'Access your Neural OS Space' : 'Register your digital protocol'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
               {!isLoginView && (
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full ai-input" placeholder="Neural Entity Name" />
                 </div>
               )}
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full ai-input" placeholder="entity@neural.link" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full ai-input" placeholder="••••••••" />
               </div>
               
               {error && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-wider">{error}</p>}
               
               <button type="submit" disabled={isLoading} className="w-full flex justify-center ai-button disabled:opacity-50">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (isLoginView ? 'Sign In' : 'Sign Up')}
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

            <p className="text-center text-[10px] font-bold text-slate-500 pt-10 uppercase tracking-widest leading-loose">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleView} className="font-bold text-[#AFC3CF] hover:text-white transition-colors ml-2 underline underline-offset-4 decoration-[#AFC3CF]/30">
                    {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
          </div>
        </div>
    </div>
  );
};

export default SignInPage;