output "network_id" {
  value = google_compute_network.network.id
}
output "subnet_id" {
  value = google_compute_subnetwork.subnet.id
}
output "global_address" {
  value = google_compute_global_address.global_address.id
}
output "networking_connection" {
  value = google_service_networking_connection.networking_connection.id
}
output "nexus_ip" {
  value = google_compute_address.nexus_ip.address
}
output "ingress_ip" {
  value = google_compute_address.ingress_ip.address
}
