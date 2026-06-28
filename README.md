# Apex

Full-stack social platform — React frontend, Node.js/Express backend, PostgreSQL database.

---

## What exists

### Application

**Backend** (`backend/`) — Node.js + Express 5, Sequelize ORM, PostgreSQL
- REST API: auth (signup/signin/refresh), users, posts — full CRUD
- JWT access tokens (1h) + refresh tokens (14d) with rotation
- bcrypt passwords, brute-force lockout (3 attempts → 1 min lock)
- Rate limiting: 300 req/15 min global, 30 req/15 min on auth routes
- Prometheus metrics at `/metrics`, health check at `/health`
- Pino structured JSON logging
- Graceful shutdown on SIGTERM
- Umzug migrations (never `sync({ alter: true })`)
- Dockerfile: `node:26-alpine`, non-root user

**Frontend** (`frontend/`) — React 19, Vite, nginx
- Pages: feed, own posts, profile, user list, auth (sign in / sign up)
- Auto token refresh on 401, session restored from localStorage on reload
- Dockerfile: multi-stage build (node builder → nginx:alpine), serves static files on port 80

**Docker Compose** (`docker-compose.yaml`) — local dev: frontend + backend + postgres

---

### CI (`github/workflows/ci.yaml`)

GitHub Actions runs on every push:
1. **Backend job** — spins up `postgres:15` service, runs Vitest integration tests
2. **Frontend job** (runs after backend) — `npm run build` + `npm run test:ci`

---

### Terraform (`terraform/`)

Providers configured: `google 6.8.0`, `kubernetes ~2.35`, `helm ~2.17`

| Module | What it creates |
|---|---|
| `modules/network` | VPC, subnet, global IP for Cloud SQL VPC peering, `servicenetworking` connection |
| `modules/cluster` | GKE cluster (VPC-native), app node pool (e2-medium, preemptible, 1–5 nodes), Nexus node pool (e2-standard-4, non-preemptible, 1–2 nodes, taint `workload=nexus:NoSchedule`) |
| `modules/sql` | Cloud SQL PostgreSQL, private IP only, random-generated password |
| `modules/helm` | `nexus` namespace, Nexus Repository Manager via Helm (pinned to Nexus node pool via `nodeSelector` + toleration) |

`config.tf` wires the Kubernetes and Helm providers to the GKE cluster endpoint after it's created.

---

## What still needs to be done

### 1. Apply the Terraform

The infrastructure doesn't exist yet — nothing has been provisioned on GCP.

```bash
# Step 1 — create network, cluster, and DB
terraform apply -target=module.network -target=module.cluster -target=module.sql

# Step 2 — deploy Nexus (requires cluster to exist first)
terraform apply
```

Prerequisites: `gcloud auth application-default login`, a GCP project set in `terraform.tfvars`.

---

### 2. Container registry

Docker images need somewhere to live before Kubernetes can pull them. Options:
- **GCP Artifact Registry** (recommended — same project as GKE, no cross-cloud auth)
- Docker Hub

Add an Artifact Registry resource to Terraform (`modules/registry`) and push images there as part of CI.

---

### 3. Kubernetes manifests (`k8s/`)

Nothing in `k8s/` exists yet. Needed:

| Manifest | Notes |
|---|---|
| `backend/deployment.yaml` | Main container + **Cloud SQL Auth Proxy sidecar** (connects to Cloud SQL via private IP) + **init container** running `npm run migrate` |
| `backend/service.yaml` | ClusterIP, port 5001 |
| `frontend/deployment.yaml` | nginx container, port 80 |
| `frontend/service.yaml` | LoadBalancer or ClusterIP (behind Ingress) |
| `ingress.yaml` | Route `/api/*` → backend, `/*` → frontend |
| `secrets.yaml` | DB credentials, JWT secrets (or reference from GCP Secret Manager) |
| `configmap.yaml` | Non-sensitive env vars (ports, log level) |

---

### 4. CD pipeline

CI builds and tests but does not deploy. Need a deploy stage in `ci.yaml` (or a separate `cd.yaml`) that:
1. Builds Docker images
2. Pushes to Artifact Registry (tagged with commit SHA)
3. Updates image tags in K8s manifests
4. Runs `kubectl apply -f k8s/`

---

### 5. Observability (optional, post-MVP)

The backend already exposes `/metrics` and structured JSON logs. Wiring them up requires:
- Prometheus + Grafana deployed on the cluster (via Helm, on the app node pool)
- A scrape config pointing at `apex-backend:5001/metrics`
- A log aggregator (Loki or GCP Cloud Logging) collecting stdout from all pods
