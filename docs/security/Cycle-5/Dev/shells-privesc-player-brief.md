# Cycle-5 player brief — `ctf/shells-privesc` (shells → PrivEsc)

**Audience:** Red players / students  
**Spoilers:** Progressive hints only — no flag values, no passwords, no exact exploit strings.  
**Examiner GT:** [shells-privesc-ground-truth.md](shells-privesc-ground-truth.md)  
**Branch:** `ctf/shells-privesc` · baseline tag **`v2.2.0`** (no SoftDev product bump)

---

## Objective

Obtain a **stable interactive shell**, recover **user** and **root** flags (`OS{` + 32 lowercase hex + `}`).

| Flag | Theme |
|------|--------|
| `user.txt` | After foothold + light enum (may not be in `~`) |
| `root.txt` | After the intended PrivEsc |

Primary graded skills: reverse / stable shell tradecraft + a reproducible writeup.

## Lab start (operator)

```bash
git checkout ctf/shells-privesc
cp infra/.env.example infra/.env   # if needed
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
```

- App (context): `http://localhost:8080`
- Look beyond the web port — this box adds a **lab host** surface
- Product Notes on this tip stay **hardened** (not the foothold)

## Rules of engagement

**In scope:** lab-host services published by the CTF overlay; shell upgrades; local PrivEsc on that host.

**Out of scope:**

- Docker escape / privileged mount abuse
- Kernel exploit as sole path
- Published Postgres / attacking other hosts
- DoS
- “Fixing” the box mid-run
- Re-breaking Notes XSS (not this cycle’s story)

## Progressive hints

<details>
<summary>Hint 1</summary>
Scan more than TCP/8080. The overlay publishes additional lab-host ports.
</details>

<details>
<summary>Hint 2</summary>
One open HTTP service looks like an ops reachability / health helper. Read its JSON carefully.
</details>

<details>
<summary>Hint 3</summary>
Parameters that end up in shell commands are classic injection sinks. Aim for a reverse shell, then stabilize a TTY.
</details>

<details>
<summary>Hint 4</summary>
Flags and PrivEsc clues may live outside your home directory. Enumerate like an exam box (`sudo -l`, cron, SUID) — expect decoys.
</details>

<details>
<summary>Hint 5 (almost spoiler)</summary>
One sudo-allowed helper script is mis-permissioned. Rabbit holes (cron / shiny SUID) should fail cleanly once you check ownership and behavior.
</details>

## Operator notes (listeners)

If your reverse shell target is the Docker host, ensure the container can reach your listener (e.g. host IP on the Docker bridge, or `host.docker.internal` where supported). Document the IP/port you used in the writeup.

## Deliverable

Writeup: recon → foothold → stable shell → enum (incl. dead ends tried) → PrivEsc → both flags. Someone with adequate skill should be able to recreate the path from your notes.
