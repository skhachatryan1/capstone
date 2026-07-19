resource "google_compute_network" "network" {
  name                    = "apex-network"
  project                 = var.project
  auto_create_subnetworks = false
}
resource "google_compute_subnetwork" "subnet" {
  name          = "apex-subnet"
  project       = var.project
  region        = var.region
  ip_cidr_range = var.ip_cidr_range
  network       = google_compute_network.network.id
}
resource "google_compute_global_address" "global_address" {
  name          = "apex-global-access"
  address_type  = "INTERNAL"
  purpose       = "VPC_PEERING"
  network       = google_compute_network.network.id
  prefix_length = 16
}
resource "google_service_networking_connection" "networking_connection" {
  network                 = google_compute_network.network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.global_address.name]

  lifecycle {
    prevent_destroy = false
  }

  deletion_policy = "ABANDON"
}

resource "google_compute_address" "nexus_ip" {
  name         = "nexus-loadbalancer-ip"
  region       = var.region
  address_type = "EXTERNAL"
}

resource "google_compute_router" "apex-router" {
  name    = "apex-router"
  region  = var.region
  network = google_compute_network.network.id
}
resource "google_compute_router_nat" "apex-nat" {
  name                               = "apex-nat"
  region                             = var.region
  router                             = google_compute_router.apex-router.name
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}
resource "google_compute_firewall" "apex-allow-kubectl" {
  name    = "apex-allow-kubectl"
  network = google_compute_network.network.id

  allow {
    protocol = "TCP"
    ports    = ["443", "10250", "8081", "8082"]
  }
  source_ranges = ["0.0.0.0/0"]
  source_tags   = ["apex-firewall"]
}

resource "google_compute_address" "ingress_ip" {
  name         = "ingress-ip"
  region       = var.region
  address_type = "EXTERNAL"
}
