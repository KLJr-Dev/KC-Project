# Infrastructure

Deployment topology for v1.0.0 (intentionally insecure) and v2.0.0 (hardened). The v1.0.0 setup maximises attack surface through deliberate misconfigurations. v2.0.0 remediates every issue while preserving the same functional behaviour.

---

## v1.0.0 -- Direct Exposure (Intentionally Insecure)

No reverse proxy. All containers expose ports directly to the VM's host network. The database is reachable from the internet. Containers run as root with no resource constraints.

### Topology

```mermaid
flowchart TD
  subgraph vm ["Ubuntu VM (public IP)"]
    subgraph compose ["docker-compose (default bridge network)"]
      FE["frontend\nNext.js\n0.0.0.0:3000\nroot user\nno resource limits"]
      BE["backend\nNestJS\n0.0.0.0:4000\nroot user\nno resource limits\nhardcoded secrets"]
      PG["postgres\n0.0.0.0:5432\nuser: postgres\npassword: postgres\nno connection limits"]
      UploadsVol["volume: ./uploads\nhost-mounted\nworld-readable\nno path validation"]
      PGDataVol["volume: pgdata\nunencrypted\nno backups"]
    end
  end

  Internet["Internet"] -->|"HTTP :3000"| FE
  Internet -->|"HTTP :4000"| BE
  Internet -->|"TCP :5432\n(direct DB access)"| PG

  FE -->|"HTTP (internal bridge)"| BE
  BE -->|"TCP (internal bridge)"| PG
  BE --- UploadsVol
  PG --- PGDataVol
```

### docker-compose sketch (v1.0.0)

```yaml
version: "3"
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"           # exposed to 0.0.0.0
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000

  backend:
    build: ./backend
    ports:
      - "4000:4000"           # exposed to 0.0.0.0
    environment:
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/kc
      - JWT_SECRET=kc-secret  # hardcoded weak secret
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    ports:
      - "5432:5432"           # exposed to 0.0.0.0 (!)
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=kc
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Intentional Misconfigurations

| Misconfiguration | CWE | OWASP | Impact |
|------------------|-----|-------|--------|
| All services bind 0.0.0.0 | CWE-668 | A02:2025 | Any internet host can reach frontend, backend, and database |
| PostgreSQL port exposed (5432) | CWE-668 | A02:2025 | Direct SQL access from internet with default credentials |
| Default DB credentials (postgres/postgres) | CWE-798 | A07:2025 | Trivial database takeover |
| Containers run as root | CWE-250 | A02:2025 | Container escape leads to host root access |
| No resource limits (CPU/memory) | CWE-770 | A02:2025 | DoS via resource exhaustion |
| No health checks | -- | -- | Silent failures, zombie containers |
| JWT secret in environment variable (plaintext) | CWE-798 | A02:2025 | Secret visible in `docker inspect`, process env |
| Upload volume host-mounted, world-readable | CWE-732 | A01:2025 | Any container or host process can read uploaded files |
| No TLS anywhere | CWE-319 | A04:2025 | Credentials, tokens, data all in plaintext on the wire |
| Default bridge network | CWE-668 | A02:2025 | All containers can communicate freely, no isolation |
| No logging configuration | CWE-778 | A09:2025 | No audit trail, silent compromise |
| Verbose error responses | CWE-209 | A02:2025 | Stack traces and SQL errors reach the client |

### Network View

```mermaid
flowchart LR
  subgraph external ["External Network"]
    Attacker["Attacker"]
    User["Legitimate User"]
  end

  subgraph vm ["Ubuntu VM"]
    subgraph bridge ["default bridge (172.17.0.0/16)"]
      FE["frontend :3000"]
      BE["backend :4000"]
      PG["postgres :5432"]
    end
  end

  User -->|":3000"| FE
  User -->|":4000"| BE
  Attacker -->|":4000 API abuse"| BE
  Attacker -->|":5432 direct SQL"| PG
  Attacker -->|":3000"| FE
  FE --> BE
  BE --> PG
```

All three services reachable from the internet. No firewall rules. The attacker has the same network access as a legitimate user.

---

## v2.0.0 -- Hardened with nginx

nginx reverse proxy terminates TLS and is the only externally-facing service. Backend and database are on a custom internal Docker network with no host port mappings. Containers run as non-root with read-only filesystems and resource limits.

### Topology

```mermaid
flowchart TD
  subgraph vm ["Ubuntu VM (public IP)"]
    subgraph compose ["docker-compose"]
      subgraph public_net ["public network"]
        Nginx["nginx\n0.0.0.0:443\nTLS termination\nrate limiting\nHSTS, CSP, X-Frame-Options\nnon-root"]
      end
      subgraph internal_net ["internal network (no external gateway)"]
        FE["frontend\nnon-root\nread-only FS\n127.0.0.1:3000\nCPU/mem limits"]
        BE["backend\nnon-root\nread-only FS\n127.0.0.1:4000\nCPU/mem limits\nenv from secrets"]
        PG["postgres\nno host port\nstrong credentials\nconnection pooling\nparameterised only"]
        UploadsVol["volume: uploads\nscoped mount\nvalidated paths\nsize quotas"]
        PGDataVol["volume: pgdata\nencrypted at rest"]
      end
    end
  end

  Internet["Internet"] -->|"HTTPS :443 only"| Nginx
  Nginx -->|"proxy_pass /"| FE
  Nginx -->|"proxy_pass /api"| BE
  BE -->|"internal only"| PG
  BE --- UploadsVol
  PG --- PGDataVol
