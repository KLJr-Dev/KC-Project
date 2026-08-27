# Cycle-8 overlay services (infra/cycle8/)

| Service | Role | Status |
|---------|------|--------|
| (compose) `cycle8-intake` | FastAPI Intake SQLi — see `../../intake/` | **P2a** |
| ftp / edge / cowrie / samba / smtp | Tool-forced DAG overlays | Pending P2b |

Start:

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle8.yml up -d --build
curl -sS 'http://localhost:8080/api/intake/health'
curl -sS 'http://localhost:8080/api/intake/search?q=lisa'
```

@see [cycle-8-decisions.md](../../docs/security/Cycle-8/Dev/cycle-8-decisions.md)
