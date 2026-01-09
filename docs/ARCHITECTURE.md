# Architecture — Churro Chat (High-Level)

## Goals
- Anonymous, no-login participation
- Ephemeral rooms with TTL enforcement
- Real-time chat (mobile-friendly)
- Guardrails for spam/bots
- Owner moderation without accounts

## High-level components
- Web client (mobile-first UI)
- Real-time gateway (WebSocket or similar)
- Room service (create room, enforce TTL, track membership)
- Message service (publish/subscribe, persistence policy)
- Moderation service (ban/eject lists and enforcement)
- Guardrails layer (rate limiting, spam heuristics)
- Observability (logs/metrics/traces)

## Data model (conceptual)
- Room: { room_id, created_at, expires_at, capacity=300, owner_token_hash }
- User session: { session_id, nickname, color, joined_at }
- Ban record: { room_id, ban_key, created_at, expires_at }
- Message: { room_id, msg_id, timestamp, author_session_id, content, content_type=text/link }

## Identity approach (no accounts)
- On join: create an ephemeral session token stored client-side.
- Owner receives an owner token at room creation.
- Owner actions require owner token; server verifies token hash.

## Expiration
- Room expires at expires_at:
  - deny new joins
  - optionally show “room expired” page
  - delete messages and room metadata per retention policy

## Guardrails (summary)
- Rate limit per session (messages/minute) + stricter links/minute
- Duplicate message/link suppression
- Join throttling per IP/device heuristics
- Optional challenge triggered only when suspicious behavior detected

## Security considerations
- Escape/sanitize message content
- Render links safely (no HTML injection)
- Protect owner token; never expose to other users
