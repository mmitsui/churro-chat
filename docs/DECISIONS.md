# Decision Log (ADR-lite) — Churro Chat

## D-001: No accounts for MVP
**Decision:** No signup/login for v1.  
**Why:** Minimize friction; maximize join conversion.  
**Revisit when:** We need persistent identity, reputation, or advanced moderation.

## D-002: Rooms are ephemeral (12/24/72)
**Decision:** TTL is selected at creation; room auto-expires.  
**Why:** Reduces moderation burden and retention risk; fits “instant chat” use case.  
**Revisit when:** Users request longer rooms or recurring communities.

## D-003: Allow links + emojis; disallow images
**Decision:** Links and unicode emojis supported; no image rendering/upload.  
**Why:** Keeps UI/abuse surface smaller while supporting common chat needs.  
**Revisit when:** We add content moderation tooling.

## D-004: Owner moderation without accounts
**Decision:** Owner rights based on owner token created at room creation.  
**Why:** Enables moderation while preserving no-login experience.  
**Revisit when:** Owner recovery/transfer is needed.
