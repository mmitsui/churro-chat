# Operations / Runbook — Churro Chat (MVP)

## Environments
- Local development
- Staging
- Production

## Configuration (examples)
- ROOM_CAPACITY=300
- TTL_OPTIONS=12h,24h,72h
- MESSAGE_RATE_LIMIT=...
- LINK_RATE_LIMIT=...
- LOG_LEVEL=...

## Observability
- Metrics:
  - active rooms
  - active users per room
  - message throughput
  - rate limit triggers
  - ban/eject counts
  - join failures / reconnect failures
- Logs:
  - avoid logging message content
  - log moderation actions (room_id, timestamp, action type)

## Incident basics
- If spam wave:
  - tighten rate limits temporarily
  - enable stricter join throttles
  - monitor affected rooms/domains
- If latency increases:
  - check gateway saturation
  - apply backpressure / drop non-essential events
