# Cycle-9 — locked decisions (P0 **FINAL** 2026-08-31)

**Execution:** [v1.6.0-execution-plan.md](v1.6.0-execution-plan.md) · **Box:** [v1.6.0-box-plan.md](v1.6.0-box-plan.md) · **Gaps:** [v1.6.0-gap-closure.md](v1.6.0-gap-closure.md) · **OpenAPI:** [intake-openapi-stub.yaml](intake-openapi-stub.yaml) · **ADR-038** · **Skin:** [ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)

**Status:** **P0 FINAL (locked)** — SoftDev may start only after this branch merges to `main`. Branch: **`docs/cycle-9-p0`** → PR → `main` → P1 lane reset.

**Anti-patterns (from Cycles 7–8):** no skippable graded flags; no re-break of closed SSRF/CSRF/Notes/Ops LFI/SQLi; no FTP/Cowrie/revshell as primary path; no orphan LIVE secrets; no “production-grade” claim on `v2.6.0`; **no parallel public FastAPI app**.

---

## A. Packaging / versioning

| # | Topic | Locked |
|---|--------|--------|
| 1 | Ship shape | Product expansion pair **`v1.6.0`** → Red → **`v2.6.0`** |
| 1b | Baseline tip | Secure **`v2.5.0`** |
| 1c | Next pair after Blue | **`v1.10.0` → `v2.10.0`** (Cycle-10); versions 1.7–1.9 / 2.7–2.9 **unused** |
| 1d | Deep SIEM / log-analysis Blue Team | **Deferred** to Cycle-11+ / `v*.11+` |
| 2 | Lanes | Reset `backend` / `frontend` / `dev` from `main` at **P1** |
| 3 | Docs | **`docs/cycle-9-p0`** → PR → `main` first |
| 4 | Archive | Tag `v1.6.0` → freeze `ctf/v1.6.0` |
| 5 | Plant packaging | **Baked into tip** — **no** `docker-compose.cycle9.yml` |

```text
main @ v2.5.0
  → docs/cycle-9-p0 → PR → main
  → reset feature lanes
  → backend + frontend + intake (+ infra) → merge → dev → PR → main (intentional insecure)
  → pentest-ready → tag v1.6.0 → ctf/v1.6.0
  → Red (AppSec writeup; Burp-heavy)
  → remediation/v2.6.0 → tag v2.6.0
```

---

## B. Story / teams / immersion

| # | Topic | Locked |
|---|--------|--------|
| 6 | Org story | **Northwind Onboarding** — HR/onboarding requests + Security Ops theatre |
| 6b | **Two teams (explicit)** | **Platform** = Nest/Next (edge, JWT, BFF). **Onboarding squad** = FastAPI `intake/` (Python, ease-of-use microservice). Documented in ADR-038 + READMEs |
| 6c | Product face | Northwind corporate skin on **both** tips ([ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)) |
| 6d | Lab meta | README / USAGE / cycle docs — not the in-app hero |
| 7 | Path | Recon → header trust → request IDOR → race approve → **export path traversal** → SIEM leak |
| 7b | Decoy | `GET /api/intake/v1/internal/debug` → **“services alerted”**; optional; no graded flag |
| 8 | Infra chain | **Out** — no FTP, Cowrie, revshell, PrivEsc, Samba, SMTP plants |
| 8b | Prior closed | Stay closed — Preview SSRF, bookmark CSRF, Notes XSS, **Ops Documents LFI**, Intake SQLi |

---

## C. Edge topology (locked — changes v2.5.0)

**Today (`v2.5.0`):** `nginx /api/intake/` → FastAPI directly.

**Cycle-9 (`v1.6.0` / `v2.6.0`):**

```text
Browser
  → nginx :8080
    → Nest (Platform BFF)  /api/intake/*
         │  verifies JWT (Nest)
         │  insecure tip: sets X-User-Id, X-User-Role from claims
         │  thin proxy only — no Nest business logic for requests
         ▼
       FastAPI Intake (Onboarding squad)  :8000  [NOT published on nginx]
         │  insecure: trusts X-User-* headers
         │  Blue: verifies RS256 with mounted jwt-public.pem; ignores spoof headers
         ▼
       Postgres kc_intake
```

