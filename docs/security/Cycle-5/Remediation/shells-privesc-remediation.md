# Remediation Report — Cycle-5 `ctf/shells-privesc`

**Cycle:** 5 · **Source pentest:** [`ctf/shells-privesc` writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md)  
**Harden from:** secure tip **`v2.2.0` / `main`**  
**Branch:** `remediation/shells-privesc`  
**Status:** In progress — CTF plants never land on secure tip; hardened lab noise optional  
**Product version bump:** none ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md))

---

## Finding → fix map

| ID | Severity | Secure expectation | How verified on this branch |
|----|----------|--------------------|-----------------------------|
| **C5-F01** | Critical | No `kc-agent` command injection / no `:8787` on default tip | Vulnerable agent only on frozen `ctf/shells-privesc`; tip `lab-host` image has **no** agent; prod asserts reject `:8787` |
| **C5-F02** | High | No sudo NOPASSWD on user-writable script | Tip `lab-host` has **no** sudoers plant / no writable backup PrivEsc |
| **C5-F03** | Info | SSH `:2222` lab-only overlay | Optional `docker-compose.lab-host.yml` / legacy `docker-compose.ssh.yml`; `assert-ssh-unpublished.sh` |
| **C5-N01** | — | Cron / SUID decoys were CTF design | Not shipped on secure tip |

---

## What Blue keeps (noise / future CTFs)

| Keep | Why |
|------|-----|
| Optional **`:2222` lab-host overlay** | Realism / future noise (FTP etc. can join later); **not** default prod |
| Cycle-4 `docker-compose.ssh.yml` + `infra/ssh/` | Frozen SoftDev replay |

| Do not bring to `main` | Why |
|------------------------|-----|
| `kc-agent` / `:8787` | C5-F01 |
| Writable sudo `backup.sh` + flags | C5-F02 |
| `docker-compose.ctf-shells.yml` as tip default | CTF-only on frozen branch |

Future boxes: fork `ctf/<scenario>` again; may **add** ports for that scenario or leave tip SSH noise alone.

---

## What Blue does *not* do

- Merge vulnerable CTF compose/agent into `main`  
- “Fix” code on frozen `ctf/shells-privesc`  
- Bump `vX.Y.Z` for this cycle  

---

## Acceptance checklist

1. [x] Red evidence frozen on `ctf/shells-privesc`  
2. [x] Branch `remediation/shells-privesc` from `main`  
3. [x] C5-F01/F02 closed on secure path (verified)  
4. [x] Asserts: `assert-pg-unpublished` + `assert-ssh-unpublished`  
5. [x] Remediation docs + secure-ready via PR to `main` (#25)  
6. [x] No product version bump  

---

## Short / medium / long

### Short term
Secure demos: prod alone (no lab overlay) or TLS profile. Never advertise tip as needing `:8787`.

### Medium term
If a future SoftDev cycle needs a jump host story: plant on SoftDev tip intentionally; keep asserts on default prod.

### Long term
Next CTF = new `ctf/<scenario>` ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md)). Freeze this remediation branch after merge.
