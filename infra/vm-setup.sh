#!/usr/bin/env bash
# v1.0.0 — Ubuntu VM provisioning for KC-Project Docker stack
set -euo pipefail

REPO_URL="${KC_REPO_URL:-}"
INSTALL_DIR="${KC_INSTALL_DIR:-/opt/kc-project}"

echo "==> Installing Docker..."
curl -fsSL https://get.docker.com | sh
usermod -aG docker "${SUDO_USER:-$USER}" 2>/dev/null || true

if ! docker compose version &>/dev/null; then
  echo "Docker Compose plugin required (Docker Desktop or docker-compose-plugin package)."
  exit 1
fi

if [[ -n "$REPO_URL" && ! -d "$INSTALL_DIR/.git" ]]; then
  echo "==> Cloning repository to $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

if [[ -d "$INSTALL_DIR" ]]; then
  cd "$INSTALL_DIR"
  chmod +x infra/*.sh 2>/dev/null || true
  if [[ ! -f infra/.env ]]; then
    cp infra/.env.example infra/.env
  fi
  echo "==> Starting production stack..."
  docker compose -f infra/docker-compose.prod.yml up -d --build
  echo "==> Running smoke test..."
  ./infra/smoke-test.sh
  echo "==> Running journey test..."
  ./infra/journey-test.sh
  echo "Done. App: http://$(hostname -I | awk '{print $1}'):8080"
else
  echo "Clone KC-Project to $INSTALL_DIR, then run:"
  echo "  cd $INSTALL_DIR && docker compose -f infra/docker-compose.prod.yml up -d --build"
  echo "  ./infra/smoke-test.sh"
fi
