# Player brief — `ctf/leak-crack-db` (Cycle-3)

**No spoilers.** Full clear requires both flags and the identities below.

| Field | Value |
|-------|--------|
| Branch | `ctf/leak-crack-db` |
| Base | Product tag `v2.1.0` |
| Entry | `http://<lab>:8080` |

---

## Objective

Compromise the lab and recover:

1. **local.txt** — 32-char hex; report with the **app user** identity you used.
2. **proof.txt** — 32-char hex; report with the **Postgres role** you used for the data store.

Both are required. There is one linear path; no bonus flags.

---

## In scope

- The lab host’s HTTP service on **:8080** and any **same-host** services you discover for this stack.
- Credential reuse / cracking of secrets you obtain from this lab only.
- SQL injection testing against in-scope HTTP API parameters.

## Out of scope

- DoS / resource exhaustion.
- Attacking other LAN hosts or the examiner’s tooling.
- Fixing or “hardening” the box mid-run.
- Metasploit RCE, DNS rebind, XSS/SSRF side quests (not this box).

---

## Demo foothold

Low-priv demo account (hashed at rest; cleartext for lab login only):

| Email | Password |
|-------|----------|
| `user@kc.test` | `UserPass123!` |

Use the product UI (Auth → Sharing → My Files). Raw API is allowed once you know the surface.

---

## Deploy (operator)

```bash
git checkout ctf/leak-crack-db
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-leak.yml up -d --build
```

App: `http://127.0.0.1:8080`

---

## Proof rules (OSCP-style)

- Submit **flag body** + **identity** for each proof.
- Do not destroy the box for other players.
- Document your chain for the PenTest writeup.

Ground truth (spoilers) is examiner-only: [v1-leak-crack-db-ground-truth.md](./v1-leak-crack-db-ground-truth.md).
