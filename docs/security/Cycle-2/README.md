# Security Cycle 2 (v1.1.0 → v2.1.0)

Cycle 2 is an **OSCP-style CTF box** forked from secure tag **`v2.0.0`**.  
Fewer chained findings than Cycle-1 kitchen-sink; proof = **identity + flag contents**.

| Version | Role | Status |
|---------|------|--------|
| v2.0.0 | Secure fork point | Tagged on `main` |
| **v1.1.0** | CTF / insecure scenario | **In progress** — branch `ctf/v1.1.0` |
| v1.1.x | Playtest / writeup | Planned |
| v2.1.0 | Secure parallel (re-close planted breaks) | After writeup |

## Team workspaces

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Box plan + ground truth (spoilers) |
| [PenTest/](PenTest/) | Player notes / writeup (fill after play) |
| [Remediation/](Remediation/) | Target for v2.1.0 harden |

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Box plan (locked design) | [Dev/v1.1.0-box-plan.md](Dev/v1.1.0-box-plan.md) | **Draft — implement from this** |
| Ground truth | [Dev/v1.1.0-ground-truth.md](Dev/v1.1.0-ground-truth.md) | Scaffold (fills as plants land) |
| Player brief (no spoilers) | [Dev/v1.1.0-player-brief.md](Dev/v1.1.0-player-brief.md) | Draft |
| Writeup | [PenTest/v1.1.0-writeup.md](PenTest/v1.1.0-writeup.md) | Placeholder |
| Remediation | [Remediation/v2.1.0-remediation.md](Remediation/v2.1.0-remediation.md) | Placeholder |

## Branch / tags

| Ref | Purpose |
|-----|---------|
| tag `v2.0.0` | Fork point (secure) |
| `ctf/v1.1.0` | Build the box |
| tag `v1.1.0` | When playable (later) |
| tag `v2.1.0` | After remediation (later) |

## Rules (Cycle-2)

- **No new product routes** — misconfigure + plant flags only.
- **OSCP proof culture** — screenshot/log must show identity (`whoami` analogue) **and** flag file/row contents.
- Flags are **32-char hex** in `.txt` files and/or DB rows (`local.txt` / `proof.txt` style).
- **DB is admin-gated** — `nmap` may see Postgres; creds only after admin loot.
- **SSH/FTP sidecars** — explicitly **out of scope** for v1.1.0 (backlog for a later cycle).

## References

- [ADR-013](../../decisions/ADR-013-expansion-cycle-versioning.md)
- [ADR-031](../../decisions/ADR-031-security-cycle-docs.md)
- Cycle-1 (closed): [../Cycle-1/README.md](../Cycle-1/README.md)
