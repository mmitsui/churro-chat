# Security & Privacy — Churro Chat (MVP)

## Privacy principles
- No accounts required
- Avoid collecting PII by default
- Rooms are ephemeral; data retention is minimal

## Data retention (recommended baseline)
- Room and messages exist only during TTL (12/24/72 hours)
- After expiry:
  - Room inaccessible immediately
  - Messages deleted shortly after expiry (option: short grace window for cleanup)
- Operational logs:
  - Keep minimal, avoid storing message bodies in logs
  - Retain security logs only as needed for abuse prevention and debugging

## Security controls
- XSS protection: escape all message content; disallow HTML
- Link safety: render as safe anchors; no scriptable URLs; no inline previews
- Token security:
  - Owner token never shared; store hashed server-side
  - Session tokens rotate/expire with room TTL
- Abuse prevention:
  - rate limiting + join throttling
  - ban/eject enforcement

## Compliance notes (non-legal)
- Provide a simple privacy notice in-app describing ephemeral behavior and retention
- Provide a contact method for abuse reports
