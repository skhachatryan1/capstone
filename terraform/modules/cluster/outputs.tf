output "cluster" {
  value = google_container_cluster.cluster.name
}
output "app_nodes" {
  value = google_container_node_pool.app_nodes.id
}
output "nexus_nodes" {
  value = google_container_node_pool.nexus_nodes.id
}
output "cluster_endpoint" {
  value = google_container_cluster.cluster.endpoint
}
output "cluster_ca_certificate" {
  value = google_container_cluster.cluster.master_auth[0].cluster_ca_certificate
}
