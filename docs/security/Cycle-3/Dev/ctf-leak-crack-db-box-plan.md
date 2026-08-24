# Box plan — `ctf/leak-crack-db` (Cycle-3) **IMPLEMENTED**

**Branch:** `ctf/leak-crack-db` ← fork tag **`v2.1.0`**  
**Product version bump:** none ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md) when present on `main`)  
**Status:** Design locked — **implemented** · Red writeup **complete** · branch **frozen** (2026-08-24). Blue Team: [../Remediation/blue-team-plan.md](../Remediation/blue-team-plan.md).  
**Supersedes:** early proposal drafts

One **mandatory linear chain**. No alternate paths, no bonus flags.

---

## Design goals

| Goal | Choice |
|------|--------|
| Use real product UX | Auth → **Sharing** → **My Files (search)** → DB |
| Not Cycle-2 | No JWT role forge, no “any file IDOR” as the plot |
| Tooling | nmap → Burp → sqlmap → John → `psql` — each required once |
| Proof culture | Two flags: **local** + **proof**; both 32-char hex + identity |

---

## Mandatory chain

```text
[1] nmap/Nessus     → :8080 http, :5433 postgres (password unknown)
[2] Login           → user@kc.test
[3] Sharing UI      → seeded PUBLIC share → ops-reminder.txt (MD5 + Files?q= hint)
[4] My Files search → CTF_MODE injectable q → sqlmap → local.txt
[5] John            → crack MD5 → Postgres password
[6] psql :5433      → ctf_ro → proof.txt
```

Spoilers: [v1-leak-crack-db-ground-truth.md](./v1-leak-crack-db-ground-truth.md)  
Players: [v1-leak-crack-db-player-brief.md](./v1-leak-crack-db-player-brief.md)

---

## Deploy

```bash
git checkout ctf/leak-crack-db
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-leak.yml up -d --build
./infra/ctf-leak-examiner.sh
```

---

## Explicit non-goals

- XSS, SSRF, DNS rebind, Metasploit, SSH/FTP sidecars  
- Re-breaking Cycle-1/2 Criticals on `main`  
- Optional/bonus flags

## Blue Team later

Freeze branch after Red. Remediation on a dedicated branch; no product version bump unless SoftDev expands surface.