```

### docker-compose sketch (v2.0.0)

```yaml
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    networks:
      - public
      - internal
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "https://localhost:443/health"]
      interval: 30s

  frontend:
    build: ./frontend
    user: "1001:1001"
    read_only: true
    networks:
      - internal
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s

  backend:
    build: ./backend
    user: "1001:1001"
    read_only: true
    networks:
      - internal
    secrets:
      - db_password
      - jwt_private_key
    environment:
      - DATABASE_URL=postgres://kc_app:FILE:/run/secrets/db_password@postgres:5432/kc
      - JWT_PRIVATE_KEY_FILE=/run/secrets/jwt_private_key
    volumes:
      - uploads:/app/uploads
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/ping"]
      interval: 30s

  postgres:
    image: postgres:16-alpine
    networks:
      - internal
    # no ports mapping -- internal only
    secrets:
      - db_password
    environment:
      - POSTGRES_USER=kc_app
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
      - POSTGRES_DB=kc
    volumes:
      - pgdata:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kc_app"]
      interval: 10s

networks:
  public:
    driver: bridge
  internal:
    driver: bridge
    internal: true  # no external gateway

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_private_key:
    file: ./secrets/jwt_private.pem

volumes:
  pgdata:
  uploads:
```

### nginx configuration highlights (v2.0.0)

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

server {
    listen 443 ssl;
    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
    }

    # Backend API with rate limiting on auth
    location /api {
        proxy_pass http://backend:4000;
    }

    location /api/auth {
        limit_req zone=auth burst=3 nodelay;
        proxy_pass http://backend:4000/auth;
    }
}
```

### Network View

```mermaid
flowchart LR
  subgraph external ["External Network"]
    Attacker["Attacker"]
    User["Legitimate User"]
  end

  subgraph vm ["Ubuntu VM"]
    subgraph public ["public network"]
      Nginx["nginx :443"]
    end
    subgraph internal ["internal network (no external gateway)"]
      FE["frontend :3000"]
      BE["backend :4000"]
      PG["postgres :5432"]
    end
  end

  User -->|"HTTPS :443"| Nginx
  Attacker -->|"HTTPS :443 (rate limited)"| Nginx
  Attacker -.-x|"blocked"| FE
  Attacker -.-x|"blocked"| BE
  Attacker -.-x|"blocked"| PG

  Nginx --> FE
  Nginx --> BE
  BE --> PG
```

The attacker can only reach nginx on port 443. Backend, database, and frontend are on an internal network with no external gateway. Direct access is impossible.

---

## Delta Table (v1.0.0 to v2.0.0)

| Area | v1.0.0 (insecure) | v2.0.0 (hardened) | CWE / OWASP |
|------|-------------------|-------------------|-------------|
| External access | Ports 3000, 4000, 5432 all exposed | Only port 443 (nginx) | CWE-668 / A02:2025 |
| Reverse proxy | None | nginx with TLS, rate limiting, security headers | CWE-16 / A02:2025 |
| TLS | None (HTTP plaintext) | TLS 1.3 at nginx, HSTS | CWE-319 / A04:2025 |
| DB access | Exposed on 5432, default credentials | Internal only, Docker secrets, strong password | CWE-798, CWE-668 / A05, A07 |
| Container user | root | Non-root (UID 1001) | CWE-250 / A02:2025 |
| Filesystem | Read-write | Read-only (except explicit volumes) | CWE-732 / A01:2025 |
| Resource limits | None | CPU + memory limits per service | CWE-770 / A02:2025 |
| Health checks | None | Liveness probes on all services | Operational resilience |
| Secrets management | Environment variables (plaintext) | Docker secrets (file-mounted) | CWE-798 / A02:2025 |
| Network | Default bridge (all can talk) | Custom internal + public networks, DB isolated | CWE-668 / A02:2025 |
| Logging | Verbose, sensitive data exposed | Structured, sensitive fields redacted | CWE-532 / A09:2025 |
| Upload volume | Host-mounted, world-readable | Named volume, scoped, size-limited | CWE-732 / A01:2025 |
