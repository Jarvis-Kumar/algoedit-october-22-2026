
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    Timestamp,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Project, Template, Favorite } from '../types';

export const ContentService = {
    // PROJECTS
    async getProjects(userId: string): Promise<Project[]> {
        const q = query(
            collection(db, 'projects'),
            where('ownerId', '==', userId),
            orderBy('updatedAt', 'desc')
        );
        try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, 'projects');
            return [];
        }
    },

    async createProject(project: Partial<Project>): Promise<string> {
        const user = auth.currentUser;
        if (!user) throw new Error('Authentication required');

        const newProject = {
            ...project,
            ownerId: user.uid,
            status: project.status || 'active',
            createdAt: Timestamp.now().toMillis(),
            updatedAt: Timestamp.now().toMillis(),
            members: [{ userId: user.uid, role: 'Owner' }],
            assets: project.assets || [],
            currentState: project.currentState || {}
        };

        try {
            const docRef = await addDoc(collection(db, 'projects'), newProject);
            return docRef.id;
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'projects');
            throw error;
        }
    },

    async updateProject(projectId: string, updates: Partial<Project>) {
        const docRef = doc(db, 'projects', projectId);
        try {
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now().toMillis()
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
        }
    },

    async deleteProject(projectId: string) {
        const docRef = doc(db, 'projects', projectId);
        try {
            await deleteDoc(docRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
        }
    },

    async duplicateProject(projectId: string): Promise<string> {
        const user = auth.currentUser;
        if (!user) throw new Error('Authentication required');

        try {
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) throw new Error('Project not found');

            const data = docSnap.data();
            const newProject = {
                ...data,
                name: `${data.name} (Copy)`,
                createdAt: Timestamp.now().toMillis(),
                updatedAt: Timestamp.now().toMillis(),
                ownerId: user.uid
            };

            const newDocRef = await addDoc(collection(db, 'projects'), newProject);
            return newDocRef.id;
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'projects/duplicate');
            throw error;
        }
    },

    // TEMPLATES
    async getTemplates(userId: string): Promise<Template[]> {
        const q = query(
            collection(db, 'templates'),
            where('ownerId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Template));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, 'templates');
            return [];
        }
    },

    async createTemplate(template: Partial<Template>): Promise<string> {
        const user = auth.currentUser;
        if (!user) throw new Error('Authentication required');

        const newTemplate = {
            ...template,
            ownerId: user.uid,
            createdAt: Timestamp.now().toMillis()
        };

        try {
            const docRef = await addDoc(collection(db, 'templates'), newTemplate);
            return docRef.id;
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'templates');
            throw error;
        }
    },

    async updateTemplate(templateId: string, updates: Partial<Template>) {
        const docRef = doc(db, 'templates', templateId);
        try {
            await updateDoc(docRef, updates);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `templates/${templateId}`);
        }
    },

    async duplicateTemplate(templateId: string): Promise<string> {
        const user = auth.currentUser;
        if (!user) throw new Error('Authentication required');

        try {
            const docRef = doc(db, 'templates', templateId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) throw new Error('Template not found');

            const data = docSnap.data();
            const newTemplate = {
                ...data,
                name: `${data.name} (Copy)`,
                createdAt: Timestamp.now().toMillis(),
                ownerId: user.uid
            };

            const newDocRef = await addDoc(collection(db, 'templates'), newTemplate);
            return newDocRef.id;
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'templates/duplicate');
            throw error;
        }
    },

    async deleteTemplate(templateId: string) {
        const docRef = doc(db, 'templates', templateId);
        try {
            await deleteDoc(docRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `templates/${templateId}`);
        }
    },

    // FAVORITES
    async getFavorites(userId: string): Promise<Favorite[]> {
        try {
            const snapshot = await getDocs(collection(db, 'users', userId, 'favorites'));
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Favorite));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${userId}/favorites`);
            return [];
        }
    },

    async toggleFavorite(item: { itemId: string, type: Favorite['type'] }): Promise<boolean> {
        const user = auth.currentUser;
        if (!user) return false;

        const favId = `${item.type}_${item.itemId}`;
        const docRef = doc(db, 'users', user.uid, 'favorites', favId);

        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await deleteDoc(docRef);
                return false; // Removed
            } else {
                await setDoc(docRef, {
                    itemId: item.itemId,
                    type: item.type,
                    userId: user.uid,
                    createdAt: Timestamp.now().toMillis()
                });
                return true; // Added
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/favorites`);
            return false;
        }
    }
};
