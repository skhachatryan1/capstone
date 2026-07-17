resource "kubernetes_namespace" "nexus" {
  metadata {
    name = var.namespace
  }
}
resource "helm_release" "nexus" {
  name       = "apex-nexus"
  repository = "https://sonatype.github.io/helm3-charts"
  chart      = "nexus-repository-manager"
  namespace  = kubernetes_namespace.nexus.metadata[0].name

  timeout = 90

  values = [yamlencode({

    nexus = {
      nodeSelector = {
        workload = "nexus"
      },
      persistence = {
        enabled      = true
        storageClass = "standard-rwo"
        size         = "10Gi"
      },
      env = [
        {
          name  = "NEXUS_SECURITY_RANDOMPASSWORD"
          value = "false"
        }
      ]
    },

    tolerations = [{
      key      = "workload"
      operator = "Equal"
      value    = "nexus"
      effect   = "NoSchedule"
    }],

    service = {
      type = "NodePort"
      ports = {
        docker = {
          enabled = true
          port    = 8082
        },
        nexus = {
          enabled = true
          port    = 8081
        }
      }
    },

    livenessProbe = {
      initialDelaySeconds = 180
      periodSeconds       = 30
      failureThreshold    = 6
    },

    readinessProbe = {
      initialDelaySeconds = 180
      periodSeconds       = 30
      failureThreshold    = 6
    },
  })]
}

resource "kubernetes_service" "apex-nexus-lb" {
  depends_on = [helm_release.nexus]
  metadata {
    name      = "apex-nexus-lb"
    namespace = kubernetes_namespace.nexus.metadata[0].name
  }
  spec {
    type             = "LoadBalancer"
    load_balancer_ip = var.nexus_ip
    selector = {
      "app.kubernetes.io/name"     = "nexus-repository-manager"
      "app.kubernetes.io/instance" = "apex-nexus"
    }
    port {
      name        = "docker"
      port        = 8082
      target_port = 8082
    }
    port {
      name        = "nexus"
      port        = 8081
      target_port = 8081
    }
  }
}
