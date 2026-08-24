# Cycle-2 Remediation

Blue Team track for **v2.1.0** (secure parallel after Cycle-2 CTF).

| Doc | Purpose |
|-----|---------|
| [v2.1.0-remediation.md](v2.1.0-remediation.md) | Full finding → fix map (Cycle-1 depth); waves; fork-ready end-state |
| [blue-team-plan.md](blue-team-plan.md) | Milestones M0–M4, DoD, gate scripts |
| [accepted-residuals-v2.1.0.md](accepted-residuals-v2.1.0.md) | Bucket A — accepted lab residuals |
| [future-ctf-candidates.md](future-ctf-candidates.md) | Bucket B — next CTF surfaces (do not leave open on secure) |
| [v2.1.0-secure-ready.md](../../../release/v2.1.0-secure-ready.md) | Tag gate (scaffold; sign after M1–M4) |

**Important:** Implement on branch `remediation/v2.1.0` forked from **`main` / tag `v2.0.0`**, not by “fixing” `ctf/v1.1.0`. The CTF branch stays replayable.

**v2.1.0 in one line:** regression-lock Cycle-2 chain + TLS/LAN policy + least-priv DB + catalogs — not a second baseline rewrite. Headers/TLS stack already shipped in Cycle-1. Tag = secure fork point for Cycle-3.

**M0–M4 status:** Plan + catalogs + implementation + gate **done**. Tag/merge when operator asks.

Parent: [../README.md](../README.md) · Source writeup: [../PenTest/v1.1.0-writeup.md](../PenTest/v1.1.0-writeup.md) (on `ctf/v1.1.0`)
