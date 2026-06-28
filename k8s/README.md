# Kubernetes Setup

## Prerequisites

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [Helm](https://helm.sh/docs/intro/install/) installed
- GCP credentials set: `gcloud auth application-default login`

---

## 1. Provision the infrastructure

Run from the `terraform/` directory.

**Step 1 — create network, cluster, and database:**
```bash
terraform apply -target=module.network -target=module.cluster -target=module.sql
```

**Step 2 — deploy Nexus via Helm (requires cluster to exist first):**
```bash
terraform apply
```

---

## 2. Connect kubectl to the cluster

```bash
gcloud container clusters get-credentials apex-gke-cluster --region us-central1 --project gd-gcp-internship-devops
```

Verify the nodes are up:
```bash
kubectl get nodes
```

You should see nodes from both pools — `apex-app-node-pool` and `apex-nexus-node-pool`.

---

## 3. Set up Nexus as a Docker registry

### Access the Nexus UI

Port-forward to your local machine:
```bash
kubectl port-forward svc/nexus-nexus-repository-manager 8081:8081 -n nexus
```

Get the initial admin password:
```bash
kubectl exec -n nexus deploy/nexus-nexus-repository-manager -- cat /nexus-data/admin.password
```

Open `http://localhost:8081` and log in with `admin` + the password above. Complete the setup wizard.

### Create a Docker hosted repository

1. Go to **Settings → Repositories → Create repository**
2. Choose **docker (hosted)**
3. Set HTTP port to `8082`
4. Save

### Expose Nexus externally

```bash
kubectl apply -f k8s/nexus-service.yaml
```

Wait for GCP to assign an external IP:
```bash
kubectl get svc nexus-external -n nexus --watch
```

Note the `EXTERNAL-IP` — this is your registry address.

---

## 4. Push images to Nexus

```bash
docker login <EXTERNAL_IP>:8082

docker build -t <EXTERNAL_IP>:8082/apex-backend:latest ./backend
docker build -t <EXTERNAL_IP>:8082/apex-frontend:latest ./frontend

docker push <EXTERNAL_IP>:8082/apex-backend:latest
docker push <EXTERNAL_IP>:8082/apex-frontend:latest
```

---

## 5. Create an image pull secret

Kubernetes needs credentials to pull images from Nexus:
```bash
kubectl create secret docker-registry nexus-creds \
  --docker-server=<EXTERNAL_IP>:8082 \
  --docker-username=admin \
  --docker-password=<your-nexus-password>
```

---

## 6. Deploy the application with Helm

Set your Nexus IP and any other overrides in `k8s/values.yaml`, then install the chart:

```bash
helm install apex ./k8s
```

Check everything is running:
```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

To update after a code change (e.g. new image tag):
```bash
helm upgrade apex ./k8s
```

To uninstall:
```bash
helm uninstall apex
```

---

## Node pool layout

| Node pool | Label | Taint | Workloads |
|---|---|---|---|
| `apex-app-node-pool` | `workload=app` | — | backend, frontend |
| `apex-nexus-node-pool` | `workload=nexus` | `workload=nexus:NoSchedule` | Nexus only |

All app workloads use `nodeSelector: { workload: app }` in their pod spec to target the app node pool. Nexus scheduling is handled automatically by Terraform.
