# Security Cycle 5 — Shells & PrivEsc

**Status:** **Sketch** · Cycle-4 Blue done — plan from tag **`v2.2.0`**  
**Versions (locked):** **`v1.3.0`** (insecure) → Red → **`v2.3.0`** (secure)  
**Depends on:** Cycle-4 SSH foothold ([../Cycle-4/Dev/v1.2.0-box-plan.md](../Cycle-4/Dev/v1.2.0-box-plan.md); replay on `ctf/v1.2.0`)

| Track | Intent |
|-------|--------|
| Lab depth | SSH image lineage with **intentional** PrivEsc + shell tradecraft |
| Web | Reuse Notes; optional small plant — not a second SoftDev epic unless needed |
| Versioning | SoftDev pair `v1.3.0`/`v2.3.0` (stakeholder lock) — see [Dev sketch](Dev/shells-privesc-sketch.md) |

---

## One-line story

Foothold (Cycle-4) → **stable shell** → enum → **PrivEsc** → `root.txt` (`OS{…}`). Blue hardens jump host; still no SSH on secure day-to-day compose.

## Why after Cycle-4

- C4: get to SSH logically + loot files  
- C5: OSCP-weight post-ex without bloating Notes SoftDev  

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Sketch now; full box plan next (Blue `v2.2.0` already shipped) |
| PenTest/ · Remediation/ | Create when C5 starts |

## References

- [shells-privesc-sketch.md](Dev/shells-privesc-sketch.md)  
- FC-13 / FC-14 depth — [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)
