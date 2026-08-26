# Accepted residuals — Cycle-5 Blue

After closing C5-F01 / C5-F02 on the secure tip.

| ID | Residual | Disposition |
|----|----------|-------------|
| R-C5-01 | Optional lab-host SSH on `:2222` via overlay | **Accepted** — lab noise / future CTF realism; never on default prod (`assert-ssh-unpublished`) |
| R-C5-02 | Weak/local password on hardened `lab` user | **Accepted** — overlay-only; not documented as a product foothold; operator may rotate or disable password auth |
| R-C5-03 | Frozen CTF branch still exploitable | **By design** — replay archive (`ctf/shells-privesc`) |
| R-01 | Loopback HTTP without TLS | Pre-existing (Cycle-2+) — use TLS overlay for LAN demos |

Parent: [blue-team-plan.md](blue-team-plan.md)
