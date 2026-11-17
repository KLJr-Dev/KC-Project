# Blue Team catalog — secure tips

**Pillar:** Blue / hardening + SSDLC · **Spoiler policy:** remediation maps are **`[SPOILER]`** if you still want to play Red first.

**Current showcase tip:** **`main` / `v2.10.0`** — production-grade Cycle-10 Blue ([secure-ready](../release/v2.10.0-secure-ready.md)).

| Cycle | Skills (defensive) | Checkout | Verify | Remediation |
|-------|-------------------|----------|--------|-------------|
| **10** | zones, CSP/HSTS, AuthZ, lockout, CIS-ish containers, Defense Ops | `v2.10.0` / `main` / `remediation/v2.10.0` | `cycle10-blue-assert.sh` + `cycle10-blue-reachability.sh` | [map](../security/Cycle-10/Remediation/v2.10.0-remediation.md) |
| **9** | BFF trust, IDOR/race harden, export/SIEM | `v2.6.0` / `remediation/v2.6.0` | `cycle9-blue-assert.sh` + smoke | [map](../security/Cycle-9/Remediation/v2.6.0-remediation.md) |
| **8** | Intake toolchain harden | `v2.5.0` / `remediation/v2.5.0` | smoke + cycle asserts | [map](../security/Cycle-8/Remediation/v2.5.0-remediation.md) |
| **7** | path confinement, overlays unpublished | `v2.4.0` | smoke | [map](../security/Cycle-7/Remediation/v2.4.0-remediation.md) |
| **6** | SSRF destination policy, CSRF | `v2.3.0` | smoke | [Cycle-6 Remediation](../security/Cycle-6/Remediation/) |
| **5** | cmdi/PrivEsc closed (no product bump) | historical `main` / remediation docs | see Cycle-5 Remediation | [Cycle-5](../security/Cycle-5/Remediation/) |
| **4** | Notes escape, no default SSH | `v2.2.0` | smoke + `assert-ssh-unpublished.sh` | [Cycle-4](../security/Cycle-4/Remediation/) |
| **3** | leak/SQLi closed (no product bump) | remediation docs on archive | see Cycle-3 | [Cycle-3](../security/Cycle-3/Remediation/) |
| **2** | JWT/IDOR harden | `v2.1.0` | smoke | [Cycle-2](../security/Cycle-2/Remediation/) |
| **1** | baseline AuthN/AuthZ/files | `v2.0.0` | smoke | [v2.0.0-remediation](../security/Cycle-1/Remediation/v2.0.0-remediation.md) |

## Showcase tip — Cycle-10 Blue

```bash
git checkout v2.10.0   # or main
cp infra/.env.example infra/.env
./infra/scripts/gen-jwt-keys.sh
docker compose -f infra/docker-compose.prod.yml \
  -f infra/docker-compose.cycle10-lab.yml up -d --build
./infra/cycle10-blue-assert.sh
./infra/cycle10-blue-reachability.sh
```

App: **`https://localhost/`** (`:443` + `:80`→301).  
Baseline: [security-baseline.md](../spec/security-baseline.md) · ADR: [ADR-039](../decisions/ADR-039-cycle-10-enterprise-pair.md).

## Prior secure tip (Cycle-9, `:8080`)

```bash
git checkout v2.6.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/cycle9-blue-assert.sh
```

---

Red levels: [red-team.md](red-team.md) · Contract: [readme-contract.md](readme-contract.md) · [INDEX.md](../INDEX.md)
