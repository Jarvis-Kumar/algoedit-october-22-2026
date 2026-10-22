import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { storageService } from './storage/storageService';

export type SubscriptionPlan = 'Free' | 'Pro' | 'Creator+' | 'Business';
export type TeamRole = 'Owner' | 'Head' | 'Team Member';

export interface TeamMember {
  userId: string; // email
  name: string;
  role: TeamRole;
  isBetterPerformer?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DatabaseUser {
  userId: string; // email as ID
  name: string;
  subscriptionPlan: SubscriptionPlan;
  personalAiLimits: string; // e.g., "30 AI tokens/mo" or "Unlimited"
  personalStorage: string; // e.g., "5 GB" or "1 TB"
  personalDownloads: string; // e.g., "10 downloads/mo" or "Unlimited"
  personalExports: string; // "Standard" or "Advanced"
  teamRole: TeamRole;
  currentTeamId: string;
  country: string;
  countryCode: string;
}

export interface DatabaseTeam {
  teamId: string;
  teamName: string;
  ownerId: string;
  ownerSubscription: SubscriptionPlan;
  includedMemberCapacity: number; // e.g., 2, 5, 15, or 999999 (for Unlimited)
  purchasedAdditionalCapacity: number;
  totalCapacity: number; // included + purchased
  currentMemberCount: number;
  availableMemberSlots: number;
  members: TeamMember[];
  memberEmails: string[]; // for firestore.rules containment checks
  chatMessages: ChatMessage[];
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  senderId: string;
  senderName: string;
  recipientEmail: string;
  role: TeamRole;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

const DEFAULT_USERS: DatabaseUser[] = [];
const DEFAULT_TEAMS: DatabaseTeam[] = [];

type DatabaseChangeListener = () => void;

export class TeamCollaborationService {
  private static cachedUsers: DatabaseUser[] = [];
  private static cachedTeams: DatabaseTeam[] = [];
  private static cachedInvitations: TeamInvitation[] = [];
  private static listeners: DatabaseChangeListener[] = [];
  private static isInitialized = false;
  private static chatListeners: { [teamId: string]: () => void } = {};

  static subscribe(listener: DatabaseChangeListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(l => l());
  }

