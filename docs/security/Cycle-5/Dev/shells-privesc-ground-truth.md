# Cycle-5 ground truth — `ctf/shells-privesc` (examiner)

**Classification:** Examiner / Dev only — do not ship in player packets.  
**Branch:** `ctf/shells-privesc` · baseline tag **`v2.2.0`**  
**Locks:** [cycle-5-decisions.md](cycle-5-decisions.md) § P2 · [box plan](shells-privesc-box-plan.md)  
**Status:** **CTF-READY** · gate signed · **Red writeup complete (2/2)** · freeze next

---

## Flags

| ID | Value | Location |
|----|--------|----------|
| user | `OS{6bf28216861b0959811b7d2f3a68a4b7}` | `/var/opt/kc/user.txt` (readable by `lab`) |
| root | `OS{899a8fea5da7a28868f1eea9a9065592}` | `/root/root.txt` (root only) |

## Host creds / surface

| Field | Value |
|-------|--------|
| User | `lab` |
| Password | `4r98esfeb7` |
| SSH | host `:2222` → container `22` (overlay) |
| Foothold HTTP | host `:8787` — **`kc-agent`** |
| Overlay | `infra/docker-compose.ctf-shells.yml` |
| Image | `infra/lab-host/` |

## Lab target (this workstation — Red start)

Same pattern as Cycle-4: Docker on the Mac publishes ports on the **VirtualBox Host-Only** bridge so Kali can scan it.

| Role | Address | Notes |
|------|---------|--------|
| **Nmap / HTTP / SSH target** | **`192.168.56.1`** | Host-Only (`bridge100`) — prefer this from Kali (matches C4) |
| LAN (optional) | `192.168.1.21` | `en0` — only if Kali is bridged to LAN |
| Loopback (operator Mac) | `127.0.0.1` | Screenshots from host, not from Kali |

**Expected open (CTF overlay):** `8080/tcp` (nginx/app) · `2222/tcp` (SSH) · `8787/tcp` (`kc-agent`)  
**Must not appear:** `5433/tcp` (Postgres) — recreate **without** `docker-compose.e2e.yml`

```bash
# Operator — clean CTF stack (no e2e PG publish)
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml \
  -f infra/docker-compose.e2e.yml down 2>/dev/null || true
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
./infra/cycle5-shells-examiner.sh
```

```bash
# Kali — first recon (evidence: PenTest/screenshots/03-nmap-*.png)
nmap -sV -p- --min-rate 2000 192.168.56.1
# or focused:
nmap -sV -p 22,80,443,2222,8080,8787,5433 192.168.56.1
```

**Revshell callback:** listener on Kali (`0.0.0.0:<port>`). From lab-host, target Kali’s Host-Only IP (often `192.168.56.101` — confirm with `ip a` on Kali), **not** `127.0.0.1`.

## Intended path

1. **Recon:** nmap → `:8080` + `:8787` (+ `:2222`).  
2. **Foothold:** `GET /check?host=` cmdi on `:8787` → reverse shell as `lab`.  
3. **Stabilize:** interactive TTY (`script` / `python` pty / etc.).  
4. **user.txt:** enum beyond `~` → `/var/opt/kc/user.txt`.  
5. **Enum:** `sudo -l`, cron, SUID — one real vector + decoys.  
6. **PrivEsc:** overwrite writable `/opt/kc-ops/backup.sh` → `sudo /opt/kc-ops/backup.sh` → root → `/root/root.txt`.

## Primary PrivEsc

| Field | Value |
|-------|--------|
| Sudoers | `lab ALL=(root) NOPASSWD: /opt/kc-ops/backup.sh` |
| Bug | Script owned `lab:lab`, mode `775` (writable) — intentional CTF plant |
| Fix (Blue) | root-owned non-writable script + drop NOPASSWD / remove path |

## Decoys (why they fail)

| Decoy | Looks like | Why fail |
|-------|------------|----------|
| Cron | Root crontab runs `/opt/kc-ops/cleanup.sh` | Script root-owned `755` — `lab` cannot write |
| SUID | `/usr/local/bin/kc-version` is SUID | Prints version and exits — no shell / no useful abuse |

## Foothold gadget (`kc-agent`)

| Field | Value |
|-------|--------|
| Listen | `0.0.0.0:8787` as user `lab` |
| Benign | `GET /` or `/health` → JSON status |
| Bug | `GET /check?host=<input>` → `os.system(f"ping -c1 {host} >…")` — **intentional** cmdi |
| Outcome | RCE → reverse shell as `lab` |
| Example (examiner) | `curl -g --get --data-urlencode 'host=127.0.0.1; id' 'http://TARGET:8787/check'` |

## Examiner dry-run

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
./infra/assert-pg-unpublished.sh
./infra/assert-ssh-unpublished.sh
./infra/cycle5-shells-examiner.sh
```

Gate: [shells-privesc-ctf-ready.md](../../../release/shells-privesc-ctf-ready.md) · Player: [shells-privesc-player-brief.md](shells-privesc-player-brief.md) · Scope: [../PenTest/scope.md](../PenTest/scope.md)

## Explicit non-goals

Notes XSS reprise · published `:5433` · docker escape · kernel-only · PrivEsc on default prod alone · SoftDev version bump.
