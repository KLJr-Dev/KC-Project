# Cycle-5 ground truth — `ctf/shells-privesc` (examiner)

**Classification:** Examiner / Dev only — do not ship in player packets.  
**Branch:** `ctf/shells-privesc` · baseline tag **`v2.2.0`**  
**Locks:** [cycle-5-decisions.md](cycle-5-decisions.md) § P2 · [box plan](shells-privesc-box-plan.md)  
**Status:** P2 locked · **P3 lab-host planted** · kc-agent pending P4 · examiner pending P5

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
| Overlay | `infra/docker-compose.ctf-shells.yml` (create P3) |
| Image | `infra/lab-host/` (create P3) |

## Intended path

1. **Recon:** product stack + open `:8787` (`/` or `/health` JSON).  
2. **Foothold:** command injection on `GET /check?host=` → reverse shell as `lab`.  
3. **Stabilize:** interactive TTY (`script` / `python` pty / etc.).  
4. **user.txt:** enum beyond `~` → `/var/opt/kc/user.txt`.  
5. **Enum:** `sudo -l`, cron, SUID — one real vector + decoys.  
6. **PrivEsc:** overwrite writable `/opt/kc-ops/backup.sh` → `sudo /opt/kc-ops/backup.sh` → root → `/root/root.txt`.

## Primary PrivEsc

| Field | Value |
|-------|--------|
| Sudoers | `lab ALL=(root) NOPASSWD: /opt/kc-ops/backup.sh` |
| Bug | Script owned `lab:lab`, mode `775` (writable) |
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
| Benign | `GET /health` → JSON status |
| Bug | `GET /check?host=<input>` → unsanitized shell-out (e.g. `ping -c1 …`) |
| Outcome | RCE → reverse shell as `lab` |
| Listener note | Attacker host must be reachable from container (document Kali IP / `host.docker.internal` in player brief operator notes) |

## Examiner dry-run (P5)

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
./infra/assert-pg-unpublished.sh
./infra/assert-ssh-unpublished.sh
./infra/cycle5-shells-examiner.sh   # pending P5
```

## Explicit non-goals

Notes XSS reprise · published `:5433` · docker escape · kernel-only · PrivEsc on default prod alone · SoftDev version bump.
