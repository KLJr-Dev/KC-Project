# Cycle-5 box plan — `ctf/shells-privesc` (shells + PrivEsc)

**Status:** Decisions locked · [cycle-5-decisions.md](cycle-5-decisions.md)  
**Baseline:** tag **`v2.2.0`** · [ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md)  
**Consumes:** FC-14 (shells / PrivEsc) · **Not:** FC-13  
**Difficulty:** Medium HTB / junior-exam with rabbit holes  

---

## One-liner

Blank-slate CTF: **interesting foothold** → **stable / reverse shell** → enum (1 path + ~2 decoys) → **sudo PrivEsc** → `root.txt`. No SoftDev version bump. No docker escape.

## Architecture

```text
main @ v2.2.0 (secure) — unchanged product tip
  └── ctf/shells-privesc
        · CTF-only foothold gadget (fresh service/story; not Notes XSS)
        · SSH overlay host: user foothold + PrivEsc misconfig + decoys
        · Flags: user.txt + root.txt  (OS{32hex})
```

## Player path (intended)

1. Recon web + extra lab surface (blank slate — brief does not assume C4).  
2. Abuse CTF foothold → **reverse shell** (or land then upgrade).  
3. Stabilize TTY / interactive shell; navigate beyond home if needed.  
4. Enum: `sudo -l`, cron, SUID, caps — **one** real vector; decoys waste time.  
5. PrivEsc via primary **sudo** helper-script bug → `root.txt`.  

## Ceiling

- Medium HTB: method + patience, not obscure kernel.  
- Decys exist; success path remains **one** clear PrivEsc class once found.  

## Non-goals

Docker escape · SoftDev `v1.3.0` · re-break Notes XSS · AD · off-box pivot · PrivEsc on default prod compose  

## Blue (later)

`remediation/shells-privesc` — remove foothold gadget + PrivEsc; harden lab image; merge to `main` **without** product tag bump. SSH overlay may remain for future services but must stay lab-only / asserted off default prod.

## Next docs / build

1. ~~P1 fork~~ · ~~P2 design lock~~ — see [cycle-5-decisions.md](cycle-5-decisions.md) § P2 · [GT](shells-privesc-ground-truth.md).  
2. **P3/P4:** `infra/lab-host/` + `kc-agent` + `docker-compose.ctf-shells.yml`.  
3. **P5:** player brief · examiner · `shells-privesc-ctf-ready.md`.