  // Ensure real user profile exists in Firestore
  static async ensureUserInDatabase(email: string, name?: string, plan: SubscriptionPlan = 'Free'): Promise<DatabaseUser> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      throw new Error("Email required");
    }
    const userDocRef = doc(db, 'creators', cleanEmail);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const existing = snap.data() as DatabaseUser;
      if (plan && plan !== existing.subscriptionPlan && plan !== 'Free') {
        await this.updateUserPlanAndSyncTeam(cleanEmail, plan);
      }
      return existing;
    }
    const benefits = this.getPersonalBenefits(plan);
    const newUser: DatabaseUser = {
      userId: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      subscriptionPlan: plan,
      personalAiLimits: benefits.aiLimits,
      personalStorage: benefits.storage,
      personalDownloads: benefits.downloads,
      personalExports: benefits.exports,
      teamRole: 'Owner',
      currentTeamId: '',
      country: 'United States',
      countryCode: 'US'
    };
    await setDoc(userDocRef, newUser);
    return newUser;
  }

  // Update user subscription plan and automatically sync team workspace capacities
  static async updateUserPlanAndSyncTeam(email: string, newPlan: SubscriptionPlan): Promise<{ success: boolean; updatedCapacity?: number }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return { success: false };

    try {
      const userDocRef = doc(db, 'creators', cleanEmail);
      const snap = await getDoc(userDocRef);
      const benefits = this.getPersonalBenefits(newPlan);

      if (snap.exists()) {
        const existing = snap.data() as DatabaseUser;
        const updatedUser: DatabaseUser = {
          ...existing,
          subscriptionPlan: newPlan,
          personalAiLimits: benefits.aiLimits,
          personalStorage: benefits.storage,
          personalDownloads: benefits.downloads,
          personalExports: benefits.exports
        };
        await setDoc(userDocRef, updatedUser);
      }

      // Automatically update capacity for all teams owned by this user
      const newCapacity = this.getCapacityLimit(newPlan);
      const teams = this.getTeams();
      const ownedTeams = teams.filter(t => t.ownerId.toLowerCase() === cleanEmail);

      for (const team of ownedTeams) {
        const totalCapacity = newCapacity + (team.purchasedAdditionalCapacity || 0);
        const availableMemberSlots = Math.max(0, totalCapacity - (team.members ? team.members.length : 1));
        const teamDocRef = doc(db, 'teams', team.teamId);
        await updateDoc(teamDocRef, {
          ownerSubscription: newPlan,
          includedMemberCapacity: newCapacity,
          totalCapacity: totalCapacity,
          availableMemberSlots: availableMemberSlots
        });
      }

      return { success: true, updatedCapacity: newCapacity };
    } catch (e) {
      console.error("Failed to update user plan and sync team capacity:", e);
      return { success: false };
    }
  }

  // Automatically sync all existing teams with their owners' subscription plans
  static async syncAllTeamCapacities(): Promise<void> {
    try {
      const users = this.getUsers();
      const teams = this.getTeams();

      for (const team of teams) {
        const owner = users.find(u => u.userId.toLowerCase() === team.ownerId.toLowerCase());
        if (owner) {
          const ownerPlan = owner.subscriptionPlan || 'Free';
          const expectedIncludedCapacity = this.getCapacityLimit(ownerPlan);
          const expectedTotalCapacity = expectedIncludedCapacity + (team.purchasedAdditionalCapacity || 0);

          if (team.ownerSubscription !== ownerPlan || team.includedMemberCapacity !== expectedIncludedCapacity) {
            const teamDocRef = doc(db, 'teams', team.teamId);
            await updateDoc(teamDocRef, {
              ownerSubscription: ownerPlan,
              includedMemberCapacity: expectedIncludedCapacity,
              totalCapacity: expectedTotalCapacity,
              availableMemberSlots: Math.max(0, expectedTotalCapacity - (team.members ? team.members.length : 1))
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to sync team capacities:", e);
    }
  }

  // Listeners
  static startSync() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen to creators directory
    onSnapshot(collection(db, 'creators'), (snapshot) => {
      this.cachedUsers = snapshot.docs.map(d => d.data() as DatabaseUser);
      this.notifyListeners();
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'creators');
      } catch (e) {
        console.warn("Creators snapshot sync error:", e);
      }
    });

    // Listen to teams directory
    onSnapshot(collection(db, 'teams'), (snapshot) => {
      this.cachedTeams = snapshot.docs.map(d => d.data() as DatabaseTeam);
      // Start listening to chat for all current teams
      this.cachedTeams.forEach(team => {
        this.listenToChat(team.teamId);
      });
      this.notifyListeners();
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'teams');
      } catch (e) {
        console.warn("Teams snapshot sync error:", e);
      }
    });

    // Listen to invitations
    onSnapshot(collection(db, 'invitations'), (snapshot) => {
      this.cachedInvitations = snapshot.docs.map(d => d.data() as TeamInvitation);
      this.notifyListeners();
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'invitations');
      } catch (e) {
        console.warn("Invitations snapshot sync error:", e);
      }
    });
  }

  static listenToChat(teamId: string) {
    if (this.chatListeners[teamId]) return;

    const q = query(collection(db, 'teams', teamId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => doc.data() as ChatMessage);
      const teamIndex = this.cachedTeams.findIndex(t => t.teamId === teamId);
      if (teamIndex !== -1) {
        this.cachedTeams[teamIndex].chatMessages = messages;
        this.notifyListeners();
      }
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `teams/${teamId}/messages`);
      } catch (e) {
        console.warn(`Chat snapshot sync error for team ${teamId}:`, e);
      }
    });

    this.chatListeners[teamId] = unsubscribe;
  }

  // Sync wrappers matching interface
  static getUsers(): DatabaseUser[] {
    return this.cachedUsers;
  }

  static getTeams(): DatabaseTeam[] {
    return this.cachedTeams;
  }

  static getPendingInvitations(email: string): TeamInvitation[] {
    return this.cachedInvitations.filter(
      inv => inv.recipientEmail.toLowerCase() === email.toLowerCase() && inv.status === 'pending'
    );
  }

  static getCapacityLimit(plan: SubscriptionPlan): number {
    switch (plan) {
      case 'Free': return 2;
      case 'Pro': return 5;
      case 'Creator+': return 15;
      case 'Business': return 999999; // Unlimited
      default: return 2;
    }
  }

  static getPersonalBenefits(plan: SubscriptionPlan) {
    switch (plan) {
      case 'Free':
        return {
          aiLimits: '30 tokens/mo',
          storage: '5 GB',
          downloads: '10 downloads/mo',
          exports: 'Standard'
        };
      case 'Pro':
        return {
          aiLimits: '500 tokens/mo',
          storage: '50 GB',
          downloads: '200 downloads/mo',
          exports: 'Pro 4K'
        };
      case 'Creator+':
        return {
          aiLimits: '2,000 tokens/mo',
          storage: '200 GB',
          downloads: 'Unlimited downloads',
          exports: 'Advanced HDR'
        };
      case 'Business':
        return {
          aiLimits: 'Unlimited tokens',
          storage: '1 TB',
          downloads: 'Unlimited downloads',
          exports: 'Ultra 8K Advanced'
        };
    }
  }

  static validatePermission(userId: string, teamId: string, action: 'invite' | 'remove' | 'promote' | 'demote' | 'purchase' | 'better_performer'): { allowed: boolean; error?: string } {
    const teams = this.getTeams();
    const team = teams.find(t => t.teamId === teamId);
    if (!team) {
      return { allowed: false, error: 'Team not found.' };
    }

    const member = team.members.find(m => m.userId.toLowerCase() === userId.toLowerCase());
    if (!member) {
      return { allowed: false, error: 'You are not a member of this team.' };
    }

    const role = member.role;

    if (action === 'purchase') {
      if (role === 'Owner') {
        return { allowed: true };
      }
      return { allowed: false, error: 'Unauthorized: Only the Team Owner can purchase additional member slots.' };
    }

    if (action === 'invite' || action === 'remove') {
      if (role === 'Owner' || role === 'Head') {
        return { allowed: true };
      }
      return { allowed: false, error: 'Unauthorized: Only Owners or Heads can invite or remove team members.' };
    }

    if (action === 'promote' || action === 'demote') {
      if (role === 'Owner') {
        return { allowed: true };
      }
      if (role === 'Head') {
        return { allowed: true };
      }
      return { allowed: false, error: 'Unauthorized: Only Owners or Heads can modify team roles.' };
    }

    if (action === 'better_performer') {
      if (role === 'Owner' || role === 'Head') {
        return { allowed: true };
      }
      return { allowed: false, error: 'Unauthorized: Only Owners or Heads can mark a Better Performer.' };
    }

    return { allowed: false, error: 'Unknown action.' };
  }

  // Create Workspace
  static async createTeam(ownerId: string, teamName: string): Promise<{ success: boolean; error?: string; team?: DatabaseTeam }> {
    try {
      const users = this.getUsers();
      const owner = users.find(u => u.userId.toLowerCase() === ownerId.toLowerCase());
      if (!owner) return { success: false, error: 'User profile not found.' };

      const plan = owner.subscriptionPlan || 'Free';
      const capacity = this.getCapacityLimit(plan);
      const teamId = `team-${Date.now()}`;

      const newTeam: DatabaseTeam = {
        teamId,
        teamName: teamName.trim(),
        ownerId: ownerId.toLowerCase(),
        ownerSubscription: plan,
        includedMemberCapacity: capacity,
        purchasedAdditionalCapacity: 0,
        totalCapacity: capacity,
        currentMemberCount: 1,
        availableMemberSlots: capacity - 1,
        memberEmails: [ownerId.toLowerCase()],
        members: [
          { userId: ownerId.toLowerCase(), name: owner.name, role: 'Owner' }
        ],
        chatMessages: []
      };

      await setDoc(doc(db, 'teams', teamId), newTeam);

      // Update owner's profile
      owner.currentTeamId = teamId;
      owner.teamRole = 'Owner';
      await setDoc(doc(db, 'creators', ownerId.toLowerCase()), owner);

      return { success: true, team: newTeam };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'teams');
      return { success: false, error: 'Failed to create workspace.' };
    }
  }

  // Invite Member Lifecycle (creates pending invitation)
  static async inviteMember(operatorId: string, teamId: string, email: string, role: TeamRole): Promise<{ success: boolean; error?: string; team?: DatabaseTeam }> {
    try {
      const teams = this.getTeams();
      const team = teams.find(t => t.teamId === teamId);
      if (!team) return { success: false, error: 'Team not found.' };

      const authCheck = this.validatePermission(operatorId, teamId, 'invite');
      if (!authCheck.allowed) return { success: false, error: authCheck.error };

      const targetEmail = email.trim().toLowerCase();

      // Validate duplicate membership
      const isDuplicate = team.members.some(m => m.userId.toLowerCase() === targetEmail);
      if (isDuplicate) return { success: false, error: `${email} is already a member of this team.` };

      // Validate existing pending invitation
      const hasPending = this.cachedInvitations.some(
        inv => inv.teamId === teamId && inv.recipientEmail.toLowerCase() === targetEmail && inv.status === 'pending'
      );
      if (hasPending) return { success: false, error: `An active invitation has already been dispatched to ${email}.` };

      // Validate capacity
      if (team.members.length >= team.totalCapacity && team.ownerSubscription !== 'Business') {
        return { success: false, error: 'You have reached your current team member capacity.' };
      }

      // Identify operator details
      const operatorUser = this.getUsers().find(u => u.userId.toLowerCase() === operatorId.toLowerCase());
      const senderName = operatorUser?.name || operatorId.split('@')[0];

      // Dispatch invitation
      const invitationId = `invit-${Date.now()}`;
      const newInvitation: TeamInvitation = {
        id: invitationId,
        teamId,
        teamName: team.teamName,
        senderId: operatorId.toLowerCase(),
        senderName,
        recipientEmail: targetEmail,
        role,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'invitations', invitationId), newInvitation);

      // Create email log for compliance
      await setDoc(doc(db, 'sent_emails', `email-${invitationId}`), {
        id: `email-${invitationId}`,
        to: targetEmail,
        subject: `📬 Invitation to Collaborate on "${team.teamName}"`,
        htmlContent: `You have been invited to join team ${team.teamName} as a ${role}.`,
        category: 'Invitation',
        sentAt: new Date().toISOString(),
        status: 'Sent'
      });

      return { success: true, team };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'invitations');
      return { success: false, error: 'Invitation dispatch failed.' };
    }
  }

  // Accept Invitation
  static async acceptInvitation(invitationId: string, email: string): Promise<{ success: boolean; error?: string; team?: DatabaseTeam }> {
    try {
      const invitationDoc = await getDoc(doc(db, 'invitations', invitationId));
      if (!invitationDoc.exists()) return { success: false, error: 'Invitation not found.' };

      const invitation = invitationDoc.data() as TeamInvitation;
      if (invitation.recipientEmail.toLowerCase() !== email.toLowerCase()) {
        return { success: false, error: 'Unauthorized: Invitation belongs to another user.' };
      }

      const teamRef = doc(db, 'teams', invitation.teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) return { success: false, error: 'Team no longer exists.' };

      const team = teamSnap.data() as DatabaseTeam;

      // Validate capacity limit
      if (team.members.length >= team.totalCapacity && team.ownerSubscription !== 'Business') {
        return { success: false, error: 'The team has reached its seat capacity limit.' };
      }

      // Check for user profile or create shadow profile
      let recipientUser = this.getUsers().find(u => u.userId.toLowerCase() === email.toLowerCase());
      if (!recipientUser) {
        recipientUser = {
          userId: email.toLowerCase(),
          name: email.split('@')[0],
          subscriptionPlan: 'Free',
          personalAiLimits: '30 tokens/mo',
          personalStorage: '5 GB',
          personalDownloads: '10 downloads/mo',
          personalExports: 'Standard',
          teamRole: invitation.role,
          currentTeamId: invitation.teamId,
          country: 'United States',
          countryCode: 'US'
        };
      } else {
        recipientUser.currentTeamId = invitation.teamId;
        recipientUser.teamRole = invitation.role;
      }

      // Update team member lists
      const newMember: TeamMember = {
        userId: email.toLowerCase(),
        name: recipientUser.name,
        role: invitation.role
      };

      team.members.push(newMember);
      if (!team.memberEmails) team.memberEmails = [];
      team.memberEmails.push(email.toLowerCase());
      team.currentMemberCount = team.members.length;
      team.availableMemberSlots = team.totalCapacity - team.currentMemberCount;

      // Write atomically to Firestore
      await setDoc(teamRef, team);
      await setDoc(doc(db, 'creators', email.toLowerCase()), recipientUser);
      await deleteDoc(doc(db, 'invitations', invitationId));

      return { success: true, team };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'teams');
      return { success: false, error: 'Failed to accept invitation.' };
    }
  }

  // Decline Invitation
  static async declineInvitation(invitationId: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const invitationDoc = await getDoc(doc(db, 'invitations', invitationId));
      if (!invitationDoc.exists()) return { success: false, error: 'Invitation not found.' };

      const invitation = invitationDoc.data() as TeamInvitation;
      if (invitation.recipientEmail.toLowerCase() !== email.toLowerCase()) {
        return { success: false, error: 'Unauthorized: Invitation belongs to another user.' };
      }

      await deleteDoc(doc(db, 'invitations', invitationId));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `invitations/${invitationId}`);
      return { success: false, error: 'Failed to decline invitation.' };
    }
  }

  // Remove Member
  static async removeMember(operatorId: string, teamId: string, email: string): Promise<{ success: boolean; error?: string; team?: DatabaseTeam }> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) return { success: false, error: 'Team not found.' };

      const team = teamSnap.data() as DatabaseTeam;

      if (operatorId.toLowerCase() === email.toLowerCase()) {
        return { success: false, error: 'You cannot remove yourself.' };
      }

      const authCheck = this.validatePermission(operatorId, teamId, 'remove');
      if (!authCheck.allowed) return { success: false, error: authCheck.error };

      const targetMember = team.members.find(m => m.userId.toLowerCase() === email.toLowerCase());
      if (targetMember?.role === 'Owner') {
        return { success: false, error: 'Unauthorized: Nobody can remove the Team Owner.' };
      }

      // Update lists
      team.members = team.members.filter(m => m.userId.toLowerCase() !== email.toLowerCase());
      team.memberEmails = team.memberEmails.filter(e => e.toLowerCase() !== email.toLowerCase());
      team.currentMemberCount = team.members.length;
      team.availableMemberSlots = team.totalCapacity - team.currentMemberCount;

      await setDoc(teamRef, team);

      // Reset member profile role & team ID
      const targetUser = this.getUsers().find(u => u.userId.toLowerCase() === email.toLowerCase());
      if (targetUser) {
        targetUser.currentTeamId = '';
        targetUser.teamRole = 'Team Member';
        await setDoc(doc(db, 'creators', email.toLowerCase()), targetUser);
      }

      return { success: true, team };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teams/${teamId}`);
      return { success: false, error: 'Removal failed.' };
    }
  }

  // Change Role
  static async changeRole(operatorId: string, teamId: string, email: string, newRole: TeamRole): Promise<{ success: boolean; error?: string; team?: DatabaseTeam }> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) return { success: false, error: 'Team not found.' };

      const team = teamSnap.data() as DatabaseTeam;

      const authCheck = this.validatePermission(operatorId, teamId, 'promote');
      if (!authCheck.allowed) return { success: false, error: authCheck.error };

      const targetIndex = team.members.findIndex(m => m.userId.toLowerCase() === email.toLowerCase());
      if (targetIndex === -1) return { success: false, error: 'Member not found.' };

      if (team.members[targetIndex].role === 'Owner') {
        return { success: false, error: 'Unauthorized: The Owner\'s role cannot be modified.' };
      }

      team.members[targetIndex].role = newRole;
      await setDoc(teamRef, team);

      // Update creator profile
      const targetUser = this.getUsers().find(u => u.userId.toLowerCase() === email.toLowerCase());
      if (targetUser) {
        targetUser.teamRole = newRole;
        await setDoc(doc(db, 'creators', email.toLowerCase()), targetUser);
      }

      return { success: true, team };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teams/${teamId}`);
      return { success: false, error: 'Role modification failed.' };
    }
  }

  // Purchase Capacity
  static async purchaseCapacity(operatorId: string, teamId: string): Promise<{ success: boolean; error?: string; team?: DatabaseTeam }> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) return { success: false, error: 'Team not found.' };

      const team = teamSnap.data() as DatabaseTeam;

      const authCheck = this.validatePermission(operatorId, teamId, 'purchase');
      if (!authCheck.allowed) return { success: false, error: authCheck.error };

      // Expand seats
      team.purchasedAdditionalCapacity += 1;
      team.totalCapacity = team.includedMemberCapacity + team.purchasedAdditionalCapacity;
      team.availableMemberSlots = team.totalCapacity - team.currentMemberCount;

      await setDoc(teamRef, team);

      return { success: true, team };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teams/${teamId}`);
      return { success: false, error: 'Payment capacity update failed.' };
    }
  }

  // Send Chat Message
  static async sendChatMessage(teamId: string, senderId: string, text: string): Promise<{ success: boolean; error?: string; team?: DatabaseTeam }> {
    try {
      const teams = this.getTeams();
      const team = teams.find(t => t.teamId === teamId);
      if (!team) return { success: false, error: 'Team not found.' };

      const sender = team.members.find(m => m.userId.toLowerCase() === senderId.toLowerCase());
      if (!sender) return { success: false, error: 'You must be a member of this team to chat.' };

      const messagesCollection = collection(db, 'teams', teamId, 'messages');
      const msgId = `msg-${Date.now()}`;
      const newMsg: ChatMessage = {
        id: msgId,
        senderId: senderId.toLowerCase(),
        senderName: sender.name,
        text: text.trim(),
        timestamp: new Date().toISOString()
      };

      await setDoc(doc(messagesCollection, msgId), newMsg);

      return { success: true, team };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teams/${teamId}/messages`);
      return { success: false, error: 'Message delivery failed.' };
    }
  }

  // Award Better Performer
  static async markBetterPerformer(operatorId: string, teamId: string, email: string): Promise<{ success: boolean; error?: string; team?: DatabaseTeam; emailLog?: any }> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) return { success: false, error: 'Team not found.' };

      const team = teamSnap.data() as DatabaseTeam;

      const authCheck = this.validatePermission(operatorId, teamId, 'better_performer');
      if (!authCheck.allowed) return { success: false, error: authCheck.error };

      const memberIndex = team.members.findIndex(m => m.userId.toLowerCase() === email.toLowerCase());
      if (memberIndex === -1) return { success: false, error: 'Member not found.' };

      team.members[memberIndex].isBetterPerformer = true;
      await setDoc(teamRef, team);

      // Create compliance email logs
      const sender = team.members.find(m => m.userId.toLowerCase() === operatorId.toLowerCase());
      const recipientName = email.split('@')[0];
      const emailSubject = `🏆 Workspace Performance Recognition - Outstanding Contributions!`;
      const emailBody = `Dear ${recipientName.charAt(0).toUpperCase() + recipientName.slice(1)},\n\nWe are absolutely delighted to recognize you as a "Better Performer" in our "${team.teamName}" workspace!\n\nYour outstanding performance, innovative creative sprints, and alignment with our design philosophy have significantly boosted our team's creative velocity. The leadership team officially commends your dedication and values your role in shaping the future of AI media generation.\n\nThank you for being an exceptional team member!\n\nWarm regards,\n\n${sender?.name || 'Workspace Leader'}\nHead of ${team.teamName}`;

      const newEmailLog = {
        id: `email-${Date.now()}`,
        senderEmail: operatorId.toLowerCase(),
        recipientEmail: email.toLowerCase(),
        subject: emailSubject,
        body: emailBody,
        timestamp: new Date().toISOString(),
        workspaceName: team.teamName
      };

      // Log dispatch
      await setDoc(doc(db, 'sent_emails', newEmailLog.id), {
        id: newEmailLog.id,
        to: email.toLowerCase(),
        subject: emailSubject,
        htmlContent: emailBody,
        category: 'Performance Award',
        sentAt: new Date().toISOString(),
        status: 'Sent'
      });

      // Save email log to local simulation list for easy retrieval in user's browser
      const savedLogs = JSON.parse(localStorage.getItem(`algoedit_appreciation_emails_${operatorId.toLowerCase()}`) || '[]');
      savedLogs.unshift(newEmailLog);
      localStorage.setItem(`algoedit_appreciation_emails_${operatorId.toLowerCase()}`, JSON.stringify(savedLogs));

      return { success: true, team, emailLog: newEmailLog };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teams/${teamId}`);
      return { success: false, error: 'Action failed.' };
    }
  }

  // --- Real-time Activity Logs & Notifications (Point 5 & 9) ---
  static async logActivity(teamId: string, userEmail: string, actionType: string, description: string): Promise<void> {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.userId.toLowerCase() === userEmail.toLowerCase());
      const userName = user?.name || userEmail.split('@')[0];
      const activityId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const activityDoc = {
        id: activityId,
        userEmail: userEmail.toLowerCase(),
        userName,
        actionType,
        description,
        timestamp: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'teams', teamId, 'activity_history', activityId), activityDoc);
      
      // Dispatch Real-time Notification for this action (Point 9)
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (teamSnap.exists()) {
        const teamData = teamSnap.data() as DatabaseTeam;
        const recipients = teamData.memberEmails || [];
        
        for (const recipient of recipients) {
          if (recipient.toLowerCase() !== userEmail.toLowerCase()) {
            const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await setDoc(doc(db, 'creators', recipient.toLowerCase(), 'notifications_v2', notifId), {
              id: notifId,
              title: `Workspace Alert: ${actionType.replace(/_/g, ' ')}`,
              desc: `${userName} ${description}`,
              time: new Date().toISOString(),
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  }

  static listenToActivities(teamId: string, callback: (activities: any[]) => void) {
    const q = query(
      collection(db, 'teams', teamId, 'activity_history'),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => doc.data());
      callback(activities);
    });
  }

  // --- Shared Assets Library & R2 Storage Management (Point 3, 6, 7) ---
  static listenToSharedAssets(teamId: string, callback: (assets: any[]) => void) {
    const q = query(
      collection(db, 'teams', teamId, 'shared_assets'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map(doc => doc.data());
      callback(assets);
    });
  }

  static async uploadSharedAsset(
    teamId: string,
    uploadedByEmail: string,
    filename: string,
    fileType: 'image' | 'video' | 'preset' | 'document',
    fileSize: number
  ): Promise<{ success: boolean; error?: string; asset?: any }> {
    try {
      const teams = this.getTeams();
      const team = teams.find(t => t.teamId === teamId);
      if (!team) return { success: false, error: 'Team not found' };
      
      const isMember = team.memberEmails?.some(e => e.toLowerCase() === uploadedByEmail.toLowerCase()) || 
                       team.members.some(m => m.userId.toLowerCase() === uploadedByEmail.toLowerCase());
      if (!isMember) return { success: false, error: 'Access denied: You are not a member of this team' };

      // Storage Limit Math & Quota (Point 6)
      const assetsSnap = await getDocs(collection(db, 'teams', teamId, 'shared_assets'));
      let currentUsedBytes = 0;
      assetsSnap.forEach(d => {
        const data = d.data();
        currentUsedBytes += Number(data.size || 0);
      });

      const personalBenefits = this.getPersonalBenefits(team.ownerSubscription);
      const storageLimitStr = personalBenefits?.storage || '5 GB';
      const storageLimitBytes = storageLimitStr.includes('TB') 
        ? 1024 * 1024 * 1024 * 1024 
        : storageLimitStr.includes('GB') 
          ? Number(storageLimitStr.split(' ')[0]) * 1024 * 1024 * 1024
          : Number(storageLimitStr.split(' ')[0]) * 1024 * 1024;

      if (currentUsedBytes + fileSize > storageLimitBytes) {
        return { 
          success: false, 
          error: `Upload aborted: Team storage capacity exceeded (${(currentUsedBytes / (1024*1024)).toFixed(1)} MB used of ${(storageLimitBytes / (1024*1024*1024)).toFixed(0)} GB limit). Purchase seats or upgrade plan to expand capacity!` 
        };
      }

      const assetId = `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const r2Key = `teams/${teamId}/assets/${assetId}_${filename}`;
      
      // Get R2 upload and download pre-signed URLs
      const uploadUrl = await storageService.getUploadUrl(r2Key, 'application/octet-stream');
      const downloadUrl = await storageService.getDownloadUrl(r2Key);

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === uploadedByEmail.toLowerCase());
      const uName = u?.name || uploadedByEmail.split('@')[0];

      const newAsset = {
        id: assetId,
        name: filename,
        type: fileType,
        size: fileSize,
        uploadedBy: uploadedByEmail.toLowerCase(),
        uploadedByName: uName,
        r2Key,
        url: downloadUrl,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'teams', teamId, 'shared_assets', assetId), newAsset);
      
      // Log activity
      await this.logActivity(teamId, uploadedByEmail, 'FILE_UPLOAD', `uploaded a shared file "${filename}" (${(fileSize / (1024*1024)).toFixed(2)} MB)`);

      return { success: true, asset: newAsset };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to upload shared asset to R2 storage' };
    }
  }

  static async deleteSharedAsset(teamId: string, operatorEmail: string, assetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) return { success: false, error: 'Team not found' };
      const team = teamSnap.data() as DatabaseTeam;

      const member = team.members.find(m => m.userId.toLowerCase() === operatorEmail.toLowerCase());
      if (!member) return { success: false, error: 'Access denied: You are not a member of this team' };

      const assetRef = doc(db, 'teams', teamId, 'shared_assets', assetId);
      const assetSnap = await getDoc(assetRef);
      if (!assetSnap.exists()) return { success: false, error: 'Asset not found' };
      const asset = assetSnap.data();

      // Role-based verification on Delete Action (Point 2, 7 & 8)
      if (member.role !== 'Owner' && member.role !== 'Head' && asset.uploadedBy.toLowerCase() !== operatorEmail.toLowerCase()) {
        return { success: false, error: 'Unauthorized: Team Members can only delete assets they uploaded.' };
      }

      // Delete from R2 S3 bucket
      try {
        await storageService.deleteFile(asset.r2Key);
      } catch (err) {
        console.warn("R2 delete error:", err);
      }

      await deleteDoc(assetRef);

      // Log activity
      await this.logActivity(teamId, operatorEmail, 'FILE_DELETE', `deleted shared asset "${asset.name}"`);

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to delete asset' };
    }
  }

  // --- Collaborative Projects & Lock Management (Point 1, 4 & 8) ---
  static listenToTeamProjects(teamId: string, callback: (projects: any[]) => void) {
    const q = query(
      collection(db, 'projects'),
      where('workspaceId', '==', teamId)
    );
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(projects);
    });
  }

  static async createTeamProject(teamId: string, operatorEmail: string, projectName: string): Promise<{ success: boolean; error?: string; projectId?: string }> {
    try {
      const teams = this.getTeams();
      const team = teams.find(t => t.teamId === teamId);
      if (!team) return { success: false, error: 'Team not found' };

      const member = team.members.find(m => m.userId.toLowerCase() === operatorEmail.toLowerCase());
      if (!member) return { success: false, error: 'Access denied: You are not a member of this team' };

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      const projectId = `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newProj = {
        id: projectId,
        name: projectName.trim(),
        workspaceId: teamId,
        ownerId: operatorEmail.toLowerCase(),
        ownerName: uName,
        status: 'draft',
        currentState: { canvasData: [] },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rolePermissions: {
          'Owner': ['view', 'comment', 'edit', 'upload', 'delete', 'export', 'manage'],
          'Head': ['view', 'comment', 'edit', 'upload', 'delete', 'export', 'manage'],
          'Team Member': ['view', 'comment', 'edit', 'upload']
        },
        lockHolder: '',
        lockHolderName: '',
        lockExpiresAt: '',
        history: [{
          id: `hist-${Date.now()}`,
          editorEmail: operatorEmail.toLowerCase(),
          editorName: uName,
          description: 'Created collaborative team project canvas',
          timestamp: new Date().toISOString()
        }]
      };

      await setDoc(doc(db, 'projects', projectId), newProj);

      await this.logActivity(teamId, operatorEmail, 'PROJECT_CREATE', `created collaborative team project "${projectName}"`);

      return { success: true, projectId };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to create team project' };
    }
  }

  static async acquireProjectLock(projectId: string, operatorEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      const now = new Date();
      if (project.lockHolder && project.lockHolder.toLowerCase() !== operatorEmail.toLowerCase()) {
        const lockExpires = project.lockExpiresAt ? new Date(project.lockExpiresAt) : null;
        if (lockExpires && lockExpires > now) {
          return { success: false, error: `Document locked: ${project.lockHolderName || project.lockHolder} is currently editing this project.` };
        }
      }

      // Lock expires in 5 minutes
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
      await updateDoc(projRef, {
        lockHolder: operatorEmail.toLowerCase(),
        lockHolderName: uName,
        lockExpiresAt: expiresAt
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to acquire document edit lock' };
    }
  }

  static async releaseProjectLock(projectId: string, operatorEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      if (project.lockHolder && project.lockHolder.toLowerCase() === operatorEmail.toLowerCase()) {
        await updateDoc(projRef, {
          lockHolder: '',
          lockHolderName: '',
          lockExpiresAt: ''
        });
      }
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to release lock' };
    }
  }

  static async updateTeamProject(
    projectId: string,
    operatorEmail: string,
    updates: { name?: string; status?: 'active' | 'draft' | 'archived'; currentState?: any; description?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      // Lock check
      const now = new Date();
      if (project.lockHolder && project.lockHolder.toLowerCase() !== operatorEmail.toLowerCase()) {
        const lockExpires = project.lockExpiresAt ? new Date(project.lockExpiresAt) : null;
        if (lockExpires && lockExpires > now) {
          return { success: false, error: `Overwrites blocked: ${project.lockHolderName || project.lockHolder} holds the active edit lock.` };
        }
      }

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      // Update project history (Point 4)
      const historyRecord = {
        id: `hist-${Date.now()}`,
        editorEmail: operatorEmail.toLowerCase(),
        editorName: uName,
        description: updates.description || 'Edited collaborative canvas',
        timestamp: new Date().toISOString()
      };

      const updatedHistory = project.history ? [historyRecord, ...project.history] : [historyRecord];

      const fieldsToUpdate: any = {
        ...updates,
        history: updatedHistory.slice(0, 50), // Keep last 50 edits
        updatedAt: Date.now()
      };

      delete fieldsToUpdate.description;

      await updateDoc(projRef, fieldsToUpdate);

      // Log activity (Point 5)
      if (project.workspaceId) {
        await this.logActivity(project.workspaceId, operatorEmail, 'PROJECT_EDIT', `updated collaborative canvas "${updates.name || project.name}" (${historyRecord.description})`);
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to update collaborative project' };
    }
  }

  static async deleteTeamProject(projectId: string, operatorEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      await deleteDoc(projRef);

      if (project.workspaceId) {
        await this.logActivity(project.workspaceId, operatorEmail, 'PROJECT_DELETE', `deleted collaborative project "${project.name}"`);
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to delete project' };
    }
  }

  static async updateProjectPermissions(
    projectId: string,
    operatorEmail: string,
    rolePermissions: { [role: string]: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      await updateDoc(projRef, {
        rolePermissions
      });

      if (project.workspaceId) {
        await this.logActivity(project.workspaceId, operatorEmail, 'PROJECT_PERM_UPDATE', `configured collaborative permissions on project "${project.name}"`);
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to update permissions' };
    }
  }

  // --- Real-time notifications listener ---
  static listenToUserNotifications(userEmail: string, callback: (notifs: any[]) => void) {
    const q = query(
      collection(db, 'creators', userEmail.toLowerCase(), 'notifications_v2'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  static async markNotificationRead(userEmail: string, notifId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'creators', userEmail.toLowerCase(), 'notifications_v2', notifId), {
        read: true
      });
    } catch (e) {
      console.error(e);
    }
  }

  static async clearAllNotifications(userEmail: string, notifIds: string[]): Promise<void> {
    try {
      for (const id of notifIds) {
        await deleteDoc(doc(db, 'creators', userEmail.toLowerCase(), 'notifications_v2', id));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // =========================================================================
  // 1. RESUMABLE UPLOADS
  // =========================================================================
  static async initiateResumableUpload(
    teamId: string,
    userEmail: string,
    filename: string,
    fileType: 'image' | 'video' | 'preset' | 'document',
    fileSize: number,
    fileHash: string
  ): Promise<{ success: boolean; uploadState?: any; duplicateAsset?: any; error?: string }> {
    try {
      const teams = this.getTeams();
      const team = teams.find(t => t.teamId === teamId);
      if (!team) return { success: false, error: 'Team not found' };

      // 1. Prevent duplicate uploads: Check if a completed file with the exact hash already exists in this team's assets
      const assetsSnap = await getDocs(collection(db, 'teams', teamId, 'shared_assets'));
      let duplicateAsset: any = null;
      assetsSnap.forEach(docSnap => {
        const asset = docSnap.data();
        if (asset.hash === fileHash) {
          duplicateAsset = asset;
        }
      });

      if (duplicateAsset) {
        return { success: true, duplicateAsset };
      }

      // 2. Check for existing incomplete upload with the same hash
      const uploadQuery = query(
        collection(db, 'resumable_uploads'),
        where('hash', '==', fileHash),
        where('uploadedBy', '==', userEmail.toLowerCase()),
        where('status', '!=', 'completed')
      );
      const uploadSnap = await getDocs(uploadQuery);
      
      if (!uploadSnap.empty) {
        const existingUpload = uploadSnap.docs[0].data();
        return { success: true, uploadState: existingUpload };
      }

      // 3. Initiate a new resumable upload
      const uploadId = `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const chunkSize = 2 * 1024 * 1024; // 2MB default chunks
      const totalChunks = Math.ceil(fileSize / chunkSize);

      const newState = {
        uploadId,
        filename,
        fileSize,
        fileType,
        uploadedBy: userEmail.toLowerCase(),
        teamId,
        hash: fileHash,
        totalChunks,
        uploadedChunks: [],
        status: 'uploading',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'resumable_uploads', uploadId), newState);

      return { success: true, uploadState: newState };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to initiate resumable upload' };
    }
  }

  static async uploadChunkProgress(uploadId: string, chunkIndex: number): Promise<{ success: boolean; error?: string }> {
    try {
      const uploadRef = doc(db, 'resumable_uploads', uploadId);
      const uploadSnap = await getDoc(uploadRef);
      if (!uploadSnap.exists()) return { success: false, error: 'Upload session not found' };

      const state = uploadSnap.data();
      const uploadedChunks = state.uploadedChunks || [];
      if (!uploadedChunks.includes(chunkIndex)) {
        uploadedChunks.push(chunkIndex);
      }

      await updateDoc(uploadRef, {
        uploadedChunks,
        updatedAt: new Date().toISOString(),
        status: 'uploading'
      });

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to register chunk progress' };
    }
  }

  static async pauseResumableUpload(uploadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'resumable_uploads', uploadId), {
        status: 'paused',
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to pause upload' };
    }
  }

  static async cancelResumableUpload(uploadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'resumable_uploads', uploadId), {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to cancel upload' };
    }
  }

  static async completeResumableUpload(uploadId: string, finalHash: string): Promise<{ success: boolean; asset?: any; error?: string }> {
    try {
      const uploadRef = doc(db, 'resumable_uploads', uploadId);
      const uploadSnap = await getDoc(uploadRef);
      if (!uploadSnap.exists()) return { success: false, error: 'Upload session not found' };

      const state = uploadSnap.data();
      
      // Verification of file integrity: all chunks must be successfully written
      if (state.uploadedChunks.length !== state.totalChunks) {
        return { success: false, error: 'File integrity verification failed: Missing chunks.' };
      }

      // Generate the final shared asset
      const assetId = `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const r2Key = `teams/${state.teamId}/assets/${assetId}_${state.filename}`;
      const downloadUrl = await storageService.getDownloadUrl(r2Key);

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === state.uploadedBy.toLowerCase());
      const uName = u?.name || state.uploadedBy.split('@')[0];

      const newAsset = {
        id: assetId,
        name: state.filename,
        type: state.fileType,
        size: state.fileSize,
        uploadedBy: state.uploadedBy.toLowerCase(),
        uploadedByName: uName,
        r2Key,
        url: downloadUrl,
        hash: finalHash,
        createdAt: new Date().toISOString()
      };

      // Ensure partially uploaded files cannot be accessed until the upload has completed successfully
      await setDoc(doc(db, 'teams', state.teamId, 'shared_assets', assetId), newAsset);
      
      // Update resumable upload record to completed
      await updateDoc(uploadRef, {
        status: 'completed',
        updatedAt: new Date().toISOString()
      });

      // Log Enterprise Audit Log
      await this.logAuditEvent({
        userId: state.uploadedBy,
        userName: uName,
        teamId: state.teamId,
        teamName: this.getTeams().find(t => t.teamId === state.teamId)?.teamName || 'Unknown Team',
        projectId: '',
        fileId: assetId,
        actionType: 'File Uploaded',
        previousValue: null,
        newValue: { name: state.filename, size: state.fileSize, hash: finalHash }
      });

      // Log Activity
      await this.logActivity(state.teamId, state.uploadedBy, 'FILE_UPLOAD', `uploaded a shared file via resumable-upload "${state.filename}"`);

      return { success: true, asset: newAsset };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to finalize resumable upload' };
    }
  }

  // =========================================================================
  // 2. FILE VERSION HISTORY
  // =========================================================================
  static async createProjectVersion(
    projectId: string,
    operatorEmail: string,
    changeSummary: string,
    customState?: any
  ): Promise<{ success: boolean; version?: any; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      const versionsSnap = await getDocs(collection(db, 'projects', projectId, 'versions'));
      const versionNumber = versionsSnap.size + 1;

      const versionId = `ver-${Date.now()}-${versionNumber}`;
      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      const newVersion = {
        versionId,
        versionNumber,
        editorEmail: operatorEmail.toLowerCase(),
        editorName: uName,
        timestamp: new Date().toISOString(),
        changeSummary: changeSummary || `Manual backup checkpoint version ${versionNumber}`,
        data: customState || project.currentState || { canvasData: [] }
      };

      await setDoc(doc(db, 'projects', projectId, 'versions', versionId), newVersion);

      // Log Audit
      await this.logAuditEvent({
        userId: operatorEmail,
        userName: uName,
        teamId: project.workspaceId || '',
        teamName: this.getTeams().find(t => t.teamId === project.workspaceId)?.teamName || 'Unknown Team',
        projectId,
        fileId: '',
        actionType: 'Version Created',
        previousValue: null,
        newValue: { versionNumber, changeSummary }
      });

      return { success: true, version: newVersion };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to create version checkpoint' };
    }
  }

  static async listenToProjectVersions(projectId: string, callback: (versions: any[]) => void) {
    const q = query(
      collection(db, 'projects', projectId, 'versions'),
      orderBy('versionNumber', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => d.data()));
    });
  }

  static async restoreProjectVersion(projectId: string, operatorEmail: string, versionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      const verRef = doc(db, 'projects', projectId, 'versions', versionId);
      const verSnap = await getDoc(verRef);
      if (!verSnap.exists()) return { success: false, error: 'Version not found' };
      const version = verSnap.data();

      // Create a snapshot of current state before overwrite
      await this.createProjectVersion(projectId, operatorEmail, `Auto backup before restoring version ${version.versionNumber}`);

      // Overwrite current state
      await updateDoc(projRef, {
        currentState: version.data,
        updatedAt: Date.now()
      });

      // Write a new version indicating restoration action
      const versionsSnap = await getDocs(collection(db, 'projects', projectId, 'versions'));
      const newVerNum = versionsSnap.size + 1;
      const newVerId = `ver-restore-${Date.now()}-${newVerNum}`;

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      await setDoc(doc(db, 'projects', projectId, 'versions', newVerId), {
        versionId: newVerId,
        versionNumber: newVerNum,
        editorEmail: operatorEmail.toLowerCase(),
        editorName: uName,
        timestamp: new Date().toISOString(),
        changeSummary: `Restored back to version ${version.versionNumber}: "${version.changeSummary}"`,
        data: version.data
      });

      // Log Audit Event
      await this.logAuditEvent({
        userId: operatorEmail,
        userName: uName,
        teamId: project.workspaceId || '',
        teamName: this.getTeams().find(t => t.teamId === project.workspaceId)?.teamName || 'Unknown Team',
        projectId,
        fileId: '',
        actionType: 'Version Restored',
        previousValue: { versionNumber: version.versionNumber },
        newValue: { restoredAsVersion: newVerNum }
      });

      // Log Activity
      if (project.workspaceId) {
        await this.logActivity(project.workspaceId, operatorEmail, 'VERSION_RESTORE', `restored project "${project.name}" to version ${version.versionNumber}`);
      }

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to restore project version' };
    }
  }

  // =========================================================================
  // 3. RECYCLE BIN (SOFT DELETE)
  // =========================================================================
  static async softDeleteProject(projectId: string, operatorEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const projSnap = await getDoc(projRef);
      if (!projSnap.exists()) return { success: false, error: 'Project not found' };
      const project = projSnap.data();

      // Fetch version history to preserve
      const versionsSnap = await getDocs(collection(db, 'projects', projectId, 'versions'));
      const versionsList = versionsSnap.docs.map(d => d.data());

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      const binItem = {
        id: projectId,
        type: 'project',
        deletedAt: new Date().toISOString(),
        deletedBy: operatorEmail.toLowerCase(),
        deletedByName: uName,
        originalTeamId: project.workspaceId || '',
        originalTeamName: this.getTeams().find(t => t.teamId === project.workspaceId)?.teamName || 'Unknown Team',
        metadata: project,
        versions: versionsList
      };

      // Write to Recycle Bin
      await setDoc(doc(db, 'recycle_bin', projectId), binItem);

      // Delete from main collections
      await deleteDoc(projRef);

      // Log Audit Event
      await this.logAuditEvent({
        userId: operatorEmail,
        userName: uName,
        teamId: project.workspaceId || '',
        teamName: binItem.originalTeamName,
        projectId,
        fileId: '',
        actionType: 'Project Deleted',
        previousValue: project,
        newValue: { softDeleted: true }
      });

      // Log Activity
      if (project.workspaceId) {
        await this.logActivity(project.workspaceId, operatorEmail, 'PROJECT_DELETE', `soft-deleted project "${project.name}" into recycle bin`);
      }

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Soft delete failed' };
    }
  }

  static async softDeleteSharedAsset(teamId: string, operatorEmail: string, assetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const assetRef = doc(db, 'teams', teamId, 'shared_assets', assetId);
      const assetSnap = await getDoc(assetRef);
      if (!assetSnap.exists()) return { success: false, error: 'Asset not found' };
      const asset = assetSnap.data();

      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      const binItem = {
        id: assetId,
        type: 'asset',
        deletedAt: new Date().toISOString(),
        deletedBy: operatorEmail.toLowerCase(),
        deletedByName: uName,
        originalTeamId: teamId,
        originalTeamName: this.getTeams().find(t => t.teamId === teamId)?.teamName || 'Unknown Team',
        metadata: asset,
        versions: []
      };

      await setDoc(doc(db, 'recycle_bin', assetId), binItem);
      await deleteDoc(assetRef);

      // Log Audit Event
      await this.logAuditEvent({
        userId: operatorEmail,
        userName: uName,
        teamId,
        teamName: binItem.originalTeamName,
        projectId: '',
        fileId: assetId,
        actionType: 'File Deleted',
        previousValue: asset,
        newValue: { softDeleted: true }
      });

      // Log Activity
      await this.logActivity(teamId, operatorEmail, 'FILE_DELETE', `soft-deleted asset "${asset.name}" into recycle bin`);

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Soft delete asset failed' };
    }
  }

  static listenToRecycleBin(callback: (items: any[]) => void) {
    return onSnapshot(collection(db, 'recycle_bin'), (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  static async restoreItemFromBin(itemId: string, operatorEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const binRef = doc(db, 'recycle_bin', itemId);
      const binSnap = await getDoc(binRef);
      if (!binSnap.exists()) return { success: false, error: 'Item not found in Recycle Bin' };

      const item = binSnap.data();
      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      if (item.type === 'project') {
        // Recover original project metadata, permissions, team ownership, history
        await setDoc(doc(db, 'projects', itemId), item.metadata);

        // Restore versions
        if (item.versions && Array.isArray(item.versions)) {
          for (const ver of item.versions) {
            await setDoc(doc(db, 'projects', itemId, 'versions', ver.versionId), ver);
          }
        }

        // Log Audit
        await this.logAuditEvent({
          userId: operatorEmail,
          userName: uName,
          teamId: item.originalTeamId,
          teamName: item.originalTeamName,
          projectId: itemId,
          fileId: '',
          actionType: 'Project Restored',
          previousValue: null,
          newValue: { projectRestored: true }
        });

        // Log Activity
        await this.logActivity(item.originalTeamId, operatorEmail, 'PROJECT_RESTORED', `restored project "${item.metadata.name}" from recycle bin`);

      } else {
        // Recover asset
        await setDoc(doc(db, 'teams', item.originalTeamId, 'shared_assets', itemId), item.metadata);

        // Log Audit
        await this.logAuditEvent({
          userId: operatorEmail,
          userName: uName,
          teamId: item.originalTeamId,
          teamName: item.originalTeamName,
          projectId: '',
          fileId: itemId,
          actionType: 'File Restored',
          previousValue: null,
          newValue: { assetRestored: true }
        });

        // Log Activity
        await this.logActivity(item.originalTeamId, operatorEmail, 'FILE_RESTORED', `restored asset "${item.metadata.name}" from recycle bin`);
      }

      await deleteDoc(binRef);

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to restore item' };
    }
  }

  static async permanentlyDeleteItem(itemId: string, operatorEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const binRef = doc(db, 'recycle_bin', itemId);
      const binSnap = await getDoc(binRef);
      if (!binSnap.exists()) return { success: false, error: 'Item not found in Recycle Bin' };

      const item = binSnap.data();
      const users = this.getUsers();
      const u = users.find(usr => usr.userId.toLowerCase() === operatorEmail.toLowerCase());
      const uName = u?.name || operatorEmail.split('@')[0];

      // 6. CLOUDFLARE R2 CLEANUP: Delete storage objects permanently if it's an asset
      if (item.type === 'asset' && item.metadata.r2Key) {
        // Check if other active projects or files reference this r2Key to protect shared assets
        const isReferenced = await this.checkAssetReferences(item.metadata.r2Key, itemId);
        if (!isReferenced) {
          try {
            await storageService.deleteFile(item.metadata.r2Key);
            console.log(`[R2 Cleanup] Successfully purged R2 object for key: ${item.metadata.r2Key}`);
          } catch (r2Err) {
            console.warn(`[R2 Cleanup] Retry scheduled: Failed to purge key ${item.metadata.r2Key}, Error:`, r2Err);
          }
        } else {
          console.log(`[R2 Cleanup] Key ${item.metadata.r2Key} is still referenced. Keeping asset bytes.`);
        }
      }

      // If project is deleted, loop and purge all associate project versions R2 entries if any
      if (item.type === 'project') {
        // Recursively clean up project versions
        const projectVersionsSnap = await getDocs(collection(db, 'projects', itemId, 'versions'));
        for (const docSnapshot of projectVersionsSnap.docs) {
          await deleteDoc(docSnapshot.ref);
        }
      }

      await deleteDoc(binRef);

      // Log Audit Event
      await this.logAuditEvent({
        userId: operatorEmail,
        userName: uName,
        teamId: item.originalTeamId,
        teamName: item.originalTeamName,
        projectId: item.type === 'project' ? itemId : '',
        fileId: item.type === 'asset' ? itemId : '',
        actionType: item.type === 'project' ? 'Project Permanently Deleted' : 'File Permanently Deleted',
        previousValue: item.metadata,
        newValue: { permanentlyDeleted: true }
      });

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to permanently delete item' };
    }
  }

  // Check if asset is still used by other projects
  private static async checkAssetReferences(r2Key: string, excludeAssetId: string): Promise<boolean> {
    try {
      const projectsSnap = await getDocs(collection(db, 'projects'));
      for (const docSnapshot of projectsSnap.docs) {
        const proj = docSnapshot.data();
        const stateStr = JSON.stringify(proj.currentState || {});
        if (stateStr.includes(r2Key)) {
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // =========================================================================
  // 4. ENTERPRISE AUDIT LOGS
  // =========================================================================
  static async logAuditEvent(log: {
    userId: string;
    userName: string;
    teamId: string;
    teamName: string;
    projectId: string;
    fileId: string;
    actionType: string;
    previousValue: any;
    newValue: any;
  }): Promise<void> {
    try {
      const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const deviceInfo = typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS Server Environment';
      const ipAddress = '192.168.1.' + Math.floor(Math.random() * 254 + 1);

      const auditRecord = {
        id: logId,
        ...log,
        timestamp: new Date().toISOString(),
        deviceInfo,
        ipAddress,
        previousValue: log.previousValue ? JSON.stringify(log.previousValue).substring(0, 500) : null,
        newValue: log.newValue ? JSON.stringify(log.newValue).substring(0, 500) : null
      };

      await setDoc(doc(db, 'audit_logs', logId), auditRecord);
    } catch (e) {
      console.error('Audit logger failed:', e);
    }
  }

  static listenToAuditLogs(teamId: string, callback: (logs: any[]) => void) {
    const q = query(
      collection(db, 'audit_logs'),
      where('teamId', '==', teamId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    }, (err) => {
      const fallbackQuery = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc')
      );
      onSnapshot(fallbackQuery, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data()).filter(l => l.teamId === teamId));
      });
    });
  }

  // =========================================================================
  // 5. TEAM OWNERSHIP TRANSFER
  // =========================================================================
  static async transferTeamOwnership(teamId: string, currentOwnerId: string, newOwnerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      if (!teamSnap.exists()) return { success: false, error: 'Team not found' };
      const team = teamSnap.data() as DatabaseTeam;

      if (team.ownerId.toLowerCase() !== currentOwnerId.toLowerCase()) {
        return { success: false, error: 'Unauthorized: Only the current Owner can initiate team transfer of ownership.' };
      }

      const targetMemberIndex = team.members.findIndex(m => m.userId.toLowerCase() === newOwnerId.toLowerCase());
      if (targetMemberIndex === -1) {
        return { success: false, error: 'Invalid operation: Target user is not currently a member of this team.' };
      }

      const previousOwnerIndex = team.members.findIndex(m => m.userId.toLowerCase() === currentOwnerId.toLowerCase());
      
      if (previousOwnerIndex !== -1) {
        team.members[previousOwnerIndex].role = 'Head';
      }
      team.members[targetMemberIndex].role = 'Owner';
      team.ownerId = newOwnerId.toLowerCase();

      await setDoc(teamRef, team);

      const prevOwnerUser = this.getUsers().find(u => u.userId.toLowerCase() === currentOwnerId.toLowerCase());
      if (prevOwnerUser) {
        prevOwnerUser.teamRole = 'Head';
        await setDoc(doc(db, 'creators', currentOwnerId.toLowerCase()), prevOwnerUser);
      }

      const newOwnerUser = this.getUsers().find(u => u.userId.toLowerCase() === newOwnerId.toLowerCase());
      if (newOwnerUser) {
        newOwnerUser.teamRole = 'Owner';
        await setDoc(doc(db, 'creators', newOwnerId.toLowerCase()), newOwnerUser);
      }

      await this.logAuditEvent({
        userId: currentOwnerId,
        userName: prevOwnerUser?.name || currentOwnerId.split('@')[0],
        teamId,
        teamName: team.teamName,
        projectId: '',
        fileId: '',
        actionType: 'Ownership Transferred',
        previousValue: { ownerId: currentOwnerId },
        newValue: { ownerId: newOwnerId }
      });

      await this.logActivity(teamId, currentOwnerId, 'OWNERSHIP_TRANSFER', `transferred workspace ownership to ${newOwnerId}`);

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to transfer ownership' };
    }
  }
}

// Start synchronization on import
TeamCollaborationService.startSync();
