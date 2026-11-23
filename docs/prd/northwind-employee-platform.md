# PRD — Northwind Employee Platform

**Product face:** Northwind Traders employee document / ops portal (lab immersion — [ADR-037](../decisions/ADR-037-immersion-northwind-product-face.md)).  
**Engineering tip:** NestJS + Next.js + PostgreSQL + Docker Compose (+ Cycle-10 five-zone lab).  
**Current secure tip:** **`v2.10.1`** (Cycle-10 Blue `v2.10.0` + nginx2root pin).

## Goals

1. Ship a **realistic** full-stack product (auth, RBAC, files, notes, sharing, admin, intake/packets).  
2. Support a **repeatable SSDLC**: SoftDev insecure tip → Red freeze → Blue remediate → tagged pair.  
3. Remain **playable** (Red levels) and **showcasable** (Blue tip + architecture/ADRs).

## Users (in-product)

| Persona | Needs |
|---------|--------|
| Employee | Upload/download own files, notes, request access, partner packets (role-gated) |
| Moderator | Review queue, limited admin surfaces |
| Admin | Users/roles, audit, Defense Ops alerts, access-request approve |
| Integrator / ops (lab) | Jump/cutover hosts on Cycle-10 overlay (not product UI) |

## In scope (tip `v2.10.0`)

- Web portal + Nest API + Intake service  
- RS256 JWT, refresh cookies, DB-authoritative RBAC  
- HTTPS edge lab (`:443`, `:80`→301); cleartext `:8080` = non-showcase  
- Five-zone compose overlay for enterprise network teaching  
- Verification scripts (`smoke`, `cycle10-blue-assert`, reachability)

## Out of scope

- Real customer SaaS / multi-tenant production ops  
- Full SIEM product (Defense Ops stays thin)  
- Merging CTF plants into the secure tip  
- Cloud/K8s deploy lines (future optional tags)

## Non-goals for portfolio readers

- Treating lab defaults as production secrets policy without rotation  
- Using writeups while scoring a Red attempt (spoilers)

## Success metrics (portfolio)

- Cold clone of `main` → run secure tip → explain stack from PRD → architecture → ADR  
- Pick a Red level from [play/red-team.md](../play/red-team.md) and finish via player brief  
- Map one finding → fix via Blue remediation docs  

## Related

- [docs/INDEX.md](../INDEX.md) · [architecture/](../architecture/) · [spec/security-baseline.md](../spec/security-baseline.md) · [ADR-039](../decisions/ADR-039-cycle-10-enterprise-pair.md)
