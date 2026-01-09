# Backlog — Churro Chat (MVP)

This backlog is organized as:
- Epics (E-*)
- User stories (US-*)
- Implementation tasks (T-*)
Each story includes acceptance criteria (AC).

---

## E-1: Room Creation & Lifecycle

### US-1.1 Create room with TTL options
As a creator, I want to create a room with a TTL (12h/24h/72h) so it expires automatically.

**AC**
- User can select TTL: 12h, 24h, or 72h.
- Room is created and returns an immutable URL.
- UI shows room expiry time clearly.

**Tasks**
- T-1.1.1 Define room schema: `room_id`, `created_at`, `expires_at`, `capacity`, `owner_token_hash`.
- T-1.1.2 Implement create-room endpoint.
- T-1.1.3 Generate shareable room URL (immutable).
- T-1.1.4 Add create-room UI (TTL selector + create button).
- T-1.1.5 Add “expiry time” banner in room UI.

### US-1.2 Enforce room expiry
As a participant, I want expired rooms to be inaccessible so I’m not chatting in a dead room.

**AC**
- After `expires_at`, new joins are rejected with “Room expired”.
- Existing clients see a clear “Room expired” state and can’t send messages.

**Tasks**
- T-1.2.1 Implement expiry checks on join and send-message.
- T-1.2.2 Implement room-expired UI state.
- T-1.2.3 Implement cleanup job (room + messages) per retention policy.

### US-1.3 Room capacity limit (300 users)
As a creator, I want rooms capped at 300 users so the experience remains stable.

**AC**
- When 300 concurrent users are present, additional joins are rejected with “Room full”.

**Tasks**
- T-1.3.1 Track active connections per room.
- T-1.3.2 Enforce join rejection above capacity.
- T-1.3.3 Add UI for “Room full”.

---

## E-2: Anonymous Identity (Nickname + Color)

### US-2.1 Auto-assign identity on join
As a participant, I want a randomized nickname and color so I can chat immediately.

**AC**
- On join, user is assigned a nickname and color automatically.
- Identity appears next to their messages.

**Tasks**
- T-2.1.1 Implement nickname generator + collision handling.
- T-2.1.2 Implement color assignment (stable for session).
- T-2.1.3 Persist session token client-side (room-scoped).
- T-2.1.4 Display nickname/color in UI.

### US-2.2 Edit nickname (Google Docs style)
As a participant, I want to edit my nickname so others can recognize me.

**AC**
- User can edit nickname at any time.
- Other users see the updated nickname without refresh.

**Tasks**
- T-2.2.1 Add nickname edit UI + inline UX.
- T-2.2.2 Implement “update identity” event + server broadcast.
- T-2.2.3 Validate nickname (length, characters, reserved words).

---

## E-3: Real-time Chat Messaging

### US-3.1 Send/receive text messages
As a participant, I want real-time messaging so the chat feels live.

**AC**
- Messages appear to all connected participants in near real-time.
- Messages have timestamps and consistent ordering.

**Tasks**
- T-3.1.1 Choose transport (WebSocket or equivalent).
- T-3.1.2 Implement message publish/subscribe per room.
- T-3.1.3 Client message list rendering + auto-scroll behavior.
- T-3.1.4 Handle reconnect + resubscribe.

### US-3.2 Support emojis
As a participant, I want to use emojis naturally.

**AC**
- Unicode emojis render correctly across mobile/desktop.

**Tasks**
- T-3.2.1 Ensure message encoding supports unicode end-to-end.
- T-3.2.2 Add basic emoji UX (optional; keyboard is sufficient for MVP).

### US-3.3 Links allowed, images not
As a participant, I want to share links; as a creator, I don’t want image posting.

**AC**
- Links are clickable.
- No inline image rendering (no previews).
- Optional: block common image file extensions if desired.

**Tasks**
- T-3.3.1 Link detection + safe rendering.
- T-3.3.2 Block `javascript:` and other unsafe URL schemes.
- T-3.3.3 Disable inline embeds/previews.
- T-3.3.4 (Optional) image-extension policy (.png/.jpg/.gif) behavior.

---

## E-4: Owner Admin & Moderation

### US-4.1 Owner identification without accounts
As a creator, I want admin privileges without logging in.

