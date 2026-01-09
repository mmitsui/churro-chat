# Trust & Safety — Churro Chat (MVP)

## Objectives
- Keep rooms usable (limit spam/flooding)
- Reduce bot activity without requiring login
- Give owners simple, effective moderation tools
- Minimize harm from malicious links and harassment

## Threats
- Flooding (rapid messages)
- Repeated links/phishing campaigns
- Harassment / hate / doxxing attempts
- Bot swarms joining rooms

## Guardrails (MVP)
### Rate limits
- Message rate limit: burst + sustained caps per session
- Link rate limit: stricter than messages
- Cooldown UI when rate limited (clear feedback)

### Spam heuristics
- Duplicate message detection (repeat same content)
- Repeated link detection (same URL/domain spam)
- Character-length constraints (max message length)

### Join protections
- Join throttling per IP/device heuristics
- Optional challenge gate when suspicious joins occur (triggered, not default)

## Owner moderation
- Eject: immediate removal from room
- Ban: prevent rejoin for room lifetime (best-effort enforcement)
- Owner UI: member list with quick actions + recent activity context

## Policy decisions (to finalize)
- Report flow: v1 optional; v1.1 recommended
- Link policy: allow all links but no preview; optionally warn for unfamiliar domains
- Handling illegal content: contact process and retention requirements (if any)
