# JWT RS256 keys (lab / tip)

Generate before first prod/lab bring-up:

```bash
./infra/scripts/gen-jwt-keys.sh
```

- `jwt-public.pem` — may be committed (verification only).
- `jwt-private.pem` — **gitignored**; mounted via Compose `secrets:` at `/run/secrets/jwt_private`.

Rotate before any real (non-lab) deployment. Never reuse lab keys outside this repo.
