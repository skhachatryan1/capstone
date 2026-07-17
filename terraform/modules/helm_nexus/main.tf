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

  timeout = 900

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

terraform {
  required_providers {
    nexus = {
      source = "datadrivers/nexus"
    }
  }
}
resource "nexus_repository_docker_hosted" "docker_registry" {
  name       = "apex-docker-registry"
  depends_on = [kubernetes_service.apex-nexus-lb]
  online     = true
  docker {
    force_basic_auth = false
    v1_enabled       = false
    http_port        = 8082
  }
  storage {
    blob_store_name                = "default"
    strict_content_type_validation = true
    write_policy                   = "ALLOW"
  }
}

resource "nexus_security_realms" "active_realms" {
  depends_on = [nexus_repository_docker_hosted.docker_registry]

  active = [
    "NexusAuthenticatingRealm",
    "NexusAuthorizingRealm",
    "DockerToken"
  ]
}
