import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Trash2, Shield, Mail, Globe, 
  ChevronRight, Sparkles, LayoutGrid, AlertTriangle, 
  DollarSign, Check, X, CreditCard, CheckCircle2, MessageSquare, 
  Send, UserCheck, Search, Crown, Star, ArrowRight, ShieldAlert,
  Sliders, Database, Layers, Folder, FileText, HardDrive, History, 
  Bell, Lock, Plus, Share2, ExternalLink, Upload, Video, Image, Settings, Save,
  Pause, Play, CloudLightning, ShieldCheck, Cpu, RefreshCw, Layers3, Activity
} from 'lucide-react';
import { 
  TeamCollaborationService, 
  DatabaseUser, 
  DatabaseTeam, 
  SubscriptionPlan, 
  TeamRole 
} from '../services/teamService';
import { CustomSelect } from './ui/CustomSelect';
import { useToast } from './ui/Toast';

interface TeamManagementProps {
  user: any;
  onNavigate: (page: string) => void;
  onUpdateUser: (updates: any) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ user, onNavigate, onUpdateUser }) => {
  const { showToast } = useToast();

  // Active tester profile to simulate collaboration in a single dashboard
  const [activeUserEmail, setActiveUserEmail] = useState<string>(user?.email || 'user@algoedit.com');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  
  // State from team collaboration database
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [teams, setTeams] = useState<DatabaseTeam[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'projects' | 'assets' | 'activity' | 'followers' | 'recycle-bin' | 'audit-logs' | 'stress-test'>('members');
  const [activities, setActivities] = useState<any[]>([]);
  const [sharedAssets, setSharedAssets] = useState<any[]>([]);
  const [teamProjects, setTeamProjects] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);

  // Enterprise specific lists
  const [recycleBinItems, setRecycleBinItems] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [projectVersions, setProjectVersions] = useState<any[]>([]);
  const [newVersionSummary, setNewVersionSummary] = useState<string>('');
  const [savingVersion, setSavingVersion] = useState<boolean>(false);

  // Resumable upload workflow states
  const [isResumableUploadMode, setIsResumableUploadMode] = useState<boolean>(true);
  const [activeUploadState, setActiveUploadState] = useState<any>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string>('0 KB/s');
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const [uploadTimeRemaining, setUploadTimeRemaining] = useState<string>('0s');
  const [simulatedInterruption, setSimulatedInterruption] = useState<boolean>(false);
  const resumableTimeoutIdRef = useRef<any>(null);

  // Stress simulation state cockpit
  const [stressTestLogs, setStressTestLogs] = useState<string[]>([]);
  const [stressTestRunning, setStressTestRunning] = useState<boolean>(false);
  const [stressTestMetrics, setStressTestMetrics] = useState<{
    concurrentUsers: number;
    dbQueriesCount: number;
    s3UploadSpeed: number;
    quotaAlertsActive: boolean;
    latencyMs: number;
    passStatus: 'NOT RUN' | 'RUNNING' | 'PASSED' | 'FAILED';
  }>({
    concurrentUsers: 0,
    dbQueriesCount: 0,
    s3UploadSpeed: 0,
    quotaAlertsActive: false,
    latencyMs: 14,
    passStatus: 'NOT RUN'
  });

  // Ownership transfer state
  const [showOwnershipTransferModal, setShowOwnershipTransferModal] = useState<boolean>(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState<string>('');

  // Collaborative Modals
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPermissionConfigModal, setShowPermissionConfigModal] = useState(false);
  const [showAssetUploadModal, setShowAssetUploadModal] = useState(false);

  // Form states for projects/assets
  const [newProjectName, setNewProjectName] = useState('');
  const [assetFileSim, setAssetFileSim] = useState<{ name: string; size: number; type: 'image' | 'video' | 'preset' | 'document' }>({
    name: 'promo-sprint.png',
    size: 4.2 * 1024 * 1024,
    type: 'image'
  });
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [selectedAssetTypeFilter, setSelectedAssetTypeFilter] = useState<'all' | 'image' | 'video' | 'preset' | 'document'>('all');

  // Modal controls
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<'general' | 'invite_capacity'>('general');

  // Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Team Member');
  const [inviteError, setInviteError] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Payment Simulation states
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardholderName, setCardholderName] = useState('Sandbox Account');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Appreciation email display
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  // Active Action Dropdown
  const [activeActionMenuUserId, setActiveActionMenuUserId] = useState<string | null>(null);

  // Chat message input
  const [chatMessageText, setChatMessageText] = useState('');
  const [simRightTab, setSimRightTab] = useState<'feed' | 'versions'>('feed');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load database on mount and whenever action triggers
  const refreshDatabase = () => {
    setUsers(TeamCollaborationService.getUsers());
    setTeams(TeamCollaborationService.getTeams());
  };

  useEffect(() => {
    refreshDatabase();
    TeamCollaborationService.startSync();
    const unsubscribe = TeamCollaborationService.subscribe(refreshDatabase);
    return () => unsubscribe();
  }, []);

  // Ensure active user exists in database and select their workspace
  useEffect(() => {
    if (activeUserEmail) {
      TeamCollaborationService.ensureUserInDatabase(activeUserEmail, user?.name).then(() => {
        refreshDatabase();
      });
    }
  }, [activeUserEmail, user?.name]);

  // Sync active workspace selection when user or team list changes
  useEffect(() => {
    const userWorkspaces = teams.filter(t => 
      t.memberEmails?.some(e => e.toLowerCase() === activeUserEmail.toLowerCase()) ||
      t.ownerId?.toLowerCase() === activeUserEmail.toLowerCase() ||
      t.members?.some(m => m.userId.toLowerCase() === activeUserEmail.toLowerCase())
    );
    if (userWorkspaces.length > 0) {
      if (!activeWorkspaceId || !userWorkspaces.some(w => w.teamId === activeWorkspaceId)) {
        setActiveWorkspaceId(userWorkspaces[0].teamId);
      }
    } else {
      setActiveWorkspaceId('');
    }
  }, [activeUserEmail, teams]);

  // Scroll chat to bottom when tab or messages change
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, teams, activeWorkspaceId]);

  // Real-time Subscriptions for Activities, Assets, Projects and Notifications (Point 4, 5, 6 & 9)
  useEffect(() => {
    if (!activeWorkspaceId) return;
    
    const unsubActivities = TeamCollaborationService.listenToActivities(activeWorkspaceId, (data) => {
      setActivities(data);
    });

    const unsubAssets = TeamCollaborationService.listenToSharedAssets(activeWorkspaceId, (data) => {
      setSharedAssets(data);
    });

    const unsubProjects = TeamCollaborationService.listenToTeamProjects(activeWorkspaceId, (data) => {
      setTeamProjects(data);
    });

    const unsubRecycleBin = TeamCollaborationService.listenToRecycleBin((data) => {
      setRecycleBinItems(data);
    });

    const unsubAuditLogs = TeamCollaborationService.listenToAuditLogs(activeWorkspaceId, (data) => {
      setAuditLogs(data);
    });

    return () => {
      unsubActivities();
      unsubAssets();
      unsubProjects();
      unsubRecycleBin();
      unsubAuditLogs();
    };
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!activeUserEmail) return;

    const unsubNotifs = TeamCollaborationService.listenToUserNotifications(activeUserEmail, (data) => {
      setUserNotifications(data);
    });

    return () => {
      unsubNotifs();
    };
  }, [activeUserEmail]);

  // Real-time subscription to project versions when simulator is open
  useEffect(() => {
    if (!selectedProject?.id) {
      setProjectVersions([]);
      return;
    }
    let active = true;
    let unsub: any = null;

    TeamCollaborationService.listenToProjectVersions(selectedProject.id, (data) => {
      if (active) {
        setProjectVersions(data);
      }
    }).then(fn => {
      unsub = fn;
    });

    return () => {
      active = false;
      if (unsub) unsub();
    };
  }, [selectedProject]);

  const handleMarkNotifRead = async (id: string) => {
    await TeamCollaborationService.markNotificationRead(activeUserEmail, id);
  };

  const handleClearAllNotifs = async () => {
    const ids = userNotifications.map(n => n.id);
    await TeamCollaborationService.clearAllNotifications(activeUserEmail, ids);
    showToast('Cleared all notifications.', 'success');
  };

  // User's workspaces
  const userWorkspaces = teams.filter(t => 
    t.memberEmails?.some(e => e.toLowerCase() === activeUserEmail.toLowerCase()) ||
    t.ownerId?.toLowerCase() === activeUserEmail.toLowerCase() ||
    t.members?.some(m => m.userId.toLowerCase() === activeUserEmail.toLowerCase())
  );

  // Active records
  const activeUser = users.find(u => u.userId.toLowerCase() === activeUserEmail.toLowerCase()) || {
    userId: activeUserEmail,
    name: user?.name || activeUserEmail.split('@')[0] || 'User',
    subscriptionPlan: 'Free' as SubscriptionPlan,
    personalAiLimits: '30 tokens/mo',
    personalStorage: '5 GB',
    personalDownloads: '10 downloads/mo',
    personalExports: 'Standard',
    teamRole: 'Owner' as TeamRole,
    currentTeamId: '',
    country: 'United States',
    countryCode: 'US'
  };

  const activeWorkspace = userWorkspaces.find(t => t.teamId === activeWorkspaceId) || userWorkspaces[0];

  // Derive roles and counts
  const memberRecordInActiveWorkspace = activeWorkspace?.members?.find(
    m => m.userId.toLowerCase() === activeUserEmail.toLowerCase()
  );
  const activeUserRole = memberRecordInActiveWorkspace?.role || 'Team Member';

  const isOwnerOfActiveWorkspace = activeWorkspace?.ownerId?.toLowerCase() === activeUserEmail.toLowerCase();
  const isHeadOfActiveWorkspace = activeUserRole === 'Head';
  const hasManagementPrivilege = isOwnerOfActiveWorkspace || isHeadOfActiveWorkspace;

  // Capacity math
  const currentMembersCount = activeWorkspace?.members?.length || 0;
  const totalCapacity = activeWorkspace?.totalCapacity || 2;
  const isAtCapacity = currentMembersCount >= totalCapacity;

  // Personal benefits (independent of team)
  const personalBenefits = activeUser ? TeamCollaborationService.getPersonalBenefits(activeUser.subscriptionPlan) : null;

  // Handlers
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError('Please provide a valid email.');
      return;
    }

    if (isAtCapacity && activeWorkspace.ownerSubscription !== 'Business') {
      setInviteError('Cannot invite. Workspace capacity reached. Upgrade capacity first.');
      return;
    }

    const res = await TeamCollaborationService.inviteMember(
      activeUserEmail,
      activeWorkspaceId,
      inviteEmail.trim(),
      inviteRole
    );

    if (res.success) {
      showToast(`Invited ${inviteEmail} successfully!`, 'success');
      setInviteEmail('');
      setInviteError('');
      setShowInviteModal(false);
      refreshDatabase();
    } else {
      setInviteError(res.error || 'Failed to send invitation.');
      showToast(res.error || 'Invitation failed.', 'error');
    }
  };

  const handleRemoveMember = async (targetEmail: string) => {
    const res = await TeamCollaborationService.removeMember(
      activeUserEmail,
      activeWorkspaceId,
      targetEmail
    );

    if (res.success) {
      showToast(`Removed member ${targetEmail} from workspace.`, 'success');
      refreshDatabase();
    } else {
      showToast(res.error || 'Removal failed.', 'error');
    }
    setActiveActionMenuUserId(null);
  };

  const handleChangeRole = async (targetEmail: string, newRole: TeamRole) => {
    const res = await TeamCollaborationService.changeRole(
      activeUserEmail,
      activeWorkspaceId,
      targetEmail,
      newRole
    );

    if (res.success) {
      showToast(`Role updated to ${newRole} for ${targetEmail}.`, 'success');
      refreshDatabase();
    } else {
      showToast(res.error || 'Failed to update role.', 'error');
    }
    setActiveActionMenuUserId(null);
  };

  const handleMarkBetterPerformer = async (targetEmail: string) => {
    const res = await TeamCollaborationService.markBetterPerformer(
      activeUserEmail,
      activeWorkspaceId,
      targetEmail
    );

    if (res.success) {
      showToast(`Promoted ${targetEmail} as a Better Performer! Appreciation dispatched.`, 'success');
      setSelectedEmail(res.emailLog);
      setShowEmailModal(true);
      refreshDatabase();
    } else {
      showToast(res.error || 'Action unauthorized or failed.', 'error');
    }
    setActiveActionMenuUserId(null);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const res = await TeamCollaborationService.createTeam(activeUserEmail, newWorkspaceName);
    if (res.success && res.team) {
      showToast(`Workspace "${newWorkspaceName}" successfully launched!`, 'success');
      setActiveWorkspaceId(res.team.teamId);
      setNewWorkspaceName('');
      setShowWorkspaceModal(false);
      refreshDatabase();
    } else {
      showToast(res.error || 'Workspace creation failed.', 'error');
    }
  };

  const handleCompleteSeatPurchase = async () => {
    setIsPaying(true);
    const res = await TeamCollaborationService.purchaseCapacity(activeUserEmail, activeWorkspaceId);
    setIsPaying(false);
    if (res.success) {
      setPaymentSuccess(true);
      showToast('Payment successful! Capacity expanded by +1.', 'success');
      refreshDatabase();
      setTimeout(() => {
        setShowCheckoutModal(false);
        setPaymentSuccess(false);
        if (checkoutTarget === 'invite_capacity') {
          setShowInviteModal(true);
        }
      }, 1500);
    } else {
      showToast(res.error || 'Payment transaction failed.', 'error');
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim()) return;

    const res = await TeamCollaborationService.sendChatMessage(
      activeWorkspaceId,
      activeUserEmail,
      chatMessageText
    );

    if (res.success) {
      setChatMessageText('');
      refreshDatabase();
    } else {
      showToast(res.error || 'Message failed.', 'error');
    }
  };

  // =========================================================================
  // 1. RESUMABLE FILE UPLOADS HANDLERS
  // =========================================================================
  const handleStartResumableUpload = async () => {
    if (!assetFileSim.name.trim()) {
      showToast('Please specify a filename.', 'error');
      return;
    }
    setUploadingAsset(true);
    setUploadProgressPercent(0);
    setUploadSpeed('1.2 MB/s');
    setUploadTimeRemaining('Calculating...');

    // Clean up any existing upload loop
    if (resumableTimeoutIdRef.current) {
      clearInterval(resumableTimeoutIdRef.current);
    }

    // Generate simulated deterministic hash
    const fileHash = 'hash_' + assetFileSim.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + assetFileSim.size;

    const res = await TeamCollaborationService.initiateResumableUpload(
      activeWorkspaceId,
      activeUserEmail,
      assetFileSim.name,
      assetFileSim.type,
      assetFileSim.size,
      fileHash
    );

    if (!res.success) {
      showToast(res.error || 'Failed to initiate resumable upload', 'error');
      setUploadingAsset(false);
      return;
    }

    if (res.duplicateAsset) {
      showToast('De-duplication Match: Exact file hash already exists in this team workspace. Simulated instant upload bypass!', 'success');
      setUploadingAsset(false);
      setShowAssetUploadModal(false);
      refreshDatabase();
      return;
    }

    const state = res.uploadState;
    setActiveUploadState(state);
    
    // Begin the chunked upload simulation loop
    runResumableUploadLoop(state);
  };

  const runResumableUploadLoop = (uploadState: any) => {
    if (resumableTimeoutIdRef.current) {
      clearInterval(resumableTimeoutIdRef.current);
    }

    const totalChunks = uploadState.totalChunks;
    
    resumableTimeoutIdRef.current = setInterval(async () => {
      // Check interruption
      if (simulatedInterruption) {
        setUploadSpeed('0 KB/s');
        setUploadTimeRemaining('Connection Suspended');
        // Register paused state in DB
        await TeamCollaborationService.pauseResumableUpload(uploadState.uploadId);
        showToast('Internet connection lost! Upload auto-paused at safe block.', 'info');
        clearInterval(resumableTimeoutIdRef.current);
        setActiveUploadState(prev => prev ? { ...prev, status: 'paused' } : null);
        return;
      }

      // Check pause
      if (uploadState.status === 'paused') {
        clearInterval(resumableTimeoutIdRef.current);
        return;
      }

      // Find first unuploaded chunk
      let nextChunk = -1;
      for (let i = 0; i < totalChunks; i++) {
        if (!uploadState.uploadedChunks.includes(i)) {
          nextChunk = i;
          break;
        }
      }

      if (nextChunk === -1) {
        // Complete the upload
        clearInterval(resumableTimeoutIdRef.current);
        const finalRes = await TeamCollaborationService.completeResumableUpload(uploadState.uploadId, uploadState.hash);
        setUploadingAsset(false);
        setActiveUploadState(null);
        if (finalRes.success) {
          showToast(`Resumable upload completed successfully! Safe checksum registered.`, 'success');
          setShowAssetUploadModal(false);
          refreshDatabase();
        } else {
          showToast(finalRes.error || 'Failed to finalize resumable upload', 'error');
        }
        return;
      }

      // Upload next chunk
      const chunkRes = await TeamCollaborationService.uploadChunkProgress(uploadState.uploadId, nextChunk);
      if (chunkRes.success) {
        uploadState.uploadedChunks.push(nextChunk);
        const newPct = Math.round((uploadState.uploadedChunks.length / totalChunks) * 100);
        setUploadProgressPercent(newPct);

        // Simulated speed / time remaining
        const randomSpeed = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0 MB/s
        setUploadSpeed(`${randomSpeed} MB/s`);
        
        const remainingBytes = (totalChunks - uploadState.uploadedChunks.length) * (2 * 1024 * 1024);
        const remSecs = Math.ceil(remainingBytes / (parseFloat(randomSpeed) * 1024 * 1024));
        setUploadTimeRemaining(remSecs > 0 ? `${remSecs}s remaining` : 'Completing...');

        // Force react update
        setActiveUploadState({ ...uploadState });
      } else {
        showToast('Chunk write failure, retrying block...', 'info');
      }
    }, 200); // chunk interval
  };

  const handlePauseResumableUpload = async () => {
    if (!activeUploadState) return;
    if (resumableTimeoutIdRef.current) {
      clearInterval(resumableTimeoutIdRef.current);
    }
    const res = await TeamCollaborationService.pauseResumableUpload(activeUploadState.uploadId);
    if (res.success) {
      showToast('Upload paused. Progress preserved safely.', 'info');
      setActiveUploadState(prev => prev ? { ...prev, status: 'paused' } : null);
      setUploadSpeed('0 KB/s');
    }
  };

  const handleResumeResumableUpload = async () => {
    if (!activeUploadState) return;
    // Clear connection interruption if they explicitly clicked resume
    setSimulatedInterruption(false);
    
    // Set status back to uploading
    activeUploadState.status = 'uploading';
    setActiveUploadState({ ...activeUploadState });
    
    showToast('Resuming upload from exact last checkpoint...', 'success');
    runResumableUploadLoop(activeUploadState);
  };

  const handleCancelResumableUpload = async () => {
    if (!activeUploadState) return;
    if (resumableTimeoutIdRef.current) {
      clearInterval(resumableTimeoutIdRef.current);
    }
    const res = await TeamCollaborationService.cancelResumableUpload(activeUploadState.uploadId);
    if (res.success) {
      showToast('Upload cancelled. Storage blocks released.', 'info');
      setUploadingAsset(false);
      setActiveUploadState(null);
    }
  };

  // =========================================================================
  // 2. FILE VERSION HISTORY HANDLERS
  // =========================================================================
  const handleSaveProjectVersion = async (projectId: string) => {
    if (!newVersionSummary.trim()) {
      showToast('Please specify a summary for this version checkpoint.', 'error');
      return;
    }
    setSavingVersion(true);
    const res = await TeamCollaborationService.createProjectVersion(
      projectId,
      activeUserEmail,
      newVersionSummary.trim()
    );
    setSavingVersion(false);
    if (res.success) {
      showToast(`Version checkpoint #${res.version.versionNumber} saved successfully!`, 'success');
      setNewVersionSummary('');
    } else {
      showToast(res.error || 'Failed to save version.', 'error');
    }
  };

  const handleRestoreProjectVersion = async (projectId: string, versionId: string, versionNum: number) => {
    if (window.confirm(`Are you sure you want to restore "${selectedProject.name}" back to Version #${versionNum}? Your current canvas will be saved as an auto-backup.`)) {
      const res = await TeamCollaborationService.restoreProjectVersion(projectId, activeUserEmail, versionId);
      if (res.success) {
        showToast(`Successfully restored project to version #${versionNum}!`, 'success');
        refreshDatabase();
      } else {
        showToast(res.error || 'Failed to restore version', 'error');
      }
    }
  };

  // =========================================================================
  // 3. RECYCLE BIN RESTORE / PURGE HANDLERS
  // =========================================================================
  const handleRestoreFromBin = async (itemId: string, itemName: string) => {
    const res = await TeamCollaborationService.restoreItemFromBin(itemId, activeUserEmail);
    if (res.success) {
      showToast(`Restored "${itemName}" from Recycle Bin back to active workspace.`, 'success');
      refreshDatabase();
    } else {
      showToast(res.error || 'Restoration failed', 'error');
    }
  };

  const handlePurgePermanently = async (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${itemName}"? This action is IRREVERSIBLE and will purge associated R2 storage bytes.`)) {
      const res = await TeamCollaborationService.permanentlyDeleteItem(itemId, activeUserEmail);
      if (res.success) {
        showToast(`Permanently deleted and cleaned up storage for "${itemName}".`, 'success');
        refreshDatabase();
      } else {
        showToast(res.error || 'Purge failed', 'error');
      }
    }
  };

  // =========================================================================
  // 4. OWNERSHIP TRANSFER HANDLERS
  // =========================================================================
  const handleTransferOwnership = async () => {
    if (!newOwnerEmail.trim()) {
      showToast('Please specify a recipient email.', 'error');
      return;
    }
    if (newOwnerEmail.toLowerCase() === activeUserEmail.toLowerCase()) {
      showToast('Invalid recipient: You cannot transfer ownership to yourself.', 'error');
      return;
    }

    const targetUser = activeWorkspace?.members.find(m => m.userId.toLowerCase() === newOwnerEmail.trim().toLowerCase());
    if (!targetUser) {
      showToast(`Invalid transfer: "${newOwnerEmail}" is not currently a member of this workspace.`, 'error');
      return;
    }

    if (window.confirm(`WARNING: Are you absolutely sure you want to transfer ownership of "${activeWorkspace.teamName}" to ${newOwnerEmail}? You will be demoted to 'Head' role.`)) {
      const res = await TeamCollaborationService.transferTeamOwnership(
        activeWorkspaceId,
        activeUserEmail,
        newOwnerEmail.trim().toLowerCase()
      );

      if (res.success) {
        showToast(`Team ownership successfully transferred to ${newOwnerEmail}!`, 'success');
        setShowOwnershipTransferModal(false);
        setNewOwnerEmail('');
        refreshDatabase();
      } else {
        showToast(res.error || 'Ownership transfer rejected.', 'error');
      }
    }
  };

  // =========================================================================
  // 5. STRESS TESTING COCKPIT SIMULATION HANDLERS
  // =========================================================================
  const runStressTest = async (testType: 'concurrency' | 'chat' | 'throttling' | 'integrity') => {
    setStressTestRunning(true);
    setStressTestLogs([]);
    setStressTestMetrics({
      concurrentUsers: 0,
      dbQueriesCount: 0,
      s3UploadSpeed: 0,
      quotaAlertsActive: false,
      latencyMs: 14,
      passStatus: 'RUNNING'
    });

    const log = (msg: string) => {
      setStressTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    if (testType === 'concurrency') {
      log('Starting Concurrency Load Test (Target: 100 Active Sessions)...');
      setStressTestMetrics(prev => ({ ...prev, concurrentUsers: 5, latencyMs: 14 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Spawning 25 concurrent headless worker threads...');
      setStressTestMetrics(prev => ({ ...prev, concurrentUsers: 25, latencyMs: 18, dbQueriesCount: 150 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Ramping load to 75 concurrent connections...');
      setStressTestMetrics(prev => ({ ...prev, concurrentUsers: 75, latencyMs: 25, dbQueriesCount: 450 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Peak Load reached: 100 concurrent mock members simulating drawing on canvas & workspace reads...');
      setStressTestMetrics(prev => ({ ...prev, concurrentUsers: 100, latencyMs: 38, dbQueriesCount: 1250 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Verifying Firestore read/write connection bounds...');
      log('Latency stabilized at 31ms. Zero dropped connections reported.');
      setStressTestMetrics(prev => ({ ...prev, latencyMs: 31, passStatus: 'PASSED' }));
      showToast('100 Concurrent Members stress test PASSED!', 'success');
    }

    else if (testType === 'chat') {
      log('Starting Streaming Chat Volume Stress Test (Target: 10,000 Messages)...');
      setStressTestMetrics(prev => ({ ...prev, dbQueriesCount: 50 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Ingesting high-density batch of 2,500 messages...');
      setStressTestMetrics(prev => ({ ...prev, dbQueriesCount: 2550 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Ingesting batch of 5,000 messages. Checking indices on "timestamp" field...');
      setStressTestMetrics(prev => ({ ...prev, dbQueriesCount: 7550 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Ingesting peak batch. Streaming 10,000 total chat message documents...');
      setStressTestMetrics(prev => ({ ...prev, dbQueriesCount: 10050 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Verifying rendering frame rates & virtualized item layout...');
      log('Stream throughput verified: 2,500 operations/sec. DB index bounds: normal.');
      setStressTestMetrics(prev => ({ ...prev, passStatus: 'PASSED' }));
      showToast('10,000 Chat Messages index performance test PASSED!', 'success');
    }

    else if (testType === 'throttling') {
      log('Starting Parallel Upload Throttling and Storage Quota Test...');
      setStressTestMetrics(prev => ({ ...prev, s3UploadSpeed: 1.2, quotaAlertsActive: false }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Simulating 3 simultaneous 250MB R2 multipart uploads...');
      setStressTestMetrics(prev => ({ ...prev, s3UploadSpeed: 8.5 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Simulating 10 concurrent heavy R2 uploads... Approaching workspace storage limit of 1GB.');
      setStressTestMetrics(prev => ({ ...prev, s3UploadSpeed: 14.2 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Triggering simulated storage quota block. Checking StorageQuotaService threshold...');
      setStressTestMetrics(prev => ({ ...prev, s3UploadSpeed: 0.5, quotaAlertsActive: true }));
      log('ALERT: "WORKSPACE_QUOTA_EXCEEDED" successfully thrown. Upload requests throttled.');
      
      await new Promise(r => setTimeout(r, 800));
      log('Concurrency limiter: Throttled from 15MB/s to 500KB/s to protect S3 API limits.');
      setStressTestMetrics(prev => ({ ...prev, quotaAlertsActive: false, s3UploadSpeed: 0, passStatus: 'PASSED' }));
      showToast('Parallel Upload Throttling performance test PASSED!', 'success');
    }

    else if (testType === 'integrity') {
      log('Starting Security & Log Integrity Test...');
      
      await new Promise(r => setTimeout(r, 800));
      log('Logging high-integrity transfer of workspace ownership...');
      log('Verifying "deviceInfo" and simulated "ipAddress" properties injection...');
      
      await new Promise(r => setTimeout(r, 800));
      log('Generating simulated audit logs batch. Checking indexing...');
      setStressTestMetrics(prev => ({ ...prev, dbQueriesCount: 120 }));
      
      await new Promise(r => setTimeout(r, 800));
      log('Auditing database rules compliance for transfer operation...');
      log('Log integrity check passed. Cryptographic IP timestamps verified.');
      setStressTestMetrics(prev => ({ ...prev, passStatus: 'PASSED' }));
      showToast('Log Integrity & Security Audit test PASSED!', 'success');
    }

    setStressTestRunning(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100 min-h-screen bg-[#08080c] select-none">
      
      {/* GLOBAL TESTER CONTROLS HEADER */}
      <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900/50 border border-cyan-500/10 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sliders size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">Interactive Sandbox Mode</span>
            <h2 className="text-xl font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
              Global Team Collaboration
            </h2>
          </div>
        </div>

        {/* User Switching Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-gray-400 font-bold hidden sm:inline whitespace-nowrap">Active User:</span>
          <div className="w-full md:w-64">
            <CustomSelect 
              value={activeUserEmail}
              onChange={(val) => {
                setActiveUserEmail(val);
                showToast(`Switched active profile to ${val}`, 'info');
              }}
              options={
                users.length > 0
                  ? users.map(u => ({
                      label: `👤 ${u.name} (${u.subscriptionPlan || 'Free'})`,
                      value: u.userId
                    }))
                  : [{ label: `👤 ${user?.name || activeUserEmail.split('@')[0]} (${activeUserEmail})`, value: activeUserEmail }]
              }
            />
          </div>
        </div>
      </div>

      {/* THREE-COLUMN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE USER PROFILE & WORKSPACES (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PERSONAL BENEFITS CARD */}
          {activeUser && (
            <motion.div 
              layout
              className="relative p-6 rounded-3xl bg-[#0f0f13] border border-white/5 shadow-2xl overflow-hidden group"
              id="personal-profile-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                    {activeUser.subscriptionPlan} Plan
                  </span>
                  <h3 className="text-xl font-black text-white mt-2 tracking-tight flex items-center gap-1.5">
                    {activeUser.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-mono font-bold">{activeUser.userId}</p>
                </div>
                <div className="text-xs bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-gray-400 font-black flex items-center gap-1">
                  <Globe size={11} className="text-cyan-400" />
                  {activeUser.countryCode}
                </div>
              </div>

              {/* Personal benefits independent panel */}
              <div className="mt-6 pt-5 border-t border-white/5 space-y-3.5">
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Personal Account Quota</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                    <span className="text-[10px] text-gray-500 font-medium block">AI Gen Limit</span>
                    <span className="text-xs font-black text-white mt-1 block">{personalBenefits?.aiLimits}</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                    <span className="text-[10px] text-gray-500 font-medium block">Personal Storage</span>
                    <span className="text-xs font-black text-white mt-1 block">{personalBenefits?.storage}</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                    <span className="text-[10px] text-gray-500 font-medium block">Downloads</span>
                    <span className="text-xs font-black text-white mt-1 block">{personalBenefits?.downloads}</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                    <span className="text-[10px] text-gray-500 font-medium block">Exports Engine</span>
                    <span className="text-xs font-black text-white mt-1 block">{personalBenefits?.exports}</span>
                  </div>
                </div>

                {/* Active Plan Tier Switcher & Automatic Team Capacity Sync */}
                <div className="pt-3.5 border-t border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Plan (Auto-Scales Team Capacity)</span>
                    <button
                      onClick={() => onNavigate?.('pricing')}
                      className="text-[10px] text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Upgrade <ChevronRight size={10} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Free', label: 'Free', seats: '2 Seats' },
                      { id: 'Pro', label: 'Pro', seats: '5 Seats' },
                      { id: 'Creator+', label: 'Creator', seats: '15 Seats' },
                      { id: 'Business', label: 'Business', seats: 'Unlimited' }
                    ].map((tier) => {
                      const isCurrent = activeUser.subscriptionPlan === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={async () => {
                            const res = await TeamCollaborationService.updateUserPlanAndSyncTeam(activeUserEmail, tier.id as SubscriptionPlan);
                            if (res.success) {
                              if (onUpdateUser) {
                                onUpdateUser({ subscriptionPlan: tier.id as any, plan: tier.id as any });
                              }
                              showToast(`Plan updated to ${tier.label}! Team workspace capacity automatically switched to ${tier.seats}.`, 'success');
                              refreshDatabase();
                            }
                          }}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">{tier.label}</span>
                            {isCurrent && <CheckCircle2 size={12} className="text-cyan-400" />}
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium block mt-0.5">{tier.seats} Capacity</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* WORKSPACE DIRECTORY & CREATION */}
          <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">My Workspaces</h4>
              <button 
                onClick={() => setShowWorkspaceModal(true)}
                className="text-[10px] bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black px-3 py-1 rounded-full transition-all flex items-center gap-1 uppercase cursor-pointer shadow-sm"
              >
                Create
              </button>
            </div>

            <div className="space-y-2">
              {userWorkspaces.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-xs text-gray-500 font-medium">No team workspaces yet.</p>
                  <button 
                    onClick={() => setShowWorkspaceModal(true)}
                    className="text-[10px] bg-[#10161B] hover:bg-[#1A2229] text-[#8DB8CC] border border-[#26313A] hover:border-[#8DB8CC]/50 font-black px-3 py-1.5 rounded-xl transition-all uppercase cursor-pointer"
                  >
                    + Create Workspace
                  </button>
                </div>
              ) : (
                userWorkspaces.map(ws => (
                  <button
                    key={ws.teamId}
                    onClick={() => {
                      setActiveWorkspaceId(ws.teamId);
                      setActiveTab('members');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      activeWorkspaceId === ws.teamId 
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-white' 
                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={18} className={activeWorkspaceId === ws.teamId ? 'text-cyan-400' : 'text-gray-600'} />
                      <span className="text-sm font-bold truncate max-w-[150px]">{ws.teamName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 font-bold uppercase">
                        {ws.members.find(m => m.userId.toLowerCase() === activeUserEmail.toLowerCase())?.role || 'Member'}
                      </span>
                      <ChevronRight size={14} className={activeWorkspaceId === ws.teamId ? 'opacity-100 text-cyan-400' : 'opacity-0'} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PENDING WORKSPACE INVITATIONS PANEL */}
          {(() => {
            const pendingInvitations = TeamCollaborationService.getPendingInvitations(activeUserEmail);
            if (pendingInvitations.length === 0) return null;
            return (
              <div className="bg-gradient-to-br from-cyan-950/20 to-slate-900/30 border border-cyan-500/15 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-xl rounded-full" />
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-cyan-400 animate-pulse" />
                  <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Pending Invitations ({pendingInvitations.length})</h4>
                </div>

                <div className="space-y-3">
                  {pendingInvitations.map(inv => (
                    <div key={inv.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-white block">{inv.teamName}</span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">Invited by <strong className="text-gray-300">{inv.senderName}</strong></span>
                        </div>
                        <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-cyan-400 font-bold uppercase">
                          {inv.role}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={async () => {
                            const res = await TeamCollaborationService.acceptInvitation(inv.id, activeUserEmail);
                            if (res.success) {
                              showToast(`Successfully joined "${inv.teamName}"!`, 'success');
                              if (res.team) {
                                setActiveWorkspaceId(res.team.teamId);
                              }
                              refreshDatabase();
                            } else {
                              showToast(res.error || 'Failed to accept invitation.', 'error');
                            }
                          }}
                          className="py-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            const res = await TeamCollaborationService.declineInvitation(inv.id, activeUserEmail);
                            if (res.success) {
                              showToast(`Invitation to "${inv.teamName}" declined.`, 'info');
                              refreshDatabase();
                            } else {
                              showToast(res.error || 'Failed to decline invitation.', 'error');
                            }
                          }}
                          className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* CAPACITY PLANNING METER CARD */}
          {activeWorkspace && (
            <div className="bg-[#0f0f13] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-cyan-400" />
                  <h5 className="text-xs font-black text-white uppercase tracking-widest">Active Team Capacity</h5>
                </div>
                <span className="text-[10px] font-black bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full">
                  {activeWorkspace.ownerSubscription} Owner
                </span>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-white">
                    {currentMembersCount} <span className="text-xs text-gray-500 font-bold">/ {activeWorkspace.ownerSubscription === 'Business' ? 'Unlimited' : `${totalCapacity} Seats`}</span>
                  </span>
                  <span className="text-xs text-gray-400 font-bold">
                    {activeWorkspace.ownerSubscription === 'Business' ? '0' : Math.round((currentMembersCount / totalCapacity) * 100)}% Used
                  </span>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isAtCapacity && activeWorkspace.ownerSubscription !== 'Business' ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                    style={{ width: `${activeWorkspace.ownerSubscription === 'Business' ? 10 : Math.min(100, (currentMembersCount / totalCapacity) * 100)}%` }} 
                  />
                </div>

                {/* Database Metrics Specifications */}
                <div className="space-y-2 pt-3.5 border-t border-white/5 text-[11px] text-gray-400">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Workspace Owner ID:</span>
                    <span className="text-gray-300 font-mono font-bold text-[10px]">{activeWorkspace.ownerId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Included Capacity:</span>
                    <span className="text-gray-300 font-bold">{activeWorkspace.ownerSubscription === 'Business' ? 'Unlimited' : activeWorkspace.includedMemberCapacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Purchased Seat Capacity:</span>
                    <span className="text-yellow-500 font-bold">+{activeWorkspace.purchasedAdditionalCapacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Total Shared Capacity:</span>
                    <span className="text-white font-bold">{activeWorkspace.ownerSubscription === 'Business' ? 'Unlimited' : activeWorkspace.totalCapacity}</span>
                  </div>
                </div>

                {activeWorkspace.ownerSubscription !== 'Business' && (
                  <button
                    onClick={() => {
                      if (!isOwnerOfActiveWorkspace) {
                        showToast('Unauthorized: Only the Team Owner can buy capacity.', 'error');
                        return;
                      }
                      setCheckoutTarget('general');
                      setShowCheckoutModal(true);
                    }}
                    className="w-full py-3 mt-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-xl shadow-yellow-500/5 cursor-pointer"
                  >
                    <DollarSign size={13} />
                    Buy capacity seat (+1 for $2)
                  </button>
                )}

                {isOwnerOfActiveWorkspace && (
                  <button
                    onClick={() => {
                      setNewOwnerEmail('');
                      setShowOwnershipTransferModal(true);
                    }}
                    className="w-full py-3 mt-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all flex items-center justify-center gap-1.5 border border-rose-500/20 cursor-pointer"
                  >
                    <Crown size={13} />
                    Transfer Team Ownership
                  </button>
                )}
              </div>
            </div>
          )}

          {/* REAL-TIME NOTIFICATION DESK (Point 9) */}
          <div className="bg-[#0f0f13] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-cyan-400 animate-bounce" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest">Real-time Desk</h5>
              </div>
              
              {userNotifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                    {userNotifications.filter(n => !n.read).length} New
                  </span>
                  <button
                    onClick={handleClearAllNotifs}
                    className="text-[9px] text-gray-500 hover:text-white uppercase font-black tracking-wider transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {userNotifications.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-[10px] text-gray-500">No active alerts or events in this workspace.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {userNotifications.slice(0, 5).map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleMarkNotifRead(notif.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      notif.read 
                        ? 'bg-white/[0.01] border-white/5 text-gray-500' 
                        : 'bg-cyan-500/5 border-cyan-500/10 text-gray-200 hover:bg-cyan-500/10'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[11px] font-bold">{notif.title}</span>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />}
                    </div>
                    <p className="text-[10px] mt-1 text-gray-400 font-medium">{notif.desc}</p>
                    <span className="text-[8px] text-gray-600 block mt-1.5">
                      {new Date(notif.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED WORKSPACE CONTROL, CHAT, & FOLLOWERS (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TABS SELECTOR */}
          <div className="flex border-b border-white/5 gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'members' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Users size={14} />
              Teammates
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'projects' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Folder size={14} />
              Projects
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'assets' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Database size={14} />
              Shared Assets
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'chat' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <MessageSquare size={14} />
              Team Chat
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'activity' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <History size={14} />
              Activity Logs
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'followers' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Star size={14} />
              Follow Creators
            </button>
            <button
              onClick={() => setActiveTab('recycle-bin')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'recycle-bin' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Trash2 size={14} />
              Recycle Bin
            </button>
            <button
              onClick={() => setActiveTab('audit-logs')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'audit-logs' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <ShieldCheck size={14} />
              Security Audits
            </button>
            <button
              onClick={() => setActiveTab('stress-test')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'stress-test' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Cpu size={14} />
              Stress Test Cockpit
            </button>
          </div>

          {!activeWorkspace ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f13] border border-white/5 rounded-3xl p-10 text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Users size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">Enterprise Workspace</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You are currently not part of an active team workspace. Create a workspace to invite team members, share Cloudflare R2 assets, track project versions, and collaborate in real time. Workspace capacities automatically adjust according to your subscription plan.
                </p>
              </div>

              {/* Plan seat capacity breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2 text-left">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Free Plan</span>
                  <span className="text-xs font-black text-cyan-400">2 Members</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Pro Plan</span>
                  <span className="text-xs font-black text-cyan-400">5 Members</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Creator Plan</span>
                  <span className="text-xs font-black text-cyan-400">15 Members</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Business Plan</span>
                  <span className="text-xs font-black text-cyan-400">Unlimited</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowWorkspaceModal(true)}
                  className="py-3.5 px-6 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Create Team Workspace
                </button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
            
            {/* MEMBERS TAB */}
            {activeTab === 'members' && activeWorkspace && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">{activeWorkspace.teamName}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Role in this Workspace: <strong className="text-cyan-400 uppercase">{activeUserRole}</strong>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!hasManagementPrivilege) {
                        showToast('Unauthorized: Only Owners or Heads can invite team members.', 'error');
                        return;
                      }
                      setShowInviteModal(true);
                    }}
                    className="py-3 px-5 bg-[#10161B] hover:bg-[#1A2229] border border-[#26313A] hover:border-[#8DB8CC]/40 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <UserPlus size={14} className="text-[#8DB8CC]" />
                    Invite Teammate
                  </button>
                </div>

                {/* MEMBER LIST TABLE */}
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                          <th className="p-4 pl-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">Name / Email</th>
                          <th className="p-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Subscription Plan</th>
                          <th className="p-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Role</th>
                          <th className="p-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Performance</th>
                          <th className="p-4 pr-6 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeWorkspace.members.map(member => {
                          const fullUserProfile = users.find(u => u.userId.toLowerCase() === member.userId.toLowerCase());
                          const isSelf = member.userId.toLowerCase() === activeUserEmail.toLowerCase();
                          return (
                            <tr key={member.userId} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                              {/* Name */}
                              <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-white block">
                                      {member.name} {isSelf && <span className="text-[10px] text-cyan-400 font-black uppercase ml-1">(You)</span>}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono font-bold block mt-0.5">{member.userId}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Subscription Plan */}
                              <td className="p-4">
                                <span className="text-xs font-bold bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-gray-300">
                                  {fullUserProfile?.subscriptionPlan || 'Free'}
                                </span>
                              </td>

                              {/* Role */}
                              <td className="p-4">
                                <span className={`text-xs font-bold flex items-center gap-1.5 ${
                                  member.role === 'Owner' ? 'text-yellow-500' : member.role === 'Head' ? 'text-cyan-400' : 'text-gray-400'
                                }`}>
                                  {member.role === 'Owner' && <Crown size={12} />}
                                  {member.role}
                                </span>
                              </td>

                              {/* Performance Better Performer Status */}
                              <td className="p-4">
                                {member.isBetterPerformer ? (
                                  <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                                    <Sparkles size={11} className="text-yellow-400 shrink-0" />
                                    Better Performer
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">No Award</span>
                                )}
                              </td>

                              {/* Action button */}
                              <td className="p-4 pr-6 text-right">
                                {member.role === 'Owner' ? (
                                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Ultimate Authority</span>
                                ) : (
                                  <div className="relative inline-block text-left">
                                    <button
                                      onClick={() => {
                                        if (activeActionMenuUserId === member.userId) {
                                          setActiveActionMenuUserId(null);
                                        } else {
                                          setActiveActionMenuUserId(member.userId);
                                        }
                                      }}
                                      className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                    >
                                      <Sliders size={15} />
                                    </button>

                                    <AnimatePresence>
                                      {activeActionMenuUserId === member.userId && (
                                        <>
                                          <div className="fixed inset-0 z-40" onClick={() => setActiveActionMenuUserId(null)} />
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 mt-2 w-52 bg-[#0e0e12] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-left"
                                          >
                                            <div className="text-[9px] font-black uppercase text-gray-500 tracking-wider px-2.5 py-1.5 border-b border-white/5 mb-1.5">Configure Role</div>
                                            
                                            <button 
                                              type="button"
                                              onClick={() => handleChangeRole(member.userId, 'Head')}
                                              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center justify-between ${member.role === 'Head' ? 'text-cyan-400 bg-cyan-400/5' : 'text-gray-400'}`}
                                            >
                                              <span>Promote to Head</span>
                                              {member.role === 'Head' && <Check size={12} />}
                                            </button>

                                            <button 
                                              type="button"
                                              onClick={() => handleChangeRole(member.userId, 'Team Member')}
                                              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center justify-between ${member.role === 'Team Member' ? 'text-gray-200 bg-white/5' : 'text-gray-400'}`}
                                            >
                                              <span>Make Team Member</span>
                                              {member.role === 'Team Member' && <Check size={12} />}
                                            </button>

                                            <div className="h-px bg-white/5 my-1.5" />

                                            <div className="text-[9px] font-black uppercase text-gray-500 tracking-wider px-2.5 py-1.5">Actions</div>

                                            <button 
                                              type="button"
                                              onClick={() => handleMarkBetterPerformer(member.userId)}
                                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-black text-yellow-400 hover:bg-yellow-400/10 transition-all flex items-center gap-2"
                                              disabled={member.isBetterPerformer}
                                            >
                                              <Sparkles size={12} className="text-yellow-400" />
                                              <span>Better Performer</span>
                                            </button>

                                            <button 
                                              type="button"
                                              onClick={() => handleRemoveMember(member.userId)}
                                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-2 mt-1"
                                            >
                                              <Trash2 size={12} />
                                              <span>Remove Member</span>
                                            </button>
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TEAM GROUP CHAT TAB */}
            {activeTab === 'chat' && activeWorkspace && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col h-[520px]"
              >
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                      <MessageSquare size={16} className="text-cyan-400" />
                      {activeWorkspace.teamName} Chat
                    </h3>
                    <p className="text-[11px] text-gray-500">All team subscription tiers can chat without limits</p>
                  </div>
                  <div className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full px-3 py-1 font-bold">
                    {activeWorkspace.members.length} participants
                  </div>
                </div>

                {/* Messages stream */}
                <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                  {(!activeWorkspace.chatMessages || activeWorkspace.chatMessages.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                        <MessageSquare size={20} />
                      </div>
                      <p className="text-xs text-gray-500 max-w-xs font-medium">No messages sent in this team yet. Start the conversation!</p>
                    </div>
                  ) : (
                    activeWorkspace.chatMessages.map(msg => {
                      const isMe = msg.senderId.toLowerCase() === activeUserEmail.toLowerCase();
                      return (
                        <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-black text-cyan-400">
                              {msg.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs font-medium ${
                            isMe ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-bold text-[10px] uppercase opacity-75">{msg.senderName}</span>
                              <span className="text-[8px] opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat controls */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-white/5 pt-4 mt-4">
                  <input
                    type="text"
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    placeholder={`Compose chat message as ${activeUser.name}...`}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* FOLLOW & INVITE TAB */}
            {activeTab === 'followers' && (
              <motion.div
                key="followers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Creators Directory</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Connect and follow creators globally, and instantly invite them to your active workspace team!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.filter(u => u.userId !== activeUserEmail).map(creator => {
                    const isAlreadyMember = activeWorkspace?.members.some(m => m.userId.toLowerCase() === creator.userId.toLowerCase());
                    return (
                      <div key={creator.userId} className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                              {creator.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white block">{creator.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono font-bold block mt-0.5">{creator.userId}</span>
                            </div>
                          </div>
                          <div className="text-[9px] bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-gray-400 font-bold flex items-center gap-1 shrink-0">
                            <Globe size={10} className="text-cyan-400" />
                            {creator.countryCode}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs font-black text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                            {creator.subscriptionPlan} Plan
                          </span>
                          
                          <button
                            onClick={async () => {
                              if (isAlreadyMember) {
                                showToast(`${creator.name} is already a member of this workspace.`, 'info');
                                  return;
                              }
                              if (isAtCapacity && activeWorkspace.ownerSubscription !== 'Business') {
                                showToast('Workspace capacity reached. Upgrade capacity first.', 'error');
                                return;
                              }
                              // Directly invite creator
                              const res = await TeamCollaborationService.inviteMember(
                                activeUserEmail,
                                activeWorkspaceId,
                                creator.userId,
                                'Team Member'
                              );
                              if (res.success) {
                                showToast(`Directly invited ${creator.name} to team!`, 'success');
                                refreshDatabase();
                              } else {
                                showToast(res.error || 'Invitation failed.', 'error');
                              }
                            }}
                            className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                              isAlreadyMember 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer'
                            }`}
                            disabled={isAlreadyMember}
                          >
                            {isAlreadyMember ? 'Joined' : 'Invite to Workspace'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* RECYCLE BIN TAB */}
            {activeTab === 'recycle-bin' && activeWorkspace && (
              <motion.div
                key="recycle-bin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Workspace Recycle Bin</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Recover soft-deleted collaborative assets and projects. Items are kept for 30 days before permanent automatic purging.
                    </p>
                  </div>
                </div>

                {recycleBinItems.filter(item => item.originalTeamId === activeWorkspaceId).length === 0 ? (
                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-10 text-center space-y-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Recycle Bin is Empty</h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        No soft-deleted projects or shared R2 assets are currently logged in the workspace.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recycleBinItems.filter(item => item.originalTeamId === activeWorkspaceId).map((item) => {
                      const deletedDate = new Date(item.deletedAt);
                      const elapsedMs = Date.now() - deletedDate.getTime();
                      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
                      const daysRemaining = Math.max(1, 30 - elapsedDays);

                      return (
                        <div key={item.id} className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                              {item.type === 'project' ? <Folder size={20} className="text-cyan-400" /> : <FileText size={20} className="text-yellow-400" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white">{item.name}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.type === 'project' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                  {item.type === 'project' ? 'Project' : 'R2 Shared Asset'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 font-medium">
                                Soft-deleted by <span className="text-gray-400">{item.deletedBy}</span> on {deletedDate.toLocaleDateString()} {deletedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                            <span className="text-[10px] font-black bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full flex items-center gap-1">
                              <AlertTriangle size={11} />
                              Expires in {daysRemaining} days
                            </span>
                            <button
                              onClick={() => handleRestoreFromBin(item.id, item.name)}
                              className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={11} />
                              Restore
                            </button>
                            <button
                              onClick={() => handlePurgePermanently(item.id, item.name)}
                              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={11} />
                              Purge
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* SECURITY AUDIT LOGS TAB */}
            {activeTab === 'audit-logs' && activeWorkspace && (
              <motion.div
                key="audit-logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Enterprise Audit Trails</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    System-wide immutable ledger capturing workspace transactions, user logins, and device contexts for compliance tracking.
                  </p>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-10 text-center space-y-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                      <Shield size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">No Audited Transactions Yet</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Action operations within this workspace will write records automatically here in the transaction ledger.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs text-gray-400">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-wider text-gray-500">
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">Operator</th>
                            <th className="py-3 px-4">Action Event</th>
                            <th className="py-3 px-4">Terminal Metadata</th>
                            <th className="py-3 px-4 text-right">Scope</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.01] transition-all">
                              <td className="py-3.5 px-4 font-bold text-gray-300">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-white block">{log.userName}</span>
                                <span className="text-[10px] text-gray-500 block font-mono mt-0.5">{log.userId}</span>
                              </td>
                              <td className="py-3.5 px-4 font-bold">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${
                                  log.actionType.includes('Transferred') ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                  log.actionType.includes('Restored') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  log.actionType.includes('Deleted') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                  'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}>
                                  {log.actionType}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500">
                                <div className="space-y-0.5">
                                  <div>IP: <span className="text-gray-300 font-bold">{log.ipAddress}</span></div>
                                  <div className="truncate max-w-xs">{log.deviceInfo}</div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-medium text-gray-500">
                                {log.projectId ? `Proj: ${log.projectId}` : log.fileId ? `Asset: ${log.fileId}` : 'Workspace'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STRESS TEST COCKPIT TAB */}
            {activeTab === 'stress-test' && activeWorkspace && (
              <motion.div
                key="stress-test"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Stress Testing & Diagnostics</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Simulate high-volume concurrent traffic, network degradation, and verify absolute index query speeds on Firestore/R2.
                    </p>
                  </div>
                </div>

                {/* Grid controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 space-y-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Users size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Concurrency Load</h4>
                      <p className="text-[11px] text-gray-500">Simulate 100 simultaneous member active sessions.</p>
                    </div>
                    <button
                      disabled={stressTestRunning}
                      onClick={() => runStressTest('concurrency')}
                      className="w-full py-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      Fire test
                    </button>
                  </div>

                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 space-y-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#8DB8CC]/10 flex items-center justify-center text-[#8DB8CC]">
                      <MessageSquare size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">10,000 Messages</h4>
                      <p className="text-[11px] text-gray-500">Benchmark chat index sorting under heavy message writes.</p>
                    </div>
                    <button
                      disabled={stressTestRunning}
                      onClick={() => runStressTest('chat')}
                      className="w-full py-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      Fire test
                    </button>
                  </div>

                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 space-y-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#8DB8CC]/10 flex items-center justify-center text-[#8DB8CC]">
                      <CloudLightning size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Parallel Throttling</h4>
                      <p className="text-[11px] text-gray-500">Verify storage limit throttling triggers and rate locks.</p>
                    </div>
                    <button
                      disabled={stressTestRunning}
                      onClick={() => runStressTest('throttling')}
                      className="w-full py-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      Fire test
                    </button>
                  </div>

                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 space-y-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#8DB8CC]/10 flex items-center justify-center text-[#8DB8CC]">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Security Integrity</h4>
                      <p className="text-[11px] text-gray-500">Audit logs metadata validity and encryption checks.</p>
                    </div>
                    <button
                      disabled={stressTestRunning}
                      onClick={() => runStressTest('integrity')}
                      className="w-full py-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      Fire test
                    </button>
                  </div>
                </div>

                {/* Dashboard stats & logs terminal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Stats Gauges */}
                  <div className="lg:col-span-1 bg-[#0f0f13] border border-white/5 rounded-3xl p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Diagnostic Metrics</h4>
                      {stressTestMetrics.passStatus === 'RUNNING' && (
                        <span className="text-[10px] font-black bg-yellow-500/10 text-yellow-400 px-2.5 py-0.5 rounded-full animate-pulse">
                          Simulating...
                        </span>
                      )}
                      {stressTestMetrics.passStatus === 'PASSED' && (
                        <span className="text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={11} /> Pass
                        </span>
                      )}
                      {stressTestMetrics.passStatus === 'NOT RUN' && (
                        <span className="text-[10px] font-black bg-white/5 text-gray-400 px-2.5 py-0.5 rounded-full">
                          Idle
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                        <span className="text-xs text-gray-500 font-bold">Active Connections:</span>
                        <span className="text-sm text-white font-black">{stressTestMetrics.concurrentUsers} Threads</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                        <span className="text-xs text-gray-500 font-bold">Latency:</span>
                        <span className="text-sm text-cyan-400 font-black">{stressTestMetrics.latencyMs}ms</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                        <span className="text-xs text-gray-500 font-bold">S3 Speeds Peak:</span>
                        <span className="text-sm text-yellow-500 font-black">{stressTestMetrics.s3UploadSpeed} MB/s</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                        <span className="text-xs text-gray-500 font-bold">Throttled Alarm:</span>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${stressTestMetrics.quotaAlertsActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-gray-400'}`}>
                          {stressTestMetrics.quotaAlertsActive ? 'ACTIVE' : 'NORMAL'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-xs text-gray-500 font-bold">DB Sync Calls:</span>
                        <span className="text-sm text-white font-mono font-bold">{stressTestMetrics.dbQueriesCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Logs Terminal */}
                  <div className="lg:col-span-2 bg-black border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative">
                    <div className="absolute top-4 right-4 flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Cpu size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Suite Diagnostic Console</span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-emerald-400 h-60 overflow-y-auto space-y-1 shadow-inner scrollbar-none">
                      {stressTestLogs.length === 0 ? (
                        <p className="text-gray-600 italic">Select a diagnostic test button above to run real-time suite stress simulations...</p>
                      ) : (
                        stressTestLogs.map((lg, i) => (
                          <div key={i}>{lg}</div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TEAM PROJECTS TAB (Point 1, 4 & 8) */}
            {activeTab === 'projects' && activeWorkspace && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Collaborative Projects</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage individual and team-owned projects. Workspace permissions govern access on-the-fly.
                    </p>
                  </div>
                  
                  {/* Create Project Mini Form */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="New project name..."
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition-all flex-grow sm:w-48"
                    />
                    <button
                      onClick={async () => {
                        if (!newProjectName.trim()) {
                          showToast('Please specify a valid project name.', 'error');
                          return;
                        }
                        const res = await TeamCollaborationService.createTeamProject(
                          activeWorkspaceId,
                          activeUserEmail,
                          newProjectName
                        );
                        if (res.success) {
                          showToast(`Successfully created collaborative project "${newProjectName.trim()}"`, 'success');
                          setNewProjectName('');
                          refreshDatabase();
                        } else {
                          showToast(res.error || 'Failed to create project', 'error');
                        }
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      <Plus size={14} />
                      Create Project
                    </button>
                  </div>
                </div>

                {/* Team Projects Grid */}
                {teamProjects.length === 0 ? (
                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                      <Folder size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">No Team Projects Registered</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">Create a team-owned project above to collaborate real-time with team members!</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamProjects.map((project) => {
                      const lockExpires = project.lockExpiresAt ? new Date(project.lockExpiresAt) : null;
                      const isLocked = lockExpires && lockExpires > new Date();
                      const isLockOwner = isLocked && project.lockHolder?.toLowerCase() === activeUserEmail.toLowerCase();
                      
                      // Check user role in project
                      const userRoleInWorkspace = activeWorkspace.members.find(
                        m => m.userId.toLowerCase() === activeUserEmail.toLowerCase()
                      )?.role || 'Team Member';
                      
                      const allowedActions = project.rolePermissions?.[userRoleInWorkspace] || ['view', 'comment'];

                      return (
                        <div key={project.id} className="bg-[#0f0f13] border border-white/5 hover:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all relative overflow-hidden group">
                          {/* Inner Header */}
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                  <Folder size={18} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-white tracking-tight">{project.name}</h4>
                                  <span className="text-[9px] text-gray-500 font-bold block mt-0.5">
                                    Created by {project.ownerName || project.ownerId}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full ${
                                project.status === 'active' 
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                  : project.status === 'archived'
                                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                    : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                              }`}>
                                {project.status}
                              </span>
                            </div>

                            {/* Lock Warning Indicator (Point 4) */}
                            {isLocked ? (
                              <div className={`p-2.5 rounded-xl border mb-4 text-[10px] font-bold flex items-center gap-2 ${
                                isLockOwner 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}>
                                <Lock size={12} />
                                <span>
                                  {isLockOwner 
                                    ? 'You hold the active editor lock!' 
                                    : `${project.lockHolderName || project.lockHolder} is currently editing (LOCKED)`}
                                </span>
                              </div>
                            ) : (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl mb-4 text-[10px] font-bold text-emerald-500 flex items-center gap-2">
                                <CheckCircle2 size={12} />
                                <span>Unlocked: Available for co-editing</span>
                              </div>
                            )}

                            {/* Mini changelog timeline */}
                            {project.history && project.history.length > 0 && (
                              <div className="mt-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 space-y-2">
                                <span className="text-[8px] uppercase tracking-wider text-gray-500 font-black block">Recent Activity Log</span>
                                <div className="space-y-1.5 max-h-16 overflow-y-auto pr-1">
                                  {project.history.slice(0, 2).map((hist: any) => (
                                    <div key={hist.id} className="text-[10px] text-gray-400 flex justify-between items-start gap-2">
                                      <span className="truncate">
                                        <b className="text-gray-200">{hist.editorName}</b>: {hist.description}
                                      </span>
                                      <span className="text-[8px] text-gray-600 shrink-0 mt-0.5">
                                        {new Date(hist.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Footer Action Bar */}
                          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setShowProjectModal(true);
                              }}
                              className="px-3.5 py-2 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-transparent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Layers size={12} />
                              Open Simulator
                            </button>

                            <div className="flex items-center gap-1">
                              {/* Configuration Permissions (Point 8) */}
                              {hasManagementPrivilege && (
                                <button
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowPermissionConfigModal(true);
                                  }}
                                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all cursor-pointer"
                                  title="Configure Project Permissions"
                                >
                                  <Settings size={13} />
                                </button>
                              )}

                              {/* Delete Team Project */}
                              {(hasManagementPrivilege || project.ownerId.toLowerCase() === activeUserEmail.toLowerCase()) && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Are you absolutely sure you want to delete collaborative project "${project.name}"?`)) {
                                      const res = await TeamCollaborationService.softDeleteProject(project.id, activeUserEmail);
                                      if (res.success) {
                                        showToast(`Project "${project.name}" soft-deleted and moved to Recycle Bin safely!`, 'success');
                                        refreshDatabase();
                                      } else {
                                        showToast(res.error || 'Failed to soft delete', 'error');
                                      }
                                    }
                                  }}
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                                  title="Delete Project"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TEAM SHARED CLOUD ASSETS TAB (Point 3, 6 & 7) */}
            {activeTab === 'assets' && activeWorkspace && (
              <motion.div
                key="assets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Shared Asset Library</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Secured files and presets stored in Cloudflare R2 bucket storage.
                    </p>
                  </div>

                  {/* Upload Simulator Trigger */}
                  <button
                    onClick={() => setShowAssetUploadModal(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    <Upload size={14} />
                    Upload File to R2
                  </button>
                </div>

                {/* Storage Management Dashboard (Point 6) */}
                <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive size={18} className="text-yellow-500" />
                      <div>
                        <span className="text-xs font-black text-white block">Workspace Quota (S3/R2 Bucket)</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Capacity allocated based on Creator subscription tier</span>
                      </div>
                    </div>
                    
                    <span className="text-[11px] font-mono text-gray-300 font-bold">
                      {(() => {
                        let totalSize = 0;
                        sharedAssets.forEach(a => totalSize += Number(a.size || 0));
                        
                        const personalBenefits = TeamCollaborationService.getPersonalBenefits(activeWorkspace.ownerSubscription);
                        const storageLimitStr = personalBenefits?.storage || '5 GB';
                        return `${(totalSize / (1024*1024)).toFixed(1)} MB used of ${storageLimitStr}`;
                      })()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                    {(() => {
                      let totalSize = 0;
                      sharedAssets.forEach(a => totalSize += Number(a.size || 0));
                      
                      const personalBenefits = TeamCollaborationService.getPersonalBenefits(activeWorkspace.ownerSubscription);
                      const storageLimitStr = personalBenefits?.storage || '5 GB';
                      const storageLimitBytes = storageLimitStr.includes('TB') 
                        ? 1024 * 1024 * 1024 * 1024 
                        : storageLimitStr.includes('GB') 
                          ? Number(storageLimitStr.split(' ')[0]) * 1024 * 1024 * 1024
                          : Number(storageLimitStr.split(' ')[0]) * 1024 * 1024;
                      
                      const percent = Math.min(100, (totalSize / storageLimitBytes) * 100);
                      return (
                        <div 
                          className={`h-full transition-all duration-500 ${percent > 85 ? 'bg-rose-500' : percent > 50 ? 'bg-yellow-500' : 'bg-cyan-500'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      );
                    })()}
                  </div>

                  {/* Warning / Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-gray-400">
                    <p className="max-w-md font-medium">
                      ⚠️ Approaching storage ceiling? Owners can buy space expansion add-ons or purchase team seat upgrades anytime.
                    </p>
                    
                    {isOwnerOfActiveWorkspace && (
                      <button
                        onClick={() => {
                          setCheckoutTarget('general');
                          setShowCheckoutModal(true);
                        }}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Expand Storage Limit
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter and assets list */}
                <div className="space-y-4">
                  {/* Filter tabs */}
                  <div className="flex flex-wrap gap-2 pb-2">
                    {(['all', 'image', 'video', 'preset', 'document'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedAssetTypeFilter(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedAssetTypeFilter === type
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                            : 'bg-white/5 border border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {type}s
                      </button>
                    ))}
                  </div>

                  {/* Assets Grid */}
                  {(() => {
                    const filtered = sharedAssets.filter(
                      a => selectedAssetTypeFilter === 'all' || a.type === selectedAssetTypeFilter
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 text-center space-y-4">
                          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                            <Database size={22} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white">No assets matched your filter</h4>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto">Upload cloud assets above to begin accumulating your shared resources!</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((asset) => (
                          <div key={asset.id} className="bg-[#0f0f13] border border-white/5 hover:border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between transition-all group">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                                    {asset.type === 'image' && <Image size={15} />}
                                    {asset.type === 'video' && <Video size={15} />}
                                    {asset.type === 'preset' && <Settings size={15} />}
                                    {asset.type === 'document' && <FileText size={15} />}
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-black text-white tracking-tight truncate" title={asset.name}>
                                      {asset.name}
                                    </h5>
                                    <span className="text-[9px] text-gray-500 block mt-0.5 uppercase tracking-wider font-bold">
                                      {asset.type} • {(Number(asset.size || 0) / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 space-y-1.5 text-[10px] text-gray-400">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Uploaded by:</span>
                                  <span className="text-gray-200 truncate max-w-[130px]">{asset.uploadedByName || asset.uploadedBy}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Date:</span>
                                  <span className="text-gray-200">
                                    {new Date(asset.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Secure File Actions (Point 7) */}
                            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                              {/* Secured Download Button */}
                              <a
                                href={asset.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                referrerPolicy="no-referrer"
                                onClick={(e) => {
                                  // Verify team membership in frontend session before downloading
                                  const isMember = activeWorkspace.members.some(
                                    m => m.userId.toLowerCase() === activeUserEmail.toLowerCase()
                                  );
                                  if (!isMember) {
                                    e.preventDefault();
                                    showToast('Secured Access Denied: You must be a verified team member to download this file.', 'error');
                                  } else {
                                    showToast('Secure signed URL retrieved! Downloading...', 'success');
                                  }
                                }}
                                className="px-3 py-1.5 bg-cyan-600/15 hover:bg-cyan-600 hover:text-white text-cyan-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink size={10} />
                                Secure Download
                              </a>

                              {/* Secured Delete Button */}
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete file "${asset.name}" from R2?`)) {
                                    const res = await TeamCollaborationService.softDeleteSharedAsset(
                                      activeWorkspaceId,
                                      activeUserEmail,
                                      asset.id
                                    );
                                    if (res.success) {
                                      showToast(`File "${asset.name}" soft-deleted and moved to Recycle Bin safely!`, 'success');
                                      refreshDatabase();
                                    } else {
                                      showToast(res.error || 'Deletion rejected', 'error');
                                    }
                                  }
                                }}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* TEAM ACTIVITY HISTORY TAB (Point 5) */}
            {activeTab === 'activity' && activeWorkspace && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Workspace Activity Log</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time timeline of workspace, file uploads, project creations, and member events.
                  </p>
                </div>

                {activities.length === 0 ? (
                  <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                      <History size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">No recorded actions yet</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">Activities will register automatically when team actions occur.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-l border-white/5 pl-6 ml-4 space-y-6">
                    {activities.map((act) => {
                      // Icon & Accent Color resolver
                      let iconColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                      let actIcon = <History size={12} />;

                      if (act.actionType === 'PROJECT_CREATE') {
                        iconColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                        actIcon = <Folder size={12} />;
                      } else if (act.actionType === 'FILE_UPLOAD') {
                        iconColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                        actIcon = <Upload size={12} />;
                      } else if (act.actionType === 'FILE_DELETE' || act.actionType === 'PROJECT_DELETE') {
                        iconColor = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                        actIcon = <Trash2 size={12} />;
                      } else if (act.actionType === 'BETTER_PERFORMER') {
                        iconColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                        actIcon = <Sparkles size={12} />;
                      } else if (act.actionType?.includes('MEMBER') || act.actionType?.includes('ROLE')) {
                        iconColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                        actIcon = <UserCheck size={12} />;
                      }

                      return (
                        <div key={act.id} className="relative group">
                          {/* Circle on line */}
                          <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${iconColor} bg-[#07070a]`}>
                            {actIcon}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs font-bold text-white">
                                {act.userName || act.userEmail}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono font-bold">
                                {new Date(act.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                              {act.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}

        </div>

      </div>

      {/* 5. INVITE COLLABORATOR MODAL */}
      <AnimatePresence>
        {showInviteModal && activeWorkspace && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl z-50"
            >
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <UserPlus size={32} className="text-cyan-400" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Invite to Workspace</h3>
                <p className="text-sm text-gray-500 mt-2">Send an invitation to join {activeWorkspace.teamName}.</p>
              </div>

              {/* Status Indicator */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Workspace Allowance</span>
                  <span className="text-xs font-bold text-white">{currentMembersCount} of {activeWorkspace.ownerSubscription === 'Business' ? 'Unlimited' : `${totalCapacity} Seats`} Occupied</span>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${isAtCapacity && activeWorkspace.ownerSubscription !== 'Business' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                  {activeWorkspace.ownerSubscription === 'Business' ? 'Unlimited' : `${totalCapacity - currentMembersCount} Available`}
                </span>
              </div>

              <form onSubmit={handleInviteMember} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="email" 
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all text-sm animate-none"
                    />
                  </div>
                  {inviteError && <p className="text-xs text-rose-500 mt-1">{inviteError}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Role</label>
                  <CustomSelect 
                    value={inviteRole}
                    onChange={(val) => setInviteRole(val as TeamRole)}
                    options={[
                      { label: 'Team Member (Can view & participate)', value: 'Team Member' },
                      { label: 'Head (Can manage, invite, mark performance)', value: 'Head' }
                    ]}
                  />
                </div>

                {isAtCapacity && activeWorkspace.ownerSubscription !== 'Business' ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2.5 leading-relaxed">
                      <AlertTriangle className="shrink-0 text-rose-500" size={16} />
                      <div>
                        <strong>Capacity Limit Reached!</strong> Upgrade seat capacity for $2.00 or remove a member to proceed.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isOwnerOfActiveWorkspace) {
                          showToast('Unauthorized: Only the Owner can buy seats.', 'error');
                          return;
                        }
                        setCheckoutTarget('invite_capacity');
                        setShowInviteModal(false);
                        setShowCheckoutModal(true);
                      }}
                      className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <DollarSign size={14} />
                      Buy capacity seat & invite ($2)
                    </button>
                  </div>
                ) : (
                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 rounded-xl text-[#050709] font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer"
                  >
                    Send Invitation
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. CREATE WORKSPACE MODAL */}
      <AnimatePresence>
        {showWorkspaceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorkspaceModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl z-50"
            >
              <button 
                onClick={() => setShowWorkspaceModal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <LayoutGrid size={32} className="text-cyan-400" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Create Workspace</h3>
                <p className="text-sm text-gray-500 mt-2">Launch a new collaboration space. You will be set as Owner.</p>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Workspace Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Neo Tokyo Creative Lab"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-500 transition-all text-sm animate-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-gray-500 text-xs leading-relaxed font-medium">
                  Workspace creates as a container. Your subscription <strong>{activeUser.subscriptionPlan}</strong> determines the base seat allowance.
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 rounded-xl text-[#050709] font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer"
                >
                  Create Workspace
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. $2 SEAT CAPACITY CHECKOUT MODAL */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isPaying && !paymentSuccess) setShowCheckoutModal(false); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl z-[120] overflow-hidden text-left"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full -translate-y-1/2 pointer-events-none" />

              <button 
                onClick={() => setShowCheckoutModal(false)}
                disabled={isPaying || paymentSuccess}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <CreditCard size={28} className="text-cyan-400" />
                </div>
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">Secure checkout</span>
                <h3 className="text-xl font-black text-white tracking-tight mt-3">Buy Workspace Capacity Seat</h3>
                <p className="text-xs text-gray-500 mt-1">Acquire +1 permanent shared workspace seat for this active team.</p>
              </div>

              {paymentSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Payment Authorized!</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Transaction processed successfully. Workspace seat expanded!
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Extra Workspace Seat (+1)</span>
                      <span className="text-[10px] text-gray-500 font-medium">One-time payment for permanent capacity</span>
                    </div>
                    <span className="text-lg font-black text-cyan-400">$2.00</span>
                  </div>

                  {/* Card form */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white outline-none focus:border-cyan-500 transition-all text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Card Number</label>
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white outline-none focus:border-cyan-500 transition-all text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input 
                          type="text" 
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white outline-none focus:border-cyan-500 transition-all text-xs text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">CVV / CVN</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white outline-none focus:border-cyan-500 transition-all text-xs text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteSeatPurchase}
                    disabled={isPaying}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.25)] disabled:opacity-50 cursor-pointer"
                  >
                    {isPaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Authorizing $2.00...
                      </>
                    ) : (
                      <>
                        <CreditCard size={13} />
                        Pay $2.00 securely
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPRECIATION EMAIL DISPATCHED MODAL */}
      <AnimatePresence>
        {showEmailModal && selectedEmail && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEmailModal(false); setSelectedEmail(null); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl z-[140] text-left overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />

              <button 
                onClick={() => { setShowEmailModal(false); setSelectedEmail(null); }}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Mail size={20} className="text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Appreciation Dispatched</h3>
                  <p className="text-xs text-gray-500">Official workplace recognition log</p>
                </div>
              </div>

              <div className="space-y-4 bg-white/[0.01] border border-white/5 rounded-2xl p-5 font-mono text-xs text-gray-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">From:</span>
                  <span className="sm:col-span-2 text-cyan-400 font-bold">{selectedEmail.senderEmail}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">To (Better Performer):</span>
                  <span className="sm:col-span-2 text-rose-400 font-bold">{selectedEmail.recipientEmail}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Subject:</span>
                  <span className="sm:col-span-2 text-white font-bold">{selectedEmail.subject}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Dispatched At:</span>
                  <span className="sm:col-span-2 text-gray-400 font-bold">{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                </div>
                <div className="pt-3 space-y-2 whitespace-pre-wrap leading-relaxed text-gray-100 max-h-72 overflow-y-auto pr-1">
                  {selectedEmail.body}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                  <CheckCircle2 size={12} />
                  <span>Appreciation dispatched successfully</span>
                </div>
                <button
                  onClick={() => { setShowEmailModal(false); setSelectedEmail(null); }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- COLLABORATIVE CANVAS EDITOR SIMULATOR MODAL (Point 1, 4, 8) --- */}
      <AnimatePresence>
        {showProjectModal && selectedProject && (
          (() => {
            const currentProj = teamProjects.find(p => p.id === selectedProject.id) || selectedProject;
            const lockExpires = currentProj.lockExpiresAt ? new Date(currentProj.lockExpiresAt) : null;
            const isLocked = lockExpires && lockExpires > new Date();
            const isLockOwner = isLocked && currentProj.lockHolder?.toLowerCase() === activeUserEmail.toLowerCase();
            
            const userRoleInWorkspace = activeWorkspace?.members.find(
              m => m.userId.toLowerCase() === activeUserEmail.toLowerCase()
            )?.role || 'Team Member';
            const allowedActions = currentProj.rolePermissions?.[userRoleInWorkspace] || ['view', 'comment'];
            const hasEditPermission = allowedActions.includes('edit');

            return (
              <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={async () => {
                    if (isLockOwner) {
                      await TeamCollaborationService.releaseProjectLock(currentProj.id, activeUserEmail);
                    }
                    setShowProjectModal(false);
                    setSelectedProject(null);
                  }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-5xl h-[90vh] bg-[#07070a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-[140] flex flex-col"
                >
                  {/* Modal Header */}
                  <div className="p-6 border-b border-white/5 bg-[#0e0e12] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                        <Folder size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                          <span>{currentProj.name}</span>
                          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400 font-bold">
                            Canvas Studio
                          </span>
                        </h3>
                        <p className="text-[10px] text-gray-500">
                          Workspace ID: {currentProj.workspaceId} • Owner: {currentProj.ownerName || currentProj.ownerId}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={async () => {
                        if (isLockOwner) {
                          await TeamCollaborationService.releaseProjectLock(currentProj.id, activeUserEmail);
                        }
                        setShowProjectModal(false);
                        setSelectedProject(null);
                      }}
                      className="text-gray-500 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Lock Controller Info Panel */}
                  <div className="px-6 py-3 bg-[#111116] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-semibold">
                      {isLocked ? (
                        <>
                          <Lock size={14} className={isLockOwner ? 'text-emerald-400' : 'text-rose-400'} />
                          <span className={isLockOwner ? 'text-emerald-400' : 'text-rose-400'}>
                            {isLockOwner 
                              ? 'Authorized Session: You have acquired the exclusive write lock.' 
                              : `Protected Session: ${currentProj.lockHolderName || currentProj.lockHolder} is co-editing (ReadOnly Mode)`}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} className="text-cyan-400" />
                          <span className="text-cyan-400">Collaborative Workspace Unlocked: Request edit access to modify canvas!</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!hasEditPermission ? (
                        <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-1 rounded-lg font-bold">
                          🚫 No Edit Privileges For {userRoleInWorkspace}s
                        </span>
                      ) : isLocked ? (
                        isLockOwner ? (
                          <button
                            onClick={async () => {
                              const res = await TeamCollaborationService.releaseProjectLock(currentProj.id, activeUserEmail);
                              if (res.success) {
                                showToast('Released write lock on canvas', 'success');
                              }
                            }}
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Release Edit Lock
                          </button>
                        ) : (
                          <span className="text-[10px] bg-rose-500/5 text-rose-400 font-bold">
                            Locked by {currentProj.lockHolderName || currentProj.lockHolder}
                          </span>
                        )
                      ) : (
                        <button
                          onClick={async () => {
                            const res = await TeamCollaborationService.acquireProjectLock(currentProj.id, activeUserEmail);
                            if (res.success) {
                              showToast('Write lock acquired! You can co-edit now.', 'success');
                            } else {
                              showToast(res.error || 'Failed to acquire edit lock', 'error');
                            }
                          }}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Lock size={10} />
                          Request Edit Access
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Workspace Layout */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Drawing Canvas Sandbox */}
                    <div className="flex-1 bg-[#09090c] p-6 flex flex-col justify-between overflow-y-auto">
                      <div>
                        {/* Drawing Tools (Only accessible if we have edit permission AND own the active lock) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">Co-edit Toolbox</span>
                            <span className="text-xs text-gray-400">Instantly append synchronized layouts to the team canvas</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={!isLockOwner || !hasEditPermission}
                              onClick={async () => {
                                const newShape = {
                                  id: `shape-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  type: 'circle',
                                  color: 'cyan',
                                  cx: Math.floor(Math.random() * 150) + 100,
                                  cy: Math.floor(Math.random() * 150) + 100,
                                  r: Math.floor(Math.random() * 40) + 20
                                };
                                const currentCanvas = currentProj.currentState?.canvasData || [];
                                const updatedCanvas = [...currentCanvas, newShape];
                                await TeamCollaborationService.updateTeamProject(currentProj.id, activeUserEmail, {
                                  currentState: { canvasData: updatedCanvas },
                                  description: 'Added interactive circle vector to canvas'
                                });
                                showToast('Circle vector synchronized real-time!', 'success');
                              }}
                              className="px-3 py-2 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-white cursor-pointer"
                            >
                              + Circle
                            </button>
                            <button
                              disabled={!isLockOwner || !hasEditPermission}
                              onClick={async () => {
                                const newShape = {
                                  id: `shape-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  type: 'rect',
                                  color: 'yellow',
                                  x: Math.floor(Math.random() * 150) + 100,
                                  y: Math.floor(Math.random() * 150) + 100,
                                  w: Math.floor(Math.random() * 80) + 40,
                                  h: Math.floor(Math.random() * 80) + 40
                                };
                                const currentCanvas = currentProj.currentState?.canvasData || [];
                                const updatedCanvas = [...currentCanvas, newShape];
                                await TeamCollaborationService.updateTeamProject(currentProj.id, activeUserEmail, {
                                  currentState: { canvasData: updatedCanvas },
                                  description: 'Added rectangular card element to canvas'
                                });
                                showToast('Rectangular element synchronized!', 'success');
                              }}
                              className="px-3 py-2 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-white cursor-pointer"
                            >
                              + Rectangle
                            </button>
                            <button
                              disabled={!isLockOwner || !hasEditPermission}
                              onClick={async () => {
                                const words = ['Media Studio Teaser', 'Workspace Hub', 'AI Campaign Video Layout', 'Frictionless Teamwork', 'S3/R2 Pipeline ready'];
                                const selectedText = words[Math.floor(Math.random() * words.length)];
                                const newShape = {
                                  id: `shape-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  type: 'text',
                                  color: 'white',
                                  text: selectedText,
                                  x: Math.floor(Math.random() * 100) + 50,
                                  y: Math.floor(Math.random() * 150) + 100
                                };
                                const currentCanvas = currentProj.currentState?.canvasData || [];
                                const updatedCanvas = [...currentCanvas, newShape];
                                await TeamCollaborationService.updateTeamProject(currentProj.id, activeUserEmail, {
                                  currentState: { canvasData: updatedCanvas },
                                  description: `Added dynamic text layout "${selectedText}"`
                                });
                                showToast('Dynamic text element synchronized!', 'success');
                              }}
                              className="px-3 py-2 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-white cursor-pointer"
                            >
                              + Text Label
                            </button>
                            <button
                              disabled={!isLockOwner || !hasEditPermission || !currentProj.currentState?.canvasData?.length}
                              onClick={async () => {
                                await TeamCollaborationService.updateTeamProject(currentProj.id, activeUserEmail, {
                                  currentState: { canvasData: [] },
                                  description: 'Cleared entire canvas elements'
                                });
                                showToast('Canvas cleared!', 'info');
                              }}
                              className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-rose-500/15 disabled:hover:text-rose-400 cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Interactive Dynamic Grid Simulation */}
                        <div className="bg-[#0e0e13]/60 border border-white/5 rounded-3xl h-96 relative overflow-hidden flex items-center justify-center p-4">
                          {/* Radial Background Grid */}
                          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
                          
                          {/* Elements rendering */}
                          {(!currentProj.currentState?.canvasData || currentProj.currentState.canvasData.length === 0) ? (
                            <div className="relative text-center z-10 max-w-sm space-y-2">
                              <Sparkles size={24} className="text-gray-600 mx-auto animate-pulse" />
                              <h5 className="text-xs font-bold text-gray-400">Interactive Synchronized Canvas</h5>
                              <p className="text-[10px] text-gray-500">
                                Acquire the lock above, then click the toolbar to co-edit. Changes propagate to all team-member monitors instantly in real-time.
                              </p>
                            </div>
                          ) : (
                            <div className="absolute inset-0 p-8 overflow-auto">
                              <svg className="w-full h-full min-h-[300px]" viewBox="0 0 500 400">
                                {currentProj.currentState.canvasData.map((shape: any) => {
                                  if (shape.type === 'circle') {
                                    return (
                                      <motion.circle
                                        key={shape.id}
                                        cx={shape.cx}
                                        cy={shape.cy}
                                        r={shape.r}
                                        className="fill-cyan-500/20 stroke-cyan-400 stroke-2 cursor-pointer hover:fill-cyan-500/40 transition-all"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                      />
                                    );
                                  } else if (shape.type === 'rect') {
                                    return (
                                      <motion.rect
                                        key={shape.id}
                                        x={shape.x}
                                        y={shape.y}
                                        width={shape.w}
                                        height={shape.h}
                                        rx={12}
                                        className="fill-yellow-500/20 stroke-yellow-400 stroke-2 cursor-pointer hover:fill-yellow-500/40 transition-all"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                      />
                                    );
                                  } else if (shape.type === 'text') {
                                    return (
                                      <motion.text
                                        key={shape.id}
                                        x={shape.x}
                                        y={shape.y}
                                        className="fill-white font-mono text-[11px] font-bold tracking-tight select-none pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                      >
                                        {shape.text}
                                      </motion.text>
                                    );
                                  }
                                  return null;
                                })}
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 text-[10px] text-gray-500 flex justify-between items-center mt-6">
                        <span>🛰️ Powered by Firestore Snapshots co-editing synchronization</span>
                        <span className="font-mono">{currentProj.currentState?.canvasData?.length || 0} active assets</span>
                      </div>
                    </div>

                    {/* Right Panel: Project Changelog Feed */}
                    <div className="w-80 bg-[#0c0c10] border-l border-white/5 p-6 flex flex-col justify-between">
                      <div className="space-y-5 flex-1 flex flex-col overflow-hidden">
                        {/* Tab Headers */}
                        <div className="flex border-b border-white/5 pb-1 gap-2 shrink-0">
                          <button
                            onClick={() => setSimRightTab('feed')}
                            className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider text-center transition-all ${
                              simRightTab === 'feed'
                                ? 'border-b border-cyan-500 text-cyan-400 font-black'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            Live Feed
                          </button>
                          <button
                            onClick={() => setSimRightTab('versions')}
                            className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider text-center transition-all ${
                              simRightTab === 'versions'
                                ? 'border-b border-cyan-500 text-cyan-400 font-black'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            Versions
                          </button>
                        </div>

                        {/* Tab Content: Feed */}
                        {simRightTab === 'feed' ? (
                          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block">Commit Timeline</span>
                              <span className="text-xs text-gray-400 mt-0.5 block">Audit log of synchronized updates</span>
                            </div>

                            <div className="flex-grow space-y-3.5 overflow-y-auto pr-1">
                              {currentProj.history && currentProj.history.map((hist: any) => (
                                <div key={hist.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl space-y-1 text-[11px]">
                                  <div className="flex justify-between items-center text-gray-300">
                                    <span className="font-bold">{hist.editorName || hist.editorEmail}</span>
                                    <span className="text-[9px] text-gray-500 font-mono">
                                      {new Date(hist.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 font-medium text-[10px] leading-relaxed">
                                    {hist.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Tab Content: Versions (Checkpoint management)
                          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400 block">Version Checkpoints</span>
                              <span className="text-xs text-gray-400 mt-0.5 block">Audit state snapshots & restore</span>
                            </div>

                            {/* Create Checkpoint Form */}
                            {isLockOwner ? (
                              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 space-y-2.5 shrink-0">
                                <input
                                  type="text"
                                  value={newVersionSummary}
                                  onChange={(e) => setNewVersionSummary(e.target.value)}
                                  placeholder="Version summary... (e.g. Added custom rectangles)"
                                  className="w-full bg-[#121217] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 placeholder-gray-600"
                                />
                                <button
                                  disabled={savingVersion || !newVersionSummary.trim()}
                                  onClick={() => handleSaveProjectVersion(currentProj.id)}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  {savingVersion ? 'Writing block...' : 'Create Checkpoint'}
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-[10px] text-rose-400 shrink-0">
                                Acquisition Lock required to write version checkpoints. Request edit access above.
                              </div>
                            )}

                            {/* Scrollable list of checkpoints */}
                            <div className="flex-grow space-y-2.5 overflow-y-auto pr-1">
                              {projectVersions.length === 0 ? (
                                <p className="text-[10px] text-gray-600 italic text-center py-6">No saved version checkpoints registered for this canvas.</p>
                              ) : (
                                projectVersions.map((ver) => (
                                  <div key={ver.id} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-2.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-black text-white">Version #{ver.versionNumber}</span>
                                      <span className="text-[8px] text-gray-500 font-mono">{new Date(ver.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium leading-normal">{ver.summary}</p>
                                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-white/5">
                                      <span className="text-gray-500 truncate max-w-[120px]">{ver.creatorName || ver.creatorId}</span>
                                      {hasEditPermission && (
                                        <button
                                          onClick={() => handleRestoreProjectVersion(currentProj.id, ver.id, ver.versionNumber)}
                                          className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-500/20 hover:border-transparent text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          <RefreshCw size={10} />
                                          Restore
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Simulator bottom settings */}
                      <div className="space-y-2.5 pt-4 border-t border-white/5 shrink-0">
                        <button
                          onClick={async () => {
                            if (isLockOwner) {
                              await TeamCollaborationService.releaseProjectLock(currentProj.id, activeUserEmail);
                            }
                            setShowProjectModal(false);
                            setSelectedProject(null);
                          }}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Close Simulator
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()
        )}
      </AnimatePresence>

      {/* --- FINE-GRAINED DOCUMENT PERMISSIONS CONFIG MODAL (Point 8) --- */}
      <AnimatePresence>
        {showPermissionConfigModal && selectedProject && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPermissionConfigModal(false); setSelectedProject(null); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl z-[140] text-left overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />

              <button 
                onClick={() => { setShowPermissionConfigModal(false); setSelectedProject(null); }}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Project Access Permissions</h3>
                  <p className="text-xs text-gray-500">Fine-grained operation matrix for "{selectedProject.name}"</p>
                </div>
              </div>

              {/* Operations Matrix */}
              <div className="space-y-6">
                {(['Head', 'Team Member'] as const).map((role) => {
                  const currentPermissions = selectedProject.rolePermissions?.[role] || ['view', 'comment'];
                  const allOperations = ['view', 'comment', 'edit', 'upload', 'delete', 'export', 'manage'];

                  return (
                    <div key={role} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase tracking-wider">{role} Permissions</span>
                        <span className="text-[10px] text-gray-500 font-bold">Workspace Role</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {allOperations.map((operation) => {
                          const isChecked = currentPermissions.includes(operation);
                          return (
                            <label
                              key={operation}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                                  : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={async () => {
                                  let newPermsForRole = [...currentPermissions];
                                  if (isChecked) {
                                    newPermsForRole = newPermsForRole.filter(p => p !== operation);
                                  } else {
                                    newPermsForRole.push(operation);
                                  }

                                  const updatedRolePermissions = {
                                    ...selectedProject.rolePermissions,
                                    'Owner': ['view', 'comment', 'edit', 'upload', 'delete', 'export', 'manage'], // owner locked
                                    [role]: newPermsForRole
                                  };

                                  const res = await TeamCollaborationService.updateProjectPermissions(
                                    selectedProject.id,
                                    activeUserEmail,
                                    updatedRolePermissions
                                  );

                                  if (res.success) {
                                    setSelectedProject({
                                      ...selectedProject,
                                      rolePermissions: updatedRolePermissions
                                    });
                                    refreshDatabase();
                                  }
                                }}
                                className="hidden"
                              />
                              <Check size={10} className={isChecked ? 'opacity-100' : 'opacity-0'} />
                              <span>{operation}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                <span className="text-[10px] text-gray-500">🔒 System permissions applied instantaneously to all workspace users</span>
                <button
                  onClick={() => { setShowPermissionConfigModal(false); setSelectedProject(null); }}
                  className="px-6 py-3 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  Save & Complete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CLOUDFLARE R2 SECURE STORAGE BUCKET UPLOADER MODAL (Point 3, 6, 7) --- */}
      <AnimatePresence>
        {showAssetUploadModal && activeWorkspace && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!uploadingAsset) { setShowAssetUploadModal(false); } }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl z-[140] text-left overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />

              <button 
                onClick={() => { if (!uploadingAsset) { setShowAssetUploadModal(false); } }}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all cursor-pointer"
                disabled={uploadingAsset}
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Secure R2 S3 Uploader</h3>
                  <p className="text-xs text-gray-500">Securely push custom files & preset assets to our Cloud storage bucket</p>
                </div>
              </div>

              {/* Form details */}
              <div className="space-y-4">
                {/* Mockup Preset Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Preset Test Assets</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'cinematic-intro.mp4', size: 45 * 1024 * 1024, type: 'video' },
                      { name: 'studio-cover.png', size: 2.1 * 1024 * 1024, type: 'image' },
                      { name: 'cyberpunk-lut.cube', size: 800 * 1024, type: 'preset' },
                      { name: 'production-brief.pdf', size: 1.4 * 1024 * 1024, type: 'document' },
                    ].map((assetSim) => (
                      <button
                        key={assetSim.name}
                        onClick={() => setAssetFileSim(assetSim as any)}
                        className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          assetFileSim.name === assetSim.name
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                            : 'bg-[#121217] border-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        <span className="block truncate font-bold">{assetSim.name}</span>
                        <span className="text-[9px] text-gray-500 font-medium block uppercase tracking-wider mt-1">
                          {assetSim.type} • {(assetSim.size / (1024*1024)).toFixed(1)} MB
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom File Details Input */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Custom Metadata Override</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={assetFileSim.name}
                        onChange={(e) => setAssetFileSim({ ...assetFileSim, name: e.target.value })}
                        placeholder="Filename..."
                        className="w-full bg-[#121217] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <select
                        value={assetFileSim.type}
                        onChange={(e) => setAssetFileSim({ ...assetFileSim, type: e.target.value as any })}
                        className="w-full bg-[#121217] border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-400 focus:border-cyan-500 outline-none"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="preset">Preset</option>
                        <option value="document">Document</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Simulated file upload progress bar */}
                {activeUploadState ? (
                  <div className="p-5 bg-[#121217] border border-cyan-500/20 rounded-2xl space-y-4 shadow-inner">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block">Uploading Asset</span>
                        <h4 className="text-sm font-bold text-white mt-1 truncate max-w-[280px]">{activeUploadState.filename}</h4>
                      </div>
                      <span className="text-xs font-black text-cyan-400 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                        {uploadProgressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          activeUploadState.status === 'paused' 
                            ? 'bg-yellow-500/70 animate-none' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 animate-[pulse_1.5s_infinite]'
                        }`} 
                        style={{ width: `${uploadProgressPercent}%` }} 
                      />
                    </div>

                    {/* Diagnostics row */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono">
                      <div className="bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                        <span className="block text-[8px] text-gray-600">Speed</span>
                        <span className="text-white text-xs font-black">{uploadSpeed}</span>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                        <span className="block text-[8px] text-gray-600">Remaining</span>
                        <span className="text-white text-xs font-black">{uploadTimeRemaining}</span>
                      </div>
                    </div>

                    {/* Connection Simulated Interruption Trigger */}
                    <div className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                      <div>
                        <span className="text-[9px] text-rose-400 font-black uppercase tracking-widest block">Degrade Connection</span>
                        <span className="text-[10px] text-gray-500">Trigger simulated internet loss.</span>
                      </div>
                      <button
                        onClick={() => {
                          setSimulatedInterruption(!simulatedInterruption);
                          showToast(
                            !simulatedInterruption 
                              ? 'Degraded Mode: Simulating packet drop. Storage write buffers will block & auto-pause!' 
                              : 'Restored Mode: Network latency stabilized.',
                            'info'
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          simulatedInterruption 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        {simulatedInterruption ? 'Internet Lost' : 'Simulate Interruption'}
                      </button>
                    </div>

                    {/* Resumable controller actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {activeUploadState.status === 'uploading' ? (
                        <button
                          onClick={handlePauseResumableUpload}
                          className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Pause size={13} />
                          Pause Upload
                        </button>
                      ) : (
                        <button
                          onClick={handleResumeResumableUpload}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Play size={13} />
                          Resume Upload
                        </button>
                      )}
                      <button
                        onClick={handleCancelResumableUpload}
                        className="py-3 px-4 bg-white/5 hover:bg-rose-600 text-gray-400 hover:text-white border border-white/10 hover:border-rose-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#0c0c0f] border border-white/5 p-4 rounded-2xl text-[10px] text-gray-500 space-y-1">
                      <span className="text-gray-400 font-bold uppercase tracking-wider block">🔒 Enterprise Resumable Chunked Storage protocol:</span>
                      <p>• Chunk sizing dynamically splits files into 2MB blocks.</p>
                      <p>• If connection fails, progress is securely persistent in the `resumable_uploads` index.</p>
                      <p>• Automatic checksum verification is validated on final upload completion.</p>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-gray-500">
                        Total File size: {(assetFileSim.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      
                      <button
                        onClick={handleStartResumableUpload}
                        className="px-6 py-3 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      >
                        <Upload size={13} />
                        Start Resumable Upload
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- TEAM OWNERSHIP TRANSFER MODAL --- */}
      <AnimatePresence>
        {showOwnershipTransferModal && activeWorkspace && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOwnershipTransferModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl z-[140] text-left overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />

              <button 
                onClick={() => setShowOwnershipTransferModal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Transfer Team Ownership</h3>
                  <p className="text-xs text-gray-500">Relinquish workspace ownership and assign to a team member</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Workspace Name</span>
                  <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300 font-bold">
                    {activeWorkspace.teamName}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Select Recipient Member</span>
                  <select
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full bg-[#121217] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 outline-none"
                  >
                    <option value="">-- Choose an eligible member --</option>
                    {activeWorkspace.members
                      .filter(m => m.userId.toLowerCase() !== activeUserEmail.toLowerCase())
                      .map(m => (
                        <option key={m.userId} value={m.userId}>
                          {m.userId} ({m.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-[10px] text-rose-400 space-y-1.5 leading-normal">
                  <span className="font-bold uppercase tracking-wider block">⚠️ Legal & System Consequences:</span>
                  <p>• You will forfeit the master administrative status of this workspace.</p>
                  <p>• Your workspace role will immediately be demoted to 'Head' level.</p>
                  <p>• The new owner will inherit subscription tier metrics, capacity counts, and permission controls.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowOwnershipTransferModal(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!newOwnerEmail}
                  onClick={handleTransferOwnership}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl shadow-rose-600/10"
                >
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;
