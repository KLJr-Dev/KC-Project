# Blue handoff — Cycle-9 (`v1.6.0` → `v2.6.0`)

**Audience:** Blue players after Red finished the Cycle-9 tip.  
**Source:** Red findings (confirmed) + codebase guidance.  
**Not included:** exploit steps, flag values, final patches (see remediation map after start).

```bash
git checkout -b remediation/v2.6.0 v1.6.0
# plan: blue-team-plan.md · map: v2.6.0-remediation.md
```

**Active branch:** `remediation/v2.6.0`  
**`[SPOILER]`** after you finish (or if stuck): tag `v2.6.0` · [v2.6.0-remediation.md](v2.6.0-remediation.md) · [full Red writeup](../PenTest/v1.6.0-writeup.md) on branch **`ctf/v1.6.0`**

---

## Ticket (must-close)

| ID | Severity | CWE | OWASP 2025 | Title | Where to look | Success when |
|----|----------|-----|------------|-------|---------------|--------------|
| **C9-F01** | Critical | 639 | A01 Broken Access Control | Onboarding-request IDOR | `intake/app/onboarding.py` GET by id | Owner/dept/authz check; F1 absent |
| **C9-F02** | Critical | 287 / 639 | A01 / A07 | Intake trusts `X-User-*` hop headers | `intake/app/identity.py`, Nest `intake-bff/` | Intake verifies RS256; rejects spoof headers |
| **C9-F03** | Medium | 367 | A04 Insecure Design | Status RMW race | `onboarding.py` PUT status | Row lock / version column; no TOCTOU window |
| **C9-F04** | High | 22 | A01 Broken Access Control | Export path traversal | export route + `/app/exports/` tree | `resolve()` + confinement |
| **C9-F05** | High | 200 | A02 Security Misconfiguration | SIEM events leak secrets | `security_routes.py` | Redact + authz; no graded fragments |

**Red freeze:** 2026-10-15 — F1–F4 recovered on `ctf/v1.6.0`. C9-F03 observed as design risk, not required for export PoC.

## Scope reminders

- Do **not** re-break Cycle-6 Preview SSRF / bookmark CSRF, Notes XSS, Cycle-7 Ops LFI, or Cycle-8 Intake SQLi.
- Nest file approve race stays **closed**.
