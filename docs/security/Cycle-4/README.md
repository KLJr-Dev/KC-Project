# Security Cycle 4 — Notes + SSH foothold (SoftDev)

**Status:** Tag **`v2.2.0`** shipped (secure) · Red **frozen** on `ctf/v1.2.0` · Blue **frozen** on `remediation/v2.2.0` · [ADR-033](../../decisions/ADR-033-cycle-4-softdev-version-pair.md)  
**Versions:** `v1.2.0` (insecure) → Red ✅ → `v2.2.0` (secure) ✅  
**Baseline before SoftDev:** tag **`v2.1.0`**  
**Ceiling:** Logical path to SSH → **file enum / user flag** — **not** PrivEsc ([Cycle-5](../Cycle-5/README.md) takes shells + root)

| Track | Role | Status |
|-------|------|--------|
| SoftDev (`backend` / `frontend` / `dev` → `main`) | Intentional insecure Notes | **Done** — archived as `v1.2.0` / `ctf/v1.2.0` |
| Tag **`v1.2.0`** (+ archive `ctf/v1.2.0`) | Pentest-ready insecure tip | **Shipped** · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.2.0/docs/security/Cycle-4/PenTest/v1.2.0-writeup.md) |
| PenTest | Red (F1–F3; foothold only) | **Complete** |
| **`remediation/v2.2.0`** → tag **`v2.2.0`** | Harden Notes; no default SSH | **Done** — [blue-team-plan](Remediation/blue-team-plan.md) · [secure-ready](../../release/v2.2.0-secure-ready.md) |

---

## One-line story

**Notes** (new product surface) → XSS / seeded plant → **earn** SSH creds → login → **look through files** → `user.txt`. Secure `v2.2.0` keeps Notes, removes lab SSH and XSS.

## Pedagogy split

| Cycle-4 | Cycle-5 (soon) |
|---------|----------------|
| Get there logically + loot the filesystem | Shells + PrivEsc → `root.txt` |
| SoftDev version pair | Prefer CTF overlay on `v2.2.0` |

Detail: [Dev/v1.2.0-box-plan.md](Dev/v1.2.0-box-plan.md) · [Cycle-5 sketch](../Cycle-5/Dev/shells-privesc-sketch.md)

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Dev / build** | [Dev/v1.2.0-execution-plan.md](Dev/v1.2.0-execution-plan.md) · [status](Dev/v1.2.0-softdev-status.md) | Yes |
| **Player** | [Dev/v1.2.0-player-brief.md](Dev/v1.2.0-player-brief.md) | No |
| **Red** | [PenTest stub](PenTest/README.md) → [writeup on `ctf/v1.2.0`](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.2.0/docs/security/Cycle-4/PenTest/v1.2.0-writeup.md) | Yes |
| **Blue** | [Remediation/](Remediation/) · [secure-ready](../../release/v2.2.0-secure-ready.md) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Box plan, ground truth, player brief |
| [PenTest/](PenTest/) | Writeup, notes, screenshots |
| [Remediation/](Remediation/) | Finding → fix map, residuals, secure-ready |

## References

- Cycle-3: [../Cycle-3/README.md](../Cycle-3/README.md)  
- Cycle-5: [../Cycle-5/README.md](../Cycle-5/README.md)  
- Bucket B: FC-01, FC-14 — [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)
