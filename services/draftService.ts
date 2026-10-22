import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export interface DraftProject {
    id: string; // unique draft identifier
    userId: string;
    toolId: string; // which tool was being used (e.g. image-generator, video-generator)
    title: string;
    state: any; // the JSON-serialized state of the inputs
    updatedAt: number; // millisecond timestamp
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const DraftService = {
    /**
     * Helper to prune drafts older than 30 days.
     * This keeps Firestore storage tidy and enforces the 1-month automatic deletion rule.
     */
    async pruneExpiredDrafts(userId: string): Promise<void> {
        try {
            const now = Date.now();
            const threshold = now - ONE_MONTH_MS;

            const q = query(
                collection(db, 'drafts'),
                where('userId', '==', userId),
                where('updatedAt', '<', threshold)
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) return;

            const batch = writeBatch(db);
            snapshot.docs.forEach((d) => {
                batch.delete(doc(db, 'drafts', d.id));
            });

            await batch.commit();
            console.log(`[DraftService] Successfully pruned ${snapshot.size} expired drafts.`);
        } catch (error) {
            console.error('[DraftService] Expired drafts pruning failed:', error);
        }
    },

    /**
     * Fetch all drafts for a user.
     * Before returning, cleans up any expired drafts asynchronously.
     */
    async getUserDrafts(userId: string): Promise<DraftProject[]> {
        // Trigger pruning asynchronously
        this.pruneExpiredDrafts(userId).catch(console.error);

        try {
            const q = query(
                collection(db, 'drafts'),
                where('userId', '==', userId),
                orderBy('updatedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const drafts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as DraftProject));

            // Return non-expired ones just in case the query did not catch them yet
            const now = Date.now();
            return drafts.filter(d => now - d.updatedAt <= ONE_MONTH_MS);
        } catch (error) {
            console.error('[DraftService] Error loading drafts:', error);
            // Fallback to local storage if Firestore fails
            return this.getLocalDrafts(userId);
        }
    },

    /**
     * Auto-saves a draft. Stores both in local storage (instant, works offline or for guests)
     * and Firestore if user is authenticated (durable, cross-device).
     */
    async saveDraft(userId: string | null, toolId: string, title: string, state: any): Promise<void> {
        const id = userId ? `${userId}_${toolId}` : `guest_${toolId}`;
        const now = Date.now();

        const draftData: DraftProject = {
            id,
            userId: userId || 'guest',
            toolId,
            title: title || `Draft: ${toolId.replace('-', ' ').toUpperCase()}`,
            state,
            updatedAt: now
        };

        // 1. Save in local storage
        try {
            localStorage.setItem(`draft_${id}`, JSON.stringify(draftData));
        } catch (e) {
            console.warn('[DraftService] Failed to write draft to localStorage:', e);
        }

        // 2. Save in Firestore if authenticated
        if (userId && userId !== 'guest') {
            try {
                const docRef = doc(db, 'drafts', id);
                await setDoc(docRef, draftData, { merge: true });
            } catch (error) {
                console.error('[DraftService] Error saving draft to database:', error);
            }
        }
    },

    /**
     * Load a specific draft for a tool.
     */
    async getDraft(userId: string | null, toolId: string): Promise<DraftProject | null> {
        const id = userId ? `${userId}_${toolId}` : `guest_${toolId}`;

        // Try local storage first for speed and instant reload
        try {
            const raw = localStorage.getItem(`draft_${id}`);
            if (raw) {
                const parsed = JSON.parse(raw) as DraftProject;
                if (Date.now() - parsed.updatedAt <= ONE_MONTH_MS) {
                    return parsed;
                } else {
                    localStorage.removeItem(`draft_${id}`);
                }
            }
        } catch (e) {
            console.warn('[DraftService] Local draft parsing failed:', e);
        }

        // Check Firestore as source of truth
        if (userId && userId !== 'guest') {
            try {
                const q = query(
                    collection(db, 'drafts'),
                    where('userId', '==', userId),
                    where('toolId', '==', toolId)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const first = snapshot.docs[0];
                    const data = { id: first.id, ...first.data() } as DraftProject;
                    if (Date.now() - data.updatedAt <= ONE_MONTH_MS) {
                        return data;
                    }
                }
            } catch (err) {
                console.error('[DraftService] Error loading draft from Firestore:', err);
            }
        }

        return null;
    },

    /**
     * Delete a draft.
     */
    async deleteDraft(userId: string | null, toolId: string): Promise<void> {
        const id = userId ? `${userId}_${toolId}` : `guest_${toolId}`;

        try {
            localStorage.removeItem(`draft_${id}`);
        } catch (e) {}

        if (userId && userId !== 'guest') {
            try {
                const docRef = doc(db, 'drafts', id);
                await deleteDoc(docRef);
            } catch (error) {
                console.error('[DraftService] Failed to delete draft from Firestore:', error);
            }
        }
    },

    /**
     * Offline local fallback list
     */
    getLocalDrafts(userId: string): DraftProject[] {
        const prefix = `draft_${userId}_`;
        const localItems: DraftProject[] = [];
        const now = Date.now();

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw) as DraftProject;
                        if (now - parsed.updatedAt <= ONE_MONTH_MS) {
                            localItems.push(parsed);
                        } else {
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
        } catch (e) {}

        return localItems.sort((a, b) => b.updatedAt - a.updatedAt);
    }
};
