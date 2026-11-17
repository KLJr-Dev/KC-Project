# Red Team catalog — playable levels

**Pillar:** Penetration Testing · **Spoiler policy:** [USAGE.md](../../USAGE.md)  
**Secure tip (demo):** tag / `main` **`v2.10.0`** — see [blue-team.md](blue-team.md).

Checkout the **insecure** tip, run compose, open the player brief. Writeups are **`[SPOILER]`**.

| Cycle | Difficulty | Est. | Skills | Checkout | Start |
|-------|------------|------|--------|----------|-------|
| **10** · Document Portal (boss) | Hard | multi-day | HTTPS edge, DocOps, RCE, PrivEsc, pivot, bastion | `v1.10.0` / `ctf/v1.10.0` | [player brief](../security/Cycle-10/Dev/v1.10.0-player-brief.md) |
| **9** · Onboarding / HR | Medium | 4–8h | header trust, IDOR, race, export PT, SIEM | `v1.6.0` / `ctf/v1.6.0` | [player brief](../security/Cycle-9/Dev/v1.6.0-player-brief.md) |
| **8** · Intake toolchain | Hard | multi-day | SQLi, John, Hydra, revshell, sudo, Samba | `v1.5.0` / `ctf/v1.5.0` | [Cycle-8](../security/Cycle-8/README.md) |
| **7** · Ops / multi-host | Hard | 1–2d | LFI, FTP/SSH/Cowrie, jump | `v1.4.0` / `ctf/v1.4.0` | [Cycle-7](../security/Cycle-7/README.md) |
| **6** · Preview / bookmarks | Medium | 2–4h | SSRF, CSRF | `v1.3.0` / `ctf/v1.3.0` | [Cycle-6](../security/Cycle-6/README.md) |
| **5** · Shells / PrivEsc | Medium | 2–6h | cmdi, revshell, sudo | `ctf/shells-privesc` | [Cycle-5](../security/Cycle-5/README.md) |
| **4** · Notes → SSH | Medium | 2–4h | XSS, foothold SSH | `v1.2.0` / `ctf/v1.2.0` | [Cycle-4](../security/Cycle-4/README.md) |
| **3** · Leak → crack → DB | Medium | 2–4h | leak, hash crack, SQLi | `ctf/leak-crack-db` | [Cycle-3](../security/Cycle-3/README.md) |
| **2** · API / JWT | Medium | 2–4h | IDOR, JWT, PG | `v1.1.0` / `ctf/v1.1.0` | [Cycle-2](../security/Cycle-2/README.md) |
| **1** · MVP AppSec | Easy–Med | 4–8h | authZ, files, shares | `v1.0.0` | [Cycle-1](../security/Cycle-1/README.md) |

## Featured run blocks

### Cycle-10 (boss)

```bash
git checkout v1.10.0   # or ctf/v1.10.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml \
  -f infra/docker-compose.cycle10-lab.yml up -d --build
```

App: **`https://localhost/`** (`:443`; `:80`→301 on Blue tip only).  
**`[SPOILER]`** writeup: on `ctf/v1.10.0` — [PenTest](../security/Cycle-10/PenTest/README.md).

### Cycle-9

```bash
git checkout v1.6.0   # or ctf/v1.6.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
```

### Cycle-8

```bash
git checkout v1.5.0   # or ctf/v1.5.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml \
  -f infra/docker-compose.cycle8.yml up -d --build
```

---

Tip README template: [readme-contract.md](readme-contract.md) · Docs index: [INDEX.md](../INDEX.md)
