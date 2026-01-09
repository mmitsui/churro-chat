# PRD — Churro Chat (MVP)

## 1. Summary
Churro Chat is a web-based anonymous chat room that can be created and shared with zero friction. Rooms are ephemeral and expire automatically after a chosen TTL. Participants join instantly without accounts and receive a randomized nickname + color (nickname editable).

## 2. Goals
- G1: Create a room in <30 seconds; join a room in <5 seconds on mobile.
- G2: Support up to 300 users per room.
- G3: Room TTL options: 12h / 24h / 72h.
- G4: Messages support text, emojis, and links (no images).
- G5: Room owner can moderate (eject/ban).
- G6: Guardrails reduce bots, spam, and bad actors.

## 3. Non-Goals (Out of Scope for MVP)
- User accounts, OAuth/login, persistent profiles
- Image upload or image embedding / previews
- DMs, friend lists, follows
- Threads, channels, roles, long-lived communities
- Monetization/payment

## 4. Personas
- Room Creator (Owner/Admin): creates room, shares link, moderates.
- Participant (Guest): joins instantly, chats, optionally edits nickname.
- Bad Actor (Adversary): spams, floods, posts malicious links, harasses.

## 5. Key User Flows

### 5.1 Create a room
1) User selects TTL (12/24/72).
2) Room is created and URL is generated.
3) URL is immutable once created.
4) Creator becomes room owner (admin capabilities).

### 5.2 Join a room
1) User opens room URL in browser (mobile or desktop).
2) User is assigned random nickname + color.
3) User can edit nickname at any time (Google Docs style).

### 5.3 Chat
- Real-time messages displayed for all participants.
- Links are clickable; emojis supported (unicode).
- Images are not allowed (no inline rendering; may optionally block common image links).

### 5.4 Moderate (Owner)
- Owner can eject a user.
- Owner can ban a user for room lifetime.
- Owner controls are protected by an owner token (no account).

### 5.5 Expire
- Room becomes inaccessible after TTL.
- Messages are deleted/expired according to the retention policy (see SECURITY_PRIVACY.md).

## 6. Functional Requirements (MVP)

### Identity
- FR-ID-1: Assign random nickname and random color on join.
- FR-ID-2: Allow nickname editing; update visible identity in room immediately.

### Room constraints
- FR-RM-1: TTL selectable on creation: 12h/24h/72h.
- FR-RM-2: Max 300 concurrent users per room.
- FR-RM-3: Room URL cannot be changed after creation.

### Messaging
- FR-MSG-1: Send/receive messages in real-time.
- FR-MSG-2: Support unicode emojis.
- FR-MSG-3: Render links as safe clickable anchors.
- FR-MSG-4: Do not allow inline images (no preview; optional link filtering).

### Guardrails
- FR-GR-1: Rate limit message sending (burst + sustained).
- FR-GR-2: Stricter rate limit for links.
- FR-GR-3: Duplicate detection (repeat message/link flooding).
- FR-GR-4: Join throttling to mitigate bots and bursts.

### Owner moderation
- FR-MOD-1: Owner can eject a user.
- FR-MOD-2: Owner can ban a user for the room lifetime.
- FR-MOD-3: Banned users cannot rejoin (best effort).

## 7. Edge Cases / Open Questions
- Owner identity recovery if cookies cleared or device switch
- Reconnect behavior after network drop
- Whether TTL can be changed after creation (recommended: no)
- Room lock mode (prevent new joins) — likely v1.1
- Retention window after expiry (hard delete vs short grace period)

## 8. Success Metrics (MVP)
- Activation: % of created rooms that receive at least 3 participants and 10 messages
- Join friction: median time from URL open to “first message displayed”
- Moderation effectiveness: spam messages per room, ban/eject usage
- Reliability: reconnect success rate, message delivery latency (P95)
