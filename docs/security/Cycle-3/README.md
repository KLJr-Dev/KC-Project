# Security Cycle 3 — leak-crack-db

**Status:** **Closed** · Red frozen on `ctf/leak-crack-db` · Blue merged to `main` (PR #20) · frozen `remediation/cycle-3-leak-crack-db`

| Track | Role | Status |
|-------|------|--------|
| `v2.1.0` / `main` | Secure product | Baseline + Cycle-3 regression |
| **`ctf/leak-crack-db`** | CTF + Red writeup | **Frozen** (do not merge CTF into main) |
| **`remediation/cycle-3-leak-crack-db`** | Blue close-out archive | **Frozen** after merge |

**Policy:** No product version bump ([ADR-032](../../decisions/ADR-032-post-v2.1.0-versioning.md)).

---

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Player / try the box** | branch `ctf/leak-crack-db` → Dev player brief | No |
| **Read the engagement** | `ctf/leak-crack-db` → [PenTest writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/leak-crack-db/docs/security/Cycle-3/PenTest/v1-leak-crack-db-writeup.md) | Yes |
| **Blue Team** | [Remediation/](Remediation/) on `main` | Yes |

## Chain closed on secure (one line)

Login → Sharing plant → SQLi `q` → John → published PG — **all CTF-only**. Secure prod compose + Nest path reject the chain (see fix map).

## Team folders

| Folder | Purpose |
|--------|---------|
| [Remediation/](Remediation/) | Fix map, Blue plan, residuals, secure-ready gate |
| Red / Dev / PenTest screenshots | Live on **`ctf/leak-crack-db` only** (frozen) |

## References

- Cycle-2: [../Cycle-2/README.md](../Cycle-2/README.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)
