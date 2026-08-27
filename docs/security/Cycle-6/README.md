# Security Cycle 6 — Link Preview SSRF + CSRF (product expansion)

**Status:** **Closed** · Red frozen `ctf/v1.3.0` · Blue tagged **`v2.3.0`** · frozen `remediation/v2.3.0` · [ADR-034](../../decisions/ADR-034-cycle-6-product-expansion-pair.md)  
**Versions:** `v1.3.0` (intentional insecure) → Red → `v2.3.0` (hardened)  
**Consumes:** FC-02 (CSRF), FC-03 (SSRF) — **Consumed**

| Track | Role | Status |
|-------|------|--------|
| Tag **`v1.3.0`** (+ archive `ctf/v1.3.0`) | Pentest-ready insecure tip | **Shipped** |
| PenTest | Socratic Red | **Complete** — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.3.0/docs/security/Cycle-6/PenTest/v1.3.0-writeup.md) |
| Tag **`v2.3.0`** | Preview policy + bookmark CSRF + SSDLC extras | **Shipped** — [secure-ready](../../release/v2.3.0-secure-ready.md) · [Remediation/](Remediation/) |

---

## One-line story

**Link Preview** → intentional **SSRF** + cookie **CSRF** on bookmarks → Blue closes both; Preview throttle + TLS gate.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Secure tip** | tag `v2.3.0` / `main` | No |
| **Player / Red replay** | tag/`ctf/v1.3.0` → [player brief](Dev/v1.3.0-player-brief.md) | Brief no · writeup yes |
| **Red writeup** | [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.3.0/docs/security/Cycle-6/PenTest/v1.3.0-writeup.md) | Yes |
| **Blue** | [Remediation/](Remediation/) · [v2.3.0-secure-ready](../../release/v2.3.0-secure-ready.md) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief |
| [PenTest/](PenTest/) | Index; full evidence on `ctf/v1.3.0` |
| [Remediation/](Remediation/) | Finding → fix map, residuals, Blue plan |

## References

- Cycle-7 (closed): [../Cycle-7/README.md](../Cycle-7/README.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)
