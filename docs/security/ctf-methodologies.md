# CTF exam methodologies (reference)

Design notes for KC security cycles. Use when scoping a new box, scoring model, or player brief.

**Primary inspiration today:** OSCP / OSCP+ exam layout (Offensive Security).  
**Current implementation:** [Cycle-2 v1.1.0](Cycle-2/Dev/v1.1.0-box-plan.md) — single web app, three OSCP-shaped proofs.

---

## OSCP+ exam structure (reference)

Source: OSCP+ exam machine breakdown (2026). Treat as **one** industry pattern, not a requirement.

### Machine layout

| Segment | Machines | Points | Proof split |
|---------|----------|--------|-------------|
| **Stand-alone set** | 3 independent boxes | **60** (20 each) | 10 initial access + 10 priv esc per box |
| **Active Directory set** | 3 chained hosts | **40** total | 10 + 10 + 20 (machine #3 is the capstone) |

**Total:** 100 points · **Pass threshold:** 70

### AD set entry condition

Learners receive **username + password** up front — simulates post-breach lateral movement, not cold external recon on AD.

### Flag types (OSCP culture)

| Flag | Typical locus | Tier |
|------|---------------|------|
| **local.txt** | User home / low-priv shell | Initial access (foothold) |
| **proof.txt** | `/root` or equivalent | Privilege escalation (root/admin) |

Valid submission = **identity proof** (`whoami`, session context) **and** exact flag body. Hash alone is invalid.

### Passing combinations (70 / 100)

Any one path is enough to pass:

1. **Full AD (40)** + **3× local.txt** (30) = 70  
2. **Full AD (40)** + **2× local.txt** (20) + **1× proof.txt** (10) = 70  
3. **Partial AD (20)** + **3× local.txt** (30) + **2× proof.txt** (20) = 70  
4. **Minimal AD (10)** + **3× stand-alone machines complete** (60) = 70  

Implications for KC design:

- **Modular scoring** — players can specialize (AD chain vs standalone priv esc).
- **Tiered proofs** — user flag ≠ root flag; both matter for full machine credit.
- **Partial credit** — AD machine 1/2/3 and standalone local vs proof are independently scoreable.

---

## KC mapping — Cycle 2 v1.1.0 (today)

Single product surface (Nest/Next/Postgres/nginx), **not** four separate VMs. OSCP *proof culture*, simplified topology.

| OSCP concept | KC v1.1.0 analogue |
|--------------|-------------------|
| Initial access + `local.txt` | Low-priv JWT + read **local.txt** (file 9104) |
| Priv esc + `proof.txt` | Admin session + read **proof.txt** |
| Machine / service root | Admin-gated **DB row** (`current_user` + SELECT) |

**Flags:** 3 × 32-char hex · **Scoring:** not yet weighted like OSCP (binary “got all proofs” for lab playtest).

See [v1.1.0-box-plan.md](Cycle-2/Dev/v1.1.0-box-plan.md) for attack path and plants.

---

## Future KC directions (backlog)

Pick one or mix per cycle. Document choice in the cycle’s box plan.

### A. OSCP-like multi-box (scale up)

- 3 standalone compose stacks or VLAN segments, 20 pts each.
- Optional AD-style chain: cred drop → lateral → domain admin analogue.
- Examiner sheet with point matrix (local / proof per host).

### B. Single-box depth (current path)

- One app, multiple privilege tiers (user → admin → DB/service).
- Cheaper to run; good for first CTF and CI e2e.
- Add SSH sidecar later for literal `whoami` + `cat` proofs.

### C. Alternate exam formats (not OSCP)

| Format | Notes |
|--------|--------|
| **Jeopardy** | Flat flag categories (web, crypto, forensics); no priv-esc chain required |
| **Attack-defence** | Blue team hardens between rounds; scoring for steals + uptime |
| **Red team / objective** | “Exfil document X” vs proof files; narrative scoring |
| **HTB / CTFd** | Submit flag string only; identity proof optional |

When adopting a format, update player brief + examiner checklist + whether [ground truth](Cycle-2/Dev/v1.1.0-ground-truth.md) includes scoring weights.

---

## Design checklist (new cycle)

1. **Topology** — single box, N boxes, or AD chain?  
2. **Entry** — cold start vs cred drop?  
3. **Proof rules** — identity + flag body (OSCP) vs flag-only?  
4. **Points** — pass threshold and partial credit matrix?  
5. **Surface** — web only vs SSH/FTP/DB exposed to nmap?  
6. **Scope** — which Cycle-1 findings stay closed vs intentionally re-opened?

---

## References

- [Cycle-2 README](Cycle-2/README.md) — active CTF workspace  
- [v1.1.0 player brief](Cycle-2/Dev/v1.1.0-player-brief.md) — no spoilers  
- [ADR-031](../decisions/ADR-031-security-cycle-docs.md) — security cycle doc layout
