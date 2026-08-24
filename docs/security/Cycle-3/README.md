# Security Cycle 3 — `ctf/leak-crack-db`

**Status:** Red Team **complete** · Box **frozen** on branch `ctf/leak-crack-db` (replayable) · Blue Team next on a separate branch from `main`

Cycle 3 is an **OSCP-style CTF box** forked from secure tag **`v2.1.0`**.  
Linear chain (not Cycle-2 IDOR/JWT). Scoring = **identity + 32-char hex flag** at two tiers (local · proof).  
**No product version bump** (ADR-032).

| Track | Role | Status |
|-------|------|--------|
| `v2.1.0` / `main` | Secure fork point | Tagged |
| **`ctf/leak-crack-db`** | CTF / insecure scenario | **Shipped + frozen** |
| PenTest | Writeup + evidence | **Complete** — [PenTest/v1-leak-crack-db-writeup.md](PenTest/v1-leak-crack-db-writeup.md) |
| Remediation | Blue Team | **Planned** — [Remediation/](Remediation/) from `main`, not from this CTF branch |

---

## Portfolio paths (pick one)

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Player / recruiter try-the-box** | [Dev/v1-leak-crack-db-player-brief.md](Dev/v1-leak-crack-db-player-brief.md) → deploy below | No |
| **Read the engagement** | [PenTest/v1-leak-crack-db-writeup.md](PenTest/v1-leak-crack-db-writeup.md) | Yes (full chain) |
| **Build / examine the box** | [Dev/v1-leak-crack-db-ground-truth.md](Dev/v1-leak-crack-db-ground-truth.md) · [box plan](Dev/ctf-leak-crack-db-box-plan.md) | Yes |
| **Blue Team next** | [Remediation/blue-team-plan.md](Remediation/blue-team-plan.md) · [fix map](Remediation/cycle-3-leak-crack-db-remediation.md) | Yes |

Gate: [leak-crack-db-ctf-ready.md](../../release/leak-crack-db-ctf-ready.md)

---

## Chain (one line)

Login → **Sharing** (hash) → **My Files search** (sqlmap → local) → **John** → **psql** (proof).

---

## Deploy the replayable box

```bash
git checkout ctf/leak-crack-db
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-leak.yml up -d --build
./infra/ctf-leak-examiner.sh   # optional operator dry-run (spoilers)
```

- App: `http://localhost:8080` (or host LAN IP from Kali)  
- Postgres published: `:5433` (creds gated behind chain)  
- **Never** use the CTF overlay on a secure/demo path meant to stay hardened

---

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Box plan, ground truth, player brief |
| [PenTest/](PenTest/) | Scope, notes, screenshots, writeup |
| [Remediation/](Remediation/) | Fix map + Blue plan (implement off `main`) |

## References

- Cycle-2 (closed): [../Cycle-2/README.md](../Cycle-2/README.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md) (FC-09/10/11 consumed)
