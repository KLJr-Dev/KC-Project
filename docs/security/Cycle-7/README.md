# Security Cycle 7 — Multi-service story box (`v1.4.0` → `v2.4.0`)

**Status:** **Stub** — folder scaffold. Tip baseline **`v2.3.0`** shipped; design + build next.  
**Versions (planned):** intentional insecure **`v1.4.0`** → long Red → hardened **`v2.4.0`**  
**Ceiling (intent):** Biggest product box yet — multi-service recon (web + FTP + real SSH), decoys, multi-day Red. **Not** a same-day micro CTF.

| Track | Role | Status |
|-------|------|--------|
| Docs scaffold | This tree | **Done** |
| Design (ADR / decisions / box / GT / brief) | Next | Pending |
| Feature build | `v1.4.0` tip | Pending |
| PenTest | Long Socratic Red | Pending |
| Blue | `remediation/v2.4.0` → tag `v2.4.0` | Pending |

---

## One-line story (draft — unlock in decisions later)

KC product edge plus forgotten FTP and a bastion; one SSH face may be a honeypot decoy; graded path uses real services and enum discipline (nmap / Nikto / Hydra / etc.).

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, player brief (TBD) |
| [PenTest/](PenTest/) | Writeup, notes, screenshots |
| [Remediation/](Remediation/) | Finding → fix map after Red |

## Do not

- Fill GT / flags / ports here until design PR after Cycle-6 Blue  
- Start compose overlays or Cowrie until design sign-off  
- Merge CTF plants into the secure tip

## References

- Finish first: [Cycle-6](../Cycle-6/README.md) → `v2.3.0`  
- Bucket B: [future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md) (FC-14 FTP, FC-17, …)  
- Cowrie (decoy candidate only): https://github.com/cowrie/cowrie  