| # | Service | Publish to Kali | Notes |
|---|---------|-----------------|-------|
| 9 | nginx + Nest/Next | `:8080` | All `/api/intake/*` → **Nest BFF**, not FastAPI |
| 10 | FastAPI Intake | **internal only** | Reachable from Nest network; no public product port |
| 11 | Postgres | **none** | `kc_prod` + `kc_intake` |
| 12 | TLS overlay | optional `:8443` | Not graded |

Compose: **`docker-compose.prod.yml` only**. No cycle9 overlay.

**Blue JWT key:** mount same `infra/keys/jwt-public.pem` into Intake (`JWT_PUBLIC_KEY_PATH`) — shared IdP story.

### Microservice hard rules (not a parallel product)

| Rule | Locked |
|------|--------|
| One published API face | Browser only talks to **nginx → Nest**. FastAPI is upstream of Nest, never a second `:port` product. |
| Path prefix | All Intake traffic under **`/api/intake/*`** (Nest controller/proxy). |
| Source of truth | FastAPI owns onboarding-requests / export / events **data**. Nest does not duplicate DB writes. |
| UI | Next calls Nest (`/api/...`) only — never `http://intake:8000` from the browser. |
| Health | **Removed** Nest + Intake HTTP `/health` (Cycle-9 SoftDev). Reachability = `/api/ping`. |
| v2.5.0 break | SoftDev **must** remove nginx `proxy_pass http://intake:8000` for `/api/intake/`. |

### Logging / weak defence (final split)

| Layer | Owner | Insecure `v1.6.0` | Blue `v2.6.0` |
|-------|-------|-------------------|---------------|
| Auth JSON stdout | Nest (`logging.util`) | Keep; does **not** cover Intake mutations | Keep + `X-Request-Id` |
| `audit_logs` table | Nest admin | Keep for Nest-native actions; **misses** Intake header-forged approvals | Optional: record BFF forwards; Intake still logs its own events |
| **SIEM feed** `/security/events` | **FastAPI** (bolted-on) | **Graded plant F4** — leaks fragments; incomplete coverage narrative | Redact + authz; no secrets |
| Security posture UI | Nest `/admin/security` | Theatre (green lies) → links to events via BFF | Honest or removed |
| Correlation | Both | Weak / missing | **`X-Request-Id`** Nest → Intake; both log it (Wave B) |

**Pedagogy:** Platform looks monitored; Onboarding squad’s feed is where secrets go. Deep log-analysis Blue Team stays Cycle-11+.

### Header spoof SoftDev lock (was open)

**Insecure BFF:** if the client sends `X-User-Id` / `X-User-Role`, **forward them as-is**; else fill from verified JWT claims. Easy Burp demo of hop trust.  
**Blue BFF:** never forward client `X-User-*`; forward `Authorization: Bearer` only (or strip identity headers entirely). Intake verifies RS256 and ignores `X-User-*`.

---

## D. Dependency DAG (non-negotiable)

```text
Recon (Burp / httpx / gobuster — hygiene)
  ├─ NOISE: staff search / sequential IDs / demo login
  ├─ NOISE: /admin/security (green theatre)
  ├─ DECOY: GET /api/intake/v1/internal/debug → "services alerted"
  ▼
G1  Auth as user (demo or open registration)                         (no flag)
G2  IDOR GET …/onboarding-requests/{id} → PII + queue hint           → F1
G3  Spoof X-User-Id / X-User-Role via BFF/header path → mod action   → F2
G4  Parallel PUT …/onboarding-requests/{id}/status → approved        (gate)
G5  GET …/export?file= + path traversal (../, %2e%2e%2f, …)          → F3
G6  GET …/security/events → leak fragment                            → F4 ★
STOP
```

### Chain rules

1. **F3** requires **approved** request (via race **or** header-trust mod approve) **then** path traversal on export. Race alone is not enough; traversal alone against pending must fail.  
2. **F1** reachable after G1 alone (IDOR).  
3. **No** John/Hydra/sqlmap DoD. Tools: Burp (+ Turbo/race), curl path encoding, optional httpx.  
4. Honeypot: obvious after hit; **no** `OS{`.  
5. **DEMO** unlocks G1 only.  
6. **Ops LFI stays closed** — traversal plant is **new** on Intake export only.

