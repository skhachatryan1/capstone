resource "google_container_cluster" "cluster" {
  name     = "apex-gke-cluster"
  location = var.region

  deletion_protection      = false
  remove_default_node_pool = true
  initial_node_count       = 1
  network                  = var.network
  subnetwork               = var.subnet
  ip_allocation_policy {

  }
}
resource "google_container_node_pool" "app_nodes" {
  name               = "apex-app-node-pool"
  location           = var.region
  cluster            = google_container_cluster.cluster.name
  initial_node_count = 1
  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }
  node_config {
    preemptible  = true
    machine_type = "e2-standard-2"
    labels = {
      "workload" = "app"
    }
    tags = ["apex-firewall"]
  }
}
resource "google_container_node_pool" "nexus_nodes" {
  name     = "apex-nexus-node-pool"
  location = var.region
  cluster  = google_container_cluster.cluster.name
  autoscaling {
    min_node_count = 1
    max_node_count = 2
  }
  node_config {
    preemptible  = false
    machine_type = "e2-standard-4"
    labels = {
      workload = "nexus"
    }
    tags = ["apex-firewall"]

    taint {
      key    = "workload"
      value  = "nexus"
      effect = "NO_SCHEDULE"
    }
  }
}

resource "google_container_node_pool" "monitoring_nodes" {
  name     = "apex-monitoring-node-pool"
  location = var.region
  cluster  = google_container_cluster.cluster.name
  autoscaling {
    min_node_count = 1
    max_node_count = 2
  }
  node_config {
    preemptible  = false
    machine_type = "e2-medium"
    labels = {
      workload = "monitoring"
    }
    tags = ["apex-firewall"]

    taint {
      key    = "workload"
      value  = "monitoring"
      effect = "NO_SCHEDULE"
    }
  }
}
