import { adminDb } from '../firebaseAdmin';
import { storageService } from './storageService';

// Units Conversion Constants
export const ONE_KB = 1024;
export const ONE_MB = ONE_KB * 1024;
export const ONE_GB = ONE_MB * 1024;
export const ONE_TB = ONE_GB * 1024;

export interface StorageQuotaInfo {
  userId: string;
  plan: 'Free' | 'Pro' | 'Creator' | 'Business';
  storageUsed: number;          // in bytes
  storageLimit: number;         // in bytes
  baseStorage: number;          // in bytes
  purchasedAddonStorage: number; // in bytes
  totalFiles: number;
  lastStorageUpdate: string;     // ISO String
  usagePercentage: number;       // rounded float
  remainingStorage: number;     // in bytes
}

export interface StorageAddonPurchase {
  addonId: string;
  userId: string;
  storageAmount: number;         // in bytes
  purchaseDate: string;          // ISO String
  expirationDate: string | null;
  paymentStatus: 'paid' | 'pending' | 'failed';
  packageId: string;
  pricePaidUSD: number;
}

export interface StorageFileRecord {
  id: string;
  userId: string;
  name: string;
  key: string;
  size: number;                 // in bytes
  type: 'image' | 'video' | 'preset' | 'document';
  contentType: string;
  url: string;
  createdAt: string;            // ISO String
}

// Subscription Plans Storage Allowance (in Bytes)
export const PLAN_LIMITS: Record<string, number> = {
  'Free': 5 * ONE_GB,
  'Pro': 100 * ONE_GB,
  'Creator': 500 * ONE_GB,
  'Business': 2048 * ONE_GB, // 2 TB
};

// Storage Addon packages by Plan type
export interface AddonPackage {
  id: string;
  name: string;
  sizeGB: number;
  priceUSD: number;
}

export const ADDON_PACKAGES: Record<string, AddonPackage[]> = {
  'Free': [
    { id: 'free-plus-10gb', name: '+10 GB Storage', sizeGB: 10, priceUSD: 1.99 },
    { id: 'free-plus-25gb', name: '+25 GB Storage', sizeGB: 25, priceUSD: 2.99 },
    { id: 'free-plus-50gb', name: '+50 GB Storage', sizeGB: 50, priceUSD: 3.99 },
  ],
  'Pro': [
    { id: 'pro-plus-100gb', name: '+100 GB Storage', sizeGB: 100, priceUSD: 9.99 },
    { id: 'pro-plus-250gb', name: '+250 GB Storage', sizeGB: 250, priceUSD: 19.99 },
    { id: 'pro-plus-500gb', name: '+500 GB Storage', sizeGB: 500, priceUSD: 34.99 },
  ],
  'Creator': [
    { id: 'creator-plus-500gb', name: '+500 GB Storage', sizeGB: 500, priceUSD: 29.99 },
    { id: 'creator-plus-1tb', name: '+1 TB Storage', sizeGB: 1024, priceUSD: 49.99 },
    { id: 'creator-plus-2tb', name: '+2 TB Storage', sizeGB: 2048, priceUSD: 89.99 },
  ],
  'Business': [
    { id: 'business-plus-1tb', name: '+1 TB Storage', sizeGB: 1024, priceUSD: 39.99 },
    { id: 'business-plus-2tb', name: '+2 TB Storage', sizeGB: 2048, priceUSD: 69.99 },
    { id: 'business-plus-5tb', name: '+5 TB Storage', sizeGB: 5120, priceUSD: 149.99 },
  ],
};

export class StorageQuotaService {
  /**
   * Helper to format bytes into readable scale
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Initialize or retrieve user's storage quota profile
   */
  async getOrCreateQuota(userId: string): Promise<StorageQuotaInfo> {
    const userRef = adminDb.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      // First-time initialization
      const defaultQuota: Omit<StorageQuotaInfo, 'userId'> = {
        plan: 'Free',
        storageUsed: 0,
        storageLimit: PLAN_LIMITS['Free'],
        baseStorage: PLAN_LIMITS['Free'],
        purchasedAddonStorage: 0,
        totalFiles: 0,
        lastStorageUpdate: new Date().toISOString(),
        usagePercentage: 0,
        remainingStorage: PLAN_LIMITS['Free'],
      };

      await userRef.set({
        ...defaultQuota,
        tokens: 100,
        creatorTier: 'Explorer',
        joinedAt: new Date().toISOString(),
      }, { merge: true });

      return { userId, ...defaultQuota };
    }

    const data = doc.data() || {};
    
