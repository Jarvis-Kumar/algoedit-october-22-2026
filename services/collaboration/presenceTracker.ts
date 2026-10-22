
export interface UserPresence {
  userId: string;
  userName: string;
  cursor: { x: number; y: number } | null;
  lastActive: number;
}

export class PresenceTracker {
  private presences: Map<string, Map<string, UserPresence>> = new Map();

  updatePresence(docId: string, userId: string, userName: string, cursor: { x: number; y: number } | null) {
    if (!this.presences.has(docId)) {
      this.presences.set(docId, new Map());
    }
    const roomPresences = this.presences.get(docId)!;
    roomPresences.set(userId, {
      userId,
      userName,
      cursor,
      lastActive: Date.now()
    });
  }

  removePresence(docId: string, userId: string) {
    const roomPresences = this.presences.get(docId);
    if (roomPresences) {
      roomPresences.delete(userId);
    }
  }

  getRoomPresences(docId: string): UserPresence[] {
    const roomPresences = this.presences.get(docId);
    return roomPresences ? Array.from(roomPresences.values()) : [];
  }

  /**
   * Cleanup inactive users (e.g., those who didn't send a heartbeat for 30s)
   */
  cleanup(timeoutMs: number = 30000) {
    const now = Date.now();
    for (const [docId, roomPresences] of this.presences.entries()) {
      for (const [userId, presence] of roomPresences.entries()) {
        if (now - presence.lastActive > timeoutMs) {
          roomPresences.delete(userId);
        }
      }
    }
  }
}
