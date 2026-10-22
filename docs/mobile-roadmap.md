
# Mobile Native Support Strategy & Roadmap

## Architecture Overview
Our mobile strategy follows an **API-First** approach, ensuring the core AI orchestration and media processing logic is decoupled from the presentation layer.

### Key Mobile Challenges
1. **Large Media Handling**: Mobile networks are volatile. We use chunked uploads and background sync.
2. **AI Latency**: Mobile users expect instant feedback. We use optimistic UI and lightweight preview models.
3. **Authentication**: Long-lived sessions with secure refresh tokens.

---

## Roadmap Phases

### Phase 1: Mobile-Ready Backend (Current)
- [x] JWT + Refresh Token authentication system.
- [x] S3 Presigned URL system for direct mobile-to-cloud uploads.
- [x] RESTful API endpoints for AI orchestration.
- [ ] Push notification gateway (Firebase Cloud Messaging).

### Phase 2: Hybrid App (React Native)
- **Shared Logic**: Reuse 70% of business logic and types from the web app.
- **Offline Drafts**: Implement SQLite/WatermelonDB for local caching of AI prompts and project metadata.
- **Native Bridges**: Custom modules for high-performance video playback and camera access.

### Phase 3: Fully Native Optimization
- **On-Device AI**: Integrate CoreML (iOS) and TensorFlow Lite (Android) for basic image filters to reduce server costs.
- **Deep OS Integration**: Share extensions, widgets, and Siri/Google Assistant shortcuts for "voice-to-AI" generation.

---

## Technical Design: Offline Sync Logic
```typescript
interface SyncQueueItem {
  id: string;
  action: 'CREATE_PROJECT' | 'UPDATE_PROMPT' | 'UPLOAD_MEDIA';
  payload: any;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}

// Logic:
// 1. User performs action offline -> Save to local SyncQueue.
// 2. Network becomes available -> Background worker processes queue.
// 3. Conflict resolution: Server-wins for metadata, Client-wins for local drafts.
```

## Push Notification Architecture
- **Provider**: Firebase Cloud Messaging (FCM).
- **Triggers**: 
  - AI Video Generation Complete.
  - New Collaboration Comment.
  - Subscription Renewal/Failure.
- **Payload**: Deep-link URLs to open specific projects directly in the app.
