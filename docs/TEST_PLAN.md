# Test Plan — Churro Chat (MVP)

## 1) Goals
- Validate core UX: create → share → join → chat → expire
- Ensure mobile usability
- Verify moderation tools work under adversarial behavior
- Confirm guardrails meaningfully reduce spam/bots
- Confirm security basics: XSS/link safety, token handling

## 2) Test Environments
- Local dev
- Staging (public internet accessible for mobile testing)
- Production (smoke tests only)

## 3) Functional Test Checklist

### Room creation & expiry
- [ ] Create room with 12h TTL; verify expiry timestamp displays
- [ ] Create room with 24h TTL; verify expiry timestamp displays
- [ ] Create room with 72h TTL; verify expiry timestamp displays
- [ ] Verify room URL cannot be changed
- [ ] Simulate expiry (short TTL in staging); verify:
  - [ ] joins rejected
  - [ ] send message rejected
  - [ ] UI shows “expired” state

### Joining & identity
- [ ] Join from mobile; auto nickname/color assigned
- [ ] Refresh page; identity persistence behavior matches intended design
- [ ] Open multiple tabs; behavior is consistent (same or different session)
- [ ] Edit nickname; other clients see update without refresh
- [ ] Nickname validation works (length, disallowed chars)

### Messaging
- [ ] Send text message; appears to all participants
- [ ] Emoji renders correctly (iOS + Android)
- [ ] Link is clickable and safe (no HTML injection)
- [ ] Unsafe URL schemes are blocked (e.g., javascript:)
- [ ] Image links do not render inline previews
- [ ] Very long message is handled (truncate or reject with message)

### Capacity
- [ ] Fill room to capacity; next join shows “Room full”
- [ ] When someone leaves, a new join is allowed

### Moderation
- [ ] Owner can see member list (if implemented)
- [ ] Owner ejects user: user removed immediately, can rejoin (unless banned)
- [ ] Owner bans user: user cannot rejoin after refresh
- [ ] Banned user cannot send message
- [ ] Non-owner cannot access owner controls

## 4) Guardrails / Abuse Tests

### Flooding
- [ ] Send >N messages quickly → rate limit triggers
- [ ] Cooldown shown; after cooldown user can send again
- [ ] Link spam triggers stricter rate limit than text

### Duplication
- [ ] Repeat identical message rapidly → blocked/throttled
- [ ] Repeat same link rapidly → blocked/throttled

### Bot swarm simulation
- [ ] Rapid joins from same source → join throttling triggers
- [ ] (If implemented) suspicious challenge triggers only under suspicious conditions

### Harassment scenarios
- [ ] Owner can quickly ban/eject abusive user
- [ ] Room remains usable after action

## 5) Security Tests

### XSS / injection
- [ ] Messages containing `<script>` are rendered as text, not executed
- [ ] Messages containing HTML tags do not render as HTML
- [ ] Links are rendered safely and do not allow script execution

### Token handling
- [ ] Owner token not exposed to other users
- [ ] Owner token is required to ban/eject (server-enforced)

### Data handling
- [ ] Logs do not include raw message bodies by default
- [ ] Expired rooms/messages are cleaned up per policy

## 6) Reliability Tests

### Reconnect behavior
- [ ] Drop network, reconnect → client resumes receiving messages
- [ ] Reconnect does not duplicate messages (or duplication is acceptable/handled)
- [ ] Server handles intermittent mobile connections gracefully

### Backpressure / overload behavior
- [ ] Under high message rate, system remains responsive or degrades gracefully
- [ ] Messages rejected due to rate limiting show clear user feedback

## 7) Load / Performance Tests (MVP targets)
- [ ] 300 concurrent connections in one room
- [ ] Sustained message throughput test (e.g., 5 msg/sec)
- [ ] P95 message delivery latency target established and measured
- [ ] Server CPU/memory within safe bounds

## 8) Mobile UX Tests
- [ ] iOS Safari: keyboard doesn’t cover input
- [ ] Android Chrome: input usable; scrolling stable
- [ ] Tap targets: send button, nickname edit, member list (if any)
- [ ] Rotation: portrait/landscape behavior acceptable

## 9) Launch Smoke Tests
- [ ] Create room in prod
- [ ] Join from phone
- [ ] Send message + emoji + link
- [ ] Owner eject/ban works
- [ ] Observability shows expected counters
