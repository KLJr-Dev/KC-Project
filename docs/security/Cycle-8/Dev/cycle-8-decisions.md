# Cycle-8 — locked decisions (P0 **FINAL** 2026-08-27)

**Execution:** [v1.5.0-execution-plan.md](v1.5.0-execution-plan.md) · **Box:** [v1.5.0-box-plan.md](v1.5.0-box-plan.md) · **ADR-036** · **Skin:** [ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)  
**History:** P0 on `docs/cycle-8-p0` → #34; SoftDev → #35; tip tagged **`v1.5.0`** / **`ctf/v1.5.0`**.

**Status:** **Locked / historical** — design authority for the shipped insecure tip. Red open; Blue closes plants and deletes tip overlay copies.

**Anti-patterns (from Cycle-7 Red):** no skippable web flag; no cleartext foothold gift in loot; no spoon-feed that kills Cowrie; every planted secret in the **credential ledger**; **no John+Hydra redundancy** (different secrets → different services).

---

## A. Packaging / versioning

| # | Topic | Locked |
|---|--------|--------|
| 1 | Ship shape | Product expansion pair **`v1.5.0`** → Red → **`v2.5.0`** |
| 1b | Baseline tip | Secure **`v2.4.0`** |
| 2 | Lanes | Reset `backend` / `frontend` / `dev` from `main` at **P1** |
| 3 | Docs | **`docs/cycle-8-p0`** → PR → `main` first |
| 4 | Archive | Tag `v1.5.0` → freeze `ctf/v1.5.0` |

```text
main @ v2.4.0
  → docs/cycle-8-p0 → PR → main
  → reset feature lanes
  → backend + frontend + infra → merge → dev → PR → main (intentional insecure)
  → pentest-ready → tag v1.5.0 → ctf/v1.5.0
  → Red (OSCP-report-style writeup; standalone chapters only)
  → remediation/v2.5.0 → tag v2.5.0
```

---

## B. Story / topology / immersion

| # | Topic | Locked |
|---|--------|--------|
| 5 | Org story | **Northwind Intake** — employee portal + Python Intake microservice + Cowrie + weak FTP + dual-home Samba/SMTP |
| 5b | Product face | **Northwind corporate skin** on **`v1.5.0` and `v2.5.0`** ([ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)) |
| 5c | Lab meta | `README` / `USAGE` / `SECURITY` / cycle docs — not the in-app hero |
| 6 | Dual-home | Host B (Samba + SMTP) **internal only** |
| 7 | Win / AD | **Out** — Kali + Docker only |
| 8 | Path | sqlmap → John (SMTP hashes) → Hydra (FTP) → webroot shell → revshell → sudo nano → pivot → F5 |
| 8b | SSH | **No graded OpenSSH.** Cowrie = only SSH-looking listener |
| 8c | Extra AppSec flags | **None** (no graded IDOR / stale cookie / missing TLS) |

---

## C. Ports / services

| # | Service | Publish to Kali | Notes |
|---|---------|-----------------|-------|
| 9 | nginx + Nest/Next | `:8080` | Northwind face; proxies Intake under **`/api/intake`** (or equiv.) |
| 10 | FastAPI Intake | **internal** (not a parallel public product port) | Python microservice for ease-of-use — **not** a Nest replacement; Nest/nginx is the edge |
| 11 | Postgres | **none** | Reuse; SMTP/user hashes; unpublished on secure tip |
| 12 | Cowrie | `:22` | Sole SSH-looking; DECOY |
| 13 | FTP (vsftpd) | `:21` | **LIVE Hydra target** — weak users; leads to foothold (webroot write or equivalent) |
| 14 | Edge shell host | app runtime / webroot | Revshell target; `sudo nano` |
| 15 | Samba | **none** | Internal; F5 (partial hints from root) |
| 16 | SMTP | **none** | Internal; F5 with **John’d** mailbox creds |

Compose: `docker-compose.prod.yml` + **`docker-compose.cycle8.yml`**.  
TLS: `:8080` day-to-day OK; `:8443` recruiter profile — not graded.

---

## D. Dependency DAG (non-negotiable)

```text
Recon (nmap / nikto / gobuster — hygiene)
  ├─ DECOY :22 Cowrie
  ├─ DECOY fake APIs
  ▼
G1  Intake SQLi (via Nest /api/intake → FastAPI) → dump     → F1
    LIVE: user list + SMTP (or mail) password hashes
G2  john → crack SMTP hashes → save cleartexts for Host B   (no flag)
G3  hydra → weak FTP (users from dump/enum; passwords ≠ John) → F2
    LIVE: FTP access → simple webroot (or equiv.) shell drop
G4  webshell → Kali listener → revshell #1 (playable)         → F3
G5  sudo nano → root                                           → F4  ★
    L4: partial Samba hints only (not full map + not SMTP gift)
G6  pivot → Samba enum (partial) + SMTP (John creds)           → F5
STOP
```

### Chain rules

1. **Chain rule:** graded flags consume prior gate output (or climax).  
2. **Ledger rule:** LIVE / DECOY / NOISE / DEMO — no orphan LIVE.  
3. **No tool redundancy:** John secrets ≠ Hydra secrets; different consuming services.  
4. **No spoon-feed** on Cowrie.  
5. **Examiner order:** no OpenSSH backdoor; no static foothold gift; shell requires G3→G4.  
6. **DEMO** never unlocks G3–G6.