### Flags (examiner — values at P2)

| ID | Placeholder | Gate |
|----|-------------|------|
| F1 | `OS{833b0578fcd6f6442121e8c7a9724376}` | Onboarding-request IDOR body |
| F2 | `OS{11ec516803539a84dafeef8c8e151aa2}` | After header-trust privilege |
| F3 | `OS{6a5c5e3477552175a94374689243b859}` | File reached via export path traversal post-approve |
| F4 | `OS{e5f9b003b8e5e02b2b9ebb8bc1971abf}` | `/security/events` leak |
| D1 | — | Honeypot — “services alerted” |

---

## E. Product / plants / auth

| # | Topic | Locked |
|---|--------|--------|
| 13 | Resource name | **`/onboarding-requests`** (UI: Onboarding / HR requests) |
| 14 | Intake keep | Parameterized `GET /search` — **do not** re-plant SQLi |
| 15 | Auth plant | Nest BFF injects `X-User-Id`, `X-User-Role`; Intake **trusts** them |
| 16 | Blue auth | Intake **verifies RS256** (public PEM); reject/ignore spoofed headers |
| 17 | IDOR plant | `GET /onboarding-requests/{id}` — no owner/dept check |
| 18 | Race plant | `PUT /onboarding-requests/{id}/status` RMW — **only** race locus |
| 19 | Export plant | `GET /onboarding-requests/{id}/export?file=` — **path traversal** after approved (curl `../`, `%2e%2e%2f`, nested) |
| 20 | SIEM plant | FastAPI `GET /security/events` — graded leak (Onboarding squad “bolted on” monitoring) |
| 21 | Theatre | Nest `/admin/security` — static green checks; **noise** |
| 22 | Nest BFF | **Thin only** — no Nest business logic for requests; FastAPI is SoT |
| 23 | Nest file approve | **Stay secure** |
| 24 | Greppable markers | `CYCLE9-PLANT` / `CYCLE9-DECOY` / `CYCLE9-THEATRE` |
| 25 | Request fields | Lab-fake: `employee_email`, `department`, `national_id_last4`, `manager_note` |

### API sketch (authoritative stub: [intake-openapi-stub.yaml](intake-openapi-stub.yaml))

**FastAPI (internal; public via Nest BFF under `/api/intake/`):**

| Method | Path | Insecure behaviour |
|--------|------|--------------------|
| GET | `/search` | Parameterized; staff enum (noise) |
| GET | `/onboarding-requests` | Weak scoping / header role |
| GET | `/onboarding-requests/{id}` | **IDOR** → F1 |
| POST | `/onboarding-requests` | Submit request |
| PUT | `/onboarding-requests/{id}/status` | **Race** + header-trust mod → F2 + unlock export |
| GET | `/onboarding-requests/{id}/export` | Query `file=` — **path traversal** → F3 |
| GET | `/security/events` | **SIEM leak** → F4 |
| GET | `/security/metrics` | Vanity (noise) |
| GET | `/v1/internal/debug` | **DECOY** — services alerted |

**Nest / Next (Platform):**

| Surface | Role |
|---------|------|
| BFF `/api/intake/*` | JWT check; forward + inject `X-User-*` (insecure); strip on Blue or pass Authorization only |
| `/intake` | Search + my requests + submit |
| `/intake/queue` | Mod/admin approval UI |
| `/admin/security` | Posture theatre → events link |

---

## F. Blue / `v2.6.0` — Wave A vs Wave B

### Wave A — must-close (Cycle-9 plants)

| ID | Close |
|----|-------|
| C9-F01 | Ownership / role on onboarding-requests (IDOR) |
| C9-F02 | Intake RS256 verify; ignore spoof headers |
| C9-F03 | Atomic status transition |
| C9-F04 | Export path confinement (resolve + base-dir check; encoding-safe) |
| C9-F05 | Security events redacted + authz |
| C9-F06 | Honeypot off / non-prod; posture honest or removed |

### Wave B — ~80% gap closure