    // Extrapolate current values, filling missing fields with robust defaults
    const plan: StorageQuotaInfo['plan'] = data.plan || data.subscriptionPlan || 'Free';
    const baseStorage = data.baseStorage || PLAN_LIMITS[plan] || PLAN_LIMITS['Free'];
    const purchasedAddonStorage = data.purchasedAddonStorage || 0;
    const storageLimit = baseStorage + purchasedAddonStorage;
    const storageUsed = Math.max(0, data.storageUsed || 0);
    const totalFiles = Math.max(0, data.totalFiles || 0);
    const lastStorageUpdate = data.lastStorageUpdate || new Date().toISOString();
    
    const usagePercentage = storageLimit > 0 ? parseFloat(((storageUsed / storageLimit) * 100).toFixed(2)) : 0;
    const remainingStorage = Math.max(0, storageLimit - storageUsed);

    const quota: StorageQuotaInfo = {
      userId,
      plan,
      storageUsed,
      storageLimit,
      baseStorage,
      purchasedAddonStorage,
      totalFiles,
      lastStorageUpdate,
      usagePercentage,
      remainingStorage,
    };

    // Keep fields updated in DB to maintain state consistency
    await userRef.set({
      plan,
      baseStorage,
      purchasedAddonStorage,
      storageLimit,
      storageUsed,
      totalFiles,
      lastStorageUpdate
    }, { merge: true });

