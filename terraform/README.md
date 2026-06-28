# Terraform Infrastructure

Provisions the full GCP infrastructure for Apex: VPC network, GKE cluster, Cloud SQL database, and Nexus Repository Manager.

---

## Architecture overview

```
GCP Project: gd-gcp-internship-devops  /  Region: us-central1
│
├── VPC: apex-network
│   └── Subnet: apex-subnet (10.0.0.0/24)
│       │
│       ├── GKE Cluster: apex-gke-cluster
│       │   ├── Node pool: apex-app-node-pool    (backend + frontend)
│       │   └── Node pool: apex-nexus-node-pool  (Nexus only)
│       │
│       └── Cloud SQL: apex-db-instance (PostgreSQL 15, private IP only)
│
└── VPC Peering → servicenetworking.googleapis.com  (required for Cloud SQL private IP)
```

---

## File structure

```
terraform/
├── config.tf          # Terraform settings, provider configuration
├── main.tf            # Root module — wires all child modules together
├── variables.tf       # Input variables for the root module
├── terraform.tfvars   # Actual values: project, region, ip_cidr_range
└── modules/
    ├── network/       # VPC, subnet, Cloud SQL VPC peering
    ├── cluster/       # GKE cluster + node pools
    ├── sql/           # Cloud SQL instance, database, user
    └── helm/          # Nexus deployment via Helm
```

---

## config.tf

Declares required providers and configures them.

```hcl
terraform {
  required_providers {
    google     = { source = "hashicorp/google",     version = "6.8.0"   }
    random     = { source = "hashicorp/random",     version = "~> 3.6"  }
    helm       = { source = "hashicorp/helm",       version = "~> 2.17" }
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.35" }
  }
}
```

- **google** — manages all GCP resources (VPC, GKE, Cloud SQL)
- **random** — generates a secure database password at apply time
- **helm** — deploys Helm charts onto the GKE cluster
- **kubernetes** — manages raw Kubernetes resources (namespaces)

The `provider "kubernetes"` block reads the GKE cluster endpoint and CA certificate from the cluster module outputs, so Terraform can talk to Kubernetes after the cluster is created:

```hcl
provider "kubernetes" {
  host                   = "https://${module.cluster.cluster_endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.cluster.cluster_ca_certificate)
}
```

The `provider "helm"` block is empty — it auto-inherits the Kubernetes provider configuration above.

---

## main.tf

The root module calls each child module and passes outputs between them.

```hcl
module "network" { ... }   # no dependencies — runs first

module "sql" {
  depends_on            = [module.network]   # network must exist first
  networking_connection = module.network.networking_connection  # VPC peering ID
  network               = module.network.network_id
}

module "cluster" {
  network = module.network.network_id   # place cluster inside the VPC
  subnet  = module.network.subnet_id
}

module "helm" {
  depends_on = [module.cluster]   # cluster must exist before Helm can deploy
}
```

`network_id` and `subnet_id` flow from the network module into the cluster and SQL modules. The `networking_connection` output is passed to SQL so it knows the VPC peering is ready before creating the instance.

---

## modules/network

Creates the VPC and everything needed for Cloud SQL to get a private IP.

**Resources:**

`google_compute_network` — custom VPC (`apex-network`), no auto subnets.

`google_compute_subnetwork` — subnet inside the VPC (`10.0.0.0/24`). GKE nodes and the Cloud SQL instance will live here.

`google_compute_global_address` — reserves an internal IP range (`/16`) for VPC peering. Cloud SQL requires a dedicated IP block allocated inside the VPC before it can be assigned a private IP.

`google_service_networking_connection` — creates a VPC peering between the project's VPC and Google's managed services network (`servicenetworking.googleapis.com`). This is what allows Cloud SQL to be reachable on a private IP from inside the cluster.

**Outputs:** `network_id`, `subnet_id`, `networking_connection` — consumed by the cluster and SQL modules.

---

## modules/cluster

Creates the GKE cluster and two node pools.

**Resources:**

`google_container_cluster` — the GKE control plane.
- `remove_default_node_pool = true` — the default pool is deleted immediately; we manage our own pools
- `ip_allocation_policy {}` — enables VPC-native networking (required when the cluster is inside a custom VPC)
- `network` / `subnetwork` — places the cluster inside the VPC subnet created by the network module

`google_container_node_pool` **app_nodes** — runs backend and frontend pods.
- `e2-medium`, preemptible (cheaper, can be interrupted by GCP)
- Autoscales between 1 and 5 nodes based on workload
- Label `workload=app` — pod specs use this with `nodeSelector` to target this pool

`google_container_node_pool` **nexus_nodes** — runs Nexus only.
- `e2-standard-4`, not preemptible (Nexus needs stable storage, restart would lose data)
- Autoscales between 1 and 2 nodes
- Label `workload=nexus`
- Taint `workload=nexus:NoSchedule` — prevents any pod from landing here unless it explicitly tolerates this taint. Only the Nexus Helm chart is configured with the matching toleration.

**Outputs:** `cluster_endpoint`, `cluster_ca_certificate` — used by `config.tf` to configure the Kubernetes and Helm providers.

---

## modules/sql

Creates the Cloud SQL PostgreSQL instance and a user with a generated password.

**Resources:**

`random_password` — generates a 24-character alphanumeric password at apply time. Never hardcoded.

`google_sql_database_instance` — PostgreSQL 15 on `db-f1-micro` (smallest tier, sufficient for dev/staging).
- `ipv4_enabled = false` — no public IP, only accessible from within the VPC
- `private_network = var.network` — assigned an IP from the peered range created by the network module
- `depends_on = [var.networking_connection]` — waits for VPC peering to be fully established before creating the instance (Cloud SQL private IP requires the peering to exist)

`google_sql_database` — creates the `apex-db` database inside the instance.

`google_sql_user` — creates `apex-db-user` with the randomly generated password.

---

## modules/helm

Deploys Nexus Repository Manager onto the cluster using the official Sonatype Helm chart.

**Resources:**

`kubernetes_namespace` — creates the `nexus` namespace so Nexus is isolated from app workloads.

`helm_release` — installs `nexus-repository-manager` from the Sonatype Helm repository.
- `nodeSelector.workload=nexus` — schedules Nexus pods only onto the Nexus node pool
- `tolerations[0]` — tolerates the `workload=nexus:NoSchedule` taint so the pod is actually allowed to run there

---

## How to apply

```bash
cd terraform

# Authenticate with GCP
gcloud auth application-default login

# Download providers
terraform init

# Preview changes
terraform validate
terraform plan

# Step 1 — provision network, cluster, and database
terraform apply -target=module.network -target=module.cluster -target=module.sql

# Step 2 — deploy Nexus (cluster must exist first for Helm provider to work)
terraform apply
```

The two-step apply is necessary because the Helm and Kubernetes providers cannot initialize until the GKE cluster exists. Targeting only the infrastructure modules in step 1 avoids a chicken-and-egg error.
