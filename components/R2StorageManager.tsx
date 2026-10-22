import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Trash2, 
  Upload, 
  AlertTriangle, 
  Zap, 
  Database, 
  HardDrive, 
  Scale, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Image, 
  Video, 
  ChevronRight, 
  Users, 
  Lock, 
  HelpCircle,
  FolderOpen,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
  Search,
  Check,
  Code2,
  FileCode,
  ShieldCheck,
  History,
  Archive,
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Info,
  DollarSign
} from 'lucide-react';
import { User as AuthUser } from '../types';

// Multi-tenant structures
interface Tenant {
  id: string;
  name: string;
  role: string;
  email: string;
  currentPlan: 'Free' | 'Pro' | 'Creator' | 'Business';
  baseStorage: number; // Bytes
  extraStoragePurchased: number; // Bytes
  usedStorage: number; // Bytes
  totalStorage: number; // Bytes
  remainingStorage: number; // Bytes
  createdAt: string;
}

interface VirtualFile {
  id: string;
  ownerId: string;
  filename: string;
  fileType: string;
  fileSize: number; // Bytes
  r2Key: string;
  isDeleted: boolean; // For Soft Delete Recycle Bin
  createdAt: string;
}

interface FileHistoryRecord {
  id: string;
  userId: string;
  fileId: string;
  filename: string;
  action: 'UPLOAD' | 'DOWNLOAD' | 'EDIT' | 'DELETE' | 'RESTORE' | 'PERMANENT_DELETE';
  timestamp: string;
}

interface StoragePurchaseRecord {
  id: string;
  userId: string;
  amountPurchased: number; // Bytes
  priceUSD: number;
  paymentId: string;
  createdAt: string;
}

const ONE_KB = 1024;
const ONE_MB = ONE_KB * 1024;
const ONE_GB = ONE_MB * 1024;
const ONE_TB = ONE_GB * 1024;

// Default initial simulation databases
const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'user_a_123',
    name: 'Alice Johnson',
    role: 'Lead Systems Developer',
    email: 'alice@algoedit.com',
    currentPlan: 'Pro',
    baseStorage: 100 * ONE_GB,
    extraStoragePurchased: 50 * ONE_GB,
    usedStorage: 42.8 * ONE_GB,
    totalStorage: 150 * ONE_GB,
    remainingStorage: 107.2 * ONE_GB,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user_b_456',
    name: 'Bob Miller',
    role: 'Creative UI Designer',
    email: 'bob.creative@algoedit.com',
    currentPlan: 'Free',
    baseStorage: 5 * ONE_GB,
    extraStoragePurchased: 0,
    usedStorage: 4.88 * ONE_GB,
    totalStorage: 5 * ONE_GB,
    remainingStorage: 0.12 * ONE_GB,
    createdAt: '2026-03-15T11:30:00Z',
  },
  {
    id: 'user_c_789',
    name: 'Charlie Smith',
    role: 'SaaS Business Manager',
    email: 'charlie.admin@algoedit.com',
    currentPlan: 'Business',
    baseStorage: 2048 * ONE_GB, // 2 TB
    extraStoragePurchased: 500 * ONE_GB,
    usedStorage: 1250.4 * ONE_GB,
    totalStorage: 2548 * ONE_GB,
    remainingStorage: 1297.6 * ONE_GB,
    createdAt: '2026-02-01T14:15:00Z',
  }
];

const INITIAL_FILES: VirtualFile[] = [
  // Alice Johnson's Files (user_a_123)
  {
    id: 'file_alice_001',
    ownerId: 'user_a_123',
    filename: 'main_kernel_algo.cpp',
    fileType: 'projects',
    fileSize: 4.6 * ONE_MB,
    r2Key: 'users/user_a_123/projects/main_kernel_algo.cpp',
    isDeleted: false,
    createdAt: '2026-06-10T14:12:00Z',
  },
  {
    id: 'file_alice_002',
    ownerId: 'user_a_123',
    filename: 'v2_hero_banner.png',
    fileType: 'images',
    fileSize: 15.2 * ONE_MB,
    r2Key: 'users/user_a_123/images/v2_hero_banner.png',
    isDeleted: false,
    createdAt: '2026-06-12T09:20:00Z',
  },
  {
    id: 'file_alice_003',
    ownerId: 'user_a_123',
    filename: 'demo_recording_draft.mp4',
    fileType: 'videos',
    fileSize: 420 * ONE_MB,
    r2Key: 'users/user_a_123/videos/demo_recording_draft.mp4',
    isDeleted: false,
    createdAt: '2026-06-14T18:00:00Z',
  },
  {
    id: 'file_alice_soft_deleted',
    ownerId: 'user_a_123',
    filename: 'stale_metrics_trash.xlsx',
    fileType: 'history',
    fileSize: 85 * ONE_MB,
    r2Key: 'users/user_a_123/history/stale_metrics_trash.xlsx',
    isDeleted: true, // Recycle Bin item
    createdAt: '2026-06-11T16:45:00Z',
  },

  // Bob Miller's Files (user_b_456)
  {
    id: 'file_bob_001',
    ownerId: 'user_b_456',
    filename: 'sorting_benchmark.ts',
    fileType: 'projects',
    fileSize: 1.8 * ONE_MB,
    r2Key: 'users/user_b_456/projects/sorting_benchmark.ts',
    isDeleted: false,
    createdAt: '2026-06-15T11:24:00Z',
  },
  {
    id: 'file_bob_002',
    ownerId: 'user_b_456',
    filename: 'creative_portfolio_backup.zip',
    fileType: 'history',
    fileSize: 4.8 * ONE_GB,
    r2Key: 'users/user_b_456/history/creative_portfolio_backup.zip',
    isDeleted: false,
    createdAt: '2026-06-16T15:40:00Z',
  }
];

const INITIAL_HISTORY: FileHistoryRecord[] = [
  { id: 'hist_a001', userId: 'user_a_123', fileId: 'file_alice_001', filename: 'main_kernel_algo.cpp', action: 'UPLOAD', timestamp: '2026-06-10T14:12:00Z' },
  { id: 'hist_a002', userId: 'user_a_123', fileId: 'file_alice_002', filename: 'v2_hero_banner.png', action: 'UPLOAD', timestamp: '2026-06-12T09:20:00Z' },
  { id: 'hist_a003', userId: 'user_a_123', fileId: 'file_alice_soft_deleted', filename: 'stale_metrics_trash.xlsx', action: 'UPLOAD', timestamp: '2026-06-11T15:00:00Z' },
  { id: 'hist_a004', userId: 'user_a_123', fileId: 'file_alice_soft_deleted', filename: 'stale_metrics_trash.xlsx', action: 'DELETE', timestamp: '2026-06-11T16:45:00Z' },
  { id: 'hist_b001', userId: 'user_b_456', fileId: 'file_bob_001', filename: 'sorting_benchmark.ts', action: 'UPLOAD', timestamp: '2026-06-15T11:24:00Z' },
  { id: 'hist_b002', userId: 'user_b_456', fileId: 'file_bob_002', filename: 'creative_portfolio_backup.zip', action: 'UPLOAD', timestamp: '2026-06-16T15:40:00Z' }
];

const INITIAL_PURCHASES: StoragePurchaseRecord[] = [
  { id: 'purch_a001', userId: 'user_a_123', amountPurchased: 50 * ONE_GB, priceUSD: 19.99, paymentId: 'pay_rzp_alice_908a7b', createdAt: '2026-04-10T11:00:00Z' }
];