**AC**
- Creator receives an owner token tied to the room.
- Owner actions require valid owner token.

**Tasks**
- T-4.1.1 Generate owner token at room creation.
- T-4.1.2 Store owner token securely client-side.
- T-4.1.3 Verify owner token server-side (hash compare).

### US-4.2 Eject a user
As an owner, I want to eject disruptive users.

**AC**
- Ejected user is removed immediately and cannot post until they rejoin.

**Tasks**
- T-4.2.1 Implement member list UI (basic).
- T-4.2.2 Implement eject action + server enforcement.
- T-4.2.3 Add “ejected” UX message to user.

### US-4.3 Ban a user for room lifetime
As an owner, I want to ban disruptive users so they can’t rejoin.

**AC**
- Banned users cannot rejoin until room expires.
- Ban persists across refresh/reconnect (best effort).

**Tasks**
- T-4.3.1 Define ban key strategy (token + heuristics).
- T-4.3.2 Implement ban list storage with expiry = room expiry.
- T-4.3.3 Enforce bans at join + message send.
- T-4.3.4 Owner UI: ban/unban (unban optional for MVP).

### US-4.4 Owner can edit limited room settings
As an owner, I want to edit allowed settings (not URL).

**AC**
- Owner can edit only approved settings (e.g., room title/topic if you add it).
- Owner cannot change URL or TTL (recommended for MVP).

**Tasks**
- T-4.4.1 Decide editable fields (optional).
- T-4.4.2 Implement settings update flow.

---

## E-5: Guardrails (Anti-spam / Anti-bot)

### US-5.1 Rate limits for messages and links
As a participant, I should be prevented from flooding the room.

**AC**
- Message rate limit triggers cooldown.
- Link rate limit triggers stricter cooldown.
- UI communicates cooldown clearly.

**Tasks**
- T-5.1.1 Implement per-session rate limiter (burst + sustained).
- T-5.1.2 Separate limiter for link posts.
- T-5.1.3 Client UX for “slow down” / countdown.

### US-5.2 Duplicate suppression
As a room, we should remain readable even if someone repeats messages.

**AC**
- Repeated identical messages within a short window are blocked or downranked.

**Tasks**
- T-5.2.1 Implement duplicate detection window.
- T-5.2.2 Decide behavior: block vs warn vs shadow-throttle.

### US-5.3 Join throttling / bot friction
As a service, we should reduce bot swarms without requiring login.

**AC**
- Excessive joins from same source are throttled.
- Optional challenge only appears when suspicious behavior occurs.

**Tasks**
- T-5.3.1 Implement join throttling (per IP/device heuristics).
- T-5.3.2 Implement suspiciousness scoring trigger.
- T-5.3.3 Implement challenge gate (optional v1.1 if heavy).

---

## E-6: Observability & Analytics (Minimal)

### US-6.1 Basic metrics and logs
As an operator, I want visibility into usage and abuse.

**AC**
- Track: active rooms, active users, message throughput, rate-limit events, bans/ejects.
- Logs exclude message bodies by default.

**Tasks**
- T-6.1.1 Add structured logging (room_id, event_type, timestamp).
- T-6.1.2 Add metrics counters/gauges.
- T-6.1.3 Create basic dashboard (optional).

### US-6.2 Minimal product analytics (optional)
As a PM, I want to understand activation and engagement.

**AC**
- Track create_room, join_room, send_message, edit_nickname, ban/eject.
- KPIs can be computed from events.

**Tasks**
- T-6.2.1 Define event schema.
- T-6.2.2 Implement client/server event emission.

---

## E-7: UX Polish (Mobile-first)

### US-7.1 Mobile-friendly layout
As a participant, I want the UI to be comfortable on mobile.

**AC**
- Input not obscured by keyboard.
- Tap targets are usable.
- Message list scroll behavior is sane.

**Tasks**
- T-7.1.1 Mobile layout + viewport handling.
- T-7.1.2 Input bar sticky behavior.
- T-7.1.3 Cross-browser testing (iOS Safari / Android Chrome).

---

## Suggested MVP “Definition of Done”
- Create/join works end-to-end on mobile and desktop.
- TTL expiry and “room expired” states work.
- Owner can eject/ban.
- Rate limits prevent flooding.
- No inline images; links safe.
- Basic metrics available; no message content in logs.
