output "namespace" {
  value = kubernetes_namespace.apex-app.metadata[0].name
}
