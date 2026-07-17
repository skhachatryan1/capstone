resource "helm_release" "apex_app_ingress" {
  name       = "apex-app-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "apex-app"
  depends_on = [kubernetes_namespace.apex-app]
  set {
    name  = "controller.nodeSelector.workload"
    value = "app"
  }
  set {
    name  = "controller.service.loadBalancerIP"
    value = var.ingress_ip
  }
}

# resource "kubernetes_ingress_v1" "app_routing" {
#   metadata {
#     name      = "apex-app-routing"
#     namespace = "apex-app"
#     annotations = {
#       "kubernetes.io/ingress.class" = "nginx"
#     }
#   }

#   spec {
#     rule {
#       http {
#         path {
#           path      = "/"
#           path_type = "Prefix"

#           backend {
#             service {
#               # The name of the Kubernetes Service exposing the website pods
#               name = "apex-frontend-svc"
#               port {
#                 number = 80 # The port Service is listening on
#               }
#             }
#           }
#         }
#       }
#     }
#   }
# }
