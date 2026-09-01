# Blue handoff — Cycle-9 (`v1.6.0` → `v2.6.0`)

**Audience:** Blue players after Red finished the Cycle-9 tip.  
**Source:** Red findings (confirmed) + codebase guidance.  
**Not included:** exploit steps, flag values, final patches.

Start from the insecure pin Red attacked:

```bash
git checkout -b blue/cycle-9 v1.6.0
# work on remediation/v2.6.0 from main — see blue-team-plan.md (create at Red close)
```

**`[SPOILER]`** after you finish (or if stuck): tag `v2.6.0` · remediation map · [full Red writeup](../PenTest/v1.6.0-writeup.md) on branch **`ctf/v1.6.0`**

---

## Ticket (must-close) — draft

| ID | Severity | CWE | OWASP 2025 | Title | Where to look | Success when |
|----|----------|-----|------------|-------|---------------|--------------|
| **C9-F01** | _TBD_ | 639 | A01 Broken Access Control | Onboarding-request IDOR | `intake/app/onboarding.py` GET by id | Owner/dept/authz check; F1 absent |
| **C9-F02** | _TBD_ | 287 | A07 Authentication Failures | Intake trusts `X-User-*` hop headers | `intake/app/identity.py`, Nest `intake-bff/` | Intake verifies RS256; rejects spoof headers |
| **C9-F03** | _TBD_ | 367 | A04 Insecure Design | Status RMW race | `onboarding.py` PUT status | Row lock / version column; no TOCTOU window |
| **C9-F04** | _TBD_ | 22 | A01 Broken Access Control | Export path traversal | export route + `/app/exports/` tree | `resolve()` + `startswith()` confinement |
| **C9-F05** | _TBD_ | 200 | A02 Security Misconfiguration | SIEM events leak secrets | `security_routes.py` | Redact + authz; no graded fragments |

## Scope reminders

- Do **not** re-break Cycle-6 Preview SSRF / bookmark CSRF, Notes XSS, Cycle-7 Ops LFI, or Cycle-8 Intake SQLi.
- **No** `docker-compose.cycle9.yml` — plants baked into tip; Blue removes in code.
- Nest file approve race stays **closed**.

---

_Fill severity and verification notes after Red freeze._
