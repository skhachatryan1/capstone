output "namespace" {
  value = kubernetes_namespace.nexus.metadata[0].name
}
