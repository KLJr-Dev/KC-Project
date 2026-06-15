# VM Deployment (v1.0.0)

Ubuntu 22.04+ with Docker. **Primary stack:** `infra/docker-compose.prod.yml` (postgres, backend, frontend, nginx on `:8080`).

Cycle-1 deploy verification: [Cycle-1/README.md](../security/Cycle-1/README.md) · ground truth: [Cycle-1/Dev/v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md)

## Quick setup

```bash
export KC_REPO_URL=https://github.com/YOUR_ORG/KC-Project.git
export KC_INSTALL_DIR=/opt/kc-project
sudo ./infra/vm-setup.sh
```

Or manually:

```bash
curl -fsSL https://get.docker.com | sh
git clone <repo-url> /opt/kc-project
cd /opt/kc-project
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
```

App: `http://<vm-ip>:8080`

## Persistence

Volumes `pgdata_prod` and `uploads` survive `compose down`. Demo users re-seed idempotently on migration run.

## Verification

- `./infra/smoke-test.sh` — health, login, upload, list
- `./infra/journey-test.sh` — all demo roles + share-1 + IDOR baseline
- `./infra/e2e-docker.sh` — 150 e2e tests against Docker `kc_prod`
- [pentest-journeys.md](pentest-journeys.md) — manual exploit chains for Cycle 1
