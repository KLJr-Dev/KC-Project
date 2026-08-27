# Cycle-7 — locked decisions (P0 2026-08-26)

**Execution:** [v1.4.0-execution-plan.md](v1.4.0-execution-plan.md) · **Box:** [v1.4.0-box-plan.md](v1.4.0-box-plan.md) · **ADR-035**  
**Docs branch:** `docs/cycle-7-p0` → PR → `main`. Product code: feature lanes after P0 merges.

---

## A. Packaging / versioning

| # | Topic | Locked |
|---|--------|--------|
| 1 | Ship shape | Product expansion pair **`v1.4.0`** → Red → **`v2.4.0`** |
| 1b | Baseline tip | Secure **`v2.3.0`** |
| 2 | Lanes | Reset `backend` / `frontend` / `dev` from `main` at **P1** |
| 3 | Docs | **`docs/cycle-7-p0`** → PR → `main` |
| 4 | Archive | Tag `v1.4.0` → freeze `ctf/v1.4.0` |

```text
main @ v2.3.0
  → docs/cycle-7-p0 → PR → main
  → reset feature lanes
  → backend + frontend → merge → dev → PR → main (intentional insecure)
  → pentest-ready → tag v1.4.0 → ctf/v1.4.0
  → Red (multi-day Socratic)
  → remediation/v2.4.0 → tag v2.4.0
```

---

## B. Story / topology

| # | Topic | Locked |
|---|--------|--------|
| 5 | Org story | **Northwind Ops** — KC edge + forgotten FTP + bastion + honeypot + internal ops box |
| 6 | Dual-home | Jump host on **internal Docker network only**; Kali reaches it only via bastion tunnel |
| 7 | Win flavor | Jump: **HTTP basic-auth intranet** (simple Docker), not a Windows VM |
| 8 | Path | LFI → FTP → SSH user → **must** sudo GTFO → pivot → F5 |

---

## C. Ports / services

| # | Service | Publish | Notes |
|---|---------|---------|-------|
| 9 | nginx + Nest/Next | `:8080` | Product + LFI |
| 10 | FTP (vsftpd) | `:21` | Anon; F2 + SSH cred breadcrumb |
| 11 | OpenSSH bastion | `:2222` | Graded real SSH |
| 12 | Cowrie | `:2223` | Decoy only — not graded |
| 13 | Jump host | **none** | Internal net; basic-auth HTTP + F5 |
| 14 | Postgres | unpublished | Assert stays |

Compose: `docker-compose.prod.yml` + **`docker-compose.cycle7.yml`** (name locked for P2).

---

## D. Product / plants

| # | Topic | Locked |
|---|--------|--------|
| 15 | LFI surface | Authenticated **Ops Documents** viewer — e.g. `GET /api/ops/documents?path=` (exact path finalized in P2; must allow `../` plant) |
| 16 | F1 plant file | `ops-docs/plants/cycle7-f1.txt` via `path=../plants/cycle7-f1.txt` from library root |
| 17 | FTP loot | Anon `pub/loot.txt`: F2 + `lab` / `labpass` for `:2222` |
| 18 | SSH user | `lab` / `labpass` · `~/user.txt` = F3 |
| 19 | PrivEsc | `sudo NOPASSWD` on **`/usr/bin/find`** (GTFO) → `/root/root.txt` = F4 |
| 20 | Jump F5 | Internal `http://cycle7-jump:8080/` · basic-auth `nwops` / `Ops1ntranet` (creds in `/root/ops-intranet.txt`) |
| 21 | FC-17 | Optional decoy DB string in FTP — **not** graded |
| 22 | Preview / CSRF / Notes | **Remain hardened** — no Cycle-6 re-break |

### Flags (examiner)

| ID | Value |
|----|--------|
| F1 | `OS{777731571165c37aa74d5385406abb51}` |
| F2 | `OS{0362720305fcd3c72f09b034404b931e}` |
| F3 | `OS{0060cf7cb47a5ed38b3248f0341b766a}` |
| F4 | `OS{a82695d1063fad40ca2472b6dab29015}` |
| F5 | `OS{a0cdd819aad20e6eec0fb56134fdb8f0}` |

Host flags (F3–F5) require **interactive** shell / authenticated access as designed — not FTP-only steal of `user.txt` without shell (OSCP discipline).

---

## E. Pedagogy

| # | Topic | Locked |
|---|--------|--------|
| 23 | Duration | Multi-session: Day1 recon→F3; Day2 F4+F5; Day3 writeup |
| 24 | Coaching | Socratic; spray-all; 20-min rotate; Cowrie = timebox |
| 25 | Tools | nmap, Nikto, gobuster, ftp, Hydra (if needed), ssh, sudo -l / GTFO, tunnel |
| 26 | Brief | Progressive hints; no GT in player packet |

---

## F. Security SDL

1. P0 design (this folder + ADR-035)  
2. P1 reset lanes  
3. P2 backend + infra overlays · P3 frontend  
4. P4 `dev` integrate · P5 tip tag  
5. P6 PenTest · P7 Blue `v2.4.0`  

---

## G. Consumes / out

| ID | Status |
|----|--------|
| FC-18 LFI | **Consumed** (Cycle-7 tip `v1.4.0`) |
| FC-14 FTP | **Consumed** (Cycle-7 overlay) |
| FC-17 | Optional decoy only |
| Out | AD · Win VM · FC-13 · FC-16 · SSRF/CSRF/Notes re-break |

---

## H. Grill locks (P0 complete)

| Item | Locked default |
|------|----------------|
| GTFO binary | `/usr/bin/find` |
| Real SSH port | `2222` |
| Cowrie port | `2223` |
| Jump Win-ish | HTTP basic-auth on jump `:8080` (container-local) |
| LFI API sketch | `GET /api/ops/documents?path=` (Bearer) |