export default function R2StorageManager({ user, onNavigate, requireSignIn }: { user: AuthUser | null; onNavigate?: (page: any) => void; requireSignIn?: () => boolean }) {
  
  // Real dashboard simulation database states
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenantId, setCurrentTenantId] = useState<string>('user_a_123');
  const [files, setFiles] = useState<VirtualFile[]>(INITIAL_FILES);
  const [history, setHistory] = useState<FileHistoryRecord[]>(INITIAL_HISTORY);
  const [purchases, setPurchases] = useState<StoragePurchaseRecord[]>(INITIAL_PURCHASES);

  // Active view states
  const [activeLayout, setActiveLayout] = useState<'dashboard' | 'terminal' | 'sourcecode' | 'schema'>('dashboard');
  const [showRecycleBin, setShowRecycleBin] = useState<boolean>(false);
  const [securityTab, setSecurityTab] = useState<'auth' | 'defense' | 'audit'>('auth');
  const [sourceCodeTab, setSourceCodeTab] = useState<'controller' | 'rateLimit' | 'pathTraversal' | 'crypto'>('controller');

  // Input states
  const [newFilename, setNewFilename] = useState<string>('');
  const [newFileType, setNewFileType] = useState<'images' | 'videos' | 'projects' | 'history'>('projects');
  const [newFileSizeMB, setNewFileSizeMB] = useState<number>(50); // MB
  const [buyStorageSizeGB, setBuyStorageSizeGB] = useState<number>(50); // GB value

  // REST Console States
  const [selectedRoute, setSelectedRoute] = useState<string>('POST_upload');
  const [routeLogs, setRouteLogs] = useState<string>('Select an API route and run the simulation to preview backend execution logs.');
  const [routeInputPayload, setRouteInputPayload] = useState<string>('{\n  "filename": "algo_edit_run.json",\n  "fileType": "projects",\n  "fileSize": 154000\n}');
  const [routeRequestHeaders, setRouteRequestHeaders] = useState<string>('{\n  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfYV8xMjMiLCJuYW1lIjoiQWxpY2UgSm9obnNvbiJ9...",\n  "Content-Type": "application/json"\n}');

  // Custom UI alert notifier
  const [alertNotify, setAlertNotify] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; title: string; text: string } | null>({
    type: 'info',
    title: 'Multi-Tenant Simulator Loaded',
    text: 'Test advanced Cloudflare R2 path separation by switching tenants or triggering interactive S3 REST APIs.'
  });

  // Backup & Restore states
  const [systemBackups, setSystemBackups] = useState<{ id: string; timestamp: string; filesCount: number; sizeBytes: number }[]>([
    { id: 'backup_v2026_01', timestamp: '2026-06-15 03:00:00', filesCount: 5, sizeBytes: 52 * ONE_GB },
    { id: 'backup_v2026_02', timestamp: '2026-06-17 03:00:00', filesCount: 6, sizeBytes: 54 * ONE_GB }
  ]);

  // Security Intercept state logs
  const [interceptLog, setInterceptLog] = useState<{ timestamp: string; user: string; file: string; result: 'FORBIDDEN' | 'ALLOWED'; details: string } | null>(null);

  // Auto clear notification after 5 sec
  useEffect(() => {
    if (alertNotify) {
      const timer = setTimeout(() => setAlertNotify(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [alertNotify]);

  // Find active tenant object metadata
  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];

  // Helper converter
  const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getSubfolderIconColor = (type: string) => {
    switch (type) {
      case 'images': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'videos': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'projects': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'history': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  // --- ACTIONS SIMULATORS ---

  // Swap Tenants
  const handleSwitchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    const selected = tenants.find(t => t.id === tenantId);
    setShowRecycleBin(false);
    
    // Auto-update payload header matching selected user
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiR7dGVuYW50SWR9IiwibmFtZSI6IiR7c2VsZWN0ZWQ/Lm5hbWV9IiwidGllciI6IiR7c2VsZWN0ZWQ/LmN1cnJlbnRQbGFufSJ9...`;
    setRouteRequestHeaders(`{\n  "Authorization": "Bearer ${mockJwt.substring(0, 30)}...",\n  "Content-Type": "application/json"\n}`);

    setAlertNotify({
      type: 'info',
      title: 'Tenant Context Changed',
      text: `Switched context to ${selected?.name || tenantId}. Available Storage: ${formatBytes(selected?.remainingStorage || 0)}.`
    });
  };

  // 1. Upload simulation algorithm
  const handleSimulateUpload = (customName?: string, customType?: string, customSizeInBytes?: number) => {
    const filename = customName || newFilename.trim() || `unnamed_algo_run_${Math.floor(Math.random() * 9000 + 1000)}`;
    const fileType = customType || newFileType;
    const fileSize = customSizeInBytes || (newFileSizeMB * ONE_MB);

    // Filter characters to prevent path traversal
    if (filename.includes('../') || filename.includes('..\\') || filename.startsWith('/')) {
      setAlertNotify({
        type: 'error',
        title: 'Path Traversal Detected',
        text: 'API blocked illegal characters ("../") inside filename path parser.'
      });
      return;
    }

    // Storage capacity check algorithm
    const newUsedStorage = currentTenant.usedStorage + fileSize;
    if (newUsedStorage > currentTenant.totalStorage) {
      setAlertNotify({
        type: 'error',
        title: 'Storage Capacity Rejected',
        text: 'Storage full. Buy extra storage or upgrade your plan.'
      });

      // Append failing historical record
      const failLog: FileHistoryRecord = {
        id: `hist_err_${Date.now()}`,
        userId: currentTenant.id,
        fileId: 'n/a',
        filename: filename,
        action: 'UPLOAD',
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [failLog, ...prev]);
      return;
    }

    // Commit file creation
    const fileId = `file_${currentTenant.id.substring(5)}_${Math.random().toString(36).substring(2, 9)}`;
    const r2Key = `users/${currentTenant.id}/${fileType}/${filename}`;

    const newFile: VirtualFile = {
      id: fileId,
      ownerId: currentTenant.id,
      filename,
      fileType,
      fileSize,
      r2Key,
      isDeleted: false,
      createdAt: new Date().toISOString()
    };

    // Update arrays
    setFiles(prev => [newFile, ...prev]);

    // Update Tenant metrics
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenant.id) {
        const updatedUsed = t.usedStorage + fileSize;
        return {
          ...t,
          usedStorage: updatedUsed,
          remainingStorage: Math.max(0, t.totalStorage - updatedUsed)
        };
      }
      return t;
    }));

    // Register FileHistory Log
    const newHist: FileHistoryRecord = {
      id: `hist_${Math.random().toString(36).substring(2, 9)}`,
      userId: currentTenant.id,
      fileId: fileId,
      filename,
      action: 'UPLOAD',
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newHist, ...prev]);

    setNewFilename('');
    setAlertNotify({
      type: 'success',
      title: 'Upload Successful',
      text: `File "${filename}" successfully uploaded to Cloudflare path "${r2Key}".`
    });
  };

  // 2. Download Simulation (Includes Ownership checks)
  const handleDownloadFile = (file: VirtualFile) => {
    // SECURITY PRINCIPLE: Validate User Ownership BEFORE download url dispatch
    if (file.ownerId !== currentTenant.id) {
      // Intercepted logger
      setInterceptLog({
        timestamp: new Date().toLocaleTimeString(),
        user: currentTenant.name,
        file: file.filename,
        result: 'FORBIDDEN',
        details: `Access Blocked: ${currentTenant.name} (${currentTenant.id}) attempted download of Alice's File (${file.id}). Policy condition evaluated: if (file.ownerId !== currentUser.id) -> THROW FORBIDDEN_ACCESS.`
      });

      setAlertNotify({
        type: 'error',
        title: 'Forbidden Access Blocked',
        text: `Tenant ${currentTenant.name} is not authorized to download this file. Path users/${file.ownerId}/ is fully isolated!`
      });
      return;
    }

    // Log successful download in history
    const hist: FileHistoryRecord = {
      id: `hist_dl_${Math.random().toString(36).substring(2, 8)}`,
      userId: currentTenant.id,
      fileId: file.id,
      filename: file.filename,
      action: 'DOWNLOAD',
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [hist, ...prev]);

    // Simulate pre-signed URL dispatch
    const mockSignedUrl = `https://r2.algoedit.com/buckets/algoedit-r2-prod/${file.r2Key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=temp_key%2F2026&X-Amz-Date=20260618T102800Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=mock_hex_hash_url`;
    navigator.clipboard.writeText(mockSignedUrl);

    setAlertNotify({
      type: 'success',
      title: 'Secure Path Granted',
      text: `Presigned URL generated successfully & copied to clipboard! Access path: "${file.r2Key}"`
    });
  };

  // 3. Soft Delete simulation
  const handleSoftDeleteFile = (file: VirtualFile) => {
    if (file.ownerId !== currentTenant.id) {
      setInterceptLog({
        timestamp: new Date().toLocaleTimeString(),
        user: currentTenant.name,
        file: file.filename,
        result: 'FORBIDDEN',
        details: `Delete bypassed block: Attempt to soft-delete a cross-tenant object was caught by ownership check schema.`
      });
      setAlertNotify({
        type: 'error',
        title: 'Action Denied',
        text: 'Forbidden. You do not own this file.'
      });
      return;
    }

    setFiles(prev => prev.map(f => {
      if (f.id === file.id) {
        return { ...f, isDeleted: true };
      }
      return f;
    }));

    // Register action in audit history
    const hist: FileHistoryRecord = {
      id: `hist_del_${Math.random().toString(36).substring(2, 8)}`,
      userId: currentTenant.id,
      fileId: file.id,
      filename: file.filename,
      action: 'DELETE',
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [hist, ...prev]);

    setAlertNotify({
      type: 'warning',
      title: 'File Soft Deleted',
      text: `"${file.filename}" moved to Recycle Bin! Relational footprint is retained for accidental protection.`
    });
  };

  // 4. Restore soft-deleted item
  const handleRestoreFile = (file: VirtualFile) => {
    if (file.ownerId !== currentTenant.id) {
      setAlertNotify({ type: 'error', title: 'Unauthorized', text: 'You do not own this object.' });
      return;
    }

    setFiles(prev => prev.map(f => {
      if (f.id === file.id) {
        return { ...f, isDeleted: false };
      }
      return f;
    }));

    const hist: FileHistoryRecord = {
      id: `hist_rst_${Math.random().toString(36).substring(2, 8)}`,
      userId: currentTenant.id,
      fileId: file.id,
      filename: file.filename,
      action: 'RESTORE',
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [hist, ...prev]);

    setAlertNotify({
      type: 'success',
      title: 'Object Restored',
      text: `"${file.filename}" was retrieved and remounted into directory structure of ${file.fileType}.`
    });
  };

  // 5. Permanent Delete File (frees storage space)
  const handlePermanentDelete = (file: VirtualFile) => {
    if (file.ownerId !== currentTenant.id) {
      setAlertNotify({ type: 'error', title: 'Unauthorized', text: 'Ownership validation violated!' });
      return;
    }

    // Deduct size from user storage counts
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenant.id) {
        const updatedUsed = Math.max(0, t.usedStorage - file.fileSize);
        return {
          ...t,
          usedStorage: updatedUsed,
          remainingStorage: Math.max(0, t.totalStorage - updatedUsed)
        };
      }
      return t;
    }));

    setFiles(prev => prev.filter(f => f.id !== file.id));

    const hist: FileHistoryRecord = {
      id: `hist_pur_${Math.random().toString(36).substring(2, 8)}`,
      userId: currentTenant.id,
      fileId: file.id,
      filename: file.filename,
      action: 'PERMANENT_DELETE',
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [hist, ...prev]);

    setAlertNotify({
      type: 'error',
      title: 'Object Purged Permanently',
      text: `"${file.filename}" deleted from S3 backing arrays. Freed ${formatBytes(file.fileSize)} space.`
    });
  };

  // 6. Buy extra storage simulator
  const handleBuyStorageAddon = (sizeGB: number) => {
    const costMap: Record<number, number> = {
      5: 1.99,
      50: 9.99,
      100: 17.99,
      500: 49.99,
      1024: 89.99
    };
    const price = costMap[sizeGB] || 9.99;
    const addedBytes = sizeGB * ONE_GB;

    const rzpPayId = `pay_rzp_mock_${Math.random().toString(36).substring(2, 12)}`;

    // Create purchase transaction record
    const newPurchase: StoragePurchaseRecord = {
      id: `purch_${Math.random().toString(36).substring(2, 8)}`,
      userId: currentTenant.id,
      amountPurchased: addedBytes,
      priceUSD: price,
      paymentId: rzpPayId,
      createdAt: new Date().toISOString()
    };

    setPurchases(prev => [newPurchase, ...prev]);

    // Update active tenant's capacity fields
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenant.id) {
        const extraStoragePurchased = t.extraStoragePurchased + addedBytes;
        const totalStorage = t.baseStorage + extraStoragePurchased;
        const remainingStorage = totalStorage - t.usedStorage;
        return {
          ...t,
          extraStoragePurchased,
          totalStorage,
          remainingStorage
        };
      }
      return t;
    }));

    setAlertNotify({
      type: 'success',
      title: 'Storage Boost Activated',
      text: `Successfully processed Razorpay ID "${rzpPayId}". Added +${sizeGB} GB. New limit is ${formatBytes(currentTenant.totalStorage + addedBytes)}.`
    });
  };

  // 7. System Backup snapshot
  const triggerAutomatedBackup = () => {
    const backupId = `backup_v2026_${Math.floor(Math.random() * 90 + 10)}`;
    const userFiles = files.filter(f => f.ownerId === currentTenantId && !f.isDeleted);
    const sumBytes = userFiles.reduce((acc, current) => acc + current.fileSize, 0);

    const snapshot = {
      id: backupId,
      timestamp: new Date().toLocaleString(),
      filesCount: userFiles.length,
      sizeBytes: sumBytes
    };

    setSystemBackups(prev => [snapshot, ...prev]);
    setAlertNotify({
      type: 'success',
      title: 'Cloud Backup Complete',
      text: `Secure point-in-time snapshot "${backupId}" completed and compiled with current file references.`
    });
  };

  // Illegal bypass test click handler
  const handleTriggerIllegalBypass = () => {
    // Find Alice's file
    const targetAliceFile = files.find(f => f.ownerId === 'user_a_123');
    if (!targetAliceFile) {
      setAlertNotify({
        type: 'warning',
        title: 'Simulation Reset',
        text: 'No Alice file was found. Please create one, then repeat this test.'
      });
      return;
    }

    // Force run download check matching user Alice, but with active tenant context Bob
    if (currentTenantId === 'user_a_123') {
      setAlertNotify({
        type: 'warning',
        title: 'Switch Tenant First',
        text: 'Switch active user context to "Bob Miller (Free Tenant)" before running illegal bypass test.'
      });
      return;
    }

    // bob attempts download
    handleDownloadFile(targetAliceFile);
  };

  // --- REST ENDPOINT SIMULATION ENGINE ---
  const handleRunApiRoute = () => {
    let payloadParsed: any = {};
    try {
      payloadParsed = JSON.parse(routeInputPayload);
    } catch (e) {
      setRouteLogs('// PARSE ERROR: Input query arguments JSON formatted incorrectly.');
      return;
    }

    if (selectedRoute === 'POST_upload') {
      // simulate POST /upload query
      const filename = payloadParsed.filename || 'bench_temp.o';
      const fileType = payloadParsed.fileType || 'projects';
      const sizeMB = payloadParsed.fileSizeMB || 50;
      const sizeBytes = sizeMB * ONE_MB;

      const newUsed = currentTenant.usedStorage + sizeBytes;
      if (newUsed > currentTenant.totalStorage) {
        setRouteLogs(`// S3 GATEWAY ERROR - HTTP 507 INSUFFICIENT STORAGE
// POST /api/upload -> Request rejected by token authorization quota algorithm.
// LOGGING EVENT:
[${new Date().toISOString()}] RATE_LIMIT: 100/100, RETRY_AFTER: 0sec
[${new Date().toISOString()}] SECURITY: JWT Verified (UID: ${currentTenant.id}, TIER: ${currentTenant.currentPlan})
[${new Date().toISOString()}] PATH: Normalized Key "users/${currentTenant.id}/${fileType}/${filename}"
[${new Date().toISOString()}] QUOTA VALIDATOR: Allocation rejected: prospective usage ${formatBytes(newUsed)} limits total threshold ${formatBytes(currentTenant.totalStorage)}.

{
  "success": false,
  "status": 507,
  "error": "OUT_OF_STORAGE",
  "message": "Storage full. Buy extra storage or upgrade your plan.",
  "metrics": {
    "requestedSize": "${formatBytes(sizeBytes)}",
    "totalStorageLimit": "${formatBytes(currentTenant.totalStorage)}",
    "currentUsedStorage": "${formatBytes(currentTenant.usedStorage)}"
  }
}`);
      } else {
        // Trigger upload
        handleSimulateUpload(filename, fileType, sizeBytes);
        setRouteLogs(`// REST API REQUEST SUCCESS - HTTP 201 CREATED
// POST /api/upload
// HEADERS: ${routeRequestHeaders}
// REQUEST:
${routeInputPayload}

// RESPONSE PAYLOAD:
{
  "success": true,
  "status": 201,
  "data": {
    "fileId": "file_${Math.random().toString(36).substring(2, 8)}",
    "ownerId": "${currentTenant.id}",
    "filename": "${filename}",
    "r2Key": "users/${currentTenant.id}/${fileType}/${filename}",
    "sizeInBytes": ${sizeBytes},
    "encryptedKey": "aes_256_cipher_${Math.random().toString(36).substring(2, 10)}",
    "signedDownloadUrl": "https://r2.algoedit.com/buckets/algoedit-r2-prod/users/${currentTenant.id}/${fileType}/${filename}?expires=3600&sig=validated",
    "insertedAt": "${new Date().toISOString()}"
  }
}`);
      }
    } else if (selectedRoute === 'GET_files') {
      // List
      const userFiles = files.filter(f => f.ownerId === currentTenant.id && !f.isDeleted);
      setRouteLogs(`// REST API REQUEST SUCCESS - HTTP 200 OK
// GET /api/files?page=1&limit=25
// AUTHORIZED USER: ${currentTenant.id} (${currentTenant.name})

// RESPONDED STRUCTURE:
{
  "success": true,
  "status": 200,
  "results": ${userFiles.length},
  "data": ${JSON.stringify(userFiles, null, 2)}
}`);
    } else if (selectedRoute === 'GET_files_id') {
      // Get single file detail
      const userFiles = files.filter(f => f.ownerId === currentTenant.id && !f.isDeleted);
      const targetFile = userFiles[0] || files[0];
      setRouteLogs(`// REST API REQUEST SUCCESS - HTTP 200 OK
// GET /api/files/${targetFile.id}
// SECURE IDEMPOTENT DECODED RETRIEVAL

{
  "success": true,
  "data": {
    "id": "${targetFile.id}",
    "ownerId": "${targetFile.ownerId}",
    "filename": "${targetFile.filename}",
    "fileSize": ${targetFile.fileSize},
    "formattedSize": "${formatBytes(targetFile.fileSize)}",
    "r2Key": "${targetFile.r2Key}",
    "preSignedTemporaryUrl": "https://r2.algoedit.com/download/${targetFile.id}?token=jwt_signed_valid",
    "createdAt": "${targetFile.createdAt}"
  }
}`);
    } else if (selectedRoute === 'DELETE_files_id') {
      // Simulate soft-delete endpoint
      const userFiles = files.filter(f => f.ownerId === currentTenant.id && !f.isDeleted);
      if (userFiles.length === 0) {
        setRouteLogs(`// REST CODE ERROR - HTTP 404 NOT FOUND
// DELETE /api/files/file_missing
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "No deletable asset matching given file identifier was detected."
}`);
      } else {
        const fileToDelete = userFiles[0];
        handleSoftDeleteFile(fileToDelete);
        setRouteLogs(`// REST API SUCCESS - HTTP 204 NO CONTENT (SOFT DELETED)
// DELETE /api/files/${fileToDelete.id}
// RESOURCE MOVED TO THE SYSTEM RECYCLE STORAGE ARRAY FOR POINT RETENTION SAFETY (SOFT_DELETE = true)

{
  "success": true,
  "id": "${fileToDelete.id}",
  "flag": "SOFT_DELETED",
  "freedBytesDeferred": ${fileToDelete.fileSize}
}`);
      }
    } else if (selectedRoute === 'POST_buy') {
      // Sim storage buy API body
      const sizeGB = payloadParsed.sizeGB || buyStorageSizeGB;
      handleBuyStorageAddon(sizeGB);
      setRouteLogs(`// REST API REQUEST SUCCESS - HTTP 200 OK
// POST /api/storage/buy
// PAYLOAD: ${routeInputPayload}

{
  "success": true,
  "paymentId": "pay_rzp_api_${Math.random().toString(36).substring(2, 6)}",
  "amountCrediting": "${sizeGB} GB",
  "updatedQuotaLimit": {
    "baseAllocation": "${formatBytes(currentTenant.baseStorage)}",
    "additionalPurchased": "${formatBytes(currentTenant.extraStoragePurchased + sizeGB * ONE_GB)}",
    "totalStorageCapacity": "${formatBytes(currentTenant.totalStorage + sizeGB * ONE_GB)}"
  }
}`);
    } else if (selectedRoute === 'GET_history') {
      const userHist = history.filter(h => h.userId === currentTenant.id);
      setRouteLogs(`// REST API REQUEST SUCCESS - HTTP 200 OK
// GET /api/history?userId=${currentTenant.id}

{
  "success": true,
  "tenant": "${currentTenant.id}",
  "logCount": ${userHist.length},
  "auditTrails": ${JSON.stringify(userHist, null, 2)}
}`);
    } else if (selectedRoute === 'GET_usage') {
      setRouteLogs(`// REST API SUCCESS - HTTP 200 OK
// GET /api/storage/usage?userId=${currentTenant.id}

{
  "success": true,
  "tenant": "${currentTenant.id}",
  "activeCapacity": {
    "limitBytes": ${currentTenant.totalStorage},
    "limitReadable": "${formatBytes(currentTenant.totalStorage)}",
    "usedBytes": ${currentTenant.usedStorage},
    "usedReadable": "${formatBytes(currentTenant.usedStorage)}",
    "percentageFilled": "${((currentTenant.usedStorage / currentTenant.totalStorage) * 100).toFixed(2)}%"
  }
}`);
    }
  };

  // Update body payloads context on selected route changes
  useEffect(() => {
    if (selectedRoute === 'POST_upload') {
      setRouteInputPayload(`{\n  "filename": "optimized_algo_test.cpp",\n  "fileType": "projects",\n  "fileSizeMB": 12\n}`);
    } else if (selectedRoute === 'POST_buy') {
      setRouteInputPayload(`{\n  "sizeGB": 50,\n  "couponCode": "SAVE30",\n  "clientSessionId": "sess_89172a"\n}`);
    } else {
      setRouteInputPayload('// No JSON payload required for this query format.');
    }
  }, [selectedRoute]);

  // --- SOURCE CODE CONTENT ---
  const expressControllerCode = `/**
 * @file storageController.ts
 * @description Cloudflare R2 Secure Multi-Tenant Controller implementations.
 * Strict Ownership rules, path traversal validation, Zod schemas, and transactional guarantees.
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { sanitizeKey, encryptFileName, decryptFileName } from '../utils/crypto';

const prisma = new PrismaClient();
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  }
});

// Zod schema validator
export const UploadSchema = z.object({
  filename: z.string().min(1).max(255).refine(val => !val.includes('../') && !val.includes('..\\'), {
    message: "Path traversal character violations detected!"
  }),
  fileType: z.enum(['images', 'videos', 'projects', 'history']),
  fileSize: z.number().positive(),
});

/**
 * Handle Multi-Tenant Upload request with quota guard rails
 */
export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  const currentUser = req.user; // populated by JWT verification middleware
  
  // 1. Zod input validation
  const validation = UploadSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "VALIDATION_FAILED", details: validation.error.format() });
  }

  const { filename, fileType, fileSize } = validation.data;
  const storageLimitKey = \`users/\${currentUser.id}/\${fileType}/\${filename}\`;

  try {
    // 2. Transact quota evaluation to lock updates securely
    const uploadGranted = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: currentUser.id }
      });

      if (!user) throw new Error("USER_NOT_FOUND");

      // Validate prospective size limits
      const prospectiveUsed = Number(user.usedStorage) + fileSize;
      if (prospectiveUsed > Number(user.totalStorage)) {
        return { allowed: false };
      }

      // Temporarily mark updated values inside TRANSACTION (Auto rolls back if block fails downstream)
      await tx.user.update({
        where: { id: currentUser.id },
        data: {
          usedStorage: prospectiveUsed,
          remainingStorage: Number(user.totalStorage) - prospectiveUsed
        }
      });

      return { allowed: true };
    });

    if (!uploadGranted.allowed) {
      return res.status(507).json({ 
        error: "OUT_OF_STORAGE", 
        message: "Storage full. Buy extra storage or upgrade your plan." 
      });
    }

    // 3. Request presigned upload URL from Cloudflare S3 R2 bucket
    const r2PutCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: storageLimitKey,
      ContentType: req.body.contentType || 'application/octet-stream',
      Metadata: {
        ownerId: currentUser.id
      }
    });

    const preSignedPutUrl = await getSignedUrl(r2Client, r2PutCommand, { expiresIn: 3600 });

    // 4. Register record in Postgres SQL database via Prisma relation 
    const fileRecord = await prisma.file.create({
      data: {
        ownerId: currentUser.id,
        filename,
        fileType,
        fileSize,
        r2Key: storageLimitKey
      }
    });

    // 5. Track inside historical audit trail
    await prisma.fileHistory.create({
      data: {
        userId: currentUser.id,
        fileId: fileRecord.id,
        action: 'UPLOAD'
      }
    });

    res.status(201).json({
      success: true,
      file: fileRecord,
      preSignedPutUrl
    });

  } catch (err) {
    next(err); // centralised error handler
  }
}

/**
 * Handle Download dispatch requiring strict verification check of ownership
 */
export async function downloadFile(req: Request, res: Response, next: NextFunction) {
  const currentUser = req.user;
  const { fileId } = req.params;

  try {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) return res.status(404).json({ error: "FILE_NOT_FOUND" });

    // CRITICAL OWNERSHIP CHECK: Bypass prevents unauthorized files hijacking
    if (file.ownerId !== currentUser.id) {
      return res.status(403).json({ 
        error: "FORBIDDEN", 
        message: "You are not authorized to touch this file context." 
      });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: file.r2Key
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    
    // Register action audit
    await prisma.fileHistory.create({
      data: { userId: currentUser.id, fileId, action: 'DOWNLOAD' }
    });

    res.json({ success: true, downloadUrl: signedUrl });
  } catch (err) {
    next(err);
  }
}`;

  const prismaSchemaCodeOutput = `// prisma/schema.prisma
// Production-ready relational tables with Storage details

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                    String            @id
  name                  String
  email                 String            @unique
  currentPlan           String            @default("Free")
  storageLimit          BigInt            @default(5368709120) // 5 GB default
  extraStoragePurchased BigInt            @default(0)
  totalStorage          BigInt            @default(5368709120)
  usedStorage           BigInt            @default(0)
  remainingStorage      BigInt            @default(5368709120)
  createdAt             DateTime          @default(now())

  files                 File[]
  purchases             StoragePurchase[]
  history               FileHistory[]
}

model File {
  id                    String            @id @default(uuid())
  ownerId               String
  filename              String
  fileType              String            // images, videos, projects, history
  fileSize              BigInt
  r2Key                 String
  isDeleted             Boolean           @default(false) // Soft Delete recycle bin Support
  createdAt             DateTime          @default(now())

  user                  User              @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  historyRecords        FileHistory[]
}

model StoragePurchase {
  id                    String            @id @default(uuid())
  userId                String
  amountPurchased       BigInt            // bytes purchased
  pricePaidUSD          Float
  paymentId             String            @unique // Razorpay signature capture bound
  createdAt             DateTime          @default(now())

  user                  User              @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model FileHistory {
  id                    String            @id @default(uuid())
  userId                String
  fileId                String?
  action                String            // UPLOAD, DOWNLOAD, EDIT, DELETE, RESTORE
  timestamp             DateTime          @default(now())

  user                  User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  file                  File?             @relation(fields: [fileId], references: [id], onDelete: SetNull)
}`;

  const rateLimitingSourceCode = `/**
 * @file rateLimiter.ts
 * @description Prevents fast object enumerations, path traversals, or dictionary attacks on pre-signed URLs.
 */
import rateLimit from 'express-rate-limit';

export const storageApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100, // Limit each tenant to 100 API queries per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "TOO_MANY_REQUESTS",
    message: "Rate limit threshold breached! Please wait before executing new storage payloads."
  }
});`;

  const pathTraversalDefenseCode = `/**
 * @file pathTraversal.ts
 * @description Strict checks targeting dangerous relative patterns like ../ or null byte injections.
 */
import path from 'path';

export function validateSafeR2KeyPrefix(key: string, expectedUserId: string): boolean {
  // 1. Block directory traversals
  if (key.includes('..') || key.includes('/') === false) {
    return false;
  }

  // 2. Verify key path strictly maps to expected safe prefix directory
  const requiredPrefix = \`users/\${expectedUserId}/\`;
  const normalizedKey = path.normalize(key).replace(/\\\\/g, '/');

  if (!normalizedKey.startsWith(requiredPrefix)) {
    return false;
  }

  // 3. Null byte poisoning threat blocking
  if (key.indexOf('\\0') !== -1) {
    return false;
  }

  return true;
}`;

  const securityKeyCryptoCode = `/**
 * @file crypto.ts
 * @description AES-256 cryptosystem encrypting filenames inside database storage blocks to prevent enumeration exploits.
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.FALCON_ENCRYPTION_SECRET || 'g3r2k9d0la0snf78qbsndf726smd8263'; // Must be 32 bytes

export function encryptFileName(text: string): { iv: string; cipherText: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    cipherText: encrypted.toString('hex')
  };
}

export function decryptFileName(cipherText: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(cipherText, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}`;

  return (
    <div id="algoedit-storage-console" className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#03050C] font-sans text-slate-100 min-h-screen">
      
      {/* Dynamic inline notification box */}
      <AnimatePresence>
        {alertNotify && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl border max-w-sm shadow-xl flex gap-3 backdrop-blur-md ${
              alertNotify.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
                : alertNotify.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-rose-900/10'
                  : alertNotify.type === 'warning'
                    ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/90 border-blue-500/40 text-blue-200'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {alertNotify.type === 'success' && <CheckCircle2 className="text-emerald-400" size={18} />}
              {alertNotify.type === 'error' && <ShieldAlert className="text-rose-400 animate-bounce" size={18} />}
              {alertNotify.type === 'warning' && <AlertTriangle className="text-amber-400" size={18} />}
              {alertNotify.type === 'info' && <Info className="text-blue-400 animate-pulse" size={18} />}
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-0.5">{alertNotify.title}</h4>
              <p className="text-[11px] leading-relaxed text-slate-300">{alertNotify.text}</p>
            </div>
            <button 
              onClick={() => setAlertNotify(null)} 
              className="absolute top-1 right-1 text-slate-400 hover:text-white p-1 text-xs font-bold leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Title Banner Header block */}
      <div className="border-b border-white/5 pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[9px] font-black border border-blue-500/20 uppercase tracking-widest">
                ALGOEDIT STORAGE ENGINE V2
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                <Clock size={11} /> 2026 UTC CLOUD SECURE
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-2.5">
              Secure Multi-Tenant R2 Storage Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
              Demonstrate complete isolated Cloudflare object paths, strict ownership token validations, soft-delete recycle bins, dynamic Razorpay add-on boosters, automatic system backups, and run REST integrations inside an interactive live visual sandbox.
            </p>
          </div>

          {/* Quick link button to check raw code structures */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setActiveLayout('sourcecode');
                setAlertNotify({ type: 'info', title: 'Open Source Tab', text: 'Displaying complete Express Controllers & Prisma models.' });
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-white/10 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition-colors"
            >
              <Code2 size={13} className="text-purple-400" />
              Source Code Viewers
            </button>
            <button
              onClick={() => {
                setActiveLayout('terminal');
                setAlertNotify({ type: 'info', title: 'Interactive Console Active', text: 'Select endpoint paths and press execute to witness log streams.' });
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] rounded-xl text-xs font-black uppercase text-[#050709] cursor-pointer transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:brightness-110"
            >
              <Terminal size={13} />
              API Sandbox Playground
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY CONTROLS: ACTIVE SIMULATION TENANT SELECTOR */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0f1d] to-[#080a15] border border-white/5 mb-8 flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00c6ff] flex items-center gap-1.5 mb-1">
            <Users size={12} /> Active Tenant Context Controller
          </span>
          <h3 className="text-base font-extrabold text-white">Select Current Logged-In Persona</h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Swap identity to verify S3 path separation. Deleting or downloading files under Bob context blocks Alice's data from being fetched.
          </p>
        </div>

        {/* Swapper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:w-auto min-w-[320px] sm:min-w-[400px]">
          {tenants.map((ten) => {
            const isActive = ten.id === currentTenantId;
            return (
              <button
                key={ten.id}
                onClick={() => handleSwitchTenant(ten.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isActive 
                    ? 'bg-[#8DB8CC]/15 border-[#8DB8CC]/40 text-white shadow-[0_0_15px_rgba(141,184,204,0.2)]' 
                    : 'bg-[#05060b]/80 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-[#8DB8CC] animate-pulse" />
                )}
                <div className="text-[11px] font-black uppercase truncate">{ten.name}</div>
                <div className="text-[9px] font-mono text-slate-500 block truncate">{ten.email}</div>
                <div className="flex items-center justify-between mt-1 text-[9px]">
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400 font-bold">{ten.currentPlan}</span>
                  <span className="font-mono text-[9px] text-slate-400 font-heavy">{formatBytes(ten.usedStorage, 1)} Used</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN CONTENT STRUCTURES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE VIEW SWITCHING CONTROLS */}
        <div className="lg:col-span-12 flex items-center gap-1.5 border-b border-white/5 pb-3">
          <button
            onClick={() => setActiveLayout('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeLayout === 'dashboard' 
                ? 'bg-white/10 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Storage Dashboard Console
          </button>
          <button
            onClick={() => setActiveLayout('terminal')}
            className={`px-4 py-2 rounded-xl text-xs uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeLayout === 'terminal' 
                ? 'bg-white/10 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            REST API Testing Gateway
          </button>
          <button
            onClick={() => setActiveLayout('sourcecode')}
            className={`px-4 py-2 rounded-xl text-xs uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeLayout === 'sourcecode' 
                ? 'bg-white/10 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Durable Backend Source Code
          </button>
          <button
            onClick={() => setActiveLayout('schema')}
            className={`px-4 py-2 rounded-xl text-xs uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeLayout === 'schema' 
                ? 'bg-white/10 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SQL Database Relations
          </button>
        </div>

        {/* SWITCH VIEW CONTROLLERS */}
        <div className="lg:col-span-12">
          
          {/* LAYOUT 1: STORAGE DASHBOARD VIEW */}
          {activeLayout === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* STAGE A: STATS CARD AND VISUAL PROGRESS BAR & BOOSTER CONTROLS */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* 1. Storage Quotas Widget */}
                <div className="bg-[#090b11]/90 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-bold block mb-0.5">
                        {currentTenant.name}'s Quota Analytics
                      </span>
                      <h3 className="text-xl font-black text-white uppercase sm:text-2xl">
                        R2 Storage Allocation
                      </h3>
                    </div>

                    <span className="p-1 px-2.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono tracking-widest font-black uppercase">
                      Path: /users/{currentTenant.id}/
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/[0.03]">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Used Storage</span>
                      <div className="text-lg font-black text-white truncate mt-0.5">{formatBytes(currentTenant.usedStorage)}</div>
                      <span className="text-[9px] text-slate-400 font-medium">Footprint of S3 assets</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/[0.03]">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Remaining Storage</span>
                      <div className="text-lg font-black text-emerald-400 truncate mt-0.5">{formatBytes(currentTenant.remainingStorage)}</div>
                      <span className="text-[9px] text-slate-400 font-medium">Safe margin headroom</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/[0.03]">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Total Active Storage</span>
                      <div className="text-lg font-black text-indigo-400 truncate mt-0.5">{formatBytes(currentTenant.totalStorage)}</div>
                      <span className="text-[9px] text-slate-400 font-medium">Includes {formatBytes(currentTenant.extraStoragePurchased)} extra</span>
                    </div>
                  </div>

                  {/* HTML ID Attributes are preserved as requested */}
                  <div id="storage-progressbar-container" className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Proportional Space Filled</span>
                      <span className="font-mono text-white text-xs">
                        {((currentTenant.usedStorage / currentTenant.totalStorage) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Progress bar with warning visual shifts (Requirement 80% and 90% alerts) */}
                    <div className="h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          (currentTenant.usedStorage / currentTenant.totalStorage) >= 0.9
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                            : (currentTenant.usedStorage / currentTenant.totalStorage) >= 0.8
                              ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : 'bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (currentTenant.usedStorage / currentTenant.totalStorage) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Base Allocation: {formatBytes(currentTenant.baseStorage)}</span>
                      <span>{currentTenant.extraStoragePurchased > 0 ? `Storage Boost Added +${formatBytes(currentTenant.extraStoragePurchased)}` : 'No boosters purchased yet'}</span>
                    </div>
                  </div>

                  {/* Warning blocks for high tiers usage */}
                  {(currentTenant.usedStorage / currentTenant.totalStorage) >= 0.8 && (
                    <div className={`mt-5 p-3 rounded-lg border text-xs leading-normal flex items-start gap-2.5 animate-pulse ${
                      (currentTenant.usedStorage / currentTenant.totalStorage) >= 0.95
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-305'
                    }`}>
                      <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Critical Limit reached:</strong> Your active tenant has filled {((currentTenant.usedStorage / currentTenant.totalStorage) * 100).toFixed(0)}% storage capacity. S3 cloud uploads crossing thresholds will throw 507 OUT_OF_STORAGE errors.
                      </div>
                    </div>
                  )}

                </div>

                {/* 2. Interactive Object Browser Grid */}
                <div className="bg-[#090b11]/90 rounded-2xl border border-white/5 p-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">
                        {showRecycleBin ? 'Recycle Storage Wastebasket' : 'Cloudflare R2 Storage Browser'}
                      </h3>
                      {!showRecycleBin && (
                        <span className="p-1 px-2 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono font-bold">
                          Active Files: {files.filter(f => f.ownerId === currentTenantId && !f.isDeleted).length}
                        </span>
                      )}
                    </div>

                    {/* Filter and Recycling Switcher */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowRecycleBin(!showRecycleBin)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          showRecycleBin 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'bg-slate-950/60 border-white/5 hover:border-white/10 text-slate-300'
                        }`}
                      >
                        <Archive size={12} />
                        {showRecycleBin ? 'Back to Files' : `Bin (${files.filter(f => f.ownerId === currentTenantId && f.isDeleted).length})`}
                      </button>

                      <button
                        onClick={triggerAutomatedBackup}
                        className="p-1.5 px-3 bg-[#05060b] hover:bg-[#0c0d12] border border-white/5 hover:border-[#00c6ff]/30 text-[#00c6ff] font-extrabold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <RotateCcw size={12} className="text-[#00c6ff]" />
                        Run Backup
                      </button>
                    </div>
                  </div>

                  {/* Main Database directory list */}
                  <div className="space-y-3 min-h-[180px]">
                    {files.filter(f => f.ownerId === currentTenantId && f.isDeleted === showRecycleBin).length === 0 ? (
                      <div className="h-44 border border-dashed border-white/5 rounded-xl bg-slate-950/20 flex flex-col items-center justify-center text-center p-4">
                        <FolderOpen size={24} className="text-slate-600 mb-2 animate-pulse" />
                        <span className="text-xs font-extrabold text-slate-400">
                          {showRecycleBin ? 'Your Recycle Bin stands pristine.' : 'S3 cloud namespace appears empty.'}
                        </span>
                        <p className="text-[10px] text-slate-600 mt-1 max-w-xs uppercase font-mono">
                          {showRecycleBin ? 'Deleted items go here for automatic safekeeping.' : 'Use the file simulator panel below to upload test blobs into user directories.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {files.filter(f => f.ownerId === currentTenantId && f.isDeleted === showRecycleBin).map((file) => (
                          <div 
                            key={file.id}
                            className="p-4 rounded-xl bg-slate-950/60 hover:bg-[#05060b] border border-white/[0.03] flex flex-col justify-between hover:border-white/10 transition-all group duration-300"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <span className={`p-1 px-1.5 rounded text-[8.5px] font-black uppercase font-mono border ${getSubfolderIconColor(file.fileType)}`}>
                                  {file.fileType}
                                </span>
                                <span className="font-mono text-[9px] text-slate-500 font-heavy">{formatBytes(file.fileSize)}</span>
                              </div>

                              <h4 className="text-xs font-black text-white truncate mb-1" title={file.filename}>
                                {file.filename}
                              </h4>
                              <p className="text-[8.5px] font-mono text-slate-500 truncate" title={file.r2Key}>
                                Key: {file.r2Key}
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-4">
                              <span className="text-[9px] text-slate-600 font-mono">
                                Registered: {new Date(file.createdAt).toLocaleDateString()}
                              </span>

                              {/* Operations switches */}
                              <div className="flex gap-1.5">
                                {showRecycleBin ? (
                                  <>
                                    <button
                                      onClick={() => handleRestoreFile(file)}
                                      className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded cursor-pointer transition-colors"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => handlePermanentDelete(file)}
                                      className="p-1 px-1.5 bg-[#1a0c0f] hover:bg-[#2c0f13] text-rose-400 border border-rose-500/20 rounded cursor-pointer transition-colors"
                                      title="Erase Permanently"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleDownloadFile(file)}
                                      className="p-1 px-2.5 bg-slate-900 border border-white/5 hover:border-white/15 text-slate-300 hover:text-white text-[10px] font-bold rounded cursor-pointer transition-all"
                                    >
                                      Download Signed
                                    </button>
                                    <button
                                      onClick={() => handleSoftDeleteFile(file)}
                                      className="p-1.5 bg-[#120e10] text-[#ff4b4d] hover:bg-[#200e12] rounded cursor-pointer transition-colors"
                                      title="Move to Waste Bin"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* 3. Storage Upload Payload Simulator Console (Requirement 1 usability) */}
                <div className="bg-[#090b11]/90 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Upload size={16} className="text-[#00c6ff]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Interactive File Upload Panel
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    Choose file paths, input parameters, map folders dynamically, and test the storage overflow algorithm block triggers beforehand.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Filename Input */}
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Input Filename:</label>
                      <input 
                        type="text"
                        placeholder="e.g. core_neural_optimizer.py"
                        value={newFilename}
                        onChange={(e) => setNewFilename(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-[#05060b] border border-white/10 text-white rounded-xl placeholder-slate-650 font-mono outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* S3 R2 target Subfolder */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Isolated Folder:</label>
                      <select
                        value={newFileType}
                        onChange={(e) => setNewFileType(e.target.value as any)}
                        className="w-full h-10 px-3 text-xs bg-[#05060b] border border-white/10 text-white rounded-xl font-mono outline-none"
                      >
                        <option value="projects">/projects/</option>
                        <option value="images">/images/</option>
                        <option value="videos">/videos/</option>
                        <option value="history">/history/</option>
                      </select>
                    </div>

                    {/* File Size Slider */}
                    <div className="md:col-span-5 space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated Size:</label>
                        <span className="text-xs font-mono font-heavy text-blue-400">{newFileSizeMB} MB</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range"
                          min="1"
                          max="2048" // 2 GB
                          value={newFileSizeMB}
                          onChange={(e) => setNewFileSizeMB(parseInt(e.target.value, 10))}
                          className="flex-grow accent-[#00c6ff] bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          onClick={() => handleSimulateUpload()}
                          className="h-10 px-5 rounded-xl bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        >
                          <Upload size={12} />
                          Commit
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Preset helpers buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-slate-500 font-bold">
                    <span>UPLOAD PRESETS:</span>
                    <button 
                      onClick={() => { setNewFilename('avatar_logo.png'); setNewFileType('images'); setNewFileSizeMB(15); }}
                      className="px-2.5 py-1 bg-slate-950 border border-white/5 hover:border-white/10 rounded-lg text-[10px] font-mono text-slate-300"
                    >
                      15MB Image
                    </button>
                    <button 
                      onClick={() => { setNewFilename('production_database_dump.zip'); setNewFileType('history'); setNewFileSizeMB(850); }}
                      className="px-2.5 py-1 bg-slate-950 border border-white/5 hover:border-white/10 rounded-lg text-[10px] font-mono text-slate-300"
                    >
                      850MB Tarball
                    </button>
                    <button 
                      onClick={() => { setNewFilename('algo_benchmark_reel.mp4'); setNewFileType('videos'); setNewFileSizeMB(1200); }}
                      className="px-2.5 py-1 bg-slate-950 border border-white/5 hover:border-white/10 rounded-lg text-[10px] font-mono text-slate-300"
                    >
                      1.2GB Video
                    </button>
                  </div>

                </div>

              </div>
              
              {/* STAGE B: RIGHT HAND STORAGE MARKETPLACE AND DEPLOYMENT logs */}
              <div className="space-y-8">
                
                {/* 1. Buy Extra Storage Console (S3 marketplace packs) */}
                <div id="buy-storage-marketplace" className="bg-[#090b11]/90 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-2xl rounded-full" />
                  
                  <span className="text-[10px] text-[#00c6ff] font-mono tracking-widest uppercase font-bold block mb-0.5">
                    STORAGE EXPANSIONS
                  </span>
                  <h3 className="text-lg font-black text-white uppercase mb-3">
                    Buy Extra Capacity
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Instantly purchase persistent storage add-ons linked to your profile database records without altering active base subscription tiers.
                  </p>

                  {/* Selection blocks */}
                  <div className="space-y-2 mb-4">
                    {[
                      { size: 5, label: '+5 GB Booster Pack', price: '$1.99' },
                      { size: 50, label: '+50 GB Pro Expansion', price: '$9.99' },
                      { size: 100, label: '+100 GB High Allocation', price: '$17.99' },
                      { size: 500, label: '+500 GB Creator Cluster', price: '$49.99' },
                      { size: 1024, label: '+1 TB Enterprise Block', price: '$89.99' },
                    ].map((pack) => {
                      const isSelected = buyStorageSizeGB === pack.size;
                      return (
                        <button
                          key={pack.size}
                          onClick={() => setBuyStorageSizeGB(pack.size)}
                          className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-purple-900/10 border-purple-500/40 text-white' 
                              : 'bg-slate-950/65 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-400' : 'bg-slate-650'}`} />
                            <span className="text-xs font-bold">{pack.label}</span>
                          </div>
                          <span className={`font-mono text-xs ${isSelected ? 'text-purple-300' : 'text-slate-500'}`}>{pack.price}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleBuyStorageAddon(buyStorageSizeGB)}
                    className="w-full py-2.5 px-4 bg-[#110e1c] hover:bg-[#1f1738] border border-purple-500/20 text-purple-300 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <Zap size={12} className="text-purple-400 fill-purple-400" />
                    Simulate Razorpay Capture
                  </button>
                </div>

                {/* 2. Security Defense sandbox (Bypass interception tests) */}
                <div className="bg-[#090b11]/90 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-rose-400 font-mono tracking-widest uppercase font-bold block">
                      Security Verification Lab
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase mb-2">
                    Defend Multi-Tenancy
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal mb-5">
                    Trigger a security exploit simulation by requesting direct access across user profiles to test validation boundaries.
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#8DB8CC]/10 border border-[#8DB8CC]/30 text-slate-200 text-xs mb-4 leading-relaxed">
                    <strong className="text-[#8DB8CC]">Exploit Test Scenario:</strong> You are currently logged in as {currentTenant.name}. Attempting to pull or manipulate another tenant's files will trigger instant bypass alerts.
                  </div>

                  <button
                    onClick={handleTriggerIllegalBypass}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-transform"
                  >
                    Attempt Illegal Bypass Exploits
                  </button>

                  {/* exploit action logging */}
                  {interceptLog && (
                    <div className="mt-4 p-3.5 rounded-xl bg-[#140a0c] border border-rose-500/20 text-[10.5px] font-mono leading-relaxed space-y-1">
                      <div className="text-rose-400 font-black">EXPL_BYPASS LOGS [BLOCKED]</div>
                      <div>Timestamp: {interceptLog.timestamp}</div>
                      <div>User Context: {interceptLog.user}</div>
                      <div>Target File: {interceptLog.file}</div>
                      <div className="text-rose-500 font-bold">Rule Assertion Outcome: ACCESS_VIOLATION_INTERCEPT</div>
                      <div className="text-slate-400 text-[10px] leading-4 border-t border-rose-500/15 pt-2 mt-2">{interceptLog.details}</div>
                    </div>
                  )}

                </div>

                {/* 3. Global Database Audit history logs */}
                <div className="bg-[#090b11]/90 rounded-2xl border border-white/5 p-6 h-[320px] flex flex-col">
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1">
                      <History size={13} className="text-slate-400" />
                      Client Audit History Traces
                    </h3>
                    <span className="text-[9px] font-mono bg-white/5 text-slate-400 py-0.5 px-2 rounded-full">
                      Logs: {history.filter(h => h.userId === currentTenantId).length}
                    </span>
                  </div>

                  <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {history.filter(h => h.userId === currentTenantId).length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                        Audit history appears pristine.
                      </div>
                    ) : (
                      history.filter(h => h.userId === currentTenantId).map((hist) => (
                        <div key={hist.id} className="p-2 rounded bg-slate-950/40 border border-white/[0.02] text-[10.5px] font-mono space-y-0.5">
                          <div className="flex justify-between">
                            <span className={`font-black uppercase tracking-wider ${
                              hist.action === 'UPLOAD' ? 'text-emerald-450 text-emerald-400' :
                              hist.action === 'DOWNLOAD' ? 'text-cyan-400' :
                              hist.action === 'DELETE' ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              [{hist.action}]
                            </span>
                            <span className="text-slate-500">{new Date(hist.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-slate-400 truncate">Target: {hist.filename}</div>
                          <div className="text-[9px] text-slate-600 truncate">UUIDRef: {hist.fileId}</div>
                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* LAYOUT 2: REST S3 API CONSOLE SIMULATOR */}
          {activeLayout === 'terminal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Endpoint selection menu bar left */}
              <div className="lg:col-span-5 bg-[#090b11]/90 rounded-2xl border border-white/5 p-5 space-y-4">
                <div>
                  <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-bold block mb-0.5">REST INTERGATIONS LAB</span>
                  <h3 className="text-base font-extrabold text-white">Choose Target REST API Endpoint</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Select a secure endpoint path model and interactively test response payloads containing security and database metadata.
                  </p>
                </div>

                {/* Selector Button list */}
                <div className="space-y-1">
                  {[
                    { id: 'POST_upload', method: 'POST', path: '/upload', desc: 'Secure multipart upload quota check' },
                    { id: 'GET_files', method: 'GET', path: '/files', desc: 'Fetch user active object registers' },
                    { id: 'GET_files_id', method: 'GET', path: '/files/:id', desc: 'Retrieve single file pre-signed link' },
                    { id: 'DELETE_files_id', method: 'DELETE', path: '/files/:id', desc: 'Cascade soft deletion register' },
                    { id: 'POST_buy', method: 'POST', path: '/storage/buy', desc: 'Simulate commercial credit expansion' },
                    { id: 'GET_history', method: 'GET', path: '/history', desc: 'Audit trace history extraction' },
                    { id: 'GET_usage', method: 'GET', path: '/storage/usage', desc: 'Acquire capacity proportions data' }
                  ].map((route) => {
                    const isSelected = selectedRoute === route.id;
                    return (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(route.id)}
                        className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-blue-600/15 border-blue-500/40 text-white' 
                            : 'bg-slate-950/50 border-transparent hover:bg-slate-900/60 text-slate-400'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                              route.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              route.method === 'GET' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                              'bg-rose-500/10 text-rose-405 text-rose-400 border border-rose-500/20'
                            }`}>
                              {route.method}
                            </span>
                            <span className="text-xs font-mono font-heavy text-slate-200">{route.path}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5">{route.desc}</span>
                        </div>
                        <ChevronRight size={13} className="text-slate-600" />
                      </button>
                    );
                  })}
                </div>

                {/* Request Payload editing box */}
                <div className="space-y-1.5 border-t border-white/5 pt-4">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Query JSON Parameters:</label>
                  <textarea
                    value={routeInputPayload}
                    onChange={(e) => setRouteInputPayload(e.target.value)}
                    className="w-full h-24 p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-cyan-500 whitespace-pre"
                  />
                </div>

                <button
                  onClick={handleRunApiRoute}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 rounded-xl text-xs font-black uppercase tracking-wider text-[#050709] shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play size={11} className="fill-[#050709]" />
                  SIMULATE REQUEST DISPATCH
                </button>
              </div>

              {/* Endpoint response output code panel right */}
              <div className="lg:col-span-7 bg-[#090b11]/90 rounded-2xl border border-white/5 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      <Terminal size={12} /> REST JSON RESPONSE CONSOLE
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase">Status Code Ready</span>
                  </div>

                  {/* Preformatted terminal window */}
                  <div className="bg-[#05060b] rounded-xl border border-slate-900 font-mono text-[10.5px] p-4 text-[#00ffd2] h-[480px] overflow-y-auto custom-scrollbar relative">
                    <pre className="leading-5 whitespace-pre-wrap">{routeLogs}</pre>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.02] text-[10.5px] leading-relaxed text-slate-400 flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-[#00c6ff] flex-shrink-0 mt-0.5" />
                  <span>By validating the authorization JWT tokens and verifying ownership properties dynamically on every dispatch, cross-user path poisoning and file traversal attempts are immediately neutralized.</span>
                </div>
              </div>

            </div>
          )}

          {/* LAYOUT 3: COMPLETE MODULAR SOURCE CODE TEMPLAY TAB */}
          {activeLayout === 'sourcecode' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* File selector subhead left */}
              <div className="lg:col-span-3 bg-[#090b11]/90 rounded-2xl border border-white/5 p-4 space-y-1.5">
                <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-black block mb-2">Back-End Modules</span>
                {[
                  { id: 'controller', name: 'storageController.ts', desc: 'Secure R2 Actions wrapper' },
                  { id: 'rateLimit', name: 'rateLimiter.ts', desc: 'Express flood guards' },
                  { id: 'pathTraversal', name: 'pathTraversal.ts', desc: 'Path checking defense' },
                  { id: 'crypto', name: 'crypto.ts', desc: 'AES Key cryptosystem' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSourceCodeTab(item.id as any)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      sourceCodeTab === item.id 
                        ? 'bg-purple-900/10 border-purple-500/30 text-white font-bold' 
                        : 'bg-slate-950/40 border-transparent hover:bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-mono font-heavy text-slate-205">{item.name}</div>
                    <div className="text-[10px] text-slate-500 truncate block mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Code viewer output text card */}
              <div className="lg:col-span-9 bg-[#090b11]/90 rounded-2xl border border-white/5 p-5">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#00c6ff] tracking-widest mb-0.5">Production Code Quality</h3>
                    <span className="text-xs font-mono font-heavy text-slate-350 bg-white/5 px-2 py-0.5 rounded">
                      {sourceCodeTab === 'controller' && 'controllers/storageController.ts'}
                      {sourceCodeTab === 'rateLimit' && 'middleware/rateLimiter.ts'}
                      {sourceCodeTab === 'pathTraversal' && 'utils/pathTraversal.ts'}
                      {sourceCodeTab === 'crypto' && 'utils/crypto.ts'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      let t = expressControllerCode;
                      if (sourceCodeTab === 'rateLimit') t = rateLimitingSourceCode;
                      if (sourceCodeTab === 'pathTraversal') t = pathTraversalDefenseCode;
                      if (sourceCodeTab === 'crypto') t = securityKeyCryptoCode;
                      navigator.clipboard.writeText(t);
                      setAlertNotify({ type: 'success', title: 'Code Copied', text: 'Implementation pasted to clipboard! Put cleanly inside production architecture.' });
                    }}
                    className="p-1 px-3 bg-zinc-950 hover:bg-slate-900 text-[10.5px] border border-white/5 text-slate-300 rounded font-mono font-bold cursor-pointer"
                  >
                    Copy Complete Snippet
                  </button>
                </div>

                {/* Pre code container */}
                <div className="bg-[#05060b] rounded-xl border border-slate-900 overflow-x-auto text-[11px] font-mono p-4 text-slate-300 h-[500px] leading-relaxed custom-scrollbar">
                  <pre>
                    {sourceCodeTab === 'controller' && expressControllerCode}
                    {sourceCodeTab === 'rateLimit' && rateLimitingSourceCode}
                    {sourceCodeTab === 'pathTraversal' && pathTraversalDefenseCode}
                    {sourceCodeTab === 'crypto' && securityKeyCryptoCode}
                  </pre>
                </div>
              </div>

            </div>
          )}

          {/* LAYOUT 4: DATABASE SCHEMAS AND CORRESPONDING MAPPING ROW TABLES */}
          {activeLayout === 'schema' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Prisma raw relational structures left */}
              <div className="lg:col-span-5 bg-[#090b11]/90 rounded-2xl border border-white/5 p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <span className="text-[10px] text-[#00c6ff] font-mono uppercase tracking-widest font-black">Prisma Schema Schema</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(prismaSchemaCodeOutput);
                      setAlertNotify({ type: 'success', title: 'Schema copied', text: 'Relational Prisma models prepared.' });
                    }}
                    className="p-1 text-[9px] text-slate-400 hover:text-white"
                  >
                    <Copy size={11} />
                  </button>
                </div>

                <div className="bg-[#05060b] rounded-xl border border-slate-900 p-4 font-mono text-[10px] text-slate-400 h-[480px] overflow-y-auto custom-scrollbar">
                  <pre className="leading-5">{prismaSchemaCodeOutput}</pre>
                </div>
              </div>

              {/* Live database visual representation rows right */}
              <div className="lg:col-span-7 bg-[#090b11]/90 rounded-2xl border border-white/5 p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">State Database Records</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live relational records currently cached in memory, demonstrating exact SQL field bindings mirroring Alice, Bob and Charlie.
                  </p>
                </div>

                {/* Table representation 1: User metadata */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#00c6ff] flex items-center gap-1">
                      <Database size={12} />
                      SQL TABLE: [User]
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono">Row Count: {tenants.length}</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#05060b]">
                    <table className="w-full border-collapse font-mono text-[9px] text-slate-300">
                      <thead>
                        <tr className="bg-white/[0.03] text-slate-400 border-b border-white/5">
                          <th className="p-2 text-left">id</th>
                          <th className="p-2 text-left">email</th>
                          <th className="p-2 text-left">currentPlan</th>
                          <th className="p-2 text-right">totalStorage</th>
                          <th className="p-2 text-right">usedStorage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenants.map((curr) => (
                          <tr key={curr.id} className="border-b border-white/[0.02]">
                            <td className="p-2 text-blue-400">{curr.id}</td>
                            <td className="p-2 text-slate-400">{curr.email}</td>
                            <td className="p-2 text-purple-400">{curr.currentPlan}</td>
                            <td className="p-2 text-right text-slate-350">{formatBytes(curr.totalStorage, 1)}</td>
                            <td className="p-2 text-right text-indigo-400">{formatBytes(curr.usedStorage, 1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table representation 2: S3 File metadata */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Database size={12} />
                      SQL TABLE: [File]
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono">Row Count: {files.length}</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#05060b]">
                    <table className="w-full border-collapse font-mono text-[9px] text-slate-300">
                      <thead>
                        <tr className="bg-white/[0.03] text-slate-400 border-b border-white/5 text-slate-400">
                          <th className="p-2 text-left">id</th>
                          <th className="p-2 text-left">ownerId</th>
                          <th className="p-2 text-left">filename</th>
                          <th className="p-2 text-left">fileType</th>
                          <th className="p-2 text-right">fileSize</th>
                          <th className="p-2 text-center">isDeleted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.slice(0, 7).map((curr) => (
                          <tr key={curr.id} className="border-b border-white/[0.02]">
                            <td className="p-2 text-emerald-400">{curr.id}</td>
                            <td className="p-2 text-slate-400">{curr.ownerId}</td>
                            <td className="p-2 text-slate-205">{curr.filename}</td>
                            <td className="p-2 text-slate-400">{curr.fileType}</td>
                            <td className="p-2 text-right text-slate-350">{formatBytes(curr.fileSize, 1)}</td>
                            <td className="p-2 text-center text-slate-400">{curr.isDeleted ? 'TRUE' : 'FALSE'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