| Item | Action |
|------|--------|
| Intake least-priv DB | `kc_intake_app` |
| nginx rate limit | `limit_req` on `/api/intake/` |
| Non-root | `USER 1001` backend + intake |
| Internal DB network | `internal: true` |
| Default secrets | `assert-no-default-secrets.sh` |
| Request correlation | `X-Request-Id` Nest ↔ Intake |
| CPU/mem | limits where missing |

### Accepted residuals on `v2.6.0`

HTTP `:8080` · demo passwords / lab UI · sequential IDs · open registration · CSP `unsafe-*` · self-signed certs · JWT keys in repo · CORS localhost · Ops handbook model · Docker Secrets / RO fs / TLS-only / strict CSP / demo strip → **Cycle-10**

---

## G. Pedagogy / tools / writeup

| # | Topic | Locked |
|---|--------|--------|
| 26 | Duration | ~4–6 hours medium web |
| 27 | Tool DoD | Burp (+ race) · **curl path traversal / encoding** · optional httpx |
| 28 | Writeup | AppSec / OWASP findings table |
| 29 | Brief | Progressive hints; honeypot not spoiled as “ignore” |
| 30 | Defence depth | One graded SIEM leak; deep log analysis → Cycle-11+ |

---

## H. Security SDL

1. P0 FINAL → PR `docs/cycle-9-p0`  
2. P1 reset lanes from `v2.5.0`  
3. P2 Nest BFF + Intake onboarding-requests + race + export PT + SIEM  
4. P3 Frontend onboarding + queue + security posture  
5. P4 `dev` · P5 tag `v1.6.0`  
6. P6 PenTest · P7 Blue `v2.6.0`

---

## I. Consumes / out

| ID | Status |
|----|--------|
| FC-05 | Race on request status — **Planned** |
| FC-12 | IDOR on onboarding-requests — **Planned** |
| Export path traversal | New object (not Ops) — **Planned** (FC-18 class, new surface) |
| Logging / SIEM leak | **Planned** |
| FC-04 | Decoy only if used |
| Out | SQLi re-plant · Ops LFI re-break · FTP/Cowrie/shell · SSRF/CSRF/Notes re-break · cycle9 overlay · graded TLS · public FastAPI port · full SIEM curriculum |

---

## J. Grill locks

### Grill-1 (2026-08-31)

| # | Locked |
|---|--------|
| 1 Domain | Onboarding / HR |
| 2 Flags | 4 graded + honeypot |
| 3 Spine | auth → IDOR → race → SIEM |
| 4 Auth plant | header trust |
| 5 Blue auth | Intake RS256 |
| 6 Race | status only |
| 7 Wave B | scoped A |
| 8 Defence | one SIEM + theatre |
| 9 Packaging | tip-baked |
| 10 Residuals | HTTP + demo + IDs + open reg + CSP |

### Grill-2 (2026-08-31) — microservice / SoftDev detail

| # | Locked |
|---|--------|
| 1 Edge | **A** Nest BFF → FastAPI; nginx does **not** publish Intake direct |
| 2 Teams | **A** Platform (Nest/Next) vs Onboarding squad (FastAPI) explicit |
| 3 Resource | **B** `/onboarding-requests` |
| 4 SIEM owner | **A** FastAPI `/security/events` |
| 5 Honeypot | **A** `GET /v1/internal/debug` → services alerted |
| 6 PII fields | **A** email, dept, national_id_last4, manager_note |
| 7 Export | **A** separate export + **path traversal practice** (`../`, `%2e%2e%2f`, …) → F3 |
| 8 Nest role | **A** thin BFF only |
| 9 Blue key | **A** mount `jwt-public.pem` into Intake |
| 10 P0 deepen | **B** OpenAPI stub before SoftDev |

### Grill-3 (2026-08-31) — final SoftDev lock

| # | Locked |
|---|--------|
| 1 Microservice | FastAPI **feeds Nest** (upstream only); **not** a parallel public product |
| 2 Logging | Nest auth/audit stay; FastAPI owns graded `/security/events`; posture = Nest theatre |
| 3 Spoof | Insecure BFF **forwards client `X-User-*` if present**, else JWT claims |
| 4 SoftDev gate | No feature-lane code until `docs/cycle-9-p0` is on `main` |
