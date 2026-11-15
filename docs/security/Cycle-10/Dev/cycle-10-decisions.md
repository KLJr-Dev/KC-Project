# Cycle-10 — locked decisions (P0)

**ADR:** [ADR-039](../../../decisions/ADR-039-cycle-10-enterprise-pair.md) · **Topology:** [c10-v1.10.0-topology.md](../../../diagrams/c10-v1.10.0-topology.md)

## A. Packaging / versioning

| # | Topic | Locked |
|---|--------|--------|
| 1 | Pair | `v1.10.0` → Red → `v2.10.0` |
| 2 | Skip | 1.7–1.9 / 2.7–2.9 unused |
| 3 | Baseline | `v2.6.0` on `main` |
| 4 | Platform | Mac/Kali + Docker Compose; Linux only; no AD/Windows |
| 5 | Lab package | One compose entrypoint for full insecure lab; product compose for Blue later |
| 6 | P0 | `docs/cycle-10-p0` → `main` before plant code |
| 7 | Skin | ADR-037 Northwind |

## B. Network

| # | Topic | Locked |
|---|--------|--------|
| 8 | Zones | DMZ · APP · DATA · CORP · MGMT + `fw` |
| 9 | Enforcement | Default deny; matrix allowlist (bridges ≠ firewall) |
| 10 | Bastion reachability | **Only `integrate` → `bastion`** |
| 11 | Bastion secret | Requires **`docproc` root** |
| 12 | `integrate` | Dual-home APP+CORP; not an IP router |
| 13 | Edge TLS (v1) | HTTPS present but weak; **only host publish `:443→443`** |
| 14 | Edge TLS (v2) | HTTPS default + redirects + strict cookies/headers |
| 13b | External publish | **HTTPS edge only** — no partners/honeypot/Cowrie/prod `:8080` host ports; internals after foothold |

## C. Graded path / RBAC

| # | Topic | Locked |
|---|--------|--------|
| 15 | Stage 0 | HTML comment (or equiv.) → hidden public directory → access request |
| 16 | Session | Grants **`moderator`** (document staff); **not admin** |
| 17 | Open register | Creates plain `user` only — **noise**; packets **403** |
| 18 | Plant | Nest-owned document **packet upload** → helper on **`docproc`** → RCE / revshell |
| 19 | Proofs | `local.txt` + `proof.txt` on `docproc`; crown on `bastion` |
| 20 | Mail | **Required** ops email + runbook attachment |
| 21 | Restore DB | After `docproc` foothold; fw exception |
| 22 | Partner SFTP | Exists on DMZ **unpublished**; cannot skip web gate; not a host-facing path |
| 23 | IdP | Keycloak-style on both tips; **not graded** |

## D. Must not

- Re-break Preview SSRF, CSRF, Notes XSS, Ops LFI, Intake SQLi, Cycle-9 onboarding plants  
- Gift bastion from internet or from non-`integrate` hosts  
- Parallel public FastAPI product port  
- Put crown secrets on noise hosts  

## E. Naming

See topology host table (`edge`, `docproc`, `db-archive`, `mail`, `files`, `integrate`, `bastion`, … under `*.northwind.lab`).
