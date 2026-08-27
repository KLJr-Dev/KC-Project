# Cycle-8 overlay services

| Service | Publish | Role |
|---------|---------|------|
| `cycle8-intake` | none | FastAPI SQLi — `../../intake/` |
| `cycle8-ftp` | `:21` + PASV | LIVE Hydra (`lisa`/`peanut`); F2; www write |
| `cycle8-cowrie` | `:22` | DECOY SSH-looking |
| `cycle8-edge` | via nginx `/www/` | PHP webroot; sudo nano; F3/F4; dual-home |
| `cycle8-samba` | none | Internal `OpsFiles`; lisa/sunshine; F5 |
| `cycle8-mail` | none | Internal IMAP lisa/sunshine; F5 |

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle8.yml up -d --build
./infra/cycle8-examiner.sh
./infra/assert-cycle8-unpublished.sh
```

Optional: `CYCLE8_FTP_PASV_ADDRESS=<box-ip>` in `infra/.env` for Host-Only FTP.

@see [cycle-8-decisions.md](../../docs/security/Cycle-8/Dev/cycle-8-decisions.md)