    return quota;
  }

  /**
   * Validate if user has enough quota before generating a download/upload presigned URL
   */
  async validateQuotaBeforeUpload(userId: string, fileSize: number): Promise<{ allowed: boolean; quota: StorageQuotaInfo; message?: string }> {
    const quota = await this.getOrCreateQuota(userId);
    const prospectiveUsage = quota.storageUsed + fileSize;

    if (prospectiveUsage > quota.storageLimit) {
      let upgradeRecommendation = "";
      if (quota.plan === 'Free') {
        upgradeRecommendation = "Your 5 GB storage limit has been reached. Upgrade to Pro for 100 GB.";
      } else if (quota.plan === 'Pro') {
        upgradeRecommendation = "Your 100 GB storage limit has been reached. Upgrade to Creator for 500 GB.";
      } else if (quota.plan === 'Creator') {
        upgradeRecommendation = "Your 500 GB storage limit has been reached. Upgrade to Business for 2 TB.";
      } else {
        upgradeRecommendation = "Your 2 TB storage limit has been reached. Contact support for enterprise storage options.";
      }

      return {
        allowed: false,
        quota,
        message: `Upload Blocked: Adding this file (${StorageQuotaService.formatBytes(fileSize)}) will exceed your available storage quota limit. ${upgradeRecommendation}`
      };
    }

    return { allowed: true, quota };
  }

  /**
   * Commit a newly uploaded file to metadata and update user storage counts
   */
  async registerUploadedFile(userId: string, file: Omit<StorageFileRecord, 'createdAt' | 'url'>): Promise<StorageFileRecord> {
    const userRef = adminDb.collection('users').doc(userId);
    const fileId = file.id || adminDb.collection('users').doc().id; // auto-generate if missing
    
    // Get downloadable file address
    const fileUrl = await storageService.getDownloadUrl(file.key);
    const newRecord: StorageFileRecord = {
      ...file,
      id: fileId,
      url: fileUrl,
      createdAt: new Date().toISOString()
    };

    const dbPath = `users/${userId}/storageFiles/${fileId}`;
    const fileRef = adminDb.doc(dbPath);

    // Atomic transaction to secure record creation & update storage counts safely
    await adminDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const fileSnapshot = await transaction.get(fileRef);

      // Avoid double-counting if file registration is retried
      if (fileSnapshot.exists) {
        return;
      }

      const userData = userSnapshot.data() || {};
      const currentUsed = Math.max(0, userData.storageUsed || 0);
      const currentFiles = Math.max(0, userData.totalFiles || 0);

      const updatedUsed = currentUsed + file.size;
      const updatedFiles = currentFiles + 1;

      transaction.set(fileRef, newRecord);
      transaction.update(userRef, {
        storageUsed: updatedUsed,
        totalFiles: updatedFiles,
        lastStorageUpdate: new Date().toISOString()
      });
    });

    return newRecord;
  }

  /**
   * Delete a file safely from S3 and deduct its storage footprint immediately
   */
  async deleteFileRecord(userId: string, fileId: string): Promise<boolean> {
    const userRef = adminDb.collection('users').doc(userId);
    const fileRef = adminDb.doc(`users/${userId}/storageFiles/${fileId}`);
    
    const fileSnap = await fileRef.get();
    if (!fileSnap.exists) {
      throw new Error("File metadata record not found in database.");
    }

    const fileData = fileSnap.data() as StorageFileRecord;

    // Delete from Cloudflare R2
    await storageService.deleteFile(fileData.key);

    // Atomic transaction to subtract storage
    await adminDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.data() || {};

      const currentUsed = Math.max(0, userData.storageUsed || 0);
      const currentFiles = Math.max(0, userData.totalFiles || 0);

      const updatedUsed = Math.max(0, currentUsed - fileData.size);
      const updatedFiles = Math.max(0, currentFiles - 1);

      transaction.delete(fileRef);
      transaction.update(userRef, {
        storageUsed: updatedUsed,
        totalFiles: updatedFiles,
        lastStorageUpdate: new Date().toISOString()
      });
    });

    return true;
  }

  /**
   * List user files
   */
  async listUserFiles(userId: string): Promise<StorageFileRecord[]> {
    const filesSnap = await adminDb.collection(`users/${userId}/storageFiles`)
      .orderBy('createdAt', 'desc')
      .get();
      
    return filesSnap.docs.map(doc => doc.data() as StorageFileRecord);
  }

  /**
   * Update Storage Limit when a user upgrades Plan Tier
   */
  async updatePlanTier(userId: string, newPlan: 'Free' | 'Pro' | 'Creator' | 'Business'): Promise<StorageQuotaInfo> {
    const userRef = adminDb.collection('users').doc(userId);
    
    const baseStorage = PLAN_LIMITS[newPlan] || PLAN_LIMITS['Free'];
    
    await adminDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.data() || {};
      
      const purchasedAddonStorage = userData.purchasedAddonStorage || 0;
      const updatedLimit = baseStorage + purchasedAddonStorage;

      transaction.update(userRef, {
        plan: newPlan,
        subscriptionPlan: newPlan,
        baseStorage,
        storageLimit: updatedLimit,
        lastStorageUpdate: new Date().toISOString()
      });
    });

    return this.getOrCreateQuota(userId);
  }

  /**
   * Complete purchase of a storage add-on pack and instantly increment storage limits
   */
  async purchaseAddonPack(userId: string, packageId: string): Promise<{ success: boolean; addon: StorageAddonPurchase; quota: StorageQuotaInfo }> {
    const quota = await this.getOrCreateQuota(userId);
    const activePlan = quota.plan;

    const availablePacks = ADDON_PACKAGES[activePlan] || [];
    const targetPack = availablePacks.find(p => p.id === packageId);

    if (!targetPack) {
      throw new Error(`The requested storage package is not compatible with your current ${activePlan} plan.`);
    }

    const addonId = `addon_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const addedBytes = targetPack.sizeGB * ONE_GB;

    const addon: StorageAddonPurchase = {
      addonId,
      userId,
      storageAmount: addedBytes,
      purchaseDate: new Date().toISOString(),
      expirationDate: null, // Perpetual addition
      paymentStatus: 'paid',
      packageId: packageId,
      pricePaidUSD: targetPack.priceUSD
    };

    const userRef = adminDb.collection('users').doc(userId);
    const addonRef = adminDb.doc(`users/${userId}/storageAddons/${addonId}`);

    // Update rules atomically
    await adminDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.data() || {};

      const currentAddonStorage = userData.purchasedAddonStorage || 0;
      const currentBase = userData.baseStorage || PLAN_LIMITS[quota.plan] || PLAN_LIMITS['Free'];
      
      const newAddonStorage = currentAddonStorage + addedBytes;
      const newLimit = currentBase + newAddonStorage;

      transaction.set(addonRef, addon);
      transaction.update(userRef, {
        purchasedAddonStorage: newAddonStorage,
        storageLimit: newLimit,
        lastStorageUpdate: new Date().toISOString()
      });
    });

    const updatedQuota = await this.getOrCreateQuota(userId);
    return { success: true, addon, quota: updatedQuota };
  }

  /**
   * Retrieve all storage addon records purchased by user
   */
  async listAddonPurchases(userId: string): Promise<StorageAddonPurchase[]> {
    const addonsSnap = await adminDb.collection(`users/${userId}/storageAddons`)
      .orderBy('purchaseDate', 'desc')
      .get();
      
    return addonsSnap.docs.map(doc => doc.data() as StorageAddonPurchase);
  }
}

export const storageQuotaService = new StorageQuotaService();
