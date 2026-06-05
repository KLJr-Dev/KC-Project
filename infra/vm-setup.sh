#!/usr/bin/env bash
# v0.7.2 — Ubuntu VM provisioning script
set -euo pipefail

echo "Installing Docker..."
curl -fsSL https://get.docker.com | sh
usermod -aG docker "${USER:-kc}" || true

echo "Clone KC-Project and start stack:"
echo "  git clone <repo-url> /opt/kc-project"
echo "  cd /opt/kc-project && docker compose -f infra/docker-compose.prod.yml up -d --build"
