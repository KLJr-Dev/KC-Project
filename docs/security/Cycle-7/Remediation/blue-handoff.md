# Blue handoff — Cycle-7 (`v1.4.0` → `v2.4.0`)

**Audience:** Blue players after Red finished the Cycle-7 tip.  
**Source:** Red findings (confirmed) + codebase guidance.  
**Not included:** exploit steps, flag values, final patches.

Start from the insecure pin Red attacked:

```bash
git checkout -b blue/cycle-7 v1.4.0
```

**`[SPOILER]`** after you finish (or if stuck): tag `v2.4.0` · [v2.4.0-remediation.md](v2.4.0-remediation.md) · [full Red writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md)

---

## Ticket (must-close)

| ID | Severity | CWE | Title | Where to look | Success when |
|----|----------|-----|-------|---------------|--------------|
| **C7-F01** | High | 22 | Ops Documents path traversal / LFI | Product: authenticated **Ops Documents** (`/ops`, `GET /api/ops/documents?path=`). Code: `backend/src/ops/` especially `ops.service.ts`; library root `backend/ops-docs/library/`; intentional plant lived under `ops-docs/plants/` on the insecure tip. | Path cannot escape the library root; plant / F1 string absent from tip responses; legitimate handbook under library still loads. |
| **C7-F02** | High | 306 / 200 | Anonymous FTP publishes loot + SSH creds | Overlay: `infra/docker-compose.cycle7.yml`, `infra/cycle7/ftp/`. Default tip: `infra/docker-compose.prod.yml` must not run/publish FTP. | Day-to-day prod alone does not expose host `:21` or cycle7-ftp. |
| **C7-F03** | Medium | 521 / 798 | Weak bastion password via FTP plant | Bastion overlay `infra/cycle7/bastion/` + loot breadcrumb from FTP. Prod compose must not publish real SSH lab bastion. | No bastion publish on default prod; no tip dependency on that password plant. |
| **C7-F04** | High | 269 | `sudo NOPASSWD` find → root | Bastion image sudoers / `find` GTFO plant under `infra/cycle7/bastion/`. | No shell PrivEsc plant on the secure tip (overlay archive-only). |
| **C7-F05** | High | 668 | Dual-home jump via tunnel | Jump service + bastion TCP forwarding; `infra/cycle7/jump/`. | Jump unpublished on default prod; intranet plant not part of secure tip. |

## Observed / residual (not a graded Blue fail)

| ID | Severity | CWE | Title | Note |
|----|----------|-----|-------|------|
| **C7-F06** | Info | — | Dual SSH / honeypot realism | Acceptable as archive decoy once overlays are off the secure tip. |

---

## Scope reminders

- Do **not** re-break Cycle-6 Preview SSRF / bookmark CSRF or Notes XSS controls.
- Overlay compose may remain in-repo for **`ctf/v1.4.0` replay**; it must not be required for secure day-to-day.
- Tip UI version string on the hardened product is **`v2.4.0`**.

## Suggested verify loop (no spoilers)

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/assert-cycle7-unpublished.sh
./infra/assert-pg-unpublished.sh
# After you believe F01 is closed, exercise Ops Documents as a normal user:
# handbook OK; ../ traversal must fail.
```

**`[SPOILER]`** tip asserts once you want an answer key: `./infra/smoke-test.sh` (includes `cycle7-blue-assert.sh`).
