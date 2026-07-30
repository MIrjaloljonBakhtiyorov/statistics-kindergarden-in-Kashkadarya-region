# Day 28: Release Candidate

Date: 2026-08-27
Branch: day-28-release-candidate
Commit: day-28: prepare parent portal release candidate

Scope: Full parent portal release candidate.

Tasks:
- Run frontend and backend builds.
- Build parent portal docker service.
- Smoke test services.
- Record known issues.

Verification:
- frontend pnpm run build
- backend npm run build
- docker compose build parent-portal
