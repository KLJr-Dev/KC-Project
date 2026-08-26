# Security Cycle 6 — Link Preview SSRF + CSRF (product expansion)

**Status:** Red frozen on `ctf/v1.3.0` · Blue **`remediation/v2.3.0`** (M0 done) · tip insecure **`v1.3.0`** until tag **`v2.3.0`** · [ADR-034](../../decisions/ADR-034-cycle-6-product-expansion-pair.md)  
**Versions:** `v1.3.0` (intentional insecure) → Red **done** → `v2.3.0` (hardened)  
**Consumes:** FC-02 (CSRF), FC-03 (SSRF)  
**Ceiling:** Graded web findings on tip — **not** PrivEsc / AD / FTP

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, execution, STRIDE | **Done** (PR #26) |
| Feature lanes → `dev` | Intentional insecure tip | **Done** |
| Tag **`v1.3.0`** (+ archive `ctf/v1.3.0`) | Pentest-ready insecure tip | **Shipped** |
| PenTest | Socratic Red | **Complete** — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.3.0/docs/security/Cycle-6/PenTest/v1.3.0-writeup.md) |
| **`remediation/v2.3.0`** → tag **`v2.3.0`** | Harden fetch + CSRF + SSDLC extras | **M0** — [Remediation/](Remediation/) |

---

## One-line story

**Link Preview** (server fetches a URL) → **SSRF** into internal targets → separate **CSRF** on cookie bookmark mutation. Blue closes both and adds Preview throttle + TLS gate.

## Pedagogy

| Cycle-6 | Later |
|---------|--------|
| Product expansion pair + AppSec (SSRF + CSRF) | Cycle-7 multi-service story box |
| Socratic Red coaching | Copy-paste exploit dumps |

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Dev / build** | [Dev/v1.3.0-execution-plan.md](Dev/v1.3.0-execution-plan.md) · [decisions](Dev/cycle-6-decisions.md) | Yes |
| **Player** | [Dev/v1.3.0-player-brief.md](Dev/v1.3.0-player-brief.md) | No |
| **Red** | [writeup on `ctf/v1.3.0`](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.3.0/docs/security/Cycle-6/PenTest/v1.3.0-writeup.md) | Yes |
| **Blue** | [Remediation/](Remediation/) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief |
| [PenTest/](PenTest/) | Writeup stub on tip; full evidence on `ctf/v1.3.0` |
| [Remediation/](Remediation/) | Finding → fix map, residuals, Blue plan |

## References

- Cycle-5 (closed CTF-only): [../Cycle-5/README.md](../Cycle-5/README.md)  
- Cycle-7 stub: [../Cycle-7/README.md](../Cycle-7/README.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)  
- Preferred terms: [glossary](../../glossary.md) · Security SDL in [decisions](Dev/cycle-6-decisions.md)
