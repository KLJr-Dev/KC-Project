# Security Cycle 6 — Link Preview SSRF + CSRF (product expansion)

**Status:** P0 design on branch `docs/cycle-6-p0` · tip baseline **`v2.2.0`** · [ADR-034](../../decisions/ADR-034-cycle-6-product-expansion-pair.md)  
**Versions (planned):** `v1.3.0` (intentional insecure) → Red → `v2.3.0` (hardened)  
**Consumes:** FC-02 (CSRF), FC-03 (SSRF)  
**Ceiling:** Graded web findings on tip — **not** PrivEsc / AD / FTP

| Track | Role | Status |
|-------|------|--------|
| Docs / design (`docs/cycle-6-p0` → PR → `main`) | P0 decisions, box, execution, STRIDE | **In progress** |
| Feature lanes (`backend` / `frontend` → `dev` → `main`) | Ship intentional insecure tip | Pending P1+ |
| Tag **`v1.3.0`** (+ archive `ctf/v1.3.0`) | Pentest-ready insecure tip | Pending |
| PenTest | Socratic Red | Pending |
| **`remediation/v2.3.0`** → tag **`v2.3.0`** | Harden fetch + CSRF | Pending |

---

## One-line story

**Link Preview** (new product surface: server fetches a URL) → **SSRF** into internal targets → separate **CSRF** on one cookie-auth mutation. OSCP-style useless `.env` / FTP / AD stay in Bucket B for later.

## Pedagogy

| Cycle-6 | Later |
|---------|--------|
| Product expansion pair + AppSec (SSRF + CSRF) | Useless config leak, FTP, LFI, Windows/AD (Portfolio tracks) |
| Socratic Red coaching | Copy-paste exploit dumps |

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Dev / build** | [Dev/v1.3.0-execution-plan.md](Dev/v1.3.0-execution-plan.md) · [decisions](Dev/cycle-6-decisions.md) | Yes |
| **Player** | Brief (later P5) | No |
| **Red** | PenTest stub (later) | Yes |
| **Blue** | Remediation/ (later) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, later GT/brief |
| [PenTest/](PenTest/) | Writeup, notes, screenshots |
| [Remediation/](Remediation/) | Finding → fix map, residuals |

## References

- Cycle-5 (closed CTF-only): [../Cycle-5/README.md](../Cycle-5/README.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)  
- Preferred terms: [glossary](../../glossary.md) · Security SDL in [decisions](Dev/cycle-6-decisions.md)
