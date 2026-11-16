# Postgres TLS material (lab)

Generate with:

```bash
./infra/scripts/gen-db-tls.sh
```

Produces CA + server cert/key under this directory. **Private keys are gitignored.**  
Enable with `DB_SSL=true` and mount `ca.crt` into Nest/Intake (`DB_SSL_CA_PATH`).