### Flags (examiner)

| ID | Value | Gate |
|----|--------|------|
| F1 | `OS{0036b6ceb86445a4c8dce300e4205c43}` | sqlmap dump |
| F2 | `OS{4af4a36815ce627e5d3eba01b57e9376}` | **Post-Hydra FTP** (loot / readable after FTP auth) |
| F3 | `OS{e0af60da9c8aa1daa4a79f2cb95478d2}` | Revshell `user.txt` |
| F4 | `OS{44d562a5ae240a23b8bbf1c21c605fc3}` | `/root/root.txt` after sudo nano |
| F5 | `OS{d310a0605d95303aa114d707b7686f76}` | Internal Samba **and/or** SMTP (both services in play; proofs as designed at P2) |

---

## E. Product / plants / skin

| # | Topic | Locked |
|---|--------|--------|
| 17 | Intake | **FastAPI microservice** behind Nest/nginx `/api/intake` — stack story: Python for a small service, not migrating off Nest/Next |
| 18 | SQLi | Injectable search/filter on Intake — sole graded web plant class |
| 19 | Hydra LIVE | **FTP** weak auth (not HTTP basic, not Cowrie) |
| 20 | John LIVE | DB hashes → **SMTP/mailbox** cleartexts for G6 |
| 21 | Foothold | FTP → **simple** webroot webshell → revshell (playable > annoying; Portfolio shells level) |
| 22 | PrivEsc | `sudo NOPASSWD: /usr/bin/nano` — **easy OK** |
| 23 | Host B | Samba + SMTP; L4 = **partial** Samba; SMTP from John (G2) |
| 24 | Cowrie | Only SSH-looking port — DECOY |
| 25 | Nest hardened surfaces | Stay closed (Preview/CSRF/Notes/Ops LFI) |
| 26 | Skin | Northwind both tips; demo chrome lab-flagged ([ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)) |

### Credential ledger (classes locked; cleartexts at P2)

| ID | Artifact | Class | Consumed by |
|----|----------|-------|-------------|
| L1 | ~12–20 names (+ dump context) | LIVE list | John targets / Hydra `-L` / SMTP VRFY universe |
| L2 | Weak **SMTP/mail** hashes → cleartexts | LIVE | G6 SMTP (after pivot) |
| L3 | Weak **FTP** passwords (≠ L2) | LIVE | Hydra → F2 + shell drop |
| L4 | Root note: **partial** Samba hints | LIVE | G6 Samba enum |
| D1 | Cowrie | DECOY | timebox |
| D2 | Fake `/api/admin` creds | DECOY | fail on real services |
| D3 | Uncrackable hashes in dump | NOISE | John timebox |
| D4 | SMTP addresses like `ceo@northwind…` in dump | NOISE→assist | prioritizes who to try on SMTP |
| DEMO | Nest demo users | DEMO | UI only |

**Orphan rule:** every LIVE has Consumed by.

---

## F. Pedagogy / tools / writeup

| # | Topic | Locked |
|---|--------|--------|
| 27 | Duration | Multi-session |
| 28 | Tool DoD | **sqlmap, John, Hydra, revshell+listener, sudo nano, SMB+SMTP** |
| 29 | Shells | Playable / realistic-simple — not filter hell |
| 30 | Writeup | **OSCP+ report STYLE** from Cycle-8+ ([skeleton](https://github.com/KLJr-Dev/Portfolio) `exams/oscp/report/skeleton.md`) — **only hosts/services that exist**; **no AD chapter** |
| 31 | Brief | Progressive hints; corp portal framing; no Cowrie spoilers |

---

## G. Security SDL

1. P0 FINAL (this doc) → PR `docs/cycle-8-p0`  
2. P1 reset lanes from `v2.4.0`  
3. P2 FastAPI microservice + FTP/Cowrie/Samba/SMTP overlays · P3 Northwind skin + nginx `/api/intake` proxy  
4. P4 `dev` · P5 tag `v1.5.0`  
5. P6 PenTest (OSCP-style writeup) · P7 Blue `v2.5.0` (keep skin)

---

## H. Consumes / out

| ID | Status |
|----|--------|
| FC-19 | FastAPI Intake SQLi + hash plants |
| FC-20 | Overlays: Cowrie, LIVE FTP, Samba/SMTP dual-home |
| Out | AD · Windows · Word · graded OpenSSH · FC-13 · LFI/CSRF/XSS re-break · graded IDOR/TLS · John/Hydra same-secret redundancy · parallel public FastAPI port as “second app” |

---

## I. Grill locks (FINAL)

| Item | Locked |
|------|--------|
| PrivEsc | Easy `sudo nano` |
| Upload / shell | Simple playable webshell via FTP→webroot (or equiv.) |
| John | SMTP/mail hashes from DB → use on Host B |
| Hydra | Weak FTP (different secrets) |
| L4 / F5 | Partial Samba; SMTP from John |
| Intake edge | Proxied through Nest/nginx `/api/…` — FastAPI internal microservice |
| Docs | PR P0 before SoftDev |
| Writeup | OSCP style, no AD section |
| Skin | Northwind on both tips |
| FastAPI role | Microservice addition, not Nest replacement |
| Tip infra | **One live plant overlay** on tip; closed boxes retire to `ctf/v1.x` (delete tip copies at Blue close) |
