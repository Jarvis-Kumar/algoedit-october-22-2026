
import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { PresenceTracker } from './presenceTracker';
import { DocumentManager } from './documentManager';

export interface CollaborationConfig {
  redisUrl?: string;
}

export class CollaborationServer {
  private io: SocketServer;
  private presence: PresenceTracker = new PresenceTracker();
  private docs: DocumentManager = new DocumentManager();
  private redis?: Redis;

  constructor(server: HttpServer, config: CollaborationConfig = {}) {
    this.io = new SocketServer(server, {
      cors: { origin: '*' },
      path: '/collaboration'
    });

    if (config.redisUrl && config.redisUrl.trim() !== '') {
      this.initRedis(config.redisUrl);
    } else {
      console.log('[Collaboration] Using in-memory adapter');
    }

    this.setupHandlers();
    
    // Periodic cleanup of stale presences
    setInterval(() => this.presence.cleanup(), 10000);
  }

  private async initRedis(redisUrl: string) {
    try {
      const pubClient = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null, // Stop reconnecting immediately on failure
      });

      // Suppress noisy uncaught errors from failed connection attempts
      pubClient.on('error', (err) => {
        // Only log once if needed, ignore repetitive connection drops
      });

      await pubClient.connect();

      const subClient = pubClient.duplicate({
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null,
      });

      subClient.on('error', () => {});
      await subClient.connect();

      this.redis = pubClient;
      this.io.adapter(createAdapter(pubClient, subClient));
      console.log('[Collaboration] Redis adapter enabled for horizontal scaling');
    } catch (err: any) {
      console.warn('[Collaboration] Redis unavailable, seamlessly using local in-memory adapter:', err?.message || err);
      if (this.redis) {
        try {
          this.redis.disconnect();
        } catch (_) {}
        this.redis = undefined;
      }
    }
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      const { docId, userId, userName } = socket.handshake.query as { docId: string; userId: string; userName: string };

      if (!docId || !userId) {
        socket.disconnect();
        return;
      }

      socket.join(docId);
      
      // Send initial state
      const initialState = this.docs.getEncodedState(docId);
      socket.emit('doc:init', initialState);

      // Presence: Update and broadcast
      this.presence.updatePresence(docId, userId, userName, null);
      socket.to(docId).emit('presence:update', this.presence.getRoomPresences(docId));

      // Handle Cursor Updates
      socket.on('presence:cursor', (cursor) => {
        this.presence.updatePresence(docId, userId, userName, cursor);
        socket.to(docId).emit('presence:cursor', { userId, cursor });
      });

      // Handle Document Sync (CRDT)
      socket.on('doc:update', (update: Uint8Array) => {
        this.docs.applyUpdate(docId, update);
        socket.to(docId).emit('doc:update', update);
      });

      // Handle Comments
      socket.on('comment:add', (comment) => {
        this.io.to(docId).emit('comment:added', { ...comment, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() });
      });

      socket.on('disconnect', () => {
        this.presence.removePresence(docId, userId);
        this.io.to(docId).emit('presence:update', this.presence.getRoomPresences(docId));
      });
    });
  }
}
