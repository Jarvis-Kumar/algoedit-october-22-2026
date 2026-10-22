# Security Specification - Algoedit AI Studio

## Data Invariants
1. A **User** document must be owned by the authenticated user (`uid` matches doc ID).
2. **Tokens** can only be modified by system-like actions (or specific whitelisted fields).
3. **Notifications** are private and only accessible by the parent user.
4. **Projects** must have an `ownerId` matching the creator, and only owners can modify them.
5. All timestamps (`joinedAt`, `createdAt`, `updatedAt`) must use `request.time`.

## The Dirty Dozen Payloads (Attack Vectors)

1. **Identity Spoofing**: `PUT /users/userA { "name": "Evil", "uid": "userB" }` by userA.
2. **Privilege Escalation**: `PATCH /users/userA { "tokens": 999999 }`.
3. **ID Poisoning**: `PUT /projects/very-long-id-poisoning-payload-128kb... { "name": "Junk" }`.
4. **Notification Snooping**: `GET /users/userB/notifications/notif1` by userA.
5. **Collection Scraping**: `GET /users (list)` by unverified guest.
6. **Immutable Corruption**: `PATCH /users/userA { "joinedAt": "2000-01-01" }`.
7. **Shadow Field Injection**: `PUT /users/userA { ..., "isAdmin": true }`.
8. **Orphaned Project**: `POST /projects { "name": "Ghost", "ownerId": "non-existent" }`.
9. **Spam Notifications**: `POST /users/userB/notifications { "title": "Buy Crypto" }` by userA.
10. **Denial of Wallet**: `POST /projects { "name": "A" * 1000000 }`.
11. **Action Shortcut**: `PATCH /projects/p1 { "ownerId": "userB" }` by userA.
12. **Type Poisoning**: `PATCH /users/userA { "tokens": "infinity" }`.

## Test Runner (TDD)
(See `firestore.rules.test.ts` for implementation)
