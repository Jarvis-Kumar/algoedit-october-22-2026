import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize firebase admin application
const app = getApps().length === 0
  ? initializeApp({
      projectId: firebaseConfig.projectId,
    })
  : getApp();

export const adminDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const adminAuth = getAuth(app);
