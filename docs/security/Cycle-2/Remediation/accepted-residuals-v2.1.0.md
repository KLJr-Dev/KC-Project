# Accepted residuals — v2.1.0 (Bucket A)

Lab/demo compromises we **keep** on the secure track through tag `v2.1.0`. These are **not** open bugs and are **not** future-CTF fuel unless a later cycle deliberately promotes them.

**Policy:** Documented here · acknowledged on [v2.1.0-secure-ready.md](../../../release/v2.1.0-secure-ready.md) · do not “quietly fix” without updating this file and the gate.

**Companion:** [future-ctf-candidates.md](future-ctf-candidates.md) (Bucket B) · [v2.1.0-remediation.md](v2.1.0-remediation.md)

**Carry-forward:** Cycle-1 [accepted-residuals-m8.md](../../Cycle-1/Remediation/accepted-residuals-m8.md) (sequential IDs, lab env secrets) remains in force; restated below as R-02 / R-03 for Cycle-2 continuity.

---

| ID | Residual | Rationale | Mitigations in place | Revisit when |
|----|----------|-----------|----------------------|--------------|
| **R-01** | Day-to-day loopback HTTP on `:8080` | Lab DX, smoke/journey/e2e simplicity | TLS overlay (`docker-compose.tls.yml`); LAN/secure-demo **policy** requires HTTPS; `tls-smoke` pre-tag; `COOKIE_SECURE=true` on TLS profile | Product leaves lab-only or public deploy |
| **R-02** | Sequential entity IDs (users/files/shares) | Seed/demo continuity; Cycle-1 evidence | Ownership **403**; unguessable share tokens; admin role gates | Breaking UUID migration accepted as product change |
| **R-03** | Compose env vars for DB/JWT secrets (not full Docker `*_FILE`) | Lab simplicity | JWT PEMs mounted as files under `/run/secrets`; `.env.example` warnings; strong defaults required for demos | Real production / Docker secrets adoption |
| **R-04** | TLS is not the sole compose profile | Avoid breaking day-to-day scripts and CTF contrast | Documented dual profile; tag requires `tls-smoke`; LAN docs mandate overlay | Single “secure-demo” default profile desired |

---

## Explicitly not residuals

| Item | Disposition |
|------|-------------|
| File IDOR / JWT role trust / published PG on secure path | **Closed** — must stay closed (C2-F01…F03) |
| App DB superuser (`postgres` for runtime) | **Must-close in M3** (C2-F07) — not accepted as residual |
| Bucket B surfaces (XSS, CSRF, SSRF, …) | Tracked in [future-ctf-candidates.md](future-ctf-candidates.md) — do not leave half-implemented on secure `main` |

---

## When a residual is removed

1. Update this file (strike or move to “Closed”).  
2. Update remediation matrix / gate checkboxes.  
3. If the change is breaking (e.g. UUIDs), call it out in release notes for `v2.1.x` / `v2.2.0`.
